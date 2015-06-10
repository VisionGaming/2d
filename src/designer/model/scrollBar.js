
/*
// Vertical scrollbar object
*/
function VScrollBar(left, top, height, contentSize, windowSize, smallIncrement, callbackSetWindowPosition) {
	
	// create a canvas object for our designer to sit on
	this.width = 25;
	this.height = height;
	this.canvas = new Canvas("scrollbar" + (maxScrollBars++), left, top, this.width, height, false);
	this.buttonSize = 20;
	this.callbackSetWindowPosition = callbackSetWindowPosition;
	this.setWindowPosition = SetWindowPosition;

	// top arrow button
	this.rectTopButton = new Rect(0, 0, this.width, this.buttonSize);
	this.rectTopButton.padding = 5;

	// bottom arrow button
	this.rectBottomButton = new Rect(0, height - this.buttonSize, this.width, this.buttonSize);
	this.rectBottomButton.padding = 5;

	// The math object thats takes care of everything scrollbar
	this.scrollMath = new ScrollMath(height, contentSize, windowSize, this.buttonSize, smallIncrement);

	// Scrollevents object, handles all events for a scrollbar
	var _this = this;
	this.scrollEvents = new ScrollEvents(
		this.canvas,
		this.rectTopButton, 
		this.rectBottomButton, 
		this.scrollMath,
		function () { return _this.getGripRectangle(); },
		function () { return _this.getAboveGripRectangle(); },
		function (windowPosition) { _this.setWindowPosition(windowPosition); }
		);


	/*
	// We intercept the set window position on the way through so we can redraw ourself
	*/
	function SetWindowPosition(windowPosition) {
		this.callbackSetWindowPosition(windowPosition);
		this.draw();
	}

	/*
	// Draw the vertical scrollbar
	*/
	this.draw = Draw;
	function Draw() {
		// recaulculate all my stuff
		this.scrollMath.calculateScrollMath();

		var ctx = this.canvas.getContext();
		// fill the scrollbar rectangle
		this.canvas.clientRect.fill(ctx, "rgb(250, 250, 250)");
		// put a black border around it
		this.canvas.clientRect.border(ctx, "black", 1);
		// draw the top triangle
		this.rectTopButton.triangleFill(ctx, "north", "black");
		// draw the bottom triangle
		this.rectBottomButton.triangleFill(ctx, "south", "black");
	    // draw Track area
	    var r = this.getGripRectangle();
	    r.fill(ctx, "rgb(100, 100, 100)");
	}

	/*
	// return a rectangle the represents the grip area, 
	// this changes dynamically with user input, this is used for mouse collision detection
	*/
	this.getGripRectangle = GetGripRectangle;
	function GetGripRectangle() {
		var r = new Rect(0, this.scrollMath.gripPositionOnTrack + this.buttonSize, this.width,  this.scrollMath.gripSize);
		r.padding = 3;
		return r;
	}

	/*
	// return a rectangle the represents the area between the top or left arrow and the grip area, 
	// this changes dynamically with user input, this is used for mouse collision detection
	*/
	this.getAboveGripRectangle = AboveGripRectangle;
	function AboveGripRectangle() {
		var r = new Rect(0, this.rectTopButton.y2,  this.width,  this.scrollMath.gripPositionOnTrack - 1);
		return r;
	}

	// draw myself
	this.draw();
}

