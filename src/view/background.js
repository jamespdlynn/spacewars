define(['createjs','model/gameData'],function(createjs, gameData){
    'use strict';

    var Shape = createjs.Shape;

    var Background = function (){
        this.initialize();
    };

    Background.prototype = new Shape();

    extend.call(Background.prototype, {

        initialize : function(){
            this.graphics.beginBitmapFill(preloader.getResult('background')).drawRect(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            this.cache(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
        },

        _tick : function(){
            this.x = gameData.offsetX;
            this.y = gameData.offsetY;
        }
    });

    return Background;
});