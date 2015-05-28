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

    User.findOne({isBot:true}, function(err, user){
        if (err){
            console.error(err);
        }

        for (var i=0; i < NUM_BOTS; i++){
            new Bot(user.id).run(HOST_NAME);
        }

         console.log(NUM_BOTS +" bots created");
    });

});

