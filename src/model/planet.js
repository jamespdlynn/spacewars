define(['model/sprite','model/constants'],function(Sprite,Constants){
    'use strict';

    var Planet = function(data,options){
        this.initialize(data,options);
    };

    extend.call(Planet.prototype, Sprite.prototype, Constants.Planet, {

        type : "Planet",

        defaults : {
            zone : -1,
            key : "",
            posX : 0,
            posY : 0,
            scale : 1
        },

        initialize : function(data,options){
            Sprite.prototype.initialize.call(this,data,options);
            this.id = this.get("key") + "_" + this.get("zone");
        }


    });


    return Planet;
});