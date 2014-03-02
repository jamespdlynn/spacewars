define(['createjs','view/gauge','model/constants','model/game'],function(createjs, FuelGauge, Constants,gameData){

    var WIDTH = 240;
    var HEIGHT = 20;

    var Container = createjs.Container;

    var UserContainer = function (){
        this.usernameLabel = new createjs.Text("","14px Arkitech", "#fff");
        this.deathLabel = new createjs.Text("","bold 19px Helvetica", "#fff");
        this.killLabel =  new createjs.Text("","bold 19px Helvetica", "#fff");

        this.deathIcon = new createjs.Bitmap(preloader.getResult('deathIcon'));
        this.killIcon = new createjs.Bitmap(preloader.getResult('killIcon'));

        this.tickEnabled = false;
        this.tickChildren = false;

        this.initialize();
    };

    UserContainer.prototype = new Container();

    extend.call(UserContainer.prototype, {

        initialize : function(){

            Container.prototype.initialize.call(this);

            this.addChild(this.usernameLabel, this.deathLabel, this.killLabel, this.deathIcon, this.killIcon);
            this.setBounds(0, 0, WIDTH, HEIGHT);

            var self = this;
            self.update();
            gameData.on(Constants.Events.USER_CHANGED, function(){
                self.update();
            });
        },

        update : function(){

            var data = gameData.user;

            this.usernameLabel.text = data.username;
            this.usernameLabel.x = 0;
            this.usernameLabel.y = 1;

            this.deathLabel.text = data.deaths;
            this.deathLabel.x =  WIDTH - this.deathLabel.getMeasuredWidth();
            this.deathLabel.y = 0;

            this.deathIcon.x = this.deathLabel.x - HEIGHT - 8;
            this.deathIcon.y = 1;

            this.killLabel.text = data.kills;
            this.killLabel.x =  this.deathIcon.x - this.killLabel.getMeasuredWidth() - 15;
            this.killLabel.y = 0;

            this.killIcon.x =  this.killLabel.x - HEIGHT - 8;
            this.killIcon.y = 1;

            this.cache(0, 0, WIDTH, HEIGHT);
        }

    });

    return UserContainer;

});