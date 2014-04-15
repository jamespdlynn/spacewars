define(['createjs','view/sprite','graphics/lightmissile','graphics/darkmissile','model/game'],
    function(createjs, Sprite, userMissileBody, enemyMissileBody, gameData){
        'use strict';

        var Missile = function (model){
            this.initialize();
            this.setModel(model);

            this.mouseEnabled = false;
        };

        Missile.prototype = new createjs.DisplayObject();

        extend.call(Missile.prototype, Sprite.prototype, {
            setModel : function(model){
                Sprite.prototype.setModel.call(this, model);
                this.cacheCanvas = (model.get("playerId") === gameData.userPlayer.id) ? userMissileBody.cacheCanvas : enemyMissileBody.cacheCanvas;
                this.rotation = Math.toDegrees(model.get("angle")) + 90;
            }
        });


        return Missile;
});