// JavaScript source code
//https://github.com/mahsu/MariOCaml/tree/master/sprites


var LEVELS = [
	[	"                                                         ",
	    "                                                         ",
		"                                                         ",
		"                                         xxxxxx          ",
		"                                         x               ",
		"                                         x               ",
		"                                         x   |x          ",
		"                                         x o  x          ",
		"              o                           x    x         ",
		"                        o                 xxxxxx    xxx  ",
		"                      xxxx                               ",
		"  @     o  o                    xxxxxxxxxxxxxxxxxx!!!!!!!",
		" xxxxxxxxxxx!!!!xxxxxx!!!!!!                   xxxxxxxxx ",
		"           x!!!!X     xxxxxx                             ",
		"           x||!!X                                        ",
		"                                                         ",
	],
	["                                                                       ",
		"                                                     xxxxx          ",
		"           xxxxxxxxx                                 x | x          ",
		"             |  !!                                   x o x          ",
		"                                                                    ",
		"               o                                                    ",
		"                                                                    ",
		"          xxxxxxxxxxx                               xxxxxx          ",
		"                        @                                          o",
		"                      xxxx                                  xxxx   x",
		"                             xxxxxxxxxxxxxxxxxxxxxxxxxx!!!!!    !!!!",
		" xxxxxxxxxxx!!!!xxxxxx!!!!!!                   xxxxxxxxxXXXX        ",
		"           x!!!!X     xxxxxx                                        ",
		"           x||||X                                                   ",
		"                                                                    ",
	],
	
];

function MAP(MissionModel) {
	this.height = MissionModel.length;
	this.width = MissionModel[0].length;
	this.DynamicElements = [];
	this.ElementTypes = [];

	for (var i = 0; i < this.height; i++) {

		var ROWS = [];
		for (var j = 0; j < this.width; j++) {
			var dynElmt = MovingElements[MissionModel[i][j]];

			if (dynElmt) {
				var dynElement = new dynElmt(new Vector(j, i), MissionModel[i][j]);
				this.DynamicElements.push(dynElement);
			}

			if (MissionModel[i][j] == "x")
				ROWS.push("wall");

			else if (MissionModel[i][j] == "!")
				ROWS.push("lava");

			else
				ROWS.push(null);
		}
		this.ElementTypes.push(ROWS);
	}

	for (var i = 0; i < this.DynamicElements.length; i++) {
		if (this.DynamicElements[i].type == "player")
			this.superNacho = this.DynamicElements[i];
	}
}

MAP.prototype.SuperNachoOverlap = function () {

	for (var i = 0; i < this.DynamicElements.length; i++) {
		var DynElem = this.DynamicElements[i];
		var superNacho = this.superNacho;
		var Spos = superNacho.position;//Abreviation for superNacho's position
		var Dpos = DynElem.position;//Abreviation for DynamicElement's position
		var SDimen = superNacho.dimensions;//Abreviation for SuperNacho's size dimensions
		var DDimen = DynElem.dimensions;//Abreviation for DynamicElement's size dimensions

		if ((DynElem.position.x > superNacho.position.x) &&
			(DynElem.position.x + DynElem.dimensions.x < superNacho.position.x + superNacho.dimensions.x) &&
			(DynElem.position.y > superNacho.position.y) &&
			(DynElem.position.y + DynElem.dimensions.y < superNacho.position.y + superNacho.dimensions.y) &&
			(DynElem.type != "player")
		)
			return DynElem;

		else if (
			((Spos.x + SDimen.x > Dpos.x) && (Spos.x + SDimen.x < Dpos.x + DDimen.x) && (Spos.y > Dpos.y) && (Spos.y < Dpos.y + DDimen.y)) ||//scenario 1
			((Spos.x > Dpos.x) && (Spos.x < Dpos.x + DDimen.x) && (Spos.y > Dpos.y) && (Spos.y < Dpos.y + DDimen.y)) ||//Scenario 2
			((Spos.x + SDimen.x > Dpos.x) && (Spos.x + SDimen.x < Dpos.x + DDimen.x) && (Spos.y + SDimen.y > Dpos.y) && (Spos.y < Dpos.y)) ||//Scenario 3
			((Spos.x > Dpos.x) && (Spos.x < Dpos.x + DDimen.x) && (Spos.y < Dpos.y) && (Spos.y + SDimen.y > Dpos.y))//Scenario 4
			)
			return DynElem;
	}

};

