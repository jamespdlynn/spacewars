define(['model/sprite','model/constants'],function(Sprite,Constants){
    'use strict';

    var Missile = function(data, options){
        this.initialize(data, options);
    };

    extend.call(Missile.prototype, Sprite.prototype, Constants.Missile, {

        type : "Missile",

        defaults : {
            id : -1,
            playerId : -1,
            zone : -1,
            posX : 0,
            posY : 0,
            velocityX : 0,
            velocityY : 0,
            angle : 0
        },

        updateData : function(deltaSeconds){
            this.data.posX += (this.data.velocityX * deltaSeconds);
            this.data.posY += (this.data.velocityY * deltaSeconds);
        },

        hasExceededMaxDistance : function(){
            return Sprite.getHypotenuse(data.velocityX, data.velocityY) * (this.created-this.lastUpdated) > this.maxDistance;
        }

    });


    return Missile;
});