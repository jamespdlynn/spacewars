define(['model/dispatcher','model/zone','model/constants'], function(EventDispatcher,Zone,Constants){

    var GameData = function(){
        this.initialize();
    };

    extend.call(GameData.prototype, Zone.prototype, EventDispatcher.prototype, {

        initialize : function(){

            Zone.prototype.initialize.call(this);

            this.roundKills = 0;
            this.latency = 0;
            this.userPlayer = null;

            try{
                this.user = JSON.parse(localStorage.getItem("user"));
            }catch(e){
                console.warn("Could not load user from local storage: "+e.msg);
            }

            this.user = this.user || {
                username : "",
                kills : 0,
                deaths : 0,
                muted : false
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

        setUsername : function(value){
            this.user.username = value;
            this.trigger(Constants.Events.USER_CHANGED);

            return this;
        },

        incrementKills : function(){
            this.roundKills++;
            this.user.kills++;
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

        reset : function(){
            Zone.prototype.reset.call(this);

            this.latency = 0;
            this.roundKills = 0;
            this.userPlayer = undefined;

            return this;
        },

        getZoneString : function(){
            return this.toString.call({id:this.zone});
        }
    });

    return new GameData();
});