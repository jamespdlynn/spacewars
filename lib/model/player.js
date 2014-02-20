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
            isAccelerating : false,
            isInvulnerable : false,
            username : ""
        },

        set : function(data, options){
            Sprite.prototype.set.call(this, data, options);

            if (this.changed.angle){
                this.atMaxVelocity = false;
            }

            if (this.changed.isAccelerating){
                var self = this;

                if (!this.changed.velocityX && !this.changed.velocityY){
                    this.thrust();
                }
                setTimeout(function(){
                    self.data.isAccelerating = false;
                }, Constants.CLIENT_UPDATE_INTERVAL);
            }



            return this;
        },


        thrust : function(){
            if (this.atMaxVelocity) return;

            var cos = Math.cos(data.angle);
            var sin = Math.sin(data.angle);
            var thrust = this.thrust;

            var newVelocityX = data.velocityX + (cos * thrust);
            var newVelocityY = data.velocityY + (sin * thrust);

            while (Sprite.getHypotenuse(newVelocityX, newVelocityY) > this.maxVelocity){
                thrust--;
                newVelocityX = data.velocityX + (cos * thrust);
                newVelocityY = data.velocityY + (sin * thrust);
                this.atMaxVelocity = true;
            }

            data.velocityX = newVelocityX;
            data.velocityY = newVelocityY;
        },

        updateData : function(deltaseconds){
            var data = this.data;
            data.posx += deltaseconds * data.velocityX;
            data.posy += deltaseconds * data.velocityY;

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