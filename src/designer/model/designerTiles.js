/*
// Designer Tiles class
// allow the user to add tiles to the game engine.
*/
function designerTiles() {
	// class instantiation
	this.initiate = 
	function () {
	    // create tiles dialog
	    createDesignerDialog("#tilesDialog", 700);

	}

  /*
  // Populate the selection box with all the available tiles.
  */
  this.generateTilesHTML =
  function () {
    // start of the dialog html
    var ihtml = ""; 

    // generate all the available badddies to choose from
    // we will present this in an ordered list of cnvases for the jquery ui magic
    ihtml += '<ol id="tileSelectable">';
    ihtml += 
        '<li id="li_tile_eraser" data-index="-1" class="ui-state-default"><canvas id="tile_canvas_eraser"></canvas></div></li>';

    for (var i = 0; i < gameConfig.graphics.tiles.length; i++) {
      var b = gameConfig.graphics.tiles[i];
      var name = b.name;
      
      var spriteSheet = b.spriteSheet;
      ihtml += 
          '<li id="li_tile_' + i + '" data-index="' + 
          i + '" class="ui-state-default"><canvas id="tile_canvas_' + 
          i + '"></canvas></div></li>';
    };
    ihtml += '</ol>';

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("tilesScrollArea");  
    div.innerHTML = ihtml;  

    // draw the eraser
    drawEraser("tile");
   
    // draw each baddie sprite, first frame
    for (var i = 0; i < gameConfig.graphics.tiles.length; i++) {
      var b = gameConfig.graphics.tiles[i];
      var name = b.name;

      var id = "tile_canvas_" + i;
      var c = document.getElementById(id);
      c.width  = gameConfig.world.tileWidth + 20;
      c.height = gameConfig.world.tileHeight + 20;
      var ctx = c.getContext('2d');

      assetManager.drawToXY(ctx, b.spriteSheet, b.spriteSheetIndex, 0, 0, gameConfig.world.tileWidth, gameConfig.world.tileHeight);
      ctx.font = "12px Georgia";
      ctx.fillText(name, 0, c.height - 7);
    };

    // make the order list selectable
    $("#tileSelectable").selectable();
    // and attach an event handletr
    $("#tileSelectable").selectable({
      selected: function( event, ui ) {
        var id = ui.selected.id;
        var selected = ui.selected.dataset.index;
        if (selected) {
          designerObjectJQ.selectedType = "tile";
          designerObjectJQ.selectedTypeIndex = selected;
        }
      }
    });
  }

  // initialise the object
  this.initiate();
}