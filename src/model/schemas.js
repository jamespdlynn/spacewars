define(['model/constants'],function(Constants){
   'use strict';

   return {

       Ping : {
          timestamps : ["long"],
          complete : "boolean"
       },

       Player : {
           id : "uint16",
           posX : {type:"float", byteLength:2, precision:1},
           posY : {type:"float", byteLength:2, precision:1},
           velocityX : {type:"float", byteLength:2, precision:1},
           velocityY : {type:"float", byteLength: 2, precision:1},
           angle : {type:"float", byteLength:2, precision:4},
           isAccelerating : "boolean",
           isShielded : "boolean",
           isInvulnerable : "boolean",
           isShieldBroken : "boolean",
           kills : "uint8",
           zone : "uint8",
           name : "string",
           icon : "string"
       },

       Missile : {
          id : "uint16",
          posX : {type:"float", byteLength:2, precision:1},
          posY : {type:"float", byteLength:2, precision:1},
          velocityX : {type:"float", byteLength:2, precision:1},
          velocityY : {type:"float", byteLength:2, precision:1},
          angle : {type:"float", byteLength:2, precision:2},
          playerId : "uint16",
          zone : "uint8"
       },

       Planet : {
           key: {type:"enum", values:Constants.PLANET_KEYS.slice(0)},
           posX : {type:"float", byteLength:2, precision:1},
           posY : {type:"float", byteLength:2, precision:1},
           scale : {type:"float", byteLength:1, precision:2},
           zone : "uint8"
        },

       GameData : {
           players : {type:"array", element:{type:"object", schema:"Player"}, large:true},
           missiles :  {type:"array", element:{type:"object", schema:"Missile"}, large:false},
           planets :  {type:"array", element:{type:"object", schema:"Planet"}, large:false},
           playerId : "uint16"
       },

       PlayerUpdate : {
           angle :  {type:"float", byteLength:2, precision:4},
           isAccelerating : "boolean",
           isShielded : "boolean",
           isFiring : "boolean",
           isReloading : "boolean",
           isShieldBroken : "boolean",
           id : "uint16"
       },

       PlayerInfo : {
           fuel : "uint8",
           shields : "uint8",
           ammo : "uint8",
           kills : "uint8"
       },

       RemoveSprite : {
           id : "uint16",
           type : {type:"enum", values:["Player","Missile","Planet"]}
       },

       Collision : {
           sprites : {
               type : "array",
               element : {
                   type : "object",
                   schema : {
                       id:"uint16",
                       type:{type:"enum", values:["Player","Missile","Planet"]},
                       alive : "boolean"
                   }
               },
               maxLength : 2
           }
       },

       GameOver : {
           slayer : {type:"object", schema:"Player", allowNull:true}
       }
   }
});