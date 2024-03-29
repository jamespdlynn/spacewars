define(['models/collection','models/constants'], function(SpriteCollection, Constants){
    'use strict';

    var Zone = function (data, options){
        this.id = data.id;
        this.initialize(data, options);
    };

    extend.call(Zone.prototype, Constants.Zone, {

        initialize : function(data, options){
            data = data || {};

            this.players = new SpriteCollection("Player", data.players, options);
            this.missiles = new SpriteCollection("Missile", data.missiles, options);
            this.planets = new SpriteCollection("Planet", data.planets, options);
        },

        update : function(deltaTime, options){
            this.players.update(deltaTime, options);
            this.missiles.update(deltaTime, options);

            return this;
        },

        get : function(data){

            if (!data) return null;

            switch (data.type){
                case "Player":
                    return this.players.get(data.id);

                case "Missile":
                    return this.missiles.get(data.id);

                case "Planet":
                    return this.planets.get(data.id);
            }

            console.warn("Unable to retrieve sprite of type: "+data.type);
            return null;
        },

        set : function(data, options){
            this.players.set(data.players, options);
            this.missiles.set(data.missiles, options);
            this.planets.set(data.planets, options);

            return this;
        },

        remove : function(data){
            if (!data) return null;

            switch (data.type){
                case "Player":
                    return this.players.remove(data.id);

                case "Missile":
                    return this.missiles.remove(data.id);

                case "Planet":
                    return this.planets.remove(data.id);
            }

            console.warn("Unable to remove sprite of type: "+data.type);
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
            data.missiles = data.missiles.concat(this.missiles.toJSON());
            data.planets = data.planets.concat(this.planets.toJSON());
        },

        clone : function(){
            var zone = new Zone({id : this.id});
            zone.players = this.players.clone();
            zone.missiles = this.missiles.clone();
            zone.planets = this.planets.clone();

            return zone;
        },

        reset : function(){
            this.players.reset();
            this.missiles.reset();
            this.planets.reset();

            this.players.off();
            this.missiles.off();
            this.planets.off();
        },

        toString : function(){
            var row = Math.floor(this.id/Constants.WORLD_SIZE);
            var col = this.id%Constants.WORLD_SIZE;

            return String.fromCharCode(65 + row) + "-"+ (col+1);
        }

    });



    return Zone;
});