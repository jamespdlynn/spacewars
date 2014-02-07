define(['model/constants', 'model/game', 'txt!tpl/welcome.html', 'txt!tpl/connection-failed.html', 'txt!tpl/disconnected.html', 'txt!tpl/death.html'],
    function (Constants, gameData, welcomeTpl, connectionFailedTpl, disconnectedTpl, deathTpl){

        var modal = document.getElementById("modal");
        var connecting = document.getElementById("connecting");
        var soundIcon = document.getElementById("sound");
        var fullScreenIcon = document.getElementById("full-screen");

        if (gameData.user.muted){
            soundIcon.className = "active";
        }

        soundIcon.addEventListener("click",function(){
            if (!gameData.user.muted){
                gameData.setMuted(true);
                soundIcon.className = "active";
            }else{
                gameData.setMuted(false);;
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

        var ModalsView = {

             setConnecting : function(value){
                 value ? connecting.show() : connecting.hide();
                 return ModalsView;
             },

             showWelcome : function(){
                 modal.innerHTML = welcomeTpl;
                 modal.show();

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

             showConnectionFailed : function(){
                 modal.innerHTML = connectionFailedTpl;
                 modal.show();

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDisconnected : function(){
                 modal.innerHTML = disconnectedTpl;
                 modal.show();

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             showDeath : function(){

                 modal.innerHTML = deathTpl;
                 modal.show();

                 document.getElementById("total-kills").innerHTML = gameData.user.kills;
                 document.getElementById("total-deaths").innerHTML = gameData.user.deaths;

                 if (gameData.roundKills > 0){
                     document.getElementById("round-kills").innerHTML = "+"+gameData.roundKills;
                 }

                 document.getElementById("round-deaths").innerHTML = "+1";

                 document.onkeydown = onSubmit;
                 document.getElementById("deploy-button").addEventListener("click", onSubmit);

                 return ModalsView;
             },

             removeWindow : function(){
                 modal.hide();
                 modal.innerHTML = "";

                 return ModalsView;
             }
        };

        function onSubmit(evt){
            if (evt.type == "click" || evt.which == 13){
                gameData.trigger(Constants.Events.DEPLOY);
            }
        }

        return ModalsView;
    }
);

