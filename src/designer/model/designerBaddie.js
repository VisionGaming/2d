
/*
// This class is the designer for baddies in the game system
// interacts with JQuery for user input
*/
function designerBaddie() {

  // keep track of the selected baddie so we can highlight him as he moves around
  this.selectedBaddieIndex = -1;
  // the current MVVM object to map edits back into the designer nd ultimately the game
  this.baddieModel = null;
  // the baddie currently being edited
  this.currentBaddieEditIndex = 0;

  // constructor
  this.initiate = 
  function() {
      // baddies
    createDesignerDialog("#baddiesAvailableDialog", 700);

    // spawn
    createDesignerDialog("#spawnAvailableDialog", 700);

    // level baddies
    createDesignerDialog("#baddiesLevelDialog", 700);

    // todo fix this.
    $("#baddiesLevelDialog").dialog( "option", "position", "left");

    // create the spwn HTML
    this.generateAvailableSpawnHTML();
  }



  /*
  // Populate the selection box with all the available baddies.
  */
  this.generateAvailableSpawnHTML =
  function () {
    // start of the dialog html
    var ihtml = ""; 
      //'<div id="baddieSpawn">';

    // generate all the available badddies to choose from
    // we will present this in an ordered list of cnvases for the jquery ui magic
    ihtml += '<ol id="spawnSelectable">';
    for (var i = 0; i < gameConfig.graphics.spawn.length; i++) {
      var b = gameConfig.graphics.spawn[i];
      var name = b.name;
      var spriteSheet = b.sprites[0].spriteSheet;
      ihtml += 
          '<li id="li_spawn_' + spriteSheet + '" data-index="' + 
          i + '" class="ui-state-default"><canvas id="spawn_canvas_' + 
          spriteSheet + '"></canvas></div></li>';
    };
    ihtml += '</ol>';

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("spawnAvailableScrollArea");  
    div.innerHTML = ihtml;  

    // draw each baddie sprite, first frame
    for (var i = 0; i < gameConfig.graphics.spawn.length; i++) {
      var b = gameConfig.graphics.spawn[i];
      var name = b.name;
      var id = "spawn_canvas_" + b.sprites[0].spriteSheet;
      var c = document.getElementById(id);
      c.width  = gameConfig.world.tileWidth;
      c.height = gameConfig.world.tileHeight + 10;
      var ctx = c.getContext('2d');

      var dw = assetManager.imageArray[b.sprites[0].spriteSheet].frameWidth;
      if ( dw > c.width)
          dw = c.width;

      var dh = assetManager.imageArray[b.sprites[0].spriteSheet].frameHeight;
      if ( dh > c.height - 10)
          dh = c.height - 10;

      assetManager.drawToXY(ctx, b.sprites[0].spriteSheet, 0, 0, 0, dw, dh);
      ctx.font = "12px Georgia";
      ctx.fillText(name, 0, c.height);
    };

    // make the order list selectable
    $("#spawnSelectable").selectable();
    // and attach an event handletr
    $("#spawnSelectable").selectable({
      selected: function( event, ui ) {
        var id = ui.selected.id;
        var selected = ui.selected.dataset.index;
        if (selected) {
          $( "#spawnAvailableDialog" ).dialog( "close" );      
          designerObjectJQ.designerBaddieObject.updateSpawnSprite(selected);
        }
      }
    });
  }


  /*
  // inject a new Baddie into the current game level
  */
  this.newBaddie = 
  function () {
    var _this = this;
    // when the game pauses run the inner callback function
    gameEngine.stopRun(function(){
      // add a new baddie then start to edit
      gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance.push(
        {
          name: gameConfig.graphics.baddies[0].name,
          moveType: "pointChaser",
          loop: true,
          points: 300,
          facing: "default",
          speed: 4,
          healthDecrement: 1,
          moveArray: [{x:0, y:0}],
            
          spawn: {
            name: "",
            relativeX: 0, 
            relativeY: 0, 
            frameDelay: 1,
            maxInPlay: 1,
            healthDecrement: 2,
            condition: "Launch all directions"
          }

        }
      );
      // update the Baddie Level html
      _this.generateLevelBaddiesHTML();
      // reinitiate the pack of baddies in game
      var i = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance.length - 1;
      baddieObj.baddiePositionInitiate(i);
      // draw border around our new guy
      _this.selectedBaddieIndex = i;
      // edit the last on the list
      _this.editBaddie(i);
      // restart the game
      gameEngine.startRun();
    });
  }

  /*
  // A new spawn was selected, update the observable and redraw the graphic
  */
  this.updateSpawnSprite = 
  function (spawnIndex) {
    var b = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance[this.currentBaddieEditIndex];    
    b.spawn.name = gameConfig.graphics.spawn[spawnIndex].name;
    this.baddieModel.spawn.name(gameConfig.graphics.spawn[spawnIndex].name);
    drawSpriteToCanvas(gameConfig.graphics.spawn[b.spawn.name].sprites[0].spriteSheet, "spawnEditCanvas");
    $( "#spawnSelectSpriteButton" ).click(function() {
      designerObjectJQ.designerBaddieObject.selectSpawn();
    });
  }

  /*
  // A new baddie has been selected, so reflect that into the UI
  // the game play should follow accordingly
  */ 
  this.updateBaddieSprite = 
  function (baddieName) {
    this.baddieModel.name(baddieName);
  }


  /*
  // Edit an existing baddie
  // index is baddie instance in current level
  */
  this.editBaddie = 
  function (index) {

    this.currentBaddieEditIndex = index;

    // refresh the html
    var div = document.getElementById("baddieEditorTabs-2");
    div.innerHTML = templates.baddieMove;

    div = document.getElementById("baddieEditorTabs-3");
    div.innerHTML = templates.baddieSpawn;

    var b = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance[index];
    var s = b.spawn;

    if (s && s.name) {
      s = gameConfig.graphics.spawn[s.name];
      drawSpriteToCanvas(s.sprites[0].spriteSheet, "spawnEditCanvas");
    }

    div = document.getElementById("baddieEditorDialog");
    ko.cleanNode(div);

    this.initiateBaddieDialog();
    $( "#baddieEditorDialog" ).dialog( "open" );

    this.baddieModel = new baddieModel(b);
    ko.applyBindings(this.baddieModel, div);
    
  }

  /*
  // set up the editor with JQuery, 
  // we need to do this multiple times because knockout 
  // also clears the JQuery bindings
  */
  this.initiateBaddieDialog = 
  function () {
    $("#baddieEditorTabs").tabs();
    createDesignerDialog("#baddieEditorDialog", 680);

    $( "#spawnButton" ).click(function() {
      designerObjectJQ.designerBaddieObject.selectSpawn();
    });

    $( "#spawnSelectSpriteButton" ).click(function() {
      designerObjectJQ.designerBaddieObject.selectSpawn();
    });

    $( "#baddieSelectSpriteButton" ).click(function() {
      designerObjectJQ.designerBaddieObject.selectBaddie();
    });
  }

  this.selectSpawn =
  function () {
        $( "#spawnAvailableDialog" ).dialog( "open" );
  }

  this.selectBaddie =
  function () {
        $( "#baddiesAvailableDialog" ).dialog( "open" );
  }




  /*
  // Populate the baddies dialog 
  // with the baddies already in this level
  */
  this.generateLevelBaddiesHTML = 
  function () {
    // start of the dialog html
    var ihtml = ""; 

    // generate all the available badddies to choose from
    // we will present this in an ordered list of cnvases for the jquery ui magic
    ihtml += '<ol id="baddieLevelSelectable">';
    var bi = gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance;
    for (var i = 0; i < bi.length; i++) {
      var b = bi[i];
      var name = b.name;
      var dex = gameConfig.graphics.baddies[name];
      var spriteSheet = gameConfig.graphics.baddies[dex].sprites.default;
      ihtml += 
          '<li id="li_baddie_level_' + spriteSheet + '" data-index="' + 
          i + '" class="ui-state-default"><canvas id="baddie_level_canvas_' + 
          i + '"></canvas></div></li>';
    };
    ihtml += '</ol>';

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("baddiesLevelArrayScrollArea");  
    div.innerHTML = ihtml;  

    // draw each baddie sprite, first frame
    for (var i = 0; i < bi.length; i++) {
      var b = bi[i];
      var name = b.name;
      var dex = gameConfig.graphics.baddies[name];
      var spriteSheet = gameConfig.graphics.baddies[dex].sprites.default;
      var id = "baddie_level_canvas_" +  i;
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

      $( "#btnAddBaddie" ).unbind().click(function() {
        designerObjectJQ.designerBaddieObject.newBaddie();
      });

      $( "#btnEditBaddie" ).unbind().click(function() {
        if (designerObjectJQ.designerBaddieObject.selectedBaddieIndex >= 0)
          designerObjectJQ.designerBaddieObject.editBaddie(designerObjectJQ.designerBaddieObject.selectedBaddieIndex);
      });

      $( "#btnDeleteBaddie" ).unbind().click(function() {
        if (designerObjectJQ.designerBaddieObject.selectedBaddieIndex >= 0)
          gameConfig.graphics.levels[gameConfig.world.currentLevel].baddieInstance.splice(designerObjectJQ.designerBaddieObject.selectedBaddieIndex, 1);
          baddieObj.initiateAllBaddiePositions();
          designerObjectJQ.designerBaddieObject.generateLevelBaddiesHTML();
      });

    }

    // make the order list selectable
    $("#baddieLevelSelectable").selectable();
    // and attach an event handletr
    $("#baddieLevelSelectable").selectable({
      selected: function( event, ui ) {
        var id = ui.selected.id;
        var selected = ui.selected.dataset.index;
        if (selected) {
          designerObjectJQ.designerBaddieObject.selectedBaddieIndex = selected;
        }
      }
    });
  }

  /*
  // Populate the selection box with all the available baddie spritesheets.
  */
  this.generateAvailableBaddiesHTML =
  function () {
    // start of the dialog html
    var ihtml = ""; 

    // generate all the available badddies to choose from
    // we will present this in an ordered list of cnvases for the jquery ui magic
    ihtml += '<ol id="baddieSelectable">';
    for (var i = 0; i < gameConfig.graphics.baddies.length; i++) {
      var b = gameConfig.graphics.baddies[i];
      var name = b.name;
      var spriteSheet = b.sprites.default;
      ihtml += 
          '<li id="li_baddie_' + spriteSheet + '" data-name="' + 
          name + '" class="ui-state-default"><canvas id="baddie_canvas_' + 
          spriteSheet + '"></canvas></div></li>';
    };
    ihtml += '</ol>';

    // loadup the dialog with our ordered selection list
    var div = document.getElementById("baddiesAvailableScrollArea");  
    div.innerHTML = ihtml;  

    // draw each baddie sprite, first frame
    for (var i = 0; i < gameConfig.graphics.baddies.length; i++) {
      var b = gameConfig.graphics.baddies[i];
      var name = b.name;
      var id = "baddie_canvas_" + b.sprites.default;
      var c = document.getElementById(id);
      c.width  = gameConfig.world.tileWidth;
      c.height = gameConfig.world.tileHeight + 10;
      var ctx = c.getContext('2d');

      var dw = assetManager.imageArray[b.sprites.default].frameWidth;
      if ( dw > c.width)
          dw = c.width;

      var dh = assetManager.imageArray[b.sprites.default].frameHeight;
      if ( dh > c.height - 10)
          dh = c.height - 10;

      assetManager.drawToXY(ctx, b.sprites.default, 0, 0, 0, dw, dh);
      ctx.font = "12px Georgia";
      ctx.fillText(name, 0, c.height);
    };

    // make the order list selectable
    $("#baddieSelectable").selectable();
    // and attach an event handletr
    $("#baddieSelectable").selectable({
      selected: function( event, ui ) {
        var id = ui.selected.id;
        var selected = ui.selected.dataset.name;
        if (selected) {
          $( "#baddiesAvailableDialog").dialog( "close" );      
          designerObjectJQ.designerBaddieObject.updateBaddieSprite(selected);
        }
      }
    });

  }

  // initialise the object
  this.initiate();
}

