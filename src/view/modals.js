define(['model/constants', 'model/game', 'txt!tpl/welcome.html', 'txt!tpl/connection-failed.html',
    'txt!tpl/disconnected.html', 'txt!tpl/death.html', 'txt!tpl/about.html', 'txt!tpl/unsupported-browser.html', 'txt!tpl/unsupported-device.html'],
    function (Constants, gameData, welcomeTpl, connectionFailedTpl, disconnectedTpl, deathTpl, aboutTpl, unsupportedBrowserTpl, unsupportedDeviceTpl){
        'use strict';

        var modal = document.getElementById("modal");
        var connecting = document.getElementById("connecting");

        var aboutIcon = document.getElementById("about");
        var soundIcon = document.getElementById("sound");
        var fullScreenIcon = document.getElementById("full-screen");
        var viewIcon = document.getElementById("view");

        var existingDialog;

        if (gameData.user.muted){
            soundIcon.className = "active";
        }

        if (gameData.user.cameraMode === 'auto'){
            viewIcon.className = "active";
        }

        aboutIcon.addEventListener("click", toggleAboutWindow);
        soundIcon.addEventListener("click", toggleSound);
        fullScreenIcon.addEventListener("click", toggleFullScreen);
        viewIcon.addEventListener("click", toggleCameraMode);

        document.addEventListener("keydown", onKeyDown);



        var ModalsView = {

             setConnecting : function(value){
                 value ? connecting.show() : connecting.hide();
                 return ModalsView;
             },

             showWelcomeModal : function(){

                 ModalsView.showModal(welcomeTpl);

                 var usernameInput = document.getElementById("username-input");
                 var deployButton = document.getElementById("deploy-button");

                 var onSubmit = function(evt){
                     if (evt.type == "click" || evt.which == 13){
                         if (usernameInput.value.length){
                             document.removeEventListener('keydown', onSubmit);
                             document.removeEventListener('keyup', onKeyUp);
                             document.addEventListener('keydown', onKeyDown);
                             gameData.setUsername(usernameInput.value).trigger(Constants.Events.DEPLOY);
                         }else{
                             usernameInput.focus();
                         }
                     }
                 };

                 var onKeyUp = function(){
                     usernameInput.value.length ? deployButton.show(true) : deployButton.hide();
                 };

                 usernameInput.focus();
                 deployButton.addEventListener("click", onSubmit);

                 document.removeEventListener('keydown', onKeyDown);
                 document.addEventListener('keydown', onSubmit);
                 document.addEventListener('keyup', onKeyUp);

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

             showDeathModal : function(){

                 ModalsView.showModal(deathTpl);

                 if (gameData.slayer){
                     document.getElementById("death-title").innerHTML = "Slain by "+gameData.slayer.username;
                 }

                 document.getElementById("total-kills").innerHTML = gameData.user.kills;
                 document.getElementById("total-deaths").innerHTML = gameData.user.deaths;
                 document.getElementById("round-kills").innerHTML = "+"+gameData.roundKills;

                 document.getElementById("deploy-button").addEventListener("click", onSubmit);
                 document.addEventListener('keydown', onSubmit);


                 return ModalsView;
             },

             showAboutModal : function(){

                 existingDialog = document.getElementsByClassName('modal-dialog')[0];
                 ModalsView.showModal(aboutTpl);

                 aboutIcon.className = "active";

                 document.getElementById("close-button").addEventListener("click", ModalsView.closeAboutModal);
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
                 ModalsView.showModal(unsupportedBrowserTpl);
             },

             showUnsupportedDeviceModal : function(){
                 ModalsView.showModal(unsupportedDeviceTpl);
             },

             showModal : function(template){
                 modal.innerHTML = template;
                 modal.show();

                 var modalDialog = document.getElementsByClassName('modal-dialog')[0];
                 var padding = Math.max((window.innerHeight - modalDialog.children[0].offsetHeight)/2, 0);
                 modalDialog.setAttribute("style", "margin-top:"+padding+"px");
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
            switch (evt.keyCode){
                case 65:
                    toggleAboutWindow();
                    break;
                case 83:
                    toggleSound();
                    break;
                case 90:
                    toggleCameraMode();
                    break;
                case 70:
                    toggleFullScreen();
                    break;
            }
        }


        function toggleAboutWindow(){
            if (aboutIcon.className !== "active"){
                ModalsView.showAboutModal();
            }else{
                ModalsView.closeAboutModal();
            }
        }

        function toggleCameraMode(){
            if (gameData.user.cameraMode === 'auto'){
                gameData.setCameraMode('manual');
                viewIcon.className = null;
            }else{
                gameData.setCameraMode('auto');
                viewIcon.className = "active";
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
            }
        }

        return ModalsView;
    }
);

