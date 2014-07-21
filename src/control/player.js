define(['microjs','model/constants','model/player','model/missile'],function (micro, Constants, Player, Missile){
        'use strict';

    var currentPlayerId = 0, currentMissileId = 0;
    var playerMap = {}, missileMap = {};

    var PlayerManager = function(connection,username){
        do{
            currentPlayerId = (currentPlayerId+1)%Constants.MAX_PLAYERS;
        } while (playerMap[''+currentPlayerId]);

        var player = new Player({id:currentPlayerId,username:username});
        player.connection = connection;
        player.zone = null;

        player.on(Constants.Events.UPDATE, onPlayerUpdate);
        player.on(Constants.Events.COLLISION, onPlayerCollision);

        player.interval = setInterval(function(){
           var zone = player.update().zone;
           if (zone){
               zone.sendPlayer(player);
               sendPlayerInfo.call(player);
           }
        }, Constants.SERVER_UPDATE_INTERVAL);

        this.player = playerMap[''+currentPlayerId] = player;
    };


    extend.call(PlayerManager.prototype, {

        updatePlayer : function(dataObj){

            if (!this.player || !this.player.zone) return null;

            //data object validation
            if (dataObj.isAccelerating && !this.player.canAccelerate()) dataObj.isAccelerating = false;
            if (dataObj.isShielded && !this.player.canShield()) dataObj.isShielded = false;
            if (dataObj.isReloading && this.player.canReload()) this.player.set('ammo', 0); //Setting ammo to 0 will trigger a reload on the player update

            //Update player data and set new data object
            this.player.update().set(dataObj);

            if (this.player.hasChanged()){
                var zone = this.player.zone;
                //If player is accelerating then send the whole player model to clients, otherwise we can get away with just sending a 4 byte player update
                if ((this.player.get("isAccelerating") && this.player.hasChanged("angle")) || this.player.hasChanged("isAccelerating")){
                    zone.sendPlayer(this.player);
                }else{
                    zone.sendPlayerUpdate(this.player);
                }
            }

            if (dataObj.isFiring && this.player.canFire()){
                this._fireMissile();
            }

            return this.player;
        },

        destroy : function(){
            if (!this.player) return;

            var zone = this.player.zone;
            if (zone) zone.removeSprite(this.player,true);

            clearInterval(this.player.interval);
            this.player.off();
            delete playerMap[''+this.player.id];

            this.player.connection = undefined;
            this.player.zone = undefined;
            this.player.interval = undefined;
            this.player = undefined;
        },

        _fireMissile : function(){
            if (!this.player || !this.player.zone) return null;

            do{
                currentMissileId = (currentMissileId+1)%Constants.MAX_MISSILES;
            } while (missileMap[''+currentMissileId]);

            var missile = missileMap[''+currentMissileId] = new Missile({id:currentMissileId});
            missile.set(this.player.fireMissile());
            missile.player = this.player;

            missile.interval = setInterval(function(){
                var zone = missile.update().zone;

                if (missile.hasExceededMaxDistance()){
                    zone.explodeSprite(missile);
                }else{
                    zone.sendMissile(missile);
                }

            }, Constants.SERVER_UPDATE_INTERVAL);

            missile.on(Constants.Events.COLLISION, onMissileCollision);

            this.player.zone.addMissile(missile);

            return missile;
        }

    });


    function onPlayerUpdate(){

        var player = this;
        var zone = player.zone;

        if (!zone) return;


        if (player.get("isInvulnerable") && player.lastUpdated-player.created >= player.invulnerableTime){
            player.set("isInvulnerable", false);
            zone.sendPlayerUpdate(this);
        }

        if (player.get("isAccelerating") && !player.canAccelerate()){
            player.set("isAccelerating", false);
            zone.sendPlayer(this);
        }

        if (player.get("shields") === 0 && !player.get("isShieldBroken")){
            player.set({isShielded:false, isShieldBroken:true});
            zone.sendPlayerUpdate(player);

            setTimeout(function(){
                if (!player.zone || !player.get("isShieldBroken")) return;
                player.reShield().update();
                sendPlayerInfo.call(player);
            }, player.shieldDownTime);
        }

        if (player.get("ammo") === 0 && !player.isReloading){
            player.isReloading = true;
            setTimeout(function(){
                if (!player.zone || !player.isReloading) return;
                player.reload().update();
                sendPlayerInfo.call(player);

                delete player.isReloading;
            }, player.reloadTime);
        }
    }

    function onPlayerCollision(sprite){

        var player = this;

        sprite = sprite || {};

        var slayer = null;
        if (sprite.type === "Player"){
            slayer = sprite;
        }else if (sprite.type === "Missile"){
            slayer = sprite.player;
        }

        if (player.connection){
            var buffer = micro.toBinary({slayer: slayer ? slayer.toJSON() : null}, "GameOver");
            player.connection.out.write(buffer);
        }

        if (slayer){
            slayer.update().incrementKills().refresh();
            sendPlayerInfo.call(slayer);
        }

        clearInterval(player.interval);
        player.off();

    }

    function onMissileCollision(){

        var missile = this;

        clearInterval(missile.interval);
        missile.off();
        delete missileMap[''+missile.id];

        missile.player = undefined;
        missile.zone = undefined;
        missile.interval = undefined;
    }

    function sendPlayerInfo(){
        var player = this;

        if (!player.connection) return;

        var buffer = micro.toBinary(this.toJSON(), "PlayerInfo");
        player.connection.out.write(buffer);
    }

    return PlayerManager;
});

