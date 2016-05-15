// Some global constants.
//
// The key codes.
var spaceKey = 32;
var leftArrow = 37;
var rightArrow = 39;
// Global states for the game.
var pause = false;
var BOMB = false;  // For cheating button in the game


/**
 * The main game class.
 *
 * @param canvas The canvas to draw the game on.
 * @param image The image for the game.  It should include all the parts needed.
 * @constructor
 */
function Game(canvas, image) {

    // The base settings for the game.  Different levels will change some of the config values.
    this.config = {

        // (difficultyRate * level + 1) gives the factor for increasing difficulties, which will be used to increase the
        // shooting frequency and velocity.
        difficultyRate: 0.3,
        frequency: 50,  // Updating times per second

        // Score = (difficultyRate * level + 1) * baseScore
        ScorePerSquirrel: 5,
        levelReward: 20,

        // State information related to squirrels
        squirrelRows: 3,  // Constant
        squirrelColumns: 8,  // Constant
        squirrelVelocity: 20,
        nutRate: 0.08,
        nutVelocity: 50,

        // State information related to players, all of which are constant.
        heartVelocity: 150,
        playerVelocity: 300
    };

    // Get the size of the canvas.
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    // Initialize states of the game like the number of lives left.
    this.init();

    // Initialize level difficulty.
    this.setLevelDifficulty();

    // Divide the given picture for all roles.
    this.nutPic = new Pic(image, 120, 68, 150, 155);
    this.heartPic = new Pic(image, 27, 22, 44, 37);
    this.playerPic = new Pic(image, 270, 47, 171, 176);
    this.squirrelPic = new Pic(image, 456, 0, 239, 223);

    // Dimension of the roles.
    this.squirrelWidth = Math.round(this.width / (this.config.squirrelColumns * 2 + 10));
    this.squirrelHeight = this.squirrelWidth;
    this.playerWidth = Math.round(this.squirrelWidth * 1.5);
    this.playerHeight = this.playerWidth;
    this.heartWidth = Math.round(this.squirrelWidth * 0.3);
    this.heartHeight = this.heartWidth;
    this.nutWidth = this.heartWidth;
    this.nutHeight = this.nutWidth;

    // The distance between the squirrel rows.
    this.rowWidth = Math.round(this.squirrelHeight * 1.5);
}


/**
 * Initializes various states of the gaming.
 */
Game.prototype.init = function () {
    this.lives = 3;
    this.score = 0;
    this.nFired = 0;
    this.nHit = 0;
    this.level = 1;
    this.pressedKeys = {};
    this.curStage = new WelcomeStage();
};


/**
 * Sets the velocity and rewards based on the level of game.
 */
Game.prototype.setLevelDifficulty = function () {
    // The overall factor for magnifying the difficulty and score.
    this.lvlMulitiplier = (this.config.difficultyRate * this.level + 1);

    // Increase awards.
    this.curScorePerSquirrel = this.config.ScorePerSquirrel * this.lvlMulitiplier;

    // Increase difficulty.
    this.curSquirrelVelocity = this.config.squirrelVelocity * this.lvlMulitiplier;
    this.curNutRate = this.config.nutRate * this.lvlMulitiplier;
    this.curNutVelocity = this.config.nutVelocity * this.lvlMulitiplier;
};


/**
 * Starts the game.
 */
Game.prototype.start = function () {
    var game = this; //in order to pass the game object into gameLoop
    setInterval(function () {
        game.gameLoop();
    }, 1000 / game.config.frequency);
};


/**
 * Executes one main loop of the game.
 */
Game.prototype.gameLoop = function () {
    var dt = 1000 / this.config.frequency;
    if (!pause) {
        this.curStage.update(this, dt);
        this.curStage.render(this, dt);
    }
};


/**
 * Treats key pressing.
 *
 * @param keyCode The code for the key pressed.
 */
Game.prototype.keyDown = function (keyCode) {
    this.pressedKeys[keyCode] = true;
    if (this.curStage.keyDown) {
        this.curStage.keyDown(this, keyCode);
    }
};


Game.prototype.keyUp = function (keyCode) {
    delete this.pressedKeys[keyCode];
    if (this.curStage.keyUp) {
        this.curStage.keyUp(this, keyCode);
    }
};

Game.prototype.getHitRate = function () {
	if (this.nFired > 0) {
		return Math.round(this.nHit / this.nFired * 100);
	} else {
		return 0;
	}
};

//
// Initialize the game on loading the page.
//
window.onload = function () {
    // Create canvas with the device resolution.
    //
    // Here some hack is needed to maintain high definition of the canvas across devices.  Solution from stack overflow
    // question 15661339.
    var PIXEL_RATIO = (function () {
        var c = document.createElement("canvas").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = c.webkitBackingStorePixelRatio ||
                c.mozBackingStorePixelRatio ||
                c.msBackingStorePixelRatio ||
                c.oBackingStorePixelRatio ||
                c.backingStorePixelRatio || 1;
        return dpr / bsr;
    })();

    var createHiDPICanvas = function (w, h, ratio) {
        if (!ratio) {
            ratio = PIXEL_RATIO;
        }
        var canvas = document.createElement("canvas");
        canvas.width = w * ratio;
        canvas.height = h * ratio;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        return canvas;
    };

    // Create the canvas.  Some space should be left on the page.
    var canvas = createHiDPICanvas(window.innerWidth * 0.7, window.innerHeight * 0.7);
    // Add the canvas to page.
    var info = document.getElementById("info");
    document.body.insertBefore(canvas, info);

    // Load the images for the game and only start the game after it has been loaded and the start button has been clicked.
    var pic = new Image();
    pic.src = "squirrel.png";
    pic.onload = function () {
        var game = new Game(canvas, pic);
        // game.start();

        // Listen to the keyboard events of the three controlling keys.
        window.onkeydown = function keyDown(e) {
            var keycode = e.keyCode;
            // Disable default behavior.
            if (keycode == spaceKey || keycode == leftArrow || keycode == rightArrow) {
                e.preventDefault();
                game.keyDown(keycode);
            }
        };
        window.onkeyup = function keyUp(e) {
            var keycode = e.keyCode;
            game.keyUp(keycode);
        };

        // Start the game once start button is clicked. Start button will be disabled after it.
        var startBtn = document.getElementById("startGame");
        startBtn.onclick = function () {
        	game.start();
        	startBtn.disabled = true;
        };
    };



    // Set the handler for the control buttons of the game.
    var pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.onclick = function () {
        //Now if it is not paused, pause the update process and change the
        // button value to "continue".
        if (!pause) {
            pause = true;
            pauseBtn.innerHTML = "continue";
        } else {
            pause = false;
            pauseBtn.innerHTML = "pause";
        }
    };
    var bombBtn = document.getElementById("bomb");
    bombBtn.onclick = function () {
        BOMB = true;
    };
};