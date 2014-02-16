define(['createjs','view/starship'],function(createjs,StarShip){

    var Container = createjs.Container,
        Shape = createjs.Shape;

    var enemyShipBody;

    (function(){

        this.shape = new Shape();
        this.shape.graphics.f().s("#020303").ss(1,0,0,4).p("AAeg0QghgCgTA2QgGAIAEAUQAEAZAXAAQAJgVASgG");
        this.shape.setTransform(32.6,45,1.125,1.125);

        this.shape_1 = new Shape();
        this.shape_1.graphics.lf(["#F39816","#EA5022","#E71E25"],[0,0.498,1],3,0,-2.7,0).s().p("AgaAcQgDgUAGgIQATg2AgACIAABOQgRAGgKAVQgXAAgEgZg");
        this.shape_1.setTransform(32.8,45,1.125,1.125);

        this.shape_2 = new Shape();
        this.shape_2.graphics.f().s("#020303").ss(1,0,0,4).p("Agcg0QATgBANASQAMAOAHAVQAMA1glAAQgJgVgRgG");
        this.shape_2.setTransform(39.3,45,1.125,1.125);

        this.shape_3 = new Shape();
        this.shape_3.graphics.lf(["#F39816","#EA5022","#E71E25"],[0,0.498,1],-2.9,0,2.8,0).s().p("AgbAaIAAhOQATgBANASQAMAOAHAVQANA1glAAQgJgVgSgGg");
        this.shape_3.setTransform(39.2,45,1.125,1.125);

        this.shape_4 = new Shape();
        this.shape_4.graphics.f().s("#020303").ss(1,0,0,4).p("ACck+IgFAAQgqBfgUBfQgMA0gXBmIi4CgIgbCGIAMAAIAphQIDGhQQAIA6AeAqQAbAlAAAX");
        this.shape_4.setTransform(17.8,36,1.125,1.125);

        this.shape_5 = new Shape();
        this.shape_5.graphics.lf(["#323232","#646565","#969696"],[0,0.349,1],16,0,-15.9,0).s().p("AidE/IAaiFIC5igIAiibQAVheAqhgIAFAAIACJ9QgBgWgagkQgegqgHg6IjGBQIgqBPg");
        this.shape_5.setTransform(17.9,36,1.125,1.125);

        this.shape_6 = new Shape();
        this.shape_6.graphics.f().s("#020303").ss(1,0,0,4).p("Aijk+IAPAAQAqBfAVBfQALA0AXBmIC4CgIAbCGIgMAAIgphQIjGhQQgIA6ggAqQgdAlAAAX");
        this.shape_6.setTransform(53.9,36,1.125,1.125);

        this.shape_7 = new Shape();
        this.shape_7.graphics.lf(["#323232","#646565","#969696"],[0,0.349,1],-16.3,0,16.3,0).s().p("ACWE/IgphPIjHhQQgHA6ggAqQgdAkAAAXIgDp+IAPAAQAqBgAUBeIAjCbIC4CgIAbCFg");
        this.shape_7.setTransform(53.7,36,1.125,1.125);

        this.shape_8 = new Shape();
        this.shape_8.graphics.f().s("#020303").ss(1,0,0,4).p("AgJhcIAAAcIAFAMIgBCRIALAAIgBiRIAFgMIAAgcg");
        this.shape_8.setTransform(18,34.5,1.125,1.125);

        this.shape_9 = new Shape();
        this.shape_9.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],1.1,0,-1.1,0).s().p("AgFBdIABiRIgEgMIAAgcIASAAIAAAcIgGAMIACCRg");
        this.shape_9.setTransform(18,34.5,1.125,1.125);

        this.shape_10 = new Shape();
        this.shape_10.graphics.f().s("#020303").ss(1,0,0,4).p("AAKhcIAAAcIgFAMIABCRIgMAAIACiRIgFgMIAAgcg");
        this.shape_10.setTransform(54,34.5,1.125,1.125);

        this.shape_11 = new Shape();
        this.shape_11.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-1.1,0,1.1,0).s().p("AgFBdIACiRIgGgMIAAgcIASAAIAAAcIgEAMIABCRg");
        this.shape_11.setTransform(54,34.5,1.125,1.125);

        this.shape_12 = new Shape();
        this.shape_12.graphics.f().s("#020303").ss(1,0,0,4).p("AgFhcIAAAdIADALIgDCRIALAAIgFiRIACgLIAAgdg");
        this.shape_12.setTransform(5.2,46.5,1.125,1.125);

        this.shape_13 = new Shape();
        this.shape_13.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],0.8,0,-0.7,0).s().p("AgFBdIADiRIgDgLIAAgdIAIAAIAAAdIgCALIAFCRg");
        this.shape_13.setTransform(5.2,46.5,1.125,1.125);

        this.shape_14 = new Shape();
        this.shape_14.graphics.f().s("#020303").ss(1,0,0,4).p("AAKhcIAAAdIgFALIABCRIgMAAIACiRIgFgLIAAgdg");
        this.shape_14.setTransform(65.3,46.5,1.125,1.125);

        this.shape_15 = new Shape();
        this.shape_15.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-1.1,0,1.1,0).s().p("AgFBdIACiRIgGgLIAAgdIATAAIAAAdIgFALIABCRg");
        this.shape_15.setTransform(65.3,46.5,1.125,1.125);

        this.shape_16 = new Shape();
        this.shape_16.graphics.f().s("#020303").ss(1,0,0,4).p("AgkA2QACACAiAAQAjAAABgCQACgBAAglIAAgmIgmgaIgkgHQAAATgBA0QAAAkABACg");
        this.shape_16.setTransform(46.2,59.6,1.125,1.125);

        this.shape_17 = new Shape();
        this.shape_17.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],-4,0.1,4,0.1).s().p("AgkA1QgCgBAAgkIADhHIAjAHIAmAaIAAAmQAAAkgBACQgCACgjAAQghAAgDgDg");
        this.shape_17.setTransform(46.2,59.6,1.125,1.125);

        this.shape_18 = new Shape();
        this.shape_18.graphics.f().s("#020303").ss(1,0,0,4).p("AAkg3QAAATACA0QAAAkgBACQgCACgjAAQgiAAgCgCQgBgBAAglIAAgmIAlgag");
        this.shape_18.setTransform(25.7,59.6,1.125,1.125);

        this.shape_19 = new Shape();
        this.shape_19.graphics.lf(["#020303","#252524","#474747","#252524","#020303"],[0,0.2,0.498,0.8,1],4,0.1,-4,0.1).s().p("AgkA2QgBgCAAgkIAAgmIAlgaIAkgHIACBHQAAAkgBABQgCADgjAAQgiAAgCgCg");
        this.shape_19.setTransform(25.7,59.6,1.125,1.125);

        this.container = new Container();
        this.container.addChild(this.shape_19,this.shape_18,this.shape_17,this.shape_16,this.shape_15,this.shape_14,this.shape_13,this.shape_12,this.shape_11,this.shape_10,this.shape_9,this.shape_8,this.shape_7,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape);
        this.container.cache(0,0,72,72);

        enemyShipBody = this.container.cacheCanvas;
    })();

    var EnemyShip = function (model){
        this.model = model;

        this.shipBody = new createjs.DisplayObject();
        this.shipBody.cacheCanvas =  enemyShipBody;

        this.exhaustSprites = preloader.getResult("redExhaustSprites");

        this.nameLabel = new createjs.Text("", "20px SpaceRanger", "#fff");

        this.initialize();
    };

    EnemyShip.prototype = new StarShip();

    extend.call(EnemyShip.prototype, {

        initialize : function(){
            StarShip.prototype.initialize.call(this);

            this.nameLabel.setBounds()
            this.nameLabel.text = this.model.get("username");

            this.nameLabel.alpha = 0.8;

            this.addChild(this.nameLabel);
        },

        _tick : function(evt){
            StarShip.prototype._tick.call(this, evt);

            if (!this.nameLabel.cacheCanvas){
                var labelWidth = this.nameLabel.getMeasuredWidth();

                if (labelWidth > 0){
                    this.nameLabel.x = -labelWidth/2;
                    this.nameLabel.y = (this.model.height/2)+22;
                    this.nameLabel.cache(0, 0, labelWidth, this.nameLabel.getMeasuredLineHeight());
                }
            }

        }
    });

    return EnemyShip;
});