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
            if (dataObj.isReloading && this.player.canReload()){
                this.player.set('ammo', 0); //Setting ammo to 0 will trigger a reload on the player update
            }

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
            do{
                currentMissileId = (currentMissileId+1)%Constants.MAX_MISSILES;
            } while (missileMap[''+currentMissileId]);

            var missile = missileMap[''+currentMissileId] = new Missile({id:currentMissileId});
            missile.set(this.player.fireMissile());
            missile.player = this.player;
            missile.on(Constants.Events.COLLISION, onMissileCollision);

            this.player.zone.addMissile(missile);
        }

    });


    function onPlayerUpdate(){

        var self = this;

        if (this.get("isInvulnerable") && this.lastUpdated-this.created >= this.invulnerableTime){
            this.set("isInvulnerable", false);
        }

        if (this.get("isAccelerating") && !this.canAccelerate()){
            this.set("isAccelerating", false);
            this.zone.sendPlayer(this);
        }

        if (this.get("shields") === 0 && !this.get("isShieldBroken")){
            this.set({isShielded:false, isShieldBroken:true});
            this.zone.sendPlayerUpdate(this);

            setTimeout(function(){
                if (!self.zone || !self.get("isShieldBroken")) return;
                self.reShield().update();
            }, self.shieldDownTime);
        }

        if (this.get("ammo") == 0 && !this.isReloading){
            this.isReloading = true;

            setTimeout(function(){
                if (!self.zone || !self.isReloading) return;

                self.reload().update();
                self.isReloading = false;
            }, Constants.Player.reloadTime);
        }

        sendPlayerInfo.call(this);
    }

    function onPlayerCollision(sprite){

        sprite = sprite || {};

        var slayer = null;
        if (sprite.type === "Player"){
            slayer = sprite;
        }else if (sprite.type === "Missile"){
            slayer = sprite.player;
        }

        if (this.connection){
            var buffer = micro.toBinary({slayer: slayer ? slayer.toJSON() : null}, "GameOver");
            this.connection.out.write(buffer);
        }

        if (slayer){
            slayer.update({silent:true}).incrementKills().refresh();
            sendPlayerInfo.call(slayer);
        }

    }

    function onMissileCollision(){
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

