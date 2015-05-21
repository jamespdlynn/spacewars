define(["control/client","model/game","model/constants"], function(Client, GameData, Constants){

	var SHIELD_RANGE = Constants.Player.width*2;
	var FIRING_RANGE = Constants.Missile.maxDistance/2;

	var Bot = function(userId) {
		this.gameData = new GameData();
		this.gameData.user.id = userId;
		this.client = new Client(this.gameData);
    };

	extend.call(Bot.prototype, {
		run : function(hostname){

			var self = this;

			this.gameData.on(Constants.Events.CONNECTED, function(){
				self.gameData.off();
				self.gameData.on(Constants.Events.GAME_ENDING, function(){
					self.gameData.off();
					self.client.stop();
				});

				var interval = setInterval(function(){
					if (self.client.isRunning){
						self._update();
					}else{
						clearInterval(interval);
					}
				}, Constants.Events.CLIENT_UPDATE_INTERVAL);
			});

			hostname = hostname || "localhost";
			this.client.run(hostname);
		},

		stop : function(){
			this.client.stop();
		},

		_update : function(){
			var gameData = this.gameData.update();
			var userPlayer = gameData.userPlayer.clone();

			var closestPlayer = null;
			var minDistance = Infinity;


			gameData.players.forEach(function(player){
				if (player.id != userPlayer.id){
					var distance = userPlayer.getDistance(player);

					if (distance < minDistance){
						minDistance = distance;
						closestPlayer = player;
					}
				}
			});


			if (!closestPlayer){
				this.client.stop();
				return;
			}

			var deltaTime = minDistance < FIRING_RANGE ? minDistance/Constants.Missile.velocity*1000 : 0;

			var userData = userPlayer.clone().update(deltaTime/2).data;
			var playerData = closestPlayer.clone().update(deltaTime).zoneAdjustedPosition(gameData.zone);

			var deltaX = playerData.posX  - userData.posX;
			var deltaY = playerData.posY - userData.posY;

			var data = {
				angle : Math.atan2(deltaY, deltaX),
				isFiring : minDistance < FIRING_RANGE,
				isAccelerating : minDistance > FIRING_RANGE/2 && userPlayer.get('isAccelerating') || userPlayer.get('fuel') > 20,
				isShielded : minDistance < SHIELD_RANGE
			};

			if (!data.isShielded && userPlayer.canShield()){
				gameData.missiles.forEach(function(missile){
					if (missile.get("playerId") != userPlayer.id){
						var distance = userPlayer.getDistance(missile);
						if (distance < SHIELD_RANGE){
							data.isShielded = true;
						}
					}
				});
			}

			this.client.sendData(data);
		}


	});

	return Bot;
});