// Helper function
function getBaddieModel() {
  return designerObjectJQ.designerBaddieObject.baddieModel;
}

/*
// Baddie editor bindings MVVM
// using knockout.js
*/
function baddieModel (baddieInstance) {

  this.baddieInstance = baddieInstance;
  this.name = ko.observable(baddieInstance.name);
  this.name.subscribe(function(value) { 
    getBaddieModel().baddieInstance.name = value; 
    getBaddieModel().refreshBaddie(); 
  });
  this.moveTypeValues = ["roamingLeft", "roamingRight", "pointChaser"];
  
  this.moveType = ko.observable([baddieInstance.moveType]);
  this.moveType.subscribe(function(value) { 
    getBaddieModel().baddieInstance.moveType = value; 
    getBaddieModel().refreshBaddie(); 
  });

  this.loop = ko.observable(baddieInstance.loop);
  this.loop.subscribe(function(value) { 
    getBaddieModel().baddieInstance.loop = utils.parseBoolean(value); 
    getBaddieModel().refreshBaddie();
  });

  this.points = ko.observable(baddieInstance.points);
  this.points.subscribe(function(value) { 
    getBaddieModel().baddieInstance.points = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });

  this.facingValues = ["default", "up", "down", "left", "right"];
  this.facing = ko.observable([baddieInstance.facing]);
  this.facing.subscribe(function(value) { 
    getBaddieModel().baddieInstance.facing = value; 
    getBaddieModel().refreshBaddie();
  });

  this.speed = ko.observable(baddieInstance.speed);
  this.speed.subscribe(function(value) { 
    getBaddieModel().baddieInstance.speed = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });

  this.healthDecrement = ko.observable(baddieInstance.healthDecrement);
  this.healthDecrement.subscribe(function(value) { 
    getBaddieModel().baddieInstance.healthDecrement = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });

  this.moveArray = ko.observableArray(baddieInstance.moveArray);
  
  this.moveArray = ko.observableArray([]);
  for (var i = 0; i < baddieInstance.moveArray.length; i++) {
    this.moveArray.push({ x: baddieInstance.moveArray[i].x, y: baddieInstance.moveArray[i].y });
  }

  // if the spawn section is not defined then bring in a default 
  if (baddieInstance.spawn == null || baddieInstance.spawn.name == null) {
    // Copy the defult spawn oject
    baddieInstance.spawn = JSON.parse(JSON.stringify(gameConfig.graphics.spawnDefault));
  }

  this.spawn = {
    name: ko.observable(vv(baddieInstance.spawn.name, "")), 
    relativeX: ko.observable(vv(baddieInstance.spawn.relativeX, 0)), 
    relativeY: ko.observable(vv(baddieInstance.spawn.relativeY, 0)), 
    frameDelay: ko.observable(vv(baddieInstance.spawn.frameDelay, 0)),
    maxInPlay: ko.observable(vv(baddieInstance.spawn.maxInPlay, 0)),
    healthDecrement: ko.observable(vv(baddieInstance.spawn.healthDecrement, 0)),
    conditionValues: gameConfig.graphics.spawnConditions.nameList,
    condition: ko.observable([vv(baddieInstance.spawn.condition, "Drop from above")])
  }

  // subscriptions to reflect changes to spawn properties into the real baddie instance
  this.spawn.relativeX.subscribe(function(value) { 
      getBaddieModel().baddieInstance.spawn.relativeX = parseInt(value); 
      getBaddieModel().refreshBaddie();
    });
  this.spawn.relativeY.subscribe(function(value) { 
    getBaddieModel().baddieInstance.spawn.relativeY = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });
  this.spawn.frameDelay.subscribe(function(value) { 
    getBaddieModel().baddieInstance.spawn.frameDelay = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });
  this.spawn.maxInPlay.subscribe(function(value) { 
    getBaddieModel().baddieInstance.spawn.maxInPlay = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });
  this.spawn.healthDecrement.subscribe(function(value) { 
    getBaddieModel().baddieInstance.spawn.healthDecrement = parseInt(value); 
    getBaddieModel().refreshBaddie();
  });

// <select data-bind='options: conditionValues, value: spawn.condition'><\/select>",

  this.facing = ko.observable([baddieInstance.facing]);
  this.spawn.condition.subscribe(function(value) { 
    getBaddieModel().baddieInstance.spawn.condition = value; 
    getBaddieModel().refreshBaddie();
  });


  this.addMove = function() {
      getBaddieModel().moveArray.push({ x: 0, y: 0 });
  }

  this.removeMove = function(move) {
      getBaddieModel().moveArray.remove(move);
  }

  this.save = function() {
      getBaddieModel().baddieInstance.moveArray = ko.toJS(getBaddieModel().moveArray);
      getBaddieModel().refreshBaddie();
  }

  // refesh the baddie in the game
  this.refreshBaddie =
  function () {
    // reinitiate the baddie object for this index
    baddieObj.baddiePositionInitiate(designerObjectJQ.designerBaddieObject.currentBaddieEditIndex);
  }

}
