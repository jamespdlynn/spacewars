define(['binaryjs', 'microjs', 'models/schemas', 'models/zone', 'models/player', 'models/missile', 'models/constants'],
    function (binary, micro, schemas, Zone, Player, Missile, Constants){
        'use strict';

        //Register Schemas
        if (!micro._schemaNames.length){
            micro.register(schemas);
        }

        var Client = function(gameData){
            this.gameData = gameData;
            this.wsClient= null;
            this.initialized = false;
            this.isRunning = false;
        };

        extend.call(Client.prototype, {
            
            run : function(hostname){
                if (this.isRunning) return;

                var self = this;
                var gameData = this.gameData;
                var url = "ws://"+hostname+":"+Constants.WS_PORT;
                var wsClient  = binary ? new binary.BinaryClient(url) : new BinaryClient(url);

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
                                gameData.trigger(Constants.Events.COLLISION, dataObj.sprites);
                                break;

                            case "RemoveSprite":
                                if (!self.initialized) return;
                                gameData.remove(dataObj);
                                break;

                            case "GameOver":
                                gameData.trigger(Constants.Events.GAME_ENDING, dataObj);
                                break;

                            default:
                                console.warn("Unknown schema type received: "+type);
                                break;
                        }
                    });

                    wsClient.out = wsClient.createStream(gameData.user.id);
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

                this.gameData.off(Constants.Events.PLAYER_UPDATE);

                this.wsClient.removeAllListeners();
                this.wsClient.close();
                
                this.wsClient = undefined;
                this.initialized = false;
                this.isRunning = false;
            },

            initialize : function(){
                this.initialized = true;
                this.gameData.on(Constants.Events.PLAYER_UPDATE, this.sendData.bind(this));
                this.gameData.trigger(Constants.Events.CONNECTED);
            },

            sendData : function(data){

                var userPlayer = this.gameData.userPlayer.update();

                data.isFiring = data.isFiring && userPlayer.canFire();
                data.isAccelerating = data.isAccelerating && userPlayer.canAccelerate();
                data.isShielded = data.isShielded && userPlayer.canShield();
                data.isReloading = data.isReloading && userPlayer.canReload();

                var angleDiff = userPlayer.angleDifference(data.angle);

                if (data.isFiring
                    || data.isReloading
                    || data.isAccelerating != userPlayer.get("isAccelerating")
                    || data.isShielded != userPlayer.get("isShielded")
                    || angleDiff > 0.01 && data.isAccelerating
                    || angleDiff > 0.2){
                    var buffer = micro.toBinary(data, "PlayerUpdate",3);
                    this.wsClient.out.write(buffer);
                }
            }


        });

        return Client;
    }
);

