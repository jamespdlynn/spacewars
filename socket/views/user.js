define(['createjs'],function(createjs){
    'use strict';

    var WIDTH = 240;
    var HEIGHT = 55;
    var USER_ICON_SIZE = 50;
    var KILL_ICON_SIZE = 20;

    var Container = createjs.Container;

    var UserContainer = function (){

        this.userLabel = new createjs.Text("","14px Arkitech", "#fff");
        this.killLabel =  new createjs.Text("","bold 19px Helvetica");
        this.killIcon = new createjs.Bitmap(preloader.getResult('killIcon'));

        this.tickChildren = false;

        this.initialize();
        this.render();
    };

    UserContainer.prototype = new Container();

    extend.call(UserContainer.prototype, {

        initialize : function(){

            Container.prototype.initialize.call(this);

            this.addChild(this.userLabel, this.killLabel, this.killIcon);
            this.setBounds(0, 0, WIDTH, HEIGHT);

        },

        render : function(player){

            player = player || gameData.userPlayer;

            if (this.player && this.player.id === player.id){
                return;
            }

            this.player = player;

            this.userLabel.x = USER_ICON_SIZE + 10;
            this.userLabel.y = 2;
            this.userLabel.text = player.get('name');

            this.killIcon.x = this.userLabel.x;
            this.killIcon.y =  this.userLabel.getMeasuredLineHeight() + 8;

            this.killLabel.text = player.get('kills');
            this.killLabel.color = player.equals(gameData.userPlayer) ? "#00FF00" : "#FF0000";
            this.killLabel.x =  this.killIcon.x + KILL_ICON_SIZE + 8;
            this.killLabel.y =  this.killIcon.y - 1;

            this.cache(0, 0, WIDTH, HEIGHT);

            var self = this;

            if (this.userIcon){
                this.removeChild(this.userIcon);
            }
            this.userIcon = new createjs.Bitmap(player.get('icon'));
            this.userIcon.image.onload = function(){
                self.addChild(self.userIcon);
                self.cache(0, 0, WIDTH, HEIGHT);
            }

        },

        _tick : function(){
            if (this.killLabel.text != this.player.get('kills')){
                this.killLabel.text = this.player.get('kills');
                this.cache(0, 0, WIDTH, HEIGHT);
            }
        }

    });

    return UserContainer;

});