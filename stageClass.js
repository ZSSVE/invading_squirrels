/**
 * The initial stage prompting player to start.
 * @constructor
 */
function WelcomeStage(game) {
}

WelcomeStage.prototype.update = function (game, dt) {
    //Do nothing
};

/**
 * Render the welcome screen.
 */
WelcomeStage.prototype.render = function (game, dt) {
    var c = game.c;
    var width = game.width;
    var height = game.height;
    c.clearRect(0, 0, game.width, game.height);
    c.font = "30px Comic Sans MS";
    c.fillStyle = "black";
    c.textAlign = "center";
    c.fillText("Press space if you are ready...", width / 2, height / 2);
};

WelcomeStage.prototype.keyDown = function (game, keyCode) {
    // Only treats space to start the game.
    if (keyCode == spaceKey) {
        game.curStage = new LevelIntroStage();
    }
};


/**
 * Introduction stage informing players the incoming stage.
 */
function LevelIntroStage(game) {
    this.msg1 = "";
    this.msg2 = "Starts in 3 seconds";
    this.startTime = new Date();
}

/**
 * Counts down the beginning time.
 */
LevelIntroStage.prototype.update = function (game, dt) {
    this.msg1 = "Next level: " + game.level;
    var now = new Date();
    var remaining = 3000 - (now - this.startTime);
    if (remaining > 0) {
        this.msg2 = "Starts in " + Math.round(remaining / 1000) + " seconds";
    }
    else {
        game.curStage = new PlayStage(game);
    }
};

/**
 * Prints the two lines of messages.
 */
LevelIntroStage.prototype.render = function (game, dt) {
    var c = game.c;
    var width = game.width;
    var height = game.height;
    c.clearRect(0, 0, game.width, game.height);
    c.font = "20px Comic Sans MS";
    c.fillStyle = "black";
    c.textAlign = "center";
    c.fillText(this.msg1, width / 2, height / 2 - 40);
    c.fillText(this.msg2, width / 2, height / 2);
};


/**
 * The stage after the game is over.
 *
 * This stage happens either the three lives are used up or all the three difficulties levels are cleared.
 *
 * @constructor
 */
function GameOverStage(game, gameResults) {
    this.gameResults = gameResults;
}

GameOverStage.prototype.update = function (game, dt) {
    //Do nothing
};


GameOverStage.prototype.render = function (game, dt) {
    var c = game.c;
    var width = game.width;
    var height = game.height;
    c.clearRect(0, 0, game.width, game.height);
    c.font = "20px Comic Sans MS";
    c.fillStyle = "black";
    c.textAlign = "center";
    var msg = "Your score is: " + Math.round(game.score) + "!";
    c.fillText(this.gameResults, width / 2, height / 2 - 80);
    c.fillText(msg, width / 2, height / 2 - 40)
    c.fillText("Press space to play again", width / 2, height / 2);
};

/**
 * Starts over again when space is pressed.
 */
GameOverStage.prototype.keyDown = function (game, keyCode) {
    if (keyCode == spaceKey) {
        game.init();
        game.curStage = new LevelIntroStage(game);
    }
};


/**
 * Core stage of game.
 */
function PlayStage(game) {
    game.setLevelDifficulty();

    // Clear squirrels and players.
    game.player = null;
    game.squirrels = [];
    game.nuts = [];
    game.hearts = [];

    // Create squirrels.
    var columns = game.config.squirrelColumns;
    var rows = game.config.squirrelRows;
    var colSpacing = game.squirrelWidth;

    for (var row = 1; row <= rows; row++) {
        for (var col = 1; col <= columns; col++) {
            var xPos = colSpacing * col + game.squirrelWidth * (col - 1);  // Make sure the first column has spacing.
            var yPos = row * game.rowWidth;
            var squirrel = new Squirrel(
                game.squirrelPic, xPos, yPos, game.squirrelWidth,
                game.squirrelHeight, row, col
            );
            game.squirrels.push(squirrel);
        }
    }

    // Create the player.
    game.player = new Player(
        game.playerPic, game.width / 2, game.height - game.playerHeight, game.playerWidth, game.playerHeight
    );
}

