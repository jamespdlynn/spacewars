define(['createjs','model/constants','model/game'],function(createjs, Constants,gameData){

    var ANGLE_STEP = 300/Constants.FPS;
    var Container = createjs.Container;

    var StarShip = function (){};

    StarShip.prototype = new Container();

    extend.call(StarShip.prototype, {

        initialize : function(){

            this.mouseEnabled = false;

            Container.prototype.initialize.call(this);

            var width = Constants.Player.width;
            var height = Constants.Player.height;
            var shieldPadding = Constants.Player.shieldPadding;

            this.shipBody.tickEnabled = false;
            this.shipBody.x = -width/2;
            this.shipBody.y = -height/2;

            this.flame1 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame1.x = 0;
            this.flame1.y = (height/2)-12.5;

            this.flame2 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame2.x = -20;
            this.flame2.y = (height/2)-12.5;

            this.flame1.visible = this.flame2.visible = false;



            this.shield = new createjs.Shape();
            this.shield.x = 0;
            this.shield.y = -height/2;

            this.shield.graphics.setStrokeStyle(6).beginLinearGradientStroke([getColorString(this.shieldColor, 0.2),getColorString(this.shieldColor, 1)], [0, 1], 0, shieldRadiusY, 0, -shieldRadiusY)
                .drawEllipse (0, 0, width+(shieldPadding*2), height+(shieldPadding*2))
                .endStroke();

            this.shield.tween = createjs.Tween.get(this.shield, {loop:true})
                                               .to({alpha: 0.5, scaleX:0.8, scaleY:0.8}, 300,createjs.Ease.linear)
                                               .to({alpha: 0.9, scaleX:1, scaleY:1}, 300,createjs.Ease.linear)
                                               .setPaused(true);

            this.shield.shadow = new createjs.Shadow(getColorString(this.shieldColor, 1), 0, -1, 4);
            this.shield.visible = false;

            this.volume = 1;
            this.shotSound = createjs.Sound.createInstance("shotSound");

            this.shieldSound = createjs.Sound.play("shieldSound", {loop:-1, volume:1});

            this.rotationSet = false;

            this.addChild(this.flame1, this.flame2, this.shipBody, this.shield);
            this.setBounds(-width/2, -height/2, width, height);
        },

        _tick : function(evt){

            var data = this.model.update().data;

            this.scaleX = gameData.scaleX;
            this.scaleY = gameData.scaleY;

            this.x = data.posX * this.scaleX;
            this.y = data.posY * this.scaleY;

            var angle  = this.hasOwnProperty('angle') ? this.angle : data.angle;
            angle = toDegrees(angle);

            if (!this.rotationSet){
                this.rotation = angle;
                this.rotationSet = true;
            }
            else if (this.rotation != angle){
                var deltaAngle = angleDiff(this.rotation, angle);
                if (deltaAngle > ANGLE_STEP){
                    if (angleDiff(this.rotation+ANGLE_STEP, angle) < deltaAngle){
                       this.rotation += ANGLE_STEP;
                    }else{
                       this.rotation -= ANGLE_STEP;
                    }
                }else{
                    this.rotation = angle;
                }
            }

            var isAccelerating = this.hasOwnProperty("isAccelerating") ? this.isAccelerating : data.isAccelerating;

            if (isAccelerating){

                if (!this.flame1.visible){
                    this.flame1.visible = this.flame2.visible = true;
                    this.exhaustSound = createjs.Sound.play("exhaustSound", {loop:-1, volume:0});
                    createjs.Tween.get(this.exhaustSound, {override:true}).to({volume:1}, 200);
                }

                this.flame1._tick(evt);
                this.flame2._tick(evt);
            }
            else if (this.flame1.visible){
                this.flame1.visible = this.flame2.visible = false;
                createjs.Tween.get(this.exhaustSound, {override:true}).to({volume:0}, 200).call(function(){
                     this.stop();
                });
            }

            var isShielded = this.hasOwnProperty("isShielded") ? this.isShielded : data.isShielded;

            if (isShielded && !this.shield.visible){
                this.shield.visible = true;
                this.shield.tween.setPaused(false);
                this.shieldSound = createjs.Sound.play("shieldSound", {loop:-1, volume:0});
                createjs.Tween.get(this.shieldSound, {override:true}).to({volume:0.4}, 200);
            }
            else if (!isShielded && this.shield.visible){
                this.shield.visible = false;
                this.shield.tween.setPaused(true);
                createjs.Tween.get(this.shieldSound, {override:true}).to({volume:0}, 200).call(function(){
                    this.stop();
                });
            }

            this.alpha =  data.isInvulnerable ? 0.4 : 1;
        },


        fire : function(){
            this.shotSound.play({volume:this.volume});
        },

        destroy : function(){
            this.exhaustSound.stop();
            this.shieldSound.stop();
        }
    });

    function toDegrees(angle){
        return (angle*(180/Math.PI)) + 90;
    }

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