MAP.prototype.Obstacle = function (position) {
	var xmin = Math.floor(position.x);
	var xmax = Math.ceil(position.x + this.superNacho.dimensions.x);
	var ymin = Math.floor(position.y);
	var ymax = Math.ceil(position.y + this.superNacho.dimensions.y);
	var elementType;
	if ((position.x <= 0) || (position.x + this.superNacho.dimensions.x >= this.width) || (position.y <= 0) || (position.y + this.superNacho.dimensions.y >= this.height))
		elementType = "wall";
	else {
		for ( yo = ymin; yo < ymax; yo++) {
			for (xo = xmin; xo < xmax; xo++) {
				if (this.ElementTypes[yo][xo])
					elementType = this.ElementTypes[yo][xo];
			}
		}
	}
	return elementType;
};

function Vector(X, Y) {
	this.x = X;
	this.y = Y;
}

Vector.prototype.ScalarMult = function (scalar) {
	return new Vector(this.x * scalar, this.y * scalar);
};
Vector.prototype.AddVector = function (otherVector) {
	return new Vector(this.x + otherVector.x, this.y + otherVector.y);
};

var MovingElements = {
	"@": SuperNacho,
	"-": Lava, "|": Lava,
	"o": Coin
};
function SuperNacho(pos) {
	this.position = pos.AddVector(new Vector(0, -0.3));
	this.dimensions = new Vector(0.8, 1.3);
	this.type = "player";
	this.SPEED = 0;
	this.Dead = false;
	this.ymotion = 0;
}

var speed = 8;
SuperNacho.prototype.MoveX = function (levelPlan, key, deltaTime) {
	var obstacleType = null;
	var trialPosition = new Vector(0, 0);
	if (key.left)
		trialPosition.x -= deltaTime * speed;

	if (key.right)
		trialPosition.x += deltaTime * speed;
	var newPosition = this.position.AddVector(trialPosition);

	if (levelPlan.Obstacle(newPosition))
		obstacleType = levelPlan.Obstacle(this.position.AddVector(trialPosition));

	if (obstacleType != "wall") {
		var updatePosition = this.position.AddVector(trialPosition);
		this.position = updatePosition;
	}
	return obstacleType;
};

var gravity = 0.8; var jumpSpeed = 30;
SuperNacho.prototype.MoveY = function (levelPlan, key, deltaTime) {
	var obstacleType = null;
	var displacement = new Vector(0, 0);
	this.SPEED += gravity;
	displacement.y += this.SPEED * deltaTime;
	var newPosition = this.position.AddVector(displacement);
	obstacleType = levelPlan.Obstacle(newPosition);
	//  5.falling down on top of wall. Also static
	if (obstacleType == "wall" && (this.SPEED > 0))
		this.SPEED = 0;
	//	3.pressing the button while superNacho collides with a wall on top of it.
	if (obstacleType == "wall" && (this.SPEED < 0))
		this.SPEED = -this.SPEED;

	//	1.presssing up button when SuperNacho is on the ground. Lets remember that this.
	if (key.up && (obstacleType == "wall") && (this.SPEED == 0)) {
		this.SPEED = -jumpSpeed;
	}
	//  4.falling down through the air... no obstacle
	if (obstacleType != "wall")
		this.position = newPosition;
	return obstacleType;
};

SuperNacho.prototype.Moving = function (deltaTime, levelPlan, key) {
	var moveX = this.MoveX(levelPlan, key, deltaTime);//moveX is a string type
	var moveY = this.MoveY(levelPlan, key, deltaTime);//moveY is a string type
	var DynType = null;///This varialbe will be "null" or "lava"
	var DynElement = levelPlan.SuperNachoOverlap();
	//I need to check if any of the obstacles or dynamic elements is "lava" type, or "coin"
	if (DynElement) {
		//What I will try to do here is to find the coin in the levelPlan's dynamic element array

		if (DynElement.type == "coin") {
			var tempDynElem = [];
			for (var i = 0; i < levelPlan.DynamicElements.length; i++) {
				if (DynElement != levelPlan.DynamicElements[i])
					tempDynElem.push(levelPlan.DynamicElements[i]);
			}
			//I'm substintuting the array so it doesn't include the coin taken.
			levelPlan.DynamicElements = tempDynElem;
		}
		else if (DynElement.type == "lava") {
			DynType = "lava";
		}
	}
	//what is certain is that DynElement = levelPlan.SuperNachoOverlap(); is not informing when SuperNacho is overlapping with moving Lava
	if ((moveX == "lava") || (moveY == "lava") || (DynType == "lava")) {
		this.Dead = true;
		this.dimensions.x = 2;
		this.dimensions.y = 2;
	}
};

