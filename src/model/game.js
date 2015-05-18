define(['model/dispatcher','model/zone','model/constants'], function(EventDispatcher,Zone,Constants){

    var TIPS = [
        "Click the ? icon at the top of your screen for game info and complete list of controls",
        "Your shield ( RMB ) will protect you from enemy fire, but direct hits will quickly deplete it!",
        "Playing in full screen mode ( F ) gives you greater field of vision.",
        "Press ( R ) at any time to manually reload your ship's missiles.",
        "Utilize the camera control keys ( Z ) and ( C ) to better position your ship.",
        "Destroying enemies increases your own ship's fuel, shields, ammo and max speed.",
        "When in close vicinity of an enemy, you can use your shield as a weapon!",
        "If your shield is depleted, protect yourself by targeting incoming enemy missiles.",
        "Always wear sunscreen when playing outside to protect yourself from harmful UV rays."
    ];

    var GameData = function(){
        this.initialize();
    };

    extend.call(GameData.prototype, Zone.prototype, EventDispatcher.prototype, {

        initialize : function(){

            Zone.prototype.initialize.call(this);

            this.latency = 0;
            this.roundKills = 0;
            this.userPlayer = undefined;
            this.cameraLocked = true;

            this.user = {
                muted : false,
                tipIndex : 0,
                hasPlayed : false
            };

            return this;
        },

        reset : function(){
            Zone.prototype.reset.call(this);

            this.latency = 0;
            this.userPlayer = undefined;
            this.cameraLocked = true;

            return this;
        },

        set : function(data, options){

            Zone.prototype.set.call(this, data, options);

            if (data.playerId){
                this.userPlayer = this.players.get(data.playerId);

                var oldZone = this.zone;
                this.zone = this.userPlayer.get("zone");

                if (oldZone !== this.zone){
                    this.trigger(Constants.Events.ZONE_CHANGED, {oldZone:oldZone, newZone:this.zone});
                }
            }

            return this;
        },

        getTip : function(){
            var tip = TIPS[this.user.tipIndex];
            this.user.tipIndex = (this.user.tipIndex+1)%TIPS.length;
            this.trigger(Constants.Events.USER_CHANGED);
            return tip;
        },

        setMuted : function (value){
            this.user.muted = !!value;
            this.trigger(Constants.Events.USER_CHANGED);
            return this;
        },

        setLatency : function(value){
            this.latency = value;
            this.trigger(Constants.Events.LATENCY_CHANGED, value);
            return this;
        },

        getZoneString : function(){
            return this.toString.call({id:this.zone});
        }
    });

    return GameData;
});