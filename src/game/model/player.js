
var playerObj = null;//new Player();
function Player() {

	// stores properties about actions
	this.actionArray = [];

	// the canvas the player is drawn on
	this.canvas = 
		new Canvas("player", 
				0, 
				0, 
				gameConfig.world.tileWidth, 
				gameConfig.world.tileWidth, true);

	this.x = 0;
	this.y = 0;
	this.action = "still";
	this.subaction = "";
	this.powers = [];
	this.currentTerrain = "land";
	this.ignoreFallingCount = 0;
	this.message = "";
	this.messageCount = 0;
	this.healthPoints = gameConfig.world.playerHealthPoints;

	// action checks
	this.lastDirectionX = "right";
	this.jumping = false;
	this.jumpingXDirection = "right";
	this.jumpingYDirection = -1;
	this.jumpingCount = 0;
	this.startFallY = 0;
	this.rectCollisionRectangle = null;
	this.onPlatform = false;

	// draw the current player image to the hidden player context
	this.draw = 
	function (ctx, x, y) {
		// start with the current action, this may change
		// this is essentially the current direction the player is facing
		var drawAction = this.action;
		// find out what kind of terrain we are on, because the spritesheet changes in different terrains
		var terrain = this.getCurrentTerrain();
		// if the action is still, then combine the last x facing action
/*		var actionName = this.action;
		if (actionName == "still") {
			actionName = actionName + "_" + this.lastDirectionX;
		}
		// read in the state for our action frames in this terrain
		var asset = this.actionArray[actionName + ":" + terrain];
		if (!asset) {
			// did not find the asset? default to the normal asset without direction information
			var asset = this.actionArray[this.action + ":" + terrain];
		}
*/
		var asset = this.getAsset();
		// if we have a subaction and our action (direction) does not have a subaction property that matches e.g. "still"
		// then the action sprite is be changed to the lastDirectionX value for this draw as the default direction of spawn
		// the new asset is read from the actionArray and passed through to end of this draw
		// this is so when the player is still he shoots in the direction he last faced and briefly faces it when the bullet is launched
		if (this.subaction) {
			var found = false;
			for (var j = 0; found = false, j < gameConfig.graphics.player[asset.playerIndex].sprites[asset.spriteIndex].overlays.length; j++) {
				if (utils.validateVariable(gameConfig.graphics.player[asset.playerIndex].sprites[asset.spriteIndex].overlays[j].subaction, "") != "") {
					found = true;
				}
			}
			if (!found) {
				drawAction = this.lastDirectionX;
				asset = this.actionArray[drawAction + ":" + terrain];
			}
		}

		// finally derive the spritesheet suitable
		var spriteSheet = gameConfig.graphics.player[asset.playerIndex].sprites[asset.spriteIndex].spriteSheet;
		// and render it
		//assetManager.drawToXY(ctx, spriteSheet, asset.currentFrame, x, y);

		// if we got hurt then get up if we are not dead
		if (this.hurt) {
			// if we have played the entire hurt sprite and we have health
			if (asset.currentFrame == assetManager.imageArray[spriteSheet].maxFrames - 1) {
				if (this.healthPoints > 0) {
					// then rise!
					this.action = "still";
					// miraculous cure!
					this.hurt = false;
				}
				else {
					// to do death scene
					gameEngine.restartLevel = true;
				}
			}
		}

		// are there any overlays to render?
		// check each power the player currently has
		for (var i = 0; i < this.powers.length; i++) {
			for (var j = 0; j < gameConfig.graphics.player[asset.playerIndex].sprites[asset.spriteIndex].overlays.length; j++) {
				// reference to the overlay in the config
				var thisOverlay = gameConfig.graphics.player[asset.playerIndex].sprites[asset.spriteIndex].overlays[j];
				// get the power needed from the overlay
				var thisPower = utils.validateVariable(thisOverlay.power, "");
				// if the player holds this power
				if ( thisPower == this.powers[i]) {
					// then draw the overlay if its not used up
					if (this.powers[thisPower].count > 0) {
						spriteSheet = thisOverlay.spriteSheet;
						//assetManager.drawToXY(ctx, thisOverlay.spriteSheet, asset.currentFrame, x, y);					
					}
				}

				// render any subaction overlay, used in the config for primarily for rendering gunfire
				// if the subaction is not null is means that we are in a subaction moment
				// so initiate a subaction and spawn the relevant spawn item
				if (this.subaction) {
					// we see if this overlay is an subaction overlay
					var thisSubaction = utils.validateVariable(thisOverlay.subaction, "");
					// if it is and its the one we are looking for
				 	if (thisSubaction != "" && thisSubaction == this.subaction.name ) {

				 		if (!this.subaction.initiated) {
							var spawn = gameConfig.graphics.spawn[this.subaction.spawns];
							// check we have the power first
							// important check to see if we can spawn, this will be null if A) we never had the power, or B) we exhausted the "health" of that power
							if (this.powers[spawn.power]) {
								// now we decrement the power object, so we run out of power after the required amount of times
								this.powers[spawn.power].count -= utils.validateVariable(spawn.powerDecrement, 0);
								// initiate the subaction to indicate that the spawn sa been done
					 			this.subaction.initiated = true;
					 			// spawn the spawn
					 			gameSpawn.createNewSpawn(
					 							"baddies",
								 				drawAction,
								 				this.subaction.spawns, 
								 				this.x + utils.validateVariable(thisOverlay.spawnX, 0),
								 				this.y + utils.validateVariable(thisOverlay.spawnY, 0));
								//check that we have some of this power available
								if (this.powers[spawn.power].count <= 0) {
									// remove the power from the power array
									var pname = spawn.power;
									var pindex = this.powers[pname].index;
									// physically remove it from the array
									this.powers.splice(pindex, 1);
									// and null out the named property
									this.powers[pname] = null;
								}
					 		}
					 		else // this subaction is not appropriate because we dont have the required power
					 			this.subaction = null;
				 		}

				 		// if the subaction still exists (because it was valid due to the fact that we have the power object)
				 		if (this.subaction) {
					 		// draw the overlay, important, the frame must be the current frame of the main sprite
					 		// or things get out of sync
							//assetManager.drawToXY(ctx, thisOverlay.spriteSheet, asset.currentFrame, x, y);					
							spriteSheet = thisOverlay.spriteSheet;
							// framing, increment the current frame
							this.subaction.currentFrame++;
							// if we run out of frames
							if (this.subaction.currentFrame >= assetManager.imageArray[thisOverlay.spriteSheet].maxFrames) {
								// set the current frame to zero to start again
								this.subaction.currentFrame = 0;
								// increment the number of times we played the sprite
								this.subaction.currentPlayTime++;
								// if we have done the maximum playtimes
								if (this.subaction.currentPlayTime >= thisOverlay.playTimes) {
									// clear out the subaction because its finished.
									this.subaction = null;
								}
							}
						}
					}
				}

			}
		}

		// Render only once the spritesheet we ended up with
		assetManager.drawToXY(ctx, spriteSheet, asset.currentFrame, x, y);					

		if (this.message!="" && this.messageCount != gameConfig.world.thoughtBubbleFrames) {
			assetManager.drawToXY(ctx, "thought_bubble", 0, this.x + gameConfig.world.tileWidth, y + 20 - assetManager.imageArray["thought_bubble"].frameHeight);
			assetManager.drawToXYScaled(ctx, this.message, 0, this.x + gameConfig.world.tileWidth + 32, y - 64, this.messageScale);
			this.messageCount++;
		}

		// draw the pink area of vulnerability
		if (gameConfig.world.showCollisionAreas) {
			this.rectCollisionRectangle.border(ctx, "pink", 1);
			// draw a border around the tile area
			var rect = new Rect(
					x, 
					y,
					gameConfig.world.tileWidth,
					gameConfig.world.tileHeight);

			rect.border(ctx, "pink", 1);				
		}
	}

	this.drawOnGameContext = 
	function (ctx) {
		// when the game calls us we increment our sprite
		this.move();
		this.incrementSprite();
		this.draw(ctx, this.x, this.y);
	}

	// do all movements related to the player apply world physics etc
	this.move = 
	function () {

		// update the collision area rectangle
		this.rectCollisionRectangle = new Rect(
					this.x + gameConfig.world.playerPaddingLeft,
					this.y + gameConfig.world.playerPaddingTop,
					gameConfig.world.tileWidth - gameConfig.world.playerPaddingRight - gameConfig.world.playerPaddingLeft,
					gameConfig.world.tileHeight - gameConfig.world.playerPaddingBottom - gameConfig.world.playerPaddingTop);

		// if we are hurt we can not move, if we have no health then we are screwed
		var tileObj = this.getTileObject(this.x + gameConfig.world.tileWidth / 2, this.y + gameConfig.world.tileHeight / 2);
		// if we are on a null tile, then its ground terrain and normal gravity
		if (!tileObj) {
			terrain = "land";
			gravity = gameConfig.world.gravity;
		}
		else {
			// find out what kind of terrain we are on
			var terrain = utils.validateVariable(tileObj.terrain, "land");
			// for this terrain what is the gravity
			var gravity = utils.validateVariable(tileObj.gravity, gameConfig.world.gravity);
		}
/*		var actionName = this.action;
		if (actionName == "still") {
			actionName = actionName + "_" + this.lastDirectionX;
		}
		// read in the state for our action frames in this terrain
		var asset = this.actionArray[actionName + ":" + terrain];
		if (!asset) {
			// did not find the asset? default to the normal asset without direction information
			var asset = this.actionArray[this.action + ":" + terrain];
		}*/
		var asset = this.getAsset();
		// reference to graphics object
		var graphics = gameConfig.graphics.player[asset.playerIndex].sprites[asset.spriteIndex];

		// derement the ignore graviy count (water todo: revise strategy)
		if (this.ignoreFallingCount)
			this.ignoreFallingCount--;

		// is we in a jump
		if (this.jumping) {
			// then jump!
			this.jump(gravity);
		}
		else {
			this.fall(gravity);
		}

		// detect a deadly tile
		if (this.myTileIsDeadly() && !gameConfig.world.dontDie && !this.onPlatform) {
			// we are dead
			this.deductHealth(10);
			this.action= "die";
			this.hurt = true;
		}

		// detect end of level
		if (this.myTileIsExit() && this.powers.indexOf("key") > -1) {
			// we are finished this level
			this.action= "exit";
		}


		switch(this.action) {
			case "still":
				// nothing to do, because we are standing still
				this.jumpingXDirection = "still";
				break;

			case "left":
				// move left if we can
				if (!this.somethingLeft() && this.x - utils.validateVariable(graphics.playerSpeedX, gameConfig.world.playerSpeedX) > 0)  {
					// take player speed from action related sprite if its available
					this.x -= utils.validateVariable(graphics.playerSpeedX, gameConfig.world.playerSpeedX);
				}
				else
					// reset to the left allowing for the padding
					this.resetXAxis(-1);

				this.jumpingXDirection = "left";
				this.lastDirectionX= "left";
					
				break;

			case "right":
				// move right if we can
				if (!this.somethingRight())  {
					// take player speed from action related sprite if its available
					this.x += utils.validateVariable(graphics.playerSpeedX, gameConfig.world.playerSpeedX);
					// shift the world to scroll with the player
				}
				else
					// reset to the left allowing for the padding
					this.resetXAxis(1);

				this.jumpingXDirection = "right";
				this.lastDirectionX= "right";

				break;

			case "up":
				// move up if we can
				if (this.somethingAbove())
					this.resetYAxis();

				if (terrain == "water" && !this.somethingAbove())  {
					this.y -= gameConfig.world.playerSpeedX;
					// ignore gravity for 4 times
					this.ignoreFallingCount = 4;
				}
				else {
					// jump code
					if (!this.jumping && (this.somethingBelow() || this.lastTerrain == "water" || this.onPlatform) && !this.somethingAbove()) {
						this.jumpingYDirection = -1;
						this.jumping = true;	
						this.jumpingCount = 0;
						this.action = this.jumpingXDirection;
					} 
					else 
					if (!this.jumping) {
						this.action = this.jumpingXDirection;//"still";
					}
					break;
				}
		}

		this.lastTerrain = this.currentTerrain;
		this.currentTerrain = terrain;

		// override everything to with sprites if we are hurt
		if (this.hurt)
			this.action = "die";
	}

	this.fall = 
	function (gravity) {
		// otherwise if there is nothing under us
		if (!this.onPlatform && !this.somethingBelow() && !this.ignoreFallingCount) {
			// we are falling
			//this.action= "falling";
			//start the fall
			if (this.startFallY == -1)
				this.startFallY = this.y; 

			// fall is we are falling and nothing below us
			if (!this.somethingBelow()) {
				// if we are over a tile that has no gravity
				var tile = this.getTileObject(this.x, this.y);
				// then clear the deadly gravity effect
				if (tile != null && tile.noGravity)
					this.startFallY = this.y;

				this.y += gravity;
				if (this.somethingBelow()) {
					this.resetYAxis();
					if (this.startFallY > 0 && // we must have started falling
						!gameConfig.world.dontDie &&  // not in safe mode
						//measure how far we fell
						parseInt((this.y - this.startFallY) / gameConfig.world.tileHeight) >= gameConfig.world.playerTooMuchofAFall) 
						// fully die
						this.deductHealth(10);
					else
						this.action = this.jumpingXDirection;
					// reset the falling distance
					this.startFallY = -1;
				}
			}
		}
	}


	this.getCurrentTerrain = 
	function() {
		var tileObj = this.getTileObject(this.x + gameConfig.world.tileWidth / 2, this.y + gameConfig.world.tileHeight / 2);
		var terrain = "land";
		
		if (tileObj && tileObj.terrain)
			terrain = tileObj.terrain;

		return terrain;
	}

	/*
	// SHift the viewport so the player is always in the center of the screen
	*/
	this.oldx = 0;
	this.oldy = 0;
	this.shiftViewPort = 
	function  () {
		// if the player has moved then shift
		if (this.oldx != this.x || this.oldy != this.y) {
			// record the new coordinates
			this.oldx = this.x;
			this.oldy = this.y;
			// work out half of the viewport because we want the player to be in the middle if we can
			var halfvpw = parseInt(gameConfig.world.viewPortWidth / 2);
			var halfvph = parseInt(gameConfig.world.viewPortHeight / 2);

			// optimally the viewport should be shifted to keep the player in the middle
			var vpx = playerObj.x - halfvpw;
			var vpy = playerObj.y - halfvph;

			// but if this sets the viewport x or y below zero, then bottom out
			vpx = (vpx < 0)?0:vpx;
			vpy = (vpy < 0)?0:vpy;

			// same with the other side
			// if the player x and half the viewport is too much
			if (playerObj.x + halfvpw > gameConfig.world.width)
				// then bottom out the viewportx to the right hand side
				vpx = gameConfig.world.width - gameConfig.world.viewPortWidth;

			// as above but with the y axis
			if (playerObj.y + halfvph > gameConfig.world.height)
				vpy = gameConfig.world.height - gameConfig.world.viewPortHeight;

			// finally give our resulting values back to the system.
			gameEngine.gameViewPortLeft = vpx;
			gameEngine.gameViewPortTop = vpy;
			gameEngine.backgroundLeft = parseInt(gameEngine.gameViewPortLeft / gameConfig.world.backgroundSpeedRatio);
			gameEngine.backgroundTop = parseInt(gameEngine.gameViewPortTop / gameConfig.world.backgroundSpeedRatio);

			// call the callback to anounce viewport shifted
			if (gameEngine.callBackViewPortShift) {
				gameEngine.callBackViewPortShift(vpx, vpy);
			}
		}
	}



	// Make the player jump
	this.jump = 
	function (gravity) {
		// test for hitting our head
		if (this.jumpingYDirection== -1) {
			if (this.somethingAbove()) {
				// if we hit something bounce off it
				this.jumpingYDirection = -this.jumpingYDirection;
				this.resetYAxis();	
			}
		}

		// keep count of how many jump increments we have done
		this.jumpingCount += this.jumpingYDirection;
		// move the man through the air
		this.y += (this.jumpingYDirection * gravity);

		// is we reach the height of the jump
		if (this.jumpingCount == -gameConfig.world.playerJumpingHeight) {
			// come down again
			this.jumpingYDirection = -this.jumpingYDirection;
		}

		// if we have finished the full jump or we landed on something
		if (this.jumpingCount == 0 || this.somethingBelow()) {
			// stop jumping
			this.jumping = false;
			this.action = this.jumpingXDirection;
			// make the player land on an even row
			this.resetYAxis();
		}
	}			


	// Returns a tile object under pixel point x, y
	this.getTileObject = 
	function (x, y) {
		var column = parseInt(x / gameConfig.world.tileWidth);
		var row = parseInt(y / gameConfig.world.tileHeight);
		var gameCellNumber = row * gameConfig.world.gridColumns + column;
		var tileNumber = gameEngine.worldLevel.levelData.tileArray[gameCellNumber];

		if (tileNumber > -1)
			return gameConfig.graphics.tiles[tileNumber];
		else
			return null;
	}


	// Resets the mans Y coordinate to an even tile Row position
	this.resetYAxis = 
	function () {
		var column = parseInt(this.x / gameConfig.world.tileWidth);
		var row = parseInt(this.y / gameConfig.world.tileHeight);

		this.y = row * gameConfig.world.tileHeight;
	}

	// Resets the mans X coordinate to an even tile Row position
	this.resetXAxis = 
	function (direction) {
		var column = parseInt((this.x + gameConfig.world.tileWidth / 2) / gameConfig.world.tileWidth);
		var row = parseInt((this.y + gameConfig.world.tileHeight / 2) / gameConfig.world.tileHeight);

		// if left (-1) we want to subtract the left padding
		// for right we want to add the right padding
		// here I am multiplying the direction 1 or -1 by the correct padding (left or right)
		direction *= ((direction==1)?gameConfig.world.playerPaddingRight:gameConfig.world.playerPaddingLeft);
		// calculate the cell left top and adjust the x axis to the padding
		this.x = column * gameConfig.world.tileWidth + direction;
	}

	// return true is the tile the player on is an exit tile
	this.myTileIsExit = 
	function () {
		var ret = false;
		// scan all the pixels to the left the entire height of the man
		tileObject = this.getTileObject(this.x, this.y);
		if (tileObject) {
			if (tileObject.isExit) {
				ret = true;
			}
		}
		return ret;
	}

	// return true is the tile the player on is deadly
	this.myTileIsDeadly = 
	function () {
		var ret = false;
		var deathCount = 0;
		var tileObject = null;

		// we will be comparing 4 coorindates, an inner rectangle in the players tile area
		var x1 = this.x + gameConfig.world.playerPaddingLeft;
		var y1 = this.y + gameConfig.world.playerPaddingTop;
		var x2 = this.x + gameConfig.world.tileWidth - gameConfig.world.playerPaddingRight;
		var y2 = this.y + gameConfig.world.tileHeight - gameConfig.world.playerPaddingBottom;


		// check the 4 coordinates one by one, but we only need one to be a hit
		tileObject = this.getTileObject(x1, y1);
		if (tileObject && tileObject.isDeath && this.powers.indexOf(tileObject.requiredPower) == -1) 
			deathCount++;
		else {
			tileObject = this.getTileObject(x1, y2);
			if (tileObject && tileObject.isDeath && this.powers.indexOf(tileObject.requiredPower) == -1) 
				deathCount++;
			else {
				tileObject = this.getTileObject(x2, y1);
				if (tileObject && tileObject.isDeath && this.powers.indexOf(tileObject.requiredPower) == -1) 
					deathCount++;
				else {
					tileObject = this.getTileObject(x2, y2);
					if (tileObject && tileObject.isDeath && this.powers.indexOf(tileObject.requiredPower) == -1) 
						deathCount++;
				}
			}
		}
		// if we have a hit then report it back
		if (deathCount)
			ret = true;

		return ret;
	}

	// return true is there is something on the left
	this.somethingLeft = 
	function () {
		var ret = false;
		if (this.pixelXOffScreen(this.x - gameConfig.world.tileWidth /  2) < 0) {
			ret = true;
		}
		else {

			// scan all the pixels to the left the entire height of the man
			for (var i = 0; i < gameConfig.world.tileHeight; i++) {
				tileObject = this.getTileObject(this.x + gameConfig.world.playerPaddingLeft - 1, this.y + i);
				if (tileObject) {
					if (tileObject.isSolid) {
						ret = true;
					}
				}
			}
		}
		return ret;
	}

	// return true is there is something on the right side
	this.somethingRight = 
	function () {
		var ret = false;
		if (this.pixelXOffScreen(this.x + gameConfig.world.tileWidth) > 0) {
			ret = true;
		}
		else {
			// scan all the pixels to the left the entire height of the man
			for (var i = 0; i < gameConfig.world.tileHeight; i++) {
				tileObject = this.getTileObject(this.x + gameConfig.world.tileWidth - gameConfig.world.playerPaddingRight + 1, this.y + i);
				if (tileObject) {
					if (tileObject.isSolid) {
						ret = true;
					}
				}
			}
		}
		return ret;
	}

	/*
	// check if this y position in pixels is offscreen
	// returns -1 if the coordinate is < 0
	// returns 1 of the coordinate is greater than maxrows
	*/
	this.pixelYOffScreen = 
	function (y) {
		var ret = 0;
		
		var row = y / gameConfig.world.tileHeight;

		// if offscreen y coordinate then return true
		if (row >= gameConfig.world.gridRows)
			ret = 1;

		if (row < 0)
			ret = -1;

		return ret;
	}

	/*
	// check if this x position in pixels is offscreen
	// returns -1 if the coordinate is < 0
	// returns 1 of the coordinate is greater than maxcolumns
	*/
	this.pixelXOffScreen = 
	function (x) {
		var ret = 0;
		
		var col = x / gameConfig.world.tileHeight;

		// if offscreen y coordinate then return true
		if (col >= gameConfig.world.gridColumns)
			ret = 1;

		if (col < 0)
			ret = -1;

		return ret;
	}

	// return true is there is something below the man
	this.somethingBelow = 
	function () {
		var ret = false;
		var hitCount = 0;

		if (this.pixelYOffScreen(this.y + gameConfig.world.tileHeight) > 0) {
			ret = true;
		}
		else {
			// this allows for left and right padding of character
			var testingWidth = gameConfig.world.tileWidth -  (gameConfig.world.playerPaddingLeft +  gameConfig.world.playerPaddingRight) - 2;

			// test all pixels below the man
			for (var i = 0; i < testingWidth; i++) {
				tileObject = this.getTileObject(this.x + i + gameConfig.world.playerPaddingLeft + 1, this.y + gameConfig.world.tileHeight);
				if (tileObject && tileObject.isSolid) {
					// something is under this pixel
					hitCount++;
				} 
			}

			// if there is no ground underneath any of our pixels
			if (hitCount != 0) { 
				ret = true;
			}
		}
		return ret;

	}

	// return true is there is something above the man a distance of gravity interval
	this.somethingAbove = 
	function () {
		var ret = false;
		var hitCount = 0;

		if (this.pixelYOffScreen(this.y - gameConfig.world.tileHeight) < 0) {
			ret = true;
		}
		else {
			// this allows for left and right padding of character
			var testingWidth = gameConfig.world.tileWidth -  (gameConfig.world.playerPaddingLeft +  gameConfig.world.playerPaddingRight) - 2;

			// test all pixels above the man
			for (var i = 0; i < testingWidth; i++) {
				tileObject = this.getTileObject(this.x + i + gameConfig.world.playerPaddingLeft + 1, this.y - gameConfig.world.gravity);
				if (tileObject && tileObject.isSolid) {
					// nothing under this pixel
					hitCount++;
				} 
			}

			// if there is solid above then report it
			if (hitCount != 0) { 
				ret = true;
			}
		}
		return ret;
	}

	// set up the associative array for the player actions
	// not quite right...
	this.loadActionPropertiesArray = 
	function () {
		for (var i = 0; i < gameConfig.graphics.player.length; i++) {
			for (var j = 0; j < gameConfig.graphics.player[i].sprites.length; j++) {
				//var sheetName = gameConfig.graphics.player[i].sprites[i].spriteSheet;
				var props = {
					currentFrameInterval:0,
					currentFrame:0,
					//frameInterval:gameConfig.graphics.player[i].sprites[i].frameInterval,
					//spriteSheet:sheetName,
					playerIndex:i,
					spriteIndex:j
				}
				// pick up congig easily based on player action and terrain
				this.actionArray[gameConfig.graphics.player[i].name + ":" + gameConfig.graphics.player[i].sprites[j].terrain] = props;
			}
		}
	}


	// display the next sprite in the current sprite set
	this.lastFrame = -1;
	this.incrementSprite = 
	function () {
		if (this.action == "still" || this.action == "die" || this.action == "exit") {
			var props = this.actionArray[this.action + "-" + this.lastDirectionX + ":" + this.currentTerrain];
		}
		else {
			var props = this.actionArray[this.action + ":" + this.currentTerrain];
		}
		if (!props)
			alert(this.action + ":" + this.currentTerrain + " is not defined" );

		var spriteSheet = gameConfig.graphics.player[props.playerIndex].sprites[props.spriteIndex].spriteSheet;
		// couldnt find an appropriate action object
		// use the still action as a template
		if (!props) {
			props = this.actionArray["still-right:land"];
			this.actionArray[this.action + ":" + this.currentTerrain] = props;
		}
		// we only increment the sprite set index if the frame interval is right
		props.currentFrameInterval++;
		if (props.currentFrameInterval == gameConfig.graphics.player[props.playerIndex].sprites[props.spriteIndex].frameInterval) {
			props.currentFrame++;
			props.currentFrameInterval = 0;
		}

		// looping the sprite images
		if (!assetManager.imageArray[spriteSheet]) {
			alert("spritesheet:" + spriteSheet + " is not defined.");
		}
		if (props.currentFrame >= assetManager.imageArray[spriteSheet].maxFrames) {
			props.currentFrame = 0;
			if (this.action == "exit") {
				// todo: exit delay!
				gameEngine.levelFinished = true;
			}
		}

		this.lastFrame = props.currentFrame;
	}

	// changes the action to the appropriate direction
	// the world refresh will then draw the correct sprite
	this.lastAction = "";
	this.doAction = 
	function (direction) {
		// we can not move while we are hurt
		if (!this.hurt) {
			this.action = direction;
			// if its a still directive we really want to know about that now, not in the next frame interval
			if (direction == "still")
				this.jumpingXDirection = "still";

			var terrain = this.getCurrentTerrain();
			// read in the state for our action frames in this terrain
			var asset = this.getAsset();//this.actionArray[this.action + ":" + terrain];
			// set the frame for this terrain action to number 0
			// this is neat and also when we get hurt it ensures
			// that the entire hurt sprite is played
			if (this.lastAction != this.action)
				asset.currentFrame = 0;

			this.lastAction = this.action
		}
	}

	// changes the action to the appropriate direction
	// the world refresh will then draw the correct sprite
	this.doSubaction = 
	function (subaction) {
		// we can not move while we are hurt
		if (!this.hurt) {
			// todo: dont let a subaction occur if we dont have the power to use it.
			var spawnName = "";
			for (var i = 0; i < this.powers.length; i++) {
				// looking up the object in the config by name (power name) because we want its subaction
				if (gameConfig.graphics.objects[this.powers[i]].subaction == subaction) {
					// assign a class to the subaction that controls the framing 
					this.subaction = {
						name:subaction,        // what subaction has been called
						initiated:false,       // if the action has taken place
						currentFrame:0,        // what frame we are up to
						currentPlayTime:0,     // how many times have we played the frames
						spawns:gameConfig.graphics.objects[this.powers[i]].spawns // what this object spawns
					};

				}
			}
		}
	}

	this.addPoints = 
	function (points) {
		// add up the points is there are any
		gameEngine.points += points;
	}


	// when we collide with an object, take its power
	this.doObjectCollision = 
	function (object) {

		// any object can carry health points
		if (object.healthPoints) {
			// but it can not carry a power as well
			this.healthPoints += object.healthPoints;
			// too many? overflow?
			if (this.healthPoints > gameConfig.world.playerHealthPoints) {
				// just take the max
				this.healthPoints = gameConfig.world.playerHealthPoints;
			}
		}
		else {
	
			// add the power to our list of powers
			if (object.power != "") {
				if (this.powers.indexOf(object.power) < 0) {
					this.powers.push(object.power);
					this.powers[object.power] = {
						power:object.power,           // the name of the power 
						count:0,                      // the "health" of this power, when it gets to zero, remove it
						index:this.powers.length - 1  // keep track of the actual power index
					}
				}
				// keep the number of objects collected against the power
				this.powers[object.power].count += utils.validateVariable(object.powerIncrement, 1);
			}
		}

		//user icon essage
		if (object.message) {
			this.message = object.message;
			this.messageScale = utils.validateVariable(object.messageScalePercentage, 100);
			this.messageCount = 0;
		}

		// add up the points is there are any
		gameEngine.points += utils.validateVariable(object.points, 0);
	}

	// return the appropriate spritesheet name from current player action 
	// only used by the designer
	this.getSpriteSheetName = 
	function (action) {
		for(var i = 0; i < gameConfig.graphics.player.length; i++) {
			if (gameConfig.graphics.player[i].name == action) 
				return gameConfig.graphics.player[i].sprites[0].spriteSheet;
		}
	}

	this.deductHealth = 
	function (points) {
		if (!this.hurt && !gameConfig.world.dontDie) {
			this.healthPoints -= utils.validateVariable(points, 0);
			this.doAction("die");
			this.hurt = true;
		}
	}

	// Get the asset record for current action in terrain
	this.getAsset = 
	function() {
		var terrain = this.getCurrentTerrain();
		// if the action is still exit or die, then combine the last x facing action
		var actionName = this.action;
		if (actionName == "exit") {
			var jhgfjg=1;
		}
		if (actionName == "still" || actionName == "exit" || actionName == "die") {
			actionName = actionName + "-" + this.lastDirectionX;
		}
		// read in the state for our action frames in this terrain
		var asset = this.actionArray[actionName + ":" + terrain];
		if (!asset) {
			// did not find the asset? default to the normal asset without direction information
			var asset = this.actionArray[this.action + ":" + terrain];
		}
		return asset;
	}

	// initiate the objects array
	this.loadActionPropertiesArray();
}