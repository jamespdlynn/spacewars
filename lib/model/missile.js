define(['model/sprite','model/constants'],function(Sprite,Constants){

    var Missile = function(data, options){
        this.initialize(data, options);
    };

    extend.call(Missile.prototype, Sprite.prototype, Constants.Missile, {

        type : "Missile",

        defaults : {
            id : 0,
            posX : 0,
            posY : 0,
            angle : 0,
            velocityX : 0,
            velocityY : 0,
            playerId : 0
        },

        set : function(key, val, options){

            if (key == null) return this;

            var attrs;
            if (typeof key === 'object'){ attrs = key; options = val;}
            else {(attrs = {})[key] = val;}

            if (attrs.hasOwnProperty("angle")){
                attrs.velocityX = (Math.cos(attrs.angle) * this.velocity);
                attrs.velocityY = (Math.sin(attrs.angle) * this.velocity);
            }

            return Sprite.prototype.set.call(this,attrs, options);
        },

        updateData : function(deltaSeconds){
            this.data.posX += this.data.velocityX * deltaSeconds;
            this.data.posY += this.data.velocityY * deltaSeconds;

            return this;
        },

        ease : function(deltaX, deltaY){

            var data = this.data;

            if (Math.abs(deltaX) > this.velocity || Math.abs(deltaY) > this.velocity){
                data.posX += deltaX;
                data.posY += deltaY;
            }else{
                var interval = Constants.SERVER_UPDATE_INTERVAL/1000;
                data.velocityX += deltaX/interval;
                data.velocityY += deltaY/interval;
            }

            return this;
        }

    });


    return Missile;
});