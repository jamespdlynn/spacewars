define(['createjs','model/game'],function(createjs, gameData){
    'use strict';

    var Container = createjs.Container;

    var Background = function (){
        this.initialize();
    };

    Background.prototype = new Container();

    extend.call(Background.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.image = new createjs.Shape();
            this.image.tickEnabled = false;
            this.image.graphics.beginBitmapFill(preloader.getResult('background')).drawRect(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            this.image.cache(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            this.addChild(this.image);
        },

        cache : function(){
           Container.prototype._tick.call(this);
           Container.prototype.cache.call(this,-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
        },

        _tick : function(){
            this.x = gameData.offsetX;
            this.y = gameData.offsetY;
            this._cacheWidth = this.width;
            this._cacheHeight = this.height;
        }
    });

    return Background;
});