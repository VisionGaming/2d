/*
// Designer Platform class
// allow the user to add Platforms to the game engine.
*/
function designerPlatform() {
  // keep track of the selected baddie so we can highlight him as he moves around
  this.selectedPlatformIndex = -1;

  // currently editing index
  this.currentPlatformEditIndex = -1;

  // MVVM object instance fr UI editing
  this.platformModel = null;

  // class instantiation
  this.initiate = 
  function () {
    // Create Platforms dialog
    createDesignerDialog("#platformsDialog", 700);

    // level platforms
    createDesignerDialog("#platformsLevelDialog", 700);

    // images
    createDesignerDialog("#imagesAvailableDialog", 720);

    // start up the platform html
    this.initiatePlatformDialog();
  }

  /*
  // set up the platform editor with JQuery, 
  // we need to do this multiple times because knockout 
  // also clears the JQuery bindings
  */
  this.initiatePlatformDialog = 
  function () {
    // edit platforms
    createDesignerDialog("#platformEditorDialog", 700);
    $("#platformEditorTabs").tabs();

    $( "#platformSelectSpriteSheetButton" ).click(function() {
      designerObjectJQ.designerPlatformObject.selectImage();
    });
  }

  /*
  // inject a new Baddie into the current game level
  */
  this.newPlatform = 
  function () {
    var _this = this;
    // when the game pauses run the inner callback function
    gameEngine.stopRun(function(){
      // if the platforms array does not exist create it
      if (!gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms) {
        gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms = [];
      }
      // add a new platform then start to edit
      gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms.push(
        {
          // defaulting to first spritesheet in graphics config
          spriteSheet: gameConfig.graphics.platformSprites[0],
          frameInterval: 1,
          loop: true,
          speed: 8,
          scaling: 100,
          xPadding: 4,
          moveArray: [{x:0, y:0}],
        }
      );
      // update the Baddie Level html
      _this.generateLevelPlatformsHTML();
      // reinitiate the pack of baddies in game
      var i = gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms.length - 1;
      platformObj.initiate();
      // draw border around our new guy
      _this.selectedPlatformIndex = i;
      // edit the last on the list
      _this.editPlatform(i);
      // restart the game
      gameEngine.startRun();
    });
  }

  /*
  // A new platform sprite has been selected, so reflect that into the UI
  // the game play should follow accordingly
  */ 
  this.updatePlatformSprite = 
  function (spriteSheetName) {
    this.platformModel.spriteSheet(spriteSheetName);
  }

  /*
  // Edit an existing baddie
  // index is baddie instance in current level
  */
  this.editPlatform = 
  function (index) {

    this.currentPlatformEditIndex = index;

    // refresh the html
    var div = document.getElementById("platformEditorTabs-2");
    div.innerHTML = templates.baddieMove;

    var b = gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms[index];

    div = document.getElementById("platformEditorDialog");
    ko.cleanNode(div);

    this.initiatePlatformDialog();
    $( "#platformEditorDialog" ).dialog( "open" );

    this.platformModel = new platformModel(b);
    ko.applyBindings(this.platformModel, div);
    
  }


  this.selectImage =
  function () {
        $( "#imagesAvailableDialog" ).dialog( "open" );
  }


  /*
  // Populate the platform dialog 
  // with the platforms already in this level
  */
  this.generateLevelPlatformsHTML = 
  function () {
    // start of the dialog html
    var ihtml = ""; 

    // generate all the available badddies to choose from
    // we will present this in an ordered list of cnvases for the jquery ui magic
    ihtml += '<ol id="platformLevelSelectable">';
    var bi = gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms;
    if (bi) {
      for (var i = 0; i < bi.length; i++) {
        var b = bi[i];
        var name = "";
        var spriteSheet = b.spriteSheet;
        ihtml += 
            '<li id="li_platform_level_' + spriteSheet + '" data-index="' + 
            i + '" class="ui-state-default"><canvas id="platform_level_canvas_' + 
            i + '"></canvas></div></li>';
      }
    }
    ihtml += '</ol>';

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("platformLevelArrayScrollArea");  
    div.innerHTML = ihtml;  

    if (bi) {
      // draw each baddie sprite, first frame
      for (var i = 0; i < bi.length; i++) {
        var b = bi[i];
        var name = "";//b.name;
        var spriteSheet = b.spriteSheet;
        var id = "platform_level_canvas_" +  i;
        var c = document.getElementById(id);
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
        ctx.font = "12px Georgia";
        ctx.fillText(name, 0, c.height);
      }
    }

    $( "#btnAddPlatform" ).unbind().click(function() {
      designerObjectJQ.designerPlatformObject.newPlatform();
    });

    if (bi) {
      $( "#btnEditPlatform" ).unbind().click(function() {
        if (designerObjectJQ.designerPlatformObject.selectedPlatformIndex >= 0)
          designerObjectJQ.designerPlatformObject.editPlatform(designerObjectJQ.designerPlatformObject.selectedPlatformIndex);
      });

      $( "#btnDeletePlatform" ).unbind().click(function() {
        if (designerObjectJQ.designerPlatformObject.selectedPlatformIndex >= 0)
          gameConfig.graphics.levels[gameConfig.world.currentLevel].platforms.splice(designerObjectJQ.designerPlatformObject.selectedPlatformIndex, 1);
          platformObj.initiate();
          designerObjectJQ.designerPlatformObject.generateLevelPlatformsHTML();
      });

      // make the order list selectable
      $("#platformLevelSelectable").selectable();
      // and attach an event handletr
      $("#platformLevelSelectable").selectable({
        selected: function( event, ui ) {
          var id = ui.selected.id;
          var selected = ui.selected.dataset.index;
          if (selected) {
            designerObjectJQ.designerPlatformObject.selectedPlatformIndex = selected;
          }
        }
      });

    }
  }

  /*
  // Populate the selection box with all the available baddie spritesheets.
  */
  this.generateAvailableImagesHTML =
  function () {
    // start of the dialog html
    var ihtml = "";
      

    // generate all the available badddies to choose from
    // we will present this in an ordered list of cnvases for the jquery ui magic
    ihtml += '<ol id="imagesSelectable">';
    var n = gameConfig.graphics.platformSprites.length;
    for (var i = 0; i < n; i++) {
      var spriteSheet = gameConfig.graphics.platformSprites[i];
      var name = spriteSheet;
      ihtml += 
          '<li id="li_image_' + spriteSheet + '" data-name="' + 
          name + '" class="ui-state-default"><canvas id="image_canvas_' + 
          spriteSheet + '"></canvas></div></li>';
    };
    ihtml += '</ol>';

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("imageScrollArea");  
    div.innerHTML = ihtml;  

    // draw each baddie sprite, first frame
    for (var i = 0; i < n; i++) {
      var name = gameConfig.graphics.platformSprites[i];
      var id = "image_canvas_" + name;
      var c = document.getElementById(id);
      c.width  = gameConfig.world.tileWidth;
      c.height = gameConfig.world.tileHeight + 10;
      var ctx = c.getContext('2d');

      var dw = assetManager.imageArray[name].frameWidth;
      if ( dw > c.width)
          dw = c.width;

      var dh = assetManager.imageArray[name].frameHeight;
      if ( dh > c.height - 10)
          dh = c.height - 10;

      assetManager.drawToXY(ctx, name, 0, 0, 0, dw, dh);
      ctx.font = "12px Georgia";
      ctx.fillText(name, 0, c.height);
    };

    // make the order list selectable
    $("#imagesSelectable").selectable();
    // and attach an event handletr
    $("#imagesSelectable").selectable({
      selected: function( event, ui ) {
        var id = ui.selected.id;
        var selected = ui.selected.dataset.name;
        if (selected) {
          $( "#imagesAvailableDialog").dialog( "close" );      
          designerObjectJQ.designerPlatformObject.updatePlatformSprite(selected);
        }
      }
    });

  }


  // initialise the object
  this.initiate();
}

