define(function(){

    return {
       MIN_WORLD_SIZE : 1,
       MAX_WORLD_SIZE : 12,
       FPS : 60,
       SERVER_UPDATE_INTERVAL : 1000, //milliseconds
       CLIENT_UPDATE_INTERVAL : 200,
       COLLISION_DETECT_INTERVAL : 100,
       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],

       Zone : {
           width : 1980,
           height : 1300,
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
           acceleration : 340,
           maxVelocity : 155,
           fireInterval : 1200,
           invulnerableTime : 2500,
           fuelUseRate : 30,
           fuelRestoreRate : 30
       },

       Missile : {
           width : 14,
           height : 26,
           velocity : 275
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
           USER_CHANGED : "userChanged"
       }
    }

});