define(['model/constants','model/game'],function(Constants,gameData){
    'use strict';

    var Sprite = function (){};
    extend.call(
Sprite.prototype, {

        setModel : function(model){
            this.model = model;
            this.setBounds(-model.width/2, -model.height/2, model.width, model.height);
        },

        _tick : function(){
            var data = this.model.update().zoneAdjustedPosition(gameData.zone);

            this.x = data.posX + gameData.offsetX;
            this.y = data.posY+ gameData.offsetY;

            var radius = this.model.getRadius();
            this.visible = this.x >= -radius && this.y >= -radius && this.x <= window.innerWidth+radius && this.y <= window.innerHeight+radius;
        },

        destroy : function(){
            this.tickEnabled = false;
            this.visible = false;
            this.model = undefined;
        }
    });


    return Sprite;
});