define(['createjs','view/overlay', 'view/planet','view/usership','view/enemyship','view/missile','view/explosion','model/constants','model/game','model/manifest'],
function(createjs, Overlay, Planet, UserShip, EnemyShip, Missile, Explosion, Constants, gameData, manifest){
    'use strict';

    var PADDING = 15;

    var initialized, autorun, gameEnding, updateTimeout, scrollSpeed, diagnolScrollSpeed, scrollX, scrollY, isCentering;
    var background, backgroundImage, canvas, stage, overlay, userShip, sprites;

    var GameView = {

        isRunning : false,

        //Set up Game View
        initialize : function(){

                initialized = false;

                background = new createjs.Stage("background");
                background.enableDOMEvents(false);
                background.mouseChildren = false;

                stage = new createjs.Stage("game");
                stage.enableDOMEvents(false);
                stage.mouseChildren = false;

                canvas = document.getElementById("game");

                window.preloader = new createjs.LoadQueue(false, Constants.ASSETS_URL);
                preloader.addEventListener("complete", function(){
                    initialized = true;
                    if (autorun) GameView.run();
                });

                createjs.Sound.alternateExtensions = ["mp3"];

                preloader.installPlugin(createjs.Sound);
                preloader.loadManifest(manifest);

                window.getRelativeVolume = function(sprite){
                    return userShip && userShip.model ? Math.max(1-(userShip.model.getDistance(sprite)/gameData.width), 0) : 0;
                };

                window.playRelativeSound = function(sound, sprite){
                    if (typeof sound === 'string'){
                        createjs.Sound.play(sound, {volume:getRelativeVolume(sprite)});
                    }else{
                        sound.play({volume:getRelativeVolume(sprite)});
                    }
                };

                window.setRelativeVolume = function(sound, sprite){
                    sound.setVolume(getRelativeVolume(sprite));
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

            background.alpha = 1;
            stage.alpha = 1;

            stage.removeAllChildren();
            background.removeAllChildren();
            sprites = {};

            backgroundImage = new createjs.Shape();
            backgroundImage.graphics.beginBitmapFill(preloader.getResult('background')).drawRect(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            backgroundImage.cache(-gameData.width, -gameData.height, 3*gameData.width, 3*gameData.height);
            background.addChild(backgroundImage);

            userShip = new UserShip(gameData.userPlayer);
            stage.addChild(userShip);

            overlay = new Overlay();
            stage.addChild(overlay);

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

            setStageSize();
            window.onresize = setStageSize;

            createjs.Ticker.setFPS(Constants.FPS);
            createjs.Ticker.addEventListener("tick", onTick);

            gameData.on(Constants.Events.COLLISION, onCollision);
            gameData.on(Constants.Events.ZONE_CHANGED, onZoneChange);

            updateTimeout = setTimeout(triggerUpdate, Constants.CLIENT_UPDATE_INTERVAL);

            stage.enableDOMEvents(true);
            stage.on('stagemousedown', onMouseDown);
            stage.on('stagemouseup', onMouseUp);
            stage.on('stagemousemove', onMouseMove);

            document.onkeydown = onKeyDown;
            document.onkeyup = onKeyUp;

            GameView.isRunning = true;
            gameData.trigger(Constants.Events.GAME_START);

            scrollSpeed = Constants.SCROLL_SPEED/Constants.FPS;
            diagnolScrollSpeed = Math.sqrt((scrollSpeed*scrollSpeed)/2);
            scrollX = 0;
            scrollY = 0;
            isCentering = false;

            game.style.cursor = "crosshair";
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

            document.onkeydown = undefined;
            document.onkeyup = undefined;
            window.onresize = undefined;

            stage.off('stagemousedown', onMouseDown);
            stage.off('stagemouseup', onMouseUp);
            stage.off('stagemousemove', onMouseMove);
            stage.enableDOMEvents(false);

            setTimeout(function(){
                background.removeAllChildren();
                stage.removeAllChildren();
                background.clear();
                stage.clear();
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

        var updateBackground = false;
        var userData = gameData.userPlayer.data;
        var radius = gameData.userPlayer.getRadius();

        //If user is off screen, then center
        if (!isCentering && (userShip.x+radius < 0 || userShip.x-radius > window.innerWidth || userShip.y+radius < 0 || userShip.y-radius > window.innerHeight)){
            isCentering = true;
        }

        if (isCentering){
            var centerX = window.paddingX + (gameData.width/2 - userData.posX);
            var centerY = window.paddingY + (gameData.height/2 - userData.posY);
            var distance = Math.getDistance(gameData.offsetX, gameData.offsetY, centerX, centerY);

            if (distance > scrollSpeed){
                var angle = Math.atan2((centerY-gameData.offsetY), (centerX-gameData.offsetX));
                scrollX = Math.cos(angle) * scrollSpeed;
                scrollY = Math.sin(angle) * scrollSpeed;
            }else{
                gameData.offsetX = centerX;
                gameData.offsetY = centerY;
                scrollX = scrollY = 0;
                isCentering = false;
            }
        }

        if ((scrollX > 0 && userShip.x+scrollX < window.innerWidth && gameData.offsetX+scrollX < gameData.width) ||
            (scrollX < 0 && userShip.x+scrollX >= 0 && gameData.offsetX+scrollX >= -gameData.width + (2*window.paddingX)))
        {
            gameData.offsetX += scrollX;
            updateBackground = true;
        }else{
            scrollX = 0;
        }

        if ((scrollY > 0 && userShip.y+scrollY < window.innerHeight  && gameData.offsetY+scrollY < gameData.height) ||
            (scrollY < 0 && userShip.y+scrollY >= 0 && gameData.offsetY+scrollY >= -gameData.height + (2*window.paddingY)))
        {
            gameData.offsetY += scrollY;
            updateBackground = true;
        }else{
            scrollY = 0;
        }


        if (!stage.mouseInBounds){
            userShip.isAccelerating = false;
            userShip.isShielded = false;
            userShip.isFiring = false;
        }

        if (gameEnding){

            var change = 0.3/Constants.FPS;

            stage.alpha -= change;
            background.alpha -= change;
            createjs.Sound.setVolume(createjs.Sound.getVolume()-change);
            updateBackground = true;

            if (stage.alpha < change && GameView.isRunning){
                gameData.trigger(Constants.Events.GAME_END);
            }
        }

        if (updateBackground){
            backgroundImage.x = gameData.offsetX;
            backgroundImage.y = gameData.offsetY;
            background.update(evt);
        }

        stage.update(evt);
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


    }

    function onCollision(data){

        var survived1 = data.sprite1 && data.sprite1.survived;
        var survived2 = data.sprite2 && data.sprite2.survived;

        var model1 = survived1 ? gameData.get(data.sprite1) : gameData.remove(data.sprite1);
        var model2 = survived2 ? gameData.get(data.sprite1) : gameData.remove(data.sprite2);

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

            stage.addChildAt(explosion);
            playRelativeSound('explosionSound', model);

            explosion.addEventListener("animationend", function(){
                explosion.removeEventListener("animationend");
                stage.removeChild(explosion);
            });

            slayer = null;
            if (!survived1 && model1.type === 'Player'){
                if (gameData.userPlayer.equals(model1)){
                    if (model2) slayer = (model2.type === 'Player') ? gameData.players.get(model2.id) : gameData.players.get(model2.get("playerId"));
                    endGame(slayer);
                }
                else if (model2 && (gameData.userPlayer.equals(model2) || model2.get("playerId") === userShip.model.id)){
                    gameData.incrementKills();
                }
            }

            if (!survived2 && model2 && model2.type === 'Player'){
                if (gameData.userPlayer.equals(model2)){
                     slayer = (model1.type === 'Player') ? gameData.players.get(model1.id) : gameData.players.get(model1.get("playerId"));
                    endGame(slayer);
                }
                else if (gameData.userPlayer.equals(model1) || model1.get("playerId") === gameData.userPlayer.id){
                    gameData.incrementKills();
                }
            }
        }
        else if (!model1.get("isShieldBroken") && model2 && !model2.get("isShieldBroken")){
            playRelativeSound("collideSound", model);
        }

    }

    function endGame(slayer){
        gameData.slayer = slayer ? slayer.get("username") : "";
        gameData.incrementDeaths();
        gameEnding = true;
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

        if (Math.abs(deltaX) > radius || Math.abs(deltaY) > radius){
            userShip.angle = Math.atan2(deltaY, deltaX);
        }

        if (isCentering){
            game.style.cursor = "crosshair";
        }
        else if (evt.stageY < PADDING){
            if (evt.stageX < PADDING){
                scrollX = diagnolScrollSpeed;
                scrollY = diagnolScrollSpeed;
                canvas.style.cursor = "nw-resize";
            }else if (evt.stageX > window.innerWidth-PADDING){
                scrollX = -diagnolScrollSpeed;
                scrollY = diagnolScrollSpeed;
                canvas.style.cursor = "ne-resize";
            }else{
                scrollX = 0;
                scrollY = scrollSpeed;
                canvas.style.cursor = "n-resize";
            }
        }
        else if (evt.stageY >= window.innerHeight-PADDING){
            if (evt.stageX < PADDING){
                scrollX = diagnolScrollSpeed;
                scrollY = -diagnolScrollSpeed;
                canvas.style.cursor = "sw-resize";
            }else if (evt.stageX > window.innerWidth-PADDING){
                scrollX = -diagnolScrollSpeed;
                scrollY = -diagnolScrollSpeed;
                canvas.style.cursor = "se-resize";
            }else{
                scrollX = 0;
                scrollY = -scrollSpeed;
                canvas.style.cursor = "s-resize";
            }
        }
        else if (evt.stageX < PADDING){
            scrollX = scrollSpeed;
            scrollY = 0;
            canvas.style.cursor = "w-resize";
        }
        else if (evt.stageX > window.innerWidth-PADDING){
            scrollX = -scrollSpeed;
            scrollY = 0;
            canvas.style.cursor = "e-resize";
        }
        else{
            scrollX = 0;
            scrollY = 0;
            game.style.cursor = "crosshair";
        }
    }

    function onKeyDown(evt){
        if (!userShip.model) return;

        if (evt.keyCode == 32){
            userShip.isFiring = true;
            triggerUpdate();
        }else if (evt.keyCode == 67){
            isCentering = true;
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
                isFiring:userShip.isFiring
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

        gameData.offsetX = backgroundImage.x = window.paddingX + (gameData.width/2 - userData.posX);
        gameData.offsetY = backgroundImage.y = window.paddingY + (gameData.height/2 - userData.posY);

        overlay.x = PADDING;
        overlay.y = PADDING;
        overlay.setBounds(0, 0, width-(PADDING*2), height-(PADDING*2));

        stage.update();
        background.update();
    }


    return GameView;
});