define(["microjs","model/zone","model/constants","model/dispatcher"], function(micro, Zone, Constants, EventDispatcher){
    'use strict';

    var MAX_PLANETS = 5;
    var PARTIAL_PLAYER_SIZE = 12;
    var PARTIAL_MISSILE_SIZE = 5;

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

        /**
         * Add a new sprite to zone
         * @param {object} sprite The sprite model to add
         */
        addSprite : function(sprite){
            if (sprite.type === "Player"){
                this.addPlayer(sprite);
            }else if (sprite.type === "Missile"){
                this.addMissile(sprite);
            }
        },

        /**
         * Add a new player to zone
         * @param {object} player The player model to add
         * @param {boolean} [place=false] Boolean flag indicating whether the zone should manually place this player
         */
        addPlayer : function(player, place){

            player.zone = this;

            if (place){
                var data = {};
                data.zone = this.id;
                data.angle = (Math.random() * (Math.PI * 2)) - Math.PI;
                do{
                    data.posX = (Math.random()*this.model.width*0.8)+(this.model.width*0.1);
                    data.posY = (Math.random()*this.model.height*0.8)+(this.model.height*0.1);
                }
                while (!this._isValidPlayerPlacement(data));
                player.set(data);
            }else{
                player.update({silent:true}).set("zone", this.id);
            }

            //Send the new player to existing connections
            this.sendPlayer(player,true);

            //Add the player to the collection
            this.model.players.add(player);

            //Send all necessary zone data to the player
            this.sendZoneData(player);

            if (!place){
                this.detectCollision(player); //Detect collisions between the newly added player and every other sprite in zone
            }


            return player;
        },

        /**
         * Add a new missile to the zone
         * @param {object} missile Missile model to add
         */
        addMissile : function(missile){
            missile.set("zone", this.id);
            missile.zone = this;
            this.model.missiles.add(missile);

            this.sendMissile(missile,true);

            return missile;
        },

        /**
         * Removes a sprite or missile from the zone
         * @param {object} sprite Either a player or missile model
         * @param {boolean} [send=false] Flag that indicates whether send this remove to clients
         */
        removeSprite : function(sprite, send){
            if (sprite = this.model.remove(sprite)){
                clearTimeout(sprite.timeout);
                if (send){
                    this.sendToAll("RemoveSprite",  {type:sprite.type,id:sprite.id});
                }
                sprite.zone = undefined;
                return sprite;
            }
            return null;
        },

        explodeSprite : function(sprite){
             if (this.removeSprite(sprite)){
                 sprite.trigger(Constants.Events.COLLISION);
                 var data =  {sprite1:{type:sprite.type,id:sprite.id}};
                 this.sendToAll("Collision",data, 2);
             }
        },

        detectCollision : function(sprite1, sprite2){

            if (!sprite1) return false;

            //If second sprite is not specified then check for a collision with every other applicable sprite
            if (!sprite2){
                var i = this.model.players.length;
                while (i--){
                    if (this.detectCollision(sprite1, this.model.players.at(i))) return true;
                }
                i = this.model.missiles.length;
                while (i--){
                    if (this.detectCollision(sprite1, this.model.missiles.at(i))) return true;
                }
                return false;
            }

            //Validate these sprites are in the zone
            sprite1 = this.model.get(sprite1);
            sprite2 = this.model.get(sprite2);

            //Check if collision is valid
            if (sprite1 && sprite2 && sprite1.update({silent:true}).detectCollision(sprite2.update({silent:true}))){

                //Save off current sprite data values
                var sprite1Clone = sprite1.clone();

                //Collide the two sprites
                var data = {sprite1:{type:sprite1.type, id:sprite1.id}, sprite2:{type:sprite2.type, id:sprite2.id}};
                data.sprite1.survived = !sprite1.collide(sprite2, {silent:true});
                data.sprite2.survived = !sprite2.collide(sprite1Clone, {silent:true});

                //send the collision data objects to the clients
                this.sendToAll("Collision", data, 6);

                //Send updates or remove sprites as necessary
                if (data.sprite1.survived){
                    sprite1.update(100); //Fast forward the sprite position as to not to have duplicate collisions
                    this.sendSprite(sprite1);
                }else{
                    sprite1.trigger(Constants.Events.COLLISION, sprite2);
                    this.removeSprite(sprite1);
                }

                if (data.sprite2.survived){
                    sprite2.update(100);   //Fast forward the sprite position as to not to have duplicate collisions
                    this.sendSprite(sprite2);
                }else{
                    sprite2.trigger(Constants.Events.COLLISION, sprite1);
                    this.removeSprite(sprite2);
                }

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

            this.removeSprite(sprite);  //Remove sprite from this zone

            //Send sprite removal to clients of all adjacent zones that aren't shared with the new zone
            var i = this.adjacentZones.length;
            var buffer = micro.toBinary({type:sprite.type, id:sprite.id}, "RemoveSprite");
            while(i--){
                var adjacentZone = this.adjacentZones[i];
                if (adjacentZone !== newZone && newZone.adjacentZones.indexOf(adjacentZone) === -1){
                    adjacentZone.sendToZone(buffer);
                }
            }

            newZone.addSprite(sprite);  //Add sprite to new zone

            return true;
        },

        getNumPlayers : function(){
            return this.model.players.length;
        },

        sendToAll : function(type, json, byteLength){
            //Send to all connections attached this zone
            var buffer = micro.toBinary(json, type, byteLength);
            this.sendToZone(buffer);

            //Send to all connections attached to adjacent zones
            var i = this.adjacentZones.length;
            while (i--){
                this.adjacentZones[i].sendToZone(buffer);
            }
        },

        sendToZone : function(buffer){
            var players = this.model.players.models;
            var connection;
            var i = players.length;
            while (i--){
                if (connection = players[i].connection){
                    connection.out.write(buffer);
                }
            }
        },

        sendSprite : function(sprite, sendAll){
             if (sprite.type === "Player"){
                 this.sendPlayer(sprite, sendAll);
             }
             else if (sprite.type === "Missile"){
                 this.sendMissile(sprite, sendAll);
             }
        },

        sendPlayer : function(player, sendAll){
            if (this.checkZoneChange(player)) return;

            clearTimeout(player.timeout);

            var byteLength = sendAll ? undefined : PARTIAL_PLAYER_SIZE;
            this.sendToAll("Player", player.toJSON(), byteLength);

            var self = this;
            player.timeout = setTimeout(function(){
                self.sendPlayer(player, PARTIAL_PLAYER_SIZE);
            }, Constants.SERVER_UPDATE_INTERVAL);
        },

        sendPlayerUpdate : function(player){
            //if (this.checkZoneChange(player)) return;
            this.sendToAll("PlayerUpdate", player.toJSON());
        },

        sendMissile : function(missile, sendAll){
            if (this.checkZoneChange(missile)) return;

            clearTimeout(missile.timeout);
            var byteLength = sendAll ? undefined : PARTIAL_MISSILE_SIZE;
            this.sendToAll("Missile", missile.toJSON(), byteLength);

            var self = this;
            missile.timeout = setTimeout(function(){
                if (missile.update().hasExceededMaxDistance()){
                    self.explodeSprite(missile);
                }else{
                    self.sendMissile(missile);
                }
            }, Constants.SERVER_UPDATE_INTERVAL);
        },

        sendZoneData : function(player){
            if(!player.connection) return;

            var gameData = this.model.update({silent:true}).toJSON();
            var i = this.adjacentZones.length;
            while (i--){
                this.adjacentZones[i].model.update({silent:true}).concat(gameData);
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
        }
    });


    return ServerZone;

});