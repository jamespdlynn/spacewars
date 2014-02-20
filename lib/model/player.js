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

            if (this.hasChanged("angle")){
                this.atMaxVelocity = false;
            }

            if (this.hasChanged("isAccelerating")){
                if (!this.data.isAccelerating){
                    this.data.isAccelerating = true;
                    delete this.changed.isAccelerating;
                }
                else{
                    if (!this.hasChanged("velocityX") && !this.hasChanged("velocityY")){
                        this.accelerate();
                    }

                    var self = this;
                    setTimeout(function(){
                        self.data.isAccelerating = false;
                    }, Constants.CLIENT_UPDATE_INTERVAL);
                }
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

        accelerate : function(){

            if (this.atMaxVelocity) return;

            var data = this.data;

            var cos = Math.cos(data.angle);
            var sin = Math.sin(data.angle);
            var thrust = this.thrust;

            var newVelocityX, newVelocityY;

            do {
                newVelocityX =  data.velocityX + (cos * thrust);
                newVelocityY = data.velocityY + (sin * thrust);
                if (Sprite.getHypotenuse(newVelocityX, newVelocityY) <= this.maxVelocity){
                    break;
                }
            }while(thrust--);

            data.velocityX = newVelocityX;
            data.velocityY = newVelocityY;

            this.atMaxVelocity = (thrust < this.thrust);
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
                velocity : Sprite.getHypotenuse(data.velocityX, data.velocityY),
                angle : data.angle,
                playerId : data.id
            };
        }

    });

    return Player;
});