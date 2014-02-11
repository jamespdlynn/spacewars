define(['model/dispatcher','model/zone','model/constants'], function(EventDispatcher,Zone,Constants){

    var GameData = function(){
        this.initialize();
    };

    extend.call(GameData.prototype, EventDispatcher.prototype, {

        initialize : function(){
            this.scaleX = 1;
            this.scaleY = 1;
            this.playerId = 0;
            this.roundKills = 0;

            this.latency = 0;
            this.currentZone = null;
            this.debug = true;

            this.user = JSON.parse(localStorage.getItem("user")) || {
                username : "",
                kills : 0,
                deaths : 0,
                muted : false
            };

            this.on(Constants.Events.USER_CHANGED, function(){
                localStorage.setItem("user", JSON.stringify(this.user));
            });

            return this;
        },

        setCurrentZone : function(data, playerId){

            playerId = playerId || this.playerId;


            if (!this.currentZone || this.currentZone.id !== data.id || this.playerId !== playerId){
                this.currentZone = new Zone(data);
                this.playerId = playerId;

                this.trigger(Constants.Events.ZONE_CHANGED);
            }

            return this;
        },


        isUserInitialized : function(){
            return this.user.username.length > 0;
        },

        setScale : function(scaleX, scaleY){
            this.scaleX = scaleX;
            this.scaleY = scaleY;

            return this;
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
            this.playerId = 0;
            this.currentZone = null;
            this.latency = 0;
            this.roundKills = 0;

            return this;
        }
    });

    return new GameData();
});