 define(['createjs','view/sprite'],function(createjs, Sprite){
     'use strict';

    var FRAME_SIZE = 96;

    var Explosion = function (model){
        this.model = model;
        this.initialize();
    };

    Explosion.prototype = new createjs.Sprite();

    extend.call(Explosion.prototype, {

        initialize : function(){
             this.model.set({velocityX:0, velocityY:0});

             this.scaleX  = ((this.model.getRadius()*2)+20)/FRAME_SIZE;
             this.scaleY =  ((this.model.getRadius()*2)+20)/FRAME_SIZE;
             this.alpha = 0.95;

             var spriteSheet = new createjs.SpriteSheet({
                 images: [preloader.getResult("explosionSprites")],
                 frames: {width:FRAME_SIZE, height:FRAME_SIZE, regX:FRAME_SIZE/2, regY:FRAME_SIZE/2, count: 48},
                 animations: {"play": [0, 48]},
                 framerate: 24
             });

             createjs.Sprite.prototype.initialize.call(this, spriteSheet, "play")
        },

        _tick : function(evt){
             Sprite.prototype._tick.call(this, evt);
             createjs.Sprite.prototype._tick.call(this, evt);
        }

    });

    return Explosion;
});