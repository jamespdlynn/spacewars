define(['createjs','model/constants','model/game'],function(createjs, Constants,gameData){
    'use strict';

    var WIDTH = 240;
    var HEIGHT = 55;
    var ICON_SIZE = 20;
    var PADDING = 10;

    var Container = createjs.Container;

    var UserContainer = function (){

        this.zoneLabel =  new createjs.Text("","16px Arkitech", "#fff");
        this.usernameLabel = new createjs.Text("","15px Arkitech", "#fff");

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

            this.addChild(this.usernameLabel, this.deathLabel, this.killLabel, this.deathIcon, this.killIcon, this.zoneLabel);
            this.setBounds(0, 0, WIDTH, HEIGHT);

            var self = this;

            self.updateUser();
            gameData.on(Constants.Events.USER_CHANGED, function(){
                self.updateUser();
            });

            self.updateZone();
            gameData.on(Constants.Events.ZONE_CHANGED, function(){
                self.updateZone();
            });

        },

        updateUser : function(){

            var data = gameData.user;

            this.usernameLabel.text = data.username;
            this.usernameLabel.x = 0;
            this.usernameLabel.y = 0;

            this.killIcon.x = this.usernameLabel.x + this.usernameLabel.getMeasuredWidth() +  12;
            this.killIcon.y =  this.usernameLabel.y;

            this.killLabel.text = data.kills;
            this.killLabel.x =  this.killIcon.x + ICON_SIZE + 8;
            this.killLabel.y =   this.usernameLabel.y - 1;

            this.deathIcon.x = this.killLabel.x + this.killLabel.getMeasuredWidth() +  12;
            this.deathIcon.y =  this.usernameLabel.y;

            this.deathLabel.text = data.deaths;
            this.deathLabel.x =  this.deathIcon.x + ICON_SIZE + 8;
            this.deathLabel.y =  this.usernameLabel.y - 1;

            this.cache(0, 0, WIDTH, HEIGHT);
        },

        updateZone : function(){
            this.zoneLabel.text = "Sector "+gameData.currentZone.toString();
            this.zoneLabel.x = 0;
            this.zoneLabel.y = ICON_SIZE + 12;

            this.cache(0, 0, WIDTH, HEIGHT);
        }

    });

    return UserContainer;

});