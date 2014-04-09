define(['createjs','model/game','model/constants'],function(createjs,gameData,Constants){
    'use strict';

    var RADIUS = 90;
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
            this.background.cache(-RADIUS-2, -RADIUS-2, RADIUS*2+4, RADIUS*2+4);


            this.revealer = new Shape();
            this.revealer.graphics.beginLinearGradientFill(["rgba(132,215,81,1)","rgba(132,215,81,0)"],[1,0], RADIUS, 0, 0, RADIUS*0.75)
                                  .lineTo(RADIUS, 0).arc(0,0,RADIUS,0,Math.PI/4,false).lineTo(0,0);
            this.revealer.cache(0, 0, RADIUS, RADIUS);
            this.revealer.rotation = 270;

            var mark = new Shape();
            mark.graphics.beginFill("#E00A06").drawCircle(0, 0, 4);
            mark.cache(-5, -5, 10, 10);
            this.markCanvas = mark.cacheCanvas;

            this.rotationStep = 360 * (1000/ROTATION_TIME/Constants.FPS);

            this.addChild(this.background, this.revealer);
        },

        addMark : function(model){
            var mark = new Shape();
            mark.cacheCanvas = this.markCanvas;
            mark.model = model;
            mark.regX = mark.regY = 5;
            this.addChild(mark);
        },

        removeMark : function(model){

            var i = this.children.length;
            while (--i > 1){
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

            while (--i > 1){
                var mark = this.getChildAt(i);
                var data = mark.model.zoneAdjustedPosition(gameData.zone);
                mark.x =  (data.posX - userData.posX) / divider;
                mark.y = (data.posY - userData.posY) / divider;

                var angle = toDegrees(Math.atan2(mark.y, mark.x));
                if (angle < 0) angle += 360;

                console.log(this.revealer.rotation);

                if (angle >=  this.revealer.rotation && angle <=  this.revealer.rotation+45){
                    mark.alpha = 1;
                }else{
                    mark.alpha -= 1/(360/this.rotationStep);
                }
            }


        }

    });

    return Radar;
});