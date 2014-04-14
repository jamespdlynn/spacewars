define(['createjs','view/sprite','model/constants','model/game'],function(createjs, Sprite, Constants,gameData){
    'use strict';

    var ROTATION_RATE = 300;
    var Container =  createjs.Container;

    var StarShip = function(){};
    StarShip.prototype = new Container();

    extend.call(StarShip.prototype, Sprite.prototype, {

        initialize : function(){

           Container.prototype.initialize.call(this);

            var width = Constants.Player.width;
            var height = Constants.Player.height;
            var shieldPadding = Constants.Player.shieldPadding;

            this.mouseEnabled = false;

            this.shipBody.tickEnabled = false;
            this.shipBody.x = -width/2;
            this.shipBody.y = -height/2;

            this.flame1 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame1.x = 0;
            this.flame1.y = (height/2)-10;
            this.flame1.visible = false;

            this.flame2 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame2.x = -15;
            this.flame2.y = (height/2)-10;
            this.flame2.visible = false;

            this.shield = new createjs.Shape();
            this.shield.graphics.setStrokeStyle(2).beginRadialGradientStroke(["rgba(255,255,255,0.75)", getColorString(this.shieldColor, 0.75)], [0, 1], 40, 40, 5, 40, 40, 75)
                .beginRadialGradientFill(["rgba(255,255,255,0.25)", getColorString(this.shieldColor, 0.25)], [0, 1], 40, 40, 5, 40, 40, 75)
                .drawEllipse(-width/2-shieldPadding, -height/2-shieldPadding+2, width+(shieldPadding*2), height+(shieldPadding*2))
                .endStroke();
            this.shield.shadow = new createjs.Shadow(getColorString(this.shieldColor, 1), 0, 0, 5);
            this.shield.cache(-width/2-shieldPadding-6, -height/2-shieldPadding-6, width+(shieldPadding*2)+12, height+(shieldPadding*2)+12);

            this.sparks = new createjs.Sprite(this.sparkSprites, "play");
            this.sparks.x = -width/2;
            this.sparks.y = -height/2;

            this.volume = this.volume || 1;
            this.shieldSound = createjs.Sound.createInstance("shieldSound");
            this.shieldBreakSound = createjs.Sound.createInstance("shieldBreakSound");
            this.exhaustSound = createjs.Sound.play("exhaustSound", {volume:0, loop:-1});

            this.addChild(this.flame1, this.flame2, this.shipBody, this.shield, this.sparks);
        },

        setModel : function(model){

            Sprite.prototype.setModel.call(this, model);

            this.rotation = Math.toDegrees(model.get("angle")) + 90;

            if (model.get("isShielded")){
                this.shield.alpha = 1;
                this.shield.scaleX = 1;
                this.shield.scaleY = 1;
                this.shield.visible = true;
                this.shieldVisible = true;
            }else{
                this.shield.alpha = 0;
                this.shield.scaleX = 0;
                this.shield.scaleY = 0;
                this.shield.visible = false;
                this.shieldVisible = false;
            }

        },

        _tick : function(evt){

            Sprite.prototype._tick.call(this,evt);

            var data = this.model.data;
            var angle  = this.hasOwnProperty('angle') ? Math.toDegrees(this.angle) : Math.toDegrees(data.angle);
            angle += 90;

            if (this.rotation != angle){
                var angleStep = ROTATION_RATE*(evt[0].delta/1000);
                var deltaAngle = angleDiff(this.rotation, angle);
                if (deltaAngle > angleStep){
                    if (angleDiff(this.rotation+angleStep, angle) < deltaAngle){
                       this.rotation += angleStep;
                    }else{
                       this.rotation -= angleStep;
                    }
                }else{
                    this.rotation = angle;
                }
            }

            if (data.isAccelerating){
                this.flame1._tick(evt);
                this.flame2._tick(evt);

                if (!this.flame1.visible){
                    this.flame1.visible = this.flame2.visible = true;
                    createjs.Tween.get(this.exhaustSound,{override:true}).to({volume:getRelativeVolume(this.model)}, 200);
                }

                if (!createjs.Tween.hasActiveTweens(this.exhaustSound)){
                    setRelativeVolume(this.exhaustSound, this.model);
                }
            }
            else if (this.flame1.visible){
                this.flame1.visible = this.flame2.visible = false;
                createjs.Tween.get(this.exhaustSound,{override:true}).to({volume:0}, 200);
            }


            if (data.isShielded && !this.shieldVisible){
                this.shield.visible = true;
                createjs.Tween.get(this.shield,{override:true}).to({alpha: 1, scaleX:1, scaleY:1}, 1000,createjs.Ease.backOut);
                playRelativeSound(this.shieldSound, this.model);
                this.shieldVisible = true;
            }
            else if (!data.isShielded && this.shieldVisible){
                createjs.Tween.get(this.shield,{override:true}).to({alpha: 0, scaleX:0, scaleY:0}, 500).call(function(){
                    this.visible = false;
                });
                if (data.isShieldBroken){
                    playRelativeSound(this.shieldBreakSound, this.model);
                }
                this.shieldVisible = false;
            }

            if (data.isShieldBroken){
                this.sparks._tick(evt);
                this.sparks.visible = true;
            }else{
                this.sparks.visible = false;
            }

            this.alpha = data.isInvulnerable ? 0.4 : 1;
        },

        destroy : function(){
            Sprite.prototype.destroy.call(this);
            this.exhaustSound.stop();
        }
    });


    //Calculates the delta between two angles
    function angleDiff(angle1, angle2){
        var deltaAngle = angle1-angle2;
        while (deltaAngle < -180) deltaAngle += 360;
        while (deltaAngle > 180) deltaAngle -= 360;
        return Math.abs(deltaAngle);
    }

    function getColorString(obj, alpha){
        return "rgba("+obj.r+","+obj.g+","+obj.b+","+alpha+")";
    }

    return StarShip;
});