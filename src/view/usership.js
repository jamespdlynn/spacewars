define(['createjs','view/ship','graphics/user-ship'],function(createjs,StarShip,userShipBody){
    'use strict';

    var UserShip = function (model){

        this.shipBody = userShipBody;

        this.exhaustSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("blueExhaustSprites")],
            frames: {width:16, height:19, count:4},
            animations: {"play": [0, 1, 2, 3, 2, 1, "play"]},
            framerate : 15
        });

        this.sparkSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("blueSparkSprites")],
            frames: {width:64, height:64, count:12},
            animations: {"play": [0, 11, "play"]},
            framerate : 15
        });

        this.shieldColor = {r:0, g:154, b:0};

        this.initialize();
        this.setModel(model);
    };

    UserShip.prototype = new StarShip();

    extend.call(UserShip.prototype, {

        initialize : function(){
            StarShip.prototype.initialize.call(this);

            this.reloadBar = new createjs.Shape();
            this.reloadBar.alpha = 0.95;
            this.reloadBar.visible = false;
            this.addChild(this.reloadBar);
        },

        setModel : function(model){
            StarShip.prototype.setModel.call(this, model);

            this.reloadBar.graphics.beginFill("#fff").drawRect(0, 0, this.model.width, 4);
            this.reloadBar.x = -this.model.width/4;
            this.reloadBar.y = (this.model.height/2) + 14;
            this.reloadBar.cache(-1, -1, this.model.width/2 + 2, 6);
        },

        _tick : function(evt){
            StarShip.prototype._tick.call(this, evt);

            this.reloadBar.scaleX = (this.model.lastUpdated - this.model.lastFired) / this.model.fireInterval;
            this.reloadBar.visible = (this.reloadBar.scaleX < 1);
        }

    });

    return UserShip;
});