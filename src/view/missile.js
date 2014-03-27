define(['createjs','model/constants','model/game'],function(createjs, Constants, gameData){
    'use strict';

    var Shape = createjs.Shape;
    var DisplayObject = createjs.DisplayObject;
    var userMissileBody, enemyMissieBody;

    (function(){

        var container = new createjs.Container();

        var shape = new Shape();
        shape.graphics.f().s("#000000").ss(1,0,0,4).p("ABSseQh/gWgfH2IAAReICeAA");
        shape.setTransform(3.6,10.5,0.179,0.125);

        var shape_1 = new Shape();
        shape_1.graphics.lf(["#FFFFFF","#969696"],[0,1],8.5,0,-8.5,0).s().p("AhPMgIAAxeQAgn2B+AWIAAY+g");
        shape_1.setTransform(3.7,10.5,0.179,0.125);

        var shape_2 = new Shape();
        shape_2.graphics.f().s("#000000").ss(1,0,0,4).p("AhRseQB+gWAgH2IAAReIieAA");
        shape_2.setTransform(6.6,10.5,0.179,0.125);

        var shape_3 = new Shape();
        shape_3.graphics.lf(["#FFFFFF","#969696"],[0,1],-8.5,0,8.5,0).s().p("AhPMgIAA4+QB/gWAgH2IAAReg");
        shape_3.setTransform(6.5,10.5,0.179,0.125);

        var shape_4 = new Shape();
        shape_4.graphics.lf(["#0000FF","#00C8FF"],[0,1],-16,0,16,0).s().p("AifiyIE/AAIigFmg");
        shape_4.setTransform(5.1,22.2,0.179,0.125);

        container.addChild(shape_4,shape_3,shape_2,shape_1,shape);
        container.cache(0,0,Constants.Missile.width,Constants.Missile.height);

        userMissileBody = container.cacheCanvas;
    })();

    (function(){

        var container = new createjs.Container();

        var shape = new Shape();
        shape.graphics.f().s("#000000").ss(1,0,0,4).p("ABSseQh/gWgfH2IAAReICeAA");
        shape.setTransform(3.6,11.3,0.179,0.136);

        var shape = new Shape();
        shape.graphics.f().s("#000000").ss(1,0,0,4).p("ABSseQh/gWgfH2IAAReICeAA");
        shape.setTransform(3.6,10.5,0.179,0.125);

        var shape_1 = new Shape();
        shape_1.graphics.lf(["#969696","#323232"],[0,1],8.5,0,-8.5,0).s().p("AhPMgIAAxeQAgn2B+AWIAAY+g");
        shape_1.setTransform(3.6,10.5,0.179,0.125);

        var shape_2 = new Shape();
        shape_2.graphics.f().s("#000000").ss(1,0,0,4).p("AhRseQB+gWAgH2IAAReIieAA");
        shape_2.setTransform(6.5,10.5,0.179,0.125);

        var shape_3 = new Shape();
        shape_3.graphics.lf(["#969696","#323232"],[0,1],-8.5,0,8.5,0).s().p("AhPMgIAA4+QB/gWAgH2IAAReg");
        shape_3.setTransform(6.5,10.5,0.179,0.125);

        var shape_4 = new Shape();
        shape_4.graphics.lf(["#FF0000","#FF6400"],[0,1],-16,0,16,0).s().p("AifiyIE/AAIigFmg");
        shape_4.setTransform(5.1,22.2,0.179,0.125);

        container.addChild(shape_4,shape_3,shape_2,shape_1,shape);
        container.cache(0,0,Constants.Missile.width,Constants.Missile.height);

        enemyMissieBody = container.cacheCanvas;
    })();

    var Missile = function (model){
        this.model = model;
        this.cacheCanvas = (model.data.playerId == gameData.playerId) ? userMissileBody : enemyMissieBody;
        this.mouseEnabled = false;

        this.initialize();
    };

    Missile.prototype = new DisplayObject();

    extend.call(Missile.prototype, {

        initialize : function(){

            DisplayObject.prototype.initialize.call(this);

            this.id = this.model.id;
            this.rotation = toDegrees(this.model.get("angle"));
            this.mouseEnabled = false;

            this.regX = this.model.width/2;
            this.regY = this.model.height/2;
            this.setBounds(-this.regX, -this.regY, this.model.width, this.model.height);

        },

        _tick : function(){

            var data = this.model.update().data;

            this.scaleX = gameData.scaleX;
            this.scaleY = gameData.scaleY;

            this.x = data.posX * this.scaleX;
            this.y = data.posY * this.scaleY;

        }
    });

    function toDegrees(angle){
        return (angle*(180/Math.PI)) + 90;
    }

    return Missile;
});