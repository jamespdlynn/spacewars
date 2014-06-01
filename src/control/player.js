define(['microjs','model/constants','model/player','model/missile'],function (micro, Constants, Player, Missile){
        'use strict';

    var currentPlayerId = 0, currentMissileId = 0;
    var playerMap = {}, missileMap = {};

    var PlayerManager = function(connection,username){
        do{
            currentPlayerId = (currentPlayerId+1)%Constants.MAX_PLAYERS;
        } while (playerMap[''+currentPlayerId]);


        this.player = playerMap[''+currentPlayerId] = new Player({id:currentPlayerId,username:username});
        this.player.connection = connection;
        this.player.zone = null;
        this.player.on(Constants.Events.UPDATE, onPlayerUpdate);
        this.player.on(Constants.Events.COLLISION, onPlayerCollision);
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

            clearTimeout(this.reloadTimeout);
            this.reloadTimeout = undefined;

            this.player.off();
            delete playerMap[''+this.player.id];

            this.player.connection = undefined;
            this.player.zone = undefined;
            this.player.timeout = undefined;
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

            missile.on(Constants.Events.UPDATE, onMissileUpdate);
            missile.on(Constants.Events.COLLISION, onMissileCollision);

            this.player.zone.addMissile(missile);
        }

    });


    function onPlayerUpdate(){

        var player = this;
        var zone = player.zone;

        if (!zone) return;


        if (player.get("isInvulnerable") && player.lastUpdated-player.created >= player.invulnerableTime){
            player.set("isInvulnerable", false);
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
            }, player.shieldDownTime);
        }

        if (player.get("ammo") === 0 && !player.isReloading){
            player.isReloading = true;

            setTimeout(function(){
                if (!player.zone || !player.isReloading) return;
                player.reload().update();
                delete player.isReloading;
            }, player.reloadTime);
        }

        sendPlayerInfo.call(player);
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
            slayer.update({silent:true}).incrementKills().refresh();
            sendPlayerInfo.call(slayer);
        }

    }

    function onMissileUpdate(){
        if (this.zone && this.hasExceededMaxDistance()){
           this.zone.explodeSprite(this);
        }
    }

    function onMissileCollision(){
        this.zone = undefined;
        this.off();
        delete missileMap[''+this.id];
    }

    function sendPlayerInfo(){
        if (!this.connection) return;

        var buffer = micro.toBinary(this.toJSON(), "PlayerInfo");
        this.connection.out.write(buffer);
    }

    return PlayerManager;
});

