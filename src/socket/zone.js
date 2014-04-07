define(["microjs","model/zone","model/constants","model/dispatcher"], function(micro, Zone, Constants, EventDispatcher){
    'use strict';

    var MAX_PLANETS = 3;
    var PARTIAL_PLAYER_SIZE = 12;
    var PARTIAL_MISSILE_SIZE = 6;

    /**
     * @constructor
     * A Server Zone Class used to manage all player connections within a given zone
     * For this example there is only instance used
     */
    var ServerZone = function (id){

        this.id = id;

        //The attached model instance
        this.model = new Zone({id:id});

        //Set by parent
        this.adjacentZones = [];

        var numKeys = Constants.PLANET_KEYS.length;

        var planetWidth = Constants.Planet.width;
        var planetHeight = Constants.Planet.height;
        var minScale = Constants.Planet.minScale;

        var i = MAX_PLANETS;
        while (i--){
            var data = {
                key : Constants.PLANET_KEYS[Math.floor(Math.random()*numKeys)],
                posX : (Math.random()*(this.model.width-planetWidth))+(planetWidth/2),
                posY : (Math.random()*(this.model.height-planetHeight))+(planetHeight/2),
                scale : (Math.random()*(1-minScale)) + minScale,
                zone : this.id
            };

            if (this._isValidPlanetPlacement(data)){
                this.model.planets.add(data);
            }
        }

    };

    extend.call(ServerZone.prototype, {

        addSprite : function(sprite, place){
            if (sprite.type === "Player"){
                this.addPlayer(sprite, place);
            }else if (sprite.type === "Missile"){
                this.addMissile(sprite);
            }
        },

        /**
         * Add a new player zone
         * @param {object} player The player model to add
         * @param {boolean} place Boolean flag indicating whether the zone should manually place this player
         */
        addPlayer : function(player, place){

            var model = this.model;

            if (place){
                var data = {};
                data.zone = this.id;
                data.angle = (Math.random() * (Math.PI * 2)) - Math.PI;
                do{
                    data.posX = (Math.random()*model.width*0.8)+(model.width*0.1);
                    data.posY = (Math.random()*model.height*0.8)+(model.height*0.1);
                }
                while (!this._isValidPlayerPlacement(data));
            }else{
                player.set("zone", this.id);
            }

            player.set(data);

            //Send the new player to existing connections
            this._sendPlayer(player);

            //Add the player to the collection
            model.players.add(player);

            //Send all necessary zone data to the player
            this._sendZoneData(player);
            this._sendPlayerInfo(player);

            return player;
        },

        /**
         * Add a new missile to the zone
         * @param {object} missile Missile model to add
         */
        addMissile : function(missile){
            missile.set("zone", this.id);
            this.model.missiles.add(missile);

            this._sendMissile(missile);

            return missile;
        },

        /**
         * Removes a sprite or missile from the zone
         * @param {object} sprite Either a player or missile model
         * @param {boolean} send Flag that indicates whether send this remove to clients
         */
        removeSprite : function(sprite, send){
            if (sprite.type === "Player"){
                return this.removePlayer(sprite, send);
            }else if (sprite.type === "Missile"){
                return this.removeMissile(sprite, send);
            }

            return null;
        },

        /**
         * Removes the given player from the zone
         * @param {(object|number)} player Player model or id to remove
         * @param {boolean} [send] Flag that indicates whether send this remove to clients
         */
        removePlayer : function(player, send){
            if (player = this.model.players.remove(player)){
                clearTimeout(player.timeout);
                if (send){
                    this._sendToAll("RemoveSprite", player);
                }
                return player;
            }
            return null;
        },

        /**
         * Removes the given player from the zone
         * @param {(object|number)} missile Missile model or id to remove
         * @param {boolean} [send=false] Flag that indicates whether send this remove to clients
         */
        removeMissile : function(missile, send){
            if (missile = this.model.missiles.remove(missile)){
                clearTimeout(missile.timeout);
                if (send){
                    this._sendToAll("RemoveSprite", missile);
                }

                return missile;
            }
            return null;
        },


        /**
         * Updates a player using the given json data
         * @param {(*|number)} player Either the player model or model id to update
         * @param {*} dataObj 'PlayerUpdate' JSON data
         */
        updatePlayer : function(player, dataObj){

            player = this.model.players.get(player);

            if (!player){
                throw new Error("Cannot update player, as it does not belong to zone");
            }

            if (dataObj.isAccelerating && !player.canAccelerate()) dataObj.isAccelerating = false;
            if (dataObj.isShielded && !player.canShield()) dataObj.isShielded = false;

            //Update player data and set new data object
            var hasChanged = player.update().hasChanged();
            hasChanged = player.set(dataObj).hasChanged || hasChanged;

            //If player is accelerating then send the whole player model to clients, otherwise we can get away with just sending a 4 byte player update
            if ((player.get("isAccelerating") && player.hasChanged("angle")) || player.hasChanged("isAccelerating")){
                this._sendPlayer(player, PARTIAL_PLAYER_SIZE);
                this._sendPlayerInfo(player);
            }else if (hasChanged){
                this._sendToAll("PlayerUpdate", player.toJSON());
            }

            return player;
        },

        explodeSprite : function(sprite){
             if (this.remove(sprite, false)){
                 this._sendToAll("Collision", {sprite1:sprite}, 2);
             }
        },


        detectCollision : function(data){
            var sprite1 = this.model.get(data.sprite1);
            var sprite2 = this.model.get(data.sprite2);

            //Check if collision is valid
            if (sprite1 && sprite2 && sprite1.update().detectCollision(sprite2.update())){
                //Save off current sprite data values
                var sprite1Clone = sprite1.clone();

                //Collide the two sprites
                data.sprite1.explode = this._collide(sprite1, sprite2);
                data.sprite2.explode = this._collide(sprite2, sprite1Clone);

                //send the collision data objects to the clients
                this._sendToAll("Collision", data, 7);

                return true;
            }

            return false;
        },

        checkZoneChange : function(sprite){

            var direction, newZone;

            //If sprite not in this zone or not out of zone bounds return false
            if (!(sprite = this.model.get(sprite)) || !(direction = sprite.update().outOfBounds())){
                return false;
            }

            //Depending on the direction of zone change, adjust sprite position and get new zone
            switch(direction){
                case "top" :
                    newZone = this.adjacentZones[1];
                    break;

                case "left" :
                    newZone = this.adjacentZones[3];
                    break;

                case "right" :
                    newZone = this.adjacentZones[4];
                    break;

                case "bottom" :
                    newZone = this.adjacentZones[6];
                    break;
            }

            this.removeSprite(sprite, false);  //Remove sprite from this zone

            //Send sprite removal to clients of all adjacent zones that aren't shared with the new zone
            var i = this.adjacentZones.length;
            var buffer = micro.toBinary(sprite, "RemoveSprite");
            while(i--){
                var adjacentZone = this.adjacentZones[i];
                if (adjacentZone !== newZone && newZone.adjacentZones.indexOf(adjacentZone) === -1){
                    adjacentZone.sendToAll(buffer);
                }
            }

            newZone.addSprite(sprite, false);  //Add sprite to new zone

            return true;
        },

        getNumPlayers : function(){
            return this.model.players.length;
        },

        sendToAll : function(buffer){
            var players = this.model.players.models;
            var i = players.length;
            var connection;
            while (i--){
                if (connection = players[i].connection){
                    connection.out.write(buffer);
                }
            }
        },

        _sendToAll : function(type, json, byteLength){

            //Send to all connections attached this zone
            var buffer = micro.toBinary(json, type, byteLength);
            this.sendToAll(buffer);

            //Send to all connections attached to adjacent zones
            var i = this.adjacentZones.length;
            while (i--){
                this.adjacentZones[i].sendToAll(buffer);
            }
        },

        _sendSprite : function(sprite){
             if (sprite.type === "Player"){
                 this._sendPlayer(sprite, PARTIAL_PLAYER_SIZE);
             }
             else if (sprite.type === "Missile"){
                 this._sendMissile(sprite, PARTIAL_MISSILE_SIZE);
             }
        },

        _sendPlayer : function(player, byteLength){
            if (this.checkZoneChange(player)) return;

            clearTimeout(player.timeout);

            this._sendToAll("Player", player.toJSON(), byteLength);


            var self = this;
            player.timeout = setTimeout(function(){
                self._sendPlayer(player, PARTIAL_PLAYER_SIZE);
                self._sendPlayerInfo(player);
            }, Constants.SERVER_UPDATE_INTERVAL);
        },

        _sendMissile : function(missile, byteLength){
            if (this.checkZoneChange(missile)) return;

            clearTimeout(missile.timeout);
            this._sendToAll("Missile", missile.toJSON(), byteLength);

            var self = this;
            missile.timeout = setTimeout(function(){
                if (missile.update().hasExceededMaxDistance()){
                    self.explodeSprite(missile);
                }else{
                    self._sendMissile(missile, PARTIAL_MISSILE_SIZE);
                }
            }, Constants.SERVER_UPDATE_INTERVAL);
        },

        _sendPlayerInfo : function(player){
            if(!player.connection) return;

            var buffer = micro.toBinary(player.toJSON(), "PlayerInfo");
            player.connection.out.write(buffer);
        },


        _sendZoneData : function(player){
            if(!player.connection) return;

            var gameData = this.model.toJSON();
            var i = this.adjacentZones.length;
            while (i--){
                this.adjacentZones[i].model.concat(gameData);
            }
            gameData.playerId = player.id;

            var buffer = micro.toBinary(gameData,"GameData");
            player.connection.out.write(buffer);
        },

        _isValidPlanetPlacement : function(data){
            var models = this.model.planets.models;

            var horizontalRadius = Constants.Planet.width*0.5;
            var verticalRadius = Constants.Planet.height*0.5;

            var i = models.length;
            while (i--){

                var planetData = models[i].data;

                var horizontalPadding = horizontalRadius*(data.scale+planetData.scale);
                var verticalPadding =  verticalRadius*(data.scale+planetData.scale);

                if (Math.abs(planetData.posX - data.posX) < horizontalPadding && Math.abs(planetData.posY-data.posY) < verticalPadding){
                    return false;
                }
            }

            return true;
        },

        _isValidPlayerPlacement : function(data){

            var models = this.model.players.models;

            var horizontalPadding = Constants.Player.width*4;
            var verticalPadding = Constants.Player.height*4;

            var i = models.length;
            while (i--){
                var playerData = models[i].data;
                if (Math.abs(playerData.posX - data.posX) < horizontalPadding && Math.abs(playerData.posY-data.posY) < verticalPadding){
                    return false;
                }
            }

            return true;
        },

        _collide : function(sprite1, sprite2){
            //If collision results in explosion, remove sprite
            if (sprite1.collide(sprite2)){
                this.remove(sprite1, false);
                return true;
            }

            //Otherwise Fast forward sprite location to avoid multiple collisions and send the update data values to clients
            this._sendSprite(sprite1.update(100));

            return false;
        }

    });


    return ServerZone;

});