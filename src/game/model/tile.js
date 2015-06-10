

function Tile(tileGraphicsNumber, gameWorldColumn, gameWorldRow, isSolid, isDeath) {

	this.row = gameWorldRow;
	this.column = gameWorldColumn;
	this.isSolid = isSolid;
	this.isDeath = isDeath;
	this.requiredSpecialPower = ""; //e.g. snorkle
	this.withoutSpecialPowerIsDeath = false;

	/*
	// Draw the tile onto the world at its row and column
	*/
	this.draw = Draw;
	function Draw() {
		var canvas = new Canvas(id, 0, 0, gameConfig.world.tileWidth, gameConfig.world.tileHeight, true);
		var ctx = canvas.getContext();
		ctx.drawImage(assetManager.tileArray[tileGraphicsNumber], 
				0, 0,                                      // sx, sy
				gameConfig.world.tileWidth,                // sw
				gameConfig.world.tileHeight,               // sh
				gameConfig.world.math.getContextXFromColumn(this.column), // gameWorldX * gameConfig.world.tileWidth,   // dx
				gameConfig.world.math.getContextYFromRow(this.row),       //gameWorldY * gameConfig.world.tileHeight,  // dy
				gameConfig.world.tileWidth,                // dw
				gameConfig.world.tileHeight);              // dh
	}

}

