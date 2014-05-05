define(['createjs','model/game', 'model/constants'],function(createjs, gameData, Constants){
    'use strict';

    var GAUGE_WIDTH = 200;
    var GAUGE_HEIGHT = 24;
    var ICON_SIZE = 24;
    var GAUGE_PADDING = 15;
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

        this.initialize();
    };

    Gauges.prototype = new Container();

    extend.call(Gauges.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.fuelBackground.x = this.fuelFill.x =  this.shieldsBackground.x = this.shieldsFill.x = this.shieldsWarning.x = ICON_SIZE*1.75;
            this.fuelBackground.alpha = this.fuelFill.alpha =  this.shieldsBackground.alpha = this.shieldsFill.alpha = this.shieldsWarning.alpha = 0.8;
            this.fuelBackground.skewX = this.fuelFill.skewX =  this.shieldsBackground.skewX = this.shieldsFill.skewX = this.shieldsWarning.skewX = ICON_SIZE;

            this.shieldsIcon.y = this.shieldsBackground.y = this.shieldsFill.y = this.shieldsWarning.y = ICON_SIZE+GAUGE_PADDING;

            this.fuelBackground.graphics.beginFill("rgba(255,255,255,0.7)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                                        .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.fuelBackground.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);

            this.shieldsBackground.cacheCanvas = this.fuelBackground.cacheCanvas;

            this.fuelFill.graphics.clear()
                .beginFill('#0252fd').drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                .beginFill('rgba(255,255,255,0.3)').drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.fuelFill.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);

            this.shieldsFill.graphics.clear()
                .beginFill('#009a00').drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                .beginFill('rgba(255,255,255,0.3)').drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);

            this.shieldsFill.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);

            this.shieldsWarning.graphics.beginFill("#C00000").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.shieldsWarning.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);
            this.shieldsWarning.visible = false;

            this.addChild(this.fuelBackground, this.fuelFill, this.shieldsBackground, this.shieldsFill, this.shieldsWarning, this.shieldsIcon, this.fuelIcon);

            this.setBounds(0, 0, ICON_SIZE+GAUGE_PADDING+GAUGE_WIDTH, (ICON_SIZE*2)+GAUGE_PADDING);
        },

        _tick : function(evt){
            
            var player = gameData.userPlayer;
            var maxStep = 0.4 * (evt[0].delta/1000);
            var diff;

            diff = (player.maxFuel/100) - this.fuelBackground.scaleX;
            this.fuelBackground.scaleX += Math.min(Math.max(diff, -maxStep), maxStep);

            diff = (player.get("fuel")/100) - this.fuelFill.scaleX;
            this.fuelFill.scaleX += Math.min(Math.max(diff, -maxStep), maxStep);

            diff = (player.maxShields/100) - this.shieldsBackground.scaleX;
            this.shieldsBackground.scaleX += Math.min(Math.max(diff, -maxStep), maxStep);

            diff = (player.get("shields")/100) - this.shieldsFill.scaleX;
            this.shieldsFill.scaleX += Math.min(Math.max(diff, -maxStep), maxStep);


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

        }

    });

    return Gauges;
});