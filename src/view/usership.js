define(['createjs','view/starship','model/constants'],function(createjs,StarShip,Constants){
    'use strict';

    var Container = createjs.Container,
        Shape = createjs.Shape;

    var userShipBody;

    (function(){

        var shape = new Shape();
        shape.graphics.f().s("#000000").ss(1,0,0,4).p("ACrk+QhzgHhYBrQhFBSguCIQgKAPgGAvQgIA6AJAzQAZCVCUAAQAbg9AfgiQAogtA+gU");
        shape.setTransform(29.8,40.5,0.167,0.167);

        var shape_1 = new Shape();
        shape_1.graphics.lf(["#00FFFF","#0000FF"],[0,1],17.5,0,-16.4,0).s().p("AikCrQgJgzAIg6QAHgvAKgPQAuiIBFhSQBXhrB0AHIAAHeQg+AUgpAtQgeAigbA9QiUAAgaiVg");
        shape_1.setTransform(29.8,40.5,0.167,0.167);

        var shape_2 = new Shape();
        shape_2.graphics.f().s("#000000").ss(1,0,0,4).p("Aiqk+QBzgHBYBrQBFBSAuCIQAKAPAGAvQAIA6gJAzQgaCViTAAQgcg9gegiQgpgtg9gU");
        shape_2.setTransform(35.5,40.5,0.167,0.167);

        var shape_3 = new Shape();
        shape_3.graphics.lf(["#00FFFF","#0000FF"],[0,1],-17.5,0,16.4,0).s().p("AhDDhQgogtg+gUIAAneQB0gHBXBrQBFBSAuCIQAKAPAHAvQAHA6gIAzQgaCViUAAQgbg9gfgig");
        shape_3.setTransform(35.5,40.5,0.167,0.167);

        var shape_4 = new Shape();
        shape_4.graphics.f().s("#000000").ss(1,0,0,4).p("APA9/Ig8AAQj8JCh8IyQgEAVhYG1Qg3EUg5DNIxePAIigMgIBGAAID6ngISungQAbDXBGCgQAwBvBVByQBnCJAQAcQAzBaAABp");
        shape_4.setTransform(16.7,32.5,0.167,0.167);

        var shape_5 = new Shape();
        shape_5.graphics.lf(["#969696","#C8C8C8","#FFFFFF"],[0,0.349,1],96.5,0,-96.4,0).s().p("Au/eAIChsgIRdvBQA6jMA3kUIBbnJQB8ozD9pCIA7AAMAAAA7xQgDhhgvhVQgRgbhmiJQhWhzgwhuQhFiggbjYIyuHgIj6Hhg");
        shape_5.setTransform(16.7,32.5,0.167,0.167);

        var shape_6 = new Shape();
        shape_6.graphics.f().s("#000000").ss(1,0,0,4).p("Au/9/IA8AAQD8JBB7IzQAEASBYG4QA4EUA5DNIRePAICgMgIhGAAIj6ngIyungQgbDXhFCgQgxBvhVByQhnCJgQAcQgzBaAABp");
        shape_6.setTransform(48.7,32.5,0.167,0.167);

        var shape_7 = new Shape();
        shape_7.graphics.lf(["#969696","#C8C8C8","#FFFFFF"],[0,0.349,1],-96.5,0,96.5,0).s().p("AN6eAIj7nhIytngQgcDYhFCgQgwBuhWBzQhmCJgQAbQgwBVgEBhMAAAg7xIA8AAQD9JCB7IzIBcHJQA3EUA6DMIRePBICgMgg");
        shape_7.setTransform(48.7,32.5,0.167,0.167);

        var shape_8 = new Shape();
        shape_8.graphics.f().s("#000000").ss(1,0,0,4).p("AgTk/IgUNvIBPAAIgUtvIAUhGIAAiqIhPAAIAACqg");
        shape_8.setTransform(16.7,31.2,0.167,0.167);

        var shape_9 = new Shape();
        shape_9.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],4.5,0,-4.5,0).s().p("AgnIwIAVtvIgVhGIAAiqIBOAAIAACqIgTBGIATNvg");
        shape_9.setTransform(16.7,31.2,0.167,0.167);

        var shape_10 = new Shape();
        shape_10.graphics.f().s("#000000").ss(1,0,0,4).p("AAoovIAACqIgUBGIAUNvIhPAAIAUtvIgUhGIAAiqg");
        shape_10.setTransform(48.7,31.2,0.167,0.167);

        var shape_11 = new Shape();
        shape_11.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],-4.5,0,4.5,0).s().p("AgmIwIAUtvIgUhGIAAiqIBOAAIAACqIgVBGIAVNvg");
        shape_11.setTransform(48.7,31.2,0.167,0.167);

        var shape_12 = new Shape();
        shape_12.graphics.f().s("#000000").ss(1,0,0,4).p("AgnovIAACqIAUBGIgUNvIBPAAIgUtvIAUhGIAAiqg");
        shape_12.setTransform(5.3,41.9,0.167,0.167);

        var shape_13 = new Shape();
        shape_13.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],4.5,0,-4.5,0).s().p("AgmIwIATtvIgThGIAAiqIBOAAIAACqIgVBGIAVNvg");
        shape_13.setTransform(5.3,41.9,0.167,0.167);

        var shape_14 = new Shape();
        shape_14.graphics.f().s("#000000").ss(1,0,0,4).p("AAoovIAACqIgUBGIAUNvIhPAAIAUtvIgUhGIAAiqg");
        shape_14.setTransform(58.7,41.9,0.167,0.167);

        var shape_15 = new Shape();
        shape_15.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],-4.5,0,4.5,0).s().p("AgnIwIAVtvIgVhGIAAiqIBOAAIAACqIgTBGIATNvg");
        shape_15.setTransform(58.7,41.9,0.167,0.167);

        var shape_16 = new Shape();
        shape_16.graphics.f().s("#000000").ss(1,0,0,4).p("ADwiMIjwigIjkgoQAAA+gECeQgFCrgBAvQAABGgDBWQAAA2APAPQAPAQA1ABQAlABB5gDQBGAABWAEQA2AAAPgPQAQgPABg2QgChXAAhJg");
        shape_16.setTransform(42,53.5,0.167,0.167);

        var shape_17 = new Shape();
        shape_17.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],-24.7,0,24.8,0).s().p("AAAFSQh5ACglAAQg1gBgPgQQgPgQAAg2QADhVAAhGIAGjaQAEieAAg+IDkAoIDwCgIAADuQAABIACBYQgBA1gQAQQgPAOg2AAQhWgDhGAAg");
        shape_17.setTransform(42,53.5,0.167,0.167);

        var shape_18 = new Shape();
        shape_18.graphics.f().s("#000000").ss(1,0,0,4).p("AAAksIDlgoQAAByAKFEQAABGADBWQAAA2gOAPQgQAQg1ABQhYgChHAAQh3ADgkABQg2AAgPgPQgQgPgBg2QAChXAAhJIAAjug");
        shape_18.setTransform(23.3,53.5,0.167,0.167);

        var shape_19 = new Shape();
        shape_19.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],24.8,0,-24.7,0).s().p("AjgFHQgQgQgBg1QAChYAAhIIAAjuIDvigIDlgoQAABxAKFFQAABGADBVQAAA2gOAQQgQAQg1ABQhYgChHAAIibADQg2AAgPgOg");
        shape_19.setTransform(23.3,53.5,0.167,0.167);

        var container = new Container();
        container.addChild(shape_19,shape_18,shape_17,shape_16,shape_15,shape_14,shape_13,shape_12,shape_11,shape_10,shape_9,shape_8,shape_7,shape_6,shape_5,shape_4,shape_3,shape_2,shape_1,shape);
        container.cache(0,0,65,65);

        userShipBody = container.cacheCanvas;
    })();

    var UserShip = function (){

        this.shipBody = new createjs.DisplayObject();
        this.shipBody.cacheCanvas = userShipBody;

        this.exhaustSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("blueExhaustSprites")],
            frames: {width:22, height:25, count:4},
            animations: {"play": [0, 1, 2, 3, 2, 1, "play"]},
            framerate : 15
        });

        this.sparkSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("blueSparkSprites")],
            frames: {width:64, height:64, count:12},
            animations: {"play": [0, 11, "play"]},
            framerate : 15
        });

        this.shieldColor = {r:0, g:154, b:0};
        this.initialize();
    };

    UserShip.prototype = new StarShip();

    extend.call(UserShip.prototype, {

        initialize : function(){
            StarShip.prototype.initialize.call(this);

            var width = Constants.Player.width/2;

            this.reloadBar = new Shape();
            this.reloadBar.graphics.beginFill("#fff").drawRect(0, 0, width, 4);
            this.reloadBar.x = -width/2;
            this.reloadBar.y = (Constants.Player.height/2) + 22;
            this.reloadBar.alpha = 0.8;
            this.reloadBar.visible = false;

            this.addChild(this.reloadBar);
        },

        setModel : function(model){
            StarShip.prototype.setModel.call(this, model);
            this.angle = model.get("angle");
        },

        _tick : function(evt){
            StarShip.prototype._tick.call(this, evt);

            this.reloadBar.scaleX = (this.model.lastUpdated - this.model.lastFired) / this.model.fireInterval;
            this.reloadBar.visible = (this.reloadBar.scaleX < 1);
        }

    });

    return UserShip;
});