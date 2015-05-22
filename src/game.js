var requirejs = require('requirejs');
var mongoose = require('mongoose');
var env = process.env.NODE_ENV;

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

switch (env)
{
    case "development":
        var memwatch = require('memwatch');
        memwatch.on('leak', function(info){
            console.error("Memory Leak Detected: "+info.reason);
        });
        memwatch.on('stats', function(stats){
            console.log(JSON.stringify(stats));
        });
        break;

    case "production":
    default:
        require('../config/database');
        break;
}


requirejs.config({
    nodeRequire : require,
    baseUrl : __dirname
});

requirejs(["control/server", "model/constants", "control/bot"], function(Server, Constants, Bot){

    var User = mongoose.model('User');

    User.find('_id').where({isTest:true}).limit(Constants.MIN_PLAYERS-1).exec(function(err, users){
        if (err){
            console.error(err);
            process.exit(-1);
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

            //console.log(connectionCount);

            if (connectionCount > activeBots){
                while (connectionCount < bots.length+1){
                    bots.activate();
                    connectionCount++;
                }
            }
        }, 5000);

        Server.run();

        process.on('uncaughtException', function(error) {
            console.error("Uncaught Exception: "+error.stack);
        });
    });


});








