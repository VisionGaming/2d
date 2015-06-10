var gameSpawn = null;//new Spawn();

function Spawn() {

	this.spawnArray = [];

	// draw and move the spawn
	this.draw = 
	function (ctx) {
		for (var i = 0; i < this.spawnArray.length; i++) {
			var thisSpawn = this.spawnArray[i];
			if (thisSpawn.active) {

				// if we are not rendering the explosion
				if (!thisSpawn.inCoda && thisSpawn.active) {

					// draw the normal sprite
					thisSpawn["collisionArea"] = thisSpawn.sprite.draw(ctx, thisSpawn.x, thisSpawn.y, thisSpawn.displaySizePercent);

					// quick test to see if this spawn collides with the player
					if (thisSpawn.kills == "player" && !gameConfig.world.dontDie) {
						if (playerObj.rectCollisionRectangle != null && thisSpawn["collisionArea"].collidesWith(playerObj.rectCollisionRectangle)) {				
							playerObj.deductHealth(thisSpawn.healthDecrement);
							if (thisSpawn.directionX < 0)
								thisSpawn.x -= gameConfig.world.tileWidth;
							thisSpawn.inCoda = true;
						}
					}
					else {
						// does this spawn kill any baddies?
						if (thisSpawn.kills == "baddies" && baddieObj.checkCollision(thisSpawn["collisionArea"])) {
							// stop the spawn, because it killed something
							if (thisSpawn.directionX < 0)
								thisSpawn.x -= gameConfig.world.tileWidth;
							thisSpawn.inCoda = true;
						}
					}

					// test to see if a world tile was hit
					if (gameEngine.tileAtPixelCoordinateIsSolid(thisSpawn.x, thisSpawn.y)) {
						// stop the spawn, because it killed something
						// if moving left then adjust the blast range
						if (thisSpawn.directionX < 0)
							thisSpawn.x -= gameConfig.world.tileWidth;
						thisSpawn.inCoda = true;
					}
		
					thisSpawn.x += thisSpawn.directionX;
					thisSpawn.y += thisSpawn.directionY;
					if (thisSpawn.x < 0 || thisSpawn.x > gameConfig.world.width ||
						thisSpawn.y < 0 || thisSpawn.y > gameConfig.world.height) {
						// set the spawn entry for reuse
						// todo spriteCoda
						if (thisSpawn.directionX < 0)
							thisSpawn.x -= gameConfig.world.tileWidth;
						thisSpawn.inCoda = true;
					}
				}
				// otherwise we are exploding
				else {
					// this takes into account that there mght not be a coda definied for this spawn
					// so just end disapear
					if (!thisSpawn.spriteCoda) {
						this.endSpawn(i);
					}
					else {
						thisSpawn["collisionArea"] = thisSpawn.spriteCoda.draw(ctx, thisSpawn.x + thisSpawn.spriteCoda.frameWidth, thisSpawn.y, thisSpawn.displaySizePercent);
						if (thisSpawn.spriteCoda.finished)
							this.endSpawn(i);
					}
				}

			}
		}
	}

	// stop the spawn
	this.endSpawn = 
	function (i) {
		//todo spriteCoda
		var thisSpawn = this.spawnArray[i];
		if (thisSpawn.callbackFunction)
			thisSpawn.callbackFunction(thisSpawn.parentIndex);

		thisSpawn.active = false;
		thisSpawn.inCoda = false;
	}


	// create a spawn based on its name and the action (left right up down)
	this.createNewSpawn = 
	function (kills, action, subaction, x, y, parentIndex, callbackFunction, spawnHealthDecrement, maxAllowed) {
		// double check? how many are in flight already for this guy
		if (this.isAllowedToSpawn(parentIndex, maxAllowed)) {
			// loop through all spawn entries
			for (var i = 0; i < gameConfig.graphics.spawn.length; i++) {
				// and then each of there actions
				for (var j = 0; j < gameConfig.graphics.spawn[i].sprites.length; j++) {
					// if we found the name and action the spawn is responding to
					if (gameConfig.graphics.spawn[i].name == subaction && gameConfig.graphics.spawn[i].sprites[j].action == action) {
						var thisSpawn = gameConfig.graphics.spawn[i].sprites[j];
						// create a small state object to keep track of frames and coordinates
						var obj = {
							active:true,
							spawnIndex:i,
							spriteIndex:j,
							directionX:thisSpawn.directionX,
							directionY:thisSpawn.directionY,
							kills:kills,
							displaySizePercent:utils.validateVariable(gameConfig.graphics.spawn[i].displaySizePercent, 100),
							x:x,
							y:y,
							parentIndex:parentIndex,
							callbackFunction:callbackFunction,
							healthDecrement:utils.validateVariable(spawnHealthDecrement, 0),
							sprite:new Sprite({spriteSheet:thisSpawn.spriteSheet, frameInterval:gameConfig.graphics.spawn[i].sprites[j].frameInterval}),
							spriteCoda: (thisSpawn.spriteCoda)?new Sprite({spriteSheet:thisSpawn.spriteCoda, frameInterval:gameConfig.graphics.spawn[i].sprites[j].frameInterval, playTimes:gameConfig.graphics.spawn[i].sprites[j].playTimes}):null,
							inCoda:false
						}
						// push it onto the state array
						this.spawnArray.push(obj);
					}
				}
			}
		}
	}

	// see if we allowed to spawn, only applies to baddies
	this.isAllowedToSpawn = 
	function (parentIndex, maxAllowed) {
		var ret = true;
		if (parentIndex != null) {
			if (this.getCountInplay(parentIndex) >= maxAllowed) {
				ret = false;
			}
		}
		return ret;
	}

	// how many are currently in play for a parent index
	this.getCountInplay = 
	function (index) {
		var count = 0;
		for (var i = 0; i < this.spawnArray.length; i++) {
			if (this.spawnArray[i].active && this.spawnArray[i].parentIndex == index)
				count++;
		}
		return count;
	}


	// index the spawn array by name
	this.initiate =
	function () {
		for (var i = 0; i < gameConfig.graphics.spawn.length; i++) {
			gameConfig.graphics.spawn[gameConfig.graphics.spawn[i].name] = gameConfig.graphics.spawn[i];
		}
	}

	// run the initiation sequence
	this.initiate();
}