 define(['createjs', 'model/game'],function(createjs, gameData){

    var Sprite = createjs.Sprite;
    var FRAME_SIZE = 128;
    var spriteSheet = null;

    var Explosion = function (posX, posY, size){

        spriteSheet = spriteSheet || new createjs.SpriteSheet({
            images: [preloader.getResult("explosionSprites")],
            frames: {width:FRAME_SIZE, height:FRAME_SIZE, regX:FRAME_SIZE/2, regY:FRAME_SIZE/2, count: 48},
            animations: {"play": [0, 48]},
            framerate: 24
        });

        this.posX = posX;
        this.posY = posY;
        this.scale = size/FRAME_SIZE;
        this.alpha = 0.95;

        this.initialize(spriteSheet, "play");
    };

    Explosion.prototype = new Sprite();

    extend.call(Explosion.prototype, {

        updateContext : function(ctx){
            var scale =  ((gameData.scaleX+gameData.scaleY)/2) * this.scale;
            this.x = this.posX*gameData.scaleX;
            this.y = this.posY*gameData.scaleY;
            this.scaleX = scale;
            this.scaleY = scale;

            Sprite.prototype.updateContext.call(this,ctx);
        }

    });

    return Explosion;
});