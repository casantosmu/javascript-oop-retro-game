// @ts-check

"use strict";

/**
 * Rectangle
 * @typedef {{x: number, y: number, width: number, height: number}} Rectangle
 */

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
class Enemy {
  /**
   * @param {Game} game - Reference to game
   * @param {number} positionX - Position of the enemy within the wave
   * @param {number} positionY - Position of the enemy within the wave
   */
  constructor(game, positionX, positionY) {
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x = 0;
    this.y = 0;
    this.positionX = positionX;
    this.positionY = positionY;
    this.markedForDeletion = false;
  }

  /**
   * @param {CanvasRenderingContext2D} context - Reference to context canvas
   */
  draw(context) {
    context.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Update position of the enemy
   * @param {number} x - Set x position of the enemy relative to the wave
   * @param {number} y - Set y position of the enemy relative to the wave
   */
  update(x, y) {
    this.x = this.positionX + x;
    this.y = this.positionY + y;

    for (const projectile of this.game.projectilesPool) {
      if (!projectile.free && this.game.checkCollision(this, projectile)) {
        this.markedForDeletion = true;
        projectile.reset();
      }
    }
  }
}

/**
 * Class that draws and animates waves of enemies.
 */
class Wave {
  /**
   * @param {Game} game - Reference to game
   */
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = 0;
    this.y = -this.height;
    this.speedX = 3;
    this.speedY = 0;
    /** @type {Enemy[]} */
    this.enemies = [];
    this.#create();
  }

  /**
   * @param {CanvasRenderingContext2D} context - Reference to context canvas
   */
  draw(context) {
    if (this.y < 0) {
      this.y += 5;
    }
    this.speedY = 0;
    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }
    this.x += this.speedX;
    this.y += this.speedY;

    for (const enemy of this.enemies) {
      enemy.update(this.x, this.y);
      enemy.draw(context);
    }

    this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
  }

  /**
   * Create the grid of the wave
   */
  #create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        const enemyX = x * this.game.enemySize;
        const enemyY = y * this.game.enemySize;
        this.enemies.push(new Enemy(this.game, enemyX, enemyY));
      }
    }
  }
}

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

    this.columns = 3;
    this.rows = 3;
    this.enemySize = 60;

    /** @type {Wave[]} */
    this.waves = [];
    this.waves.push(new Wave(this));

    window.addEventListener("keydown", (event) => {
      if (!this.keys.includes(event.key)) {
        this.keys.push(event.key);
      }

      if (event.key === "1") {
        this.player.shoot();
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

    for (const wave of this.waves) {
      wave.draw(context);
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

  /**
   * Collision detection between two rectangles
   * @param {Rectangle} a - Rectangle A
   * @param {Rectangle} b - Rectangle B
   */
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}

window.addEventListener("load", () => {
  const canvasId = "#canvas";
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

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;

  const game = new Game(canvas);

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    window.requestAnimationFrame(animate);
  };

  animate();
});
