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

            this.shipBody.tickEnabled = false;
            this.shipBody.x = -width/2;
            this.shipBody.y = -height/2;

            this.flame1 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame1.x = 0;
            this.flame1.y = (height/2)-12.5;

            this.flame2 = new createjs.Sprite(this.exhaustSprites, "play");
            this.flame2.x = -20;
            this.flame2.y = (height/2)-12.5;


            this.shield = new createjs.Shape();
            this.shield.shadow = new createjs.Shadow(getColorString(this.shieldColor, 1), 0, -1, 3);
            this.shield.visible = false;
            this.shield.alpha = 0.8;
            this.shield.stroke = 4;
            this.shield.tick = 0;
            this._drawShield();

            this.volume = 1;
            this.shotSound = createjs.Sound.createInstance("shotSound");
            this.exhaustSound = createjs.Sound.play("exhaustSound", {loop:-1, volume:0});

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
            var exhaustVolume = this.exhaustSound.getVolume();

            if (isAccelerating){
                this.flame1.visible = this.flame2.visible = true;
                this.flame1._tick(evt);
                this.flame2._tick(evt);

                if (exhaustVolume < this.volume){
                    this.exhaustSound.setVolume(Math.min(exhaustVolume+0.05, this.volume));
                }
            }
            else if (exhaustVolume > 0){
                this.flame1.visible = this.flame2.visible = false;
                this.exhaustSound.setVolume(Math.max(exhaustVolume-0.5,0));
            }

            var isShielded = this.hasOwnProperty("isShielded") ? this.isShielded : data.isShielded;

            if (isShielded){
                this.shield.visible = true;

                if (this.shield.tick >= Constants.FPS/15){
                    if (Math.round(this.shield.stroke*10)%10 == 0){
                        this.shield.stroke -= 1;
                        this.shield.stroke = Math.max(this.shield.stroke, 1.5);
                    }else{
                        this.shield.stroke += 1;
                        this.shield.stroke = Math.min(this.shield.stroke, 4);
                    }

                    this._drawShield();
                    this.shield.tick = 0;
                }
                else{
                    this.shield.tick++;
                }
            }
            else{
                this.shield.visible = false;
            }

            this.alpha =  data.isInvulnerable ? 0.4 : 1;
        },

        _drawShield : function(){

            var shieldRadiusX = (Constants.Player.width+Constants.Player.shieldPadding)/2;
            var shieldRadiusY = (Constants.Player.height+Constants.Player.shieldPadding)/2;

            this.shield.graphics.clear().moveTo(-shieldRadiusX, 0)
                .setStrokeStyle(this.shield.stroke).beginLinearGradientStroke([getColorString(this.shieldColor, 0),getColorString(this.shieldColor, 1)], [0.9, 0.1], 0, -shieldRadiusY, 0, 0)
                .curveTo(0, -shieldRadiusY*2, shieldRadiusX, 0)
                .endStroke();
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