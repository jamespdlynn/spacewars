define(['createjs','model/game'],function(createjs){

    var GAUGE_WIDTH = 200;
    var GAUGE_HEIGHT = 24;
    var ICON_SIZE = 24;
    var GAUGE_PADDING = 1;
    var Container = createjs.Container;

    var Gauges = function (userShip){
        this.userShip = userShip;
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

            this.fuelIcon.x = 0;
            this.fuelIcon.y = 0;

            this.fuelBackground.x = this.fuelFill.x = ICON_SIZE*1.75;
            this.fuelBackground.y = this.fuelFill.y = GAUGE_PADDING;
            this.fuelBackground.alpha = this.fuelFill.alpha = 0.8;
            this.fuelBackground.skewX = this.fuelFill.skewX = ICON_SIZE;


            this.fuelBackground.graphics.beginFill("rgba(255,255,255,0.7)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                                            .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.fuelBackground.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);


            this.shieldsIcon.x = this.fuelBackground.x + GAUGE_WIDTH + ICON_SIZE;
            this.shieldsIcon.y = 0;

            this.shieldsBackground.x =  this.shieldsFill.x = this.shieldsWarning.x = this.shieldsIcon.x+(ICON_SIZE*1.75);
            this.shieldsBackground.y =  this.shieldsFill.y = this.shieldsWarning.y = GAUGE_PADDING;
            this.shieldsBackground.alpha = this.shieldsFill.alpha =  this.shieldsWarning.alpha = 0.8;
            this.shieldsBackground.skewX = this.shieldsFill.skewX = this.shieldsWarning.skewX = ICON_SIZE;

            this.shieldsBackground.graphics.beginFill("rgba(255,255,255,0.7)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.shieldsBackground.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);

            this.shieldsWarning.graphics.beginFill("#C00000").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT)
                .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2);
            this.shieldsWarning.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);
            this.shieldsWarning.visible = false;

            this.addChild(this.fuelBackground, this.fuelFill, this.shieldsBackground, this.shieldsFill, this.shieldsWarning, this.shieldsIcon, this.fuelIcon);

            this.setBounds(0, 0, GAUGE_WIDTH, ICON_SIZE);
        },

        _tick : function(){

            if (this.userShip && this.userShip.model){

                var fuelColor = '#0252fd';
                var shieldColor = '#009a00';
                var width;

                var fuel = this.userShip.model.get("fuel");

                if (Math.abs(this.fuel-fuel) > 1){
                    if (this.fuel < fuel){
                        this.fuel++;
                    }else if (this.fuel > fuel){
                        this.fuel--;
                    }
                }else{
                    this.fuel = fuel;
                }

                var shields = this.userShip.model.get("shields")
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

                var isShieldBroken = this.userShip.model.get("isShieldBroken");
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
            else if (this.shieldsWarning.visible){
                this.shieldsWarning.visible = false;
                this.alertSound.stop();
            }

        }

    });

    return Gauges;
});