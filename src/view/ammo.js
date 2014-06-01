define(['createjs','graphics/lightmissile','model/constants'],
    function(createjs,missileGraphic,Constants){
        'use strict';


        var GRAPHIC_WIDTH = Constants.Missile.width*2;
        var SCALE = 0.9;

        var Ammo = function(){
             this.initialize();
        };

        Ammo.prototype = new createjs.Container();

        extend.call(Ammo.prototype, {

            initialize : function(){
                createjs.Container.prototype.initialize.call(this);

                this.reloadSound = createjs.Sound.createInstance("reloadSound");
                this.scaleX = this.scaleY = SCALE;
                this.setBounds(0, 0, GRAPHIC_WIDTH*SCALE*Constants.Player.maxAmmo, Constants.Missile.height);
            },

            _tick : function(){
                var ammo = gameData.userPlayer.get("ammo");
                var numChildren = this.getNumChildren();

                if (ammo !== numChildren){
                    this.removeAllChildren();

                    for (var i=0; i < ammo; i++){
                        var graphic = new createjs.DisplayObject();
                        graphic.cacheCanvas = missileGraphic.cacheCanvas;
                        graphic.x = (i * GRAPHIC_WIDTH);
                        this.addChild(graphic);
                    }

                    if(!ammo){
                        this.reloadSound.play();
                    }

                    this.cache(0, 0, GRAPHIC_WIDTH*gameData.userPlayer.maxAmmo, Constants.Missile.height);
                }
            }
        });

        return Ammo;
    }
);