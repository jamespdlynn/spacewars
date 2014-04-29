// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.
var http = require("http"),
    express = require("express"),
    pkg = require('./package.json');

var app = express();
app.set('env', process.argv[2] || process.env.NODE_ENV || 'production');
app.set('port', process.argv[3] || process.env.PORT || '80');

app.configure(function(){

    var isProd = ('production' == app.get('env'));

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
     require('requirejs').optimize({
        baseUrl : __dirname+"/src",
        name : 'main',
        mainConfigFile : __dirname+"/src/main.js",
        findNestedDependencies : true,
        out : __dirname+"/public/js/main-"+pkg.version+".js",
        preserveLicenseComments : false
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express "+app.get('env')+" server listening on port "+app.get('port'));

    process.on('uncaughtException', function(error) {
        console.error("Uncaught Exception: "+error.stack);
    });
});

var childPath = __dirname+"/src/child.js";

if (!process.env.DEBUG){
    createChild();
}else{
    require(childPath);
}

function createChild(){
    var child = require("child_process").fork(childPath);
    child.once('exit', function(){
        console.log("Restarting child process");
        createChild();
    });
}
