define(['model/dispatcher','model/constants'],function( EventDispatcher, Constants){
    'use strict';

    var Sprite = function(data, options){
         this.initialize(data, options);
    };

    Sprite.getHypotenuse = function(x, y){
        return Math.sqrt((x*x)+(y*y));
    };

    extend.call(Sprite.prototype, EventDispatcher.prototype, {

        type : "Sprite",

        defaults : {
            id : 0,
            posX : 0,
            posY : 0
        },

        initialize : function(data){
            this.id = data.id || this.defaults.id;
            this.data = {};
            this.changed = {};
            this.lastUpdated = Date.now();

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

            this.changed = {};

            //Loop through the new object and set new attributes on the player
            for (var key in attrs){

                if (!this.defaults.hasOwnProperty(key)) continue;

                var value = attrs[key];

                if (this.data[key] != value){
                    this.changed[key] = value;
                }

                if (key == "posX"){
                    if (options.easing){
                       this.easeX = value-data.posX;
                       continue;
                    }else{
                       this.easeX = 0;
                    }
                }
                else if (key == "posY"){
                    if (options.easing){
                        this.easeY = value-data.posY;
                        continue;
                    }else{
                        this.easeY = 0;
                    }
                }

                this.data[key] = value;
            }

            if (this.easeX || this.easeY){
                var combinedDelta = Sprite.getHypotenuse(this.easeX, this.easeY);

                if (combinedDelta > (this.maxVelocity || this.velocity || 100)){
                    if (attrs.hasOwnProperty("posX")) this.data.posX = attrs.posX;
                    if (attrs.hasOwnProperty("posY")) this.data.posY = attrs.posY;
                    this.easeX = this.easeY = 0;
                }
            }

            return this;
        },

        /**@param {number} [deltaTime]*/
        update : function(deltaTime){

            var currentTime = Date.now();
            deltaTime = deltaTime || currentTime-this.lastUpdated;

            //Ignore minor updates
            if (deltaTime >= 5){

                this.updateData(deltaTime/1000);

                if (this.easeX || this.easeY){
                    var interval = deltaTime/Constants.SERVER_UPDATE_INTERVAL;
                    this.data.posX += (this.easeX * interval);
                    this.data.posY += (this.easeY * interval);
                }

                this.lastUpdated = currentTime;
                this.trigger(Constants.Events.UPDATE);
            }

            return this;
        },

        updateData : function(deltaSeconds){
            return this;
        },


        /** @param {string} [attr] */
        hasChanged: function(attr) {
            if (attr == null) return Object.keys(this.changed).length;
            return this.changed.hasOwnProperty(attr);
        },

        detectCollision : function(sprite){

            if (this.data.isInvulnerable || sprite.data.isInvulnerable){
                return false;
            }

            var dx = this.data.posX - sprite.data.posX;
            var dy = this.data.posY - sprite.data.posY;
            var radii = this.getRadius() + sprite.getRadius();

            return (( dx * dx )  + ( dy * dy ) < radii * radii);
        },

        getRadius : function(){
            return Math.max(this.width,this.height)/2;
        },

        collide : function(){
            return true;
        },

        getRect : function(){
            var rect = {};
            rect.left = this.data.posX - (this.width/2);
            rect.right = rect.left + this.width;
            rect.top = this.data.posY - (this.height/2);
            rect.bottom = rect.top + this.height;

            return rect;
        },

        equals : function(sprite){
            return (sprite && sprite.type == this.type && sprite.id == this.id);
        },

        outOfBounds : function(){
            var rect = this.getRect();

            if (rect.right < 0) return "left";
            if (rect.bottom < 0) return "top";
            if (rect.left >= Constants.Zone.width) return "right";
            if (rect.bottom >= Constants.Zone.height) return "bottom";

            return false;
        },

        distance : function(sprite){

            if (!sprite || this.equals(sprite)){
                return 0;
            }

            var deltaX = sprite.data.posX - this.data.posX;
            var deltaY = sprite.data.posY - this.data.posY;

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

        reset : function(){
            extend.call(this.data, this.defaults);
        }
    });


    return Sprite;
});


