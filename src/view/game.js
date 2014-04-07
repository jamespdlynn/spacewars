define(['createjs','view/overlay', 'view/planet','view/usership','view/enemyship','view/missile','view/explosion','model/constants','model/game','model/manifest'],
function(createjs, Overlay, Planet, UserShip, EnemyShip, Missile, Explosion, Constants, gameData, manifest){
    'use strict';

    var RADIUS = Constants.Player.width/2;
    var PADDING = 20;

    var initialized, autorun, background, stage, updateTimeout, backgroundImage, overlay, userShip, sprites, gameEnding, game;

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

                game = document.getElementById("game");

                window.preloader = new createjs.LoadQueue(false, Constants.ASSETS_URL);
                preloader.addEventListener("complete", function(){
                    initialized = true;
                    if (autorun) GameView.run();
                });

                createjs.Sound.alternateExtensions = ["mp3"];

                preloader.installPlugin(createjs.Sound);
                preloader.loadManifest(manifest);

                window.getRelativeVolume = function(sprite){
                    return userShip && userShip.model ? Math.max(1-(userShip.model.getDistance(sprite)/Constants.Zone.width), 0) : 0;
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

            i= missiles.length;
            while (i--) addSprite(gameData.missiles.models[i]);
            gameData.missiles.on("add", addSprite);
            gameData.missiles.on("remove", removeSprite);

            i= players.length;
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

        if (model.equals(gameData.userPlayer) return null;

        var sprite;

        switch (model.type){
            case "Planet":
                sprite = sprites[model.toString()] = new Planet(model);
                background.addChild(sprite);
                break;

            case "Player":
                sprite = sprites[model.toString()] = new EnemyShip(model);
                stage.addChildAt(sprite, 0);
                overlay.radar.addMark(sprite);
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
                overlay.radar.removeMark(sprite);
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

        var scrollSpeed = 500/Constants.FPS;
        var padding = userShip.model.width;

        var velocityX = userShip.model.get("velocityX")/ Constants.FPS;
        var velocityY = userShip.model.get("velocityY")/ Constants.FPS;

        game.style.cursor = "crosshair";

        if (stage.mouseInBounds && stage.mouseX <= padding && (userShip.x < window.innerWidth-padding || velocityX < 0) && gameData.offsetX < gameData.width-scrollSpeed){
            gameData.offsetX += (userShip.x <  window.innerWidth-padding-1) ? scrollSpeed : -velocityX;
            game.style.cursor = "w-resize";
            updateBackground = true
        }
        else if (stage.mouseInBounds && stage.mouseX >= window.innerWidth-padding && (userShip.x > padding || velocityX > 0) && gameData.offsetX > -gameData.width+scrollSpeed+(2*window.paddingX)){
            gameData.offsetX -= (userShip.x >  padding+1) ? scrollSpeed : velocityX;
            game.style.cursor = "e-resize";
            updateBackground = true;
        }
        else if ((userShip.x <= padding && velocityX < 0)|| (userShip.x >= window.innerWidth-padding && velocityX > 0)){
            gameData.offsetX -= velocityX ;
            updateBackground = true;
        }


        if (stage.mouseInBounds && stage.mouseY <= padding && (userShip.y < window.innerHeight-padding || velocityY < 0) && gameData.offsetY < gameData.height-scrollSpeed){
            gameData.offsetY += (userShip.y <  window.innerHeight-padding-1 ) ? scrollSpeed : -velocityY;
            game.style.cursor = game.style.cursor === "crosshair" ?  "n-resize" : "n"+game.style.cursor;
            updateBackground = true
        }
        else if (stage.mouseInBounds && stage.mouseY >= window.innerHeight-padding && (userShip.y > padding || velocityY > 0) && gameData.offsetY > -gameData.height+scrollSpeed+(2*window.paddingY)){
            gameData.offsetY -= (userShip.y > padding+1 ) ? scrollSpeed : velocityY;
            game.style.cursor = game.style.cursor === "crosshair" ?  "s-resize" : "s"+game.style.cursor;
            updateBackground = true;
        }
        else if ((userShip.y <= padding && velocityY < 0)|| (userShip.y >= window.innerHeight-padding && velocityY > 0)){
            gameData.offsetY -= velocityY;
            updateBackground = true;
        }

        if (!stage.mouseInBounds){
            userShip.isAccelerating = false;
            userShip.isShielded = false;
            userShip.isFiring = false;
        }

        if (gameEnding){
            stage.alpha = Math.max(stage.alpha-0.005, 0);
            background.alpha = Math.max(background.alpha-0.005, 0);
            createjs.Sound.setVolume(Math.max(createjs.Sound.getVolume()-0.005, 0));

            updateBackground = true;

            if (stage.alpha === 0 && GameView.isRunning){
                gameData.trigger(Constants.Events.GAME_END);
            }
        }

        stage.update(evt);

        if (updateBackground){
            backgroundImage.x = gameData.offsetX;
            backgroundImage.y = gameData.offsetY;
            background.update(evt);
        }
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

        var explode1 = data.sprite1 && data.sprite1.explode;
        var explode2 = data.sprite2 && data.sprite2.explode;

        var model1 = explode1 ? gameData.remove(data.sprite1) : gameData.get(data.sprite1);
        var model2 = explode2 ? gameData.remove(data.sprite2) : gameData.get(data.sprite2);

        if (model1){

            if ((explode1 && (explode2 || model1.type === "Player")) || (explode2 && model2.type === "Player"))
            {

                var model;

                if (!model2 || model1.height > model2.height){
                    model = model1.clone();
                }
                else if (model2.height > model1.height){
                    model = model2.clone();
                }
                else{
                    model = model1.clone();
                    model.set(model1.averagePosition(model2));
                }

                var explosion = new Explosion(model);

                stage.addChildAt(explosion);
                playRelativeSound('explosionSound', model);

                explosion.addEventListener("animationend", function(){
                    explosion.removeEventListener("animationend");
                    stage.removeChild(explosion);
                });

                var slayer;
                if (explode1 && model1.type === 'Player'){
                    if (userShip.model.equals(model1)){
                        if (model2){
                            slayer = (model2.type === 'Player') ? gameData.players.get(model2.id) : gameData.players.get(model2.get("playerId"));
                        }
                        endGame(slayer);
                    }
                    else if (model2 && (userShip.model.equals(model2) || model2.get("playerId") === userShip.model.id)){
                        gameData.incrementKills();
                    }
                }

                if (explode2 && model2.type === 'Player'){
                    if (userShip.model.equals(model2)){
                        slayer = (model1.type === 'Player') ? gameData.players.get(model1.id) : gameData.players.get(model1.get("playerId"));
                        endGame(slayer);
                    }
                    else if (userShip.model.equals(model1) || model1.get("playerId") === userShip.model.id){
                        gameData.incrementKills();
                    }
                }
            }
            else if (!model1.get("isShieldBroken") && model2 && !model2.get("isShieldBroken")){
                playRelativeSound("collideSound", model);
            }

        }
    }

    function endGame(slayer){
        gameData.slayer = slayer ? slayer.get("username") : "";
        gameData.incrementDeaths();
        gameEnding = true;
    }

    //Canvas Event Listeners
    function onMouseDown(evt){
        if (userShip){
            var which = evt.nativeEvent.which;
            if (which == 1 && userShip.model.canAccelerate()){
                userShip.isAccelerating = true;
                triggerUpdate();
            }else if (which == 3 && userShip.model.canShield()){
                userShip.isShielded = true;
                triggerUpdate();
            }
        }
    }

    function onMouseUp(evt){
        if (userShip){
            var which = evt.nativeEvent.which;
            if (which == 1){
                userShip.isAccelerating= false;
            }else if (which == 3){
                userShip.isShielded = false;
            }

        }
    }

    function onMouseMove(evt){
        if (userShip){
            var deltaX = (evt.stageX + stage.regX - userShip.x);
            var deltaY = (evt.stageY + stage.regY - userShip.y);

            if (Math.abs(deltaX) > RADIUS || Math.abs(deltaY) > RADIUS){
                userShip.angle = Math.atan2(deltaY, deltaX);
            }
        }
    }

    function onKeyDown(evt){
        if (userShip && evt.keyCode == 32){
            userShip.isFiring = true;
            triggerUpdate();
        }
    }

    function onKeyUp(evt){
        if (userShip && evt.keyCode == 32){
            userShip.isFiring = false;
        }
    }

    function triggerUpdate(){
        if (userShip && !document.isHidden()){

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