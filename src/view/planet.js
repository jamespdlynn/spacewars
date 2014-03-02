define(['createjs', 'model/game'],function(createjs, gameData){

    var Bitmap = createjs.Bitmap;

    var Planet = function (model){
        this.model = model;
        this.initialize();
    };

    Planet.prototype = new Bitmap();

    extend.call(Planet.prototype, {

        initialize : function(){

            Bitmap.prototype.initialize.call(this);

            this.image = preloader.getResult(this.model.data.key);
            this.regX = this.image.width/2;
            this.regY = this.image.height/2;
            this.alpha = 0.3;
            this.tickEnabled = false;
        },

        updateContext : function(ctx){
            var data = this.model.data;
            var scale = ((gameData.scaleX+gameData.scaleY)/2) * data.scale;
            this.x = data.posX*gameData.scaleX;
            this.y = data.posY*gameData.scaleY;
            this.scaleX = scale;
            this.scaleY = scale;

            Bitmap.prototype.updateContext.call(this,ctx);
        }
    });

    return Planet;
});