define(['createjs','view/sprite'],function(createjs, Sprite){
    'use strict';

    var Bitmap = createjs.Bitmap;

    var Planet = function (model){
        this.initialize(model);
    };

    Planet.prototype = new Bitmap();

    extend.call(Planet.prototype, Sprite.prototype, {

        initialize : function(model){
            Bitmap.prototype.initialize.call(this);

            this.model = model;

            this.image = preloader.getResult(model.get("key"));
            this.regX = this.image.width/2;
            this.regY = this.image.height/2;
            this.scaleX = this.scaleY = model.get("scale");

            this.alpha = model.get("key").indexOf("nebula") >= 0 ? 0.5 : 0.3;
        },

        _tick : function(){
            var data = this.model.zoneAdjustedPosition(gameData.zone);

            this.x = data.posX;
            this.y = data.posY;
        }
    });

    return Planet;
});