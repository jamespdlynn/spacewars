// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.
var http = require("http"),
    express = require("express"),
    cp = require('child_process'),
    pkg = require('./package.json'),
    childPath = __dirname+"/src/child.js",
    app = express();


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

    app.post('/reset', function(req,res){

        //Validate this is a push event
        if (req.header('X-Github-Event') !== "push"){
            return res.status(304).send("ignored");
        }
        //Read in post body to generate cryptography key
        var hmac = require('crypto').createHmac('sha1', pkg.secret);
        req.setEncoding('utf8');
        req.on('data', function(chunk){
            hmac.update(chunk);
        });
        req.on('end', function(){

            //Validate Signature header
            if (req.header('X-Hub-Signature').indexOf(hmac.digest('hex')) == -1){
               return res.status(400).send("unauthorized");
            }

            console.log("RESETTING");
            //Update and restart spacewars service
            cp.exec("sudo /bin/bash /usr/bin/reset-spacewars.sh", function (error, stdout, stderr){
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
            res.status(200).send("success");
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express "+app.get('env')+" server listening on port "+app.get('port'));

    process.on('uncaughtException', function(error) {
        console.error("Uncaught Exception: "+error.stack);
    });
});

if (process.env.DEBUG){
    require(childPath);
    return;
}

(function createChild(){
    var child = cp.fork(childPath);
    child.once('exit', function(){
        console.log("Restarting child process");
        createChild();
    });
})();
