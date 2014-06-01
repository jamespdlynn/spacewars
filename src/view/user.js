define(['createjs','model/constants'],function(createjs, Constants){
    'use strict';

    var WIDTH = 240;
    var HEIGHT = 55;
    var ICON_SIZE = 20;

    var Container = createjs.Container;

    var UserContainer = function (){

        this.zoneLabel =  new createjs.Text("","16px Arkitech", "#fff");
        this.usernameLabel = new createjs.Text("","15px Arkitech", "#fff");
        this.killLabel =  new createjs.Text("","bold 19px Helvetica", "#00FF00");
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

            this.usernameLabel.text = gameData.userPlayer.get("username");
            this.usernameLabel.x = 0;
            this.usernameLabel.y = 0;

            this.killIcon.x = this.usernameLabel.x + this.usernameLabel.getMeasuredWidth() +  12;
            this.killIcon.y =  this.usernameLabel.y;

            this.killLabel.text = gameData.roundKills;
            this.killLabel.x =  this.killIcon.x + ICON_SIZE + 8;
            this.killLabel.y =   this.usernameLabel.y - 1;

            this.cache(0, 0, WIDTH, HEIGHT);
        },

        updateZone : function(){
            this.zoneLabel.text = "Sector "+gameData.getZoneString();
            this.zoneLabel.x = 0;
            this.zoneLabel.y = ICON_SIZE + 12;

            this.cache(0, 0, WIDTH, HEIGHT);
        }

    });

    return UserContainer;

});