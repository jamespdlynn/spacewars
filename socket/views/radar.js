define(['createjs','models/constants'],function(createjs, Constants){
    'use strict';

    var RADIUS = 84;
    var SECTION = RADIUS/3;
    var MARK_RADIUS = 4.5;
    var ROTATION_TIME = 2000;

    var OUTER_DISTANCE =  Math.getDistance(Constants.Zone.width*2, Constants.Zone.height*2);
    var MIDDLE_DISTANCE = OUTER_DISTANCE/2;
    var INNER_DISTANCE = OUTER_DISTANCE/5;

    var Container = createjs.Container;
    var Shape = createjs.Shape;


    var Radar = function (){
        this.initialize();
    };

    Radar.prototype = new Container();

    extend.call(Radar.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

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
            this.userMark.graphics.beginFill("#3076C2").drawCircle(0,0,MARK_RADIUS);
            this.userMark.shadow = new createjs.Shadow("#3076C2", 0, 0, 2);
            this.userMark.cache(-MARK_RADIUS-1, -MARK_RADIUS-1, MARK_RADIUS*2+2, MARK_RADIUS*2+2);

            this.enemyMark = new Shape();
            this.enemyMark.graphics.beginFill("rgb(200,0,0)").drawCircle(0,0,MARK_RADIUS);
            this.enemyMark.shadow = new createjs.Shadow("rgb(200,0,0)", 0, 0, 2);
            this.enemyMark.cache(-MARK_RADIUS-1, -MARK_RADIUS-1, MARK_RADIUS*2+2, MARK_RADIUS*2+2);

            this.addChild(this.background, this.revealer, this.userMark);
            this.setBounds(0, 0, RADIUS*2, RADIUS*2);
        },

        addMark : function(model){
            var mark = new Shape();
            mark.cacheCanvas = this.enemyMark.cacheCanvas;
            mark.regX = mark.regY = MARK_RADIUS;
            mark.alpha = 0;
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

            var revealer = this.revealer;
            var rotationStep = 360 * (evt[0].delta/ROTATION_TIME);

            var centerX = (gameData.width/2) - gameData.offsetX + window.paddingX;
            var centerY = (gameData.height/2) - gameData.offsetY + window.paddingY;

            //Rotate Revealer
            revealer.rotation += rotationStep;
            revealer.rotation %= 360;

            var i = this.children.length;
            while (--i > 1){
                var mark = this.getChildAt(i);

                var data = mark.model.zoneAdjustedPosition(gameData.zone);
                var distance = Math.getDistance(data.posX , data.posY, centerX, centerY);
                var angle = Math.atan2(data.posY-centerY, data.posX-centerX);

                //Calculate the actual mark distance from the center of the radar (this fluctuates depending on the section it falls in)
                if (distance <= INNER_DISTANCE){
                    distance =  distance / INNER_DISTANCE * SECTION;
                }
                else if (distance <= MIDDLE_DISTANCE){
                    distance = SECTION + ((distance-INNER_DISTANCE) / (MIDDLE_DISTANCE-INNER_DISTANCE) * SECTION);
                }
                else{
                    distance = (SECTION*2) + ((distance-MIDDLE_DISTANCE) / (OUTER_DISTANCE-MIDDLE_DISTANCE) * SECTION);
                    distance = Math.min(distance, RADIUS);
                }

                //Position the mark
                mark.x = Math.cos(angle) * distance
                mark.y = Math.sin(angle) * distance;

                if (mark !== this.userMark){
                    //Translate mark angle to degrees
                    angle = Math.toDegrees(angle);
                    if (angle < 0) angle += 360;

                    //Set mark alpha to 1 if it is positioned within the revealer, otherwise fade it out
                    if (angle >= revealer.rotation && angle <= revealer.rotation+45){
                        mark.alpha = 1;
                    }else{
                        mark.alpha -= 1/(360/rotationStep);
                    }
                }
            }

        }

    });

    return Radar;
});