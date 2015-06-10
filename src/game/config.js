/*
// World Level object
*/
function WorldLevel() {
	this.man = {column:0, row:0},
	this.tileArray = [],
	this.objectArray = [],
	this.transientInformationArray = [],
	this.baddieArray = []
}


var gameConfig = null; //new Config();
function Config() {
	
	// allow the game to enter edit mode
	this.editMode = false;
	this.drawGrid = false;

	// the world object defines the size of the world
	this.world = new World();
	function World() {

		// change this to the level you are working on
		this.maxLevels = 5;
		this.currentLevel = 0;

		// sprite sizes in pixels
		// graphics files should match this rectangle size
        // gameConfig.world.tileWidth, gameConfig.world.tileHeight

		this.tileWidth = 64;
		this.tileHeight = 64;

		// size of the world grid
		this.gridColumns = 20;
		this.gridRows = 20;
		this.frameInterval = 40;

		// player speeds when running or falling
		this.playerSpeedX = 16;
		this.gravity = 32;

		// padding for collision detection
		// collision detection is done with 4 points in a padded rectangle
		// within the main rectangle area of the player.
		this.playerPaddingLeft = 16;
		this.playerPaddingRight = 16;
		this.playerPaddingTop = 10;
		this.playerPaddingBottom = 10;
		this.playerHealthPoints= 10;
		// this is how many tiles a player can fall without dying
		this.playerTooMuchofAFall = 5;
		// this setting helps tune the game movement
		this.showCollisionAreas = false;
		// how many frames to show points fr
		this.maxFramesToShowPoints = 30;
		// when the player gets a power it is shown in the game status
		// scale the icon to this size
		this.powerItemSize = 50;
		this.thoughtBubbleFrames = 50;


		// interval variables used by the engine
		this.width = this.tileWidth * this.gridColumns;
		this.height = this.tileHeight * this.gridRows;

		// viewport area is the visible area into which we bitblt the baseCanvas
		this.viewPortWidth = parseInt(window.innerWidth / this.tileWidth) * this.tileWidth;
		this.viewPortHeight = parseInt(window.innerHeight / this.tileHeight) * this.tileHeight;

		// Add some sanity to the size of the viewport
		if (this.viewPortWidth > this.width) {
			this.viewPortWidth = this.width;
		}

		if (this.viewPortHeight > this.height) {
			this.viewPortHeight = this.height;
		}

		this.backgroundSpeedRatio = 4;
		this.playerJumpingHeight = 5;
		this.dontDie = false;

		// to be set later
		this.viewPortLeft = -1;
		this.viewPortTop = -1;

		// this is the config for mapping keyboard and mouse gestures to the game actions
		this.key_mapping = [
			{ keyAscii: 37, action:"left", gesture: "swipe_left" },
			{ keyAscii: 38, action:"up", gesture: "swipe_up" },
			{ keyAscii: 39, action:"right", gesture: "swipe_right" },
			{ keyAscii: 32, subaction:"gun_fire", gesture: "tap" }
		];

	}

	/*
	// this class defines where the designer control panel sits
	*/
	this.designer = new DesignControls();
	function DesignControls() {
		this.left = 5;
		this.top = 35;

		this.gridColumns = 3;
		// set later by the system
		this.gridRows = -1;

		// to be calculated later on
		// to do work out how to calculate this here
		this.width = -1;
		this.height = -1;
		this.objectRows = -1;

	}

	this.graphics = new Graphics();
	function Graphics() {


		// Image path defaults so we can simply assemble the image path from its name
		this.defaultImageDirectory = "./art/spritesheets/";
		this.defaultImageExtension = ".png";

		// images, can be a single image or spritesheet, the asset manager does not care
		// if an image is referenced with a spritesheet index it will attempt to retrieve a subset image
		// if frameWidth and frameHeight are not specified then the tileWidth and tileHeight are substituted
		this.images = [
			{name:"eraser"},
			{name:"level0_background", image:"./art/background/spooky1.jpg"},
			{name:"level1_background", image:"./art/background/spooky1.jpg"},
			{name:"level2_background", image:"./art/background/spooky1.jpg"},
			{name:"level0_tiles", image:"./art/spritesheets/tiles.png"},
			{name:"bat_left",frameWidth:128, frameHeight:128},
			{name:"bat_right",frameWidth:128, frameHeight:128},
			{name:"coin"},
			{name:"explosion1", image:"./art/spritesheets/explosion.png"},
			{name:"explosion2", frameWidth:200, frameHeight:135},
			{name:"key"},
			{name:"key_explosion"},

			// New sprite sheets for boy with gun run and swim with gun and shoot

			{name: "player_land_die-left"},
			{name: "player_land_die-right"},
			{name: "player_land_left"},
			{name: "player_land_left_exit"},
			{name: "player_land_left_gun"},
			{name: "player_land_left_gun_exit"},
			{name: "player_land_left_gun_shoot"},
			{name: "player_land_right"},
			{name: "player_land_right_exit"},
			{name: "player_land_right_gun"},
			{name: "player_land_right_gun_exit"},
			{name: "player_land_right_gun_shoot"},
			{name: "player_land_still-left"},
			{name: "player_land_still-left_gun"},
			{name: "player_land_still-left_gun_shoot"},
			{name: "player_land_still-right"},
			{name: "player_land_still-right_gun"},
			{name: "player_land_still-right_gun_shoot"},
			{name: "player_water_die-left"},
			{name: "player_water_die-right"},
			{name: "player_water_left_exit"},
			{name: "player_water_left_gun_exit"},
			{name: "player_water_right_exit"},
			{name: "player_water_right_gun_exit"},
			{name: "player_water_left"},
			{name: "player_water_left_gun"},
			{name: "player_water_left_gun_shoot"},
			{name: "player_water_right"},
			{name: "player_water_right_gun"},
			{name: "player_water_right_gun_shoot"},
			{name: "player_water_still-left"},
			{name: "player_water_still-left_gun"},
			{name: "player_water_still-left_gun_shoot"},
			{name: "player_water_still-right"},
			{name: "player_water_still-right_gun"},
			{name: "player_water_still-right_gun_shoot"},
			{name: "player_water_up"},
			{name: "player_water_up_gun"},
			{name: "player_water_up_gun_shoot"},

			{name:"bullet_left", frameWidth:44, frameHeight:15},
			{name:"bullet_right", frameWidth:44, frameHeight:15},
			{name:"bullet_up", frameWidth:15, frameHeight:44},
			{name:"bullet_down", frameWidth:15, frameHeight:44},

			{name:"skeleton_left", frameWidth:128, frameHeight:128},
			{name:"skeleton_right", frameWidth:128, frameHeight:128},
			{name:"skeleton_headless", frameWidth:128, frameHeight:128},
			
			{name:"snorkle"},
			{name:"snorkle_explosion"},
			{name:"alphanumerics", frameWidth:28, frameHeight:46, image:"./art/spritesheets/alphanumerics_white.png"},
			{name:"blood_c"},
			{name:"jellyfish"},
			{name:"fish_left"},
			{name:"fish_right"},
			{name:"door2", frameWidth:64, frameHeight:128},
			{name:"deep_water", frameWidth:42, frameHeight:63},
			{name:"gun"},
			{name:"waves"},
			{name:"bubbles"},
			{name:"ammo", frameWidth:128, frameHeight:128},
			{name:"turd"},
			{name:"bat_blood"},
			{name:"thought_bubble", frameWidth:128, frameHeight:128},
			{name:"heart"},
			{name:"platform", frameWidth:64, frameHeight:18},
			{name:"exocet_small_left", frameWidth:128, frameHeight:64},
			{name:"exocet_small_right", frameWidth:128, frameHeight:64},
			{name:"exocet_tiny_left", frameWidth:96, frameHeight:48},
			{name:"exocet_tiny_right", frameWidth:96, frameHeight:48},
			{name:"missile_silo_left"},
			{name:"missile_silo_right"},
			{name:"silo_tiny_left",frameWidth:64, frameHeight:64},
			{name:"silo_tiny_right",frameWidth:64, frameHeight:64},
			{name:"shark_left_large",frameWidth:128, frameHeight:46},
			{name:"shark_right_large",frameWidth:128, frameHeight:46},
			{name:"shark_left_turn_large",frameWidth:127, frameHeight:45},
			{name:"shark_right_turn_large",frameWidth:127, frameHeight:45},
			{name:"shark_left_small",frameWidth:64, frameHeight:23},
			{name:"shark_right_small",frameWidth:64, frameHeight:23},
			{name:"shark_left_turn_small",frameWidth:65, frameHeight:23},
			{name:"shark_right_turn_small",frameWidth:65, frameHeight:23},
			{name:"rock"},
			{name:"rock_falling"},
			{name:"rock_explosion"},
			{name:"platform2"},
			{name:"flower1"},
			{name:"zombie_left"},
			{name:"zombie_right"}

		]	


		// backgrounds
		this.backgrounds = [
			{name:"Level0 Background", spriteSheet:"Level0_background"}
		];

		// platform sprites
		this.platformSprites = [
			"platform", 
			"platform2"
		];


		// game tiles
		// These tiles must remain in the order they are here, because the saved levels refer back to the index not the name
		// If you must add a new tile, add it to the end of this array
		this.tiles = [
			{name:"Land Exit", spriteSheet:"level0_tiles", spriteSheetIndex:0, noGravity:false, isSolid:false, isDeath:false, isExit:true, points:0, requiredPower:""},
			{name:"Brick", spriteSheet:"level0_tiles", spriteSheetIndex:1, noGravity:false, isSolid:true, isDeath:false, isExit:false, points:0, requiredPower:""},
			{name:"Grass brick", spriteSheet:"level0_tiles", spriteSheetIndex:2, noGravity:false, isSolid:true, isDeath:false, isExit:false, points:0, requiredPower:""},
			{name:"Spikes", spriteSheet:"level0_tiles", spriteSheetIndex:3, noGravity:false, isSolid:false, isDeath:true, isExit:false, points:0, requiredPower:"hammer"},
			{name:"Water top", spriteSheet:"level0_tiles", terrain:"water", gravity:4, spriteSheetIndex:4, noGravity:true, isSolid:false, isDeath:true, isExit:false, points:0, requiredPower:"snorkle"},
			{name:"Water bottom", spriteSheet:"level0_tiles", terrain:"water", gravity:4, spriteSheetIndex:5, noGravity:true, isSolid:false, isDeath:true, isExit:false, points:0, requiredPower:"snorkle"},
			{name:"Water spike", spriteSheet:"level0_tiles", terrain:"water", gravity:4, spriteSheetIndex:6, noGravity:true, isSolid:false, isDeath:true, isExit:false, points:0, requiredPower:"snorkle"},
			{name:"Island", spriteSheet:"level0_tiles", terrain:"default", gravity:4, spriteSheetIndex:7, noGravity:false, isSolid:true, isDeath:false, isExit:false, points:0, requiredPower:""},
			{name:"Water Exit", spriteSheet:"level0_tiles", terrain:"water", gravity:4, spriteSheetIndex:8, noGravity:true, isSolid:false, isDeath:false, isExit:true, points:0, requiredPower:"snorkle"}
		]

		// player config JSON
		this.player = [ 
			{
				// player sprites are named by their action
				name:"still-left",  
				sprites: [ 
					{ 
						// each sprite is applicable to the terrain the boy is currently in
						terrain: "land", spriteSheet:"player_land_still-left", frameInterval:4,
						// each sprite can contain an overlay for each power (optional)
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_still-left_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_land_still-left_gun_shoot" }
						]
					},
					{ 
						terrain: "water", spriteSheet:"player_water_still-left", frameInterval:12,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_still-left_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_water_still-left_gun_shoot" }
						]
					} 
				]
			},
			{
				// player sprites are named by their action
				name:"still-right",  
				sprites: [ 
					{ 
						// each sprite is applicable to the terrain the boy is currently in
						terrain: "land", spriteSheet:"player_land_still-right", frameInterval:4,
						// each sprite can contain an overlay for each power (optional)
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_still-right_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_land_still-right_gun_shoot" }
						]
					},
					{ 
						terrain: "water", spriteSheet:"player_water_still-right", frameInterval:12,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_still-right_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_water_still-right_gun_shoot" }
						]
					} 
				]
			},
			{
				name:"left",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"player_land_left", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_left_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_land_left_gun_shoot", playTimes:2, spawnY:30, spawnX:0 }
						]
					},
					{ 
						terrain: "water", spriteSheet:"player_water_left", frameInterval:6, playerSpeedX:8,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_left_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_water_left_gun_shoot", playTimes:2, spawnY:30, spawnX:0 }
						]
					} 
				]
			},
			{
				name:"right",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"player_land_right", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_right_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_land_right_gun_shoot", playTimes:2, spawnY:30, spawnX:64 }
						]
					},
					{ 
						terrain: "water", spriteSheet:"player_water_right", frameInterval:6, playerSpeedX:8,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_right_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_water_right_gun_shoot", playTimes:2, spawnY:30, spawnX:0 }
						]
					} 
				]
			},
