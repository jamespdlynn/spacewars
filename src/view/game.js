define(['createjs','view/background','view/overlay', 'view/planet','view/usership','view/enemyship','view/missile','view/explosion','model/constants','model/game','model/manifest'],
function(createjs, Background, Overlay, Planet, UserShip, EnemyShip, Missile, Explosion, Constants, gameData, manifest){
    'use strict';

    var PADDING = 15;

    var initialized, autorun, gameEnding, updateTimeout, scrollDirection;
    var background, stage, overlay, userShip, sprites;

    var GameView = {

        isRunning : false,

        //Set up Game View
        initialize : function(){

            initialized = false;

            window.preloader = new createjs.LoadQueue(false, Constants.ASSETS_URL);
            preloader.addEventListener("complete", function(){
                initialized = true;
                if (autorun) GameView.run();
            });

            createjs.Sound.alternateExtensions = ["mp3"];

            preloader.installPlugin(createjs.Sound);
            preloader.loadManifest(manifest);

            window.getRelativeVolume = function(model){
                var distance = gameData.userPlayer.getDistance(model);
                return Math.max(1-(distance/(Math.max(window.innerWidth,window.innerHeight))), 0);
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
        },

        run : function(){
            if (GameView.isRunning) return;

            if (!initialized){
                autorun = true;
                return;
            }

            createjs.Sound.setVolume(1);
            createjs.Sound.setMute(gameData.user.muted);
            gameData.on(Constants.Events.USER_CHANGED, function(){
                createjs.Sound.setMute(gameData.user.muted);
            });

            background = new Background("background");

            stage = new createjs.Stage("game");
            stage.enableDOMEvents(false);
            stage.mouseChildren = false;

            sprites = {};

            userShip = new UserShip(gameData.userPlayer);
            stage.addChild(userShip);

            overlay = new Overlay();
            stage.addChild(overlay);

            setStageSize();
            window.onresize = setStageSize;

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
            gameData.on(Constants.Events.GAME_ENDING, function(){
                gameEnding = true;
            });

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

            /*setInterval(function(){
                console.log(createjs.Ticker.getMeasuredFPS());
            }, 1000); */
        },

        reset : function(){
            if (!GameView.isRunning) return;

            sprites = undefined;
            userShip = undefined;
            overlay = undefined;

            clearTimeout(updateTimeout);
            createjs.Ticker.removeEventListener("tick", onTick);
            createjs.Sound.stop();

            gameData.off(Constants.Events.ZONE_CHANGED);
            gameData.off(Constants.Events.COLLISION);
            gameData.off(Constants.Events.USER_CHANGED);
            gameData.off(Constants.Events.GAME_ENDING);

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
                background.removeAllChildren();
                background.clear();
                background = undefined;

                stage.removeAllChildren();
                stage.clear();
                stage = undefined;
            }, 100);

            autorun = false;
            gameEnding = false;
            GameView.isRunning = false;


        }
    };

    function addSprite(model){

        if (model.equals(gameData.userPlayer)) return null;

        var sprite;

        switch (model.type){
            case "Planet":
                sprite = sprites[model.toString()] = new Planet(model);
                background.addChild(sprite);
                break;

            case "Player":
                sprite = sprites[model.toString()] = new EnemyShip(model);
                stage.addChildAt(sprite, 0);
                overlay.radar.addMark(model);
                break;

            case "Missile":
                sprite = sprites[model.toString()] = new Missile(model);
                stage.addChildAt(sprite, 0);
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
            var change = 0.3 * (evt.delta/1000);

            stage.alpha -= change;
            background.alpha -= change;
            createjs.Sound.setVolume(createjs.Sound.getVolume()-change);

            background.update(evt);
            stage.update(evt);

            if (stage.alpha <= change && GameView.isRunning){
                gameData.trigger(Constants.Events.GAME_END);
            }

            return;
        }

        if (!stage.mouseInBounds){
            userShip.isAccelerating = false;
            userShip.isShielded = false;
            userShip.isFiring = false;
        }

        if (gameData.user.cameraMode === "auto" || userShip.x < PADDING || userShip.y < PADDING || userShip.x >= window.innerWidth-PADDING || userShip.y >= window.innerHeight-PADDING){
            scrollDirection = "center";
        }

        if (scrollDirection){
            scroll(evt);
            background.update(evt);
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

        if (gameData.user.cameraMode === 'auto'){
            gameData.offsetX = window.paddingX + (gameData.width/2 - gameData.userPlayer.get("posX"));
            gameData.offsetY = window.paddingY + (gameData.height/2 - gameData.userPlayer.get("posY"));
        }
        else{
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
        }

        background.cache();

    }

    function onCollision(data){

        var survived1 = data.sprite1 && data.sprite1.survived;
        var survived2 = data.sprite2 && data.sprite2.survived;

        var model1 = survived1 ? gameData.get(data.sprite1) : gameData.remove(data.sprite1);
        var model2 = survived2 ? gameData.get(data.sprite2) : gameData.remove(data.sprite2);

        if (!model1){
            if (!model2) return;
            model1 = model2;
        }

        if ((!survived1 && !survived2) || (!survived1 && model1.type==="Player") || (!survived2 && model2 && model2.type==="Player"))
        {
            var model, explosion, slayer;

            if (!model2 || model1.height > model2.height){
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
        else if ((model1.type !== "Player" || !model1.isShieldBroken()) && model2 && (model2.type !== "Player" || !model2.isShieldBroken())){
            playRelativeSound("collideSound", model);
        }
    }


    //Canvas Event Listeners
    function onMouseDown(evt){
        if (!userShip.model) return;

        var which = evt.nativeEvent.which;
        if (which == 1 && userShip.model.canAccelerate()){
            userShip.isAccelerating = true;
            triggerUpdate();
        }else if (which == 3 && userShip.model.canShield()){
            userShip.isShielded = true;
            triggerUpdate();
        }
    }

    function onMouseUp(evt){
        if (!userShip.model) return;

        var which = evt.nativeEvent.which;
        if (which == 1){
            userShip.isAccelerating= false;
        }else if (which == 3){
            userShip.isShielded = false;
        }
    }

    function onMouseMove(evt){
        if (!userShip.model) return;

        var deltaX = (evt.stageX - userShip.x);
        var deltaY = (evt.stageY - userShip.y);
        var radius = userShip.model.getRadius();
        var padding = PADDING*3;

        if (Math.abs(deltaX) > radius || Math.abs(deltaY) > radius){
            userShip.angle = Math.atan2(deltaY, deltaX);
        }

        if (gameData.user.cameraMode !== "auto" && scrollDirection !== "center"){
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
                stage.canvas.style.cursor = "crosshair";
            }
        }


    }

    function onKeyDown(evt){
        if (!userShip.model) return;

        if (evt.keyCode == 32){
            userShip.isFiring = true;
            triggerUpdate();
        }
        else if (evt.keyCode == 82 && userShip.model.canReload()){
            userShip.isReloading = true;
            triggerUpdate();
            userShip.isReloading = false;
        }
    }

    function onKeyUp(evt){
        if (userShip.model && evt.keyCode == 32){
            userShip.isFiring = false;
        }
    }

    function triggerUpdate(){
        if (userShip.model&& !document.isHidden()){

            if (userShip.isAccelerating && !userShip.model.canAccelerate()) userShip.isAccelerating = false;
            if (userShip.isShielded && !userShip.model.canShield()) userShip.isShielded = false;

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

        stage.canvas.width = background.canvas.width = width;
        stage.canvas.height = background.canvas.height = height;

        gameData.offsetX = window.paddingX + (gameData.width/2 - userData.posX);
        gameData.offsetY = window.paddingY + (gameData.height/2 - userData.posY);

        overlay.x = PADDING;
        overlay.y = PADDING;
        overlay.setBounds(0, 0, width-(PADDING*2), height-(PADDING*2));

        background.update();
    }


    return GameView;
});