define(["microjs","model/zone","model/constants","model/dispatcher"], function(micro, Zone, Constants, EventDispatcher){


    var MAX_PLANETS = 20;
    /**
     * @constructor
     * A Server Zone Class used to manage all player connections within a given zone
     * For this example there is only instance used
     */
    var ServerZone = function (id){

        this.id = id;
        //The attached model instance
        this.model = new Zone({id:id});
        // Used to keep track of all of this instance's connected users
        this.connections = [];
        //Track sprite update timeouts
        this.timeouts = {};

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

    extend.call(ServerZone.prototype, EventDispatcher.prototype, {

        /**
         * Add a new connection to the Zone and create a new corresponding player
         * @param {*} conn
         * @param {*} data
         */
        add : function(conn, data){

            var model = this.model;
            delete data.id;

            if (!data.hasOwnProperty("angle")){
                data.angle = (Math.random() * (Math.PI * 2)) - Math.PI;
            }

            if (!data.hasOwnProperty("posX") || !data.hasOwnProperty("posY")){
                do{
                    data.posX = (Math.random()*model.width*0.8)+(model.width*0.1);
                    data.posY = (Math.random()*model.height*0.8)+(model.height*0.1);
                }
                while (!this._isValidPlayerPlacement(data));
            }
            data.isInvulnerable = true;

            var player = model.players.add(data);
            //Send the new player to existing connections
            this._sendPlayer(player);

            var self = this;
            setTimeout(function(){
                if (self.timeouts[player.toString()]){
                    player.set("isInvulnerable", false);
                    self._sendPlayer(player.update());
                }
            }, player.invulnerableTime);

            //Add connection to array
            conn.playerId = player.id;
            this.connections.push(conn);

            //Send all the necessary game data to the new user, to get them started
            var buffer = micro.toBinary({
                playerId:player.id,
                currentZone:this.model.toJSON()
            },"GameData");
            conn.out.write(buffer);
        },

        /**
         * Removes the given connection and its corresponding player from the Zone
         * @param {*} conn
         */
        remove : function(conn){
            var index = this.connections.indexOf(conn);

            if (index >= 0){
                this.connections.splice(index, 1);
                var player = this.model.players.remove(conn.playerId);

                if (player){
                    this._clearTimeout(player);
                    this._sendToAll("RemoveSprite", {type : "Player", id : player.id});
                }
            }
        },

        /**
         * Updates a player using the given json data
         * @param {*} dataObj 'PlayerUpdate' JSON data
         */
        updatePlayer : function(dataObj){

            var player = this.model.players.get(dataObj.id);

            if (player){

                //Update player data
                player.update().set(dataObj);

                if (player.hasChanged()){

                    //If accelerating then send our complete player data (and reset interval timer)
                    if (player.get("isAccelerating") || player.hasChanged("isAccelerating")){
                        this._sendPlayer(player, 14);
                    }else{
                        this._sendToAll("PlayerUpdate", dataObj); //Otherwise we can send just a simple player update
                    }
                }

                if (dataObj.isFiring && player.canFire()){
                    var missile = this.model.missiles.add(player.fireMissile());
                    this._sendMissile(missile);
                }
            }
        },

        detectCollision : function(data){
            var sprite1 = this.model.get(data.sprite1);
            var sprite2 = this.model.get(data.sprite2);

            if (sprite1 && sprite2 && sprite1.update().detectCollision(sprite2.update())){
                this._clearTimeout(sprite1);
                this.model.remove(sprite1);

                this._clearTimeout(sprite2);
                this.model.remove(sprite2);

                this._sendToAll("Collision", data);
            }
        },

        getNumPlayers : function(){
            return this.model.players.length;
        },

        getPlayer : function(playerId){
            return this.model.players.get(playerId);
        },

        checkZoneChange : function(player){
            var direction = player.update().outOfBounds();
            if (direction){
               this.trigger(Constants.Events.ZONE_CHANGED, player, direction);
               return true;
            }
            return false;
        },

        _sendToAll : function(type, json, byteLength){
            var buffer = micro.toBinary(json, type, byteLength);

            var i = this.connections.length;
            while (i--){
                this.connections[i].out.write(buffer);
            }
        },

        _sendPlayer : function(player, byteLength){

            this._sendToAll("Player", player.toJSON(), byteLength);

            var self = this;
            this._setTimeout(player,function(){
                if (!self.checkZoneChange(player)){
                    self._sendPlayer(player, 14);
                }
            });
        },

        _sendMissile : function(missile, byteLength){

            this._sendToAll("Missile", missile.toJSON(), byteLength);

            var self = this;
            this._setTimeout(missile,function(){
                missile.update();

                if (!missile.outOfBounds()){
                    self._sendMissile(missile, 5);
                }else{
                    self._clearTimeout(missile);
                    self.model.missiles.remove(missile);
                }
            });
        },

        _setTimeout : function(sprite, callback){
            var key = sprite.toString();
            clearTimeout(this.timeouts[key]);
            this.timeouts[key] = setTimeout(callback,Constants.SERVER_UPDATE_INTERVAL);
        },

        _clearTimeout : function(sprite){
            var key =  sprite.toString();
            clearTimeout(this.timeouts[key]);
            delete this.timeouts[key];
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