define(['createjs','view/user','view/gauge','model/constants','model/game'],
    function(createjs, UserContainer, FuelGauge, Constants,gameData){

        var Container = createjs.Container;

        var Overlay = function (userShip){

            this.zoneLabel = new createjs.Text("","bold 18px Helvetica", "#fff");
            this.latencyLabel =  new createjs.Text("","bold 15px Helvetica", "#fff");

            this.userContainer = new UserContainer();
            this.fuelGauge = new FuelGauge(userShip);

            this.alpha = 0.8;
            this.mouseEnabled = false;
            this.initialize();
        };

        Overlay.prototype = new Container();

        extend.call(Overlay.prototype, {

            initialize : function(){
                Container.prototype.initialize.call(this);

                var zoneLabel = this.zoneLabel;
                setZoneText(zoneLabel);
                gameData.on(Constants.Events.ZONE_CHANGED, function(){
                    setZoneText(zoneLabel);
                });

                this.zoneLabel.tickEnabled = false;
                this.zoneLabel.x = 0;
                this.zoneLabel.y = 0;

                this.latencyLabel.tickEnabled = false;
                this.latencyLabel.x = 0;
                this.latencyLabel.y = 30;
                this.latencyLabel.visible = gameData.debug;

                this.fuelGauge.x = 0;
                this.fuelGauge.y = 0;

                this.addChild(this.zoneLabel, this.fpsLabel, this.latencyLabel, this.userContainer, this.fuelGauge);
            },

            _tick : function(){

                if (gameData.debug){

                    this.latencyLabel.visibile = true;

                    var currentLatency = Math.round(gameData.latency);
                    if (this.latencyLabel.text !== "Ping: "+currentLatency){
                        this.latencyLabel.text = "Ping: "+currentLatency;
                        this.latencyLabel.cache(0, 0,  this.latencyLabel.getMeasuredWidth(),  this.latencyLabel.getMeasuredLineHeight());
                    }
                }

                if (this._bounds){
                    this.fuelGauge.y = this._bounds.height - this.fuelGauge._bounds.height;
                    this.userContainer.y = this.fuelGauge.y -  this.userContainer._bounds.height - 6;
                }

                this.fuelGauge._tick();

            }

        });

        function setZoneText(zoneLabel){
            zoneLabel.text = "Sector "+gameData.currentZone.toString();
            zoneLabel.cache(0, 0, zoneLabel.getMeasuredWidth(), zoneLabel.getMeasuredLineHeight());
        }

        return Overlay;
    }
);