// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.
var http = require("http"),
    express = require("express"),
    requirejs = require('requirejs'),
    pkg = require('./package.json');

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

var app = express(),
    isProd = ('production' == app.get('env'));

app.configure(function(){

    var fs = require('fs');

    var htmlPath = __dirname+'/public/index.html';
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);

    var cssPath = __dirname+'/public/css/style.css';
    if (fs.existsSync(cssPath)) fs.unlinkSync(cssPath);

    var mainPath = isProd ? '/js/main-'+pkg.version: 'main';
    require('jade').renderFile(__dirname+'/views/index.jade', {version:pkg.version, mainPath:mainPath}, function(error,html){
        fs.writeFile(htmlPath, html);
    });

    app.set('port', process.env.PORT || 80);
    app.use(express.logger());
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
    app.use(express.static(__dirname+"/src"));
    app.use(express.errorHandler());
});

app.configure('production', function(){
    requirejs.optimize({
        baseUrl : __dirname+"/src",
        name : 'main',
        mainConfigFile : __dirname+"/lib/main.js",
        findNestedDependencies : true,
        out : __dirname+"/public/js/main-"+pkg.version+".js",
        preserveLicenseComments : false,
        optimize : 'none'
    });
});

var httpServer = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' +app.get('port'));
});

requirejs.config({
    baseUrl : __dirname+"/src",
    nodeRequire : require
});

requirejs(["socket/server"], function(server){
    server.run(httpServer , !isProd);
});

