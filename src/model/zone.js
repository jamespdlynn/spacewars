define(['model/collection','model/constants'], function(SpriteCollection, Constants){
    'use strict';

    var Zone = function (data, options){
        this.id = data.id;
        this.players = new SpriteCollection("Player", data.players, options);
        this.missiles = new SpriteCollection("Missile", data.missiles, options);
        this.planets = new SpriteCollection("Planet", data.planets, options);
    };

    extend.call(Zone.prototype, Constants.Zone, {

        update : function(deltaTime){
            this.players.update(deltaTime);
            this.missiles.update(deltaTime);

            return this;
        },

        get : function(data){
            switch (data.type){
                case "Player":
                    return this.players.get(data.id);

                case "Missile":
                    return this.missiles.get(data.id);

                case "Planet":
                    return this.planets.get(data.id);
            }

            return null;
        },

        remove : function(data){
            if (data){
                switch (data.type){
                    case "Player":
                        return this.players.remove(data.id);

                    case "Missile":
                        return this.missiles.remove(data.id);

                    case "Planet":
                        return this.planets.remove(data.id);
                }
            }

            return null;
        },

        toJSON : function(){
            return {
                id : this.id,
                players : this.players.toJSON(),
                missiles : this.missiles.toJSON(),
                planets : this.planets.toJSON()
            };
        },

        toString : function(){
            var row = Math.floor(this.id/Constants.MAX_WORLD_SIZE);
            var col = this.id%Constants.MAX_WORLD_SIZE;

            return String.fromCharCode(65 + row) + "-"+ (col+1);
        }

    });



    return Zone;
});