 define(['createjs', 'model/game'],function(createjs, gameData){
     'use strict';

    var FRAME_SIZE = 128;

    var Explosion = function (model){

        this.spriteSheet = new createjs.SpriteSheet({
            images: [preloader.getResult("explosionSprites")],
            frames: {width:FRAME_SIZE, height:FRAME_SIZE, regX:FRAME_SIZE/2, regY:FRAME_SIZE/2, count: 48},
            animations: {"play": [0, 48]},
            framerate: 24
        });

        var data = model.zoneAdjustedPosition(gameData.zone);

        this.x = data.posX + gameData.stagePaddingX;
        this.y = data.posY + gameData.stagePaddingY;
        this.scaleX  = model.width/FRAME_SIZE;
        this.scaleY = model.height/FRAME_SIZE;
        this.alpha = 0.95;

        this.initialize(this.spriteSheet, "play");
    };

    Explosion.prototype = new createjs.Sprite();

    return Explosion;
});