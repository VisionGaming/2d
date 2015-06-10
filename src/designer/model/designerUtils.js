  /*
  // Create our own dialog type with customized buttons
  */
  createDesignerDialog =
  function(selector, width) {

    $(selector).dialog({ 
      create: function() { 
        var span = "<span id='" + this.id + "_toggleWindowPane" + "' class='iconMinimize ui-icon ui-icon-triangle-1-n'></span>";
        $(this).prev('.ui-dialog-titlebar').find('.ui-dialog-title').after(span) 
      }, 
      autoOpen: false }
    );
    if (width)
      $(selector).dialog( "option", "width", width);

    $(selector + "_toggleWindowPane").click(function(){
      
      // Toggle the state of the window pane
      var windowId = this.id.split("_")[0];
      var id = windowId + "Hide";
      designerObjectJQ[id] = (!designerObjectJQ[id]?true:false);
      if (designerObjectJQ[id]) {
        $("#" + windowId).hide();
      }
      else {
        $("#" + windowId).show(); 
      }      

      $("#" + this.id).toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-n");
    });

  }

  // draw sprite frame 0 onto a canvas
  drawSpriteToCanvas = 
  function(spriteSheet, canvasId) {
    
    // if we have a spawn then draw the icon
    if (spriteSheet) {
      var c = document.getElementById(canvasId);

      c.width  = gameConfig.world.tileWidth;
      c.height = gameConfig.world.tileHeight + 10;
      var ctx = c.getContext('2d');

      var dw = assetManager.imageArray[spriteSheet].frameWidth;
      if ( dw > c.width)
          dw = c.width;

      var dh = assetManager.imageArray[spriteSheet].frameHeight;
      if ( dh > c.height - 10)
          dh = c.height - 10;

      assetManager.drawToXY(ctx, spriteSheet, 0, 0, 0, dw, dh);
    }
  }

  /*
  // Draw the eraser on a specifically named dom canvas object
  */
  drawEraser = 
  function (gameElement) {
    var id = gameElement + "_canvas_eraser";
    var c = document.getElementById(id);
    c.width  = gameConfig.world.tileWidth;
    c.height = gameConfig.world.tileHeight + 20;
    var ctx = c.getContext('2d');

    assetManager.drawToXY(ctx, "eraser", 0, 0, 0, gameConfig.world.tileWidth, gameConfig.world.tileHeight);
  }
