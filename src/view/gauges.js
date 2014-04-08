define(['createjs','model/game'],function(createjs, gameData){
    'use strict';

    var GAUGE_WIDTH = 200;
    var GAUGE_HEIGHT = 24;
    var ICON_SIZE = 24;
    var GAUGE_PADDING = 10;
    var Container = createjs.Container;

    var Gauges = function (){
        this.tickChildren = false;

        this.fuelBackground = new createjs.Shape();
        this.fuelFill = new createjs.Shape();

        this.shieldsBackground = new createjs.Shape();
        this.shieldsFill = new createjs.Shape();
        this.shieldsWarning = new createjs.Shape();

        this.fuelIcon = new createjs.Bitmap(preloader.getResult('fuelIcon'));
        this.shieldsIcon = new createjs.Bitmap(preloader.getResult('shieldIcon'));

        this.alertSound = createjs.Sound.createInstance('alertSound');

        this.fuel = 100;
        this.shields = 100;

        this.initialize();
    };

    Gauges.prototype = new Container();

    extend.call(Gauges.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.fuelBackground.x = this.fuelFill.x =  this.shieldsBackground.x = this.shieldsFill.x = this.shieldsWarning.x = ICON_SIZE*+GAUGE_PADDING;
            this.fuelBackground.alpha = this.fuelFill.alpha =  this.shieldsBackground.alpha = this.shieldsFill.alpha = this.shieldsWarning.alpha = 0.8;
            this.fuelBackground.skewX = this.fuelFill.skewX =  this.shieldsFill.skewX = this.shieldsWarning.skewX = ICON_SIZE;

            this.shieldsIcon.y = this.shieldsBackground.y = this.shieldsFill.y = this.shieldsWarning.y = ICON_SIZE+GAUGE_PADDING;

            this.fuelBackground.graphics.beginFill("rgba(255,255,255,0.7)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                                        .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.fuelBackground.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);

            this.shieldsBackground.cacheCanvas = this.fuelBackground.cacheCanvas;

            this.shieldsWarning.graphics.beginFill("#C00000").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                                        .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.shieldsWarning.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);
            this.shieldsWarning.visible = false;

            this.addChild(this.fuelBackground, this.fuelFill, this.shieldsBackground, this.shieldsFill, this.shieldsWarning, this.shieldsIcon, this.fuelIcon);

            this.setBounds(0, 0, ICON_SIZE+GAUGE_PADDING+GAUGE_WIDTH, (ICON_SIZE*2)+GAUGE_PADDING);
        },

        _tick : function(){

            var fuelColor = '#0252fd';
            var shieldColor = '#009a00';
            var width;

            var fuel = gameData.userPlayer.get("fuel");

            if (Math.abs(this.fuel-fuel) > 1){
                if (this.fuel < fuel){
                    this.fuel++;
                }else if (this.fuel > fuel){
                    this.fuel--;
                }
            }else{
                this.fuel = fuel;
            }

            var shields = gameData.userPlayer.get("shields");
            var diff = Math.abs(this.shields-shields);
            if (diff> 1){
                if (this.shields < shields){
                    this.shields++;
                }else if (this.shields > shields){
                    this.shields--;

                    if (diff >= 5){
                        shieldColor = '#C00000';
                    }
                }
            }
            else{
                this.shields = shields;
            }

            var isShieldBroken = gameData.userPlayer.get("isShieldBroken");
            if (isShieldBroken && !this.shieldsWarning.visible){
                this.shieldsWarning.visible = true;
                this.shieldsWarning.alpha = 0;
                createjs.Tween.get(this.shieldsWarning, {loop:true}).to({alpha:0.5},250).to({alpha:0},250);
                this.alertSound.play({loop:true, delay:500});
            }
            else if (!isShieldBroken && this.shieldsWarning.visible){
                this.shieldsWarning.visible = false;
                createjs.Tween.removeTweens(this.shieldsWarning);
                this.alertSound.stop();
            }

            width = Math.max(0, GAUGE_WIDTH * (this.fuel/100));
            this.fuelFill.graphics.clear()
                .beginFill(fuelColor).drawRect(0, 0, width, GAUGE_HEIGHT)
                .beginFill('rgba(255,255,255,0.3)').drawRect(0, 0, width, GAUGE_HEIGHT/2);

            width = Math.max(0, GAUGE_WIDTH * (this.shields/100));
            this.shieldsFill.graphics.clear()
                .beginFill(shieldColor).drawRect(0, 0, width, GAUGE_HEIGHT)
                .beginFill('rgba(255,255,255,0.3)').drawRect(0, 0, width, GAUGE_HEIGHT/2);

        }

    });

    return Gauges;
});