define(['createjs','graphics/lightmissile','model/game','model/constants'],
    function(createjs,missileGraphic,gameData,Constants){
        'use strict';


        var GRAPHIC_WIDTH = Constants.Missile.width*2;
        var SCALE = 0.9;
        var CONTAINER_WIDTH = GRAPHIC_WIDTH * SCALE * Constants.Player.maxAmmo;
        var CONTAINER_HEIGHT = Constants.Missile.height;

        var Ammo = function(){
             this.initialize();
        };

        Ammo.prototype = new createjs.Container();

        extend.call(Ammo.prototype, {

            initialize : function(){
                createjs.Container.prototype.initialize.call(this);
                this.setBounds(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT);
                this.reloadSound = createjs.Sound.createInstance("reloadSound");
                this.scaleX = this.scaleY = SCALE;
            },

            _tick : function(){
                var ammo = gameData.userPlayer.get("ammo");
                var numChildren = this.getNumChildren();

                if (ammo !== numChildren){

                    console.log(ammo);

                    this.removeAllChildren();

                    for (var i=0; i < ammo; i++){
                        var graphic = new createjs.DisplayObject();
                        graphic.cacheCanvas = missileGraphic.cacheCanvas;
                        graphic.x = CONTAINER_WIDTH - (GRAPHIC_WIDTH/2) - (i * GRAPHIC_WIDTH);
                        this.addChild(graphic);
                    }

                    if(!ammo){
                        this.reloadSound.play();
                    }
                }
            }
        });

        return Ammo;
    }
);