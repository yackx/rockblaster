import Keyboard from './keyboard';
import Ship from './ship';
import Pair from './pair';
import Drawable from './drawable';
import Bullet from './bullet';
import Rock from './rock';
import Collision from './collision/collision';
import Circle from "./collision/circle";
import Sound from './sound/sound';
import SoundBlaster from "./sound/sound-blaster";

enum State {
    StartingLevel, Playing, Destroyed, GameOver
}

class Game extends Drawable {
    private static readonly NUMBER_OF_LIVES = 3;

    private state: State = State.StartingLevel;
    private keyboard: Keyboard = new Keyboard();

    private ship: Ship = new Ship(this.ctx);
    private bullets: Bullet[] = [];
    private rocks: Rock[] = [];

    private lives: number = Game.NUMBER_OF_LIVES;
    private score: number = 0;
    private hiScore: number = 0;

    private currentFrame = 0;
    private startingLevelFrame = 0;
    private lastBulletFireFrame = 0;
    private gameOverFrame = 0;
    private shipCollisionFrame = 0;

    private fireSound: Sound = new Sound('/sounds/fire.wav');
    private thrustSound: Sound = new Sound('/sounds/thrust.wav');
    private bangLargeSound: Sound = new Sound('/sounds/bang-large.wav');

    constructor(fgCtx: CanvasRenderingContext2D, readonly bgCtx: CanvasRenderingContext2D) {
        super(fgCtx);
        console.log("new game");
        this.drawBackground();
    }

    // noinspection JSUnusedGlobalSymbols called from app.ts
    /** Execute the game next frame logic according the current state. */
    next() {
        switch (this.state) {
            case State.StartingLevel:
                this.nextLevelStarting(); break;
            case State.Playing:
                this.nextPlaying(); break;
            case State.Destroyed:
                this.nextDestroyed(); break;
            case State.GameOver:
                this.nextGameOver(); break;
            default:
                throw new Error("Unknown game state: " +  this.state);
        }
    }

    /** Perform the game logic when the level is about to start. */
    nextLevelStarting() {
        const waitFrames = this.currentFrame - this.startingLevelFrame;
        if (waitFrames > 3 * 60) {
            console.log("start level");
            this.rocks = [];
            for (let i = 0; i < 8; i++) this.rocks.push(Rock.buildRandom(this.ctx));
            this.state = State.Playing;
        }

        this.playable();
    }

    /** Perform game logic when playing. */
    nextPlaying() {
        this.playable();

        // All rocks gone
        if (this.rocks.length == 0) {
            console.log("level cleared");
            this.state = State.StartingLevel;
            this.startingLevelFrame = this.currentFrame;
        }
    }

    /**
     * Perform game logic when the ship is destroyed.
     * The ship disintegrates during a few seconds. Rocks still move around.
     */
    private nextDestroyed() {
        this.playable();

        if (this.shipCollisionFrame + 4 * 60 < this.currentFrame) {
            // Game over?
            if (this.lives < 1) {
                this.state = State.GameOver;
                this.gameOverFrame = this.currentFrame;
                if (this.score > this.hiScore) {
                    this.hiScore = this.score;
                }
                this.drawBackground();
                return;
            }

            // Check if it is safe to respawn, e.g. no rocks in vicinity
            const safeCircle = new Circle(new Pair(this.getWidth() / 2, this.getHeight() / 2), 50);
            for (let rock of this.rocks) {
                const rockCircle = rock.asCircle();
                if (Collision.circlesOverlap(safeCircle, rockCircle)) {
                    // There are rocks close to the spawning spot. Delay respawn
                    this.startingLevelFrame++;
                    return;
                }
            }

            this.ship.setDestroy(false);
            this.ship.reset();
            this.state = State.Playing;
        }
    }

    /**
     * Perform game logic when the game is over.
     * Displays "Game Over" for a few seconds, then restart the game.
     */
    private nextGameOver() {
        this.playable();

        // Stay on the Game Over screen
        if (this.gameOverFrame + 8 * 60 > this.currentFrame) {
            return;
        }

        // Enough, let's play again. Reset score and ships
        this.lives = Game.NUMBER_OF_LIVES;
        this.score = 0;
        this.ship.setDestroy(false);
        this.ship.reset();
        this.state = State.StartingLevel;
        this.drawBackground();
    }

