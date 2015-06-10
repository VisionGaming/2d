
// global utils object
var utils = new Utils();
function vv(v, d) {
	return utils.validateVariable(v, d);
}

/*
// A bunch of useful routines
*/
function Utils() {
	/*
	// sleep helper function
	*/
	this.sleep = sleep;
	function sleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds) {
				break;
			}
		}
	}

	// validate the variable , to avoid NaNs from undefines
	this.validateVariable = function(variable, defaultvalue) {
		return (variable != undefined)?variable:defaultvalue;
	}

	// save object to file
	this.putDataToLocalStorage = function(tag, myObject) {
		localStorage.setItem(tag, JSON.stringify(myObject));
	}

	// save object to file
	this.getDataFromLocalStorage = function(tag) {
		return JSON.parse(localStorage.getItem(tag));
	}

	this.parseBoolean = 
	function(value) {
		var s = "" + value;
		s = s.toLowerCase();
		return (s == 'true')?true:false;
	}

}

/*
// The rectangle object
*/
function Rect(x, y, w, h) {
	this.x1 = x;
	this.w = w;
	this.x2 = x + w;
	this.y1 = y;
	this.h = h;
	this.y2 = y + h;
	// an empty border around the drawing area
	this.padding = 0;

	this.pointIsIn = PointIsIn;
	function PointIsIn(sx, sy) {
		if ((sx >= this.x1 && sx <= this.x2) && (sy >=this.y1 && sy <= this.y2)) 
			return true;
		else
			return false;
	}

	this.xIsIn = XIsIn;
	function XIsIn(sx) {
		if (sx >= this.x1 && sx <= this.x2) 
			return true;
		else
			return false;
	}

	this.yIsIn = YIsIn;
	function YIsIn(sy) {
		if (sy >= this.y1 && sy <= this.y2) 
			return true;
		else
			return false;
	}

	// flood fill the rectangle
	this.fill = Fill;
	function Fill(ctx, fillStyle) {
	    // Track area
		ctx.fillStyle = fillStyle;
		ctx.fillRect(this.x1 + this.padding, this.y1 + this.padding, this.w - (this.padding * 2), this.h - (this.padding * 2));
	}

	this.clear = ClearRect;
	function ClearRect(ctx) {
	    ctx.clearRect(this.x1, this.y1 ,this.w ,this.h);
	}

	// draw a border
	this.border = Border;
	function Border(ctx, strokeStyle, lineWidth) {
	    ctx.beginPath();
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		ctx.fillStyle = "";
		ctx.rect(this.x1 + this.padding, this.y1 + this.padding, this.w - (this.padding * 2), this.h - (this.padding * 2));
		ctx.stroke();		
	}

	this.triangleFill = TriangleFill;
	function TriangleFill(ctx, facing, fillstyle) {
	    ctx.beginPath();
	    ctx.fillStyle = fillstyle;

	    // north facing triangle
	    if (facing == "north") {
		    ctx.moveTo(this.x1 + (this.w / 2), this.y1 + this.padding);
		    ctx.lineTo(this.x1 + this.padding, this.y2 - this.padding);
		    ctx.lineTo(this.x2 - this.padding, this.y2 - this.padding);
		    //this.border(ctx, "blue", 1);
		}
		else
		// south facing triangle
		if (facing == "south") {
			//this.border(ctx, "red", 1);
		    ctx.moveTo(this.x1 + this.padding, this.y1 + this.padding);
		    ctx.lineTo(this.x1 + (this.w / 2), this.y2 - this.padding);
		    ctx.lineTo(this.x2 - this.padding, this.y1 + this.padding);
		}
		else
		// west facing triangle
		if (facing == "west") {
			//this.border(ctx, "red", 1);
		    ctx.moveTo(this.x2 - this.padding, this.y1 + this.padding);
		    ctx.lineTo(this.x1 + this.padding, (this.h / 2));
		    ctx.lineTo(this.x2 - this.padding, this.y2 - this.padding);
		}
		else
		// east facing triangle
		if (facing == "east") {
			//this.border(ctx, "red", 1);
		    ctx.moveTo(this.x1 + this.padding, this.y1 + this.padding);
		    ctx.lineTo(this.x2 - this.padding, (this.h / 2));
		    ctx.lineTo(this.x1 + this.padding, this.y2 - this.padding);
		}

		ctx.stroke();
	    ctx.fill();

	}

	// collision detection engine
	// does this rectangle overlap with another
	this.collidesWith = CollidesWith;
	function CollidesWith(rect2) {
		return !((this.y2 < rect2.y1) ||     //(Rect1.Bottom < Rect2.Top) OR
				 (this.y1 > rect2.y2) ||     //(Rect1.Top > Rect2.Bottom) OR
			     (this.x1 > rect2.x2) ||     //(Rect1.Left > Rect2.Right) OR
				 (this.x2 < rect2.x1));      //(Rect1.Right < Rect2.Left) )
	}
}
