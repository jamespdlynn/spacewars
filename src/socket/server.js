define(["binaryjs","microjs","model/schemas","model/constants","socket/zone"], function(binary, micro, schemas,Constants,ServerZone){

    var BinaryServer = binary.BinaryServer;

    //Constants
    var MAX_PINGS = 5;
    var PING_INTERVAL = 60000;
    var MAX_ZONES = Constants.MAX_WORLD_SIZE * Constants.MAX_WORLD_SIZE;
    var MAX_CONNECTIONS = MAX_ZONES * 3;

    var serverZones;
    var availableWorldSize;
    var wsServer;
    var connectionCount;
    var maxConnectionCount;
    var addresses;
    var isDevelopment;


    //Register our schemas
    micro.register(schemas);

    return {

        run : function(httpServer, isDev){

            //Initialize zones
            serverZones = [];
            availableWorldSize = Constants.MIN_WORLD_SIZE;
            for (var i=0; i < MAX_ZONES; i++){
                 serverZones.push(new ServerZone(i));
            }

            connectionCount = 0;
            maxConnectionCount = 0;
            addresses = {};

            //Create a new BinaryServer Instance
            wsServer = new BinaryServer({
                server: httpServer,
                chunkSize : 1024
            });

            //When a new connection request is received from a client
            wsServer.on("connection", onConnection);

            isDevelopment = !!isDev;
        }
    };

    function onConnection(connection){

        //Make sure we haven't exceeded our maximum number of connections

        var remoteAddress = connection._socket._socket.remoteAddress;

        if (wsServer._clientCounter >= MAX_CONNECTIONS || (addresses[remoteAddress] && !isDevelopment)){
            connection.close();
            return;
        }

        var currentZone, pingTimeout, updated, username;

        var readData = function(buffer){
            var data = micro.toJSON(buffer);
            var type = data._type;
            delete data._type;

            switch (type)
            {
                case "Ping" :
                    var pingComplete = ping(connection,data);
                    if (pingComplete){

                        if (!currentZone) initializeZone();

                        updated = false;
                        pingTimeout = setTimeout(function(){
                            if (updated) ping(connection);
                            else connection.close();
                        }, PING_INTERVAL);
                    }
                    break;

                case "PlayerUpdate":
                    if (!currentZone) break;
                    data.id = connection.playerId;
                    currentZone.updatePlayer(data);
                    updated = true;
                    break;

                case "Collision":
                    if (!currentZone) break;
                    currentZone.detectCollision(data);
                    break;

                case "OutOfBounds":
                    if (!currentZone) break;
                    var player = currentZone.getPlayer(connection.playerId);
                    currentZone.checkZoneChange(player);
                    break;

                default:
                    console.warn("Unexpected Schema Type Received: "+type);
                    break;
            }
        };

        var initializeZone = function(){

            do {
                var row = Math.floor(Math.random()*availableWorldSize);
                var col = Math.floor(Math.random()*availableWorldSize);
                currentZone = serverZones[getZoneId(row, col)];
            }while (currentZone.getNumPlayers() >= 3);

            currentZone.add(connection, {username:username});
            currentZone.on(Constants.Events.ZONE_CHANGED, onZoneChange);

            var maxConnections = (availableWorldSize*availableWorldSize*2.5);
            if (connectionCount > maxConnections && availableWorldSize < Constants.MAX_WORLD_SIZE){
                availableWorldSize++;
            }

            if (connectionCount > maxConnectionCount){
                logServerStatus();
                maxConnectionCount = connectionCount;
            }
        };

        var onZoneChange = function(player, direction){

            if (player.id !== connection.playerId) return;

            var row = Math.floor(currentZone.id / Constants.MAX_WORLD_SIZE);
            var col = currentZone.id % Constants.MAX_WORLD_SIZE;

            switch(direction){
                case "left" :
                    col--;
                    player.data.posX = Constants.Zone.width + (player.width/2);
                    break;

                case "right":
                    col++;
                    player.data.posX = -player.width/2;
                    break;

                case "top":
                    row--;
                    player.data.posY = Constants.Zone.height + (player.height/2);
                    break;

                case "bottom":
                    row++;
                    player.data.posY = -player.height/2;
                    break;
            }

            if (row < 0) row = availableWorldSize-1;
            else if (row >= availableWorldSize) row = 0;

            if (col < 0) col = availableWorldSize-1;
            else if (col >= availableWorldSize) col = 0;

            var newZoneId = getZoneId(row, col);

            if (newZoneId !== currentZone.id){
                currentZone.remove(connection);
                currentZone.off(Constants.Events.ZONE_CHANGED, onZoneChange);

                currentZone = serverZones[newZoneId];
                currentZone.add(connection, player.toJSON());
                currentZone.on(Constants.Events.ZONE_CHANGED, onZoneChange);
            }
            else{
                currentZone._sendPlayer(player);
            }

        };


        connection.on("stream", function(stream, meta) {
            username = meta;

            connection.in = stream;
            connection.in.writeable = false;
            connection.in.on('data', readData);
        });

        connection.on("error", function(error){
            console.error("WebSocket Error: "+error);
            connection.close();
        });

        //When the client terminated the websocket connections
        connection.on("close", function(){

            clearTimeout(pingTimeout);

            if (currentZone){
                currentZone.remove(connection);
                currentZone.off(Constants.Events.ZONE_CHANGED, onZoneChange);
            }

            if (connection.in){
                connection.in.removeAllListeners();
            }

            connection.removeAllListeners();
            connection = undefined;

            delete addresses[remoteAddress];

            connectionCount--;

            var maxConnections = (availableWorldSize*availableWorldSize*2);
            if (connectionCount < maxConnections && availableWorldSize > Constants.MIN_WORLD_SIZE){
                availableWorldSize--;
            }

        });

        //Get things going by creating an output stream and pinging the client
        connection.out = connection.createStream();
        connection.out.readable = false;

        addresses[remoteAddress] = 1;
        connectionCount++;

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


    function getZoneId(row, col){
       return (row*Constants.MAX_WORLD_SIZE) + col;
    }

    function logServerStatus(){
        console.log("");
        console.log(new Date().toUTCString());
        console.log("World Size: "+availableWorldSize);
        console.log("Connections: "+connectionCount);
        console.log("");
    }


});