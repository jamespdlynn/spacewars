define(['model/sprite','model/constants'],function(Sprite,Constants){
    'use strict';

    var Missile = function(data, options){
        this.initialize(data, options);
    };

    extend.call(Missile.prototype, Sprite.prototype, Constants.Missile, {

        type : "Missile",

        defaults : {
            id : 0,
            posX : 0,
            posY : 0,
            velocityX : 0,
            velocityY : 0,
            angle : 0,
            playerId : 0,
            zone : -1
        },

        updateData : function(deltaSeconds){
            var data = this.data;

            data.posX += (data.velocityX * deltaSeconds);
            data.posY += (data.velocityY * deltaSeconds);
        }

    });


    return Missile;
});