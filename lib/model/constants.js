define(function(){

    Number.prototype.toPrecision = function(precision){
        var multiplier = Math.pow(10, precision);
        return  Math.round(this * multiplier) /multiplier;
    };

    //We can cheat and save performance by caching values into our sine and cosine functions
    //as we are only using a limited number of angles to calculate with
    var sin = Math.sin, cos = Math.cos;
    var sines = {};
    for (var i=-Math.PI; i < Math.PI; i+=0.01){
        i = i.toPrecision(2);
        sines[i] = sin(i);
    }
    Math.sin = function(val){
        return sines[val] || sin(val);
    };

    var cosines = {};
    for (var j=-Math.PI; j <= Math.PI; j+=0.01){
        j = j.toPrecision(2);
        cosines[j] = cos(j);
    }
    Math.cos = function(val){
        return cosines[val] || cos(val);
    };

    return {
       MIN_WORLD_SIZE : 1,
       MAX_WORLD_SIZE : 12,
       FPS : 60,
       SERVER_UPDATE_INTERVAL : 1000, //milliseconds
       CLIENT_UPDATE_INTERVAL : 200,
       COLLISION_DETECT_INTERVAL : 100,
       PLANET_KEYS : ["nebula1", "nebula2", "nebula3", "sun", "mercury", "earth", "saturn", "neptune", "green", "purple"],

       Zone : {
           width : 2100,
           height : 1400
       },

       Planet : {
           width : 512,
           height : 512,
           minScale :  0.7
       },

       Player : {
           width : 72,
           height : 72,
           accelerationX : 160,
           accelerationY : 160,
           maxVelocityX : 100,
           maxVelocityY : 100,
           fireInterval : 1000,
           invulnerableTime : 3000
       },

       Missile : {
           width : 12,
           height : 28,
           velocity : 260
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