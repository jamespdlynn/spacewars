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

                data.fuel -= Math.round((this.fuelUseRate * deltaSeconds));
                if (data.fuel < 0){

                    //var deltaSeconds1 = data.fuel / this.fuelUseRate;
                    //var deltaSeconds2 = deltaSeconds - deltaSeconds1;

                    //this.updateData(deltaSeconds1);

                    data.isAccelerating = false;
                    data.fuel = 0;

                    //return this.updateData(deltaSeconds2);
                }

                data.acceleration += (data.acceleration + 30) * deltaSeconds ;
                data.accelerating = Math.max(data.acceleration, this.maxAcceleration);
            }
            else if (data.fuel < 100){

                data.fuel += (this.fuelRestoreRate * deltaSeconds);
                data.fuel = Math.min(data.fuel, 100);

                data.acceleration -= 25 * deltaSeconds;
                data.accelerating = Math.min(data.acceleration, 0);
            }

            data.velocityX += Math.cos(data.angle) * data.acceleration * deltaSeconds;
            data.velocityY += Math.sin(data.angle) * data.acceleration * deltaSeconds;

            data.velocityX = Math.min(this.maxVelocity, Math.max(-this.maxVelocity, data.velocityX));
            data.velocityY = Math.min(this.maxVelocity, Math.max(-this.maxVelocity, data.velocityY));

            data.posX += data.velocityX * deltaSeconds;
            data.posY += data.velocityY * deltaSeconds;

            return this;
        },

        outOfBounds : function(){
            var rect = this.getRect();
            var data = this.data;
            var zoneWidth = Constants.Zone.width;
            var zoneHeight = Constants.Zone.height;
            var padding = this.width/10;

            if (data.velocityX < 0 && rect.left < -padding && (Math.abs(data.angle) > Math.PI/2 || rect.right < padding)){ console.log(rect.left+","+data.angle+","+rect.right); return "left";}
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

    return Player;
});