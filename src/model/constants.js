define(function(){

    'use strict';

    return {
       WS_PORT : "8080",

       WORLD_SIZE : 16,
       MAX_PLAYERS : 256,
       MAX_MISSILES : 256,

       SERVER_UPDATE_INTERVAL : 1000, //milliseconds
       CLIENT_UPDATE_INTERVAL : 200,
       COLLISION_DETECT_INTERVAL : 100,

       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],
       ASSETS_URL : "http://dazx2ug0v9sfb.cloudfront.net/",
       //ASSETS_URL : "/assets/",

       FPS : 60,
       SCROLL_SPEED : 500,

       Zone : {
           width : 1280,
           height : 960
       },

       Planet : {
           width : 550,
           height : 550,
           minScale : 0.5
       },

       Player : {
           width : 52,
           height : 52,
           mass : 100,
           acceleration : 300,
           maxVelocity : 135,
           maxAmmo : 5,
           fireInterval : 500,
           reloadTime : 3500,
           maxFuel : 100,
           fuelUseRate : 30,
           fuelRestoreRate : 25,
           maxShields : 100,
           shieldUseRate : 10,
           shieldRestoreRate : 4,
           shieldPadding : 12,
           shieldHitDiscount : 50,
           shieldDownTime : 10000,
           invulnerableTime : 2000
       },

       Missile : {
           width : 10,
           height : 18,
           mass : 50,
           velocity : 300,
           maxDistance : 1200
       },

       Events : {
           DEPLOY : "deploy",
           CONNECTED : "connected",
           DISCONNECTED : "disconnected",
           GAME_START : "gameStart",
           GAME_ENDING : "gameEnding",
           GAME_END : "gameEnd",
           PLAYER_UPDATE : "playerUpdate",
           COLLISION : "collision",
           ZONE_CHANGED : "zoneChanged",
           USER_CHANGED : "userChanged",
           UPDATE : "update"
       }
    }

});