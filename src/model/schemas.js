define(['model/constants'],function(Constants){
   'use strict';

   return {

       Ping : {
          timestamps : ["long"],
          complete : "boolean"
       },

       GameData : {
           players : [{type:"object", schema:"Player"}],
           missiles : [{type:"object", schema:"Missile"}],
           planets : [{type:"object", schema:"Planet"}],
           playerId : "uint8"
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
           zone : "uint8"
       },

       Missile : {
          id : "uint8",
          posX : {type:"float", byteLength:2, precision:1},
          posY : {type:"float", byteLength:2, precision:1},
          velocityX : {type:"float", byteLength:2, precision:1},
          velocityY : {type:"float", byteLength:2, precision:1},
          angle : {type:"float", byteLength:2, precision:2},
          playerId : "uint8",
          zone : "uint8"
       },

       Planet : {
           key: {type:"enum", values:Constants.PLANET_KEYS.slice(0)},
           posX : {type:"float", byteLength:2, precision:1},
           posY : {type:"float", byteLength:2, precision:1},
           scale : {type:"float", byteLength:1, precision:2},
           zone : "uint8"
        },

       PlayerUpdate : {
           angle :  {type:"float", byteLength:2, precision:4},
           isAccelerating : "boolean",
           isShielded : "boolean",
           isFiring : "boolean",
           isReloading : "boolean",
           id : "uint8"
       },

       PlayerInfo : {
           fuel : "uint8",
           shields : "uint8",
           ammo : "uint8",
           kills : "uint8"
       },

       RemoveSprite : {
          type : {type:"enum", values:["Player","Missile","Planet"]},
          id : "uint8"
       },

       Collision : {
           sprite1 : {
               type:"object", schema:{
                   type : {type:"enum", values:["Player","Missile","Planet"]},
                   id : "uint8",
                   survived : "boolean"
               }

           },
           sprite2 : {
               type:"object", schema:{
                   type : {type:"enum", values:["Player","Missile","Planet"]},
                   id : "uint8",
                   survived : "boolean"
               }
           },
           zone : "uint8"
       },

       OutOfBounds : {
           zone : "uint8",
           type : {type:"enum", values:["Player","Missile","Planet"]},
           id : "uint8"
       },

       GameOver : {
           slayer : {type:"object", schema:"Player", allowNull:true}
       }
   }
});