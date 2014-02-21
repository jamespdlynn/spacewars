define(['model/constants'],function(Constants){

    var Sprite = function(data, options){
         this.initialize(data, options);
    };

    Sprite.getHypotenuse = function(x, y){
        return Math.sqrt((x*x)+(y*y));
    };

    extend.call(Sprite.prototype, {

        type : "Sprite",

        defaults : {
            id : 0,
            posX : 0,
            posY : 0
        },

        initialize : function(data){

            this.data = {};
            this.changed = {};
            this.lastUpdated = Date.now();

            for (var key in this.defaults){
                this.data[key] = this.defaults[key];
            }
            this.set(data);

            this.id = this.data.id;

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

            var data = this.data;
            var changed = this.changed = {};
            var ease = false;

            //Loop through the new object and set new attributes on the player
            for (var key in attrs){

                if (!data.hasOwnProperty(key)) continue;

                var value = attrs[key];

                if (data[key] != value){

                    if (key == "isInvulnerable"){
                        console.log(data[key]+","+value);
                    }

                    changed[key] = value;
                }

                if (key == "posX"){
                    this.easeX = options.easing ? value-data.posX : 0;
                    if (options.easing) continue;
                }
                else if (key == "posY"){
                   this.easeY = options.easing ? value-data.posY : 0;
                   if (options.easing) continue;
                }

                data[key] = value;
            }

            if (this.easeX || this.easeY){
                var combinedDelta = Sprite.getHypotenuse(this.easeX, this.easeY);

                if (combinedDelta > this.maxVelocity){
                    if (attrs.hasOwnProperty("posX")) data.posX = attrs.posX;
                    if (attrs.hasOwnProperty("posY")) data.posY = attrs.posY;
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

            var rect1 = this.getRect();
            var rect2 = sprite.getRect();
            return (rect1.bottom > rect2.top) && (rect1.top < rect2.bottom) && (rect1.left < rect2.right) && (rect1.right > rect2.left);
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

        averagePosition : function(sprite){
            var posX = this.data.posX;
            var posY = this.data.posY;

             if (!sprite || this.equals(sprite)){
                return {
                    posX : posX,
                    posY : posY
                };
             }

            var deltaX = sprite.data.posX - posX;
            var deltaY = sprite.data.posY - posY;

            var distance =  Math.sqrt((deltaX*deltaX)+(deltaY*deltaY))/2;
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
        }
    });





    return Sprite;
});


//Private helper functions
function getDistance(vi, vf, t){
    return ((vf+vi)/2) * t;
}

function getTime(vi, vf, a){
    return Math.abs((vf-vi)/a);
}

