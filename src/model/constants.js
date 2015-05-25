define(function(){

    'use strict';

    return {
       WS_PORT : "8080",

       WORLD_SIZE : 16,
       MIN_PLAYERS :  4,
       MAX_PLAYERS : 256,
       MAX_BUFFER_LENGTH : 5000,

       SERVER_UPDATE_INTERVAL : 800, //milliseconds
       CLIENT_UPDATE_INTERVAL : 200,
       COLLISION_DETECT_INTERVAL : 50,

       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],
       ASSETS_URL : "http://dazx2ug0v9sfb.cloudfront.net/",
       //ASSETS_URL : "/assets/",

       FPS : 60,
       SCROLL_SPEED : 700,
       GAUGE_WIDTH : 200,

       Zone : {
           width : 1280,
           height : 960
       },

       Planet : {
           width : 540,
           height : 540,
           minScale : 0.6
       },

       Player : {
           width : 52,
           height : 52,
           mass : 100,
           acceleration : 340,
           maxVelocity : 170,
           rotationRate : 5.8,
           maxAmmo : 6,
           fireInterval : 500,
           reloadTime : 3000,
           maxFuel : 100,
           fuelUseRate : 30,
           fuelRestoreRate : 25,
           maxShields : 100,
           shieldUseRate : 12,
           shieldRestoreRate : 3,
           shieldPadding : 12,
           shieldHitDiscount : 30,
           shieldDownTime : 8000,
           invulnerableTime : 2000,
           maxLevel : 6
       },

       Missile : {
           width : 12,
           height : 18,
           mass : 50,
           velocity : 345,
           maxDistance : 1000
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
           LATENCY_CHANGED : "latencyChanged",
           UPDATE : "update",
           KEYDOWN : "keydown"
       }
    }

});