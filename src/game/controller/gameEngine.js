

// You always get one GameEngine object by default
var gameEngine =  null;//new GameEngine();


/*
// Game engine object
// This is main object that runs the world events
*/
function GameEngine() {

	// the callback for the designer module, this lets the designer draw what ever it wants to the viewport
	this.callbackRenderToViewPort = [];
	// the callback for the designer module, this lets the designer draw what ever it wants to the world context
	this.callbackDrawToWorld = [];
	// call back to anounce viewport shift
	this.callBackViewPortShift = null;

	// array that stores all tile numbers from index of 0.
	this.worldLevel = new WorldLevel();

	//player points
	this.points = 0;

	// objects we need to store about the state of things in the game world go here
	this.backgroundLeft = 0;
	this.backgroundTop = 0;
	this.levelFinished = false;
	this.restartLevel = false;
	// x and y coordinate of the top left corner of the game world
	this.gameViewPortLeft = 0;
	this.gameViewPortTop = 0;

	// heart sprite
	this.heart = new Sprite({
						spriteSheet:"heart",
						frameInterval:3,
						playTimes:-1
					});

	// base canvas is the invisible canvas that we draw the world on
	this.baseCanvas = new Canvas("baseCanvas", 700, 0, gameConfig.world.width, gameConfig.world.height, true);
	
	// the visible onscreen view into the baseCanvas area
	var optimumX = (window.innerWidth - gameConfig.world.width) / 2;
	var optimumY = (window.innerHeight - gameConfig.world.height) / 2; 
	gameConfig.world.viewPortLeft = (optimumX < 0)?0:optimumX;
	gameConfig.world.viewPortTop = (optimumY < 0)?0:optimumY;

	this.viewPortCanvas = new Canvas("viewPortCanvas", 
										gameConfig.world.viewPortLeft, 
										gameConfig.world.viewPortTop, 
										gameConfig.world.viewPortWidth, 
										gameConfig.world.viewPortHeight, 
										false);
	// for use with event handlers
	var _this = this;

	// top level windows keypress event for capturing player movements
	document.addEventListener( "keydown", function(e) { _this.doKeyDown(e); }, false );
	document.addEventListener( "keyup", function(e) { _this.doKeyUp(e); }, false );

	this.gameViewPortLastLeft =  gameConfig.world.width - gameConfig.world.viewPortWidth;
	this.gameViewPortLastTop =  gameConfig.world.height - gameConfig.world.viewPortHeight;


	/* 
	// Erase all graphics from the world grid.
	*/
	this.eraseWorld = EraseWorld;
	function EraseWorld(doDraw) {
		var row = 0
		var column = 0;

		for(var x = 0; x < gameConfig.world.gridColumns; x++) {
			for(var y = 0; y < gameConfig.world.gridRows; y++) {
				tileArrayIndex = y * gameConfig.world.gridRows + x;
				this.worldLevel.tileArray[tileArrayIndex] = -1;
				this.worldLevel.objectArray[tileArrayIndex] = -1;
				this.worldLevel.levelData.man.column = 0;
				this.worldLevel.levelData.man.row = 0;
			}
		}
		if (doDraw) {
			this.drawWorld();
		}
	}

	/* 
	// Erase all graphics from the world grid.
	*/
	this.loadWorld = LoadWorld;
	function LoadWorld(level, doDraw) {
		// if the level does not exist assume a new one and erase the level with -1's
		if (level < gameConfig.graphics.levels.length) {
			this.worldLevel = JSON.parse(JSON.stringify(gameConfig.graphics.levels[level]));
			
			// check for no objects array
			if (!this.worldLevel.levelData.objectArray)
				this.worldLevel.levelData.objectArray = [];
			else {
				for(var i = 0; i < this.worldLevel.levelData.objectArray.length; i++) {
					if (this.worldLevel.levelData.objectArray[i]) {
						var transDex = this.addObjectToWorld(this.worldLevel.levelData.objectArray[i].objectDex, i, false);
						this.worldLevel.levelData.objectArray[i].transDex = transDex;
					}
				}
			}

			// the man deals in pixel coordinated, the world in rows and columns
			playerObj.x = this.worldLevel.levelData.man.column * gameConfig.world.tileWidth;
			playerObj.y = this.worldLevel.levelData.man.row * gameConfig.world.tileHeight;

			// x and y coordinate of the top left corner of the game world
			this.gameViewPortLeft = 0;
			this.gameViewPortTop = 0;
			this.gameViewPortLastLeft =  gameConfig.world.width - gameConfig.world.viewPortWidth;
			this.gameViewPortLastTop =  gameConfig.world.height - gameConfig.world.viewPortHeight;

			if (doDraw) {
				drawWorld();
			}
		}
		else
			this.eraseWorld();

//		this.serializeWorld();
	}

	/*
	// Draw the world onto the base canvas, 
	// the base canvas is the size of the world and is invisible
	// we do this so we can bitblt a viewport (window) sized area onto the viewport (visible) window
	*/
	this.drawWorld = drawWorld;
	function drawWorld() {
		var ctx = this.baseCanvas.getContext();
		ctx.clearRect(0, 0, gameConfig.world.width, gameConfig.world.height);

		var row = 0
		var column = 0;
		var w = gameConfig.world.tileWidth;
		var h = gameConfig.world.tileHeight;

		// background image
		assetManager.drawBackground(ctx, gameConfig.world.currentLevel, this.backgroundLeft, this.backgroundTop);

		// draw the world grid 
		for(var row = 0; row < gameConfig.world.gridRows; row++) {
			for(var column = 0; column < gameConfig.world.gridColumns; column++) {

				var contextX = column * w;
				var contextY = row * h;
				var cellIndex = row * gameConfig.world.gridRows + column;

				if (this.gameTile(cellIndex) != -1) {

					var tileIndex = this.gameTile(cellIndex);
					assetManager.drawToXY(
						ctx, 
						gameConfig.graphics.tiles[tileIndex].spriteSheet,
						gameConfig.graphics.tiles[tileIndex].spriteSheetIndex,
						contextX, contextY);

/*						ctx.font = '12pt Calibri';
						ctx.fillStyle = 'white';
						ctx.fillText("" + this.gameTile(cellIndex), contextX + 32, contextY + 32);
*/				}

				// Draw objects and handle their states
				// the index of the transitional state object is held in the objectArray
				//if (this.worldLevel.objectArray != null && cellIndex < this.worldLevel.objectArray.length) {
			}
		}
		for(var row = 0; row < gameConfig.world.gridRows; row++) {
			for(var column = 0; column < gameConfig.world.gridColumns; column++) {

				var contextX = column * w;
				var contextY = row * h;
				var cellIndex = row * gameConfig.world.gridRows + column;
				gameObjects.draw(ctx, cellIndex, contextX, contextY);
			}
		}
	

		// move the platforms
		platformObj.draw(ctx);
		// Move the player
		playerObj.drawOnGameContext(ctx);
		// move and draw baddies
		baddieObj.draw(ctx);
		// move and draw spawn
		gameSpawn.draw(ctx);

		// if we are in edit mode draw the grid, good for starting out with a new level
		if (gameConfig.editMode && gameConfig.drawGrid) {

			// just draw a simple rectangle to represent the next cell
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "black";
			ctx.rect(contextX, contextY, w, h);
			ctx.stroke();

			ctx.font = "12px Arial";
			ctx.strokeText("" + (row * gameConfig.world.gridColumns + column), contextX + 5, contextY + 15);
		}

		// any other objects that need to draw on the world area can do it by appending a callback 
		if (this.callbackDrawToWorld.length > 0) {
			for (var i = 0; i < this.callbackDrawToWorld.length; i++) {
				this.callbackDrawToWorld[i](ctxViewPort);
			}
		}
		
	}


	/*
	//  bitblt the visible area of the baseCanvas onto the viewPortCanvas
	//  this is the grunt that throws the rendered world onto the viewport graphics context
	*/
	this.renderWorldToViewport = renderWorldToViewport;
	function renderWorldToViewport() {
		// graphics context of the baseCanvas - where we draw the world and all its bits
		var canvasObj = this.baseCanvas.getCanvasObject();
		// graphics context of the viewport, what is rendered visible to the user
		var ctxViewPort = this.viewPortCanvas.getContext();
		// bitblit
		
		var sx = this.gameViewPortLeft;
		var sy = this.gameViewPortTop;
		var sWidth = gameConfig.world.viewPortWidth;
		var sHeight = gameConfig.world.viewPortHeight;
		var dx = 0;
		var dy = 0;
		var dWidth = gameConfig.world.viewPortWidth;
		var dHeight = gameConfig.world.viewPortHeight;

		ctxViewPort.clearRect(0, 0, dWidth, dHeight);
		ctxViewPort.drawImage(canvasObj, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

		//Score board
		var r = new Rect(0, 0, gameConfig.world.viewPortWidth, 32);
		r.fill(ctxViewPort, "black");
		r.border(ctxViewPort, "grey", 2);
		r.padding = 3;
		r.border(ctxViewPort, "white", 2);
		var p = parseInt(100 / gameConfig.world.playerHealthPoints  * playerObj.healthPoints);
		if (p > 0) {
			var hw = 200;
			r = new Rect(42, 0, hw , 32);
			r.border(ctxViewPort, "grey", 2);
			r.padding = 3;
			r.border(ctxViewPort, "white", 2);
			r.padding = 10;
			r.fill(ctxViewPort, "red");

			r = new Rect(42, 0, hw / 100 * p , 32);
			r.padding = 10;
			r.fill(ctxViewPort, "green");
		}

		this.heart.draw(ctxViewPort, 0, 0, 70);

		var startX = 250;
		fontObject.draw(ctxViewPort, "Score " + pad(this.points, 6), startX + 18, 8, 50);

		// draw the players power onto the scoreboard
		startX = 465;
		var n = 0;
		for (var i = 0; i < playerObj.powers.length; i++) {
			var power = playerObj.powers[i];
			if (!playerObj.powers[power]) {
				power = power;
			}
			if (playerObj.powers[power].count > 0) {
				var object = gameConfig.graphics.objects[power];

				if (object.powerIncrement) {
					var centerX = startX + 38 + (n * gameConfig.world.powerItemSize);
					var centerY = 30;
					var radius = 25;

					ctxViewPort.beginPath();
					ctxViewPort.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
					ctxViewPort.fillStyle = 'black';
					ctxViewPort.fill();
					ctxViewPort.lineWidth = 5;
					ctxViewPort.strokeStyle = 'grey';
					ctxViewPort.stroke();
					ctxViewPort.lineWidth = 2;
					ctxViewPort.strokeStyle = 'white';
					ctxViewPort.stroke();
					fontObject.draw(ctxViewPort, pad(playerObj.powers[power].count, 2), startX + 25 + (n * gameConfig.world.powerItemSize), 23, 50);
					n++;
				}
				assetManager.drawToXY(ctxViewPort, object.spriteSheet, 0, startX + (n * gameConfig.world.powerItemSize), 0, gameConfig.world.powerItemSize, gameConfig.world.powerItemSize);
				n++;
			}


		}

		// callback for anything that wants to render itself on the viewport (designer hook)
		if (this.callbackRenderToViewPort.length > 0) {
			for (var i = 0; i < this.callbackRenderToViewPort.length; i++) {
				this.callbackRenderToViewPort[i](ctxViewPort);
			}
		}

		// debugging code, for showing state of keypress
/*		var str = "";
		for (var j = 0; j < gameConfig.world.key_mapping.length; j++) {
			str += " " + gameConfig.world.key_mapping[j].action + "/" + utils.validateVariable(gameConfig.world.key_mapping[j]["keyDown"], false);
		}
		fontObject.draw(ctxViewPort, str, 600, 8, 50);
*/

	}


	function pad(num, size) {
	    var s = "000000000" + num;
	    return s.substr(s.length-size);
	}

	this.addTileToWorld = AddTileToWorld;
	function AddTileToWorld(tileNumber, worldCellNumber, doRefresh) {
		this.worldLevel.levelData.tileArray[worldCellNumber] = tileNumber;
		// refresh only if required
		if (doRefresh) {
			gameEngine.drawWorld();
			gameEngine.renderWorldToViewport();		
		}
	}


	this.addObjectToWorld = AddObjectToWorld;
	function AddObjectToWorld(objectNumber, worldCellNumber, doRefresh) {
		// we add objects to the transient array
		if (objectNumber == -1) {
			this.worldLevel.levelData.objectArray[worldCellNumber] = null;
		}
		else {
			gameObjects.transInfo.push(new ObjectTransientInformation(objectNumber));
			// we add the transient array index to the world grid for quick access from game play
			this.worldLevel.levelData.objectArray[worldCellNumber] = {
				objectDex: objectNumber,
				transDex: gameObjects.transInfo.length - 1
			}

			// refresh only if required
			if (doRefresh) {
				gameEngine.drawWorld();
				gameEngine.renderWorldToViewport();		
			}
				
		}
		return gameObjects.transInfo.length - 1;
	}





	// key was raised
	this.doKeyUp = 
	function (event) {
		e = window.event;
		if (!e)  {
			e = event;
		}

		// loop through all the keystroke to action mappings
		var count = 0;
	    for (var i = 0; i < gameConfig.world.key_mapping.length; i++) {
	    	// one at a time
	    	var keyMap = gameConfig.world.key_mapping[i];
	    	// check to se if it was clicked
	    	if (keyMap.keyAscii == e.keyCode) {
	    		// keep state on this keystroke
	    		keyMap["keyDown"] = false;
	    		// if not keys are down stop the player
	    		count = 0;
	    		for (var j = 0; j < gameConfig.world.key_mapping.length; j++) {
	    			// count how many keys are not down
	    			if (utils.validateVariable(gameConfig.world.key_mapping[j].keyDown, false) == false)
	    				count++;
	    		}
	    		// if not keys are down then stop the player
	    		if (gameConfig.world.key_mapping.length == count)
					playerObj.doAction("still");

	    		// take care of the other things
		        e.preventDefault();
		        // redraw
		    	this.drawGrid = true;
	    	}   
	    }
	}


	// key was pressed
	this.doKeyDown =
	function (event) {
		e = window.event;
		if (!e)  {
			e = event;
		}

		// loop through all the keystroke to action mappings
	    for (var i = 0; i < gameConfig.world.key_mapping.length; i++) {
	    	// one at a time
	    	var keyMap = gameConfig.world.key_mapping[i];
	    	// check to se if it was clicked
	    	if (keyMap.keyAscii == e.keyCode) {
	    		// found the action to take, so take it
	    		var action = keyMap.action;
	    		var subaction = keyMap.subaction;

	    		if (action)
		    		playerObj.doAction(action);

	    		if (subaction)
		    		playerObj.doSubaction(subaction);

	    		// keep state on this keystroke
	    		keyMap["keyDown"] = true;
	    		// take care of the other things
		    	this.drawGrid = false;
		        e.preventDefault();
	    	}   
	    }
	}

	this.running = false;
	this.stopped = false;
	this.stopCallBack = null;

	this.startRun = 
	function () {
		this.running = true;
		this.runGame();
	}

	// stop the game callback when stopped
	this.stopRun = 
	function(callBack) {
		this.stopCallBack = callBack;
		this.running = false;
	}


	this.runGame =
	function () {
		this.stopped = false;
		this.drawWorld();
		playerObj.shiftViewPort();
		this.renderWorldToViewport();
		// check to see if we have finished the level
		if (this.levelFinished) {
			gameConfig.world.currentLevel++;
			if (gameConfig.graphics.levels == gameConfig.world.currentLevel) {
				//todo: something better!
				alert("game finished! you won!");
			}
			else {
				this.loadCurrentLevel();
			}
		}
		else
		if(this.restartLevel) {
			this.loadCurrentLevel();
		}

		if (this.running) {
			var _this = this;
			setTimeout( function () { _this.runGame(); }, gameConfig.world.frameInterval);
		}
		else {
			this.stopped = true;
			// Callback if finished
			if (this.stopCallBack != null) {
				this.stopCallBack();
			}
		}
	}

	this.loadCurrentLevel = 
	function () {
		this.restartLevel = false;
		this.levelFinished = false;
		baddieObj = new Baddies();
		platformObj = new Platforms();
		gameSpawn = new Spawn();
		playerObj = new Player();
		this.backgroundLeft = 0;
		this.backgroundTop = 0;
		this.loadWorld(gameConfig.world.currentLevel, false);
	}


	this.tileAtPixelCoordinateIsSolid = 
	function (x, y) {
		var retVal = false;
		// test to see if a world tile was hit
		var c = parseInt(x / gameConfig.world.tileWidth);
		var r = parseInt(y / gameConfig.world.tileHeight);
		cellNumber = r * gameConfig.world.gridColumns + c;
		// look up the tile index in the game level
		var worldTileIndex = this.gameTile(cellNumber);
		// if its not empty
		if (worldTileIndex != -1) {
			// look into the tile object itself
			var tileObj = gameConfig.graphics.tiles[worldTileIndex];
			// if its a solid, then 100% blocked
			if (tileObj.isSolid) {
				retVal = true;
			}
		}
		return retVal;
	}

	this.gameTile =
	function (cellIndex) {
		return utils.validateVariable(this.worldLevel.levelData.tileArray[cellIndex], -1);
	}

	// initialisation load the world.
	//this.loadCurrentLevel();
}


