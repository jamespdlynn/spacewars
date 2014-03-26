define(['createjs','view/user','view/gauges','model/constants','model/game'],
    function(createjs, UserContainer, Gauges, Constants,gameData){
        'use strict';

        var Container = createjs.Container;

        var Overlay = function (userShip){

            this.userContainer = new UserContainer();
            this.fuelGauge = new Gauges(userShip);

            this.alpha = 0.8;
            this.mouseEnabled = false;
            this.initialize();
        };

        Overlay.prototype = new Container();

        extend.call(Overlay.prototype, {

            initialize : function(){
                Container.prototype.initialize.call(this);

                this.userContainer.x = 0;
                this.userContainer.y = 0;

                this.fuelGauge.x = 0;
                this.fuelGauge.visible = false;

                this.addChild(this.fuelGauge, this.userContainer);
            },

            _tick : function(){
                if (this._bounds){
                    this.fuelGauge.visible = true;
                    this.fuelGauge.y = this._bounds.height - this.fuelGauge._bounds.height;
                    this.fuelGauge._tick();
                }
            }

        });



        return Overlay;
    }
);