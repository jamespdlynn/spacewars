define(function(){

    return {
       MIN_WORLD_SIZE : 1,
       MAX_WORLD_SIZE : 12,
       FPS : 60,
       SERVER_UPDATE_INTERVAL : 1000, //milliseconds
       CLIENT_UPDATE_INTERVAL : 500,
       COLLISION_DETECT_INTERVAL : 100,
       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],

       Zone : {
           width : 2200,
           height : 1375
       },

       Planet : {
           width : 512,
           height : 512,
           minScale :  0.7
       },

       Player : {
           width : 72,
           height : 72,
           maxVelocity : 140,
           thrust : 80,
           fireInterval : 1200,
           invulnerableTime : 2500
       },

       Missile : {
           width : 12,
           height : 28,
           acceleration : 350,
           jerk : 50
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