/*			{
				name:"falling",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"boy_land_still", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_still_gun_overlay" }
							// gun fire will be taken care of by right and left sprites
							// logic: if power has gun_fire sprite = current terrain[lastx action]
						]
					},
					{ 
						// my thoughts were that if falling through water 
						// then we are probably looking up
						terrain: "water", spriteSheet:"boy_up_swim", frameInterval:3,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_up_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_up_swim_gun_fire_overlay", playTimes:2, spawnY:0, spawnX:32 }
						]
					}
				]
			},
			{
				name:"down",
				sprites: [ 
					{ 
						terrain: "water", spriteSheet:"boy_down_swim", frameInterval:3, playerSpeedX:16,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_down_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_down_swim_gun_fire_overlay", playTimes:2, spawnY:64, spawnX:32 }
						]
					}
				]
			},
*/			
			{
				name:"up",
				sprites: [ 
					{ 
						terrain: "water", spriteSheet:"player_water_up", frameInterval:3, playerSpeedX:8,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_up_gun" },
							{ subaction: "gun_fire", spriteSheet:"player_water_up_gun_shoot", playTimes:2, spawnY:0, spawnX:32 }
						]
					},

// Jumping in land terrain is hardcoded right now but this section is still needed by the action state system
// because we have a key defined as up
					{ 
						terrain: "land", spriteSheet:"player_land_right", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_right_gun" }
							// fire activates the last x movement on jump
							// so left and right should lake care of gun fire overlays
						]
					}

				]
			},
			{
				name:"die-left",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"player_land_die-left", frameInterval:2,
						overlays: []
					},
					{ 
						terrain: "water", spriteSheet:"player_water_die-left", frameInterval:5,
						overlays: []
					} 
				]
			},
			{
				name:"die-right",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"player_land_die-right", frameInterval:2,
						overlays: []
					},
					{ 
						terrain: "water", spriteSheet:"player_water_die-right", frameInterval:5,
						overlays: []
					} 
				]
			},
			{
				name:"exit-left",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"player_land_left_exit", frameInterval:5,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_left_gun_exit", frameInterval:5 }
						]
					},
					{ 
						terrain: "water", spriteSheet:"player_water_left_exit", frameInterval:5,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_left_gun_exit", frameInterval:5 }
						]
					}
				]
			},
			{
				name:"exit-right",
				sprites: [ 
					{ 
						terrain: "land", spriteSheet:"player_land_right_exit", frameInterval:5,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_land_right_gun_exit", frameInterval:5 }
						]
					},
					{ 
						terrain: "water", spriteSheet:"player_water_right_exit", frameInterval:5,
						overlays: [ 
							{ power: "gun", spriteSheet:"player_water_right_gun_exit", frameInterval:5 }
						]
					}
				]
			}
		]

