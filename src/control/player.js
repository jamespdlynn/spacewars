define(['microjs','model/constants','model/player','model/missile'],function (micro, Constants, Player, Missile){
        'use strict';

    var MAX_SPRITES = 65536;
    var currentId = 0, spriteMap = {};

    function createSprite(SpriteClass){
        do{
            currentId = (currentId+1)% MAX_SPRITES;  //Increment id
        } while (spriteMap[currentId.toString()]);

        spriteMap[currentId.toString()] = true;

        return new SpriteClass({id:currentId});
    }

    function removeSprite(id){
        delete spriteMap[id.toString()];
    }

    var PlayerManager = function(connection,user){
        var player = createSprite(Player);

        player.connection = connection;
        player.user = user;
        player.zone = null;

        player.set("icon", user.icon);
        player.set("name", user.fullName);

        player.on(Constants.Events.UPDATE, onPlayerUpdate);
        player.on(Constants.Events.COLLISION, onPlayerCollision);

        player.interval = setInterval(function(){
           var zone = player.update().zone;
           if (zone) zone.sendPlayer(player);

           sendPlayerInfo.call(player);
        }, Constants.SERVER_UPDATE_INTERVAL);

        this.player = player;
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

            if (this.player.zone){
                this.player.zone.removeSprite(this.player,true);
            }

            clearInterval(this.player.interval);
            this.player.off();
            removeSprite(this.player.id);

            delete this.player.connection;
            delete this.player.user;
            delete this.player.interval;

            delete this.player;
        },

        _fireMissile : function(){
            if (!this.player || !this.player.zone) return null;

            var missile = createSprite(Missile);
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

        if (this.get('alive')){
            if (sprite && sprite.type === "Player" && !sprite.isAlive()){
                this.update().incrementKills().refresh();
            }
            sendPlayerInfo.call(this);
        }
        else if (player.connection){
            var slayer = null;
            if (sprite && sprite.type === "Player"){
                slayer = sprite.toJSON();
            }else if (sprite && sprite.type === "Missile"){
                slayer = sprite.player.toJSON();
            }

            var buffer = micro.toBinary({slayer:slayer}, "GameOver");
            player.connection.out.write(buffer);

            setTimeout(function(){
                if (player.connection){
                    player.connection.close();
                }
            }, 5000);
        }

    }

    function onMissileCollision(sprite){
        var missile = this;

        clearInterval(missile.interval);
        missile.off();
        removeSprite(missile.id);

        if (missile.zone){
            missile.zone.removeSprite(missile,true);
        }

        if (sprite && sprite.type === "Player" && !sprite.isAlive()){
            this.player.update().incrementKills().refresh();
            sendPlayerInfo.call(this.player);
        }

    }

    function sendPlayerInfo(){
        var player = this;

        if (player.connection){
            var buffer = micro.toBinary(this.toJSON(), "PlayerInfo");
            player.connection.out.write(buffer);
        }
    }

    return PlayerManager;
});

