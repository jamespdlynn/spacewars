define(['model/dispatcher','model/zone','model/constants'], function(EventDispatcher,Zone,Constants){

    var TIPS = [
        "Playing in full screen mode ( f ) gives you greater field of vision.",
        "Your shield ( RMB ) will protect you from enemy fire, but direct hits will quickly deplete it!",
        "Press ( r ) at any time to manually reload your ship's missiles.",
        "Press ( z ) to toggle between locked/free camera modes.",
        "Destroying enemy ships increases your own ship's fuel, shields, ammo and max speed.",
        "If you're in close vicinity in an enemy ship, you can use your shield (RMB) as a weapon!"
    ];

    var GameData = function(){
        this.initialize();
    };

    extend.call(GameData.prototype, Zone.prototype, EventDispatcher.prototype, {

        initialize : function(){

            Zone.prototype.initialize.call(this);

            this.reset();

            try{
                this.user = JSON.parse(localStorage.getItem("user"));
            }catch(e){
                console.warn("Could not load user from local storage: "+e.msg);
            }

            this.user = this.user || {
                username : "",
                kills : 0,
                deaths : 0,
                best : 0,
                muted : false,
                cameraMode : "auto",
                tipIndex : 0
            };

            this.on(Constants.Events.USER_CHANGED, function(){
                try{
                    localStorage.setItem("user", JSON.stringify(this.user));
                }catch(e){
                    console.warn("Could not save user to local storage: "+e.msg);
                }
            });

            return this;
        },

        reset : function(){
            Zone.prototype.reset.call(this);

            this.latency = 0;
            this.roundKills = 0;
            this.userPlayer = undefined;
            this.newBest = false;

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

        isUserInitialized : function(){
            return this.user.username.length > 0;
        },

        getTip : function(){
            var tip = TIPS[this.user.tipIndex];
            this.user.tipIndex = (this.user.tipIndex+1)%TIPS.length;
            this.trigger(Constants.Events.USER_CHANGED);
            return tip;
        },

        setUsername : function(value){
            this.user.username = value;
            this.trigger(Constants.Events.USER_CHANGED);

            return this;
        },

        updateKills : function(){
            var kills = this.userPlayer.get("kills");

            this.user.kills += (kills-this.roundKills);
            this.roundKills = kills;

            if (kills > this.user.best){
                this.user.best = kills;
                this.newBest = true;
            }

            this.trigger(Constants.Events.USER_CHANGED);

            return this;
        },

        incrementDeaths : function(){
            this.user.deaths++;
            this.trigger(Constants.Events.USER_CHANGED);

            return this;
        },

        setMuted : function (value){
            this.user.muted = !!value;
            this.trigger(Constants.Events.USER_CHANGED);

            return this;
        },

        setCameraMode : function(value){
            this.user.cameraMode = value;
            this.trigger(Constants.Events.USER_CHANGED);

            return this;
        },

        getZoneString : function(){
            return this.toString.call({id:this.zone});
        }
    });

    return new GameData();
});