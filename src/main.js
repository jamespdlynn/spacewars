'use strict';

require.config({
    paths : {
        'tpl' : 'templates',
        'txt' : 'vendor/text',

        'binaryjs' : 'vendor/binary.min',
        'microjs' : 'vendor/micro',
        'browser-buffer' : 'vendor/browser-buffer',

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
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt((dx*dx)+(dy*dy));
    };
})();


//Main require function
require(['view/modals','view/game','control/client', 'model/constants','model/game'],
    function( ModalsView, GameView, Client, Constants, gameData){
        'use strict';

        if ('ontouchstart' in document.documentElement){
            return ModalsView.showUnsupportedDeviceModal();
        }

        if (!window.HTMLCanvasElement || typeof document.documentMode == "number" || eval("/*@cc_on!@*/!1")){
            return ModalsView.showUnsupportedBrowserModal();
        }

        gameData.on(Constants.Events.DEPLOY, function(){
            if (gameData.isUserInitialized()){
                ModalsView.setConnecting(true);
                Client.run();
            }else{
                ModalsView.showWelcomeModal();
            }
        });

        gameData.on(Constants.Events.CONNECTED, function(){
           ModalsView.removeModal().setConnecting(false);
           GameView.run();
        });

        gameData.on(Constants.Events.DISCONNECTED, function(){
            Client.stop();

            if (GameView.isRunning){
                GameView.reset();
                ModalsView.showDisconnectedModal();
            }else{
                ModalsView.setConnecting(false).showConnectionFailedModal();
            }

            document.getElementById("version").show();
            document.getElementById("view").hide();

            gameData.reset();
        });

        gameData.on(Constants.Events.GAME_START, function(){
            ModalsView.setConnecting(false);
            document.getElementById("version").hide();
            document.getElementById("view").show();
        });

        gameData.on(Constants.Events.GAME_END, function(){
            Client.stop();
            GameView.reset();
            ModalsView.showDeathModal();
            gameData.incrementDeaths().reset();

            document.getElementById("version").show();
            document.getElementById("view").hide();
        });

        GameView.initialize();
    }
);
