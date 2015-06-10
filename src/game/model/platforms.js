
var platformObj = null;//new Platforms();
function Platforms() {

	// every platform in this level
	this.platform = [];
	this.platformCount = false;

	this.initiate = 
	function () {
		var platforms = gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms;
		if (platforms) {
			this.platform = [];
			for (var i = 0; i < platforms.length; i++) {
				var p = platforms[i];
				var obj = {
					sprite:new Sprite( {spriteSheet:p.spriteSheet, frameInterval:p.frameInterval }),
					x:p.moveArray[0].x * gameConfig.world.tileWidth,
					y:p.moveArray[0].y * gameConfig.world.tileHeight,
					moveIndex:0,
					loop:p.loop,
					scaling:p.scaling,
					currentCoordinateSetDirection:1,
					speed:p.speed,
					onPlatform:false,
					xPadding:p.xPadding,
					collisionArea:null
				};
				this.platform.push(obj);
			}
		}
	}
	
	this.draw =
	function (ctx) {
		this.platformCount = 0;
		for (var i = 0; i < this.platform.length; i++) {
			var p = this.platform[i];
			var g = gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms[i];
			// draw the platform, and frame the sprite
			var r = p.sprite.draw(ctx, p.x, p.y);
			p.collisionArea = r;

			// platform movement
			var coordIndex = p.moveIndex;
			// if we have arrived at our destination coordinate set (1st time run of cause we have because we have not moved from it)
			if (p.x == g.moveArray[coordIndex].x * gameConfig.world.tileWidth && p.y == g.moveArray[coordIndex].y * gameConfig.world.tileHeight) {
				// move our target to the next set of coordinates
				coordIndex += p.currentCoordinateSetDirection;
				// have we reached the end of the corrdinates list?
				//var nextIndex = coordIndex + p.currentCoordinateSetDirection;
				if (coordIndex >= g.moveArray.length || coordIndex < 0) {
					// reset, go back to the origin
					if (p.loop) {
						coordIndex -= p.currentCoordinateSetDirection;
						p.currentCoordinateSetDirection  = -p.currentCoordinateSetDirection;
					}
					else {// not looped means disappear & start from move 0
						p.x = g.moveArray[0].x * gameConfig.world.tileWidth;
						p.y = g.moveArray[0].y * gameConfig.world.tileHeight;

						coordIndex = 0;
					}
					// todo if not looped then pop this baddie from the list
				}
				p.moveIndex = coordIndex;
			}
			else {

				// check for player
				var movePlayer = false;

				var pr = new Rect(
						p.x + p.xPadding, 
						p.y - gameConfig.world.tileHeight,
						assetManager.imageArray[p.sprite.spriteSheet].frameWidth - p.xPadding * 2, 
						gameConfig.world.tileHeight);

				var feetRect = new Rect(
					playerObj.x + gameConfig.world.playerPaddingLeft, 
					playerObj.y,
					gameConfig.world.tileWidth - gameConfig.world.playerPaddingLeft - gameConfig.world.playerPaddingRight, 
					gameConfig.world.tileHeight);

				// draw the pink area of vulnerability
				if (gameConfig.world.showCollisionAreas) {
					pr.border(ctx, "red", 1);
					feetRect.border(ctx, "red", 1);
				}

				// the player is not on this platform
				p.onPlatform = false;
				// test for eligibility
				// the player can stand on a platform if the jumping direction is downwards
				// of if there is not jump in play at all
				if (playerObj.jumpingYDirection == 1 || !playerObj.jumping) {
					// now if the player feet collide with the platform
					if (playerObj.rectCollisionRectangle && pr.collidesWith(feetRect)) {
						movePlayer = true;
						// attempt to catch the player and stop his jump
						// align his feet to the top of the platform
						if  (!p.onPlatform) {
							playerObj.jumping = false;		
							playerObj.startFallY = -1;
							p.onPlatform = true;
						}
					}
				}


				// determine direction of travel
				// a point chaser does not even care about walls
				if (p.x < g.moveArray[coordIndex].x * gameConfig.world.tileWidth) {
					p.x += p.speed;
					if (movePlayer) {
						playerObj.x += p.speed;
						playerObj.y = p.y - gameConfig.world.tileHeight;
//						playerObj.shiftViewPort();
					}
				}

				if (p.x > g.moveArray[coordIndex].x * gameConfig.world.tileWidth) {
					p.x -= p.speed;
					if (movePlayer) {
						playerObj.x -= p.speed;
						playerObj.y = p.y - gameConfig.world.tileHeight;
//						playerObj.shiftViewPort();
					}
				}

				if (p.y < g.moveArray[coordIndex].y * gameConfig.world.tileHeight) {
					p.y += p.speed;
					if (movePlayer) {
						playerObj.y = p.y - gameConfig.world.tileHeight - p.speed;
//						playerObj.shiftViewPort();
					}
				}

				if (p.y > g.moveArray[coordIndex].y * gameConfig.world.tileHeight) {
					p.y -= p.speed;
					if (movePlayer) {
						playerObj.y = p.y - gameConfig.world.tileHeight + p.speed;
//						playerObj.shiftViewPort();
					}
				}
			}

			// count how may platforms register the player as being on it
			if (p.onPlatform)
				this.platformCount++;
		}
		// if we are on no platforms then let the player fall
		if (!this.platformCount)
			playerObj.onPlatform = false;			
		else // else set the player to be on a platform (edge case)
			playerObj.onPlatform = true;			

	}

	// run the constructor
	this.initiate();


}