define(["microjs","model/zone","model/constants","model/dispatcher"], function(micro, Zone, Constants, EventDispatcher){
    'use strict';

    var MAX_PLANETS = 20;
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
                scale : (Math.random()*(1-minScale)) + minScale
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
         */
        addPlayer : function(player, place){

            var model = this.model;

            var data = {
                zone : this.id
            };

            if (place){
                data.angle = (Math.random() * (Math.PI * 2)) - Math.PI;
                do{
                    data.posX = (Math.random()*model.width*0.8)+(model.width*0.1);
                    data.posY = (Math.random()*model.height*0.8)+(model.height*0.1);
                }
                while (!this._isValidPlayerPlacement(data));
            }

            player.set(data);

            //Send the new player to existing connections
            this._sendPlayer(player);

            model.players.add(player);

            //Send all the necessary game data to the new user, to get them started
            var gameData = model.toJSON();
            var i = this.adjacentZones.length;
            while (i--){
                this.adjacentZones[i].concat(gameData);
            }
            gameData.playerId = player.id;

            var buffer = micro.toBinary(gameData,"GameData");
            player.connection.out.write(buffer);

        },

        addMissile : function(missile){
            missile.set("zone", this.id);
            this.model.missiles.add(missile);

            this._sendMissile(missile);
        },

        removeSprite : function(sprite, send){
            if (sprite.type === "Player"){
                this.removePlayer(sprite, send);
            }else if (sprite.type === "Missile"){
                this.removeMissile(sprite, send);
            }
        },

        /**
         * Removes the given player from the zone
         * @param {*} player Player Model
         * @param {boolean} send Flag that indicates whether send this remove to clients
         */
        removePlayer : function(player, send){
            if (this.model.players.remove(player.id)){
                clearTimeout(player.timeout);
                if (send){
                    var self = this;
                    var data = {type : player.type, id: player.id};
                    setTimeout(function(){
                        self._sendToAll("RemoveSprite", data);
                    }, 2000);
                }
            }
        },

        removeMissile : function(missile, send){
            if (this.model.players.remove(missile.id)){
                clearTimeout(missile.timeout);
                if (send){
                    this._sendToAll("RemoveSprite", missile);
                }
            }
        },

        /**
         * Updates a player using the given json data
         * @param {*} playerId Player Model Id
         * @param {*} dataObj 'PlayerUpdate' JSON data
         */
        updatePlayer : function(playerId, dataObj){

            var player = this.players.get(playerId);

            if (!player){
                throw new Error("Cannot update player, as it does not belong to zone");
            }

            if (dataObj.isAccelerating && !player.canAccelerate()) dataObj.isAccelerating = false;
            if (dataObj.isShielded && !player.canShield()) dataObj.isShielded = false;

            //Update player data
            player.update().set(dataObj);

            if ((player.get("isAccelerating") && player.hasChanged("angle")) || player.hasChanged("isAccelerating")){
                this._sendPlayer(player, PARTIAL_PLAYER_SIZE);
            }else{
                this._sendToAll("PlayerUpdate", player.toJSON());
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
            }
        },

        checkZoneChange : function(sprite){

            var direction, newZone;

            //If sprite not in this zone or zone out of bounds return false
            if (!(sprite = this.get(sprite)) || !(direction = sprite.update().outOfBounds())){
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

        sendToAll : function(buffer){
            var players = this.model.players;
            var i = players.length;
            while (i--){
                players[i].connection.out.write(buffer);
            }
        },

        getNumPlayers : function(){
            return this.model.players.length;
        },

        _sendToAll : function(type, json, byteLength){

            var buffer = micro.toBinary(json, type, byteLength);
            this.sendToAll(buffer);

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
            this._sendPlayerInfo(player);

            var self = this;
            setTimeout(function(){
                self._sendPlayer(player, PARTIAL_PLAYER_SIZE);
            }, Constants.SERVER_UPDATE_INTERVAL);
        },

        _sendPlayerInfo : function(player){
            var buffer = micro.toBinary(player.toJSON(), "PlayerInfo");
            player.connection.out.write(buffer);
        },

        _sendMissile : function(missile, byteLength){
            if (this.checkZoneChange(missile)) return;

            clearTimeout(missile.timeout);
            this._sendToAll("Missile", missile.toJSON(), byteLength);

            var self = this;
            setTimeout(function(){
                self._sendMissile(missile, PARTIAL_MISSILE_SIZE);
            }, Constants.SERVER_UPDATE_INTERVAL);
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

                if (planetData.key === data.key || Math.abs(planetData.posX - data.posX) < horizontalPadding && Math.abs(planetData.posY-data.posY) < verticalPadding){
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