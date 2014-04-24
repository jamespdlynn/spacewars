define(['binaryjs', 'microjs', 'model/schemas', 'model/zone', 'model/player', 'model/missile', 'model/constants', 'model/game'],
    function (binary, micro, schemas, Zone, Player, Missile, Constants, gameData){
        'use strict';

        var wsClient, collisionInterval, initialized;

        //Register Schemas
        micro.register(schemas);

        var Client = {

            isRunning : false,

            run : function(){
                if (Client.isRunning) return;

                //Connect websocket to server and begin listening for messages
                var connectionStr = "ws://"+window.location.hostname+":"+Constants.WS_PORT;
                console.log("Socket connecting to: "+connectionStr);
                wsClient = new BinaryClient(connectionStr, {chunkSize:256});

                wsClient.on('stream', function(stream){
                    wsClient.in = stream;
                    wsClient.in.writeable = false;
                    wsClient.in.on('data', readData);

                    wsClient.out = wsClient.createStream(gameData.user.username);
                    wsClient.out.readable = false;
                });

                wsClient.on('error', function(err){
                    console.warn("Websocket Error: "+err.message);
                    wsClient.close();
                });

                wsClient.on('close', function(){
                    gameData.trigger(Constants.Events.DISCONNECTED);
                });

                Client.isRunning = true;
            },

            stop : function(){
                if (!Client.isRunning) return;

                clearInterval(collisionInterval);
                gameData.off(Constants.Events.PLAYER_UPDATE,onClientUpdate);

                wsClient.removeAllListeners();
                wsClient.close();
                
                wsClient = undefined;
                collisionInterval = undefined;
                initialized = false;

                Client.isRunning = false;
            }
        };

        //Handle data received from server
        function readData(data){

            var dataObj = micro.toJSON(new Buffer(data));
            var type = dataObj._type;
            var player;

            delete dataObj._type;

            switch (type){
                case "Ping":
                    if (dataObj.complete){
                        gameData.latency = 0;

                        var len = dataObj.timestamps.length-1;
                        var i = len;
                        while (i--){
                            gameData.latency += (dataObj.timestamps[i+1]-dataObj.timestamps[i]) / len / 2;
                        }
                    }else{
                        wsClient.out.write(data);
                    }
                    break;

                case "GameData" :
                    extend.call(dataObj, gameData.clone().set(dataObj,{remove:true}).update(gameData.latency).toJSON());
                    gameData.update().set(dataObj,{easing:true, remove:true});
                    if (!initialized){
                        initialize();
                    }
                    break;

                case "Player":
                    if (!initialized) return;

                    player = gameData.players.get(dataObj.id);

                    if (player){
                        dataObj = player.update().clone().set(dataObj).update(gameData.latency).toJSON();
                        player.set(dataObj,{easing:true});
                    }else{
                        gameData.players.add(dataObj).update(gameData.latency);
                    }

                    break;

                case "PlayerInfo":
                    if (!initialized) return;
                    dataObj = player.update().clone().set(dataObj).update(gameData.latency).toJSON();
                    gameData.userPlayer.set({fuel:dataObj.fuel, shields: dataObj.shields, ammo:dataObj.ammo, kills: dataObj.kills});
                    if (gameData.userPlayer.hasChanged("kills")){
                        gameData.updateKills();
                    }
                    break;

                case "PlayerUpdate":
                    if (!initialized) return;
                    gameData.players.set(dataObj);  //No need to ease on player update, as it contains only partial player data
                    break;

                case "Missile":
                    if (!initialized) return;

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
                    if (!initialized) return;
                    gameData.trigger(Constants.Events.COLLISION, dataObj);
                    break;

                case "RemoveSprite":
                    if (!initialized) return;
                    gameData.remove(dataObj);
                    break;

                case "GameOver":
                    gameData.slayer = dataObj.slayer;
                    gameData.incrementDeaths();
                    gameData.trigger(Constants.Events.GAME_ENDING);
                    break;

                default:
                    console.warn("Unknown schema type received: "+type);
                    break;
            }
        }
        
        function initialize(){


            setTimeout(function(){
                collisionInterval = setInterval(detectCollisions, Constants.COLLISION_DETECT_INTERVAL);
            }, Constants.COLLISION_DETECT_INTERVAL/2);

            gameData.on(Constants.Events.PLAYER_UPDATE, onClientUpdate);
            gameData.trigger(Constants.Events.CONNECTED);

            initialized = true;
        }

        //When a user player change event is caught, send a "PlayerUpdate" to the server
        function onClientUpdate(data){

            gameData.userPlayer.update();

            if (data.isFiring && !gameData.userPlayer.canFire()){
                data.isFiring = false;
            }

            if (data.isFiring || data.isReloading || (data.isAccelerating !=  gameData.userPlayer.get("isAccelerating")) || (data.isShielded != gameData.userPlayer.get("isShielded")) || gameData.userPlayer.angleDifference(data.angle) >= 0.1){
                var buffer = micro.toBinary(data, "PlayerUpdate",3);
                wsClient.out.write(buffer);
            }
        }

        function detectCollisions(){

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
                        sendCollision(userMissile, enemyShip);
                        break;
                    }
                }

                //Detect collisions between user missiles and enemy missiles
                j = enemyMissiles.length;
                while (j--){
                    enemyMissile = enemyMissiles[j];
                    if (userMissile.detectCollision(enemyMissile)){
                        sendCollision(userMissile, enemyMissile);
                        break;
                    }
                }

                if (userMissile.outOfBounds()){
                    sendOutOfBounds(userMissile);
                }
            }

            if (userShip){
                //Detect collisions between user ship and enemy ships
                i = enemyShips.length;
                while (i--){
                    enemyShip = enemyShips[i];
                    if (userShip.detectCollision(enemyShip)){
                        sendCollision(userShip, enemyShip);
                        break;
                    }
                }

                if (userShip.outOfBounds()){
                    sendOutOfBounds(userShip);
                }
            }
        }

        function sendCollision(sprite1, sprite2){
           var collision = {
               zone : sprite1.get("zone"),
               sprite1:sprite1,
               sprite2:sprite2
           };

           wsClient.out.write(micro.toBinary(collision, "Collision"));
        }

        function sendOutOfBounds(sprite){
            var outOfBounds = {
               zone : sprite.data.zone,
               type : sprite.type,
               id : sprite.id
            };

            wsClient.out.write(micro.toBinary(outOfBounds, "OutOfBounds"));
        }



    return Client;
});

