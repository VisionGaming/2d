
// points object that lets text rise 
function RisingText(x, y, text) {

	this.text = text;
	this.x = x;
	this.y = y;
	this.framesShown = 0;
	this.finished = false;

	this.draw = 
	function (ctx) {
	// show the points gathered
		if (!this.finished) {
			ctx.font = "16px Verdana";
			var gradient = ctx.createLinearGradient(0, 0, 10, 0);
			gradient.addColorStop("0","yellow");
			gradient.addColorStop("0.5","blue");
			gradient.addColorStop("1.0","white");

			// Fill with gradient
			ctx.strokeStyle =gradient;							
			ctx.strokeText(this.text, 
				this.x,
				this.y - (this.framesShown * 2));

			// max number of frames to show points from an object or bad guy
			this.framesShown++;
			// have we run out of frames?
			if (this.framesShown >= gameConfig.world.maxFramesToShowPoints) {
				this.finished = true;
			}
		}
	}

}