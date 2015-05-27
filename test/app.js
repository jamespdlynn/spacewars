var fs = require("fs"),
    requirejs = require("requirejs");

var NUM_BOTS = 100;
var NAMES = fs.readFileSync(__dirname+'/names.txt').toString().replace(" ","").replace("\r","").split("\n");
var HOST_NAME = process.argv[2] || "localhost";

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

var User = require('../config/mongoose').model("User");


requirejs.config({
    nodeRequire : require,
    baseUrl : '../socket'
});

requirejs(["controls/bot"], function(Bot){


    User.remove({isBot:true}, function(err){
        if (err){
            console.error(err);
        }

        var botCount = 0;

        for (var i=0; i < NUM_BOTS; i++){
            var user = new User();
            user.firstName = NAMES[i].trim();
            user.lastName = "Bot";
            user.email = user.firstName+"@test.com";
            user.icon = "http://graph.facebook.com/"+Math.floor(Math.random()*1000)+10+"/picture";
            user.isBot = true;

            user.save(function(err, res){
                if (err){
                    console.error(err);
                    return;
                }

                var bot = new Bot(res.id);
                bot.run(HOST_NAME);

                if (++botCount >= NUM_BOTS){
                    console.log(botCount +" bots created");
                }
            });
        }
    });

});

