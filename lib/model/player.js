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
            fuel : 100,
            isAccelerating : false,
            isInvulnerable : false,
            username : ""
        },

        set : function(key, val, options){

            Sprite.prototype.set.call(this, key, val, options);

            if (this.hasChanged("isAccelerating")){
                if (!this.data.isAccelerating){
                    this.data.isAccelerating = false;
                    delete this.changed.isAccelerating;
                }else{
                    this.lastAccelerated = this.lastUpdated;
                }

            }

            return this;
        },

        updateData : function(deltaSeconds){
            var data = this.data;

            data.posX += (data.velocityX * deltaSeconds);
            data.posY += (data.velocityY * deltaSeconds);

            if (data.isAccelerating){

                var currentTime = this.lastUpdated+(deltaSeconds*1000);

                if (currentTime - this.lastAccelerated < this.accelerationTime){
                    data.fuel -= (this.fuelUseRate * deltaSeconds);
                }
                else{
                    var deltaSeconds1 = this.accelerationTime - this.lastUpdated;
                    var deltaSeconds2 = currentTime - this.accelerationTime;

                    data.fuel -= (this.fuelUseRate * deltaSeconds1);
                    data.fuel += (this.fuelRestoreRate * deltaSeconds2);
                    data.fuel = Math.min(data.fuel, 100);

                    data.isAccelerating = false;
                }
            }
            else if (data.fuel < 100){
                data.fuel += (this.fuelRestoreRate * deltaSeconds);
                data.fuel = Math.min(data.fuel, 100);
            }

            return this;
        },

        outOfBounds : function(){
            var rect = this.getRect();
            var data = this.data;

            if (rect.left < 0 && (!data.isAccelerating || Math.abs(data.angle) > Math.PI/2)) return "left";
            if (rect.top < 0 && (!data.isAccelerating || data.angle < 0)) return "top";
            if (rect.right >= Constants.Zone.width && (!data.isAccelerating || Math.abs(data.angle) < Math.PI/2)) return "right";
            if (rect.bottom >= Constants.Zone.height && (!data.isAccelerating || data.angle > 0)) return "bottom";

            return false;
        },

        angleDifference : function(angle){
            var deltaAngle = this.data.angle-angle;
            while (deltaAngle < -Math.PI/2) deltaAngle += Math.PI;
            while (deltaAngle > Math.PI/2) deltaAngle -= Math.PI;
            return Math.abs(deltaAngle);
        },

        canAccelerate : function(){
            return !this.data.isAccelerating && this.data.fuel > 0;
        },

        accelerate : function(){

            var data = this.data;

            data.velocityX += Math.cos(data.angle) * this.thrust;
            data.velocityY += Math.sin(data.angle) * this.thrust;

            data.velocityX = Math.min(this.maxVelocity, Math.max(-this.maxVelocity, data.velocityX));
            data.velocityY = Math.min(this.maxVelocity, Math.max(-this.maxVelocity, data.velocityY));

            return this;
        },

        canFire : function(){
            return !this.data.isInvulnerable && (!this.lastFired || this.lastUpdated-this.lastFired >= this.fireInterval);
        },

        fireMissile : function(){
            var data = this.data;
            var radius = (this.height/2) - (Constants.Missile.height/2);

            this.lastFired = this.lastUpdated;

            return {
                posX : data.posX + (Math.cos(data.angle) * radius),
                posY : data.posY + (Math.sin(data.angle) * radius),
                velocity : Sprite.getHypotenuse(data.velocityX, data.velocityY),
                angle : data.angle,
                playerId : data.id
            };
        }

    });

    return Player;
});