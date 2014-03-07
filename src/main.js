require.config({
    paths : {
        'tpl' : 'templates',
        'txt' : 'vendor/text',

        'binaryjs' : 'vendor/binary',
        'microjs' : 'vendor/micro',
        'browser-buffer' : 'vendor/browser-buffer',

        'createjs' : 'vendor/easeljs-0.7.1.combined',
        'preloadjs' : 'vendor/preloadjs-0.4.1',
        'soundjs' : 'vendor/soundjs-0.5.2'
    },

    shim : {
        'createjs' : {
            deps : ['preloadjs','soundjs'],
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
})();


//Main require function
require(['view/modals','view/game','socket/client', 'model/constants','model/game'],
    function( ModalsView, GameView, Client, Constants, gameData){

        if ('ontouchstart' in document.documentElement){
            return ModalsView.setConnecting(false).showUnsupportedDeviceModal();
        }

        if (!window.HTMLCanvasElement || typeof document.documentMode == "number" || eval("/*@cc_on!@*/!1")){
            return ModalsView.setConnecting(false).showUnsupportedBrowserModal();
        }

        gameData.on(Constants.Events.DEPLOY, function(){
            ModalsView.setConnecting(true).removeModal();
            Client.run();
        });

        gameData.on(Constants.Events.CONNECTED, function(){
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

            gameData.reset();
        });

        gameData.on(Constants.Events.GAME_START, function(){
            ModalsView.setConnecting(false);
        });

        gameData.on(Constants.Events.GAME_END, function(){
            Client.stop();
            GameView.reset();
            ModalsView.showDeathModal();
            gameData.reset();
        });

        GameView.initialize();

        if (!gameData.isUserInitialized()){
            ModalsView.setConnecting(false).showWelcomeModal();
        }else{
            Client.run();
        }


    }
);