function Lava(position, symbol) {
	this.position = position;
	this.dimensions = new Vector(0.3, 0.3);
	if (symbol == "-") {
		this.initialSpeed = new Vector(2, 0);
	}
	else if (symbol == "|") {
		this.initialSpeed = new Vector(0, 2);
	}
	this.type = "lava";
}
var LavaSpeedScalar = 1;
Lava.prototype.Moving = function (deltaTime, levelPlan) {
	///I'll use the MAP.obstacle function to determine if moving lava has collided with "wall"
	var Newposition = new Vector(0, 0);
	Newposition.x = this.position.x; Newposition.y = this.position.y;
	var Displacemet = new Vector(0, 0);
	Displacement = this.initialSpeed.ScalarMult(LavaSpeedScalar * deltaTime);
	Newposition = Newposition.AddVector(Displacement);
	var obstacleType = levelPlan.Obstacle(Newposition);
	if (obstacleType == "wall") {
		this.initialSpeed = this.initialSpeed.ScalarMult(-1);
	}
	else {
		this.position = Newposition;
	}
};
function Coin(position) {
	this.position = position;
	this.dimensions = new Vector(0.4, 0.4);
	this.Oscillation = Math.random() * 2 * Math.PI;
	this.type = "coin";
}

var amplitude = .1; var frequency = 5;
Coin.prototype.Moving = function (timeSegment) {
	this.Oscillation += timeSegment * frequency;
	var Displacement = new Vector(0, amplitude * Math.sin(this.Oscillation));
	var updatePosition = this.position.AddVector(Displacement);
	this.position.x = updatePosition.x; this.position.y = updatePosition.y;
};

var scale = 20;
function DisplayOnCanvas(level, parent) {
	this.faceDirection = "right";
	this.iterationCount = 0;//This variable is used in the sprite animation 
	this.sourceXcoord = 0;//This variable is used in the sprite animation as well
	this.level = level;
	this.canvas = document.createElement("canvas");
	this.canvas.width = Math.min(750, level.width * scale);
	this.canvas.height = Math.min(500, level.height * scale);
	parent.appendChild(this.canvas);
	this.context = this.canvas.getContext('2d');

    this.centering = {
        left: 0,
        top: 0,
      //  height: this.canvas.height,
      //  width: this.canvas.width,
    };
}

DisplayOnCanvas.prototype.Recentering = function () {
	var CanvasWidth = this.canvas.width / scale;
    var CanvasHeight = this.canvas.height/scale;
	var margin = CanvasWidth / 3;
    var LevelWidth = this.level.width;
    var LevelHeight = this.level.height;
	var playerPos = this.level.superNacho.position;
    if (playerPos.x > this.centering.left + CanvasWidth - margin) {
        this.centering.left = Math.min(playerPos.x + margin - CanvasWidth, LevelWidth - CanvasWidth);
    }
    else if (playerPos.x < this.centering.left + margin) {
        this.centering.left = Math.max(playerPos.x - margin,0);
    }
    if (playerPos.y > this.centering.top + CanvasHeight - margin) {
        this.centering.top = Math.min(playerPos.y + margin - CanvasHeight, LevelHeight - CanvasHeight);
    }
    else if (playerPos.y < this.centering.top + margin) {
        this.centering.top = Math.max(playerPos.y - margin,0);
    }
}

var BackgroundBlocks = document.createElement("img");
BackgroundBlocks.src = "tiles.png";
DisplayOnCanvas.prototype.createBackgroundCanvas = function () {
	var sourceXcoord=0;
	var sourceYcoord = 0;
	var recenter = this.centering;
	var xStart = Math.floor(recenter.left);
	var xEnd = Math.ceil(recenter.left + this.canvas.width/scale) ;
	var yStart = Math.floor(recenter.top);
	var yEnd = Math.ceil(recenter.top + this.canvas.height/scale);

	for ( y = yStart; y < yEnd; y++) {
		for (x = xStart; x < xEnd; x++) {
			var pngBlock = this.level.ElementTypes[y][x];
			if (pngBlock == null) {
				continue;
			}
			if (pngBlock == "lava") {
				sourceXcoord = 6 * 18;
				sourceYcoord = 13 * 18;
			}
			if (pngBlock == "wall") {
				sourceXcoord = 10 * 18;
				sourceYcoord = 8 * 18;
			}

			var XscreenCoord = (x - recenter.left)*scale;
			var YscreenCoord = (y - recenter.top)*scale;
			this.context.drawImage(BackgroundBlocks, sourceXcoord, sourceYcoord, 18, 18, XscreenCoord, YscreenCoord,scale,scale);
		}
	}
};

