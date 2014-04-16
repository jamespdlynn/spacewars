define(['createjs','view/user','view/gauges','view/ammo','view/radar'],
    function(createjs, UserContainer, Gauges, Ammo, Radar){
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
                this.gauges = new Gauges();
                this.ammo = new Ammo();
                this.radar = new Radar();

                this.addChild(this.fuelGauge, this.userContainer, this.ammo, this.radar);
            },

            setBounds : function(x, y, width, height){
                Container.prototype.setBounds.call(this, x, y, width, height);

                this.userContainer.x = 0;
                this.userContainer.y = 0;

                this.gauges.x = 0;
                this.gauges.y = height- this.fuelGauge.getBounds().height;

                this.ammo.x = 0;
                this.ammo.y = this.gauges.y - this.ammo.getBounds().height - 5;

                this.radar.x = width-this.radar.getBounds().width;
                this.radar.y = height-this.radar.getBounds().height;
            }

        });



        return Overlay;
    }
);