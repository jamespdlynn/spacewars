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
            velocity : 0,
            acceleration : 0,
            angle : 0,
            playerId : 0
        },

        updateData : function(deltaSeconds){
            var data = this.data;
            var deltaPosition;

            if (data.acceleration > 0){

                var deltaAcceleration = this.jerk * deltaSeconds;

                if (Math.abs(deltaAcceleration) > data.acceleration){

                    var deltaSeconds1 = data.acceleration / Math.abs(this.jerk);
                    var deltaSeconds2 = deltaSeconds - deltaSeconds1;

                    this.updateData(deltaSeconds1);
                    deltaPosition = data.velocity * deltaSeconds2;

                    data.acceleration = 0;
                }
                else{
                    var s2 = deltaSeconds * deltaSeconds;
                    var s3 = s2 * deltaSeconds;

                    deltaPosition = (data.velocity * deltaSeconds) + (data.acceleration * s2 / 2) * (this.jerk * s3 / 6);

                    data.velocity += (data.acceleration*deltaSeconds) + (this.jerk * s2 / 2);
                    data.acceleration += deltaAcceleration;
                }
            }
            else{
                deltaPosition = data.velocity * deltaSeconds;
            }

            data.posX += Math.cos(data.angle) * deltaPosition;
            data.posY += Math.sin(data.angle) * deltaPosition;
        }

    });


    return Missile;
});