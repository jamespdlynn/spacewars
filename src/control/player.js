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

        this.reloadTimeout = null;
    };


    extend.call(PlayerManager.prototype, {

        updatePlayer : function(dataObj){

            if (!this.player || !this.player.zone) return null;

            this.player.update();

            if (dataObj.isAccelerating && !this.player.canAccelerate()) dataObj.isAccelerating = false;
            if (dataObj.isShielded && !this.player.canShield()) dataObj.isShielded = false;
            if (dataObj.isFiring && !this.player.canFire()) dataObj.isFiring = false;

            //Update player data and set new data object
            var hasChanged = this.player.update().hasChanged();
            hasChanged = this.player.set(dataObj).hasChanged || hasChanged;

            var zone = this.player.zone;

            //If player is accelerating then send the whole player model to clients, otherwise we can get away with just sending a 4 byte player update
            if ((this.player.get("isAccelerating") && this.player.hasChanged("angle")) || this.player.hasChanged("isAccelerating")){
                zone.sendPlayer(this.player);
            }else if (hasChanged){
                zone.sendToAll("PlayerUpdate", this.player.toJSON());
            }

            if (dataObj.isFiring){
                this._fireMissile();
            }

            return this.player;
        },

        destroy : function(){
            if (!this.player) return;

            var zone = this.player.zone;
            if (zone) zone.removePlayer(this.player,true);

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

        if (this.get("isInvulnerable") && this.lastUpdated-this.created >= this.invulnerableTime){
            this.set("isInvulnerable", false);
        }

        if (this.get("isAccelerating") && !this.canAccelerate()){
            this.set("isAccelerating", false);
        }

        if (this.isShieldBroken() && !this.shieldBroken){
            var self = this;
            self.set("isShielded", false).shieldBroken = true;
            setTimeout(function(){
                self.set("shields", self.maxShields/5);
                self.shieldBroken = false;
            }, self.shieldDownTime);
        }

        if (this.get("ammo") == 0 && !this.isReloading){
            var self = this;
            self.isReloading = true;
            setTimeout(function(){
                self.reload();
                self.isReloading = false;
            }, Constants.Player.reloadTime);
        }

    }

    function onPlayerCollision(sprite){
        if (sprite && sprite.type === "Player"){
            this.incrementKills().update();
        }

        if (!this.get("isShielded") && this.connection){
            var data = {slayer:null};

            if (sprite && sprite.type === "Player"){
                data.slayer = sprite.toJSON();
            }else if (sprite && sprite.type === "Missile" && sprite.player){
                data.slayer = sprite.player.toJSON();
            }

            var buffer = micro.toBinary(data, "GameOver");
            this.connection.out.write(buffer);

            this.zone = null;
        }

    }

    function onMissileCollision(sprite){
        if (sprite && sprite.type === "Player"){
            this.player.incrementKills().update();
        }

        this.off();
        delete missileMap[''+this.id];
    }

    return PlayerManager;
});