var player = document.createElement("img");
player.src = "character.png";

DisplayOnCanvas.prototype.characterMoving = function (key) {
	if (this.level.superNacho.SPEED != 0) {
		this.characterJump();
	}

	else if (key.right && this.level.superNacho.SPEED == 0) {
		this.characterRight();
	}

	else if (key.left && this.level.superNacho.SPEED == 0) {
		this.characterLeft();
	}
	else {
		this.CharacterStill();
	}
};
DisplayOnCanvas.prototype.characterRight = function () {
	this.faceDirection = "right";
	var playerX = (this.level.superNacho.position.x - this.centering.left) * scale;
	var playerY = (this.level.superNacho.position.y - this.centering.top) * scale;
	var playerSizeX = this.level.superNacho.dimensions.x*scale;
	var playerSizeY = this.level.superNacho.dimensions.y*scale;
	var pngWidth = 864;
	var pngHeight = 280;
	var spriteWidth = pngWidth / 8;
	var spriteHeight = pngHeight / 2;
	this.iterationCount++;
	if (this.iterationCount % 3 == 0) {
		this.sourceXcoord = (this.iterationCount / 3) * spriteWidth;
	}
	if (this.iterationCount % 24 == 0) {
		this.iterationCount = 0;
		this.sourceXcoord = 0;
	}
	this.context.drawImage(player, this.sourceXcoord, 0, spriteWidth, spriteHeight-10, playerX, playerY, playerSizeX, playerSizeY);
};

DisplayOnCanvas.prototype.characterLeft = function () {
	this.faceDirection = "left";
	this.context.scale(-1, 1);
	var playerX = (this.level.superNacho.position.x-this.centering.left) * scale;
	var playerY = (this.level.superNacho.position.y-this.centering.top) * scale;
	var playerSizeX = this.level.superNacho.dimensions.x * scale;
	var playerSizeY = this.level.superNacho.dimensions.y * scale;
	var pngWidth = 864;
	var pngHeight = 280;
	var spriteWidth = pngWidth / 8;
	var spriteHeight = pngHeight / 2;
	this.iterationCount++;
	if (this.iterationCount % 3 == 0) {
		this.sourceXcoord = (this.iterationCount / 3) * spriteWidth;
	}
	if (this.iterationCount % 24 == 0) {
		this.iterationCount = 0;
		this.sourceXcoord = 0;
	}
	this.context.drawImage(player, this.sourceXcoord, 0, spriteWidth, spriteHeight - 10, -1 * playerX - playerSizeX, playerY, playerSizeX, playerSizeY);
}

DisplayOnCanvas.prototype.characterJump = function () {
	var playerX = (this.level.superNacho.position.x - this.centering.left) * scale;
	var playerY = (this.level.superNacho.position.y - this.centering.top) * scale;
	var playerSizeX = this.level.superNacho.dimensions.x * scale;
	var playerSizeY = this.level.superNacho.dimensions.y * scale;
	var pngWidth = 864;
	var pngHeight = 280;
	var spriteWidth = pngWidth / 8;
	var spriteHeight = pngHeight / 2;
	var sourceXcoord = 6 * spriteWidth;
	if (this.faceDirection == "right") {
		this.context.drawImage(player, sourceXcoord, 0, spriteWidth, spriteHeight - 10, playerX, playerY, playerSizeX, playerSizeY);
	}
	else if (this.faceDirection == "left") {
		this.context.scale(-1, 1);
		this.context.drawImage(player, sourceXcoord, 0, spriteWidth, spriteHeight - 10, -1 * playerX - playerSizeX, playerY, playerSizeX, playerSizeY);
	}
}
DisplayOnCanvas.prototype.CharacterStill = function () {
	var playerX = (this.level.superNacho.position.x - this.centering.left) * scale;
	var playerY = (this.level.superNacho.position.y - this.centering.top) * scale;
	var playerSizeX = this.level.superNacho.dimensions.x * scale;
	var playerSizeY = this.level.superNacho.dimensions.y * scale;
	var pngWidth = 864;
	var pngHeight = 280;
	var spriteWidth = pngWidth / 8;
	var spriteHeight = pngHeight / 2;
	var sourceXcoord = 1 * spriteWidth;
	if (this.faceDirection == "right") {
		this.context.drawImage(player, sourceXcoord, 0, spriteWidth, spriteHeight - 10, playerX, playerY, playerSizeX, playerSizeY);
	}
	else if (this.faceDirection == "left") {
		this.context.scale(-1, 1);
		this.context.drawImage(player, sourceXcoord, 0, spriteWidth, spriteHeight - 10, -1 * playerX - playerSizeX, playerY, playerSizeX, playerSizeY);
	}
}

