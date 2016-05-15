/**
 * Pictures to be rendered on the canvas.
 *
 * It stores an image inside it and could just render a small portion of it.
 *
 * @param img The image object for the picture.
 * @param x The x position of the portion to be taken.
 * @param y The y position.
 * @param w The width of the portion to be taken.
 * @param h The height.
 * @constructor
 */
function Pic(img, x, y, w, h) {
    this.image = img;
    this.picX = x;
    this.picY = y;
    this.picW = w;
    this.picH = h;
}


/**
 * Draws the picture on the given canvas.
 *
 * @param c The context on which to draw it.
 * @param x The x location on the canvas to draw the picture.
 * @param y The y location.
 * @param w The width of the picture on the canvas.
 * @param h The height.
 */
Pic.prototype.draw = function (c, x, y, w, h) {
    c.drawImage(this.image, this.picX, this.picY, this.picW, this.picH, x, y, w, h);
};


/**
 * Agents on the canvas.
 *
 * Here agents are going to be pictures on the canvas with given position and size.
 *
 * @constructor
 */
function Agent(pic, x, y, w, h) {
    this.pic = pic;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
}


/**
 * Draws the given agent.
 *
 * @param ctx The canvas to draw the agent.
 */
Agent.prototype.draw = function (ctx) {
    this.pic.draw(ctx, this.x, this.y, this.width, this.height);
};


/**
 * Nuts thrown by squirrels.
 **/
function Nut(nutPic, x, y, width, height, velocity) {
    Agent.call(this, nutPic, x, y, width, height);
    this.velocity = velocity;
}

// Inherit from Agent.
Nut.prototype = Object.create(Agent.prototype);


/**
 * Hearts thrown by players.
 **/
function Heart(heartPic, x, y, width, height, velocity) {
    Agent.call(this, heartPic, x, y, width, height);
    this.velocity = velocity;
}

// Inherit from Agent.
Heart.prototype = Object.create(Agent.prototype);


/**
 * The player on the canvas.
 * @constructor
 */
function Player(playerPic, x, y, width, height) {
    Agent.call(this, playerPic, x, y, width, height);
}

// Inherit from Agent.
Player.prototype = Object.create(Agent.prototype);


/**
 * Squirrels to be shot with love.
 * @constructor
 */
function Squirrel(squirrelPic, x, y, width, height, row, column) {
    Agent.call(this, squirrelPic, x, y, width, height);
    this.row = row;
    this.column = column;
}

Squirrel.prototype = Object.create(Agent.prototype);
