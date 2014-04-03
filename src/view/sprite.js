define(['model/constants','model/game'],function(createjs, Constants,gameData){
    'use strict';

    var Sprite = function (){};

    extend.call(Sprite.prototype, {

        setModel : function(model){
            this.model = model;
            this.setBounds(-model.width/2, -model.height/2, model.width, model.height);
        },

        _tick : function(){
            var data = this.model.update().zoneAdjustedPosition(gameData.zone);

            this.x = data.posX + gameData.stagePaddingX;
            this.y = data.posY + gameData.stagePaddingY;
        },

        destroy : function(){
            this.tickEnabled = false;
            this.visible = false;
            this.model = undefined;
        }
    });


    return Sprite;
});