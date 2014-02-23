define(['createjs','model/game'],function(createjs){

    var WIDTH = 240;
    var HEIGHT = 24;
    var Container = createjs.Container;

    var FuelGauge = function (userShip){
        this.userShip = userShip;
        this.tickChildren = false;

        this.background = new createjs.Shape();
        this.fill = new createjs.Shape();

        this.skewX = 30;

        this.initialize();
    };

    FuelGauge.prototype = new Container();

    extend.call(FuelGauge.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);


            this.background.graphics.beginFill("rgba(255,255,255,0.7)").drawRect(0, 0, WIDTH, HEIGHT)
                                     .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, WIDTH, HEIGHT/2)
                                     .beginStroke("#fff").drawRect(0, 0, WIDTH, HEIGHT);
            this.background.cache(0, 0, WIDTH,HEIGHT);


            this.addChild(this.background, this.fill);
            this.setBounds(0, 0, WIDTH, HEIGHT);

        },

        _tick : function(){
            var fuel = this.userShip && this.userShip.model ? this.userShip.model.get("fuel") : 100;

            var color = (fuel > 10) ?'#0d91be': '#a50900';
            var width = Math.max(10, (WIDTH-2) * (fuel/100));
            var height = HEIGHT-2;

            this.fill.graphics.clear().beginFill(color).drawRect(1, 1, width, height).beginFill('rgba(255,255,255,0.3').drawRect(1, 1, width, height/2);
        }
    });


    return FuelGauge;
});