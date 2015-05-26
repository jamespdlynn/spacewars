define(['models/sprite','models/constants'],function(Sprite,Constants){
    'use strict';

    var Planet = function(data,options){
        this.initialize(data,options);
    };

    extend.call(Planet.prototype, Sprite.prototype, Constants.Planet, {

        type : "Planet",

        defaults : {
            zone : 0,
            key : "",
            posX : 0,
            posY : 0,
            scale : 1
        },

        initialize : function(data,options){
            Sprite.prototype.initialize.call(this,data,options);
            this.id = this.get("key") + "_" + this.get("zone");
        },

        getRadius : function(){
            return Math.max(this.width, this.height) * this.get("scale") / 2;
        }


    });


    return Planet;
});