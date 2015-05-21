define(['model/constants', 'handlebars', 'txt!tpl/connection-failed.html', 'txt!tpl/disconnected.html',
        'txt!tpl/death.html', 'txt!tpl/about.html', 'txt!tpl/unsupported-browser.html'],
    function (Constants, Handlebars, connectionFailedTpl, disconnectedTpl, deathTpl, aboutTpl, unsupportedBrowserTpl){
        'use strict';

        var modal = document.getElementById("modal");
        var connecting = document.getElementById("connecting");

        var aboutIcon = document.getElementById("about");
        var soundIcon = document.getElementById("sound");
        var fullScreenIcon = document.getElementById("full-screen");
        var latencyIcon = document.getElementById("latency");

        var deathTpl = Handlebars.compile(deathTpl);

        var existingDialog;

        var ModalsView = {

             initialize : function(){
                 if (gameData.user.muted){
                     soundIcon.className = "active";
                 }

                 aboutIcon.addEventListener("click", toggleAboutWindow);
                 soundIcon.addEventListener("click", toggleSound);
                 fullScreenIcon.addEventListener("click", toggleFullScreen);

                 document.addEventListener("keydown", onKeyDown);
                 gameData.on(Constants.Events.LATENCY_CHANGED, onLatencyChanged);
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

             showDeathModal : function(slayer){
                 console.log("HERE: "+deathTpl({slayer:slayer}));
                 ModalsView.showModal(deathTpl({slayer:slayer}));
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);
                 return ModalsView;
             },

             showAboutModal : function(){

                 existingDialog = document.getElementsByClassName('modal-dialog')[0];
                 ModalsView.showModal(aboutTpl);

                 aboutIcon.className = "active";

                 document.getElementById("close-button").addEventListener("click", ModalsView.closeAboutModal);

                 return this;
             },

             closeAboutModal : function(){
                 modal.innerHTML = "";
                 modal.hide();
                 aboutIcon.className = null;

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
                 aboutIcon.className = null;

                 document.removeEventListener('keydown', onSubmit);

                 return ModalsView;
             }
        };

        function onKeyDown(evt){
            /*switch (evt.keyCode){
                case 65:
                    toggleAboutWindow();
                    break;
                case 83:
                    toggleSound();
                    break;
                case 70:
                    toggleFullScreen();
                    break;
            }*/
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


        function toggleAboutWindow(){
            if (aboutIcon.className !== "active"){
                ModalsView.showAboutModal();
            }else{
                ModalsView.closeAboutModal();
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
                case "welcome-modal":
                    ModalsView.showWelcomeModal();
                    break;
                case "connection-failed-modal":
                    ModalsView.showConnectionFailedModal();
                    break;
                case "disconnected-modal":
                    ModalsView.showDisconnectedModal();
                    break;
                case "death-modal":
                    ModalsView.showDeathModal();
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

