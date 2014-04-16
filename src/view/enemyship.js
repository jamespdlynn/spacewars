define(['createjs','view/ship','graphics/darkship'],function(createjs,StarShip,enemyShipBody){
    'use strict';

    var EnemyShip = function (model){

        this.shipBody = new createjs.DisplayObject();
        this.shipBody.cacheCanvas = enemyShipBody.cacheCanvas;

        this.exhaustSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("redExhaustSprites")],
            frames: {width:14, height:15},
            animations: {"play": [0, 1, 2, 3, 2, 1, "play"]},
            framerate : 15
        });

        this.sparkSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("redSparkSprites")],
            frames: {width:64, height:64, count:12},
            animations: {"play": [0, 11, "play"]},
            framerate : 15
        });

        this.shieldColor = {r:200, g:0, b:0};

        this.initialize();
        this.setModel(model);
    };

    EnemyShip.prototype = new StarShip();

    extend.call(EnemyShip.prototype, {

        initialize : function(){
            StarShip.prototype.initialize.call(this);

            this.nameLabel = new createjs.Text("", "8pt Arkitech", "#fff");
            this.nameLabel.alpha = 0.95;

            this.flame1.y += 1;
            this.flame2.x += 1;
            this.flame2.y += 1;

            this.addChild(this.nameLabel);
        },

        setModel : function(model){
            StarShip.prototype.setModel.call(this, model);
            this.nameLabel.text = model.get("username");
        },

        _tick : function(evt){
            StarShip.prototype._tick.call(this, evt);

            this.labelWidth = this.labelWidth || this.nameLabel.getMeasuredWidth();

            if (!this.nameLabel.cacheCanvas && this.labelWidth){
                this.nameLabel.x = -(this.labelWidth/2);
                this.nameLabel.y = (this.model.height/2)+10;
                this.nameLabel.cache(-1, -1, this.labelWidth+2, this.nameLabel.getMeasuredLineHeight()+2);
            }
        }
    });

    return EnemyShip;
});