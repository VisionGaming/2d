/*
// Designer Items class
// allow the user to add objects (items) to the game engine.
*/
function designerItem() {
	// class instantiation
	this.initiate = 
	function () {
	    // Create objects dialog
	    createDesignerDialog("#objectsDialog", 700);

	}

	/*
	// Populate the selection box with all the available objects.
	*/
	this.generateObjectsHTML =
	function () {
		// start of the dialog html
		var ihtml = ""; 

		// generate all the available badddies to choose from
		// we will present this in an ordered list of cnvases for the jquery ui magic
		ihtml += '<ol id="objectSelectable">';
		ihtml += 
		    '<li id="li_object_eraser" data-index="-1" class="ui-state-default"><canvas id="object_canvas_eraser"></canvas></div></li>';

		for (var i = 0; i < gameConfig.graphics.objects.length; i++) {
		  var b = gameConfig.graphics.objects[i];
		  var name = b.name;
		  
		  // we want to ignore the sprite codas
		  var isCodaSprite = false
		  for (var j = 0; j < gameConfig.graphics.objects.length; j++) {
		    if (gameConfig.graphics.objects[j].spriteCoda == name) {
		      isCodaSprite = true;
		    }
		  }

		  // only include the object if its not a coda
		  if (!isCodaSprite) {

		    var spriteSheet = b.spriteSheet;
		    ihtml += 
		        '<li id="li_object_' + spriteSheet + '" data-index="' + 
		        i + '" class="ui-state-default"><canvas id="object_canvas_' + 
		        i + '"></canvas></div></li>';
		  }
		};
		ihtml += '</ol>';

		// loadup the dialog with our ordered selection list
		var div = document.getElementById("objectsScrollArea");  
		div.innerHTML = ihtml;  
		//document.body.appendChild(div);

		// draw the eraser
		drawEraser("object");
		// draw each baddie sprite, first frame
		for (var i = 0; i < gameConfig.graphics.objects.length; i++) {
		  var b = gameConfig.graphics.objects[i];
		  var name = b.name;

		  // we want to ignore the sprite codas
		  var isCodaSprite = false
		  for (var j = 0; j < gameConfig.graphics.objects.length; j++) {
		    if (gameConfig.graphics.objects[j].spriteCoda == name) {
		      isCodaSprite = true;
		    }
		  }

		  // only include the object if its not a coda
		  if (!isCodaSprite) {
		    var id = "object_canvas_" + i;
		    var c = document.getElementById(id);
		    c.width  = gameConfig.world.tileWidth;
		    c.height = gameConfig.world.tileHeight + 20;
		    var ctx = c.getContext('2d');

		    assetManager.drawToXY(ctx, b.spriteSheet, 0, 0, 0, gameConfig.world.tileWidth, gameConfig.world.tileHeight);
		    ctx.font = "12px Georgia";
		    ctx.fillText(name, 0, c.height - 7);
		  }
		};

		// make the order list selectable
		$("#objectSelectable").selectable();
		// and attach an event handletr
		$("#objectSelectable").selectable({
		  selected: function( event, ui ) {
		    var id = ui.selected.id;
		    var selected = ui.selected.dataset.index;
		    if (selected) {
		      //$( "#tilesDialog" ).dialog( "close" );      
		      //designerObjectJQ.updateSpawnSprite(selected);
		      designerObjectJQ.selectedType = "object";
		      designerObjectJQ.selectedTypeIndex = selected;
		    }
		  }
		});
	}

	// initialise the object
	this.initiate();
}