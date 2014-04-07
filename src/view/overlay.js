define(['createjs','view/user','view/gauges', 'view/radar'],
    function(createjs, UserContainer, Gauges, Radar){
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
                this.radar = new Radar();

                this.addChild(this.fuelGauge, this.userContainer, this.radar);
            },

            setBounds : function(x, y, width, height){
                Container.prototype.setBounds.call(this, x, y, width, height);

                this.userContainer.x = 0;
                this.userContainer.y = 0;

                this.fuelGauge.x = 0;
                this.fuelGauge.y = height- this.fuelGauge.getBounds().height;

                this.radar.x = width-this.radar.getBounds().width;
                this.radar.y = height-this.radar.getBounds().height;
            }

        });



        return Overlay;
    }
);