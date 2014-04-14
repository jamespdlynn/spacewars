// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.
var http = require("http"),
    express = require("express"),
    requirejs = require('requirejs'),
    pkg = require('./package.json');


var app = express();
app.set('env', process.argv[2] || process.env.NODE_ENV || 'production');
app.set('port', process.argv[3] || process.env.PORT || '80');

var isProd = ('production' == app.get('env'));

app.configure(function(){

    if (!process.env.DEBUG){
        var fs = require('fs');

        var htmlPath = __dirname+'/public/index.html';
        if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);

        var cssPath = __dirname+'/public/css/style.css';
        if (fs.existsSync(cssPath)) fs.unlinkSync(cssPath);

        var mainPath = isProd ? '/js/main-'+pkg.version: 'main';
        require('jade').renderFile(__dirname+'/index.jade', {version:pkg.version, mainPath:mainPath}, function(error,html){
            fs.writeFile(htmlPath, html);
        });
    }
    app.use(express.favicon());

    app.use(require('less-middleware')({
        src: __dirname + '/less',
        dest : __dirname + '/public/css',
        prefix : '/css',
        optimization: 2,
        force : !isProd,
        debug : !isProd,
        compress: isProd, // compress when in production
        once: isProd // check for changes only once in production
    }));

    app.use(express.static(__dirname+"/public"));
});

app.configure('development', function() {
    app.use(express.logger());
    app.use(express.errorHandler());
    app.use(express.static(__dirname+"/src"));
});

app.configure('production', function(){
    requirejs.optimize({
        baseUrl : __dirname+"/src",
        name : 'main',
        mainConfigFile : __dirname+"/src/main.js",
        findNestedDependencies : true,
        out : __dirname+"/public/js/main-"+pkg.version+".js",
        preserveLicenseComments : false
    });
});

var httpServer = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express "+app.get('env')+" server listening on port "+app.get('port'));

    if (isProd){
        process.on('uncaughtException', function(error) {
            console.error("Uncaught Exception: "+error.stack);
        });
    }
});

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
    baseUrl : __dirname+"/src",
    nodeRequire : require
});

requirejs(["control/server"], function(server){
    server.run(httpServer , !isProd);
});
