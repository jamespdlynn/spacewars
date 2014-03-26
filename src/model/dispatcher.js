define(function(){

    'use strict';

    var EventDispatcher = function(){
        this.listeners = {};
    };

    EventDispatcher.prototype.on = function(type, callback){
        this.listeners = this.listeners || {};
        this.listeners[type] = this.listeners[type] || [];

        if (this.listeners[type].indexOf(callback) == -1){
            this.listeners[type].push(callback);
        }
    };

    EventDispatcher.prototype.off = function(type, callback){
        if (type){
            this.listeners = this.listeners || {};

            if (callback && this.listeners[type]){
                var index = this.listeners[type].indexOf(callback);
                if (index >= 0){
                    this.listeners[type].splice(index,1);
                }
            }else{
                delete this.listeners[type];
            }
        }else{
            delete this.listeners;
        }


    };

    EventDispatcher.prototype.trigger = function(type){

         this.listeners = this.listeners || {};

         var callbacks = this.listeners[type];

         if (callbacks){
             var i = callbacks.length;
             while (i--){
                callbacks[i].apply(this, Array.prototype.slice.call(arguments,1));
             }
         }
    };

    return EventDispatcher;
});