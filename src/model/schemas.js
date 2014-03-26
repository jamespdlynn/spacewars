define(['model/constants'],function(Constants){
   'use strict';

   return {

       Ping : {
          timestamps : ["long"],
          complete : "boolean"
       },

       GameData : {
           currentZone : {type:"object", schema:"Zone"},
           playerId : "uint8"
       },

       Zone : {
           id : "uint8",
           players : [{type:"object", schema:"Player"}],
           missiles : [{type:"object", schema:"Missile"}],
           planets : [{type:"object", schema:"Planet"}]
       },

       Player : {
           id : "uint8",
           posX : {type:"float", byteLength:2, precision:1},
           posY : {type:"float", byteLength:2, precision:1},
           velocityX : {type:"float", byteLength:2, precision:1},
           velocityY : {type:"float", byteLength: 2, precision:1},
           angle : {type:"float", byteLength:2, precision:4},
           isAccelerating : "boolean",
           isShielded : "boolean",
           isInvulnerable : "boolean",
           isShieldBroken : "boolean",
           username : "string",
           fuel : "uint",
           shields : "uint"
       },

       Missile : {
          id : "uint8",
          posX : {type:"float", byteLength:2, precision:1},
          posY : {type:"float", byteLength:2, precision:1},
          velocityX : {type:"float", byteLength:2, precision:1},
          velocityY : {type:"float", byteLength:2, precision:1},
          angle : {type:"float", byteLength:2, precision:4},
          playerId : "uint8"
       },

       Planet : {
           key: {type:"enum", values:Constants.PLANET_KEYS.slice(0)},
           posX : {type:"float", byteLength:2, precision:1},
           posY : {type:"float", byteLength:2, precision:1},
           scale : {type:"float", byteLength:1, precision:2}
        },

       PlayerUpdate : {
           angle :  {type:"float", byteLength:2, precision:4},
           isAccelerating : "boolean",
           isShielded : "boolean",
           isFiring : "boolean",
           id : "uint8"
       },

       PlayerInfo : {
           fuel : "int8",
           shields : "int8"
       },

       RemoveSprite : {
          type : {type:"enum", values:["Player","Missile","Planet"]},
          id : "uint8"
       },

       Collision : {
           sprite1 : {
               type:"object", allowNull: true, schema:{
                   type : {type:"enum", values:["Player","Missile","Planet"]},
                   id : "uint8",
                   explode : "boolean"
               }

           },
           sprite2 : {
               type:"object", allowNull: true, schema:{
                   type : {type:"enum", values:["Player","Missile","Planet"]},
                   id : "uint8",
                   explode : "boolean"
               }

           }
       },

       OutOfBounds : {}
   }
});