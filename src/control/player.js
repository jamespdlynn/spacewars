define(['microjs','model/constants','model/player','model/missile'],function (micro, Constants, Player, Missile){
        'use strict';

    var MAX_SPRITES = 65536;
    var currentId = 0, spriteMap = {};


    var PlayerManager = {

        create : function(connection,user){
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

            return player;
        },

        destroy : function(player){
            if (player.zone){
                player.zone.removeSprite(player,true);
            }

            clearInterval(player.interval);
            player.off();
            removeSprite(player.id);

            delete player.connection;
            delete player.user;
            delete player.interval

            return player;
        },

        update: function(player, dataObj){

            if (!player || !player.zone) return null;

            //Update player data and set new data object
            player.update().set({
                angle : dataObj.angle,
                isAccelerating : dataObj.isAccelerating && player.canAccelerate(),
                isShielded : dataObj.isShielded && player.canShield()
            });

            if (player.hasChanged()){
                var zone = player.zone;
                //If player is accelerating then send the whole player model to clients, otherwise we can get away with just sending a 4 byte player update
                if ((player.get("isAccelerating") && player.hasChanged("angle")) || player.hasChanged("isAccelerating")){
                    zone.sendPlayer(player);
                }else{
                    zone.sendPlayerUpdate(player);
                }
            }

            if (dataObj.isFiring && player.canFire()){
                fireMissile.call(player);
            }
            else if (dataObj.isReloading && player.canReload()){
                player.set('ammo', 0);
            }

            return player;
        }

    };

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

    function fireMissile(){

        var player = this;

        if (!player.zone) return null;

        var missile = createSprite(Missile);
        missile.set(player.fireMissile());
        missile.player = player;

        missile.interval = setInterval(function(){
            var zone = missile.update().zone;

            if (missile.hasExceededMaxDistance()){
                zone.explodeSprite(missile);
            }else{
                zone.sendMissile(missile);
            }

        }, Constants.SERVER_UPDATE_INTERVAL);

        missile.on(Constants.Events.COLLISION, onMissileCollision);

        player.zone.addMissile(missile);

        return missile;
    }


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
            sendPlayerInfo.call(player);
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

        if (sprite && sprite.type === "Player" && !sprite.isAlive() && missile.player){
            missile.player.update().incrementKills().refresh();
            sendPlayerInfo.call(missile.player);
        }

        delete missile.interval;
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

