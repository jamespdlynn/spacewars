define(['model/sprite','model/constants'],function(Sprite,Constants){

    var Player = function(data, options){
        this.initialize(data, options);
    };

    extend.call(Player.prototype, Sprite.prototype, Constants.Player, {

        type : "Player",

        defaults : {
            id : 0,
            posX : 0,
            posY : 0,
            velocityX : 0,
            velocityY : 0,
            acceleration : 0,
            angle : 0,
            thrust : 0,
            fuel : 100,
            isAccelerating : false,
            isInvulnerable : false,
            username : ""
        },


        updateData : function(deltaSeconds){
            var data = this.data;

            if (data.isAccelerating){

                var deltaSeconds1 = 0;

                //Calculate new velocities
                var newVelocityX = data.velocityX + (Math.cos(data.angle) *  this.acceleration * deltaSeconds);
                var newVelocityY = data.velocityY + (Math.sin(data.angle) *  this.acceleration * deltaSeconds);

                if (newVelocityX > this.maxVelocity || newVelocityX < -this.maxVelocitX){
                    newVelocityX = (newVelocityX > 0) ? this.maxVelocity : -this.maxVelocity;
                    deltaSeconds1 = getTime(data.velocityX, newVelocityX, this.acceleration);
                    data.posX += getDistance(data.velocityX, newVelocityX, deltaSeconds1) + (newVelocityX*(deltaSeconds-deltaSeconds1));
                }
                else{
                    data.posX += getDistance(data.velocityX, newVelocityX, deltaSeconds);
                }

                if (newVelocityY > this.maxVelocity || newVelocityY < -this.maxVelocity){
                    newVelocityY = (newVelocityY > 0) ? this.maxVelocity : -this.maxVelocity;
                    deltaSeconds1 = getTime(data.velocityY, newVelocityY, this.acceleration);
                    data.posY += getDistance(data.velocityY, newVelocityY, deltaSeconds1) + (newVelocityY*(deltaSeconds-deltaSeconds1));
                }else{
                    data.posY += getDistance(data.velocityY, newVelocityY, deltaSeconds);
                }

                data.velocityX = newVelocityX;
                data.velocityY = newVelocityY;

                data.fuel -= this.fuelUseRate * deltaSeconds;
                data.fuel = Math.max(data.fuel, 0);
            }
            else{
                data.posX += data.velocityX * deltaSeconds;
                data.posY += data.velocityY * deltaSeconds;

                data.fuel += (this.fuelRestoreRate * deltaSeconds);
                data.fuel = Math.min(data.fuel, 100);
            }

            return this;
        },

        outOfBounds : function(){
            var rect = this.getRect();
            var data = this.data;
            var zoneWidth = Constants.Zone.width;
            var zoneHeight = Constants.Zone.height;
            var padding = this.width/10;

            if (data.velocityX < 0 && rect.left < -padding && (Math.abs(data.angle) > Math.PI/2 || rect.right < padding))  return "left";
            if (data.velocityY < 0 && rect.top < -padding && (data.angle < 0|| rect.bottom < padding)) return "top";
            if (data.velocityX > 0 && rect.right > zoneWidth+padding && (Math.abs(data.angle) < Math.PI/2  || rect.left > zoneWidth-padding)) return "right";
            if (data.velocityY > 0 && rect.bottom > zoneHeight+padding && (data.angle > 0 || rect.top > zoneHeight-padding)) return "bottom";

            return false;
        },

        angleDifference : function(angle){
            var deltaAngle = this.data.angle-angle;
            while (deltaAngle < -Math.PI) deltaAngle += (Math.PI*2);
            while (deltaAngle > Math.PI) deltaAngle -= (Math.PI*2);
            return Math.abs(deltaAngle);
        },

        canAccelerate : function(){
            return this.data.fuel > 0;
        },

        canFire : function(){
            return !this.data.isInvulnerable && (!this.lastFired || this.lastUpdated-this.lastFired >= this.fireInterval);
        },

        fireMissile : function(){
            var data = this.data;

            var cos = Math.cos(data.angle);
            var sin = Math.sin(data.angle);
            var velocity = Constants.Missile.velocity;

            this.lastFired = this.lastUpdated;

            return {
                posX : data.posX ,
                posY : data.posY,
                velocityX : (data.velocityX/4) + (cos * velocity),
                velocityY : (data.velocityY/4) + (sin * velocity),
                angle : data.angle,
                playerId : data.id
            };
        }

    });

    //Private helper functions
    function getDistance(vi, vf, t){
        return ((vi+vf)/2)*t;
    }

    function getTime(vi, vf, a){
        return Math.abs((vf-vi)/a);
    }


    return Player;
});