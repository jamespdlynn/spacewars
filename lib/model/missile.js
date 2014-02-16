define(['model/sprite','model/constants'],function(Sprite,Constants){

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
            playerId : 0
        },

        ease : function(deltaX, deltaY){
            this.maxVelocity = Constants.Player.maxVelocity;
            Sprite.prototype.ease.call(this,deltaX,deltaY);
        }

    });


    return Missile;
});