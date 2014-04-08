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


            this.mouseEnabled = false;
        },

        setModel : function(model){
            Sprite.prototype.setModel.call(this,model);

            this.image = preloader.getResult(model.get("key"));
            this.regX = this.image.width/2;
            this.regY = this.image.height/2;
            this.scaleX = this.scaleY = model.get("scale");

            this.alpha = this.model.get("key").indexOf("nebula") >= 0 ? 0.5 : 0.3;
        }
    });

    return Planet;
});