PlayStage.prototype.update = function (game, dt) {
    if (BOMB) {
        game.squirrels = [];
        BOMB = false;
    }
    this.throwNut(game, dt);
    this.updateNut(game, dt);
    this.updateSquirrel(game, dt);
    this.updateHeart(game, dt);
    this.updatePlayer(game, dt);
    this.checkCollision(game);
    this.checkGameState(game);
};

PlayStage.prototype.render = function (game, dt) {
    // Prepare for drawing.  Collect dimension and clear the background.
    var c = game.c;
    var width = game.width;
    var height = game.height;
    c.clearRect(0, 0, game.width, game.height);

    // Draw game info.
    c.font = "20px Comic Sans MS";
    c.fillStyle = "black";
    c.textAlign = "center";
    var msg1 = "Level: " + game.level;
    var msg2 = "Lives: " + game.lives;
    var msg3 = (
        "Scores: " + Math.round(game.score) + 
        " /Hit rate: " + game.getHitRate() + "%"
        );
    c.fillText(msg1, width * 0.1, 25);
    c.fillText(msg2, width * 0.3, 25);
    c.fillText(msg3, width * 0.6, 25);

    // Draw all images.
    game.player.draw(c);
    game.squirrels.forEach(function (squirrel) {
        squirrel.draw(c);
    });
    game.hearts.forEach(function (heart) {
        heart.draw(c);
    });
    game.nuts.forEach(function (nut) {
        nut.draw(c);
    });
};

/**
 * Handles key pression during game play.
 *
 * Throw a heart or move the player left or right in accordance with the key being pressed down.
 */
PlayStage.prototype.keyDown = function (game, keyCode) {
    var playstage = this;
    if (keyCode == spaceKey) {
        playstage.throwHeart(game);
    }
    // Leave treatment of arrow keys to the update state function.
};


/**
 * Adds a heart at the overhead position of the player.
 */
PlayStage.prototype.throwHeart = function (game) {
    var newHeart = new Heart(
        game.heartPic, game.player.x, (game.player.y - game.playerHeight),
        game.heartWidth, game.heartHeight, game.config.heartVelocity
    );
    game.hearts.push(newHeart);
    game.nFired++;
};

/**
 * Front suqirrels all have a chance of throwing a nut.
 */
PlayStage.prototype.throwNut = function (game, dt) {
    var frontSquirrels = this.findFrontSquirrels(game);
    for (var key in frontSquirrels) {
        if (frontSquirrels.hasOwnProperty(key)) {
            var squirrel = frontSquirrels[key];
            var chance = game.curNutRate * dt / 1000;
            if (chance > Math.random()) {
                var newNut = new Nut(
                    game.nutPic, squirrel.x, squirrel.y + game.squirrelHeight,
                    game.nutWidth, game.nutHeight, game.curNutVelocity
                );
                game.nuts.push(newNut);
            }
        }
    }
};

/**
 * Finds squirrels that have a chance of throwing nuts.
 */
PlayStage.prototype.findFrontSquirrels = function (game) {
    var frontSquirrels = {};
    game.squirrels.forEach(function (squirrel) {
        if (!frontSquirrels[squirrel.column] || frontSquirrels[squirrel.column].row < squirrel.row) {
            frontSquirrels[squirrel.column] = squirrel;
        }
    });
    return frontSquirrels;
};

/**
 * Move nuts downward.
 *
 * Remove it if it goes beyond of the canvas.
 */
PlayStage.prototype.updateNut = function (game) {
    var newNuts = [];
    var dt = 1000 / game.config.frequency;

    game.nuts.forEach(function (nut) {
        nut.y += game.curNutVelocity * dt / 1000;
        if (nut.y <= game.height) {
            newNuts.push(nut);
        }
        game.nuts = newNuts;
    });
};


/**
 * Move hearts upward.
 *
 * Remove it if it goes beyond the canvas.
 */
PlayStage.prototype.updateHeart = function (game) {
    var newHearts = [];
    var dt = 1000 / game.config.frequency;

    game.hearts.forEach(function (heart) {
        heart.y -= game.config.heartVelocity * dt / 1000;
        if (heart.y >= 0) {
            newHearts.push(heart);
        }
    });

    game.hearts = newHearts;
};

/**
 * Updates the state of the player.
 */
