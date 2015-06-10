var gameObjects = null;// new GameObjects();


/*
// This object holds transient state about objects during game play
*/
function ObjectTransientInformation(assetManagerObjectIndex) {
	this.objectIndex = assetManagerObjectIndex;  // index into the asset manager that holds the images
	this.timesPlayed = 0;                        // number of times the current sprite set has been played (used for sprite codas) 
	this.currentFrame = 0;                       // current frame rendered in the current sprite set
	this.currentFrameInterval = 0;               // The current frame inerval number, i.e. a frame may only want to be rendered 1 in 3 frame intervals
	this.collided = false;                       // If we have collided with the player
	this.codaCompleted = false;                  // if we have finished rendering the sprite coda
	this.currentFrameShowPoints = 0;             // a count of how many frames has passed since we started showing the points.
	this.x = -1; 								 // used for baddies to keep track of their position in world pixels 
	this.y = -1; 								 // used for baddies to keep track of their position in world pixels 
	this.risingText = null;                      //rising text object used for points rising
}

/*
//  This cntroller runs all game item (object) logic
*/
function GameObjects() {

	this.transInfo = [];

	this.initialise = Initialise;
	function Initialise() {
		for(var i = 0; i < gameConfig.graphics.objects.length; i++) {
			var name = gameConfig.graphics.objects[i].name;
			gameConfig.graphics.objects[name] = gameConfig.graphics.objects[i];
		}
	}

	// run all logic for a game object including collision detection with player and animations
	this.draw = Draw;	
	function Draw(ctx, cellIndex, contextX, contextY) {
		if (gameEngine.worldLevel.levelData.objectArray[cellIndex] != null) {
			// to deal with this game object
			// we will need the transient state of the object
			var transientObject = this.transInfo[gameEngine.worldLevel.levelData.objectArray[cellIndex].transDex];
			// we will also need images and properties from the asset manager
			var assetObject = gameConfig.graphics.objects[transientObject.objectIndex];
			// get the available points from the initial asset in case it changes to a coda object later
			var points = assetObject.points;
			// if we are an object that is in collision mode (transition to game removal)
			// then our sprites lie elsewhere in another asset object record
			var image = null;
			if (transientObject.collided && assetObject.spriteCoda != "") {
				assetObject = gameConfig.graphics.objects[assetObject.spriteCoda];
			}
			// collision area rectangle
			var rectCollisionArea = null;

			// not collided then test for collision
			// but only is there is no power and no points associated with this object
			if (!transientObject.collided && (assetObject.power || assetObject.points || assetObject.healthPoints)) {
				// work out the collision area for this object in world coordinates
				rectCollisionArea = new Rect(
					contextX + utils.validateVariable(assetObject.padding.left, 0), 
					contextY + utils.validateVariable(assetObject.padding.top, 0), 
					gameConfig.world.tileWidth -  utils.validateVariable(assetObject.padding.left, 0) - utils.validateVariable(assetObject.padding.right, 0), 
					gameConfig.world.tileHeight - utils.validateVariable(assetObject.padding.top, 0) - utils.validateVariable(assetObject.padding.bottom, 0));

				// quick test to see if this object collides with the player
				if (playerObj.rectCollisionRectangle != null && rectCollisionArea.collidesWith(playerObj.rectCollisionRectangle)) {
					// Let the player do its thing with the asset object
					playerObj.doObjectCollision(assetObject);
					// set this object to collided
					transientObject.collided = true;
					// first frame of collision
					transientObject.currentFrame = 0;
					// set it to the collision sprite set if there is one to use
					if (assetObject.spriteCoda != "")
						assetObject = gameConfig.graphics.objects[assetObject.spriteCoda];
				}
			}

			if (!transientObject.codaCompleted) {

				var scale = utils.validateVariable(assetObject.displaySizePercent, 100);
				if (transientObject.collided) {
					var effect = utils.validateVariable(assetObject.effect, "");
					// expand the icon effect
					if (effect == "expand") {
						scale *= (transientObject.timesPlayed * 
									assetManager.imageArray[assetObject.spriteSheet].maxFrames + 
									transientObject.currentFrame + 1);
					}
				}

				// draw the image for this frame
				assetManager.drawToXYScaled(ctx, 
					assetObject.spriteSheet, 
					transientObject.currentFrame, 
					contextX + utils.validateVariable(assetObject.xOffset, 0),
					contextY + utils.validateVariable(assetObject.yOffset, 0),
					scale);

/*				ctx.font = '12pt Calibri';
				ctx.fillStyle = 'red';
				ctx.fillText("" + gameEngine.worldLevel.levelData.objectArray[cellIndex].objectDex, contextX + 32, contextY + 32);
*/
				
				// draw the pink area of vulnerability
				if (gameConfig.world.showCollisionAreas) {
					var rect = new Rect(contextX, contextY, gameConfig.world.tileWidth, gameConfig.world.tileHeight);
					rect.border(ctx, "pink", 1);
					if (rectCollisionArea)
						rectCollisionArea.border(ctx, "pink", 1);
				}

				// increment the objects frame interval
				transientObject.currentFrameInterval++;
				// are we ready to show a new sprite?
				if (transientObject.currentFrameInterval >= assetObject.frameInterval) {
					// yep so reset the current frame interval ( this controlls the speed that new frames are presented)
					transientObject.currentFrameInterval = 0;
					// increment the frame number
					transientObject.currentFrame++;
					// have we reached the final sprite frame?
					if (transientObject.currentFrame >= assetManager.imageArray[assetObject.spriteSheet].maxFrames) {
						// yep
						transientObject.currentFrame = 0;
						// are we in the sprite coda?
						if (transientObject.collided) {
							// yep
							transientObject.timesPlayed++;
							// have we played the sprite coda the required amount of times?
							if (transientObject.timesPlayed >= assetObject.playTimes) {
								// tell the system not to display any more sprites for this object instance
								transientObject.codaCompleted = true;
							}
						}
					}
				}
			}

			// show the points gathered
			if (transientObject.collided && points > 0) {
				if (!transientObject.risingText) {
					transientObject.risingText = 
						new RisingText(
									contextX + gameConfig.world.tileWidth / 2, 
									contextY + gameConfig.world.tileHeight / 2 - (transientObject.currentFrameShowPoints * 2),
									points);
				}
				transientObject.risingText.draw(ctx);
				if (transientObject.risingText.finished) {
					transientObject.risingText = null;
					gameEngine.worldLevel.levelData.objectArray[cellIndex] = null;
				}

/*				ctx.font = "16px Verdana";
				var gradient = ctx.createLinearGradient(0, 0, 10, 0);
				gradient.addColorStop("0","yellow");
				gradient.addColorStop("0.5","blue");
				gradient.addColorStop("1.0","white");
				
				// Fill with gradient
				ctx.strokeStyle =gradient;							
				ctx.strokeText(, 
					contextX + gameConfig.world.tileWidth / 2, 
					contextY + gameConfig.world.tileHeight / 2 - (transientObject.currentFrameShowPoints * 2)
					points);

				// max number of frames to show points from an object or bad guy
				transientObject.currentFrameShowPoints++;
				// have we run out of frames?
				if (transientObject.currentFrameShowPoints >= gameConfig.world.maxFramesToShowPoints) {
					// yep destroy the object reference
					gameEngine.worldLevel.levelData.objectArray[cellIndex] = null;
				}
*/			}
		}
	}

	this.initialise();
}