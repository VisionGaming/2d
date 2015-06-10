
/*
//  The designerObject JQuery version
*/
var designerObjectJQ = null;
function DesignerObjectJQ() {

  // Baddie designer object for use internally
  this.designerBaddieObject = null;

  // Object (item) designer item for use internally
  this.designerItemObject = null;

  // Platform designer object for use internally
  this.designerPlatformObject = null;

  // Platform designer object for use internally
  this.designerTileObject = null;

  // if the current level needs saving, the dirty flag is set to true
  this.thisLevelIsDirty = false;
  // type of icon to display under the mouse
  this.selectedType = "";
  // index of the spritesheet for that icon
  this.selectedTypeIndex = -1;

  // player is immortal in design mode
  gameConfig.world.dontDie = true;

  // current mouseover coordinates
  // in pixels
  this.mouseCellX = 0;
  this.mouseCellY = 0;
  // in game cells
  this.realMouseX = 0;
  this.realMouseY = 0;

  //Vertical Scrollbar
  this.vScrollBarObj = null;

  // Callback for the vertical  scrollbar
  this.callbackSetWindowPosition = 
  function(windowPos) {
    gameEngine.gameViewPortTop = windowPos;
    gameEngine.backgroundTop = parseInt(gameEngine.gameViewPortTop / gameConfig.world.backgroundSpeedRatio);
  }

  // the player shifted the viewport
  this.callBackViewPortShift = 
  function(l,t) {
    designerObjectJQ.vScrollBarObj.scrollMath.windowPosition = t;
    designerObjectJQ.vScrollBarObj.draw();
  }

  //constructor
  this.initiate = 
  function () {

    document.body.innerHTML += templates.designer;

    // intercpt the clicks on the menu
    $( "#menu" ).menu({

        // activate the menu selection
        select: function( event, ui ) { 
          // reset the selected type
          this.selectedType = "";

          // decide what to do with the menu clicks
          switch(ui.item[0].id){
            case "loadLevel":
              designerObjectJQ.generateLevelsHTML();
              $( "#loadLevelDialog" ).dialog( "open" );
              break;

            case "saveLevel":
              designerObjectJQ.serializeLevel();
              break;

            default:
              $( "#" + ui.item[0].id + "Dialog" ).dialog( "open" );
              break;  
          }

          
        }
    });

    $("#menu").hide();

    $('#designerIcon').click(function(e) {  
        $("#menu").show().focus();
        // reset the selected type
        this.selectedType = "";
    });

    $( "#menu" ).blur(function () {
        $("#menu").hide();
    });    

    // player
    createDesignerDialog("#playerDialog", 100);

    // load level
    createDesignerDialog("#loadLevelDialog", 400);

    // new level
    createDesignerDialog("#newLevelDialog", 400);

    // allow a user to create a new game level
    $('#btnNewLevel').click(function(e) {  
      // Save if we need to
      designerObjectJQ.saveLevel();
      // get the name out of the dialog
      var levelName = $("#txtNewLevel").val();
      // Lets make sure we have a name 
      if (levelName != "") {
        // make a copy object from the new level
        var levelCopyObj = JSON.parse(JSON.stringify(gameConfig.world["newLevel"]));
        // replace the nme in the copy of new level
        levelCopyObj.name = levelName;
        // push the new level into the end of the level array
        gameConfig.graphics.levels.push(levelCopyObj);
        // set the current level to the last entry (our new level)
        gameConfig.world.currentLevel = gameConfig.graphics.levels.length - 1;
        // Load the new level into focus
        gameEngine.loadCurrentLevel();
        // reset the selected baddie index
        designerObjectJQ.designerBaddieObject.selectedBaddieIndex = -1;
        // close the jQuery dialog
        $("#newLevelDialog").dialog("close");      
        // flag the new level as needing a save
        designerObjectJQ.thisLevelIsDirty = true;
      }
      else {
        alert("You must name your level!");
      }

    });


    // Baddie designer object for use internally
    this.designerBaddieObject = new designerBaddie();

    // Object (item) designer item for use internally
    this.designerItemObject = new designerItem();

    // Platform designer object for use internally
    this.designerPlatformObject = new designerPlatform();

    // Platform designer object for use internally
    this.designerTileObject = new designerTiles();

    // Inject the HTML into the JQuery dialogs
    this.generateCurrentLevelHTML();
    this.generatePlayerHTML();

    // mouse click events for world editing
    var c = gameEngine.viewPortCanvas.getCanvasObject();
    c.addEventListener("mousedown", function(e) { designerObjectJQ.doGameViewPortMouseDown(e); }, false);
    c.addEventListener("mousemove", function(e) { designerObjectJQ.doGameViewPortMouseMove(e); }, false);
  
    this.vScrollBarObj = new VScrollBar(
        gameEngine.viewPortCanvas.left + gameEngine.viewPortCanvas.width, 
        gameEngine.viewPortCanvas.top, 
        gameEngine.viewPortCanvas.height, 
        gameEngine.baseCanvas.height, 
        gameEngine.viewPortCanvas.height, 
        gameConfig.world.tileHeight, this.callbackSetWindowPosition);

    // register our callback for viewportshift
    gameEngine.callBackViewPortShift = this.callBackViewPortShift;
  }


  // draw hook for the designer to do its stuff on the viewport context canvas
  gameEngine.callbackRenderToViewPort.push( 
    function(ctx) { 
      designerObjectJQ.draw(ctx);

      // get the context of the player draw dialog canvas
      var c = document.getElementById("playerCanvas");
      // the game may have started without us check for the existence of the player canvas
      if (c != null) {
        c.width  = gameConfig.world.tileWidth;
        c.height = gameConfig.world.tileHeight;
        var ctxPlayerCanvas = c.getContext('2d');
        // draw the player on there
        playerObj.draw(ctxPlayerCanvas, 0 ,0);        
      }

      if (designerObjectJQ.selectedType != "") {
        var x = designerObjectJQ.realMouseX - gameConfig.world.tileWidth / 2;
        var y = designerObjectJQ.realMouseY - gameConfig.world.tileHeight / 2; 
        ctx.globalAlpha = 0.5
        switch(designerObjectJQ.selectedType) {
          case "player":
            playerObj.draw(
              ctx, 
              x, 
              y);
            break;

          case "object":
            // draw the image for this frame
            var spriteSheet = ""
            var displaySizePercent;
            if (designerObjectJQ.selectedTypeIndex == -1) {
                spriteSheet = "eraser";
                displaySizePercent = 100;
            }
            else {
              var assetObject = gameConfig.graphics.objects[designerObjectJQ.selectedTypeIndex];
              spriteSheet = assetObject.spriteSheet;
              displaySizePercent = assetObject.displaySizePercent;
            }
            assetManager.drawToXYScaled(ctx, 
              spriteSheet, 
              0, 
              x, 
              y,
              displaySizePercent);
            break;

          case "tile":
            // draw the image for this frame
            var spriteSheet = ""
            var spriteIndex;
            if (designerObjectJQ.selectedTypeIndex == -1) {
                spriteSheet = "eraser";
                spriteIndex = 0;
            }
            else {
              var assetObject = gameConfig.graphics.tiles[designerObjectJQ.selectedTypeIndex];
              spriteSheet = assetObject.spriteSheet;
              spriteIndex = gameConfig.graphics.tiles[designerObjectJQ.selectedTypeIndex].spriteSheetIndex;
            }
            assetManager.drawToXY(ctx, 
              spriteSheet, 
              spriteIndex, 
              x, 
              y);
            break;
        }
        ctx.globalAlpha = 1
      }

      fontObject.draw(ctx, "(" + designerObjectJQ.mouseCellX + "/" + designerObjectJQ.mouseCellY + ")", designerObjectJQ.realMouseX, designerObjectJQ.realMouseY, 50); 

    });


  /*
  // Draw anything we need to onto the game context
  */
  this.drawCount = 0;
  this.draw = 
  function (ctx) {
    this.drawCount++;
    this.drawCount = ((this.drawCount==10)?0:this.drawCount);

    // if a baddie is selected
    if (this.designerBaddieObject != null && this.designerBaddieObject.selectedBaddieIndex >= 0) {
      // then draw a white rectangle around it
      var bi = baddieObj.baddiePosition[this.designerBaddieObject.selectedBaddieIndex];
      if (bi) {
        var r = bi.collisionArea;
        r.y1 -= gameEngine.gameViewPortTop;
        r.x1 -= gameEngine.gameViewPortLeft;
        r.border(ctx, "yellow", this.drawCount);
      }
    }
    // if a platform is selected
    if (this.designerPlatformObject != null && this.designerPlatformObject.selectedPlatformIndex >= 0) {
      // draw a rectangle around the plaform that is selected
      bi = platformObj.platform[this.designerPlatformObject.selectedPlatformIndex];
      if (bi) {
        var r = bi.collisionArea;
        r.y1 -= gameEngine.gameViewPortTop;
        r.x1 -= gameEngine.gameViewPortLeft;
        r.border(ctx, "yellow", this.drawCount);
      }

    }
  }




  /*
  // Generate the content specific to this current game level
  */
  this.generateCurrentLevelHTML = 
  function () {
    // reinitiate baddie html because the content changes between levels
    // and when a baddie is added or removed from the game
    this.designerBaddieObject.initiateBaddieDialog();
    this.designerBaddieObject.generateLevelBaddiesHTML();
    this.designerBaddieObject.generateAvailableBaddiesHTML();
    // same with platforms
    this.designerPlatformObject.initiatePlatformDialog();
    this.designerPlatformObject.generateLevelPlatformsHTML();
    this.designerPlatformObject.generateAvailableImagesHTML();
    // same with tiles
    this.designerTileObject.generateTilesHTML();
    // same with objects
    this.designerItemObject.generateObjectsHTML();
  }








  /*
  // Populate the selection box with the player.
  */
  this.generatePlayerHTML =
  function () {
    // make the player canvas selectable
    $( "#playerCanvas" ).click(function() {
        designerObjectJQ.selectedType = "player";
        designerObjectJQ.selectedTypeIndex = -1;
    });
  }


  /*
  // Populate the select tags with all the available levels.
  */
  this.generateLevelsHTML =
  function () {
    // start of the dialog html
    var ihtml = "<select id='levelSelectOption'>";
    for (var i = 0; i < gameConfig.graphics.levels.length; i++) {
      var name = gameConfig.graphics.levels[i].name;
      
      ihtml += 
          "'<option value='" + i + "'>" + i + ". " + name + "</option>";
    }
    ihtml += "</select>";

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("optionLevelDiv");  
    div.innerHTML = ihtml;  

    // and attach an event handletr
    $("#btnLevelSelect").unbind().click(function(e) {
      // Prompt and save the level if its dirty
      designerObjectJQ.saveLevel();
      // get the selected drop down entry
      var div = document.getElementById("levelSelectOption");        
      // and its index value
      var sv = div.options[div.selectedIndex].value;
      // set the current level and load it up
      gameConfig.world.currentLevel = parseInt(sv);
      // tell the gameebgine to load in that level
      gameEngine.loadCurrentLevel();
      // reset the selected baddie index
      designerObjectJQ.designerBaddieObject.selectedBaddieIndex = -1;
      // reset the selected platform index
      designerObjectJQ.designerPlatformObject.selectedPlatformIndex = -1;
      // load up the dialogs with fresh content specific to this level
      designerObjectJQ.generateCurrentLevelHTML();
      // Flag as a clean level
      designerObjectJQ.thisLevelIsDirty = false;
    });
  }



  this.doGameViewPortMouseMove = 
  function (event) {
    var x = event.pageX - gameConfig.world.viewPortLeft;
    var y = event.pageY - gameConfig.world.viewPortTop;

    designerObjectJQ.realMouseX = x;
    designerObjectJQ.realMouseY = y;

    // Convert the mouse x and y from viewport into world mouse coordinates
    x += gameEngine.gameViewPortLeft;
    y += gameEngine.gameViewPortTop;

    // Convert into world column and row
    designerObjectJQ.mouseCellX = parseInt(x / gameConfig.world.tileWidth);
    designerObjectJQ.mouseCellY = parseInt(y / gameConfig.world.tileHeight);
  }


  this.doGameViewPortMouseDown = 
  function (event) {
    var x = event.pageX - gameConfig.world.viewPortLeft;
    var y = event.pageY - gameConfig.world.viewPortTop;

    // Convert the mouse x and y from viewport into world mouse coordinates
    x += gameEngine.gameViewPortLeft;
    y += gameEngine.gameViewPortTop;
    // Convert into world column and row
    x = parseInt(x / gameConfig.world.tileWidth);
    y = parseInt(y / gameConfig.world.tileHeight);


    var gameCellNumber = y * gameConfig.world.gridColumns + x;
    var selectedTile = designerObjectJQ.selectedTypeIndex;
    if (designerObjectJQ.selectedType == "tile") {
      // convert into the world cell number
      gameEngine.addTileToWorld(selectedTile, gameCellNumber, true);
      // level needs a save
      designerObjectJQ.thisLevelIsDirty = true;
    }
    else 
    if (designerObjectJQ.selectedType == "object") {
      // convert into the world cell number
      gameEngine.addObjectToWorld(selectedTile, gameCellNumber, true);
      // level needs a save
      designerObjectJQ.thisLevelIsDirty = true;
    }
    else 
    if (designerObjectJQ.selectedType == "player") {
      // multiply the col and row to the top left of the cell we should occupy
      gameEngine.worldLevel.levelData.man.column = x;
      gameEngine.worldLevel.levelData.man.row = y;
      playerObj.x = x * gameConfig.world.tileWidth;
      playerObj.y = y * gameConfig.world.tileHeight;
      gameEngine.drawWorld();
      gameEngine.renderWorldToViewport();
      // level needs a save
      designerObjectJQ.thisLevelIsDirty = true;
    }
  }

  /*
  // create a JSON string of the current level
  // and trigger a download via the DOM a tag whats important here is the download attribute
  // this triggers the file to download when click is selected (auto seected)
  */
  this.serializeLevel =
  function() {

    // copy the running game level
    var thisLevelJSON = JSON.parse(JSON.stringify(gameEngine.worldLevel));
    // copy any changes to the baddies across otherwise they wont be current
    thisLevelJSON.baddieInstance = JSON.parse(JSON.stringify(gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance));
    // copy any changes to the platforms across otherwise they wont be current
    thisLevelJSON.platforms = JSON.parse(JSON.stringify(gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms));

    var json = "addLevel(\n" + JSON.stringify(thisLevelJSON, null, "\t") + "\n);"
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);

    var a = document.getElementById('saveMe')
    if (!a)
      a = document.createElement('a');

    a.download    = "level" + gameConfig.world.currentLevel + ".js";
    a.href        = url;
    a.textContent = "Download level json";
    a.id = "saveMe";

    document.getElementById('saveAs').appendChild(a);
    document.getElementById('saveMe').click();
    // saved so its not dirty anymore
    designerObjectJQ.thisLevelIsDirty = false;
  }

  
  /*
  // Prompt and save the current level if its dirty
  */
  this.saveLevel = 
  function () {
    if (designerObjectJQ.thisLevelIsDirty) {
      if (confirm('Do you want to save this level?')) {
          designerObjectJQ.serializeLevel();
      }      
    }
  }

}
