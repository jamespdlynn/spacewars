define(['binaryjs', 'microjs', 'model/schemas', 'model/zone', 'model/player', 'model/missile', 'model/constants', 'model/game'],
    function (binary, micro, schemas, Zone, Player, Missile, Constants, gameData){

        var wsClient, currentZone, userPlayer, collisionInterval, connected;

        //Register Schemas
        micro.register(schemas);

        var Client = {

            isRunning : false,

            run : function(){
                if (Client.isRunning) return;

                //Connect websocket to server and begin listening for messages
                wsClient = new BinaryClient("ws://"+window.location.host, {
                    chunkSize : 1024
                });

                wsClient.on('stream', function(stream){
                    wsClient.in = stream;
                    wsClient.in.writeable = false;
                    wsClient.in.on('data', readData);

                    wsClient.out = wsClient.createStream(gameData.user.username);
                    wsClient.out.readable = false;
                });

                wsClient.on('error', function(){
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
                if (wsClient.in) wsClient.in.removeAllListeners();
                wsClient.close();
                wsClient = undefined;

                currentZone = undefined;
                userPlayer = undefined;
                collisionInterval = undefined;
                connected = false;

                Client.isRunning = false;
            }
        };

        //Handle data received from server
        function readData(data){

            var dataObj = micro.toJSON(new Buffer(data));
            var type = dataObj._type;

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

                    gameData.setCurrentZone(dataObj);

                    currentZone = gameData.currentZone.update(gameData.latency);
                    userPlayer = currentZone.players.get(gameData.playerId);

                    if (!connected){
                        gameData.on(Constants.Events.PLAYER_UPDATE, onClientUpdate);

                        setTimeout(function(){
                            collisionInterval = setInterval(detectCollisions, Constants.COLLISION_DETECT_INTERVAL);
                        }, Constants.COLLISION_DETECT_INTERVAL/2);

                        connected = true;
                        gameData.trigger(Constants.Events.CONNECTED);
                    }

                    break;


                case "Player":
                    if (!currentZone) return;
                    //Use dummy Player Model to update the data values according to gameData.latency
                    dataObj = new Player(dataObj).update(gameData.latency).toJSON();
                    //Set easing to true so we don't simply override this player's x,y coordinates (if they exist)
                    currentZone.players.set(dataObj,{easing:true, remove:false});
                    break;

                case "Missile":
                    if (!currentZone) return;

                    var missile;

                    //New missile
                    if (dataObj.playerId){
                        var player = currentZone.players.get(dataObj.playerId);
                        var missileData = player.fireMissile();
                        missileData.id = dataObj.id;
                        missile = currentZone.missiles.add(missileData);
                    }
                    else{
                        missile = currentZone.missiles.get(dataObj.id);
                        if (missile){
                            dataObj.angle = missile.data.angle;
                            dataObj.playerId = missile.data.playerId;
                        }
                    }

                    if (missile){
                        dataObj = new Missile(dataObj).update(gameData.latency).toJSON();
                        missile.set(dataObj, {easing:true});
                    }

                    break;

                case "PlayerUpdate":
                    if (!currentZone) return;
                    currentZone.players.get(dataObj.id).set(dataObj);  //No need to ease on player update, as it contains only partial player data
                    break;

                case "Collision":
                    if (!currentZone) return;
                    gameData.trigger(Constants.Events.COLLISION, dataObj);
                    break;

                case "RemoveSprite":
                    if (!currentZone) return;
                    currentZone.remove(dataObj);
                    break;

                default:
                    console.warn("Unknown schema type received: "+type);
                    break;
            }

        }

        //When a user player change event is caught, send a "PlayerUpdate" to the server
        function onClientUpdate(data){

            data.angle = data.angle.toPrecision(2);
            if (data.isFiring && !userPlayer.canFire()){
                data.isFiring = false;
            }

            var sendUpdate;

            sendUpdate = (data.isFiring || userPlayer.get("isAccelerating") != !!data.isAccelerating);
            if (!sendUpdate){
               var deltaAngle = angleDiff(userPlayer.get("angle"),data.angle);
               sendUpdate = (deltaAngle >= 0.2 && (data.isAccelerating || deltaAngle >= 1))
            }

            //Check if data contains different values
            if (sendUpdate){
                var buffer = micro.toBinary(data, "PlayerUpdate",3);
                wsClient.out.write(buffer);

                //Allow for gameData.latency before setting these changes on the player
                setTimeout(function(){
                    userPlayer.set(data);
                }, gameData.latency);
            }

        }

        function detectCollisions(){

            var missiles = currentZone.missiles.models;
            var players = currentZone.players.models;

            var deltaTime = gameData.latency + (Date.now()-userPlayer.lastUpdated);

            var userMissiles = [];
            var enemyMissiles = [];
            var enemyShips = [];

            var i, j, enemyShip, userShip, userMissile, enemyMissile;

            //Loop through the missile models, removing ones out of bounds and separating the rest into user and enemy arrays
            i = missiles.length;
            while (i--){
                var missile = missiles[i];
                if (missile.outOfBounds()){
                    currentZone.missiles.remove(missile);
                }else if(missile.data.playerId === gameData.playerId){
                    userMissiles.push(missile.clone().update(deltaTime));
                }else{
                    enemyMissiles.push(missile.clone().update(deltaTime));
                }
            }

            //Loop through players models, cloning and updating them to account for latency
            i =  players.length;
            while (i--){
                var player = players[i];
                if (!userShip && player.equals(userPlayer)){
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
                    wsClient.out.write(micro.toBinary({}, "OutOfBounds"));
                }
            }
        }

        function sendCollision(sprite1, sprite2){
           var collision = {
               sprite1:{
                   type:sprite1.type,
                   id:sprite1.id
               },
               sprite2:{
                   type:sprite2.type,
                   id:sprite2.id
               }
           };

           wsClient.out.write(micro.toBinary(collision, "Collision"));
        }

        function angleDiff(angle1, angle2){
            var deltaAngle = angle1-angle2;
            while (deltaAngle < -Math.PI/2) deltaAngle += Math.PI;
            while (deltaAngle > Math.PI/2) deltaAngle -= Math.PI;
            return Math.abs(deltaAngle);
        }


    return Client;
});

