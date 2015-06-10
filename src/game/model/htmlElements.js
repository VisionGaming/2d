// Canvas object, creates an object that you can draw on
function HTMLElement(type, id, value, left, top, width, height, hidden) {

	// assign the canvas id
	this.id = id;

	// rectangle relative to the top cornver of our canvas element
	this.clientRect = new Rect(0, 0, width, height);
	
	// other handy coordinates
	this.width = width;
	this.height = height;
	this.left = left;
	this.top = top;

	// creates a canvas DOM element and returns its graphics context


	// return the actual html canvas element of this object

	this.createElement = CreateElement;
	function CreateElement(type, id, value, left, top, width, height, hidden) {

		// create the canvas div
		var newdiv = document.createElement(type); 

		// the canvas names simply increment from 0
		newdiv.id = id;
		newdiv.style.left = left + "px";
		newdiv.style.top = top + "px";
		newdiv.style.width = width + "px";
		newdiv.style.height = height + "px";
		newdiv.style.border = "0px solid;";
		newdiv.style.position = "absolute";
		newdiv.innerHTML = value;

		// is thia is to be a hidden canvas then make it so
		if (hidden)
			newdiv.style.display = "none";

		// add to the DOM
		document.body.appendChild(newdiv);
	}


	// return the actual html canvas element of this object
	this.getDOMObject = GetDOMObject;
	function GetDOMObject() {
		return document.getElementById(this.id);
	}

	// set the element visible or not
	this.setVisible = SetVisible;
	function SetVisible(trueOrFalse) {
		var o = this.getDOMObject();
		o.style.display = trueOrFalse?"":"none";
	}

	// set the element visible or not
	this.setValue = SetValue;
	function SetValue(value) {
		var o = this.getDOMObject();
		o.innerHTML = value;
	}

	// kick off the creation of the object 
	this.createElement(type, id, value, left, top, width, height, hidden);
}