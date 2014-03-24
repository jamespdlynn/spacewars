define(['createjs','model/game'],function(createjs){

    var GAUGE_WIDTH = 200;
    var GAUGE_HEIGHT = 24;
    var ICON_SIZE = 24;
    var GAUGE_PADDING = 1;
    var RADIUS = 0;
    var Container = createjs.Container;

    var Gauges = function (userShip){
        this.userShip = userShip;
        this.tickChildren = false;


        this.fuelBackground = new createjs.Shape();
        this.fuelFill = new createjs.Shape();

        this.shieldsBackground = new createjs.Shape();
        this.shieldsFill = new createjs.Shape();

        this.fuelIcon = new createjs.Bitmap(preloader.getResult('fuelIcon'));
        this.shieldsIcon = new createjs.Bitmap(preloader.getResult('shieldIcon'));

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


            this.fuelBackground.graphics.beginFill("rgba(255,255,255,0.7)").drawRoundRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT, RADIUS)
                                            .beginFill("rgba(255,255,255,0.3)").drawRoundRectComplex(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2, RADIUS, RADIUS, 0, 0);
            this.fuelBackground.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);


            this.shieldsIcon.x = this.fuelBackground.x + GAUGE_WIDTH + ICON_SIZE;
            this.shieldsIcon.y = 0;

            this.shieldsBackground.x =  this.shieldsFill.x =this.shieldsIcon.x+(ICON_SIZE*1.75);
            this.shieldsBackground.y =  this.shieldsFill.y = GAUGE_PADDING;
            this.shieldsBackground.alpha = this.shieldsFill.alpha = 0.8;
            this.shieldsBackground.skewX = this.shieldsFill.skewX = ICON_SIZE;

            this.shieldsBackground.graphics.beginFill("rgba(255,255,255,0.7)").drawRoundRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT, RADIUS)
                .beginFill("rgba(255,255,255,0.3)").drawRoundRectComplex(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT/2, RADIUS, RADIUS, 0, 0);
            this.shieldsBackground.cache(0, 0,GAUGE_WIDTH, GAUGE_HEIGHT);

            this.addChild(this.fuelBackground, this.fuelFill, this.shieldsBackground, this.shieldsFill, this.shieldsIcon, this.fuelIcon);

            this.setBounds(0, 0, GAUGE_WIDTH, ICON_SIZE);
        },

        _tick : function(){

            if (this.userShip.model){
                var fuel = Math.round(this.userShip.model.get("fuel"));
                if (this.fuel < fuel){
                    this.fuel++;
                }else if (this.fuel > fuel){
                    this.fuel--;
                }

                var shields = Math.round(this.userShip.model.get("shields"));
                if (this.shields < shields){
                    this.shields++;
                }else if (this.shields > shields){
                    this.shields--;
                }
            }

            var width = Math.max(0, GAUGE_WIDTH * (this.fuel/100));
            this.fuelFill.graphics.clear()
                                      .beginFill('#0252fd').drawRect(0, 0, width, GAUGE_HEIGHT)
                                      .beginFill('rgba(255,255,255,0.3').drawRect(0, 0, width, GAUGE_HEIGHT/2);

            width = Math.max(0, GAUGE_WIDTH * (this.shields/100));
            this.shieldsFill.graphics.clear()
                                     .beginFill('#009a00').drawRect(0, 0, width, GAUGE_HEIGHT)
                                     .beginFill('rgba(255,255,255,0.3').drawRect(0, 0, width, GAUGE_HEIGHT/2);
        }
    });

    return Gauges;
});