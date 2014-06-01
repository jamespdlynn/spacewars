define(['binaryjs', 'microjs', 'model/schemas', 'model/zone', 'model/player', 'model/missile', 'model/constants'],
    function (binary, micro, schemas, Zone, Player, Missile, Constants){
        'use strict';


        //Register Schemas
        micro.register(schemas);

        var Client = function(gameData){
            this.gameData = gameData;
            this.wsClient= null;
            this.collisionInterval = null;
            this.initialized = false;
            this.isRunning = false;
        };

        extend.call(Client.prototype, {
            
            run : function(){
                if (this.isRunning) return;

                var self = this;
                var gameData = this.gameData;
                var url = "ws://localhost:"+Constants.WS_PORT;
                var wsClient;

                if (binary){
                    wsClient = new binary.BinaryClient(url, {chunkSize:256});
                }else{
                    wsClient = new BinaryClient(url, {chunkSize:256});
                }
                
                wsClient.on('stream', function(stream){
                    wsClient.in = stream;
                    wsClient.in.writeable = false;

                    wsClient.in.on('data', function(data){
                        var dataObj = micro.toJSON(new Buffer(data));
                        var type = dataObj._type;
                        var player;

                        delete dataObj._type;

                        switch (type){
                            case "Ping":
                                if (dataObj.complete){
                                    var latency = 0;
                                    var len = dataObj.timestamps.length-1;

                                    var i = len;
                                    while (i--){
                                        latency += (dataObj.timestamps[i+1]-dataObj.timestamps[i]) / len / 2;
                                    }

                                    gameData.setLatency(latency);
                                }else{
                                    wsClient.out.write(data);
                                }
                                break;

                            case "GameData" :
                                extend.call(dataObj, gameData.clone().set(dataObj,{remove:true}).update(gameData.latency).toJSON());
                                gameData.update().set(dataObj,{easing:true, remove:true});
                                if (!self.initialized && gameData.userPlayer){
                                    self.initialize();
                                }
                                break;

                            case "Player":
                                if (!self.initialized) return;

                                player = gameData.players.get(dataObj.id);

                                if (player){
                                    dataObj = player.update().clone().set(dataObj).update(gameData.latency).toJSON();
                                    player.set(dataObj,{easing:true});
                                }else{
                                    gameData.players.add(dataObj).update(gameData.latency);
                                }

                                break;

                            case "PlayerInfo":
                                if (!self.initialized) return;
                                dataObj = gameData.userPlayer.update().clone().set(dataObj).update(gameData.latency).toJSON();
                                gameData.userPlayer.set({fuel:dataObj.fuel, shields: dataObj.shields, ammo:dataObj.ammo, kills: dataObj.kills});
                                if (gameData.userPlayer.hasChanged("kills")){
                                    gameData.updateKills();
                                }
                                break;

                            case "PlayerUpdate":
                                if (!self.initialized) return;
                                gameData.players.set(dataObj);  //No need to ease on player update, as it contains only partial player data
                                break;

                            case "Missile":
                                if (!self.initialized) return;

                                var missile = gameData.missiles.get(dataObj);

                                //New missile
                                if (!missile){
                                    missile = gameData.missiles.add(dataObj);
                                    var missilePlayer = gameData.players.get(dataObj.playerId);
                                    if (missilePlayer){
                                        missile.set(missilePlayer.update().fireMissile());
                                    }
                                }

                                dataObj = missile.update().clone().set(dataObj).update(gameData.latency).toJSON();
                                missile.set(dataObj, {easing:true});

                                break;

                            case "Collision":
                                if (!self.initialized) return;
                                gameData.trigger(Constants.Events.COLLISION, dataObj);
                                break;

                            case "RemoveSprite":
                                if (!self.initialized) return;
                                gameData.remove(dataObj);
                                break;

                            case "GameOver":
                                gameData.slayer = dataObj.slayer;
                                gameData.trigger(Constants.Events.GAME_ENDING);
                                break;

                            default:
                                console.warn("Unknown schema type received: "+type);
                                break;
                        }
                    });

                    wsClient.out = wsClient.createStream(gameData.user.username);
                    wsClient.out.readable = false;
                });

                wsClient.on('error', function(err){
                    console.warn("Websocket Error: "+err.message);
                    wsClient.close();
                });

                wsClient.on('close', function(){
                    gameData.trigger(Constants.Events.DISCONNECTED);
                    self.stop();
                });

                this.wsClient = wsClient;
                this.isRunning = true;
            },

            stop : function(){
                if (!this.isRunning) return;

                clearInterval(this.collisionInterval);
                this.gameData.off(Constants.Events.PLAYER_UPDATE);

                this.wsClient.removeAllListeners();
                this.wsClient.close();
                
                this.wsClient = undefined;
                this.initialized = false;
                this.isRunning = false;
            },

            initialize : function(){

                var self = this;

                self.collisionInterval = setInterval(function(){
                    self.detectCollisions();
                }, Constants.COLLISION_DETECT_INTERVAL);

                self.gameData.on(Constants.Events.PLAYER_UPDATE, function(data){
                    self.sendData(data);
                });

                self.initialized = true;
                self.gameData.trigger(Constants.Events.CONNECTED);
            },

            sendData : function(data){

                var userPlayer = this.gameData.userPlayer.update();

                if (data.isFiring && !userPlayer.canFire()){
                    data.isFiring = false;
                }

                if (data.isFiring || data.isReloading || data.isAccelerating != userPlayer.get("isAccelerating") || data.isShielded != userPlayer.get("isShielded") || userPlayer.angleDifference(data.angle) >= 0.1){
                    var buffer = micro.toBinary(data, "PlayerUpdate",3);
                    this.wsClient.out.write(buffer);
                }
            },

            detectCollisions : function(){

                var gameData = this.gameData;
                var missiles = gameData.missiles.models;
                var players = gameData.players.models;

                var deltaTime = gameData.latency + (Date.now()-gameData.userPlayer.lastUpdated);

                var userMissiles = [];
                var enemyMissiles = [];
                var enemyShips = [];

                var i, j, enemyShip, userShip, userMissile, enemyMissile;

                //Loop through the missile models, removing ones out of bounds and separating the rest into user and enemy arrays
                i = missiles.length;
                while (i--){
                    var missile = missiles[i];
                    if(missile.data.playerId === gameData.userPlayer.id){
                        userMissiles.push(missile.clone().update(deltaTime));
                    }else{
                        enemyMissiles.push(missile.clone().update(deltaTime));
                    }
                }

                //Loop through players models, cloning and updating them to account for latency
                i =  players.length;
                while (i--){
                    var player = players[i];
                    if (!userShip && player.equals(gameData.userPlayer)){
                        userShip = player.clone().update(deltaTime);
                    }else{
                        enemyShips.push(player.clone().update(deltaTime));
                    }
                }

                //Detect collisions between latency accounted for models
                i = userMissiles.length;
                while (i--){
                    userMissile = userMissiles[i];

                    //Detect collisions between user missiles and enemy ships
                    j = enemyShips.length;
                    while (j--){
                        enemyShip = enemyShips[j];
                        if (userMissile.detectCollision(enemyShip)){
                            this.sendCollision(userMissile, enemyShip);
                            break;
                        }
                    }

                    //Detect collisions between user missiles and enemy missiles
                    j = enemyMissiles.length;
                    while (j--){
                        enemyMissile = enemyMissiles[j];
                        if (userMissile.detectCollision(enemyMissile)){
                            this.sendCollision(userMissile, enemyMissile);
                            break;
                        }
                    }

                    if (userMissile.outOfBounds()){
                        this.sendOutOfBounds(userMissile);
                    }
                }

                if (userShip){
                    //Detect collisions between user ship and enemy ships
                    i = enemyShips.length;
                    while (i--){
                        enemyShip = enemyShips[i];
                        if (userShip.detectCollision(enemyShip)){
                            this.sendCollision(userShip, enemyShip);
                            break;
                        }
                    }

                    if (userShip.outOfBounds()){
                        this.sendOutOfBounds(userShip);
                    }
                }
            },

            sendCollision : function(sprite1, sprite2){
               var collision = {
                   zone : sprite1.get("zone"),
                   sprite1:sprite1,
                   sprite2:sprite2
               };

               this.wsClient.out.write(micro.toBinary(collision, "Collision"));
            },

             sendOutOfBounds : function(sprite){
                var outOfBounds = {
                   zone : sprite.data.zone,
                   type : sprite.type,
                   id : sprite.id
                };

                this.wsClient.out.write(micro.toBinary(outOfBounds, "OutOfBounds"));
            }
        });

        return Client;
    }
);

