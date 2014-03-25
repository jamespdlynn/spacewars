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
            this.flame1.visible = false;

            this.flame2 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame2.x = -20;
            this.flame2.y = (height/2)-12.5;
            this.flame2.visible = false;

            this.shield = new createjs.Shape();
            this.shield.graphics.setStrokeStyle(2).beginRadialGradientStroke(["rgba(255,255,255,0.75)", getColorString(this.shieldColor, 0.75)], [0, 1], 40, 40, 5, 40, 40, 75)
                .beginRadialGradientFill(["rgba(255,255,255,0.25)", getColorString(this.shieldColor, 0.25)], [0, 1], 40, 40, 5, 40, 40, 75)
                .drawEllipse(-width/2-shieldPadding, -height/2-shieldPadding+2, width+(shieldPadding*2), height+(shieldPadding*2))
                .endStroke();
            this.shield.shadow = new createjs.Shadow(getColorString(this.shieldColor, 1), 0, 0, 2);
            this.shield.cache(-width/2-shieldPadding-5, -height/2-shieldPadding-3, width+(shieldPadding*2)+10, height+(shieldPadding*2)+10);

            this.sparks = new createjs.Sprite(this.sparkSprites, "play");
            this.sparks.x = -width/2;
            this.sparks.y = -height/2;

            this.volume = this.volume || 1;
            this.shieldSound = createjs.Sound.createInstance("shieldSound");
            this.shotSound = createjs.Sound.createInstance("shotSound");
            this.shieldBreakSound = createjs.Sound.createInstance("shieldBreakSound");
            this.exhaustSound = createjs.Sound.play("exhaustSound", {volume:0, loop:-1});

            this.addChild(this.flame1, this.flame2, this.shipBody, this.shield, this.sparks);
            this.setBounds(-width/2, -height/2, width, height);
        },

        setModel : function(model){

            this.model = model;
            this.rotation = toDegrees(model.get("angle"));

            if (model.get("isShielded")){
                this.shield.alpha = 1;
                this.shield.scaleX = 1;
                this.shield.scaleY = 1;
                this.shield.visible = true;
            }else{
                this.shield.alpha = 0;
                this.shield.scaleX = 0;
                this.shield.scaleY = 0;
                this.shield.visible = false;
            }


        },

        _tick : function(evt){

            var data = this.model.update().data;

            this.scaleX = gameData.scaleX;
            this.scaleY = gameData.scaleY;

            this.x = data.posX * this.scaleX;
            this.y = data.posY * this.scaleY;

            var angle  = this.hasOwnProperty('angle') ? this.angle : data.angle;
            angle = toDegrees(angle);

            if (this.rotation != angle){
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

            if (data.isAccelerating){
                this.flame1._tick(evt);
                this.flame2._tick(evt);

                if (!this.flame1.visible){
                    this.flame1.visible = this.flame2.visible = true;
                    this.exhaustSound.resume();
                    createjs.Tween.get(this.exhaustSound,{override:true}).to({volume:this.volume}, 200);
                }
            }
            else if (this.flame1.visible){
                 this.flame1.visible = this.flame2.visible = false;
                 createjs.Tween.get(this.exhaustSound,{override:true}).to({volume:0}, 200);
            }


            if (data.isShielded && !this.shield.visible && !createjs.Tween.hasActiveTweens(this.shield)){
                this.shield.visible = true;
                createjs.Tween.get(this.shield).to({alpha: 1, scaleX:1, scaleY:1}, 1000,createjs.Ease.backOut);
                this.shieldSound.play({volume:this.volume});
            }
            else if (!data.isShielded && this.shield.visible && !createjs.Tween.hasActiveTweens(this.shield)){
                createjs.Tween.get(this.shield).to({alpha: 0, scaleX:0, scaleY:0}, 200,createjs.Ease.linear).call(function(){
                    this.visible = false;
                });
                if (data.isShieldBroken){
                    this.shieldBreakSound.play({volume:this.volume});
                }
            }

            if (data.isShieldBroken){
                this.sparks._tick(evt);
                this.sparks.visible = true;
            }else{
                this.sparks.visible = false;
            }

            this.alpha =  data.isInvulnerable ? 0.4 : 1;
        },


        fire : function(){
            this.shotSound.play({volume:this.volume});
        },

        destroy : function(){
            this.exhaustSound.stop();
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