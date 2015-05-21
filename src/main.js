'use strict';

//noinspection Annotator
require.config({
    paths : {
        'tpl' : 'templates',
        'txt' : 'vendor/text',

        'binaryjs' : 'vendor/binary.min',
        'microjs' : 'vendor/micro',
        'browser-buffer' : 'vendor/browser-buffer',
        'handlebars' : 'vendor/handlebars-v3.0.3',

        'createjs' : 'vendor/easeljs-0.7.1.combined',
        'preloadjs' : 'vendor/preloadjs-0.4.1',
        'soundjs' : 'vendor/soundjs-0.5.2',
        'tweenjs' : 'vendor/tweenjs-0.5.1'
    },

    shim : {
        'createjs' : {
            deps : ['preloadjs','soundjs','tweenjs'],
            exports : 'createjs'
        },
        'browser-buffer' : {
            exports : 'Buffer'
        },
        'handlebars' : {
            exports : 'Handlebars'
        }
    },

    deps: ['browser-buffer']
});

(function(){
    window.extend = function(add){
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

    if ("mozHidden" in document) document.isHidden = function(){return document.mozHidden};
    else if ("webkitHidden" in document) document.isHidden = function(){return document.webkitHidden};
    else if ("msHidden" in document) document.isHidden = function(){return document.msHidden};
    else document.isHidden = function(){return document.hidden};


    document.documentElement.requestFullScreen = document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullscreen || document.documentElement.msRequestFullscreen;
    document.exitFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
    document.isFullScreen = function(){
        return !!(document.fullscreenElement  || document.mozFullScreenElement  || document.webkitFullscreenElement);
    };

    HTMLElement.prototype.show = function(inline){
        this.setAttribute("style",  inline ? "display:inline-block" : "display:block");
    };

    HTMLElement.prototype.hide = function(){
        this.setAttribute("style", "display:none");
    };

    window.oncontextmenu = function(){
        return false;
    };

    Math.toDegrees = function(angle){
        return (angle*(180/Math.PI));
    };

    Math.getDistance = function(x1, y1, x2, y2){
        var dx =  x1 - (x2 || 0);
        var dy =  y1 - (y2 || 0);
        return Math.sqrt((dx*dx)+(dy*dy));
    };
})();


//Main require function
require(['view/modals','view/game','control/client','model/constants','model/game'],
    function( ModalsView, GameView, Client, Constants, GameData){
        'use strict';

        if (!window.HTMLCanvasElement){
            return ModalsView.showUnsupportedBrowserModal();
        }

        window.gameData = new GameData();

        //Load user from local storage
        gameData.user = JSON.parse(localStorage.getItem("user")) || gameData.user;
        gameData.user.id = getCookie('userId') || gameData.user.id;
        gameData.on(Constants.Events.USER_CHANGED, function(){
            localStorage.setItem("user", JSON.stringify(gameData.user));
        });

        var client = new Client(gameData);

        gameData.on(Constants.Events.DEPLOY, function(){
            ModalsView.setConnecting(true);
            client.run(window.location.hostname);
        });

        gameData.on(Constants.Events.CONNECTED, function(){
           ModalsView.removeModal().setConnecting(false);
           GameView.run();
        });

        gameData.on(Constants.Events.DISCONNECTED, function(){
            client.stop();

            if (GameView.isRunning){
                GameView.reset();
                ModalsView.showDisconnectedModal();
            }else{
                ModalsView.setConnecting(false).showConnectionFailedModal();
            }

            gameData.reset();
        });

        gameData.on(Constants.Events.GAME_START, function(){
            ModalsView.setConnecting(false);
            document.getElementById("version").hide();

            if (!gameData.user.hasPlayed){
                ModalsView.showAboutModal();
                gameData.user.hasPlayed = true;
                gameData.trigger(Constants.Events.USER_CHANGED);
            }

        });

        gameData.on(Constants.Events.GAME_ENDING, function(slayer){
           GameView.end();
           ModalsView.showDeathModal(slayer);
        });


        gameData.on(Constants.Events.GAME_END, function(){
            client.stop();
            GameView.reset();
            gameData.reset();
        });

        ModalsView.initialize();
        GameView.initialize();
    }


);

function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name) {
            return decodeURI(y);
        }
    }
}