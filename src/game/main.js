
function bootstrap() {
	gameConfig = new Config();
	assetManager = new AssetManager();
 	fontObject = new Font();
 	gameObjects = new GameObjects();
 	gameEngine =  new GameEngine();
 	// if the designer exists then load it
 	if (typeof DesignerObjectJQ == 'function') {
	 	designerObjectJQ = new DesignerObjectJQ();
 	}
}


function main() {
	gameEngine.loadCurrentLevel();
	gameEngine.drawWorld();
	gameEngine.startRun();
 	// if the designer exists then initialise it
 	if (typeof DesignerObjectJQ == 'function') {
		designerObjectJQ.initiate();
	}
}

