// @ts-check

"use strict";

/**
 * Class that handles the movement and animation of the main player character. It's unique in the game.
 */
class Player {
  /**
   * @param {Game} game - Reference to game
   */
  constructor(game) {
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
  }

  /**
   * @param {CanvasRenderingContext2D} context - Reference to context canvas
   */
  draw(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Update horizontal position of the player
   */
  update() {
    this.x += this.speed;
  }
}

/**
 * Class that handles the projectiles that players shoot.
 */
class Projectile {}

/**
 * Class that draws and animates space invaders in the game.
 */
class Enemy {}

/**
 * Class that contains the main logic of the codebase. It holds everything together.
 */
class Game {
  /**
   * @param {HTMLCanvasElement} canvas - Reference to canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.player = new Player(this);
  }

  /**
   * Will drawn and update everything 60 times per second
   * @param {CanvasRenderingContext2D} context - Reference to context canvas
   */
  render(context) {
    this.player.draw(context);
    this.player.update();
  }
}

window.addEventListener("load", () => {
  const canvasId = "#canvas1";
  const canvas = document.querySelector(canvasId);

  if (!canvas) {
    throw new Error(`Could not found '${canvasId}' element`);
  }
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`'${canvasId}' is not a 'HTMLCanvasElement'`);
  }

  canvas.width = 600;
  canvas.height = 800;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Context identifier is not supported, or the canvas has already been set to a different context mode"
    );
  }

  const game = new Game(canvas);

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    window.requestAnimationFrame(animate);
  };

  animate();
});