PlayStage.prototype.updatePlayer = function (game, dt) {
    if (game.player) {
        var velocity = 0;
        if (game.pressedKeys[leftArrow]) {
            velocity = game.config.playerVelocity;
        }
        if (game.pressedKeys[rightArrow]) {
            velocity = -1 * game.config.playerVelocity;
        }
        if (velocity !== 0) {
            dt = 1000 / game.config.frequency;
            var newX = game.player.x - velocity * dt / 1000;

            // Check if new position is inside of canvas.
            if (newX >= game.width - game.playerWidth) {
                newX = game.width - game.playerWidth;
            } else if (newX < 0) {
                newX = 0;
            }
            game.player.x = newX;
        }
    }
};


/**
 * Move the squirrels.
 *
 * If one squirrel hit the left wall, all squirrels move one row downward and move towards right, vice versa for hitting
 * the right.  If one squire hit the bottom, the game is over.
 */
PlayStage.prototype.updateSquirrel = function (game) {
    var dt = 1000 / game.config.frequency;
    var hitSides = false;

    for (var i = 0; i < game.squirrels.length; i++) {
        var squirrel = game.squirrels[i];
        var newx = squirrel.x + game.curSquirrelVelocity * dt / 1000;

        if (newx >= 0 && newx <= game.width - game.squirrelWidth) {
            squirrel.x = newx;
        } else {
            hitSides = true;
            break;
        }
    }

    // If hit the sides, move squirrels downwards and check if any one hit the bottom. If so, set the lives to zero.
    if (hitSides) {
        var hitBottom = this.changeDirection(game);
        if (hitBottom) {
            this.lives = 0;
        }
    }
};

/**
 * Change all squirrels moving direction to the opposite and moves all squirrels one row down.
 *
 * @return boolean representing if any squirrel hit the bottom.
 */
PlayStage.prototype.changeDirection = function (game) {
    var hitBottom = false;
    game.curSquirrelVelocity = game.curSquirrelVelocity * -1;
    game.squirrels.forEach(function (squirrel) {
        squirrel.y += game.rowWidth;
        if (squirrel.y >= game.height - game.squirrelHeight) {
            hitBottom = true;
        }
    });
    return hitBottom;
};

/**
 * Checks if anyone is hit.
 */
PlayStage.prototype.checkCollision = function (game) {
    //Check if the player has been hit
    for (var i = 0; i < game.nuts.length; i++) {
        var nut = game.nuts[i];
        if (nut.x >= game.player.x &&
            nut.x <= (game.player.x + game.playerWidth) &&
            nut.y >= (game.player.y - game.playerHeight)
        ) {
            game.nuts.splice(i--, 1);
            game.lives--;
        }
    }

    // Check if squirrels have been hit by heart.
    for (i = 0; i < game.squirrels.length; i++) {
        var squirrel = game.squirrels[i];
        var hit = false;
        for (var j = 0; j < game.hearts.length; j++) {
            var heart = game.hearts[j];

            if (heart.x >= squirrel.x &&
                heart.x <= (squirrel.x + game.squirrelWidth) &&
                heart.y >= (squirrel.y - game.squirrelHeight) &&
                heart.y <= squirrel.y) {

                game.hearts.splice(j--, 1);
                hit = true;
                game.score += game.curScorePerSquirrel * game.lvlMulitiplier;
                break;
            }
        }

        if (hit) {
            game.nHit++;
            game.squirrels.splice(i--, 1);
        }
    }


    // Check if squirrels hit the player. If so, set the lives to be zero.
    for (i = 0; i < game.squirrels.length; i++) {
        squirrel = game.squirrels[i];
        if (squirrel.x >= game.player.x &&
            (squirrel.x + game.squirrelWidth) <= (game.player.x + game.playerWidth) &&
            (squirrel.y + game.squirrelHeight) > (game.player.y - game.playerHeight)) {
            game.lives = 0;
        }
    }
};

PlayStage.prototype.checkGameState = function (game) {
    // Check if player wins.
    if (game.squirrels.length === 0) {
        game.score += game.config.levelReward * game.lvlMulitiplier;
        game.level += 1;
        if (game.level >= 4) {
            game.curStage = new GameOverStage(game, "You won!");
        } else {
            game.curStage = new LevelIntroStage(game);
        }
    }

    // Check if player lose.
    if (game.lives <= 0) {
        game.curStage = new GameOverStage(game, "You lost!");
    }
};




