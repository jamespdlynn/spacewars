define(['model/constants'],function(Constants){
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
           isInvulnerable : "boolean",
           username : "string"
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
           isFiring : "boolean",
           id : "uint8"
       },

       RemoveSprite : {
          type : {type:"enum", values:["Player","Missile","Planet"]},
          id : "uint8"
       },

       Collision : {
           sprite1 : {
               type:"object", schema:{
                   type : {type:"enum", values:["Player","Missile","Planet"]},
                   id : "uint8"
               }

           },
           sprite2 : {
               type:"object", schema:{
                   type : {type:"enum", values:["Player","Missile","Planet"]},
                   id : "uint8"
               }

           }
       },

       OutOfBounds : {}
   }
});