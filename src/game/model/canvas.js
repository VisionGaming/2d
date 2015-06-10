
// Canvas object, creates an object that you can draw on
function Canvas(id, left, top, width, height, hidden) {

	// assign the canvas id
	this.id = id;

	// rectangle relative to the top cornver of our canvas element
	this.clientRect = new Rect(0, 0, width, height);
	
	// other handy coordinates
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;

	// creates a canvas DOM element and returns its graphics context
	this.createCanvas = 
	function (id, left, top, width, height, hidden) {
		// create the canvas div
		var newdiv = document.createElement('canvas'); 

		// the canvas names simply increment from 0
		newdiv.id = id;
		newdiv.style.left = left + "px";
		newdiv.style.top = top + "px";
		newdiv.width = width;
		newdiv.height = height;
		newdiv.style.border = "0px solid;";
		newdiv.style.position = "absolute";

		// is thia is to be a hidden canvas then make it so
		if (hidden)
			newdiv.style.display = "none";

		// add to the DOM
		document.body.appendChild(newdiv);
	}

	// return the graphics context for this canvas
	this.getContext = 
	function () {
		var c = document.getElementById(this.id);
		var ctx = c.getContext('2d');
		return ctx;
	}

	// return the actual html canvas element of this object
	this.getCanvasObject = 
	function () {
		return document.getElementById(this.id);
	}

		// set the element visible or not
	this.setVisible = 
	function (trueOrFalse) {
		var o = this.getCanvasObject();
		o.style.display = trueOrFalse?"":"none";
	}

	this.clear =
	function () {
		var co = this.getCanvasObject();
		co.width = co.width;
	}

	this.move =
	function (left, top, width, height) {
		var thisDiv = this.getCanvasObject();
		thisDiv.style.left = left + "px";
		thisDiv.style.top = top + "px";
		thisDiv.width = width;
		thisDiv.height = height;		
		// set the module level properties
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
	}
	
	// kick off the creation of the object 
	this.createCanvas(id, left, top, width, height, hidden);
}