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
    if (this.game.keys.includes("ArrowLeft")) {
      this.x -= this.speed;
    }
    if (this.game.keys.includes("ArrowRight")) {
      this.x += this.speed;
    }
    if (this.game.keys.includes("1")) {
      this.shoot();
    }

    if (this.x < -this.width * 0.5) {
      this.x = -this.width * 0.5;
    } else if (this.x > this.game.width - this.width * 0.5) {
      this.x = this.game.width - this.width * 0.5;
    }
  }

  /**
   * Shoot projectile
   */
  shoot() {
    const projectile = this.game.getProjectile();
    if (projectile) {
      projectile.start(this.x + this.width * 0.5, this.y);
    }
  }
}

/**
 * Class that handles the projectiles that players shoot.
 */
class Projectile {
  constructor() {
    this.width = 4;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    /**
     * If true is sitting in the pool to be use
     * If false we pool it from the pool and is not available
     */
    this.free = true;
  }

  /**
   * @param {CanvasRenderingContext2D} context - Reference to context canvas
   */
  draw(context) {
    if (!this.free) {
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  /**
   * Update position of the projectile
   */
  update() {
    if (!this.free) {
      this.y -= this.speed;

      if (this.y < -this.height) {
        this.reset();
      }
    }
  }

  /**
   * When it's taken from the pool
   * @param {number} x - x coordinate of the projectile
   * @param {number} y - y coordinate of the projectile
   */
  start(x, y) {
    this.x = x - this.width * 0.5;
    this.y = y;
    this.free = false;
  }

  /**
   * When it's return back to the pool
   */
  reset() {
    this.free = true;
  }
}

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

    /** @type {string[]} */
    this.keys = [];

    this.player = new Player(this);

    /** @type {Projectile[]} */
    this.projectilesPool = [];
    this.numberOfProjectiles = 10;
    this.#createProjectiles();

    window.addEventListener("keydown", (event) => {
      if (!this.keys.includes(event.key)) {
        this.keys.push(event.key);
      }
    });

    window.addEventListener("keyup", (event) => {
      const keyIndex = this.keys.indexOf(event.key);

      if (keyIndex > -1) {
        this.keys.splice(keyIndex, 1);
      }
    });
  }

  /**
   * Will drawn and update everything 60 times per second
   * @param {CanvasRenderingContext2D} context - Reference to context canvas
   */
  render(context) {
    this.player.draw(context);
    this.player.update();

    for (const projectile of this.projectilesPool) {
      projectile.update();
      projectile.draw(context);
    }
  }

  /**
   * Fill the pool with projectiles at once for performance reasons
   */
  #createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }

  /**
   * Taken one free projectile from the pool
   */
  getProjectile() {
    for (const projectile of this.projectilesPool) {
      if (projectile.free) {
        return projectile;
      }
    }
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
