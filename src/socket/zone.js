define(["microjs","model/zone","model/constants","model/dispatcher"], function(micro, Zone, Constants, EventDispatcher){


    var MAX_PLANETS = 20;
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
            player.on("update", onPlayerUpdate);
            //Send the new player to existing connections
            this._sendPlayer(player);

            var self = this;
            setTimeout(function(){
                if (self.timeouts[player.toString()]){
                    player.update().set("isInvulnerable", false);
                    self._sendPlayer(player, PARTIAL_PLAYER_SIZE);
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

            if (!player) return;

            player.update();

            var shieldBroken = player.changed.isShieldBroken;

            if (dataObj.isAccelerating && !player.canAccelerate()) dataObj.isAccelerating = false;
            if (dataObj.isShielded && !player.canShield()) dataObj.isShielded = false;

            //Update player data
            player.set(dataObj);

            if (shieldBroken){
                this._sendPlayer(player, PARTIAL_PLAYER_SIZE);
            }
            else if (player.hasChanged()){
                if (player.get("isAccelerating") || player.hasChanged("isAccelerating")){
                    this._sendPlayer(player, PARTIAL_PLAYER_SIZE);
                }else{
                    this._sendToAll("PlayerUpdate", dataObj);
                }
            }

            if (dataObj.isFiring && player.canFire()){
                var missile = this.model.missiles.add(player.fireMissile());
                this._sendMissile(missile);
            }
        },

        detectCollision : function(data){
            var sprite1 = this.model.get(data.sprite1);
            var sprite2 = this.model.get(data.sprite2);

            //Check if collision is valid
            if (sprite1 && sprite2 && sprite1.update().detectCollision(sprite2.update())){
                //Save off current sprite data values
                var sprite1Clone = sprite1.clone();

                //Collide the two sprites, if collision does not result in explosion set the associated data object to null
                if (!this.collide(sprite1, sprite2)){
                    data.sprite1 = null;
                }

                if (!this.collide(sprite2, sprite1Clone)){
                    data.sprite2 = null;
                }

                //If there is an explosion send the collision data objects to the clients
                if (data.sprite1 || data.sprite2){
                    this._sendToAll("Collision", data);
                }
            }
        },

        collide : function(sprite1, sprite2){
            //If collision results in explosion, remove sprite
            if (sprite1.collide(sprite2)){
                this._clearTimeout(sprite1);
                this.model.remove(sprite1);
                return true;
            }

            //Otherwise Fast forward sprite location to avoid multiple collisions and send the update data values to clients
            this._sendSprite(sprite1.update(100));
            return false;
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

        _sendSprite : function(sprite){
             if (sprite.type === "Player"){
                 this._sendPlayer(sprite, PARTIAL_PLAYER_SIZE);
             }
             else if (sprite.type === "Missile"){
                 this._sendMissile(sprite, PARTIAL_MISSILE_SIZE);
             }
        },

        _sendPlayer : function(player, byteLength){

            this._clearTimeout(player);

            var buffer = micro.toBinary(player.toJSON(), "Player", byteLength);
            var i = this.connections.length;
            while (i--){
                var connection = this.connections[i];
                connection.out.write(buffer);
                if (connection.playerId === player.id){
                    connection.out.write(micro.toBinary(player.toJSON(), "PlayerInfo"));
                }
            }

            var self = this;
            this._setTimeout(player,function(){
                if (!self.checkZoneChange(player)){
                    self._sendPlayer(player, PARTIAL_PLAYER_SIZE);
                }
            });
        },

        _sendMissile : function(missile, byteLength){

            this._clearTimeout(missile);
            this._sendToAll("Missile", missile.toJSON(), byteLength);

            var self = this;
            this._setTimeout(missile,function(){

                if (!missile.update().outOfBounds()){
                    self._sendMissile(missile, PARTIAL_MISSILE_SIZE);
                }else{
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

    function onPlayerUpdate(){
        if (this.get("isAccelerating") && !this.canAccelerate()){
            this.set("isAccelerating", false);
        }

        if (this.get("shields") == 0 && !this.get("isShieldBroken")){
            var self = this;
            self.set({isShielded:false, isShieldBroken:true});
            setTimeout(function(){
                self.set("isShieldBroken", false);
            }, self.shieldDownTime);
        }
    }


    return ServerZone;

});