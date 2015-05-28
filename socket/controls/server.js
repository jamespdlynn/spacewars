define(["binaryjs","microjs", "mongoose", "models/schemas","models/constants","controls/zone","controls/player"],
    function(binary, micro, mongoose, schemas, Constants, ServerZone, PlayerManager){
    'use strict';

    var BinaryServer = binary.BinaryServer;
    var User = mongoose.model("User");

    //Constants
    var PING_INTERVAL = 30000;
    var MAX_PINGS = 5;
    var NUM_ZONES = Constants.WORLD_SIZE * Constants.WORLD_SIZE;

    var connectionCount = 0;

    var serverZones = [];
    var addressMap = {};

    var wsServer;
    var isDevelopment;

    micro.maxBufferLength = Constants.MAX_BUFFER_LENGTH;
    micro.register(schemas);

    return {


        connectionCount : function(){
            return connectionCount;
        },

        run : function(){
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
                port : Constants.WS_PORT
            });

            //When a new connection request is received from a client
            wsServer.on("connection", onConnection);

            isDevelopment = (process.env.NODE_ENV == 'development');
        }
    };

    function onConnection(connection){

        //Make sure we haven't exceeded our maximum number of connections
        if (connectionCount >= Constants.MAX_PLAYERS){
            connection.close();
            return;
        }

        var pingTimeout, updated, initialized, player;

        connection.on("stream", function(stream, userId) {

            if (addressMap[userId] && !isDevelopment){
                connection.close();
                return;
            }

            User.findById(userId, function(err, user){
                if (err || !user){
                    console.error("Unable to connect user: "+userId +" "+err);
                    connection.close();
                    return;
                }

                connection.in = stream;
                connection.in.writeable = false;
                connection.in.on('data', readData);
                addressMap[userId] = 1;

                player = PlayerManager.create(connection, user);

                ping(connection);
                connectionCount++;
            });
        });

        connection.on("error", function(error){
            console.error("WebSocket Error: "+error);
            connection.close();
        });

        //When the client terminated the websocket connections
        connection.on("close", function(){
            if (player){
                delete addressMap[player.user.id];
                clearTimeout(pingTimeout);
                connectionCount--;
                PlayerManager.destroy(player);
                player = undefined;
            }

            connection.removeAllListeners();
            connection = undefined;
        });

        //Get things going by creating an output stream and pinging the client
        connection.out = connection.createStream();
        connection.out.readable = false;

        function readData(buffer){

            try {
                var data = micro.toJSON(buffer);
                var type = data._type;
                delete data._type;

                switch (type)
                {
                    case "Ping" :
                        if (ping(connection,data)){
                            if (!initialized) initializeZone();

                            updated = false;
                            pingTimeout = setTimeout(function(){
                                if (!updated && !isDevelopment){
                                    connection.close();
                                    return;
                                }
                                ping(connection);
                            }, PING_INTERVAL);
                        }
                        break;

                    case "PlayerUpdate":
                        if (!initialized) break;
                        updated = PlayerManager.update(player,data);
                        break;

                    default:
                        console.warn("Unexpected Schema Type Received: "+type);
                        break;
                }
            }catch (err){
                console.error("Error reading data: "+err.stack);
                connection.close();
            }

        }

        function initializeZone(){

            try{
                var zone = serverZones[Math.floor(Math.random()*NUM_ZONES)];

                while(connectionCount > 1){
                    //Find a zone populated by a user
                    if (zone.getNumPlayers()){
                        //Find an empty adjacent zone
                        do {
                            zone = zone.adjacentZones[Math.floor(Math.random()*zone.adjacentZones.length)];
                        }while (zone.getNumPlayers());
                        break;
                    }
                    zone = serverZones[zone.id < NUM_ZONES-1 ? zone.id+1 : 0]
                }

                zone.addPlayer(player, true);
                initialized = true;
            }catch (err){
                console.error("Error initializing zone: "+err.stack);
                connection.close();
            }

        }
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



});