define(['models/dispatcher','models/constants'],function(EventDispatcher, Constants){
    'use strict';

    var Sprite = function(data){
         this.initialize(data);
    };

    Sprite.getHypotenuse = function(x, y){
        return Math.sqrt((x*x)+(y*y));
    };

    extend.call(Sprite.prototype, EventDispatcher.prototype, {

        type : "Sprite",

        defaults : {
            id : 0,
            zone : 0,
            angle : 0,
            posX : 0,
            posY : 0,
            velocityX :0,
            velocityY: 0,
            isInvulnerable : false,
            alive : true
        },

        initialize : function(data){
            this.id = data.id || 0;
            this.data = {};
            this.changed = {};
            this.created = this.lastUpdated = Date.now();

            extend.call(this.data, this.defaults);
            this.set(data);
        },

        /** @param {string} key*/
        get : function(key){
            return this.data[key];
        },

        /** @param {string | object} key @param {*} [val] @param {object} [options] */
        set: function(key, val, options) {
            //Allow for either key/value or object to be sent as setter
            if (!key) return this;

            var attrs;
            if (typeof key === 'object'){ attrs = key; options = val;}
            else {(attrs = {})[key] = val;}

            options = options || {};

            if (!options.silent) this.changed = {};

            //Loop through the new object and set new attributes on the player
            for (var key in attrs){

                if (!this.defaults.hasOwnProperty(key)) continue;

                var value = attrs[key];

                if (this.data[key] !== value){

                    if (!options.silent) this.changed[key] = value;

                    if (key === "zone" && this.data.zone >= 0){
                        var adjustedPos = this.zoneAdjustedPosition(value);
                        if (!attrs.hasOwnProperty("posX") || options.easing){
                            this.data.posX = adjustedPos.posX;
                        }
                        if (!attrs.hasOwnProperty("posY") || options.easing){
                            this.data.posY = adjustedPos.posY;
                        }
                        this.data.zone = value;
                    }
                    else if (!options.easing || (key !== "posX" && key !== "posY")){
                        this.data[key] = value;
                    }
                }

            }

            if (options.easing){

                this.easeX = attrs.posX - this.data.posX;
                this.easeY = attrs.posY - this.data.posY;

                var distance =  Sprite.getHypotenuse(this.easeX, this.easeY);
                if (distance > (this.maxVelocity || this.velocity || 100)){
                    this.data.posX = attrs.posX;
                    this.data.posY = attrs.posY;
                    this.easeX = this.easeY = 0;
                }
            }
            else{
                if (this.easeX && attrs.hasOwnProperty("posX")) this.easeX = 0;
                if (this.easeY && attrs.hasOwnProperty("posY")) this.easeY = 0;
            }

            return this;
        },

        /**@param {number | object} [deltaTime], @param {object} [options] */
        update : function(deltaTime, options){

            if (this.data.alive === false){
                return this;
            }

            var currentTime = Date.now();

            if (typeof deltaTime === 'object'){
                options = deltaTime;
                deltaTime = currentTime-this.lastUpdated;
            }else{
                options = options || {};
                deltaTime = deltaTime || currentTime-this.lastUpdated;
            }

            //Ignore minor updates
            if (deltaTime >= 5){

                this._updateData(deltaTime/1000);

                if (this.easeX || this.easeY){
                    var interval = deltaTime/Constants.SERVER_UPDATE_INTERVAL;
                    this.data.posX += (this.easeX * interval);
                    this.data.posY += (this.easeY * interval);
                }

                this.lastUpdated = currentTime;

                if (!options.silent){
                    this.trigger(Constants.Events.UPDATE);
                }

            }

            return this;
        },

        _updateData : function(){
            return this;
        },


        /** @param {string} [attr] */
        hasChanged: function(attr) {
            if (attr == null) return Object.keys(this.changed).length;
            return this.changed.hasOwnProperty(attr);
        },

        detectCollision : function(sprite){

            if (!sprite ||  this.equals(sprite) || !this.isAlive() || !sprite.isAlive() || this.isInvulnerable() || sprite.isInvulnerable()) {
                return false;
            }

            var spriteData = sprite.zoneAdjustedPosition(this.data.zone);

            var dx = this.data.posX - spriteData.posX;
            var dy = this.data.posY - spriteData.posY;
            var radii = this.getRadius() + sprite.getRadius();

            return ( dx * dx ) + ( dy * dy ) < (radii * radii);
        },

        getRadius : function(){
            return Math.max(this.width,this.height)/2;
        },

        collide : function(){
            this.set('alive', false);
            return this;
        },

        getRect : function(){

            var data = this.data;
            var radius = this.height/2;

            return {
                left : data.posX - radius,
                right : data.posX + radius,
                top : data.posY - radius,
                bottom: data.posY + radius
            };
        },

        equals : function(sprite){
            return (sprite && sprite.type == this.type && sprite.id == this.id);
        },

        outOfBounds : function(){
            var data = this.data;
            var rect = this.getRect();

            if (rect.top < 0 && (data.velocityY < 0 || rect.bottom < 0)) return "top";
            if (rect.bottom >= Constants.Zone.height && (data.velocityY > 0 || rect.top >= Constants.Zone.height)) return "bottom";
            if (rect.left < 0 && (data.velocityX < 0 || rect.right < 0)) return "left";
            if (rect.right >= Constants.Zone.width && (data.velocityX > 0 || rect.left >= Constants.Zone.width)) return "right";

            return false;
        },

        getDistance : function(sprite){

            if (!sprite || this.equals(sprite)){
                return 0;
            }

            var data = this.zoneAdjustedPosition(sprite.get("zone"));

            var deltaX = data.posX - sprite.data.posX;
            var deltaY = data.posY - sprite.data.posY;

            return Sprite.getHypotenuse(deltaX, deltaY);
        },

        averagePosition : function(sprite){
            var posX = this.data.posX;
            var posY = this.data.posY;

            if (!sprite || this.equals(sprite)){
               return {posX : posX,posY : posY};
            }

            var deltaX = sprite.data.posX - posX;
            var deltaY = sprite.data.posY - posY;

            var distance =  Sprite.getHypotenuse(deltaX, deltaY)/2;
            var angle = Math.atan2(deltaY, deltaX);

            return {
                posX: posX + Math.cos(angle)*distance,
                posY: posY + Math.sin(angle)*distance
            };
        },

        zoneAdjustedPosition : function(zone){
            var data = this.data;

            if (data.zone === zone){
                return {posX:data.posX,posY:data.posY};
            }

            var worldSize = Constants.WORLD_SIZE;

            var rowDiff = Math.floor(data.zone/worldSize) - Math.floor(zone/worldSize);
            if (Math.abs(rowDiff) > worldSize/2){
                rowDiff = rowDiff > 0 ? rowDiff-worldSize : rowDiff+worldSize;
            }

            var colDiff = (data.zone%worldSize) - (zone%worldSize);
            if (Math.abs(colDiff) > worldSize/2){
                colDiff = colDiff > 0 ? colDiff-worldSize : colDiff+worldSize;
            }


            return {
                posX : data.posX + (colDiff * Constants.Zone.width),
                posY : data.posY + (rowDiff * Constants.Zone.height)
            }

        },

        toString : function(){
            return this.type + this.id;
        },

        toJSON : function(){
            return this.data;
        },

        clone : function(){
            var clone = new (this.constructor)(this.data);
            for (var key in this){
                if (this.hasOwnProperty(key) && key !== "data"){
                    clone[key] = this[key];
                }
            }

            return clone;
        },

        is : function(type){
            return this.type.toLowerCase() == type.toLowerCase();
        },

        isAlive : function(){
            return !!this.get('alive');
        },

        isInvulnerable : function(){
            return !!this.get('isInvulnerable');
        },

        reset : function(){
            extend.call(this.data, this.defaults);
        }
    });


    return Sprite;
});


