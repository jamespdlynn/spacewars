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

        set : function(data, options){
            this.players.set(data.players, options);
            this.missiles.set(data.missiles, options);
            this.planets.set(data.planets, options);
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

        concat : function(data){
            data.players = data.players.concat(this.players.toJSON());
            data.misisles = data.missiles.concat(this.misisles.toJSON());
            data.planets = data.planets.concat(this.planets.toJSON());
        },

        reset : function(){
            this.players = new SpriteCollection("Player");
            this.missiles = new SpriteCollection("Missile");
            this.planets = new SpriteCollection("Planet");
        },

        toString : function(){
            var row = Math.floor(this.id/Constants.WORLD_SIZE);
            var col = this.id%Constants.WORLD_SIZE;

            return String.fromCharCode(65 + row) + "-"+ (col+1);
        }

    });



    return Zone;
});