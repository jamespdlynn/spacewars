define(['createjs','view/starship','model/constants'],function(createjs,StarShip, Constants){

    var Container = createjs.Container,
        Shape = createjs.Shape;

    var enemyShipBody;

    (function(){

        this.shape = new Shape();
        this.shape.graphics.f().s("#020303").ss(1,0,0,4).p("AAeg0QghgCgTA2QgGAIAEAUQAEAZAXAAQAJgVASgG");
        this.shape.setTransform(29.6,40.5);

        this.shape_1 = new Shape();
        this.shape_1.graphics.lf(["#F39816","#EA5022","#E71E25"],[0,0.498,1],3,0,-2.7,0).s().p("AgaAcQgDgUAGgIQATg2AgACIAABOQgRAGgKAVQgXAAgEgZg");
        this.shape_1.setTransform(29.8,40.5);

        this.shape_2 = new Shape();
        this.shape_2.graphics.f().s("#020303").ss(1,0,0,4).p("Agcg0QATgBANASQAMAOAHAVQAMA1glAAQgJgVgRgG");
        this.shape_2.setTransform(35.6,40.5);

        this.shape_3 = new Shape();
        this.shape_3.graphics.lf(["#F39816","#EA5022","#E71E25"],[0,0.498,1],-2.9,0,2.8,0).s().p("AgbAaIAAhOQATgBANASQAMAOAHAVQANA1glAAQgJgVgSgGg");
        this.shape_3.setTransform(35.5,40.5);

        this.shape_4 = new Shape();
        this.shape_4.graphics.f().s("#020303").ss(1,0,0,4).p("ACck+IgFAAQgqBfgUBfQgMA0gXBmIi4CgIgbCGIAMAAIAphQIDGhQQAIA6AeAqQAbAlAAAX");
        this.shape_4.setTransform(16.5,32.5);

        this.shape_5 = new Shape();
        this.shape_5.graphics.lf(["#323232","#646565","#969696"],[0,0.349,1],16,0,-15.9,0).s().p("AidE/IAaiFIC5igIAiibQAVheAqhgIAFAAIACJ9QgBgWgagkQgegqgHg6IjGBQIgqBPg");
        this.shape_5.setTransform(16.5,32.5);

        this.shape_6 = new Shape();
        this.shape_6.graphics.f().s("#020303").ss(1,0,0,4).p("Aijk+IAPAAQAqBfAVBfQALA0AXBmIC4CgIAbCGIgMAAIgphQIjGhQQgIA6ggAqQgdAlAAAX");
        this.shape_6.setTransform(48.6,32.5);

        this.shape_7 = new Shape();
        this.shape_7.graphics.lf(["#323232","#646565","#969696"],[0,0.349,1],-16.3,0,16.3,0).s().p("ACWE/IgphPIjHhQQgHA6ggAqQgdAkAAAXIgDp+IAPAAQAqBgAUBeIAjCbIC4CgIAbCFg");
        this.shape_7.setTransform(48.4,32.5);

        this.shape_8 = new Shape();
        this.shape_8.graphics.f().s("#020303").ss(1,0,0,4).p("AgJhcIAAAcIAFAMIgBCRIALAAIgBiRIAFgMIAAgcg");
        this.shape_8.setTransform(16.7,31.2);

        this.shape_9 = new Shape();
        this.shape_9.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],1.1,0,-1.1,0).s().p("AgFBdIABiRIgEgMIAAgcIASAAIAAAcIgGAMIACCRg");
        this.shape_9.setTransform(16.7,31.2);

        this.shape_10 = new Shape();
        this.shape_10.graphics.f().s("#020303").ss(1,0,0,4).p("AAKhcIAAAcIgFAMIABCRIgMAAIACiRIgFgMIAAgcg");
        this.shape_10.setTransform(48.7,31.2);

        this.shape_11 = new Shape();
        this.shape_11.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-1.1,0,1.1,0).s().p("AgFBdIACiRIgGgMIAAgcIASAAIAAAcIgEAMIABCRg");
        this.shape_11.setTransform(48.7,31.2);

        this.shape_12 = new Shape();
        this.shape_12.graphics.f().s("#020303").ss(1,0,0,4).p("AgFhcIAAAdIADALIgDCRIALAAIgFiRIACgLIAAgdg");
        this.shape_12.setTransform(5.3,41.8);

        this.shape_13 = new Shape();
        this.shape_13.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],0.8,0,-0.7,0).s().p("AgFBdIADiRIgDgLIAAgdIAIAAIAAAdIgCALIAFCRg");
        this.shape_13.setTransform(5.3,41.8);

        this.shape_14 = new Shape();
        this.shape_14.graphics.f().s("#020303").ss(1,0,0,4).p("AAKhcIAAAdIgFALIABCRIgMAAIACiRIgFgLIAAgdg");
        this.shape_14.setTransform(58.7,41.8);

        this.shape_15 = new Shape();
        this.shape_15.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-1.1,0,1.1,0).s().p("AgFBdIACiRIgGgLIAAgdIATAAIAAAdIgFALIABCRg");
        this.shape_15.setTransform(58.7,41.8);

        this.shape_16 = new Shape();
        this.shape_16.graphics.f().s("#020303").ss(1,0,0,4).p("AgkA2QACACAiAAQAjAAABgCQACgBAAglIAAgmIgmgaIgkgHQAAATgBA0QAAAkABACg");
        this.shape_16.setTransform(41.8,53.5);

        this.shape_17 = new Shape();
        this.shape_17.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-4,0.1,4,0.1).s().p("AgkA1QgCgBAAgkIADhHIAjAHIAmAaIAAAmQAAAkgBACQgCACgjAAQghAAgDgDg");
        this.shape_17.setTransform(41.8,53.5);

        this.shape_18 = new Shape();
        this.shape_18.graphics.f().s("#020303").ss(1,0,0,4).p("AAkg3QAAATACA0QAAAkgBACQgCACgjAAQgiAAgCgCQgBgBAAglIAAgmIAlgag");
        this.shape_18.setTransform(23.5,53.5);

        this.shape_19 = new Shape();
        this.shape_19.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],4,0.1,-4,0.1).s().p("AgkA2QgBgCAAgkIAAgmIAlgaIAkgHIACBHQAAAkgBABQgCADgjAAQgiAAgCgCg");
        this.shape_19.setTransform(23.5,53.5);

        this.container = new Container();
        this.container.addChild(this.shape_19,this.shape_18,this.shape_17,this.shape_16,this.shape_15,this.shape_14,this.shape_13,this.shape_12,this.shape_11,this.shape_10,this.shape_9,this.shape_8,this.shape_7,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape);
        this.container.cache(0,0,Constants.Player.width,Constants.Player.height);

        enemyShipBody = this.container.cacheCanvas;
    })();

    var EnemyShip = function (model){
        this.model = model;

        this.shipBody = new createjs.DisplayObject();
        this.shipBody.cacheCanvas =  enemyShipBody;

        this.exhaustSprites = new createjs.SpriteSheet({
            images: [preloader.getResult("redExhaustSprites")],
            frames: {width:18, height:20},
            animations: {"play": [0, 1, 2, 3, 2, 1, "play"]},
            framerate : 15
        });

        this.shieldColor = {r:200, g:0, b:0};
        this.nameLabel = new createjs.Text("", "7.5pt Arkitech", "#fff");

        this.initialize();
    };

    EnemyShip.prototype = new StarShip();

    extend.call(EnemyShip.prototype, {

        initialize : function(){
            StarShip.prototype.initialize.call(this);

            this.volume = 0.5;

            this.nameLabel.y = (this.model.height/2)+22;
            this.nameLabel.text = this.model.get("username");
            this.nameLabel.alpha = 0.9;

            this.addChild(this.nameLabel);
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