define(['createjs','views/background','views/overlay', 'views/planet','views/usership','views/enemyship','views/missile','views/explosion','models/constants','models/manifest'],
function(createjs, Background, Overlay, Planet, UserShip, EnemyShip, Missile, Explosion, Constants, manifest){
    'use strict';

    var PADDING = 15;
    var MAX_DISTANCE = Math.getDistance(Constants.Zone.width*1.5, Constants.Zone.height*1.5);

    var stage, background, overlay, userShip, sprites,  updateTimeout, scrollDirection, viewIcon, gameEnding;

    var GameView = {

        isRunning : false,

        //Set up Game View
        initialize : function(){

            createjs.Sound.alternateExtensions = ["mp3"];

            window.getRelativeVolume = function(model){

                var centerX = (gameData.width/2) - gameData.offsetX + window.paddingX;
                var centerY = (gameData.height/2) - gameData.offsetY + window.paddingY;

                var data = model.zoneAdjustedPosition(gameData.zone);
                var distance = Math.getDistance(data.posX , data.posY, centerX, centerY);

                return Math.max(1-(distance/MAX_DISTANCE), 0);
            };

            window.setRelativeVolume = function(sound, model){
                sound.setVolume(getRelativeVolume(model));
            };

            window.playRelativeSound = function(sound, model){
                if (typeof sound === 'string'){
                    createjs.Sound.play(sound, {volume:getRelativeVolume(model)});
                }else{
                    sound.play({volume:getRelativeVolume(model)});
                }
            };

            window.preloader = new createjs.LoadQueue(false, Constants.ASSETS_URL);
            preloader.installPlugin(createjs.Sound);

            var progressBar = document.getElementById("progress-bar");
            preloader.addEventListener("progress", function(evt){
                progressBar.style.width = (evt.loaded*100)+"%";
            })

            preloader.addEventListener("complete", function(){
               preloader.removeAllEventListeners();
               gameData.trigger(Constants.Events.DEPLOY);
            });

            preloader.loadManifest(manifest);

            viewIcon = document.getElementById("view");

        },

        run : function(){
            if (GameView.isRunning) return;

            createjs.Sound.setVolume(1);
            createjs.Sound.setMute(gameData.user.muted);
            gameData.on(Constants.Events.USER_CHANGED, function(){
                createjs.Sound.setMute(gameData.user.muted);
            });

            stage = new createjs.Stage("game");
            stage.enableDOMEvents(false);
            stage.mouseChildren = false;

            background = new Background();
            stage.addChild(background);

            userShip = new UserShip(gameData.userPlayer);
            stage.addChild(userShip);

            overlay = new Overlay();
            overlay.x = overlay.y = PADDING;
            stage.addChild(overlay);

            setStageSize();
            window.onresize = setStageSize;

            sprites = {};

            var i= gameData.planets.length;
            while (i--) addSprite(gameData.planets.models[i]);
            gameData.planets.on("add", addSprite);
            gameData.planets.on("remove", removeSprite);

            i= gameData.missiles.length;
            while (i--) addSprite(gameData.missiles.models[i]);
            gameData.missiles.on("add", addSprite);
            gameData.missiles.on("remove", removeSprite);

            i= gameData.players.length;
            while (i--) addSprite(gameData.players.models[i]);
            gameData.players.on("add", addSprite);
            gameData.players.on("remove", removeSprite);

            background.cache();

            createjs.Ticker.setFPS(Constants.FPS);
            createjs.Ticker.addEventListener("tick", onTick);

            gameData.on(Constants.Events.COLLISION, onCollision);
            gameData.on(Constants.Events.ZONE_CHANGED, onZoneChange);

            updateTimeout = setTimeout(triggerUpdate, Constants.CLIENT_UPDATE_INTERVAL);

            stage.enableDOMEvents(true);
            stage.on('stagemousedown', onMouseDown);
            stage.on('stagemouseup', onMouseUp);
            stage.on('stagemousemove', onMouseMove);

            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);

            scrollDirection = "";
            stage.canvas.style.cursor = "crosshair";

            GameView.isRunning = true;
            gameData.trigger(Constants.Events.GAME_START);

            viewIcon.className = gameData.cameraLocked ? "active" : null;
            viewIcon.addEventListener("click", toggleCameraMode);
            viewIcon.show();

            /*setInterval(function(){
                console.log(createjs.Ticker.getMeasuredFPS());
            }, 1000); */
        },

        end : function(){
            clearTimeout(updateTimeout);

            stage.off('stagemousedown', onMouseDown);
            stage.off('stagemouseup', onMouseUp);
            stage.off('stagemousemove', onMouseMove);

            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            scrollDirection = "";

            gameEnding = true;
        },

        reset : function(){
            if (!GameView.isRunning) return;

            sprites = undefined;
            userShip = undefined;
            overlay = undefined;

            clearTimeout(updateTimeout);
            createjs.Ticker.removeEventListener("tick", onTick);
            createjs.Sound.stop();

            gameData.off(Constants.Events.ZONE_CHANGED, onZoneChange);
            gameData.off(Constants.Events.COLLISION, onCollision);

            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            window.onresize = undefined;

            scrollDirection = "";

            stage.off('stagemousedown', onMouseDown);
            stage.off('stagemouseup', onMouseUp);
            stage.off('stagemousemove', onMouseMove);
            stage.enableDOMEvents(false);
            stage.canvas.style.cursor = "auto";

            setTimeout(function(){
                stage.removeAllChildren();
                stage.clear();
                background = undefined;
                stage = undefined;
            }, 100);

            gameEnding = false;
            GameView.isRunning = false;

            viewIcon.hide();
            viewIcon.removeEventListener("click", toggleCameraMode);
        }
    };

    function addSprite(model){

        var sprite;

        switch (model.type){
            case "Planet":
                sprite = sprites[model.toString()] = new Planet(model);
                background.addChild(sprite);
                break;

            case "Player":
                if (model.id === gameData.userPlayer.id) return null;
                sprite = sprites[model.toString()] = new EnemyShip(model);
                stage.addChildAt(sprite, 1);
                overlay.radar.addMark(model);
                break;

            case "Missile":
                sprite = sprites[model.toString()] = new Missile(model);
                stage.addChildAt(sprite, 1);
                if (gameData.players.get(model.get("playerId"))){
                    playRelativeSound('shotSound',model);
                }
                break;
        }

        return sprite;
    }

    function removeSprite(model){
        var sprite = model.equals(userShip.model) ? userShip : sprites[model.toString()];
        if (!sprite) return null;

        switch (model.type){
            case "Planet":
                background.removeChild(sprite);
                break;
            case "Player":
                stage.removeChild(sprite);
                overlay.radar.removeMark(model);
                break;
            case "Missile":
                stage.removeChild(sprite);
                break;
        }

        sprite.destroy();
        delete sprites[model.toString()];

        return sprite;
    }


    //Game Loop
    function onTick(evt){

        if (gameEnding){
            var change = 0.25 * (evt.delta/1000);

            stage.alpha -= change;
            background.alpha -= change;
            createjs.Sound.setVolume(createjs.Sound.getVolume()-change);
            stage.update(evt);

            if (stage.alpha <= change && GameView.isRunning){
                gameData.trigger(Constants.Events.GAME_END);
            }

            return;
        }




        if (userShip.x < PADDING || userShip.y < PADDING || userShip.x >= window.innerWidth-PADDING || userShip.y >= window.innerHeight-PADDING){
            scrollDirection = "center";
        }

        if (gameData.cameraLocked && scrollDirection !== "center"){
            var userData = gameData.userPlayer.update().data;
            gameData.offsetX = userShip.x - userData.posX;
            gameData.offsetY = userShip.y - userData.posY;
        }
        else if (scrollDirection){
           scroll(evt);
        }

        stage.update(evt);

    }

    function scroll(evt){

        var userData = gameData.userPlayer.update().data;
        var padding = PADDING*2;
        var scrollSpeed = Constants.SCROLL_SPEED * (evt.delta/1000);
        var scrollX = 0
        var scrollY = 0;

        //Different scoll speed for topleft,topright,bottomleft,bottomright
        if (scrollDirection.length > 6){
            scrollSpeed = Math.sqrt((scrollSpeed*scrollSpeed)/2);
        }

        if (scrollDirection == "center"){
            var centerX = window.paddingX + (gameData.width/2 - userData.posX);
            var centerY = window.paddingY + (gameData.height/2 - userData.posY);
            var distance = Math.getDistance(gameData.offsetX, gameData.offsetY, centerX, centerY);

            if(distance > scrollSpeed){
                var angle = Math.atan2((centerY-gameData.offsetY), (centerX-gameData.offsetX));
                scrollX = Math.cos(angle) * scrollSpeed;
                scrollY = Math.sin(angle) * scrollSpeed;
            }else{
                scrollX = centerX - gameData.offsetX;
                scrollY = centerY - gameData.offsetY;
                scrollDirection = "";
            }
        }
        else{
            if (scrollDirection.indexOf("left") >= 0){
                scrollX = scrollSpeed;

                if (userShip.x+scrollX >= window.innerWidth-padding || gameData.offsetX+scrollX >= gameData.width){
                    scrollX = 0;
                    scrollDirection = "";
                }
            }
            else if (scrollDirection.indexOf("right") >= 0){
                scrollX = -scrollSpeed;

                if (userShip.x+scrollX < padding || gameData.offsetX+scrollX < -gameData.width + (2*window.paddingX)){
                    scrollX = 0;
                    scrollDirection = "";
                }
            }

            if (scrollDirection.indexOf("top") >= 0){
                scrollY = scrollSpeed;

                if (userShip.y+scrollY >= window.innerHeight-padding ||  gameData.offsetY+scrollY >= gameData.height){
                    scrollY = 0;
                    scrollDirection = "";
                }
            }
            else if (scrollDirection.indexOf("bottom") >= 0){
                scrollY = -scrollSpeed

                if (userShip.y+scrollY < padding ||  gameData.offsetY+scrollY < 0 -gameData.height+(2*window.paddingY)){
                    scrollY = 0;
                    scrollDirection = "";
                }
            }
        }

        gameData.offsetX += scrollX;
        gameData.offsetY += scrollY;


    }

    function onZoneChange(data){

        var worldSize = Constants.WORLD_SIZE;

        var colDiff = (data.newZone%worldSize) - (data.oldZone%worldSize);
        if (Math.abs(colDiff) > worldSize/2){
            colDiff = colDiff > 0 ? colDiff-worldSize : colDiff+worldSize;
        }

        var rowDiff = Math.floor(data.newZone/worldSize) - Math.floor(data.oldZone/worldSize);
        if (Math.abs(rowDiff) > worldSize/2){
            rowDiff = rowDiff > 0 ? rowDiff-worldSize : rowDiff+worldSize;
        }

        gameData.offsetX += (gameData.width*colDiff);
        gameData.offsetY += (gameData.height*rowDiff);

        background.cache();

    }

    function onCollision(data){

        var model1 = data[0] ? gameData.get(data[0]) : null;
        var model2 = data[1] ? gameData.get(data[1]) : null;

        if (!model1 && !model2) return;

        if (model1 && !data[0].isAlive){
            gameData.remove(model1.set('isAlive', false));
        }

        if (model2 && !data[1].isAlive){
            gameData.remove(model2.set('isAlive', false));
        }

        model1 = model1 || model2;
        model2 = model2 || model1;

        if ((!model1.isAlive() && !model2.isAlive()) || (!model1.isAlive() && model1.is("Player")) || (!model2.isAlive() && model2.is("Player"))){

            var model, explosion;

            if (model1.height > model2.height){
                model = model1;
            }
            else if (model2.height > model1.height){
                model = model2;
            }
            else{
                model = model1;
                model.set(model1.averagePosition(model2));
            }

            explosion = new Explosion(model);
            explosion.addEventListener("animationend", function(){
                explosion.removeEventListener("animationend");
                stage.removeChild(explosion);
            });

            stage.addChild(explosion);
        }
        else if (model1.is("Player") && !model1.isShieldBroken()){
            playRelativeSound("collideSound", model1);
        }
        else if (model2.is("Player") && !model2.isShieldBroken()){
            playRelativeSound("collideSound", model1);
        }
    }

    //Canvas Event Listeners
    function onMouseDown(evt){
        if (!userShip.model) return;

        var which = evt.nativeEvent.which;
        if (which == 1 && userShip.model.canAccelerate()){
            userShip.isAccelerating = true;
            triggerUpdate();
        }
        else if (which == 2 && userShip.model.canFire()){
            userShip.isFiring = true;
            triggerUpdate();
        }
        else if (which == 3 && userShip.model.canShield()){
            userShip.isShielded = true;
            triggerUpdate();
        }
    }

    function onMouseUp(evt){
        if (!userShip.model) return;

        var which = evt.nativeEvent.which;
        if (which == 1){
            userShip.isAccelerating= false;
        }
        else if (which == 2){
            userShip.isFiring = false;
        }
        else if (which == 3){
            userShip.isShielded = false;
        }
    }

    function onMouseMove(evt){
        if (!userShip.model) return;

        if (!stage.mouseInBounds){
            userShip.isAccelerating = false;
            userShip.isShielded = false;
            userShip.isFiring = false;
            return;
         }

        var deltaX = (evt.stageX - userShip.x);
        var deltaY = (evt.stageY - userShip.y);
        var radius = userShip.model.getRadius();
        var padding = PADDING*3;

        if (Math.abs(deltaX) > radius || Math.abs(deltaY) > radius){
            userShip.angle = Math.atan2(deltaY, deltaX);
        }

        if (!gameData.cameraLocked && scrollDirection !== "center"){
            if (evt.stageY < padding){
                if (evt.stageX < padding){
                    scrollDirection = "topleft"
                    stage.canvas.style.cursor = "nw-resize";
                }else if (evt.stageX > window.innerWidth-padding){
                    scrollDirection = "topright";
                    stage.canvas.cursor = "ne-resize";
                }else{
                    scrollDirection = "top";
                    stage.canvas.style.cursor = "n-resize";
                }
            }
            else if (evt.stageY >= window.innerHeight-padding){
                if (evt.stageX < padding){
                    scrollDirection = "bottomleft"
                    stage.canvas.style.cursor = "sw-resize";
                }else if (evt.stageX > window.innerWidth-padding){
                    scrollDirection = "bottomright"
                    stage.canvas.style.cursor = "se-resize";
                }else{
                    scrollDirection = "bottom"
                    stage.canvas.style.cursor = "s-resize";
                }
            }
            else if (evt.stageX < padding){
                scrollDirection = "left"
                stage.canvas.style.cursor = "w-resize";
            }
            else if (evt.stageX > window.innerWidth-padding){
                scrollDirection = "right"
                stage.canvas.style.cursor = "e-resize";
            }
            else{
                scrollDirection = "";
            }
        }

        if (!scrollDirection){
            for (var i=1; i < stage.children.length-1; i++){
                var sprite = stage.getChildAt(i);
                if (EnemyShip.prototype.isPrototypeOf(sprite) &&
                  Math.abs(evt.stageX - sprite.x) <= sprite._bounds.width &&
                  Math.abs(evt.stageY - sprite.y) <= sprite._bounds.height){
                    overlay.user.render(sprite.model);
                    stage.canvas.style.cursor = "help";
                    break;
                }
            }
            if (i >= stage.children.length-1){
                overlay.user.render();
                stage.canvas.style.cursor = "crosshair";
            }
        }

    }

    function onKeyDown(evt){

        switch (evt.keyCode){
            case 32:
                userShip.isFiring = true;
                triggerUpdate();
                break;

            case 67:
                scrollDirection = "center";
                break;

            case 16:
                userShip.isShielded = true;
                triggerUpdate();
                break;

            case 82:
                userShip.isReloading = true;
                triggerUpdate();
                userShip.isReloading = false;
                break;

            case 37:
            case 65:
                if (userShip.rotateDirection) break;
                userShip.rotateDirection = "left";
                break;

            case 38:
            case 87:
                userShip.isAccelerating = true;
                triggerUpdate();
                break;

            case 39:
            case 68:
                if (userShip.rotateDirection) break;
                userShip.rotateDirection = "right";
                break;

            case 90:
                toggleCameraMode();
                break;
        }

    }

    function onKeyUp(evt){

        switch (evt.keyCode){
            case 32:
                userShip.isFiring = false;
                break;

            case 16:
                userShip.isShielded = false;
                break;

            case 87:
            case 38:
                userShip.isAccelerating = false;
                console.log('false 1');
                break;

            case 37:
            case 65:
                if (userShip.rotateDirection == "right") break;
                userShip.rotateDirection = null;
                break;

            case 39:
            case 68:
                if (userShip.rotateDirection == "left") break;
                userShip.rotateDirection = null;
                break;
        }
    }

    function triggerUpdate(){
        if (userShip.model && !document.isHidden() ){

            gameData.trigger(Constants.Events.PLAYER_UPDATE, {
                angle:userShip.angle,
                isAccelerating:userShip.isAccelerating,
                isShielded:userShip.isShielded,
                isFiring:userShip.isFiring,
                isReloading:userShip.isReloading
            });

        }

        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(triggerUpdate, Constants.CLIENT_UPDATE_INTERVAL+gameData.latency);
    }

    function setStageSize(){
        var width = window.innerWidth;
        var height = window.innerHeight;
        var userData = gameData.userPlayer.data;

        window.paddingX = (width-gameData.width)/2;
        window.paddingY = (height-gameData.height)/2;

        stage.canvas.width = background.width = width;
        stage.canvas.height = background.height = height;

        overlay.setBounds(0, 0, width-(PADDING*2), height-(PADDING*2));


        gameData.offsetX = window.paddingX + (gameData.width/2 - userData.posX);
        gameData.offsetY = window.paddingY + (gameData.height/2 - userData.posY);
    }

    function toggleCameraMode(){
        gameData.cameraLocked = !gameData.cameraLocked;
        viewIcon.className = gameData.cameraLocked ? "active" : null;
    }


    return GameView;
});