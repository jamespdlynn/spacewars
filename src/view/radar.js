define(['createjs','model/game'],function(createjs,gameData){
    'use strict';

    var RADIUS = 100;

    var Container = createjs.Container;
    var Shape = createjs.Shape;
    var markCanvas;

    (function(){
        var mark = new Shape();
        mark.graphics.beginFill("rgba(255,0,0,0.8").drawCircle(0, 0, 4);
        mark.shadow = new createjs.Shadow("rgba(255,0,0,0.5)", 0, 0 ,2);
        mark.cache(-5, -5, 10, 10);
        markCanvas = mark.cacheCanvas;
    })();

    var Radar = function (){
        this.initialize();
    };

    Radar.prototype = new Container();

    extend.call(Radar.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.regX = this.regY = -RADIUS;

            this.background = new Shape();
            this.background.graphics.beginFill("#294C22").drawCircle(0, 0, RADIUS);
            this.background.alpha = 0.8;
            this.background.cache(-RADIUS, -RADIUS, RADIUS*2, RADIUS*2);

            this.addChild(this.background);
        },

        addMark : function(model){
            var mark = new Shape();
            mark.cacheCanvas = markCanvas;
            mark.model = model;
            this.addChild(mark);
        },

        removeMark : function(model){
            var i = this.children.length;
            while (--i > 0){
                if (this.getChildAt(i).model.equals(model)){
                    this.removeChildAt(i);
                    break;
                }
            }
        },

        _tick : function(){
            var userData = gameData.userPlayer.data;
            var divider =  gameData.width * 2 / RADIUS;
            var i = this.children.length;

            while (--i > 0){
                var mark = this.getChildAt(i);
                var data = mark.model.zoneAdjustedPosition(gameData.zone);
                mark.x =  (data.posX - userData.posX) / divider;
                mark.y = (data.posY - userData.posY) / divider;
            }


        }

    });

    return Radar;
});