/*
// Horizontal scrollbar object
*/
function HScrollBar(left, top, width, contentSize, windowSize, smallIncrement, callbackSetWindowPosition) {
	this.width = width;
	this.height = 25;
	this.buttonSize = 20;
	this.callbackSetWindowPosition = callbackSetWindowPosition;
	this.setWindowPosition = SetWindowPosition;
	// create a canvas object for our scrollbar to sit on
	this.canvas = new Canvas("scrollbar" + (maxScrollBars++), left, top, width, this.height, false);

	// top arrow button
	this.rectTopButton = new Rect(0, 0, this.buttonSize, this.height);
	this.rectTopButton.padding = 5;

	// bottom arrow button
	this.rectBottomButton = new Rect(width - this.buttonSize, 0, this.buttonSize, this.height);
	this.rectBottomButton.padding = 5;

	// The math object thats takes care of everything scrollbar
	this.scrollMath = new ScrollMath(width, contentSize, windowSize, this.buttonSize, smallIncrement);

	// Scrollevents object, handles all events for a scrollbar
	var _this = this;
	this.scrollEvents = new ScrollEvents(
		this.canvas,
		this.rectTopButton, 
		this.rectBottomButton, 
		this.scrollMath,
		function () { return _this.getGripRectangle(); },
		function () { return _this.getAboveGripRectangle(); },
		function (windowPosition) { _this.setWindowPosition(windowPosition); }
		);


	/*
	// We intercept the set window position on the way back down to the parent so we can redraw ourself
	*/
	function SetWindowPosition(windowPosition) {
		this.callbackSetWindowPosition(windowPosition);
		this.draw();
	}


	/*
	// Fancy scrollbar graphics
	// calling Draw refreshes all elements of the scrollbar, sex it up in here
	*/
	this.draw = Draw;
	function Draw() {
		// recaulculate all my stuff
		this.scrollMath.calculateScrollMath();

		var ctx = this.canvas.getContext();
		// fill the scrollbar rectangle
		this.canvas.clientRect.fill(ctx, "rgb(250, 250, 250)");
		// put a black border around it
		this.canvas.clientRect.border(ctx, "black", 1);
		// draw the top triangle
		this.rectTopButton.triangleFill(ctx, "west", "black");
		// draw the bottom triangle
		this.rectBottomButton.triangleFill(ctx, "east", "black");
	    // draw Track area
	    var r = this.getGripRectangle();
	    r.fill(ctx, "rgb(100, 100, 100)");
	}

	/*
	// return a rectangle the represents the grip area, 
	// this changes dynamically with user input, this is used for mouse collision detection
	*/
	this.getGripRectangle = GetGripRectangle;
	function GetGripRectangle() {
		var r = new Rect(this.scrollMath.gripPositionOnTrack + this.buttonSize, 0, this.scrollMath.gripSize, this.height);
		r.padding = 3;
		return r;
	}

	/*
	// return a rectangle the represents the area between the top or left arrow and the grip area, 
	// this changes dynamically with user input, this is used for mouse collision detection
	*/
	this.getAboveGripRectangle = AboveGripRectangle;
	function AboveGripRectangle() {
		var r = new Rect(this.rectTopButton.x2,  0, this.scrollMath.gripPositionOnTrack - 1, this.height);
		return r;
	}

	// draw myself
	this.draw();
}


/*
	////////////////////////////////////////////////////////////////////////
	Scrollbar Helper Objects
	////////////////////////////////////////////////////////////////////////
*/

var maxScrollBars = 0;

