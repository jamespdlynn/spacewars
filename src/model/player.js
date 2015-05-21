define(['model/sprite','model/constants'],function(Sprite, Constants){
    'use strict';

    var Player = function(data){
        this.initialize(data);
    };

    extend.call(Player.prototype, Sprite.prototype, Constants.Player, {

        type : "Player",

        defaults : {
            id : 0,
            name: "",
            icon : "",
            zone : 0,
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
            isInvulnerable : true,
            isAccelerating : false,
            isShielded : false,
            isShieldBroken : false,
            alive : true
        },

        set: function() {
            Sprite.prototype.set.apply(this, arguments);

            if (this.hasChanged("kills")){
               this._powerUp();
            }

            return this;
        },

        _updateData : function(deltaSeconds){

            var data = this.data;

            var deltaSeconds1 = 0;
            var newVelocityX, newVelocityY;

            if (data.isAccelerating){

                //Calculate new velocities
                newVelocityX = data.velocityX + (Math.cos(data.angle) *  this.acceleration * deltaSeconds);
                newVelocityY = data.velocityY + (Math.sin(data.angle) *  this.acceleration * deltaSeconds);

                if (Math.abs(newVelocityX) > this.maxVelocity){
                    newVelocityX = (newVelocityX > 0) ? this.maxVelocity : -this.maxVelocity;
                    deltaSeconds1 = getTime(data.velocityX, newVelocityX, this.acceleration);
                    data.posX += getDistance(data.velocityX, newVelocityX, deltaSeconds1) + (newVelocityX*(deltaSeconds-deltaSeconds1));
                }
                else{
                    data.posX += getDistance(data.velocityX, newVelocityX, deltaSeconds);
                }

                if (Math.abs(newVelocityY) > this.maxVelocity){
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
                data.fuel = Math.min(data.fuel, this.maxFuel);
            }

            if (data.isShielded){
                data.shields -=  (this.shieldUseRate * deltaSeconds);
                data.shields = Math.max(data.shields, 0);
            }
            else if (!this.isShieldBroken()){
                data.shields += (this.shieldRestoreRate * deltaSeconds);
                data.shields = Math.min(data.shields, this.maxShields);
            }

            return this;
        },

        getRadius : function(){
            return this.data.isShielded ? this.width/2 + this.shieldPadding : this.width/2;
        },

        detectCollision : function(sprite){
            if (sprite && (sprite.get('playerId') === this.id)){
                return false;
            }

            return Sprite.prototype.detectCollision.call(this, sprite);
        },

        collide : function(sprite){

            if (!sprite || !this.data.isShielded){
                return Sprite.prototype.collide.call(this, sprite);
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
            d1.shields = Math.max(d1.shields, 0);

            d1.isAccelerating = false;

            return this.update(200);
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

        reFuel : function(){
            this.data.fuel = this.maxFuel;
            return this;
        },

        isShieldBroken : function(){
            return this.data.isShieldBroken || this.data.shields === 0;
        },

        canShield : function(){
            return !this.isShieldBroken();
        },

        reShield : function(){
            this.data.shields = this.isShieldBroken() ? this.maxShields/5 : this.maxShields;
            this.data.isShieldBroken = false;
            return this;
        },

        canFire : function(){
            return !this.data.isInvulnerable && !this.data.isShielded && this.data.ammo > 0 && (!this.lastFired || this.lastUpdated-this.lastFired >= this.fireInterval);
        },

        fireMissile : function(){
            var data = this.data;

            var cos = Math.cos(data.angle);
            var sin = Math.sin(data.angle);
            var velocity = Constants.Missile.velocity + (data.kills * 5);

            this.lastFired = this.lastUpdated;
            data.ammo--;

            return {
                posX : data.posX,
                posY : data.posY,
                velocityX : (data.velocityX/2) + (cos * velocity),
                velocityY : (data.velocityY/2) + (sin * velocity),
                angle : data.angle,
                playerId : data.id,
                zone : data.zone
            };
        },

        canReload : function(){
            return this.data.ammo < this.maxAmmo;
        },

        reload : function(){
            this.data.ammo = this.maxAmmo;
            return this;
        },

        incrementKills : function(){
            this.data.kills++;
            this._powerUp();
            return this;
        },

        toJSON : function(){
           this.data.isShieldBroken = this.isShieldBroken();
           return this.data;
        },

        refresh : function(){
            this.reFuel();

            if (!this.isShieldBroken()){
                this.reShield();
            }

            if (this.data.ammo > 0){
                this.reload();
            }

            return this;
        },

        _powerUp : function(){
            var level = this.data.kills;
            if (level < this.maxLevel){
                //this.maxVelocity = Constants.Player.maxVelocity + level;
                this.maxFuel =  Constants.Player.maxFuel + (5*level);
                this.maxShields = Constants.Player.maxShields + (5*level);
                //this.maxAmmo = Constants.Player.maxAmmo + level;
            }

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