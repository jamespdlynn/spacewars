define(['model/dispatcher','model/sprite','model/player','model/missile','model/planet'], function(EventDispatcher, Sprite, Player, Missile, Planet){

    'use strict';

    var SpriteCollection = function(type, data, options){
        switch (type){
            case "Player":
                this.Model = Player;
                break;
            case "Missile":
                this.Model = Missile;
                break;
            case "Planet":
                this.Model = Planet;
                break;
            default:
                this.Model = Sprite;
                break;
        }

        this.type = type;
        this.models = [];
        this.map = {};
        this.length = 0;

        this.add(data, options);
    };

    extend.call(SpriteCollection.prototype, EventDispatcher.prototype, {

        add : function(data, options){

            if (!data) return null;

            var model;

            if (Array.isArray(data)){
                var models = [];
                for (var i=0; i < data.length; i++){
                    if (model = this.add(data[i], options)){
                        models.push(model);
                    }
                }
                return models;
            }

            model = (data instanceof this.Model) ? data : new (this.Model)(data, options);

            if (this.map[data.id]){
                return null;
            }

            this.map[data.id] = model;
            this.models.push(model);

            this.length = this.models.length;
            this.trigger("add", model);

            return model;
        },

        at : function(index){
            return this.models[index];
        },

        get : function(id){
            return this.map[id];
        },

        set : function(data, options){

            if (!data) return null;

            if (!this.length){
                return this.add(data, options)
            }

            var model;
            if (Array.isArray(data)){
                var models = [];
                for (var i=0; i < data.length; i++){
                    if (model = this.set(data[i])){
                        models.push(model);
                    }
                }
                return models;
            }

            model = this.map[data.id];
            if (!model){
                return this.add(data, options);
            }

            model.set(data, options);
            this.trigger("update", model);

            return model;
        },

        remove : function(data){

            if (!data) return null;

            if (Array.isArray(data)){
                var models = [];
                if (model = this.remove(data[i])){
                    models.push(model);
                }
                return models;
            }

            var id = (typeof data === 'object') ? data.id : data;

            var model = this.map[id];
            if (model){
                this.models.splice(this.models.indexOf(model), 1);
                delete this.map[id];

                this.trigger("remove", model);
                this.length = this.models.length;
            }

            return model;
        },

        update : function(deltaTime){
            var i = this.length;
            while(i--){
                this.models[i].update(deltaTime);
            }

            return this;
        },

        toJSON : function(){
            var json = [];
            for (var i=0; i < this.models.length; i++){
                json.push(this.models[i].toJSON());
            }
            return json;
        },

        clone : function(){
            var collection = new SpriteCollection(this.type);
            var i = this.length;
            while (i--){
                collection.add(this.models[i].clone());
            }
            return collection;
        }
    });

    return SpriteCollection;
});

