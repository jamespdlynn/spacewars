// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.

var http = require("http"),
    express = require("express"),
    less = require('less-middleware'),
    requirejs = require('requirejs');

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

//Use require js from here on out to load our modules instead of node's require function.
//This will allow us to share some of the same modules both client and server side.
requirejs.config({
    baseUrl : __dirname+"/lib",
    nodeRequire : require
});

var app = express();
var isDevelopment = false;

app.configure('development', function(){

    app.use(less({
        src: __dirname + '/less',
        dest : __dirname + '/public',
        compress : false,
        debug : true,
        force : true
    }));
   // app.use(express.logger('dev'));
    app.use(express.errorHandler());
    app.use(express.static(__dirname+"/lib"));
    app.use(express.static(__dirname+"/public"));

    isDevelopment = true;

});

app.configure('production', function(){

    console.log("prod");

    app.use(less({
        src: __dirname + '/less',
        dest : __dirname + '/public',
        compress : true,
        once : true
    }));
    app.use(express.static(__dirname+"/public"));

    requirejs.optimize({
        baseUrl : __dirname+"/lib",
        name : 'main',
        mainConfigFile : __dirname+"/lib/main.js",
        findNestedDependencies : true,
        out : __dirname+"/public/main.js",
        preserveLicenseComments : false
    });
});

var port = process.argv[2] || process.env.PORT || 80;
var httpServer = http.createServer(app).listen(port, function(){
    console.log('Express server listening on port ' +port);
});

requirejs(["socket/server"], function(server){
    server.run(httpServer , isDevelopment);
});