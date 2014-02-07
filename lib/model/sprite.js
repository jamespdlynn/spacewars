define(['model/constants'],function(Constants){

    var Sprite = function(data, options){
         this.initialize(data, options);
    };

    extend.call(Sprite.prototype, {

        type : "Sprite",

        defaults : {
            id : 0,
            posX : 0,
            posY : 0,
            isInvulnerable : false
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

        /**
         * @param {string} key
         */
        get : function(key){
            return this.data[key];
        },

        /**
         * @param {string | object} key
         * @param {*} [val]
         * @param {object} [options]
         */
        set: function(key, val, options) {
            //Allow for either key/value or object to be sent as setter
            if (!key) return this;

            var attrs;
            if (typeof key === 'object'){ attrs = key; options = val;}
            else {(attrs = {})[key] = val;}

            options = options || {};

            var changed = {};
            var ease = false;
            var data = this.data;

            //Loop through the new object and set new attributes on the player
            for (var key in attrs){

                if (data.hasOwnProperty(key) && data[key] !== attrs[key]){

                    changed[key] = attrs[key];

                    //Ignore position changes if easing boolean is passed through options
                    if (options.easing && (key == "posX" || key == "posY")){
                        ease = true;
                    }else{
                        data[key] = attrs[key];
                    }
                }
            }

            //If easing option passed in, ease this player towards new position values
            if (ease){
                this.ease(attrs.posX-data.posX, attrs.posY-data.posY);
            }

            this.changed = changed;

            return this;
        },

        /**
         * @param {string} [attr]
         */
        hasChanged: function(attr) {
            if (attr == null) return Object.keys(this.changed).length;
            return this.changed.hasOwnProperty(attr);
        },

        /**
         * @param {number} [deltaTime]
         */
        update : function(deltaTime){

            var currentTime = Date.now();
            deltaTime = deltaTime || currentTime-this.lastUpdated;

            //Ignore minor updates
            if (deltaTime >= 5){
                this.updateData(deltaTime/1000);
                this.lastUpdated = currentTime;
            }

            return this;
        },

        updateData : function(deltaSeconds){
            return deltaSeconds;
        },

        ease : function(deltaX, deltaY){
            this.data.posX += deltaX;
            this.data.posY += deltaY;
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
                    posY: posY
                };
             }

            var deltaX = this.data.posX-sprite.data.posX;
            var deltaY = this.data.posY-sprite.data.posY;

            var distance =  Math.sqrt((deltaX*deltaX)+(deltaY*deltaY))/2;
            var angle = Math.atan2(deltaY, deltaX).toPrecision(2);

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