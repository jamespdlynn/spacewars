define(['createjs','views/ship','graphics/lightship'],function(createjs,StarShip,userShipBody){
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

            this.isShieldBroken = false;
            this.kills = 0;

            this.alertSound = createjs.Sound.createInstance('alertSound');
            this.powerUpSound = createjs.Sound.createInstance('powerUpSound');

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

            this.angle = this.angle || this.model.get('angle');

            if (this.rotateDirection == "left") {
                this.angle -= this.model.rotationRate * (evt[0].delta / 1000);
                if (this.angle < -Math.PI) this.angle += Math.PI * 2;
            }
            else if (this.rotateDirection == "right"){
                this.angle += this.model.rotationRate * (evt[0].delta / 1000);
                if (this.angle > Math.PI) this.angle -= Math.PI * 2;
            }

            if (!this.reloadBar.visible){
                if (this.model.get('ammo') == 0){
                    this.reloadBar.visible = true;
                    this.reloadBar.scaleX = 0;
                }
            }
            else{
                if (this.model.get("ammo") > 0){
                    this.reloadBar.visible = false;
                }else{
                    this.reloadBar.scaleX += (evt[0].delta / this.model.reloadTime);
                    this.reloadBar.scaleX = Math.min(this.reloadBar.scaleX, 1);
                }
            }

            if (!this.model.canAccelerate()){
                this.isAccelerating = false;
            }

            if (!this.model.canShield()){
                this.isShielded = false;
            }

            if (!this.isShieldBroken && this.model.get('isShieldBroken')){
                this.alertSound.play({delay:500,loop:true});
                this.isShieldBroken = true;
            }
            else if (this.isShieldBroken && !this.model.get('isShieldBroken')){
                this.alertSound.stop();
                this.powerUpSound.play();
                this.isShieldBroken = false;
                this.kills = this.model.get('kills');
            }
            else if (this.model.get('kills') >  this.kills){
                this.kills = this.model.get('kills');
                this.powerUpSound.play();
            }
        }

    });

    return UserShip;
});