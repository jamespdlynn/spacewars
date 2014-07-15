var fs = require("fs"),
    requirejs = require("requirejs");

var NUM_CONNECTIONS = 800;
var HOST_NAME = "localhost";
var NAMES = fs.readFileSync(__dirname+'/names.txt').toString().replace(" ","").replace("\r","").split("\n");

global.extend = function(add){
    for (var i=0; i < arguments.length; i++){
        var obj = arguments[i];
        for (var key in obj){
            if (obj.hasOwnProperty(key)){
                this[key] = obj[key];
            }
        }
    }
    return this;
};

requirejs.config({
    nodeRequire : require,
    baseUrl : 'src'
});

requirejs(["control/client","model/game","model/constants"], function(Client, GameData, Constants){

    var clientCount = 0;

    for (var i=0; i < NUM_CONNECTIONS; i++){
        setTimeout(createClient, i);
    }

    function createClient(){

        var gameData = new GameData();
        var client = new Client(gameData);
        var username = NAMES[clientCount%NAMES.length];

        gameData.setUsername(username);
        gameData.on(Constants.Events.CONNECTED, function(){
            gameData.off(Constants.Events.CONNECTED);
            sendUpdate(client);
        });

        client.run(HOST_NAME);

        if (++clientCount >= NUM_CONNECTIONS){
            console.log(clientCount +" clients created");
        }
    }

    function sendUpdate(client){

        var duration = (Math.random() * Constants.SERVER_UPDATE_INTERVAL) + Constants.CLIENT_UPDATE_INTERVAL;
        setTimeout(function(){

            if (!client.isRunning) return;

            var data = {};
            data.angle = (Math.random() * Math.PI*2) - Math.PI;
            data.isAccelerating = Math.random() > 0.5;
            data.isFiring = Math.random() > 0.1;
            data.isShielded = Math.random() > 0.8;

            client.sendData(data);

            sendUpdate(client);
        }, duration);
    }
});

