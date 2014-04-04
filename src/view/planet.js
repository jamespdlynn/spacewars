define(['createjs','view/sprite'],function(createjs, Sprite){
    'use strict';

    var Bitmap = createjs.Bitmap;

    var Planet = function (model){
        this.initialize();
        this.setModel(model);
    };

    Planet.prototype = new Bitmap();

    extend.call(Planet.prototype, Sprite.prototype, {

        initialize : function(){
            Bitmap.prototype.initialize.call(this);

            this.alpha = 0.3;
            this.tickEnabled = false;
            this.mouseEnabled = false;
        },

        setModel : function(model){
            Sprite.prototype.setModel.call(this,model);

            this.image = preloader.getResult(model.get("key"));
            this.regX = this.image.width/2;
            this.regY = this.image.height/2;
            this.scaleX = this.scaleY = model.get("scale");

            this._tick();
        }
    });

    return Planet;
});