define(['model/sprite','model/constants'],function(Sprite, Constants){
    'use strict';

    var Player = function(data, options){
        this.initialize(data, options);
    };

    extend.call(Player.prototype, Sprite.prototype, Constants.Player, {

        type : "Player",

        defaults : {
            id : -1,
            zone : -1,
            username : "",
            posX : 0,
            posY : 0,
            velocityX : 0,
            velocityY : 0,
            acceleration : 0,
            angle : 0,
            fuel : 100,
            shields : 100,
            ammo : Constants.Player.maxAmmo,
            kills : 0,
            isAccelerating : false,
            isShielded : false,
            isInvulnerable : false,
        },

        updateData : function(deltaSeconds){
            var data = this.data;

            if (data.isAccelerating){

                var deltaSeconds1 = 0;

                //Calculate new velocities
                var newVelocityX = data.velocityX + (Math.cos(data.angle) *  this.acceleration * deltaSeconds);
                var newVelocityY = data.velocityY + (Math.sin(data.angle) *  this.acceleration * deltaSeconds);

                if (newVelocityX > this.maxVelocity || newVelocityX < -this.maxVelocity){
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

                if (data.fuel > 0){
                    data.fuel -= this.fuelUseRate * deltaSeconds;
                    data.fuel = Math.max(data.fuel, 0);
                }
            }
            else{
                data.posX += data.velocityX * deltaSeconds;
                data.posY += data.velocityY * deltaSeconds;

                if (data.fuel < 100){
                    data.fuel += (this.fuelRestoreRate * deltaSeconds);
                    data.fuel = Math.min(data.fuel, 100);
                }
            }

            if (!this.isShieldBroken()){
                if ( data.isShielded){
                    data.shields -=  (this.shieldUseRate * deltaSeconds);
                    data.shields = Math.max(data.shields, 0);
                }
                else{
                    data.shields += (this.shieldRestoreRate * deltaSeconds);
                    data.shields = Math.min(data.shields, 100);
                }
            }

            return this;
        },

        getRadius : function(){
            return this.data.isShielded ? this.width/2 + this.shieldPadding : this.width/2;
        },

        collide : function(sprite){

            Sprite.prototype.collide.call(this, sprite);

            if (!this.data.isShielded){
                return true;
            }

            var cos = Math.cos;
            var sin = Math.sin;
            var pi = Math.PI;

            //data objects
            var d1 = this.data;
            var d2 = sprite.data;

            //masses
            var m1 = this.mass;
            var m2 = sprite.mass;

            //combined velocities
            var v1 = Sprite.getHypotenuse(d1.velocityX, d1.velocityY);
            var v2 = Sprite.getHypotenuse(d2.velocityX, d2.velocityY);

            //combined velocity angles
            var a1 = Math.atan2(d1.velocityY, d1.velocityX);
            var a2 = Math.atan2(d2.velocityY, d2.velocityX);

            //collision angle
            var a3 = Math.atan2(d2.posY - d1.posY, d2.posX - d1.posX);

            //Calculate new velocities
            var z1 = ((v1 * cos(a1-a3) * (m1-m2)) + (2 * m2 * v2 *cos(a2-a3))) / (m1+m2);
            var z2 =  v1 *  sin(a1-a3);

            d1.velocityX = (z1 * cos(a3)) + (z2 * cos(a3+(pi/2)));
            d1.velocityY = (z1 * sin(a3)) + (z2 * sin(a3+(pi/2)));

            //Make sure velocities don't exceed max
            d1.velocityX = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, d1.velocityX));
            d1.velocityY = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, d1.velocityY));

            //Calculate new shield values
            d1.shields -= this.shieldHitDiscount;
            d1.shields = Math.max(this.data.shields, 0);

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

        canShield : function(){
            return this.data.shields > 0;
        },

        isShieldBroken : function(){
            return this.data.shields === 0;
        },

        canFire : function(){
            return !this.data.isInvulnerable && !this.data.isShielded && this.data.ammo > 0 && (!this.lastFired || this.lastUpdated-this.lastFired >= this.fireInterval);
        },

        fireMissile : function(){
            var data = this.data;

            var cos = Math.cos(data.angle);
            var sin = Math.sin(data.angle);
            var velocity = Constants.Missile.velocity;

            this.lastFired = this.lastUpdated;
            data.ammo--;

            return {
                posX : data.posX ,
                posY : data.posY,
                velocityX : (data.velocityX/4) + (cos * velocity),
                velocityY : (data.velocityY/4) + (sin * velocity),
                angle : data.angle,
                playerId : data.id,
                zone : data.zone
            };
        },

        reload : function(){
            this.data.ammo = this.maxAmmo;
            return this;
        },

        incrementKills : function(){
            this.set("kills",this.data.kills+1);
            return this;
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