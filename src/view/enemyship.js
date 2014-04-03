define(['createjs','view/starship','model/constants'],function(createjs,StarShip, Constants){
    'use strict';

    var Container = createjs.Container,
        Shape = createjs.Shape;

    var enemyShipBody;

    (function(){

        var shape = new Shape();
        shape.graphics.f().s("#020303").ss(1,0,0,4).p("AAeg0QghgCgTA2QgGAIAEAUQAEAZAXAAQAJgVASgG");
        shape.setTransform(29.6,40.5);

        var shape_1 = new Shape();
        shape_1.graphics.lf(["#F39816","#EA5022","#E71E25"],[0,0.498,1],3,0,-2.7,0).s().p("AgaAcQgDgUAGgIQATg2AgACIAABOQgRAGgKAVQgXAAgEgZg");
        shape_1.setTransform(29.8,40.5);

        var shape_2 = new Shape();
        shape_2.graphics.f().s("#020303").ss(1,0,0,4).p("Agcg0QATgBANASQAMAOAHAVQAMA1glAAQgJgVgRgG");
        shape_2.setTransform(35.6,40.5);

        var shape_3 = new Shape();
        shape_3.graphics.lf(["#F39816","#EA5022","#E71E25"],[0,0.498,1],-2.9,0,2.8,0).s().p("AgbAaIAAhOQATgBANASQAMAOAHAVQANA1glAAQgJgVgSgGg");
        shape_3.setTransform(35.5,40.5);

        var shape_4 = new Shape();
        shape_4.graphics.f().s("#020303").ss(1,0,0,4).p("ACck+IgFAAQgqBfgUBfQgMA0gXBmIi4CgIgbCGIAMAAIAphQIDGhQQAIA6AeAqQAbAlAAAX");
        shape_4.setTransform(16.5,32.5);

        var shape_5 = new Shape();
        shape_5.graphics.lf(["#323232","#646565","#969696"],[0,0.349,1],16,0,-15.9,0).s().p("AidE/IAaiFIC5igIAiibQAVheAqhgIAFAAIACJ9QgBgWgagkQgegqgHg6IjGBQIgqBPg");
        shape_5.setTransform(16.5,32.5);

        var shape_6 = new Shape();
        shape_6.graphics.f().s("#020303").ss(1,0,0,4).p("Aijk+IAPAAQAqBfAVBfQALA0AXBmIC4CgIAbCGIgMAAIgphQIjGhQQgIA6ggAqQgdAlAAAX");
        shape_6.setTransform(48.6,32.5);

        var shape_7 = new Shape();
        shape_7.graphics.lf(["#323232","#646565","#969696"],[0,0.349,1],-16.3,0,16.3,0).s().p("ACWE/IgphPIjHhQQgHA6ggAqQgdAkAAAXIgDp+IAPAAQAqBgAUBeIAjCbIC4CgIAbCFg");
        shape_7.setTransform(48.4,32.5);

        var shape_8 = new Shape();
        shape_8.graphics.f().s("#020303").ss(1,0,0,4).p("AgJhcIAAAcIAFAMIgBCRIALAAIgBiRIAFgMIAAgcg");
        shape_8.setTransform(16.7,31.2);

        var shape_9 = new Shape();
        shape_9.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],1.1,0,-1.1,0).s().p("AgFBdIABiRIgEgMIAAgcIASAAIAAAcIgGAMIACCRg");
        shape_9.setTransform(16.7,31.2);

        var shape_10 = new Shape();
        shape_10.graphics.f().s("#020303").ss(1,0,0,4).p("AAKhcIAAAcIgFAMIABCRIgMAAIACiRIgFgMIAAgcg");
        shape_10.setTransform(48.7,31.2);

        var shape_11 = new Shape();
        shape_11.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-1.1,0,1.1,0).s().p("AgFBdIACiRIgGgMIAAgcIASAAIAAAcIgEAMIABCRg");
        shape_11.setTransform(48.7,31.2);

        var shape_12 = new Shape();
        shape_12.graphics.f().s("#020303").ss(1,0,0,4).p("AgFhcIAAAdIADALIgDCRIALAAIgFiRIACgLIAAgdg");
        shape_12.setTransform(5.3,41.8);

        var shape_13 = new Shape();
        shape_13.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],0.8,0,-0.7,0).s().p("AgFBdIADiRIgDgLIAAgdIAIAAIAAAdIgCALIAFCRg");
        shape_13.setTransform(5.3,41.8);

        var shape_14 = new Shape();
        shape_14.graphics.f().s("#020303").ss(1,0,0,4).p("AAKhcIAAAdIgFALIABCRIgMAAIACiRIgFgLIAAgdg");
        shape_14.setTransform(58.7,41.8);

        var shape_15 = new Shape();
        shape_15.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-1.1,0,1.1,0).s().p("AgFBdIACiRIgGgLIAAgdIATAAIAAAdIgFALIABCRg");
        shape_15.setTransform(58.7,41.8);

        var shape_16 = new Shape();
        shape_16.graphics.f().s("#020303").ss(1,0,0,4).p("AgkA2QACACAiAAQAjAAABgCQACgBAAglIAAgmIgmgaIgkgHQAAATgBA0QAAAkABACg");
        shape_16.setTransform(41.8,53.5);

        var shape_17 = new Shape();
        shape_17.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-4,0.1,4,0.1).s().p("AgkA1QgCgBAAgkIADhHIAjAHIAmAaIAAAmQAAAkgBACQgCACgjAAQghAAgDgDg");
        shape_17.setTransform(41.8,53.5);

        var shape_18 = new Shape();
        shape_18.graphics.f().s("#020303").ss(1,0,0,4).p("AAkg3QAAATACA0QAAAkgBACQgCACgjAAQgiAAgCgCQgBgBAAglIAAgmIAlgag");
        shape_18.setTransform(23.5,53.5);

        var shape_19 = new Shape();
        shape_19.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],4,0.1,-4,0.1).s().p("AgkA2QgBgCAAgkIAAgmIAlgaIAkgHIACBHQAAAkgBABQgCADgjAAQgiAAgCgCg");
        shape_19.setTransform(23.5,53.5);

        var container = new Container();
        container.addChild(shape_19,shape_18,shape_17,shape_16,shape_15,shape_14,shape_13,shape_12,shape_11,shape_10,shape_9,shape_8,shape_7,shape_6,shape_5,shape_4,shape_3,shape_2,shape_1,shape);
        container.cache(0,0,Constants.Player.width,Constants.Player.height);

        enemyShipBody = container.cacheCanvas;
    })();

    var EnemyShip = function (model){

        this.shipBody = new createjs.DisplayObject();
        this.shipBody.cacheCanvas =  enemyShipBody;

        this.exhaustSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("redExhaustSprites")],
            frames: {width:18, height:20},
            animations: {"play": [0, 1, 2, 3, 2, 1, "play"]},
            framerate : 15
        });

        this.sparkSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("redSparkSprites")],
            frames: {width:64, height:64, count:12},
            animations: {"play": [0, 11, "play"]},
            framerate : 15
        });

        this.shieldColor = {r:200, g:0, b:0};

        this.initialize();
        this.setModel(model);
    };

    EnemyShip.prototype = new StarShip();

    extend.call(EnemyShip.prototype, {

        initialize : function(){
            StarShip.prototype.initialize.call(this);

            this.nameLabel = new createjs.Text("", "7.5pt Arkitech", "#fff");
            this.nameLabel.y = (Constants.Player.height/2)+22;
            this.nameLabel.alpha = 0.9;

            this.addChild(this.nameLabel);
        },

        setModel : function(model){
            StarShip.prototype.setModel.call(this, model);
            this.nameLabel.text = model.get("username");
        },

        _tick : function(evt){
            StarShip.prototype._tick.call(this, evt);

            this.labelWidth = this.labelWidth || this.nameLabel.getMeasuredWidth();

            this.nameLabel.scaleX = 1/this.scaleX;
            this.nameLabel.scaleY = 1/this.scaleY;
            this.nameLabel.x = -(this.labelWidth/2)  * this.nameLabel.scaleX;

            if (!this.nameLabel.cacheCanvas && this.labelWidth){
                this.nameLabel.cache(0, 0, this.labelWidth, this.nameLabel.getMeasuredLineHeight());
            }
        }
    });

    return EnemyShip;
});