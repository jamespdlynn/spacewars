define(['createjs','view/overlay', 'view/sprite', 'view/planet','view/usership','view/enemyship','view/missile','view/explosion','model/constants','model/game','model/manifest'],
function(createjs, Overlay, Sprite, Planet, UserShip, EnemyShip, Missile, Explosion, Constants, gameData, manifest){
    'use strict';

    var RADIUS = Constants.Player.width/2;
    var PADDING = 20;

    var initialized, autorun, background, stage, updateTimeout, overlay, userShip, sprites, gameEnding;

    var GameView = {

        isRunning : false,

        //Set up Game View
        initialize : function(){

                initialized = false;

                background = new createjs.Stage("background");
                background.enableDOMEvents(false);
                background.tickEnabled = false;
                background.tickOnUpdate = false;
                background.mouseChildren = false;

                stage = new createjs.Stage("game");
                stage.enableDOMEvents(false);
                stage.mouseChildren = false;

                window.preloader = new createjs.LoadQueue(false, "http://dazx2ug0v9sfb.cloudfront.net/");
                preloader.addEventListener("complete", function(){
                    initialized = true;
                    if (autorun) GameView.run();
                });

                createjs.Sound.alternateExtensions = ["mp3"];

                preloader.installPlugin(createjs.Sound);
                preloader.loadManifest(manifest);

                window.getRelativeVolume = function(sprite){
                    return userShip ? Math.min(1-(userShip.distance(sprite)/2000), 0) : 0;
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

            userShip = new UserShip();
            overlay = new Overlay(userShip);

            renderZone();

            setStageSize();
            window.onresize = setStageSize;

            createjs.Ticker.setFPS(Constants.FPS);
            createjs.Ticker.addEventListener("tick", onTick);

            gameData.on(Constants.Events.ZONE_CHANGED, renderZone);
            gameData.on(Constants.Events.COLLISION, onCollision);

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

    function renderZone(){

        stage.removeAllChildren();
        background.removeAllChildren();
        sprites = {};

        var planets = gameData.currentZone.planets;
        var players = gameData.currentZone.players;
        var missiles = gameData.currentZone.missiles;
        var i;

        i= planets.length;
        while (i--){
            background.addChild(new Planet(planets.models[i]));
        }

        i= missiles.length;
        while (i--) addSprite(missiles.models[i]);
        missiles.on("add", addSprite);
        missiles.on("remove", removeSprite);

        i= players.length;
        while (i--) addSprite(players.models[i]);
        players.on("add", addSprite);
        players.on("remove", removeSprite);

        stage.addChild(userShip);
        stage.addChild(overlay);

        background.update();
        stage.update();

    }

    function addSprite(model){

        var sprite;

        if (model.type == "Player"){
            if (model.id === gameData.playerId){
                userShip.setModel(model);
                return;
            }
            sprite = new EnemyShip(model);
        }else if (model.type === "Missile"){
            sprite = new Missile(model);
            playRelativeSound('shotSound',sprite);
        }

        sprites[model.toString()] = sprite;
        stage.addChildAt(sprite, 0);

        return sprite;
    }

    function removeSprite(model){
        if (userShip && model.equals(userShip.model)){
            stage.removeChild(userShip);
            userShip.destroy();
        }else{
            var sprite = sprites[model.toString()];
            if (model.type == "Player") sprite.destroy();
            stage.removeChild(sprite);
            delete sprites[model.toString()];
        }
    }


    //Game Loop
    function onTick(evt){

        if (userShip && !stage.mouseInBounds){
            userShip.isAccelerating = false;
            userShip.isShielded = false;
            userShip.isFiring = false;
        }

        if (gameEnding){
            stage.alpha = Math.max(stage.alpha-0.005, 0);
            background.alpha = Math.max(background.alpha-0.005, 0);
            createjs.Sound.setVolume(Math.max(createjs.Sound.getVolume()-0.005, 0));

            background.update();

            if (stage.alpha === 0 && GameView.isRunning){
                gameData.trigger(Constants.Events.GAME_END);
            }
        }

        stage.update(evt);
    }

    function onCollision(data){

        var zone = gameData.currentZone;

        var explode1 = data.sprite1 && data.sprite1.explode;
        var explode2 = data.sprite2 && data.sprite2.explode;

        var model1 = explode1 ? zone.remove(data.sprite1) : zone.get(data.sprite1);
        var model2 = explode2 ? zone.remove(data.sprite2) : zone.get(data.sprite2);

        if (model1){

            var size=0, position={};

            if ((explode1 && (explode2 || model1.type === "Player")) || (explode2 && model2.type === "Player"))
            {
                if (!model2 || model1.height > model2.height){
                    size = model1.height*2;
                    position = model1.data;
                }
                else if (model2.height > model1.height){
                    size = model2.height*2;
                    position = model2.data;
                }
                else{
                    size = model1.height*2;
                    position = model1.averagePosition(model2);
                }


                var explosion = new Explosion(position.posX, position.posY, size);

                stage.addChildAt(explosion);
                playRelativeSound('explosionSound');

                explosion.addEventListener("animationend", function(){
                    explosion.removeEventListener("animationend");
                    stage.removeChild(explosion);
                });

                var slayer;
                if (explode1 && model1.type === 'Player'){
                    if (userShip.model.equals(model1)){
                        slayer = (model2.type === 'Player') ? zone.players.get(model2.id) : zone.players.get(model2.get("playerId"));
                        endGame(slayer);
                    }
                    else if (userShip.model.equals(model2) || model2.get("playerId") === userShip.model.id){
                        gameData.incrementKills();
                    }
                }

                if (explode2 && model2.type === 'Player'){
                    if (userShip.model.equals(model2)){
                        slayer = (model1.type === 'Player') ? zone.players.get(model1.id) : zone.players.get(model1.get("playerId"));
                        endGame(slayer);
                    }
                    else if (userShip.model.equals(model1) || model1.get("playerId") === userShip.model.id){
                        gameData.incrementKills();
                    }
                }
            }
            else if (!model1.get("isShieldBroken") && !model2.get("isShieldBroken")){
                playRelativeSound("collideSound");
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
            var deltaX = (evt.stageX - userShip.x);
            var deltaY = (evt.stageY  - userShip.y);

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

        stage.canvas.width = background.canvas.width = width;
        stage.canvas.height = background.canvas.height = height;

        gameData.setScale(width/Constants.Zone.width, height/Constants.Zone.height);

        overlay.regX = -PADDING;
        overlay.regY = -PADDING;
        overlay.setBounds(PADDING, PADDING, width-(PADDING*2), height-(PADDING*2));

        background.update();
    }


    return GameView;
});