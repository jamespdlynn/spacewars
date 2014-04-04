define(function(){

    'use strict';

    return {
       WORLD_SIZE : 16,
       FPS : 60,
       SERVER_UPDATE_INTERVAL : 1000, //milliseconds
       CLIENT_UPDATE_INTERVAL : 200,
       COLLISION_DETECT_INTERVAL : 100,
       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],
       ASSETS_URL : "http://dazx2ug0v9sfb.cloudfront.net/",

       Zone : {
           width : 1024,
           height : 768,
           padding : 10
       },

       Planet : {
           width : 512,
           height : 512,
           minScale :  0.7
       },

       Player : {
           width : 65,
           height : 65,
           mass : 100,
           acceleration : 340,
           maxVelocity : 155,
           fireInterval : 750,
           invulnerableTime : 1500,
           fuelUseRate : 30,
           fuelRestoreRate : 30,
           shieldUseRate : 8,
           shieldRestoreRate : 4,
           shieldPadding : 16,
           shieldHitDiscount : 40,
           shieldDownTime : 10000
       },

       Missile : {
           width : 14,
           height : 24,
           mass : 50,
           velocity : 310
       },

       Events : {
           DEPLOY : "deploy",
           CONNECTED : "connected",
           DISCONNECTED : "disconnected",
           GAME_START : "gameStart",
           GAME_END : "gameEnd",
           PLAYER_UPDATE : "playerUpdate",
           COLLISION : "collision",
           ZONE_CHANGED : "zoneChanged",
           USER_CHANGED : "userChanged",
           UPDATE : "update"
       }
    }

});