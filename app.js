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

    //Don't rebuild html file in debug mode as there's a bug with the jade library
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

        var data = "";
        req.setEncoding('utf8');
        req.on('data', function(chunk){
            data += 'chunk';
        });
        req.on('end', function(){

            //Ignore pushes that don't include changes to the package.json file
            if (data.indexOf('package.json') ==  -1){
                return res.status(304).send("ignored");
            }

            //Use the post body as a cryptography key and check the hash output against the signature in the packet header
            var hash = require('crypto').createHmac('sha1', pkg.secret).update(data).digest('hex');
            if (req.header('X-Hub-Signature').indexOf(hash) == -1){
                return res.status(400).send("unauthorized");
            }

            res.status(200).send("success");

            //Update and restart spacewars service
            cp.exec("sudo bash reset.sh");
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express "+app.get('env')+" server listening on port "+app.get('port'));

    process.on('uncaughtException', function(error) {
        console.error("Uncaught Exception: "+error.stack);
        setTimeout(function(){
            cp.exec("sudo restart spacewars"); //Restart spacewars service
        }, 1000);
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
        setTimeout(createChild, 1000);
    });
})();
