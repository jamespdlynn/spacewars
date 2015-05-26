 define(['createjs','models/sprite','views/sprite'],function(createjs, SpriteModel, SpriteView){
     'use strict';

    var FRAME_SIZE = 96;

    var Explosion = function (model){
        this.model = new SpriteModel(model.data);
        this.model.mass = model.mass;
        this.initialize();
    };

    Explosion.prototype = new createjs.Sprite();

    extend.call(Explosion.prototype, SpriteView.prototype, {

        initialize : function(){
            this.scaleX = this.scaleY = (this.model.mass/100);

            var volume = getRelativeVolume(this.model);
            createjs.Sound.play('explosionSound', {volume:volume*this.scaleX});

             var spriteSheet = new createjs.SpriteSheet({
                 images: [preloader.getResult("explosionSprites")],
                 frames: {width:FRAME_SIZE, height:FRAME_SIZE, regX:FRAME_SIZE/2, regY:FRAME_SIZE/2, count: 48},
                 animations: {"play": [0, 48]},
                 framerate: 24
             });

             createjs.Sprite.prototype.initialize.call(this, spriteSheet, "play");

        },

        _tick : function(evt){
            SpriteView.prototype._tick.call(this,evt);
            createjs.Sprite.prototype._tick.call(this,evt);
        }
    });

    return Explosion;
});