/*
// Scroll math object takes care of all the fiddly math involved in a scrollbar
*/
function ScrollMath(sizeOfScrollBar, contentSize, windowSize, buttonSize, smallIncrement) {
	// Determine how large the content is, and how big our window is
	this.contentSize = contentSize; 
	// Viewport size
	this.windowSize = windowSize; 
	// size of our arrow head buttons
	this.buttonSize = buttonSize;
	// The position of our window in accordance to its top on the content. The top of the window over the content.
	this.sizeOfScrollBar = sizeOfScrollBar;
	// the amount to move when an arrow head button is pressed
	this.smallIncrement = smallIncrement;

	// every other variable we need to keep track of
	this.windowPosition = 0; 
	this.trackSize = 0;
	this.windowContentRatio = 0;
	this.gripSize =  0;
	this.minimalGripSize = 20;
	this.gripSize = this.minimalGripSize;
	this.maximumGripSize = 0;
	this.windowScrollAreaSize = 0;
	this.windowPositionRatio = 0;
	this.trackScrollAreaSize = 0;
	this.gripPositionOnTrack = 0;

	this.calculateScrollMath = 	CalculateScrollMath;
	function CalculateScrollMath() {
		//Determine how large our track is
		this.trackSize = this.sizeOfScrollBar - (this.buttonSize * 2);
		// Divide the window size by the content size to get a ratio
		this.windowContentRatio = this.windowSize / this.contentSize; // ratio is 100 / 400 which is 1 / 4 which is 0.25
		// Multiply the trackSize by the ratio to determine how large our grip will be
		this.gripSize = this.trackSize * this.windowContentRatio; //grip size is 80 * 0.25 which is 20
		// If the grip is too small, set it so that it is at our predetermined minimal size!
		if (this.gripSize < this.minimalGripSize)
			this.gripSize = this.minimalGripSize;
		// The minimal size of our grip
		var maximumGripSize = this.trackSize;
		// If the grip is too large, set it so that it is at our maximum size!
		if (this.gripSize > maximumGripSize)
			this.gripSize = maximumGripSize;
    	// Determine the distance that the window can scroll over
		this.windowScrollAreaSize = this.contentSize - this.windowSize; 
  	    // The ratio of the window to the scrollable area.
		this.windowPositionRatio = this.windowPosition / this.windowScrollAreaSize; //100 / 300 is 1 / 3 which is 0.333_
		// Just like we did for the window
		// we do this to keep the grip from flying off from the end of the track.
		this.trackScrollAreaSize = this.trackSize - this.gripSize; //80 - 20 which is 60
		// Determine the location by multiplying the ratio
		this.gripPositionOnTrack = this.trackScrollAreaSize * this.windowPositionRatio; //60 * 0.333_ is 20
	}

	/*
	// Process the up arrow math
	*/
	this.doArrowUp = DoArrowUp;
	function DoArrowUp() {
		this.windowPosition = this.windowPosition - this.smallIncrement;
		if(this.windowPosition < 0)
			this.windowPosition = 0;		
	}

	/*
	// Process the down arrow math
	*/
	this.doArrowDown = DoArrowDown;
	function DoArrowDown() {
		this.windowPosition = this.windowPosition + this.smallIncrement;
		if(this.windowPosition > this.windowScrollAreaSize)
			this.windowPosition = this.windowScrollAreaSize;
	}

	/*
	// Process the page up math
	*/
	this.doPageUp = DoPageUp;
	function DoPageUp() {
		this.windowPosition = this.windowPosition - this.windowSize;
		if(this.windowPosition < 0)
			this.windowPosition = 0;
	}

	/*
	// Process the page down math
	*/
	this.doPageDown = DoPageDown;
	function DoPageDown() {
		this.windowPosition = this.windowPosition + this.windowSize;
		if(this.windowPosition > this.windowScrollAreaSize)
			this.windowPosition = this.windowScrollAreaSize;
	}

	/*
	// Process the grip dragging math
	*/
	this.doDragGrip = DoDragGrip;
	function DoDragGrip(oldPosition, newPosition) {
		var mousePositionDelta = newPosition - oldPosition;
	 
		// Determine the new location of the grip
		var newGripPosition = this.gripPositionOnTrack + mousePositionDelta;
		 
		// Limit the grip so that it is not flying off the track
		if(newGripPosition < 0)
			newGripPosition = 0;

		if(newGripPosition > this.trackScrollAreaSize)
			newGripPosition = this.trackScrollAreaSize;
		 
		//Now we use the same algorithm we used in the windowPositionRatio, for the grip and track
		var newGripPositionRatio = newGripPosition / this.trackScrollAreaSize;
		 
		// and we apply it in the same way as we did to determine the grips location
		// but to the window instead
		this.windowPosition = newGripPositionRatio * this.windowScrollAreaSize;
		this.gripPositionOnTrack = newGripPosition;
	}


}

