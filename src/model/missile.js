define(['model/sprite','model/constants'],function(Sprite,Constants){
    'use strict';

    var Missile = function(data){
        this.initialize(data);
    };

    extend.call(Missile.prototype, Sprite.prototype, Constants.Missile, {

        type : "Missile",

        defaults : {
            id : 0,
            playerId : 0,
            zone : 0,
            posX : 0,
            posY : 0,
            velocityX : 0,
            velocityY : 0,
            angle : 0
        },

        _updateData : function(deltaSeconds){
            this.data.posX += (this.data.velocityX * deltaSeconds);
            this.data.posY += (this.data.velocityY * deltaSeconds);
        },

        detectCollision : function(sprite){
            if (!sprite || (sprite.type === 'Player' && sprite.id === this.get("playerId"))){
                return false;
            }

            return Sprite.prototype.detectCollision.call(this, sprite);
        },

        hasExceededMaxDistance : function(){
            var combinedVelocity =  Sprite.getHypotenuse(this.data.velocityX, this.data.velocityY)
            return  combinedVelocity * (this.lastUpdated-this.created)/1000 > this.maxDistance;
        }

    });


    return Missile;
});