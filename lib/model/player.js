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

        update : function(deltaTime){
            Sprite.prototype.update.call(this, deltaTime);

            if (this.lastUpdated - this.lastAccelerated >= this.accelerationTime){
                this.data.isAccelerating = false;
            }

            return this;
        },

        updateData : function(deltaSeconds){
            var data = this.data;

            data.posX += (data.velocityX * deltaSeconds);
            data.posY += (data.velocityY * deltaSeconds);

            if (data.isAccelerating){
                data.fuel -= (this.fuelUseRate * deltaSeconds);
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