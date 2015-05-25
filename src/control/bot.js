define(["control/client","model/game","model/constants"], function(Client, GameData, Constants){

	var SHIELD_RANGE = Constants.Player.width*4;
	var FIRING_RANGE = Constants.Missile.maxDistance/2;

	var Bot = function(userId) {
		this.gameData = new GameData();
		this.gameData.user.id = userId;
		this.client = new Client(this.gameData);

		this.active = false;
		this.interval = null;
    };

	extend.call(Bot.prototype, {
		run : function(hostname){
			hostname = hostname || "localhost";

			if (this.active) return;

			var self = this;
			this.gameData.on(Constants.Events.CONNECTED, function(){
				self.interval = setInterval(self._update.bind(self), Constants.Events.CLIENT_UPDATE_INTERVAL);
			});
			this.gameData.on(Constants.Events.DISCONNECTED, this.stop.bind(this));
			this.gameData.on(Constants.Events.GAME_ENDING, this.stop.bind(this));

			this.client.run(hostname);

			this.active = true;
		},

		stop : function(){
			if (!this.active) return;

			clearInterval(this.interval);
			this.client.stop();
			this.gameData.off();
			this.active = false;
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
				this.stop();
				return;
			}

			var kills = closestPlayer.get('kills');

			var deltaTime = minDistance < FIRING_RANGE ? minDistance/Constants.Missile.velocity*1000 : 0;
			deltaTime /= Math.max(5-closestPlayer.get('kills'), 1); //Gets harder the more kill the player has

			var userData = userPlayer.clone().update(deltaTime/2).data;
			var playerData = closestPlayer.clone().update(deltaTime).zoneAdjustedPosition(gameData.zone);

			var deltaX = playerData.posX  - userData.posX;
			var deltaY = playerData.posY - userData.posY;

			var isAccelerating = userPlayer.get('isAccelerating');
			var fuel = userPlayer.get('fuel');


			var data = {
				angle : Math.atan2(deltaY, deltaX),
				isFiring : minDistance < FIRING_RANGE,
				isAccelerating : (isAccelerating && minDistance > FIRING_RANGE/2) || (!isAccelerating && fuel > 20 && minDistance > FIRING_RANGE),
				isShielded : minDistance < SHIELD_RANGE
			};

			if (!data.isShielded && userPlayer.canShield()){
				gameData.missiles.forEach(function(missile){
					if (missile.get("playerId") != userPlayer.id && missile.id % (2+kills) !== 0){
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