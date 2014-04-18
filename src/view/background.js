define(['createjs','model/game'],function(createjs, gameData){
    'use strict';

    var Shape = createjs.Shape;

    var BackgroundImage = function (){
        this.initialize();
    };

    BackgroundImage.prototype = new Shape();

    extend.call(BackgroundImage.prototype, {

        initialize : function(){
            this.graphics.beginBitmapFill(preloader.getResult('background')).drawRect(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            this.cache(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
        },

        _tick : function(){
            this.x = gameData.offsetX;
            this.y = gameData.offsetY;
        }
    });

    return BackgroundImage;
});