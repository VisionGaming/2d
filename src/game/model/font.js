var fontObject = null; //new Font();

function Font() {
	this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\"!?@#$%&*{(\/|\\)} ";
	this.fontName = "alphanumerics";

	/*
	// Draw a message onto a context
	*/
	this.draw = Draw;
	function Draw(ctx, message, x, y, sizePercentage) {
		var font = assetManager.imageArray[this.fontName];
		var dx = x;
		var dy = y;
		var dw = parseInt(font.frameWidth / 100 * sizePercentage);
		var dh = parseInt(font.frameHeight / 100 * sizePercentage);

		sizePercentage

		for (var i = 0; i < message.length; i++) {
  			var spriteSheetIndex = this.chars.indexOf(message[i]);
  			assetManager.drawToXY(ctx, this.fontName, spriteSheetIndex, dx, dy, dw, dh);
  			dx += dw;
		}
	}

}