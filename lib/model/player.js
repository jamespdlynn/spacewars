define(['model/sprite','model/constants'],function(Sprite,Constants){

    var Player = function(data, options){
        this.lastFired = 0;
        this.becameInvulnearble = 0;

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
            angle :0,
            isAccelerating : false,
            isInvulnerable : false,
            username : ""
        },

        set : function(data, options){
            Sprite.prototype.set.call(this, data, options);

            if (typeof window == 'undefined' && this.changed.isInvulnerable){
                this.becameInvulnearble = this.lastUpdated;
            }

            return this;
        },

        updateData : function(deltaSeconds){

            var data = this.data;

            if (data.isAccelerating){
                Sprite.prototype.updateData.call(this, deltaSeconds);
            }else{
                data.posX += data.velocityX * deltaSeconds;
                data.posY += data.velocityY * deltaSeconds;
            }

            if (typeof window == 'undefined' && data.isInvulnerable && (this.lastUpdated-this.becameInvulnearble >= this.invulnerableTime)){
                data.isInvulnerable = false;
            }

            return this;
        },

        ease : function(deltaX, deltaY){
            this.maxVelocity = Constants.Player.maxVelocity;
            Sprite.prototype.ease.call(this,deltaX,deltaY);
        },

        outOfBounds : function(){
            var rect = this.getRect();
            var data = this.data;

            if (rect.left < 0 && data.velocityX < 0 && (!data.isAccelerating || Math.abs(data.angle) > Math.PI/2)) return "left";
            if (rect.top < 0 && data.velocityY < 0 && (!data.isAccelerating || data.angle < 0)) return "top";
            if (rect.right >= Constants.Zone.width && data.velocityX > 0 && (!data.isAccelerating || Math.abs(data.angle) < Math.PI/2)) return "right";
            if (rect.bottom >= Constants.Zone.height && data.velocityY > 0 && (!data.isAccelerating || data.angle > 0)) return "bottom";

            return false;
        },

        canFire : function(){
            if (!this.data.isInvulnerable && (this.lastUpdated- this.lastFired >= this.fireInterval)){
                this.lastFired = this.lastUpdated;
                return true;
            }

            return false;
        },

        fireMissile : function(){
            var data = this.data;

            var radius = (this.height/2) - (Constants.Missile.height/2);
            return {
                posX : data.posX + (Math.cos(data.angle) * radius),
                posY : data.posY + (Math.sin(data.angle) * radius),
                velocityX : data.velocityX,
                velocityY : data.velocityY,
                angle : data.angle,
                playerId : data.id
            };
        }

    });

    return Player;
});