define(['models/constants', 'handlebars', 'txt!templates/connection-failed.html', 'txt!templates/disconnected.html',
        'txt!templates/death.html', 'txt!templates/leaderboard.html', 'txt!templates/info.html', 'txt!templates/info.html', 'txt!templates/unsupported-browser.html'],
    function (Constants, Handlebars, connectionFailedTpl, disconnectedTpl, deathTpl, leaderboardTpl, infoTpl, unsupportedBrowserTpl){
        'use strict';

        deathTpl = Handlebars.compile(deathTpl);
        leaderboardTpl = Handlebars.compile(leaderboardTpl);

        Handlebars.registerHelper('showUser', function(obj){
            if (!this || !this.user) return '';
            if (!this.leaderboard) return obj.fn();

            for (var i=0; i < this.leaderboard.length; i++){
                var user = this.leaderboard[i];
                if (user.name === this.user.name && user.icon === this.user.icon){
                    return '';
                }
            }
            return obj.fn(this.user);
        });

        var modal = document.getElementById("modal");
        var connecting = document.getElementById("connecting");

        var infoIcon = document.getElementById("info");
        var soundIcon = document.getElementById("sound");
        var fullScreenIcon = document.getElementById("full-screen");
        var latencyIcon = document.getElementById("latency");

        var existingDialog;

        var ModalsView = {

             initialize : function(){
                 if (gameData.user.muted){
                     soundIcon.className = "active";
                 }

                 infoIcon.addEventListener("click", toggleInfoWindow);
                 soundIcon.addEventListener("click", toggleSound);
                 fullScreenIcon.addEventListener("click", toggleFullScreen);

                 document.addEventListener("keydown", onKeyDown);
                 //gameData.on(Constants.Events.LATENCY_CHANGED, onLatencyChanged);


             },

             setConnecting : function(value){
                 value ? connecting.show() : connecting.hide();
                 return ModalsView;
             },

             showConnectionFailedModal : function(){

                 ModalsView.showModal(connectionFailedTpl);

                 document.addEventListener('keydown', onSubmit);
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDisconnectedModal : function(){

                 ModalsView.showModal(disconnectedTpl);

                 document.addEventListener('keydown', onSubmit);
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDeathModal : function(data){
                ModalsView.showModal(deathTpl(data));
                return ModalsView;
             },

             showLeaderboardModal : function(data){

                ModalsView.showModal(leaderboardTpl(data));

                 document.addEventListener('keydown', onSubmit);
                document.getElementById("deploy-button").addEventListener("click", onSubmit);
                return ModalsView;
             },

             showInfoModal : function(){

                 existingDialog = document.getElementsByClassName('modal-dialog')[0];
                 ModalsView.showModal(infoTpl);

                 infoIcon.className = "active";

                 document.getElementById("close-button").addEventListener("click", ModalsView.closeInfoModal);

                 return this;
             },

             closeInfoModal : function(evt){
                 modal.innerHTML = "";
                 modal.hide();
                 infoIcon.className = null;

                 if (existingDialog){
                     showModalById(existingDialog.id);
                     existingDialog = undefined;
                 }
             },

             showUnsupportedBrowserModal : function(){
                 return ModalsView.showModal(unsupportedBrowserTpl);
             },


             showModal : function(template){
                 modal.innerHTML = template;
                 modal.show();

                 var modalDialog = document.getElementsByClassName('modal-dialog')[0];
                 var padding = Math.max((window.innerHeight - modalDialog.children[0].offsetHeight) * 0.4, 0);
                 modalDialog.setAttribute("style", "margin-top:"+padding+"px");

                 return this;
             },

             removeModal : function(){
                 modal.innerHTML = "";
                 modal.hide();
                 infoIcon.className = null;

                 document.removeEventListener('keydown', onSubmit);

                 return ModalsView;
             }
        };

        function onKeyDown(evt){
            switch (evt.keyCode){
                case 73:
                    toggleInfoWindow();
                    break;
                case 83:
                    toggleSound();
                    break;
                case 70:
                    toggleFullScreen();
                    break;
            }
        }

        function onLatencyChanged(value){
            if (value < 100){
                latencyIcon.className = "high";
            }else if (value < 200){
                latencyIcon.className = "medium";
            }else{
                latencyIcon.className = "low";
            }

            latencyIcon.setAttribute("title", "Ping "+Math.round(value));
        }


        function toggleInfoWindow(){
            if (infoIcon.className !== "active"){
                ModalsView.showInfoModal();
            }else{
                ModalsView.closeInfoModal();
            }
        }

        function toggleSound(){
            if (!gameData.user.muted){
                gameData.setMuted(true);
                soundIcon.className = "active";
            }else{
                gameData.setMuted(false);
                soundIcon.className = null;
            }
        }

        function toggleFullScreen(){
            if (!document.isFullScreen()){
                document.documentElement.requestFullScreen();
            }else{
                document.exitFullScreen();
            }
        }

        function showModalById(id){
            switch (id){
                case "welcome":
                    ModalsView.showWelcomeModal();
                    break;
                case "connection-failed":
                    ModalsView.showConnectionFailedModal();
                    break;
                case "disconnected":
                    ModalsView.showDisconnectedModal();
                    break;
                case "death":
                    ModalsView.showDeathModal();
                    break;
                case "leaderboard":
                    ModalsView.showLeaderboardModal();
                    break;
                default:
                    console.warn("Unknown modal id: "+id);
                    break;
            }
        }

        function onSubmit(evt){
            if (evt.type == "click" || evt.which == 13){
                gameData.trigger(Constants.Events.DEPLOY);
                ModalsView.removeModal();
            }
        }

        return ModalsView;
    }
);

