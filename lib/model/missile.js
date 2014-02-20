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
            velocity : 0,
            acceleration : 0,
            angle : 0,
            playerId : 0
        }

    });


    return Missile;
});