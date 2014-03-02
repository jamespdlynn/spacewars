define(['model/sprite','model/constants'],function(Sprite,Constants){

    var Planet = function(data, options){
        this.initialize(data, options);
    };

    extend.call(Planet.prototype, Sprite.prototype, Constants.Planet, {

        type : "Planet",

        defaults : {
            id : 0,
            key : "saturn",
            posX : 0,
            posY : 0,
            scale : 1
        }


    });


    return Planet;
});