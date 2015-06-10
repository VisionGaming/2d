
// Global singleton Asset Manager object
var assetManager = null;// new AssetManager();

/*
// Asset manager class preloads all graphics in the background, 
*/
function AssetManager() {

	// store all images here we will be storing a load image DOM object and its name
	this.imageArray = [];
	/*
	// Load all tiles into the asset manager array
	// I will expand this to preload all graphic types
	*/
	this.imagesLoaded = 0;
	this.loadImages = 
	function () {
		var l = gameConfig.graphics.images.length;
		for(var i = 0 ; i < l; i++) {
			// load up the image 
			var imageObject = new Image();
			var _this = this;
			imageObject.onload = function() { 
				_this.imagesLoaded++;
				_this.loadingCompleted() 
			};
			imageObject.onerror = function() { 
				_this.imagesLoaded++;
				_this.loadingCompleted() 
			};
			// Image path defaults so we can simply assemble the image path from its name
			var defaultPath = gameConfig.graphics.defaultImageDirectory + gameConfig.graphics.images[i].name + gameConfig.graphics.defaultImageExtension;
			// but the user also has an option to specify the full path in the image property
			imageObject.src = utils.validateVariable(gameConfig.graphics.images[i].image, defaultPath);
			// and add the final object to the destination array, complete with the image graphic loaded
			// also include the name for reference
			var name = gameConfig.graphics.images[i].name;

			this.imageArray[i] = name;
			// if a frame width or Height exists in the image definition then use that otherwise use the tileWidth and height
			this.imageArray[name] = { 
				imageObj: imageObject,
				frameWidth: (gameConfig.graphics.images[i].frameWidth)?gameConfig.graphics.images[i].frameWidth:gameConfig.world.tileWidth,
				frameHeight: (gameConfig.graphics.images[i].frameHeight)?gameConfig.graphics.images[i].frameHeight:gameConfig.world.tileHeight,
				maxFrames: -1
			}
		}
	}

	/*
	// Load all levels into the world configuration object
	// One by one, once it fails we know we have loaded the last level available.
	*/
	this.finishedLoadingLevels = false;
	this.currentLevel = -1;

	this.loadLevels = 
	function () {
		
		// load up the scr tag 
		var _this = this;
		var path = "src/game/levels/";
        var scriptTag = document.createElement('SCRIPT');
        // load up the new empty level if the count is at -1
        if (this.currentLevel == -1) {
        	scriptTag.src = path + "levelnew.js";
        }
        // otherwise load up the next level number
        else {
            scriptTag.src = path + "level" + this.currentLevel + ".js";
       	}
       	// on successful loading go for the next level number
		scriptTag.onload = function() { 
			_this.currentLevel++;	
			setTimeout(function() { _this.loadLevels(); }, 10);					
		};
		// if we error out, we know that we have run out of levels to load
		scriptTag.onerror = function() { 
			_this.finishedLoadingLevels = true; 
			// max number of levels found
			gameConfig.world.maxLevels = gameConfig.graphics.levels.length;
			// check to see if everything has loaded into memory and then proceed to bootstrap the game
			_this.loadingCompleted() ;
		};
		// activate the script tag by adding it to the DOM
		try {
	        document.body.appendChild(scriptTag);
		}
		catch(err){
			alert(1);
		}
	}


	/*
	// Draw a section of a spriteSheet to a gamecell sized destination x and y 
	// to a graphics context provided.
	*/
	this.draw = 
	function (destinationCtx, spriteSheetName, sx, sy, sw, sh, dx, dy, dw, dh) {
		// bitblt the section of the sprite sheet down on to the graphics context
		destinationCtx.drawImage(
						this.imageArray[spriteSheetName].imageObj, 
						sx, sy, sw, sh, 
						dx, dy, dw, dh);
	}


	/*
	// Draw a section of a spriteSheet to a gamecell sized destination x and y 
	// to a graphics context provided.
	*/
	this.drawToXY =
	function (destinationCtx, spriteSheetName, spriteSheetIndex, dx, dy, dw, dh) {
		
		// each image has its own frame width and height, normally this would be the tileWidth and Height
		// but it does not have to conform to those dimensions
		if (!this.imageArray[spriteSheetName]) {
			alert("Could not find the spriteSheet " + spriteSheetName);
		}
		var w = this.imageArray[spriteSheetName].frameWidth;  
		var h = this.imageArray[spriteSheetName].frameHeight; 

		// how many rows and columns in this sheet?
		var columns = this.imageArray[spriteSheetName].imageObj.width / w;
		var rows = this.imageArray[spriteSheetName].imageObj.height / h;

		// row and column for this sprite index		
		var c = spriteSheetIndex % columns;
		var r = parseInt(spriteSheetIndex / columns);

		// from this derive the source x and y to copy the frame from
		var sx = c * w;
		var sy = r * h;

		// sanity check for optional last 2 variables
		if (!dw)
			dw = w;

		if (!dh)
			dh = h;

		// bitblt the section of the sprite sheet down on to the graphics context
		this.draw(
			destinationCtx,
			spriteSheetName, 
			sx, sy, w, h, 
			dx, dy, dw, dh);
	}

	this.drawToXYScaled = 
	function (destinationCtx, spriteSheetName, spriteSheetIndex, dx, dy, scalingPercentage, centered) {
		
		// each image has its own frame width and height, normally this would be the tileWidth and Height
		// but it does not have to conform to those dimensions
		var w = this.imageArray[spriteSheetName].frameWidth;  
		var h = this.imageArray[spriteSheetName].frameHeight; 

		// how many rows and columns in this sheet?
		var columns = this.imageArray[spriteSheetName].imageObj.width / w;
		var rows = this.imageArray[spriteSheetName].imageObj.height / h;

		// row and column for this sprite index		
		var c = spriteSheetIndex % columns;
		var r = parseInt(spriteSheetIndex / columns);

		// from this derive the source x and y to copy the frame from
		var sx = c * w;
		var sy = r * h;

		// sanity check for optional last variables
		if (!scalingPercentage)
			scalingPercentage = 100;


		var dw = parseInt(this.imageArray[spriteSheetName].frameWidth / 100 * scalingPercentage);
		var dh = parseInt(this.imageArray[spriteSheetName].frameHeight / 100 * scalingPercentage);

		// if we want it centered then make it so
		if (centered) {
			dx -= dw / 2;
			dy -= dh / 2;
		}


		// bitblt the section of the sprite sheet down on to the graphics context
		this.draw(
			destinationCtx,
			spriteSheetName, 
			sx, sy, w, h, 
			dx, dy, dw, dh);

		// return the rectangle area 
		return new Rect(dx, dy, dw, dh);
	}

	/*
	// Draw a background image into the game context
	// special edge case the backgrounds have a naming convention, see below
	*/
	this.drawBackground = 
	function (destinationCtx, levelIndex, backgroundLeft, backgroundTop) {

		// scale the background image appropriately
		var imageName = "level" + levelIndex + "_background";
		var w = gameConfig.world.width;
		var h = gameConfig.world.height;

		if (!this.imageArray[imageName])
			imageName = "level0_background";

		var imageObj = this.imageArray[imageName].imageObj;

		if (imageObj.width > gameConfig.world.width)
			w = imageObj.width;

		if (imageObj.height > gameConfig.world.height)
			h = imageObj.height;

		this.draw(
			destinationCtx,
			imageName, 
			0, 0, gameConfig.world.width, gameConfig.world.height, 
			backgroundLeft, backgroundTop, w, h);
	}


	/*
	// Private function When all images are loaded, the main function of the system is called.
	*/
	this.loadingCompleted = 
	function () {
		if (this.imagesLoaded == gameConfig.graphics.images.length && this.finishedLoadingLevels)  {
			var _this = this;
			setTimeout(function() { _this.finished(); }, 10);
		}
	}

	this.finished =
	function () {
		// assign the number of frames per spritesheet
		for(var i = 0; i < this.imageArray.length; i++) {
			var name = this.imageArray[i];
			var r = this.imageArray[name].imageObj.height / this.imageArray[name].frameHeight;
			var c = this.imageArray[name].imageObj.width / this.imageArray[name].frameWidth;
			this.imageArray[name].maxFrames = c * r;

		}
		main();
	}

	// populate the asset manager
	this.loadImages();
	this.loadLevels();

}

