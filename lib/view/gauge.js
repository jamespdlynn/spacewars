define(['createjs','model/game'],function(createjs, gameData){

    var WIDTH = 240;
    var HEIGHT = 24;
    var Container = createjs.Container;

    var FuelGauge = function (userShip){
        this.userShip = userShip;
        this.tickChildren = false;
        this.initialize();
    };

    FuelGauge.prototype = new Container();

    extend.call(FuelGauge.prototype, {

        initialize : function(){
            Container.prototype.initialize.call(this);

            this.background = new createjs.Shape();
            this.background.graphics.beginFill("rgba(255,255,255,0.7)").drawRect(0, 0, WIDTH, HEIGHT)
                                     .beginFill("rgba(255,255,255,0.3)").drawRect(0, 0, WIDTH, HEIGHT/2)
                                     .beginStroke("#fff").drawRect(0, 0, WIDTH, HEIGHT);
            this.background.cache(0, 0, WIDTH,HEIGHT);

            this.fill = new createjs.Shape();
            this.fill.graphics.beginFill('#0d91be').drawRect(1, 1, WIDTH-2, HEIGHT-2)
                               .beginFill('rgba(255,255,255,0.3').drawRect(1, 1, WIDTH-2, (HEIGHT-2)/2);;
            this.fill.cache(0, 0, WIDTH,HEIGHT);

            this.addChild(this.background, this.fill);
            this.setBounds(0, 0, WIDTH, HEIGHT);

            this.skewX = 30;
        },

        _tick : function(){
            this.fill.scaleX = this.userShip ? this.userShip.fuel/100 : 1;
        }
    });


    return FuelGauge;
});