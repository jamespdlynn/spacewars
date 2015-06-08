var requirejs = require('requirejs');
var mongoose = require('../config/mongoose');
var User = mongoose.model('User');

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

if (process.env.NODE_ENV === "development"){
    var memwatch = require('memwatch');
    memwatch.on('leak', function(info){
        console.error("Memory Leak Detected: "+info.reason);
    });
    memwatch.on('stats', function(stats){
        console.log(JSON.stringify(stats));
    });

    mongoose = require('mongoose');
}


requirejs.config({
    nodeRequire : require,
    baseUrl : __dirname
});

requirejs(["controls/server", "models/constants", "controls/bot"], function(Server, Constants, Bot){

    User.find('_id').where({isBot:true}).limit(Constants.MIN_PLAYERS-1).exec(function(err, users){
        if (err){
            console.error(err);
            return;
        }

        var bots = users.map(function(user){
            return new Bot(user.id);
        });

        bots.activeCount = function(){
            var count = 0;
            bots.forEach(function(bot){
                if (bot.active) count++;
            });
            return count;
        };

        bots.activate = function(){
            for (var i=0; i < bots.length; i++){
                if (!bots[i].active){
                    bots[i].run();
                    break;
                }
            }
        };

        setInterval(function(){
            var connectionCount = Server.connectionCount();
            var activeBots = bots.activeCount();

            if (connectionCount > activeBots){
                while (connectionCount < bots.length+1){
                    bots.activate();
                    connectionCount++;
                }
            }
        }, 5000);
    });

    Server.run();
    console.log("Socket Server Started");
});

process.on('uncaughtException', function(error) {
    console.error("Uncaught Exception: "+error.stack);
    setTimeout(function(){
        process.exit(-1);
    },500);
});








