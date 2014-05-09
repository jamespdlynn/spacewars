define(['createjs','model/game'],function(createjs,gameData){
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
            //this.regX = this.regY = -RADIUS;

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

            this.userMark = new Shape();
            this.userMark.model = gameData.userPlayer;
            this.userMark.graphics.beginFill("#3076C2").drawCircle(0,0,4.5);
            this.userMark.shadow = new createjs.Shadow("#3076C2", 0, 0, 2);
            this.userMark.cache(-6, -6, 12, 12);

            this.enemyMark = new Shape();
            this.enemyMark.graphics.beginFill("rgb(200,0,0)").drawCircle(0,0,4.5);
            this.enemyMark.shadow = new createjs.Shadow("rgb(200,0,0)", 0, 0, 2);
            this.enemyMark.cache(-6, -6, 12, 12);

            this.addChild(this.background, this.revealer, this.userMark);
            this.setBounds(0, 0, RADIUS*2, RADIUS*2);
        },

        addMark : function(model){
            var mark = new Shape();
            mark.cacheCanvas = this.enemyMark.cacheCanvas;
            mark.model = model;
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

        _tick : function(evt){
            var rotationStep = 360 * (evt[0].delta/ROTATION_TIME);
            var centerX = (gameData.width/2) - gameData.offsetX + window.paddingX;
            var centerY = (gameData.height/2) - gameData.offsetY + window.paddingY;

            this.revealer.rotation += rotationStep;
            this.revealer.rotation %= 360;

            var i = this.children.length;
            while (--i > 1){
                var mark = this.getChildAt(i);

                if (mark !== this.userMark){

                    var data = mark.model.zoneAdjustedPosition(gameData.zone);
                    mark.x = (data.posX - centerX) / (gameData.width * 2 / RADIUS);
                    mark.y = (data.posY - centerY) /  (gameData.height * 2 / RADIUS);

                    var angle = Math.toDegrees(Math.atan2(mark.y, mark.x));
                    if (angle < 0) angle += 360;

                    if (angle >= this.revealer.rotation && angle <= this.revealer.rotation+45){
                        mark.alpha = 1;
                    }else{
                        mark.alpha -= 1/(315/rotationStep);
                    }
                }
            }

        }

    });

    return Radar;
});