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

            this.volume = 1;
            this.shotSound = createjs.Sound.createInstance("shotSound");
            this.exhaustSound = createjs.Sound.play("exhaustSound", {loop:-1, volume:0});

            this.rotationSet = false;

            this.addChild(this.flame1, this.flame2, this.shipBody);
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
            var volume = this.exhaustSound.getVolume();

            if (isAccelerating){
                this.flame1._tick(evt);
                this.flame2._tick(evt);

                if (volume < this.volume){
                    this.exhaustSound.setVolume(Math.min(volume+0.05, this.volume));
                }
            }
            else if (volume > 0){
                this.exhaustSound.setVolume(Math.max(volume-0.5,0));
            }

            this.flame1.visible = this.flame2.visible = isAccelerating;
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

    return StarShip;
});