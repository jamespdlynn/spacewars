// Space Wars
// (c) 2014 James Lynn <james.lynn@aristobotgames.com>, Aristobot LLC.
var http = require("http");
var path = require("path");

var express = require("express");
var session = require("express-session");
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var less = require("less-middleware");

var mongoose = require('../config/mongoose');
var passport = require('../config/passport');

var MongoStore = require('connect-mongo')(session);
var app = express();

app.set('env', process.env.NODE_ENV);
app.set('port', process.env.PORT || '80');


app.use(cookieParser());
app.use(session({
    secret:'h@t3rsg0nnah@te',
    store:new MongoStore({mongooseConnection:mongoose.connection}),
    cookie: { maxAge: 2592000000 },
    saveUninitialized : true,
    resave : false
}));

app.use(passport.initialize());
app.use(passport.session());

switch (app.get('env'))
{
    case 'development':
    case 'integration':
    default :
        app.use(errorHandler());

        app.use(less(path.join(__dirname, 'less'),{
            preprocess: {
                path: function(pathname) {
                    return pathname.replace(/\/css\//, '/').replace(/\\css\\/, '\\');
                },
                less : function(src){
                    return '@assets: "/assets";'+src;
                }
            },
            dest : path.join(__dirname, 'public'),
            debug : true,
            force : true
        }));

        app.use(express.static(path.join(__dirname,'public')));
        app.use(express.static(path.join(__dirname,'../socket')));

        require("../socket/app.js");
        break;

    case 'production':
        var assetsURL = "http://dazx2ug0v9sfb.cloudfront.net";

        app.use(less(path.join(__dirname, 'less'),{
            preprocess: {
                path: function(pathname) {
                    return pathname.replace(/\/css\//, '/').replace(/\\css\\/, '\\');
                },
                less : function(src){
                    return '@assets: "'+assetsURL+'";'+src;
                }
            },
            dest : path.join(__dirname, 'public'),
            compress : true,
            once : true
        }));

        app.use(compression());
        app.use(express.static(path.join(__dirname, 'public')));

        require('requirejs').optimize({
            baseUrl :  path.join(__dirname, '../socket'),
            name : 'main',
            mainConfigFile :  path.join(__dirname, '../socket', 'main.js'),
            findNestedDependencies : true,
            out :  path.join(__dirname, 'public','main.js'),
            preserveLicenseComments : false
        });
        break;
}


require('./routes')(app, passport);

app.listen(app.get('port'), function(){
    console.log("Express "+app.get('env')+" server listening on port "+app.get('port'));
});