    /**
     * Common logic when the level is starting (no rocks yet)
     * and when the game is being played. React to control input
     */
    private playable() {
        // Rotate and accelerate ship
        if (this.state == State.Playing) {
            if (this.keyboard.isKeyPressed('ArrowLeft')) this.ship.rotateLeft();
            if (this.keyboard.isKeyPressed('ArrowRight')) this.ship.rotateRight();
            if (this.keyboard.isKeyPressed('ArrowUp')) {
                this.ship.accelerate();
                this.thrustSound.play();
            }
        }
        this.ship.travel();

        // Fire
        if (this.state == State.Playing && this.keyboard.isKeyPressed(' ')) {
            if (this.lastBulletFireFrame + 20 <= this.currentFrame) {
                const bullet = new Bullet(this.ctx, this.ship.firingHeadPosition(), this.ship.spin);
                this.bullets.push(bullet);
                this.lastBulletFireFrame = this.currentFrame;
                this.fireSound.play();
            }
        }

        // Bullets travel
        for (let bullet of this.bullets) {
            if (!bullet.travel()) {
                // Will no longer travel
                this.deleteBullet(bullet);
            }
        }

        // Rocks travel
        for (let rock of this.rocks) {
            rock.travel();
        }

        // Bullet hits rock
        for (let bullet of this.bullets) {
            for (let rock of this.rocks) {
                if (Collision.pointInCircle(bullet.position, rock.asCircle())) {
                    this.deleteBullet(bullet);
                    const exploded = rock.explode();
                    this.deleteRock(rock);
                    if (exploded != null) {
                        const rockFragments = rock.explode();
                        if (rockFragments != null) {
                            this.rocks.push(rockFragments[0]);
                            this.rocks.push(rockFragments[1]);
                        }
                    }
                    this.score++;
                    this.drawBackground();
                    new SoundBlaster('/sounds/bang-small.wav').playOnce();
                    break;
                }
            }
        }

        if (this.state == State.Destroyed || this.state == State.GameOver) {
            return;
        }

        // Rock hits ship
        let shipTriangle = undefined;
        const shipCircle = this.ship.asCircle();
        for (let rock of this.rocks) {
            const rockCircle = rock.asCircle();
            if (Collision.circlesOverlap(shipCircle, rockCircle)) {
                // Coarse-grained collision positive.
                // Lazily built a fine-grained rectangle representation of the ship
                // and check for collision with rock
                if (shipTriangle === undefined) {
                    shipTriangle = this.ship.asTriangle();
                }
                if (Collision.triangleCollidesCircle(shipTriangle, rockCircle)) {
                    this.state = State.Destroyed;
                    this.shipCollisionFrame = this.currentFrame;
                    this.ship.setDestroy(true);
                    this.lives--;
                    this.drawBackground();
                    this.bangLargeSound.play();
                }
            }
        }
    }

    private deleteBullet(bullet: Bullet) {
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
    }

    private deleteRock(rock: Rock) {
        this.rocks.splice(this.rocks.indexOf(rock), 1);
    }

    draw() {
        this.currentFrame++;

        // Can have an effect on anti-aliasing
        // this.ctx.translate(0.5, 0.5);

        // TODO See if this can efficiently be set here once
        // this.ctx.strokeStyle = "white";
        // this.ctx.lineWidth = 1;

        this.clear(this.ctx);

        this.ship.draw();

        for (let bullet of this.bullets) {
            bullet.draw();
        }

        for (let rock of this.rocks) {
            rock.draw();
        }
    }

    private drawBackground() {
        this.clear(this.bgCtx);

        // Remaining ships
        for (let i = this.lives; i > 0; i--) {
            const ship = new Ship(this.bgCtx);
            ship.position = new Pair(i * 30 - 10, 575);
            ship.draw();
        }

        // Score
        this.bgCtx.font = '15px Courier New';
        this.bgCtx.fillStyle = 'white';
        this.bgCtx.textAlign = 'right';
        this.bgCtx.fillText('SCORE: ' + this.score, this.ctx.canvas.clientWidth - 10, 25);
        this.bgCtx.fillText('HI: ' + this.hiScore, this.ctx.canvas.clientWidth - 10, 40);

        // Game over
        if (this.state == State.GameOver) {
            this.bgCtx.font = '20px Courier New';
            this.bgCtx.textAlign = 'center';
            this.bgCtx.textBaseline = 'middle';
            this.bgCtx.fillText('GAME OVER', this.ctx.canvas.clientWidth / 2, this.ctx.canvas.clientHeight / 2);
        }
    }

    private clear(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
    }
}

export default Game
