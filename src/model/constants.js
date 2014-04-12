define(function(){

    'use strict';

    return {
       WORLD_SIZE : 16,

       SERVER_UPDATE_INTERVAL : 1000, //milliseconds
       CLIENT_UPDATE_INTERVAL : 200,
       COLLISION_DETECT_INTERVAL : 100,
       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],
       ASSETS_URL : "http://dazx2ug0v9sfb.cloudfront.net/",
       //ASSETS_URL : "/assets/",
       FPS : 60,
       SCROLL_SPEED : 600,

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
           maxVelocity : 150,
           fireInterval : 750,
           invulnerableTime : 2000,
           fuelUseRate : 30,
           fuelRestoreRate : 25,
           shieldUseRate : 8,
           shieldRestoreRate : 4,
           shieldPadding : 12,
           shieldHitDiscount : 40,
           shieldDownTime : 10000
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
           GAME_END : "gameEnd",
           PLAYER_UPDATE : "playerUpdate",
           COLLISION : "collision",
           ZONE_CHANGED : "zoneChanged",
           USER_CHANGED : "userChanged",
           UPDATE : "update"
       }
    }

});