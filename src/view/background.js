define(['createjs','model/game'],function(createjs, gameData){
    'use strict';

    var Stage = createjs.Stage;

    var Background = function (canvas){
        this.initialize(canvas);
    };

    Background.prototype = new Stage();

    extend.call(Background.prototype, {

        initialize : function(canvas){
            Stage.prototype.initialize.call(this, canvas);
            this.enableDOMEvents(false);
            this.mouseChildren = false;

            this.image = new createjs.Shape();
            this.image.tickEnabled = false;
            this.image.graphics.beginBitmapFill(preloader.getResult('background')).drawRect(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            this.image.cache(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);

            this.container = new createjs.Container();
            this.container.addChild(this.image);

            Stage.prototype.addChild.call(this, this.container);
        },

        addChild : function(child){
           this.container.addChild(child);
        },

        removeChild : function(child){
            this.container.removeChild(child);
        },

        cache : function(){
           this.container._tick();
           this.container.cache(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
        },

        _tick : function(){
            this.container.x = gameData.offsetX;
            this.container.y = gameData.offsetY;
        }
    });

    return Background;
});