/*
		// player config JSON
		this.player = [ 
			{
				// player sprites are named by their action
				name:"still_left",  
				sprites: [ 
					{ 
						// each sprite is applicable to the terrain the boy is currently in
						terrain: "default", spriteSheet:"boy_left_still", frameInterval:4,
						// each sprite can contain an overlay for each power (optional)
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_still_gun_overlay" }
							//{ subaction: "gun_fire", spriteSheet:"boy_still_gun_fire_overlay" }
						]
					},
					{ 
						terrain: "water", spriteSheet:"boy_left_still_swim", frameInterval:12,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_still_swim_gun_overlay" }
							//{ subaction: "gun_fire", spriteSheet:"boy_still_swim_gun_fire_overlay" }
						]
					} 
				]
			},
			{
				// player sprites are named by their action
				name:"still_right",  
				sprites: [ 
					{ 
						// each sprite is applicable to the terrain the boy is currently in
						terrain: "default", spriteSheet:"boy_right_still", frameInterval:4,
						// each sprite can contain an overlay for each power (optional)
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_still_gun_overlay" }
							//{ subaction: "gun_fire", spriteSheet:"boy_still_gun_fire_overlay" }
						]
					},
					{ 
						terrain: "water", spriteSheet:"boy_right_still_swim", frameInterval:12,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_still_swim_gun_overlay" }
							//{ subaction: "gun_fire", spriteSheet:"boy_still_swim_gun_fire_overlay" }
						]
					} 
				]
			},
			{
				name:"left",
				sprites: [ 
					{ 
						terrain: "default", spriteSheet:"boy_left", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_left_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_left_gun_fire_overlay", playTimes:2, spawnY:30, spawnX:0 }
						]
					},
					{ 
						terrain: "water", spriteSheet:"boy_left_swim", frameInterval:6, playerSpeedX:8,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_left_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_left_swim_gun_fire_overlay", playTimes:2, spawnY:30, spawnX:0 }
						]
					} 
				]
			},
			{
				name:"right",
				sprites: [ 
					{ 
						terrain: "default", spriteSheet:"boy_right", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_right_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_right_gun_fire_overlay", playTimes:2, spawnY:30, spawnX:64 }
						]
					},
					{ 
						terrain: "water", spriteSheet:"boy_right_swim", frameInterval:6, playerSpeedX:8,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_right_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_right_swim_gun_fire_overlay", playTimes:2, spawnY:30, spawnX:0 }
						]
					} 
				]
			},
			{
				name:"falling",
				sprites: [ 
					{ 
						terrain: "default", spriteSheet:"boy_still", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_still_gun_overlay" }
							// gun fire will be taken care of by right and left sprites
							// logic: if power has gun_fire sprite = current terrain[lastx action]
						]
					},
					{ 
						// my thoughts were that if falling through water 
						// then we are probably looking up
						terrain: "water", spriteSheet:"boy_up_swim", frameInterval:3,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_up_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_up_swim_gun_fire_overlay", playTimes:2, spawnY:0, spawnX:32 }
						]
					}
				]
			},
			{
				name:"down",
				sprites: [ 
					{ 
						terrain: "water", spriteSheet:"boy_down_swim", frameInterval:3, playerSpeedX:16,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_down_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_down_swim_gun_fire_overlay", playTimes:2, spawnY:64, spawnX:32 }
						]
					}
				]
			},
			{
				name:"up",
				sprites: [ 
					{ 
						terrain: "water", spriteSheet:"boy_up_swim", frameInterval:3, playerSpeedX:8,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_up_swim_gun_overlay" },
							{ subaction: "gun_fire", spriteSheet:"boy_up_swim_gun_fire_overlay", playTimes:2, spawnY:0, spawnX:32 }
						]
					},
					{ 
						terrain: "default", spriteSheet:"boy_jump", frameInterval:1,
						overlays: [ 
							{ power: "gun", spriteSheet:"boy_jump_gun_overlay" }
							// fire activates the last x movement on jump
							// so left and right should lake care of gun fire overlays
						]
					}					
				]
			},
			{
				name:"die",
				sprites: [ 
					{ 
						terrain: "default", spriteSheet:"boy_die", frameInterval:2,
						overlays: []
					},
					{ 
						terrain: "water", spriteSheet:"boy_drown", frameInterval:5,
						overlays: []
					} 
				]
			},
			{
				name:"exit",
				sprites: [ 
					{ 
						terrain: "default", spriteSheet:"boy_jump", frameInterval:1,
						overlays: []
					},
					{ 
						terrain: "water", spriteSheet:"boy_swim_exit", frameInterval:1,
						overlays: []
					}
				]
			}
		]

*/
		// baddies and player can spawn things if they have the power.
		// todo: if you want a baddie to spawn something then assign it in hasPower
		this.spawn = [	
			{ name: "pistol_bullet", speed: 32, power:"ammo", powerDecrement:1,
				sprites: [
					{ action:"left", spriteSheet:"bullet_left", directionX:-32, directionY:0, frameInterval:1 },
					{ action:"right", spriteSheet:"bullet_right", directionX:32, directionY:0, frameInterval:1 },
					{ action:"up", spriteSheet:"bullet_up", directionX:0, directionY:-32, frameInterval:1 },
					{ action:"down", spriteSheet:"bullet_down", directionX:0, directionY:1, frameInterval:1 }
				]
			},
			{ name: "turd_drop", speed:32, displaySizePercent:25,
				sprites: [
					{ action:"up", spriteSheet:"turd", directionX:0, directionY:-32, frameInterval:1 },
					{ action:"down", spriteSheet:"turd", directionX:0, directionY:32, frameInterval:1 },
					{ action:"left", spriteSheet:"turd", directionX:-32, directionY:0, frameInterval:1 },
					{ action:"right", spriteSheet:"turd", directionX:32, directionY:0, frameInterval:1 }
				]
			},
			{ name: "exocet", speed: 32, powerDecrement:10,
				sprites: [
					//{ action:"up", spriteSheet:"bullet_up", directionX:0, directionY:-32, frameInterval:1 },
					//{ action:"down", spriteSheet:"bullet_down", directionX:0, directionY:1, frameInterval:1 },
					{ action:"left", spriteSheet:"exocet_small_left", spriteCoda:"explosion1", directionX:-16, directionY:0, frameInterval:3, playTimes:1 },
					{ action:"right", spriteSheet:"exocet_small_right", spriteCoda:"explosion1", directionX:16, directionY:0, frameInterval:3, playTimes:1 }
				]
			},
			{ name: "exocet_tiny", speed: 32, powerDecrement:10,
				sprites: [
					//{ action:"up", spriteSheet:"bullet_up", directionX:0, directionY:-32, frameInterval:1 },
					//{ action:"down", spriteSheet:"bullet_down", directionX:0, directionY:1, frameInterval:1 },
					{ action:"left", spriteSheet:"exocet_tiny_left", spriteCoda:"explosion1", directionX:-16, directionY:0, frameInterval:3, playTimes:1 },
					{ action:"right", spriteSheet:"exocet_tiny_right", spriteCoda:"explosion1", directionX:16, directionY:0, frameInterval:3, playTimes:1 }
				]
			},
			{ name: "rock_falling", speed: 32, powerDecrement:10,
				sprites: [
					{ action:"up", spriteSheet:"rock_falling", spriteCoda:"rock_explosion", directionX:0, directionY:-32, frameInterval:3, playTimes:1 },
					{ action:"down", spriteSheet:"rock_falling", spriteCoda:"rock_explosion", directionX:0, directionY:32, frameInterval:3, playTimes:1 },
					{ action:"left", spriteSheet:"rock_falling", spriteCoda:"rock_explosion", directionX:-32, directionY:0, frameInterval:3, playTimes:1 },
					{ action:"right", spriteSheet:"rock_falling", spriteCoda:"rock_explosion", directionX:32, directionY:0, frameInterval:3, playTimes:1 }
				]
			}
		]


		// game objects (collectibles) 
		this.objects = [
			{name:"key", spriteSheet:"key", spriteCoda:"key_splat", power:"key", displaySizePercent:100, xOffset:16, yOffset:16, frameInterval:10, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"key_splat", spriteSheet:"key", displaySizePercent:200, xOffset:0, yOffset:0, playTimes:1, playTimes:8, frameInterval:5, showInDesigner: false},
			{name:"coin", spriteSheet:"coin", spriteCoda:"coin_splat", displaySizePercent:50, xOffset:16, yOffset:16, frameIntervalSplat:5, power:"", points: 1000, frameInterval:1, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"coin_splat",	spriteSheet:"explosion1", playTimes: 1,	displaySizePercent:500, xOffset:-100, yOffset:-100, frameInterval:1, showInDesigner: false},
			{name:"snorkle", spriteSheet:"snorkle", spriteCoda:"snorkle_splat", power:"snorkle", displaySizePercent:80, xOffset:16, yOffset:16, points: 2000, frameInterval:1,	showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"snorkle_splat", spriteSheet:"snorkle",	displaySizePercent:150, xOffset:-32, yOffset:-16, playTimes:15, frameInterval:3, showInDesigner: false},
			{name:"dungeon_door", spriteSheet:"door2", isExit:true, frameInterval:1, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"deep_water", spriteSheet:"deep_water", frameInterval:1, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{
				name:"gun", 
				spriteSheet:"gun", 
				power:"gun",                 // the power is held by the player and shown at the top
				message:"ammo",
				messageScalePercentage: 45,
				subaction:"gun_fire",        // this object responds to a player subaction of "gun_fire" passed in by UI
				spawns:"pistol_bullet",      // the subaction spawns an instance of pistol_bullet sprite
				spriteCoda:"gun_coda",       // the spriteCoda is displayed when the object is gathered
				playTimes:1,                 // playTimes refers to the number  of times the coda is played todo: rename to codaPlayTimes
				frameInterval:1,             // frame interval how fast the object is rendered in the framing engine
				showInDesigner: true,        // if the user can place this object into the game 
				padding: {left:10, right:10, top:10, bottom:10} // padding of the object for collision detection
			},
			{name:"gun_coda", spriteSheet:"gun", displaySizePercent:150, xOffset:32, yOffset:-32, playTimes:15, frameInterval:1, showInDesigner: false, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"waves", spriteSheet:"waves", frameInterval:6, showInDesigner: true, padding: {left:0, right:0, top:0, bottom:0}},
			{name:"bubbles", spriteSheet:"bubbles", frameInterval:6, showInDesigner: true, padding: {left:0, right:0, top:0, bottom:0}},
			{name:"ammo", spriteSheet:"ammo", spriteCoda:"ammo_coda", displaySizePercent:50, xOffset:0, yOffset:0, frameIntervalSplat:5, powerIncrement:6, power:"ammo", points: 100, frameInterval:1, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"ammo_coda", spriteSheet:"ammo", displaySizePercent:100, xOffset:-32, yOffset:-32, playTimes:15, frameInterval:1, showInDesigner: false, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"heart", spriteSheet:"heart", spriteCoda:"heart_coda", healthPoints:10, displaySizePercent:50, xOffset:16, yOffset:16, frameInterval:1, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"heart_coda", spriteSheet:"heart", displaySizePercent:100, xOffset:-32, yOffset:-32, playTimes:10,frameInterval:1, showInDesigner: false, padding: {left:10, right:10, top:10, bottom:10}},
			{name:"flower", spriteSheet:"flower1", spriteCoda:"flower", displaySizePercent:100, xOffset:0, yOffset:0, frameIntervalSplat:1, power:"", points: 100, frameInterval:1, showInDesigner: true, padding: {left:10, right:10, top:10, bottom:10}}

		]

		// Definition of a baddie in this case a skeleton with 3 sprite sets
		this.baddies =  [
			{name:"skeleton", spriteCoda: "explosion1", displaySizePercent:75, xOffset:-32, yOffset:-32, frameInterval:2, sprites:{default:"skeleton_right", left:"skeleton_left", right:"skeleton_right"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"skeleton_headless", spriteCoda: "explosion1", displaySizePercent:100, xOffset:-60, yOffset:-60, frameInterval:2, sprites:{default:"skeleton_headless", left:"skeleton_headless", right:"skeleton_headless"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"bat", points:1000, spriteCoda:"bat_blood", displaySizePercent:50,avoidTerrain:"water", xOffset:-16, yOffset:-16,frameInterval:2, sprites:{default:"bat_right", left:"bat_left", right:"bat_right"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"jellyfish", points:500, spriteCoda:"explosion1", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:2, sprites:{default:"jellyfish"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"fish", points:500, spriteCoda:"explosion1", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:3, sprites:{default:"fish_left", left:"fish_left", right:"fish_right"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"silo_left", points:100, spriteCoda:"explosion1", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:10, sprites:{default:"missile_silo_left"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"shark_large", points:100, spriteCoda:"explosion1", avoidTerrain:"default", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:3, sprites:{default:"shark_left_large", left:"shark_left_large", leftTurn:"shark_left_turn_large", rightTurn:"shark_right_turn_large", right:"shark_right_large"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"shark_small", points:100, spriteCoda:"explosion1", avoidTerrain:"default", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:3, sprites:{default:"shark_left_small", left:"shark_left_small", leftTurn:"shark_left_turn_small", rightTurn:"shark_right_turn_small", right:"shark_right_small"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"silo_tiny_left", points:100, spriteCoda:"explosion1", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:3, sprites:{default:"silo_tiny_left"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"silo_tiny_right", points:100, spriteCoda:"explosion1", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:3, sprites:{default:"silo_tiny_right"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"rock", points:100, spriteCoda:"rock_explosion", displaySizePercent:100, xOffset:0, yOffset:0, frameInterval:3, sprites:{default:"rock"}, padding: { left:10, right:10, top:10, bottom:10 }},
			{name:"zombie", spriteCoda: "explosion1", frameInterval:2, sprites:{default:"zombie_right", left:"zombie_left", right:"zombie_right"}, padding: { left:10, right:10, top:10, bottom:10 }}
		]

		this.spawnConditions = [
			{ name: "Drop from above", condition: "function(obj){ return (playerObj.x == obj.x && playerObj.y > obj.y )?true:false; }" },
			{ name: "Launch from left", condition: "function(obj){ return (playerObj.y == obj.y && playerObj.x > obj.x )?true:false; }" },
			{ name: "Launch from right", condition: "function(obj){ return (playerObj.y == obj.y && playerObj.x < obj.x )?true:false; }" },
			{ name: "Launch left right", condition: "function(obj){ return (playerObj.y == obj.y)?true:false; }" },
			{ name: "Launch up down", condition: "function(obj){ return (playerObj.x == obj.x)?true:false; }" },
			{ name: "Launch all directions", condition: "function(obj){ return (playerObj.x == obj.x || playerObj.y == obj.y)?true:false; }" }
		]

		this.spawnDefault = {
			name:"", 
			relativeX:0, 
			relativeY:0, 
			frameDelay:1,
			maxInPlay:1,
			healthDecrement:1,
			condition:"Launch all directions"
		}


		this.levels =  [];
	}

	/*
	// return a spawn condition by name
	*/
	this.getSpawnConditionByName =
	function(name) {
		var sc = gameConfig.graphics.spawnConditions;
		// if not already name indexed do so the first time.
		if (!sc["initiated"]) {
			sc["initiated"] = true;
			// form a list of names
			sc["nameList"] = [];
			for (var i = 0; i < sc.length; i++) {
				// reindexing by name
				sc[sc[i].name] = sc[i];
				// append to the list of names
				sc.nameList.push(sc[i].name);
			}
		}
		// return the condition by name
		return  sc[name].condition;
	}
}

// add a level to the world level array
function addLevel(l) {
	gameConfig.graphics.levels.push(l);
}
