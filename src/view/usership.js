define(['createjs','view/starship','model/constants'],function(createjs,StarShip,Constants){

    var Container = createjs.Container,
        Shape = createjs.Shape;

    var userShipBody;

    (function(){

        this.shape = new Shape();
        this.shape.graphics.f().s("#000000").ss(1,0,0,4).p("ACrk+QhzgHhYBrQhFBSguCIQgKAPgGAvQgIA6AJAzQAZCVCUAAQAbg9AfgiQAogtA+gU");
        this.shape.setTransform(29.8,40.5,0.167,0.167);

        this.shape_1 = new Shape();
        this.shape_1.graphics.lf(["#00FFFF","#0000FF"],[0,1],17.5,0,-16.4,0).s().p("AikCrQgJgzAIg6QAHgvAKgPQAuiIBFhSQBXhrB0AHIAAHeQg+AUgpAtQgeAigbA9QiUAAgaiVg");
        this.shape_1.setTransform(29.8,40.5,0.167,0.167);

        this.shape_2 = new Shape();
        this.shape_2.graphics.f().s("#000000").ss(1,0,0,4).p("Aiqk+QBzgHBYBrQBFBSAuCIQAKAPAGAvQAIA6gJAzQgaCViTAAQgcg9gegiQgpgtg9gU");
        this.shape_2.setTransform(35.5,40.5,0.167,0.167);

        this.shape_3 = new Shape();
        this.shape_3.graphics.lf(["#00FFFF","#0000FF"],[0,1],-17.5,0,16.4,0).s().p("AhDDhQgogtg+gUIAAneQB0gHBXBrQBFBSAuCIQAKAPAHAvQAHA6gIAzQgaCViUAAQgbg9gfgig");
        this.shape_3.setTransform(35.5,40.5,0.167,0.167);

        this.shape_4 = new Shape();
        this.shape_4.graphics.f().s("#000000").ss(1,0,0,4).p("APA9/Ig8AAQj8JCh8IyQgEAVhYG1Qg3EUg5DNIxePAIigMgIBGAAID6ngISungQAbDXBGCgQAwBvBVByQBnCJAQAcQAzBaAABp");
        this.shape_4.setTransform(16.7,32.5,0.167,0.167);

        this.shape_5 = new Shape();
        this.shape_5.graphics.lf(["#969696","#C8C8C8","#FFFFFF"],[0,0.349,1],96.5,0,-96.4,0).s().p("Au/eAIChsgIRdvBQA6jMA3kUIBbnJQB8ozD9pCIA7AAMAAAA7xQgDhhgvhVQgRgbhmiJQhWhzgwhuQhFiggbjYIyuHgIj6Hhg");
        this.shape_5.setTransform(16.7,32.5,0.167,0.167);

        this.shape_6 = new Shape();
        this.shape_6.graphics.f().s("#000000").ss(1,0,0,4).p("Au/9/IA8AAQD8JBB7IzQAEASBYG4QA4EUA5DNIRePAICgMgIhGAAIj6ngIyungQgbDXhFCgQgxBvhVByQhnCJgQAcQgzBaAABp");
        this.shape_6.setTransform(48.7,32.5,0.167,0.167);

        this.shape_7 = new Shape();
        this.shape_7.graphics.lf(["#969696","#C8C8C8","#FFFFFF"],[0,0.349,1],-96.5,0,96.5,0).s().p("AN6eAIj7nhIytngQgcDYhFCgQgwBuhWBzQhmCJgQAbQgwBVgEBhMAAAg7xIA8AAQD9JCB7IzIBcHJQA3EUA6DMIRePBICgMgg");
        this.shape_7.setTransform(48.7,32.5,0.167,0.167);

        this.shape_8 = new Shape();
        this.shape_8.graphics.f().s("#000000").ss(1,0,0,4).p("AgTk/IgUNvIBPAAIgUtvIAUhGIAAiqIhPAAIAACqg");
        this.shape_8.setTransform(16.7,31.2,0.167,0.167);

        this.shape_9 = new Shape();
        this.shape_9.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],4.5,0,-4.5,0).s().p("AgnIwIAVtvIgVhGIAAiqIBOAAIAACqIgTBGIATNvg");
        this.shape_9.setTransform(16.7,31.2,0.167,0.167);

        this.shape_10 = new Shape();
        this.shape_10.graphics.f().s("#000000").ss(1,0,0,4).p("AAoovIAACqIgUBGIAUNvIhPAAIAUtvIgUhGIAAiqg");
        this.shape_10.setTransform(48.7,31.2,0.167,0.167);

        this.shape_11 = new Shape();
        this.shape_11.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],-4.5,0,4.5,0).s().p("AgmIwIAUtvIgUhGIAAiqIBOAAIAACqIgVBGIAVNvg");
        this.shape_11.setTransform(48.7,31.2,0.167,0.167);

        this.shape_12 = new Shape();
        this.shape_12.graphics.f().s("#000000").ss(1,0,0,4).p("AgnovIAACqIAUBGIgUNvIBPAAIgUtvIAUhGIAAiqg");
        this.shape_12.setTransform(5.3,41.9,0.167,0.167);

        this.shape_13 = new Shape();
        this.shape_13.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],4.5,0,-4.5,0).s().p("AgmIwIATtvIgThGIAAiqIBOAAIAACqIgVBGIAVNvg");
        this.shape_13.setTransform(5.3,41.9,0.167,0.167);

        this.shape_14 = new Shape();
        this.shape_14.graphics.f().s("#000000").ss(1,0,0,4).p("AAoovIAACqIgUBGIAUNvIhPAAIAUtvIgUhGIAAiqg");
        this.shape_14.setTransform(58.7,41.9,0.167,0.167);

        this.shape_15 = new Shape();
        this.shape_15.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],-4.5,0,4.5,0).s().p("AgnIwIAVtvIgVhGIAAiqIBOAAIAACqIgTBGIATNvg");
        this.shape_15.setTransform(58.7,41.9,0.167,0.167);

        this.shape_16 = new Shape();
        this.shape_16.graphics.f().s("#000000").ss(1,0,0,4).p("ADwiMIjwigIjkgoQAAA+gECeQgFCrgBAvQAABGgDBWQAAA2APAPQAPAQA1ABQAlABB5gDQBGAABWAEQA2AAAPgPQAQgPABg2QgChXAAhJg");
        this.shape_16.setTransform(42,53.5,0.167,0.167);

        this.shape_17 = new Shape();
        this.shape_17.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],-24.7,0,24.8,0).s().p("AAAFSQh5ACglAAQg1gBgPgQQgPgQAAg2QADhVAAhGIAGjaQAEieAAg+IDkAoIDwCgIAADuQAABIACBYQgBA1gQAQQgPAOg2AAQhWgDhGAAg");
        this.shape_17.setTransform(42,53.5,0.167,0.167);

        this.shape_18 = new Shape();
        this.shape_18.graphics.f().s("#000000").ss(1,0,0,4).p("AAAksIDlgoQAAByAKFEQAABGADBWQAAA2gOAPQgQAQg1ABQhYgChHAAQh3ADgkABQg2AAgPgPQgQgPgBg2QAChXAAhJIAAjug");
        this.shape_18.setTransform(23.3,53.5,0.167,0.167);

        this.shape_19 = new Shape();
        this.shape_19.graphics.lf(["#323232","#4B4B4B","#646464","#4B4B4B","#323232"],[0,0.2,0.498,0.8,1],24.8,0,-24.7,0).s().p("AjgFHQgQgQgBg1QAChYAAhIIAAjuIDvigIDlgoQAABxAKFFQAABGADBVQAAA2gOAQQgQAQg1ABQhYgChHAAIibADQg2AAgPgOg");
        this.shape_19.setTransform(23.3,53.5,0.167,0.167);

        this.container = new Container();
        this.container.addChild(this.shape_19,this.shape_18,this.shape_17,this.shape_16,this.shape_15,this.shape_14,this.shape_13,this.shape_12,this.shape_11,this.shape_10,this.shape_9,this.shape_8,this.shape_7,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape,this.instance_1,this.instance);
        this.container.cache(0,0,65,65);

        userShipBody = this.container.cacheCanvas;
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
            images: [preloader.getResult("sparkSprites")],
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
            StarShip.prototype.initialize.call(this, model);
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