DisplayOnCanvas.prototype.dynamicElsDisplay = function () {
	for (var i = 0; i < this.level.DynamicElements.length; i++) {
		var dynType = this.level.DynamicElements[i].type;
		var x = (this.level.DynamicElements[i].position.x - this.centering.left)*scale;
		var y = (this.level.DynamicElements[i].position.y - this.centering.top)*scale;

		if (dynType == "coin") {
			var sourceXcoord = 10 * 18;
			var sourceYcoord = 6 * 18;
			this.context.drawImage(BackgroundBlocks, sourceXcoord, sourceYcoord, 18, 18, x, y, scale, scale);
		}
		if (dynType == "lava") {
			var sourceXcoord = 6 * 18;
			var sourceYcoord = 13 * 18;
			this.context.drawImage(BackgroundBlocks, sourceXcoord, sourceYcoord, 18, 18, x , y, scale, scale);
		}
	}

};
	DisplayOnCanvas.prototype.updateDisplay = function () {
		this.context.fillStyle = "rgb(52, 166, 251)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

DisplayOnCanvas.prototype.clear = function () {
	this.canvas.parentNode.removeChild(this.canvas);
}

	var KEYCodes = { 32: "pause", 37: "left", 38: "up", 39: "right" };

	function keyListener(KEYCodes) {
		var KeyState = Object.create(null);
		function action(event) {
			var UpOrDown = event.type == "keydown";
			if (KEYCodes.hasOwnProperty(event.keyCode)) {
				KeyState[KEYCodes[event.keyCode]] = UpOrDown;
			}
		}
		addEventListener("keydown", action);
		addEventListener("keyup", action);
		return KeyState;
	}
	var key = new keyListener(KEYCodes);

	function usingAnimationFrame(dispFunction) {

		var LastTime = null;
		var DeltaTime = 0;
		function invokingDrawFunctions(time) {
			if (LastTime != null) {
				DeltaTime = Math.min(time - LastTime, 100) / 1000;
			}
			LastTime = time;
			dispFunction(DeltaTime);
			requestAnimationFrame(invokingDrawFunctions);
		}
		requestAnimationFrame(invokingDrawFunctions);
	}

function playLevel(LevelObject, animatedLevel, KEY, DieAdvance) {
	usingAnimationFrame(function (DeltaTime) {
		for (var j = 0; j < LevelObject.DynamicElements.length; j++) {
			LevelObject.DynamicElements[j].Moving(DeltaTime, LevelObject, KEY);
		}
		animatedLevel.updateDisplay();
		animatedLevel.createBackgroundCanvas();
		animatedLevel.dynamicElsDisplay();
		animatedLevel.characterMoving(KEY);
		animatedLevel.Recentering();
		DieAdvance();
	});
	}

function playGame(Missions, LevelObject, DisplayObject, KEY) {
	function startLevel(i) {
		var levelObject = new LevelObject(Missions[i]);
		var animatedLevel = new DisplayObject(levelObject,document.body);
		playLevel(levelObject, animatedLevel, KEY, function () {
			var coinCount = 0
			for (var j = 0; j < levelObject.DynamicElements.length; j++) {
				if (levelObject.DynamicElements[j].type == "coin")
					coinCount++;
			}

			if (levelObject.superNacho.Dead) {
				levelObject.superNacho.Dead = false;
				animatedLevel.clear();
				startLevel(i);
			}
			if (coinCount == 0) {
				animatedLevel.clear();
				startLevel(i + 1);
			}
		});
	}
	startLevel(0);
}
playGame(LEVELS, MAP, DisplayOnCanvas, key);
