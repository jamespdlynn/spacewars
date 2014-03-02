define(['model/constants', 'model/game', 'txt!tpl/welcome.html', 'txt!tpl/connection-failed.html', 'txt!tpl/disconnected.html', 'txt!tpl/death.html', 'txt!tpl/about.html'],
    function (Constants, gameData, welcomeTpl, connectionFailedTpl, disconnectedTpl, deathTpl, aboutTpl){

        var modal = document.getElementById("modal");
        var connecting = document.getElementById("connecting");

        var aboutIcon = document.getElementById("about");
        var soundIcon = document.getElementById("sound");
        var fullScreenIcon = document.getElementById("full-screen");

        if (gameData.user.muted) soundIcon.className = "active";

        var ModalsView = {

             setConnecting : function(value){
                 value ? connecting.show() : connecting.hide();
                 return ModalsView;
             },

             showWelcomeModal : function(){

                 modal.innerHTML= welcomeTpl;
                 modal.show();

                 var usernameInput = document.getElementById("username-input");
                 var deployButton = document.getElementById("deploy-button");

                 var onSubmit = function(evt){
                     if (evt.type == "click" || evt.which == 13){

                         if (usernameInput.value.length){
                             document.onkeydown = undefined;
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
                 //deployButton.hide();
                 deployButton.addEventListener("click", onSubmit);
                 document.onkeydown = onSubmit;
                 document.onkeyup =  onKeyUp;

                 return ModalsView;
             },

             showConnectionFailedModal : function(){

                 modal.innerHTML = connectionFailedTpl;
                 modal.show();

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDisconnectedModal : function(){

                 this.removeModals();

                 modal.innerHTML += disconnectedTpl;
                 modal.show();

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDeathModal : function(){

                 modal.innerHTML = deathTpl;
                 modal.show();

                 if (gameData.slayer){
                     document.getElementById("death-title").innerHTML = "Slain by "+gameData.slayer;
                 }

                 document.getElementById("total-kills").innerHTML = gameData.user.kills;
                 document.getElementById("total-deaths").innerHTML = gameData.user.deaths;

                 if (gameData.roundKills > 0){
                     document.getElementById("round-kills").innerHTML = "+"+gameData.roundKills;
                 }

                 document.getElementById("round-deaths").innerHTML = "+1";
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);
                 document.onkeydown = onSubmit;


                 return ModalsView;
             },

             showAboutModal : function(){

                 var existingDialog = document.getElementsByClassName('modal-dialog')[0];

                 modal.innerHTML = aboutTpl;
                 modal.show();

                 document.getElementById("close-button").addEventListener("click", function(){

                     modal.innerHTML = "";
                     modal.hide();

                     if (existingDialog){
                         switch (existingDialog.id){
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
                         }
                     }

                 });
             },

             removeModals : function(){

                 modal.innerHTML = "";
                 modal.hide();

                 document.onkeydown = null;
                 document.onkeyup = null;
                 aboutIcon.className = null;

                 return ModalsView;
             }
        };

        function onSubmit(evt){
            if (evt.type == "click" || evt.which == 13){
                gameData.trigger(Constants.Events.DEPLOY);
            }
        }

        aboutIcon.addEventListener("click", ModalsView.showAboutModal);

        soundIcon.addEventListener("click",function(){
            if (!gameData.user.muted){
                gameData.setMuted(true);
                soundIcon.className = "active";
            }else{
                gameData.setMuted(false);
                soundIcon.className = null;
            }
        });

        fullScreenIcon.addEventListener("click",function(){
            if (!document.isFullScreen()){
                document.documentElement.requestFullScreen();
            }else{
                document.exitFullScreen();
            }
        });

        return ModalsView;
    }
);

