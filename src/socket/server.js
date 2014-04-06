define(["binaryjs","microjs","model/schemas","model/constants","model/player","model/missile","socket/zone"],
    function(binary, micro, schemas, Constants, Player, Missile, ServerZone){
    'use strict';

    var BinaryServer = binary.BinaryServer;

    //Constants
    var PING_INTERVAL = 60000;
    var MAX_PINGS = 5;
    var NUM_ZONES = Constants.WORLD_SIZE * Constants.WORLD_SIZE;
    var MAX_PLAYER_ID =  Math.pow(2,8)-1;
    var MAX_MISSILE_ID = Math.pow(2,16)-1;

    var currentPlayerId = 0;
    var currentMissileId = 0;
    var connectionCount = 0;
    var maxConnectionCount = 0;

    var serverZones = [];
    var playerMap = {};
    var addressMap = {};

    var wsServer;
    var isDevelopment;

    //Register our schemas
    micro.register(schemas);

    return {

        run : function(httpServer, isDev){
            //Initialize zones
            serverZones = [];
            for (var i=0; i < NUM_ZONES; i++){
                 serverZones.push(new ServerZone(i));
            }

            //Set adjacent zones
            for (var row=0; row < Constants.WORLD_SIZE; row++){
                for (var col=0; col < Constants.WORLD_SIZE; col++){
                    var prevRow = row > 0 ? row-1 : Constants.WORLD_SIZE-1;
                    var nextRow = row < Constants.WORLD_SIZE-1 ? row+1 : 0;
                    var prevCol = col > 0 ? col-1 : Constants.WORLD_SIZE-1;
                    var nextCol = col < Constants.WORLD_SIZE-1 ? col+1 : 0;

                    getZone(row,col).adjacentZones = [
                        getZone(prevRow, prevCol),
                        getZone(prevRow, col),
                        getZone(prevRow, nextCol),
                        getZone(row, prevCol),
                        getZone(row, nextCol),
                        getZone(nextRow, prevCol),
                        getZone(nextRow, col),
                        getZone(nextRow, nextCol)
                    ];

                }
            }

            //Create a new BinaryServer Instance
            wsServer = new BinaryServer({
                server: httpServer
            });

            //When a new connection request is received from a client
            wsServer.on("connection", onConnection);

            isDevelopment = !!isDev;
        }
    };

    function onConnection(connection){

        //Make sure we haven't exceeded our maximum number of connections
        if (connectionCount > MAX_PLAYER_ID){
            connection.close();
            return;
        }

        var remoteKey, pingTimeout, updated, initialized;
        var player = createPlayer();
        player.connection = connection;

        var readData = function(buffer){
            var data = micro.toJSON(buffer);
            var type = data._type;
            delete data._type;

            var zone;

            switch (type)
            {
                case "Ping" :

                    if (ping(connection,data)){
                        if (!initialized) initializeZone();

                        updated = false;
                        pingTimeout = setTimeout(function(){
                            if (updated) ping(connection);
                            else connection.close();
                        }, PING_INTERVAL);
                    }
                    break;

                case "PlayerUpdate":
                    if (!initialized) break;
                    zone = serverZones[player.get("zone")];
                    zone.updatePlayer(player.id,data);

                    if (data.isFiring && player.canFire()){
                        var missile = createMissile().set(player.fireMissile());
                        zone.addMissile(missile);
                    }

                    updated = true;
                    break;

                case "Collision":
                    if (!initialized) break;
                    if (zone = serverZones[data.zone]){
                        zone.detectCollision(data);
                    }
                    break;

                case "OutOfBounds":
                    if (!initialized) break;
                    if (zone = serverZones[data.zone]){
                        zone.checkZoneChange(data);
                    }
                    break;

                default:
                    console.warn("Unexpected Schema Type Received: "+type);
                    break;
            }
        };

        var initializeZone = function(){

            var zone = serverZones[Math.floor(Math.random()*NUM_ZONES)];
            var loop = connectionCount > 1;

            while(loop){
                if (zone.getNumPlayers() >= 1){
                    do {
                        zone = zone.adjacentZones[Math.floor(Math.random()*zone.adjacentZones.length)];
                    }while (zone.getNumPlayers() > 3);
                    break;
                }
                zone = serverZones[zone.id < NUM_ZONES-1 ? zone.id+1 : 0]
            }

            zone.addPlayer(player, true);
            initialized = true;
        };


        connection.on("stream", function(stream, meta) {

            remoteKey = connection._socket._socket.remoteAddress + ":" + meta;

            if (addressMap[remoteKey] && !isDevelopment){
                remoteKey = undefined;
                connection.close();
            }
            else{
                addressMap[remoteKey] = 1;
                player.set("username",meta);

                connection.in = stream;
                connection.in.writeable = false;
                connection.in.on('data', readData);
            }
        });

        connection.on("error", function(error){
            console.error("WebSocket Error: "+error);
            connection.close();
        });

        //When the client terminated the websocket connections
        connection.on("close", function(){

            clearTimeout(pingTimeout);
            delete playerMap[player.id];
            delete addressMap[remoteKey||""];

            player.connection = connection = undefined;
            connectionCount--;

            if (initialized){
                setTimeout(function(){
                    serverZones[player.get("zone")].removePlayer(player, true);
                    player = undefined;
                }, 2000);
            }

        });

        //Get things going by creating an output stream and pinging the client
        connection.out = connection.createStream();
        connection.out.readable = false;

        connectionCount++;

        if (connectionCount > maxConnectionCount){
            console.log(new Date().toUTCString()+ " connections: "+connectionCount+"\n");
            maxConnectionCount = connectionCount;
        }

        ping(connection);
    }


    function ping(connection, data){

        data = data || {timestamps:[]};
        data.timestamps.push(Date.now());
        data.complete = data.timestamps.length >= MAX_PINGS;

        if (data.timestamps.length <= MAX_PINGS){
            connection.out.write(micro.toBinary(data, "Ping"));
        }

        return data.complete;
    }

    function getZone(row, col){
       return serverZones[(row*Constants.WORLD_SIZE) + col];
    }

    function createPlayer(){
        currentPlayerId = currentPlayerId < MAX_PLAYER_ID ? currentPlayerId+1 : 0;
        if (!playerMap[currentPlayerId.toString()]){
            var player =  new Player({id:currentPlayerId});
            player.on(Constants.Events.UPDATE, onPlayerUpdate);
            return playerMap[currentPlayerId.toString()] = player;
        }else{
            return createPlayer();
        }
    }

    function createMissile(){
        currentMissileId = currentMissileId < MAX_MISSILE_ID ? currentMissileId+1 : 0;
        return new Missile({id:currentMissileId});
    }

    function onPlayerUpdate(){

        if (this.get("isInvulnerable") && this.lastUpdated-this.created >= this.invulnerableTime){
            this.set("isInvulnerable", false);
        }

        if (this.get("isAccelerating") && !this.canAccelerate()){
            this.set("isAccelerating", false);
        }

        if (this.get("shields") == 0 && !this.get("isShieldBroken")){
            var self = this;
            self.set({isShielded:false,isShieldBroken:true});
            setTimeout(function(){
                self.set({isShieldBroken:false,shields:20});
            }, self.shieldDownTime);
        }
    }


});