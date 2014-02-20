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
            velocity : 0,
            acceleration : 0,
            angle : 0,
            isAccelerating : false,
            isInvulnerable : false,
            username : ""
        },

        set : function(data, options){
            Sprite.prototype.set.call(this, data, options);

            if (this.hasChanged("isAccelerating") && !this.hasChanged("acceleration")){
                this.data.acceleration = this.data.isAccelerating ? this.maxAcceleration : 0;
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

        canFire : function(){
            return (!this.data.isInvulnerable && (!this.lastFired || this.lastUpdated-this.lastFired >= this.fireInterval));
        },

        fireMissile : function(){
            var data = this.data;
            var radius = (this.height/2) - (Constants.Missile.height/2);

            this.lastFired = this.lastUpdated;

            return {
                posX : data.posX + (Math.cos(data.angle) * radius),
                posY : data.posY + (Math.sin(data.angle) * radius),
                velocity : data.velocity,
                angle : data.angle,
                playerId : data.id
            };
        }

    });

    return Player;
});