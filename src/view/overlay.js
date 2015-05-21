define(['createjs','view/user','view/gauges','view/ammo','view/radar', 'model/constants'],
    function(createjs, UserContainer, Gauges, Ammo, Radar, Constants){
        'use strict';

        var Container = createjs.Container;

        var Overlay = function (){

            this.user = new UserContainer();
            this.gauges = new Gauges();
            this.ammo = new Ammo();
            this.radar = new Radar();
            this.zoneLabel = new createjs.Text("","12px Arkitech", "#fff");
            this.alpha = 0.9;

            this.initialize();
        };

        Overlay.prototype = new Container();

        extend.call(Overlay.prototype, {

            initialize : function(){
                Container.prototype.initialize.call(this);

                this.updateZone();
                gameData.on(Constants.Events.ZONE_CHANGED, this.updateZone.bind(this));

                this.addChild(this.gauges, this.user, this.ammo, this.radar, this.zoneLabel);
            },

            setBounds : function(x, y, width, height){
                Container.prototype.setBounds.call(this, x, y, width, height);

                this.user.x = 0;
                this.user.y = 0;

                this.gauges.x = 0;
                this.gauges.y = height- this.gauges.getBounds().height;

                this.ammo.x = 40;
                this.ammo.y = this.gauges.y - this.ammo.getBounds().height - 2;

                this.radar.x = width-(this.radar.getBounds().width/2);
                this.radar.y = height-(this.radar.getBounds().height/2)-5;

                this.zoneLabel.x = width - this.radar.getBounds().width - this.zoneLabel.getMeasuredWidth() + 5;
                this.zoneLabel.y = height - this.zoneLabel.getMeasuredHeight();
            },

            updateZone : function(){
                this.zoneLabel.text = "Sector "+gameData.getZoneString();
                this.zoneLabel.cache(0, 0, this.zoneLabel.getMeasuredWidth(), this.zoneLabel.getMeasuredHeight());
            }

        });



        return Overlay;
    }
);