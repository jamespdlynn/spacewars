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
            angle :0,
            velocityX : 0,
            velocityY : 0,
            isAccelerating : false,
            isInvulnerable : false,
            username : ""
        },

        set : function(data, options){
            Sprite.prototype.set.call(this, data, options);

            if (this.changed.isInvulnerable){
                this.becameInvulnearble = this.lastUpdated;
            }

            return this;
        },

        update : function(deltaTime){
            Sprite.prototype.update.call(this, deltaTime);

            if (this.data.isInvulnerable && (this.lastUpdated - this.becameInvulnearble) > this.invulnerableTime){
                 this.data.isInvulnerable = false;
            }

            return this;
        },

        updateData : function(deltaSeconds){

            var data = this.data;


            if (data.isAccelerating){

                var deltaSeconds1 = 0;

                //Calculate new velocities
                var newVelocityX = data.velocityX + (Math.cos(data.angle) *  this.accelerationX * deltaSeconds);
                var newVelocityY = data.velocityY + (Math.sin(data.angle) *  this.accelerationY * deltaSeconds);

                //If velocities exceed maximums, we have to do some additional logic to calculate new positions
                if (newVelocityX > this.maxVelocityX || newVelocityX < -this.maxVelocityX){
                    newVelocityX = (newVelocityX > 0) ? this.maxVelocityX : -this.maxVelocityX;

                    deltaSeconds1 = getTime(data.velocityX, newVelocityX, this.accelerationX);
                    data.posX += getDistance(data.velocityX, newVelocityX, deltaSeconds1) + (newVelocityX*(deltaSeconds-deltaSeconds1));
                }
                else{
                    data.posX += getDistance(data.velocityX, newVelocityX, deltaSeconds);
                }

                if (newVelocityY > this.maxVelocityY || newVelocityY < -this.maxVelocityY){
                    newVelocityY = (newVelocityY > 0) ? this.maxVelocityY : -this.maxVelocityY;

                    deltaSeconds1 = getTime(data.velocityY, newVelocityY, this.accelerationY);
                    data.posY += getDistance(data.velocityY, newVelocityY, deltaSeconds1) + (newVelocityY*(deltaSeconds-deltaSeconds1));
                }else{
                    data.posY += getDistance(data.velocityY, newVelocityY, deltaSeconds);
                }

                data.velocityX = newVelocityX;
                data.velocityY = newVelocityY;
            }
            else{
                data.posX +=  data.velocityX * deltaSeconds;
                data.posY +=  data.velocityY * deltaSeconds;
            }

            return this;
        },



        ease : function(deltaX, deltaY){

            this.maxVelocityX = Constants.Player.maxVelocityX;
            this.maxVelocityY = Constants.Player.maxVelocityY;

            var data = this.data;

            if (Math.abs(deltaX) > this.maxVelocityX || Math.abs(deltaY) > this.maxVelocityY){
                data.posX += deltaX;
                data.posY += deltaY;
            }
            else{
                //console.log(deltaX+","+deltaY);
                //Update the velocities to move to the correct position by the next update
                var interval = Constants.SERVER_UPDATE_INTERVAL/1000;

                data.velocityX += deltaX/interval;
                if (Math.abs(data.velocityX) > this.maxVelocityX){
                    this.maxVelocityX = Math.abs(data.velocityX);
                }

                data.velocityY += deltaY/interval;
                if (Math.abs(data.velocityY) > this.maxVelocityY){
                    this.maxVelocityY = Math.abs(data.velocityY);
                }
            }



            return this;
        },

        canFire : function(){
            if (!this.data.isInvulnerable && (this.lastUpdated- this.lastFired >= this.fireInterval)){
                this.lastFired = this.lastUpdated;
                return true;
            }

            return false;
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

        fireMissile : function(){
            var data = this.data;
            return {
                posX :  data.posX,
                posY :  data.posY,
                angle : data.angle,
                playerId : this.id
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