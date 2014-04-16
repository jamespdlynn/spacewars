define(['createjs','graphics/lightmissile','model/game','model/constants'],
    function(createjs,missileGraphic,gameData,Constants){
        'use strict';

        var CONTAINER_WIDTH = 220;
        var CONTAINER_HEIGHT = Constants.Missile.height;
        var GRAPHIC_WIDTH = Constants.Missile.width*2;

        var Ammo = function(){
             this.initialize();
        };

        Ammo.prototype = new createjs.Container();

        extend.call(Ammo.prototype, {

            initialize : function(){
                createjs.Container.prototype.initialize.call(this);
                this.setBounds(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT);
                this.reloadSound = new createjs.Sound("reloadSound");
            },

            _tick : function(){
                var ammo = gameData.userPlayer.get("ammo");
                var numChildren = this.getNumChildren();

                if (ammo !== numChildren){
                    while (numChildren < ammo){
                        var graphic = missileGraphic.clone();
                        graphic.x = numChildren * GRAPHIC_WIDTH;
                        this.addChild(graphic);
                        numChildren++;
                    }

                    while (numChildren > ammo){
                        this.removeChildAt(numChildren-1);
                        numChildren--;
                        if (!numChildren){
                            this.reloadSound.play();
                        }
                    }
                    
                    this.cache(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT);
                }
            }
        });

        return Ammo;
    }
);