define(['createjs','view/user','view/gauges'],
    function(createjs, UserContainer, Gauges){
        'use strict';

        var Container = createjs.Container;

        var Overlay = function (){
            this.initialize();
        };

        Overlay.prototype = new Container();

        extend.call(Overlay.prototype, {

            initialize : function(){
                Container.prototype.initialize.call(this);

                this.userContainer = new UserContainer();
                this.fuelGauge = new Gauges();

                this.userContainer.x = 0;
                this.userContainer.y = 0;

                this.fuelGauge.x = 0;

                this.addChild(this.fuelGauge, this.userContainer);
            },

            setBounds : function(x, y, width, height){
                Container.prototype.setBounds.call(this, x, y, width, height);

                this.fuelGauge.y = height- this.fuelGauge._bounds.height;
            }

        });



        return Overlay;
    }
);