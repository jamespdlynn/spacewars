define(['model/constants', 'model/game', 'txt!tpl/welcome.html', 'txt!tpl/connection-failed.html', 'txt!tpl/disconnected.html', 'txt!tpl/death.html', 'txt!tpl/about.html'],
    function (Constants, gameData, welcomeTpl, connectionFailedTpl, disconnectedTpl, deathTpl, aboutTpl){

        var body = document.getElementsByTagName("body")[0];

        var connecting = document.getElementById("connecting");

        var aboutIcon = document.getElementById("about");

        var soundIcon = document.getElementById("sound");
        if (gameData.user.muted) soundIcon.className = "active";

        var fullScreenIcon = document.getElementById("full-screen");

        var ModalsView = {

             setConnecting : function(value){
                 value ? connecting.show() : connecting.hide();
                 return ModalsView;
             },

             showWelcomeModal : function(){

                 this.removeModals();

                 body.innerHTML += welcomeTpl;

                 var usernameInput = document.getElementById("username-input");
                 usernameInput.focus();

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

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showConnectionFailedModal : function(){

                 this.removeModals();

                 body.innerHTML += connectionFailedTpl;

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDisconnectedModal : function(){

                 this.removeModals();

                 body.innerHTML += disconnectedTpl;

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDeathModal : function(){

                 this.removeModals();

                 body.innerHTML += deathTpl;

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
                 if (aboutIcon.className !== "active"){
                     body.innerHTML += aboutTpl;
                     aboutIcon.className = "active";

                     document.getElementById("close-button").addEventListener("click", function(){
                         body.removeChild(document.getElementById("about-modal"));
                         aboutIcon.className = null;
                     });
                 }
             },

             removeModals : function(){

                 var modals = document.getElementsByClassName('.modal');
                 for (var i=0; i < modals.length; i++){
                     body.removeChild(modals[i]);
                 }

                 if (document.onkeydown == onSubmit){
                     document.onkeydown = null;
                 }

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