/*
// ScrollEvents Object handles all mouse events of a scrollbar 
*/
function ScrollEvents(
						canvasObject, 
						rectTopButton, 
						rectBottomButton, 
						scrollMath,
						callbackGetGripRectangle, 
						callbackGetAboveGripRectangle, 
						callbackSetWindowPosition) {

	this.rectTopButton = rectTopButton;
	this.rectBottomButton = rectBottomButton;
	this.scrollMath = scrollMath;
	// callbacks are used to derive the rectangle areas of the grip and above the grip areas
	this.callbackGetGripRectangle = callbackGetGripRectangle;
	this.callbackGetAboveGripRectangle = callbackGetAboveGripRectangle;
	// callback is used to set the window position on the caller
	this.callbackSetWindowPosition = callbackSetWindowPosition;
	// we need to know about the canvas details, size and DOM element to sink our events
	this.canvas = canvasObject;
	// this var keeps track of our drag start position
	this.gripStartDrag = 0;

	// mouse event sinks
	var c = this.canvas.getCanvasObject();
	var _this = this;
	c.addEventListener("mouseup", function(e) { _this.onMouseUp(e); }, false);
	c.addEventListener("mouseout", function(e) { _this.onMouseUp(e); }, false);
	c.addEventListener("mousedown", function(e) { _this.onMouseDown(e); }, false);

	/*
	// Work out if we are a vertical or horizontal scrollbar and return the appropriate x or y drag component
	// returns the x or y parameter depending on the vertical or horizontal orientation of the scrollbar canvas
	*/
	this.getDragPosition = GetDragPosition;
	function GetDragPosition(x, y) {
		return (this.canvas.width > this.canvas.height)?x:y;
	}

	/*
	// Process dragging the grip area
	*/
	this.onMouseMove = OnMouseMove;
	function OnMouseMove(event) {
		// adjust page mouse into canvas mouse
		var x = event.pageX - this.canvas.left;
		var y = event.pageY - this.canvas.top;

		//Update the Scrollbar
		this.scrollMath.doDragGrip(this.gripStartDrag, this.getDragPosition(x, y));
		this.callbackSetWindowPosition(this.scrollMath.windowPosition);

		// update the drag start position
		this.gripStartDrag = this.getDragPosition(x, y);
	}

	/*
	// Process mouse release
	*/
	this.onMouseUp = OnMouseUp;
	this.mouseOverFunc = function(e) { _this.onMouseMove(e); }
	function OnMouseUp(event) {
		var c = this.canvas.getCanvasObject();
		c.removeEventListener("mousemove", this.mouseOverFunc);			
	}

	/*
	// Process mouse down (everything is started with a mouse down)
	*/
	this.onMouseDown = OnMouseDown;
	function OnMouseDown(event) {

		// adjust page mouse into canvas mouse
		var x = event.pageX - this.canvas.left;
		var y = event.pageY - this.canvas.top;

		// create a rectangle for the grip
		var rectGrip = this.callbackGetGripRectangle();
		var rectAboveGrip = this.callbackGetAboveGripRectangle();

		// top button
		if (this.rectTopButton.pointIsIn(x, y)) {
				 
			//Update the Scrollbar
			this.scrollMath.doArrowUp()
			this.callbackSetWindowPosition(this.scrollMath.windowPosition);
		}
		else
		// bottom button
		if (this.rectBottomButton.pointIsIn(x, y)) {
			 
			//Update the Scrollbar
			this.scrollMath.doArrowDown()
			this.callbackSetWindowPosition(this.scrollMath.windowPosition);
		}
		else
			// on the grip
		if (rectGrip.pointIsIn(x, y)) {
			this.gripStartDrag = this.getDragPosition(x, y);
			// we are mousedown on the grip area, start listening to the drag operation
			var c = this.canvas.getCanvasObject();
			c.addEventListener("mousemove", this.mouseOverFunc, false);			
		}
		else
		// Above the grip
		if (rectAboveGrip.pointIsIn(x, y)) {

			//Update the Scrollbar
			this.scrollMath.doPageUp()
			this.callbackSetWindowPosition(this.scrollMath.windowPosition);
		}
		// Below the grip
		else {

			//Update the Scrollbar
			this.scrollMath.doPageDown()
			this.callbackSetWindowPosition(this.scrollMath.windowPosition);
		}
	}
}



