define(['createjs','view/Sprite','model/constants','model/game'],function(createjs, Sprite, Constants, gameData){
    'use strict';

    var userMissileBody, enemyMissieBody;

    (function(){

        var container = new createjs.Container();

        var shape = new createjs.Shape();
        shape.graphics.f().s("#000000").ss(1,0,0,4).p("ABSseQh/gWgfH2IAAReICeAA");
        shape.setTransform(3.3,7.6,0.161,0.089);

        var shape_1 = new createjs.Shape();
        shape_1.graphics.lf(["#FFFFFF","#969696"],[0,1],8.5,0,-8.5,0).s().p("AhPMgIAAxeQAgn2B+AWIAAY+g");
        shape_1.setTransform(3.3,7.6,0.161,0.089);

        var shape_2 = new createjs.Shape();
        shape_2.graphics.f().s("#000000").ss(1,0,0,4).p("AhRseQB+gWAgH2IAAReIieAA");
        shape_2.setTransform(5.9,7.6,0.161,0.089);

        var shape_3 = new createjs.Shape();
        shape_3.graphics.lf(["#FFFFFF","#969696"],[0,1],-8.5,0,8.5,0).s().p("AhPMgIAA4+QB/gWAgH2IAAReg");
        shape_3.setTransform(5.9,7.6,0.161,0.089);

        var shape_4 = new createjs.Shape();
        shape_4.graphics.lf(["#0000FF","#00C8FF"],[0,1],-16,0,16,0).s().p("AifiyIE/AAIigFmg");
        shape_4.setTransform(4.6,15.9,0.161,0.089);

        container.addChild(shape_4,shape_3,shape_2,shape_1,shape);
        container.cache(0,0,Constants.Missile.width,Constants.Missile.height);

        userMissileBody = container.cacheCanvas;
    })();

    (function(){
        var container = new createjs.Container();

        var shape = new createjs.Shape();
        shape.graphics.f().s("#000000").ss(1,0,0,4).p("ABSseQh/gWgfH2IAAReICeAA");
        shape.setTransform(3.2,7.6,0.161,0.089);

        var shape_1 = new createjs.Shape();
        shape_1.graphics.lf(["#969696","#323232"],[0,1],8.5,0,-8.5,0).s().p("AhPMgIAAxeQAgn2B+AWIAAY+g");
        shape_1.setTransform(3.3,7.6,0.161,0.089);

        var shape_2 = new createjs.Shape();
        shape_2.graphics.f().s("#000000").ss(1,0,0,4).p("AhRseQB+gWAgH2IAAReIieAA");
        shape_2.setTransform(5.9,7.6,0.161,0.089);

        var shape_3 = new createjs.Shape();
        shape_3.graphics.lf(["#969696","#323232"],[0,1],-8.5,0,8.5,0).s().p("AhPMgIAA4+QB/gWAgH2IAAReg");
        shape_3.setTransform(5.9,7.6,0.161,0.089);

        var shape_4 = new createjs.Shape();
        shape_4.graphics.lf(["#FF0000","#FF6400"],[0,1],-16,0,16,0).s().p("AifiyIE/AAIigFmg");
        shape_4.setTransform(4.6,15.9,0.161,0.089);
        http://localhost:3000/
        container.addChild(shape_4,shape_3,shape_2,shape_1,shape);
        container.cache(0,0,Constants.Missile.width,Constants.Missile.height);

        enemyMissieBody = container.cacheCanvas;
    })();

    var Missile = function (model){
        this.initialize();
        this.setModel(model);

        this.mouseEnabled = false;
    };

    Missile.prototype = new createjs.DisplayObject();

    extend.call(Missile.prototype, Sprite.prototype, {
        setModel : function(model){
            Sprite.prototype.setModel.call(this, model);
            this.cacheCanvas = (model.get("playerId") === gameData.userPlayer.id) ? userMissileBody : enemyMissieBody;
            this.rotation = toDegrees(model.get("angle"));
        }
    });

    function toDegrees(angle){
        return (angle*(180/Math.PI)) + 90;
    }

    return Missile;
});