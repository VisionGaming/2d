
var baddieObj = null;//new Baddies;
/*
// Baddie object with predefined movements
*/
function Baddies() {

	this.baddiePosition = [];

	this.initiate = Initiate;
	function Initiate() {
		// reindex the baddies in the config by name
		var baddies = gameConfig.graphics.baddies;
		for (var i = 0; i < baddies.length; i++) {
			var name = gameConfig.graphics.baddies[i].name;
			gameConfig.graphics.baddies[name] = i;
		}
		this.initiateAllBaddiePositions();
	}

	// initiate all positions for baddies in this level
	this.initiateAllBaddiePositions = 
	function () {
		this.baddiePosition = [];
		var baddieInstance = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance;
		for (var i = 0; i < baddieInstance.length; i++) {
			this.baddiePositionInitiate(i);
		}
	}	

	/*
	// Initiate a baddie position element
	*/
	this.baddiePositionInitiate = 
	function (i) {
		var baddieInstance = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance;
		// recalculate the x and y's into game pixels
		for (var j = 0; j < baddieInstance[i].moveArray.length; j++) {
				baddieInstance[i].moveArray[j]["xPix"]  = baddieInstance[i].moveArray[j].x * gameConfig.world.tileWidth;
				baddieInstance[i].moveArray[j]["yPix"]  = baddieInstance[i].moveArray[j].y * gameConfig.world.tileHeight;
		}
		// create baddie position entries for every baddie on the current level
		// to keep track of where they are at
		// we can add framing information to this when we need to later
		this.baddiePosition[i] = {
			x: baddieInstance[i].moveArray[0].xPix,     // the baddies current x coordinate in game pixels
			y: baddieInstance[i].moveArray[0].yPix,     // the baddies current y coordinate in game pixels
			name: baddieInstance[i].name,            // index into both game config arrays
			instanceIndex: i,                        // index into the baddie instance array, cant use name here because there are duplicates
			timesPlayed: 0,                          // number of times the current sprite set has been played (used for sprite codas) 
			currentFrame: 0,                         // current frame rendered in the current sprite set
			currentFrameInterval: 0,                 // The current frame inerval number, i.e. a frame may only want to be rendered 1 in 3 frame intervals
			codaCompleted: false,                    // if we have finished rendering the sprite coda
			currentFrameShowPoints: 0,               // a count of how many frames has passed since we started showing the points.
			currentAction: vv(baddieInstance[i].facing, "default"), // what direction should the animal be facing, this is relevant to sprite rendering and movement 
			currentCoordinateSetIndex: 0,            // what coordinate set we are up to, only applies to a pointChaser
			currentCoordinateSetDirection:1,
			spawnCount:0,                            // number of children spawned
			spawnFrameDelay:vv(baddieInstance[i].spawn.frameDelay, 0),  // the delay (in frames between spawns)
			spawnMax: vv(baddieInstance[i].spawn.maxInPlay, 0),     // the maximum number of spawns available at a time
			spawnHealthDecrement: vv(baddieInstance[i].spawn.healthDecrement, 0),
			isDead:false,
			notKill:vv(baddieInstance[i].notKill, false),
			notDie:vv(baddieInstance[i].notDie, false),
			lastMoveHitPlayer:false,
			points:vv(baddieInstance[i].points, 0),
			pointsRising:null,
			lastAction:"",
			turningSprite:"",
			isTurning:false
		};
	}


	this.draw = Draw;
	function Draw(ctx) {

		// for every baddie instance
		for (var i = 0; i < this.baddiePosition.length; i++) {
			// show points rising
			if (this.baddiePosition[i].pointsRising) {
				this.baddiePosition[i].pointsRising.draw(ctx);
				if (this.baddiePosition[i].pointsRising.finished)
					this.baddiePosition[i].pointsRising = null;
			}

			// if we are not completely expired
			if (!this.baddiePosition[i].codaCompleted) {
				// whats its species?
				var name = this.baddiePosition[i].name;
				// dig out the artwork for this species
				var baddieArtIndex = gameConfig.graphics.baddies[name];
				var baddieArt = gameConfig.graphics.baddies[baddieArtIndex];
				// What must we avoid
				var avoid = utils.validateVariable(baddieArt.avoidTerrain, "");
				// dig out the instance index into the game config array
				var idex = this.baddiePosition[i].instanceIndex;
				// dig out the game physics for this species
				var baddieInstance = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance[idex];
				// index into the basic sprite information
				var artIndex = gameConfig.graphics.baddies[name];

				// now apply the game movement
				var x = this.baddiePosition[i].x;
				var y = this.baddiePosition[i].y;
				var direction = this.baddiePosition[i].currentAction;

				// convert our coordinates into world grid coordinates
				var c = parseInt(x / gameConfig.world.tileWidth);
				var r = parseInt(y / gameConfig.world.tileHeight);

				//checking if you hand on the wall should only take place when we reach a new game cell
				var isEvenCell = false;
				if (x % gameConfig.world.tileWidth == 0 && y % gameConfig.world.tileHeight == 0) {
					isEvenCell = true;
				}

				if (!this.baddiePosition[i].isTurning) {

					// depending on the species of baddie, move it
					switch(baddieInstance.moveType) {
						case "pointChaser":
							var coordIndex = this.baddiePosition[i].currentCoordinateSetIndex;
							// in edit mode these may not be set, so initialize it
							if (baddieInstance.moveArray[coordIndex]["xPix"] == null) {
								baddieInstance.moveArray[coordIndex]["xPix"]  = baddieInstance.moveArray[coordIndex].x * gameConfig.world.tileWidth;
								baddieInstance.moveArray[coordIndex]["yPix"]  = baddieInstance.moveArray[coordIndex].y * gameConfig.world.tileHeight;
							}
							// if we have arrived at our destination coordinate set (1st time run of cause we have because we have not moved from it)
							if (x == baddieInstance.moveArray[coordIndex].xPix && 
								y == baddieInstance.moveArray[coordIndex].yPix &&
								baddieInstance.moveArray.length > 1) {
								// move our target to the next set of coordinates
								coordIndex += this.baddiePosition[i].currentCoordinateSetDirection;
								// have we reached the end of the corrdinates list?
								var nextIndex = coordIndex + this.baddiePosition[i].currentCoordinateSetDirection;
								if (nextIndex >= baddieInstance.moveArray.length || nextIndex < 0) {
									// reset, go back to the origin
									this.baddiePosition[i].currentCoordinateSetDirection  = -this.baddiePosition[i].currentCoordinateSetDirection;
									// todo if not looped then pop this baddie from the list
								}
								this.baddiePosition[i].currentCoordinateSetIndex = coordIndex;
							}
							else {
								// determine direction of travel
								// a point chaser does not even care about walls

								if (y < baddieInstance.moveArray[coordIndex].yPix ) {
									y += baddieInstance.speed;
									direction = "down";
								}

								if (y > baddieInstance.moveArray[coordIndex].yPix ) {
									y -= baddieInstance.speed;
									direction = "up";
								}

								if (x < baddieInstance.moveArray[coordIndex].xPix ) {
									x += baddieInstance.speed;
									direction = "right";
								}

								if (x > baddieInstance.moveArray[coordIndex].xPix ) {
									x -= baddieInstance.speed;
									direction = "left";
								}

							}
							break;

						case "roamingRight":
							// keep your right hand on the wall and follow the walls around.

							if (isEvenCell) {
								// right hand on the wall
								switch(direction) {
									case "right":
										//if down is not blocked d = "down"
										if (!this.blockedCell(c, r + 1, avoid))
											direction = "down";
										else
										//if right is blocked then d = "up"
										if (this.blockedCell(c + 1, r, avoid))
											direction = "up";

										break;

									case "left":
										//if up is not blocked d = "up"
										if (!this.blockedCell(c, r - 1, avoid))
											direction = "up";
										else
										//if left is blocked then d = "down"
										if (this.blockedCell(c - 1, r, avoid))
											direction = "down";
										break;

									case "up":
										//if right is not blocked d = "right"
										if (!this.blockedCell(c + 1, r, avoid))
											direction = "right";
										else
										//if up is blocked then d = "left"
										if (this.blockedCell(c, r - 1, avoid))
											direction = "left";
										
										break;								

									case "down":
										//if left is not blocked d = "left"
										if (!this.blockedCell(c - 1, r, avoid))
											direction = "left";
										else
										//if down is blocked then d = "right"
										if (this.blockedCell(c, r + 1, avoid))
											direction = "right";

										break;
								}
							}

							// determine the x and y directions implied by the action string
							var xd = 0;
							var yd = 0;
							switch(direction) {
								case "left":
									xd = -1;
									break;

								case "right":
									xd = 1;
									break;

								case "up":
									yd = -1;
									break;

								case "down":
									yd = 1;
									break;
							}

							// if direction of movement is not blocked then move d
							if (!isEvenCell || !this.blockedCell(c + xd, r + yd, avoid)) {
								x += (baddieInstance.speed * xd);
								y += (baddieInstance.speed * yd);
							}

						break;

						case "roamingLeft":

							// keep your left hand on the wall and follow the walls around.
							if (isEvenCell) {
								switch(direction) {
									case "right":
										//if up is not blocked d = "up"
										if (!this.blockedCell(c, r - 1, avoid))
											direction = "up";
										else
										//if right is blocked then d = "down"
										if (this.blockedCell(c + 1, r, avoid))
											direction = "down";

										break;

									case "left":
										//if down is not blocked d = "down"
										if (!this.blockedCell(c, r + 1, avoid))
											direction = "down";
										else
										//if left is blocked then d = "up"
										if (this.blockedCell(c - 1, r, avoid))
											direction = "up";
										break;

									case "up":
										//if left is not blocked d = "left"
										if (!this.blockedCell(c - 1, r, avoid))
											direction = "left";
										else
										//if up is blocked then d = "right"
										if (this.blockedCell(c, r - 1, avoid))
											direction = "right";
										
										break;								

									case "down":
										//if right is not blocked d = "right"
										if (!this.blockedCell(c + 1, r, avoid))
											direction = "right";
										else
										//if down is blocked then d = "left"
										if (this.blockedCell(c, r + 1, avoid))
											direction = "left";

										break;
								}
							}

							// determine the x and y directions implied by the action string
							var xd = 0;
							var yd = 0;
							switch(direction) {
								case "left":
									xd = -1;
									break;

								case "right":
									xd = 1;
									break;

								case "up":
									yd = -1;
									break;

								case "down":
									yd = 1;
									break;
							}

							// if direction of movement is not blocked then move d
							if (!isEvenCell || !this.blockedCell(c + xd, r + yd, avoid)) {
								x += (baddieInstance.speed * xd);
								y += (baddieInstance.speed * yd);
							}

							break;
					}



					// update the coordinates
					this.baddiePosition[i].lastAction = this.baddiePosition[i].currentAction;
					this.baddiePosition[i].currentAction = direction;

					// do we need to be turning
					if (this.baddiePosition[i].lastAction == "right" && direction == "left" && !this.baddiePosition[i].isDead) {
						this.baddiePosition[i].turningSprite = "rightTurn";
						this.baddiePosition[i].isTurning = true;
						this.baddiePosition[i].currentFrame = 0;
					}
					else
					if (this.baddiePosition[i].lastAction == "left" && direction == "right" && !this.baddiePosition[i].isDead) {
						this.baddiePosition[i].turningSprite = "leftTurn";
						this.baddiePosition[i].isTurning = true;
						this.baddiePosition[i].currentFrame = 0;
					}

					this.baddiePosition[i].x = x;
					this.baddiePosition[i].y = y;
				} // end if not turning


				// grab the spritesheet name
				var spriteSheet = ""
				if (this.baddiePosition[i].isDead) {
					spriteSheet = baddieArt.spriteCoda
					baddieInstance.spawns = null;
				}
				else {
					spriteSheet = baddieArt.sprites[
						(this.baddiePosition[i].isTurning)?this.baddiePosition[i].turningSprite:this.baddiePosition[i].currentAction
						];
				}
				// couldnt find a spritesheet? try for the default
				if (!spriteSheet) {
					spriteSheet = baddieArt.sprites.default;
					// couldnt find the truning sprite, so dont apply turning
					this.baddiePosition[i].isTurning = false;
				}

				// manage the frame movement
				// todo - copy from objects perhaps create a frame movement class
				// increment the objects frame interval

				this.baddiePosition[i].currentFrameInterval++;
				// are we ready to show a new sprite?
				if (this.baddiePosition[i].currentFrameInterval >= baddieArt.frameInterval) {
					// yep so reset the current frame interval ( this controlls the speed that new frames are presented)
					this.baddiePosition[i].currentFrameInterval = 0;
					// increment the frame number
					this.baddiePosition[i].currentFrame++;
					// have we reached the final sprite frame?
					if (this.baddiePosition[i].currentFrame >= assetManager.imageArray[spriteSheet].maxFrames) {
						// yep
						this.baddiePosition[i].currentFrame = 0;
						// are we in the sprite coda?
						if (this.baddiePosition[i].isDead) {
							// yep
							this.baddiePosition[i].timesPlayed++;
							// have we played the sprite coda the required amount of times?
							if (this.baddiePosition[i].timesPlayed >= utils.validateVariable(baddieArt.playTimes, 1)) {
								// tell the system not to display any more sprites for this object instance
								this.baddiePosition[i].codaCompleted = true;
							}
						}
						if (this.baddiePosition[i].isTurning) {
							this.baddiePosition[i].isTurning = false;
						}
					}
				}

				// draw the baddie
				this.baddiePosition[i]["collisionArea"] = assetManager.drawToXYScaled(
							ctx, 
							spriteSheet,
							this.baddiePosition[i].currentFrame,
							x + utils.validateVariable(baddieArt.xOffset, 0), 
							y + utils.validateVariable(baddieArt.yOffset, 0), 
							utils.validateVariable(baddieArt.displaySizePercent, 100));

				if (!this.baddiePosition[i].notKill && !this.baddiePosition[i].isDead && !gameConfig.world.dontDie) {
					// quick test to see if this baddie collides with the player
					if (playerObj.rectCollisionRectangle != null && this.baddiePosition[i]["collisionArea"].collidesWith(playerObj.rectCollisionRectangle)) {				
						// only deduct the health points if we are newly colliding
						if (!this.baddiePosition[i].lastMoveHitPlayer)
							playerObj.deductHealth(baddieInstance.healthDecrement);

						this.baddiePosition[i].lastMoveHitPlayer = true;
					}
					else
						this.baddiePosition[i].lastMoveHitPlayer = false;
				}

				//spawn if necessary
				if (baddieInstance.spawn.name && !baddieInstance.isDead && !this.baddiePosition[i].codaCompleted && baddieInstance.spawn.condition) {  
					// check the spawn condition in the config
					var fnc = eval("(" + gameConfig.getSpawnConditionByName(baddieInstance.spawn.condition) + ")");
					//if (baddieInstance.spawn.condition( {x:this.baddiePosition[i].x, y:this.baddiePosition[i].y} )) {
					if (fnc( {x:this.baddiePosition[i].x, y:this.baddiePosition[i].y} )) {
						// make sure we are allowed to spawn now
						if (this.baddiePosition[i].spawnCount < this.baddiePosition[i].spawnMax) {
							
							// increment the number of spawns sent out
							this.baddiePosition[i].spawnCount++;
							// spawn and provide a callback to let us know the spawn has finished its life
							var d = "";
							if (this.baddiePosition[i].x > playerObj.x && this.baddiePosition[i].y == playerObj.y) 
								d = "left";
							else
							if (this.baddiePosition[i].x < playerObj.x && this.baddiePosition[i].y == playerObj.y) 
								d = "right";
							else
							if (this.baddiePosition[i].y > playerObj.y && this.baddiePosition[i].x == playerObj.x) 
								d = "up";
							else
							if (this.baddiePosition[i].y < playerObj.y && this.baddiePosition[i].x == playerObj.x) 
								d = "down";

							_this = this;
				 			gameSpawn.createNewSpawn(
				 							"player",
							 				d,
							 				baddieInstance.spawn.name, 
							 				this.baddiePosition[i].x + baddieInstance.spawn.relativeX,  // todo: + utils.validateVariable(thisOverlay.spawnX, 0),
							 				this.baddiePosition[i].y + baddieInstance.spawn.relativeY,  // todo: + utils.validateVariable(thisOverlay.spawnY, 0));
											i,                                                 // the reference to the object that spawned 
											function(index) { 
												_this.baddiePosition[index].spawnCount--; 
												// this prevents a glitch in designer mode, if the spawn count
												// drops below zero, an unexpected number of spawn can take place
												if (_this.baddiePosition[index].spawnCount < 0) {
													_this.baddiePosition[index].spawnCount = 0;
												}
											}, // callback funtion when spawn dies

											this.baddiePosition[i].spawnHealthDecrement, // how many player health points this spawn is worth
											this.baddiePosition[i].spawnMax); // how many is allowed to spawn
				 			// if the spawn removes the baddie, finish it off
				 			if (utils.validateVariable(baddieInstance.spawn.killsBaddieInstance, false)) {
				 				this.baddiePosition[i].codaCompleted = true;
				 			}
						}
					}
				}
			}
		}
	}

	this.blockedCell = 
	function(c, r, avoidTerrain) {

		var ret = false;
		if (r < 0 || c < 0) {
			ret = true;
		}
		else {
			var cellIndex = r * gameConfig.world.gridColumns + c;
			var index = gameEngine.gameTile(cellIndex);
			// its only blocked if a cell has a tile and the tile is solid
			if (index != -1) {
				var tileObj = gameConfig.graphics.tiles[index];
				// if its a solid, then 100% blocked
				if (tileObj.isSolid)
					ret = true;
				else
					// if its not solid and we avoid it then its also blocked
					if (utils.validateVariable(tileObj.terrain, "") == avoidTerrain && avoidTerrain != "")
						ret = true;
			}
		}
		return ret;
	}

	// Check collisions with the collision rectangle (see spawn class)
	this.checkCollision = 
	function (collisionRectangle) {
		var retVal = false;
		for (var i = 0; i < this.baddiePosition.length; i++) {
			if (!this.baddiePosition[i].notDie && !this.baddiePosition[i].isDead) {
				if (collisionRectangle.collidesWith(this.baddiePosition[i]["collisionArea"])) {
					// remove the baddie from the array
					playerObj.addPoints(this.baddiePosition[i].points);
					this.baddiePosition[i].isDead = true;
					// create a points rising object
					this.baddiePosition[i].pointsRising = new 
						RisingText(
							this.baddiePosition[i].x, 
							this.baddiePosition[i].y,
							this.baddiePosition[i].points);
					retVal = true;
				}
			}
		};
		return retVal;
	}


	this.initiate();
}