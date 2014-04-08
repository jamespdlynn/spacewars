define(['createjs','model/game','model/constants'],function(createjs,gameData,Constants){
    'use strict';

    var RADIUS = 100;
    var ROTATION_TIME = 2000;

    var Container = createjs.Container;
    var Shape = createjs.Shape;

    var Radar = function (){
        this.initialize();
    };

    Radar.prototype = new Container();

    extend.call(Radar.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.alpha = 0.8;
            this.regX = this.regY = -RADIUS;

            this.background = new Shape();
            this.background.graphics.beginStroke("#74AC52").beginFill("#294C22").drawCircle(0, 0, RADIUS).endFill()
                                    .drawCircle(0, 0, RADIUS/3).drawCircle(0, 0, 2*RADIUS/3)
                                    .moveTo(-RADIUS, 0).lineTo(RADIUS,0).moveTo(0, -RADIUS).lineTo(0, RADIUS);
            this.background.cache(-RADIUS, -RADIUS, RADIUS*2, RADIUS*2);

            var xTo = Math.cos(Math.PI/4) * RADIUS;
            var yTo = -Math.sin(Math.PI/4) * RADIUS;

            this.revealer = new Shape();
            this.revealer.graphics.beginLinearGradientFill(["rgba(132,215,81,1)","rgba(132,215,81,0)"],[1,0], RADIUS, 0, xTo, yTo)
                              .lineTo(RADIUS, 0).lineTo(xTo, yTo).endFill();
            this.revealer.graphics.cache(0, yTo, RADIUS, -yTo);
            this.revealer.rotation = 90;

            var mark = new Shape();
            mark.graphics.beginFill("##E00A06").drawCircle(0, 0, 3);
            mark.shadow = new createjs.Shadow("##E00A06", 0, 0 ,2);
            mark.cache(-5, -5, 10, 10);
            this.markCanvas = mark.cacheCanvas;

            this.rotationStep = 360 * (ROTATION_TIME/1000/Constants.FPS);

            this.addChild(this.background, this.revealer);
        },

        addMark : function(model){
            var mark = new Shape();
            mark.cacheCanvas = this.markCanvas;
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
            this.revealer.rotation += this.rotationStep;
            this.revealer.rotation %= 360;

            var userData = gameData.userPlayer.data;
            var divider =  gameData.width * 2 / RADIUS;
            var i = this.children.length;

            while (--i > 0){
                var mark = this.getChildAt(i);
                var data = mark.model.zoneAdjustedPosition(gameData.zone);
                mark.x =  (data.posX - userData.posX) / divider;
                mark.y = (data.posY - userData.posY) / divider;

                var angle = toDegrees(Math.atan2(mark.x, mark.y));
                if (angle < 0) angle += 360;

                if (angle <= this.rotation && angle >= this.rotation-45){
                    mark.alpha = 1;
                }else{
                    mark.alpha -= 1/(360/this.rotationStep);
                }
            }


        }

    });

    return Radar;
});