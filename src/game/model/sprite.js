

/*
spriteConfig: {
	spriteSheet,
	frameInterval:1,
	playTimes:-1,
}
*/

/*
// The sprite object 
// performs the internal mechanisms of sprite mechanics
*/
function Sprite(spriteConfig) {
	// name of the spritesheet in the asset manager
	this.spriteSheet = spriteConfig.spriteSheet;
	// read out the number of frames this spritesheet has
	//this.maxFrames = 
	// the frame interval determines how fast the sprite frames are rendered
	this.frameInterval = utils.validateVariable(spriteConfig.frameInterval, 1);
	// playtimes is how many times this sprite is fully rendered
	this.playTimes = spriteConfig.playTimes; // can be null
	
	// interval variables to keep track of framing
	this.currentPlayTime = 0;
	this.currentFrameInterval = 0;
	this.currentFrame = 0;
	this.finished = false;
	this.frameWidth = assetManager.imageArray[this.spriteSheet].frameWidth;

	this.draw = 
	function (ctx, x, y, scaling) {
		var r = assetManager.drawToXYScaled(ctx, this.spriteSheet, this.currentFrame, x, y, scaling);
		this.increment();
		return r;
	}

	// run the sprite through its paces
	this.increment = 
	function () {
		if (!this.finished) {
			// keep track of how many frames have gone by
			this.currentFrameInterval++;
			// if this equals the frameInterval (delay)
			if (this.currentFrameInterval == this.frameInterval) {
				// increment the frame
				this.currentFrame++;
				// reset the delay 
				this.currentFrameInterval = 0;
			}

			// looping the sprite images
			if (this.currentFrame >= assetManager.imageArray[this.spriteSheet].maxFrames) {
				// start again at the first frame
				this.currentFrame = 0;
				// increment the number of times the sprite has been played
				this.currentPlayTime++;
				// if we are finished then flag us as done.
				if (this.currentPlayTime >= this.playTimes) {
					this.finished = true;
				}
			}
		}
	}

}