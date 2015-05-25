// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.
var http = require("http"),
    express = require("express"),
    passport = require("passport"),
    less = require("less-middleware");

var mongoose = require('./config/database')();
require('./config/passport')(passport);

var MongoStore = require('connect-mongo')(express);
var app = express();

app.set('env', process.argv[2] || process.env.NODE_ENV || 'production');
app.set('port', process.argv[3] || process.env.PORT || '80');

app.configure(function(){
    app.use(express.favicon());
    app.use(express.cookieParser());
    app.use(express.session({
        secret:'h@t3rsg0nnah@te',
        store:new MongoStore({mongooseConnection:mongoose.connection}),
        cookie: { maxAge: 2592000000 }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
});

app.configure('development', function() {

    app.use(express.logger('dev'));
    app.use(express.errorHandler());

    app.use(less(__dirname+'/less',{
        preprocess: {
            path: function(pathname) {
                return pathname.replace(/\/css\//, '/').replace(/\\css\\/, '\\');
            },
            less : function(src){
                return '@assets: "/assets";'+src;
            }
        },
        dest : __dirname + '/public',
        debug : true,
        force : true
    }));

    app.use(express.static(__dirname+"/public"));

    app.use(express.static(__dirname+"/src"));
});

app.configure('production', function(){

    var assetsURL = "http://dazx2ug0v9sfb.cloudfront.net/";

    app.use(less(__dirname+'/less',{
        preprocess: {
            path: function(pathname) {
                return pathname.replace(/\/css\//, '/').replace(/\\css\\/, '\\');
            },
            less : function(src){
                return '@assets: "'+assetsURL+'";'+src;
            }
        },
        dest : __dirname + '/public',
        compress : true,
        once : true
    }));

    app.use(express.static(__dirname+"/public"));


    require('requirejs').optimize({
        baseUrl : __dirname+"/src",
        name : 'main',
        mainConfigFile : __dirname+"/src/main.js",
        findNestedDependencies : true,
        out : __dirname+"/public/main.js",
        preserveLicenseComments : false
    });
});

require('./config/routes')(app, passport);

app.listen(app.get('port'), function(){
    console.log("Express "+app.get('env')+" server listening on port "+app.get('port'));
});

if ('production' != app.get('env')){
    require(__dirname+"/src/game.js");
}

