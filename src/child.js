var requirejs = require('requirejs');

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

modules.export = function(isProd){
    requirejs.config({
        baseUrl : __dirname+"/src",
        nodeRequire : require
    });

    requirejs(["control/server"], function(server){
        server.run(!isProd);
    });

    if (isProd){
        process.on('uncaughtException', function(error) {
            console.error("Uncaught Exception: "+error.stack);
        });
    }
};