// Helper function
function getPlatformModel() {
  return designerObjectJQ.designerPlatformObject.platformModel;
}


/*
// Baddie editor bindings MVVM
// using knockout.js
*/
function platformModel (platformInstance) {

  this.platformInstance = platformInstance;
  this.spriteSheet = ko.observable(platformInstance.spriteSheet);
  this.spriteSheet.subscribe(function(value) { 
    getPlatformModel().platformInstance.spriteSheet = value; 
    getPlatformModel().refreshPlatform(); 
  });

  this.loop = ko.observable(platformInstance.loop);
  this.loop.subscribe(function(value) { 
    getPlatformModel().platformInstance.loop = utils.parseBoolean(value); 
    getPlatformModel().refreshPlatform();
  });

  this.frameInterval = ko.observable(platformInstance.frameInterval);
  this.frameInterval.subscribe(function(value) { 
    getPlatformModel().platformInstance.frameInterval = parseInt(value); 
    getPlatformModel().refreshPlatform();
  });

  this.speed = ko.observable(platformInstance.speed);
  this.speed.subscribe(function(value) { 
    getPlatformModel().platformInstance.speed = parseInt(value); 
    getPlatformModel().refreshPlatform();
  });

  this.scaling = ko.observable(platformInstance.scaling);
  this.scaling.subscribe(function(value) { 
    getPlatformModel().platformInstance.scaling = parseInt(value); 
    getPlatformModel().refreshPlatform();
  });

  this.xPadding = ko.observable(platformInstance.xPadding);
  this.xPadding.subscribe(function(value) { 
    getPlatformModel().platformInstance.xPadding = parseInt(value); 
    getPlatformModel().refreshPlatform();
  });

  this.moveArray = ko.observableArray(platformInstance.moveArray);
  
  this.moveArray = ko.observableArray([]);
  for (var i = 0; i < platformInstance.moveArray.length; i++) {
    this.moveArray.push({ x: platformInstance.moveArray[i].x, y: platformInstance.moveArray[i].y });
  }



  this.addMove = function() {
      getPlatformModel().moveArray.push({ x: 0, y: 0 });
  }

  this.removeMove = function(move) {
      getPlatformModel().moveArray.remove(move);
  }

  this.save = function() {
      getPlatformModel().platformInstance.moveArray = ko.toJS(getPlatformModel().moveArray);
      getPlatformModel().refreshPlatform();
  }

  // refesh the baddie in the game
  this.refreshPlatform =
  function () {
    // reinitiate the baddie object for this index
    platformObj.initiate();
  }

}


