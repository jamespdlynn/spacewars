define(['createjs','model/gameData'],function(createjs,gameData){
    'use strict';

    var RADIUS = 100;

    var Container = createjs.Container();
    var Shape = createjs.Shape();
    var markCanvas;

    (function(){
        var mark = new Shape();
        mark.graphics.beginFill("rgba(255,0,0,0.8").drawCircle(0, 0, 4);
        mark.shadow = createjs.Shadow("rgba(255,0,0,0.5)", 0, 0 ,2);
        mark.cache(0, 0, 8, 8);
        markCanvas = markCanvas.cacheCanvas;
    })();

    var Radar = function (){
        this.initialize();
    };

    Radar.prototype = new Container();

    extend.call(Radar.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.background = new Shape();
            this.background.graphics.beginFill("#294C22").drawCircle(0, 0, RADIUS);
            this.background.alpha = 0.8;
            this.background.cache(0, 0, RADIUS*2, RADIUS*2);

            this.addChild(this.background);
        },

        addMark : function(ship){
            var mark = new Shape();
            mark.cacheCanvas = markCanvas;
            mark.ship = ship;
            self.addChild(mark);
        },

        removeMark : function(ship){
            var i = this.children.length;
            while (--i > 0){
                if (this.getChildAt(i).ship === ship){
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
                mark.x = (userData.posX - mark.ship.x) / divider;
                mark.y = (userData.posY - mark.ship.y) / divider;
            }
        }

    });

    return Radar;
});