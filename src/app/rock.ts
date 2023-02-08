import Pair from "./pair";
import Drawable from "./drawable";
import Trigonometry from './trigonometry';
import Circle from "./collision/circle";
import Settings from "./settings";

class Rock extends Drawable {
    private static readonly TRAVEL_PIXELS_FACTOR = Settings.SPEED_FACTOR / 8;
    private static readonly SPIN_RADS_FACTOR = Settings.SPEED_FACTOR * 0.01 / 8;
    private static readonly SCALE_FACTORS = [0.25, 0.5, 1.0];
    private static readonly ROCK_SPEED_FACTORS = [1.0, 1.5, 2.0, 2.5];
    private static readonly ROCK_SPIN_FACTORS = [1.0, 2.5, 5.0, 10.0];

    private _angle = 0;                         // direction (radians)
    private spin: number = 0.0;                 // spin (radians per frame)

    /**
     * Create a new rock.
     * @param ctx 2D context
     * @param position Center of the rock
     * @param angle Initial rotation (radians)
     * @param spinFactorIndex Index into the spin lookup table
     * @param speedFactorIndex Index into the speed lookup table
     * @param stage Decay stage
     */
    constructor(ctx: CanvasRenderingContext2D,
                public position: Pair, // center of the rock
                angle: number,
                private readonly spinFactorIndex: number,
                private readonly speedFactorIndex: number,
                private readonly stage: number) {
        super(ctx);
        this.angle = angle;
    }

    static buildRandom(ctx: CanvasRenderingContext2D) : Rock {
        const stage = 2;
        const frameOffset = 38;

        const spinFactorIndex = Math.floor(Math.random() * 2);
        const speedFactorIndex = Math.floor(Math.random() * 2);
        const point = new Pair(Math.random() * ctx.canvas.clientWidth, Math.random() * ctx.canvas.clientHeight);
        const border = Math.random();
        const angle = Math.random() * 2 * Math.PI;

        let position: Pair;

        if (border < 0.25) {
            position = new Pair(point.x, -frameOffset);
        } else if (border >= 0.25 && border < 0.5) {
            position = new Pair(-frameOffset, point.y);
        } else if (border >= 0.5 && border < 0.75) {
            position = new Pair(point.x, ctx.canvas.clientWidth + frameOffset);
        } else {
            position = new Pair(ctx.canvas.clientWidth + frameOffset, point.y);
        }

        return new Rock(ctx, position, angle, spinFactorIndex, speedFactorIndex, stage);
    }

    get angle(): number {
        return this._angle;
    }

    set angle(newAngle: number) {
        // Avoid flat angles (horizontal or vertical).
        // This would be very annoying, should the rock be on the edge of the screen,
        // where it would remain invisible to the player.
        newAngle = Trigonometry.reduceZeroTwoPi(newAngle);

        if (newAngle >= 0.0 && newAngle < Trigonometry.toRadians(20))
            this._angle = Trigonometry.toRadians(20);
        else if (newAngle > Trigonometry.toRadians(360 - 20))
            this._angle = Trigonometry.toRadians(360 - 20);
        else if (newAngle >= Trigonometry.toRadians(90 - 20) && newAngle < Trigonometry.toRadians(90))
            this._angle = Trigonometry.toRadians(90 - 20);
        else if (newAngle > Trigonometry.toRadians(90) && newAngle < Trigonometry.toRadians(90 + 20))
            this._angle = Trigonometry.toRadians(90 + 20);
        else if (newAngle >= Trigonometry.toRadians(180 - 20) && newAngle < Trigonometry.toRadians(180))
            this._angle = Trigonometry.toRadians(180 - 20);
        else if (newAngle > Trigonometry.toRadians(180) && newAngle < Trigonometry.toRadians(180 + 20))
            this._angle = Trigonometry.toRadians(180 + 20);
        else if (newAngle >= Trigonometry.toRadians(270 - 20) && newAngle < Trigonometry.toRadians(270))
            this._angle = Trigonometry.toRadians(270 - 20);
        else if (newAngle > Trigonometry.toRadians(270) && newAngle < Trigonometry.toRadians(270 + 20))
            this._angle = Trigonometry.toRadians(270 + 20);
        else this._angle = newAngle;
    }

    /**
     * Explode this rock.
     * @return {[Rock, Rock]} 2 resulting smaller rocks, or `null` if the rock is completely destroyed.
     */
    explode(): [Rock, Rock] | null {
        if (this.stage == 0) {
            return null;
        }

        const spread = Trigonometry.toRadians(25);
        const stage = this.stage - 1;
        const spinFactorIndex = Math.random() >= 0.5 ? this.spinFactorIndex : this.speedFactorIndex + 1;
        const speedFactorIndex = Math.random() >= 0.5 ? this.speedFactorIndex : this.speedFactorIndex + 1;

        const rock1 = new Rock(this.ctx, this.position, this.angle - spread, spinFactorIndex, speedFactorIndex, stage);
        const rock2 = new Rock(this.ctx, this.position, this.angle + spread, spinFactorIndex, speedFactorIndex, stage);

        return [ rock1, rock2 ];
    }

    /**
     * Let the rock travel based on its direction (angle) and speed.
     * This method also spins the rock.
     */
    animate(delta: number) {
        const offset = 30;      // how many pixels outside the frame before wrapping

        const width = this.ctx.canvas.clientWidth;
        const height = this.ctx.canvas.clientHeight;

        // Calculate displacement. Position and wrap if necessary
        const displacement = delta * Rock.TRAVEL_PIXELS_FACTOR * Rock.ROCK_SPEED_FACTORS[this.speedFactorIndex];

        let x = this.position.x + Math.sin(this._angle) * displacement;
        if (x > width + offset) x = -offset;
        else if (x < -offset) x = width + offset;

        let y = this.position.y -= Math.cos(this._angle) * displacement;
        if (y > height + offset) y = -offset;
        else if (y < -offset) y = height + offset;

        this.position = new Pair(x, y);

        // Spin
        this.spin += (delta * Rock.SPIN_RADS_FACTOR * Rock.ROCK_SPIN_FACTORS[this.spinFactorIndex]) % (2*Math.PI);
    }

    /** Return a fine-grained representation of this rock as a circle, for collision detection. */
    asCircle() : Circle {
        return new Circle(this.position, 36 * this.getScale());
    }

    private getScale() {
        return Rock.SCALE_FACTORS[this.stage];
    }

    draw() {
        const scale = this.getScale();

        const ctx = this.ctx;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2 / scale;

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.spin);

        ctx.beginPath();
        ctx.scale(scale, scale);
        ctx.moveTo(4, 36);
        ctx.lineTo(34, 26);
        ctx.lineTo(33, 8);
        ctx.lineTo(40, -10);
        ctx.lineTo(30, -24);
        ctx.lineTo(12, -28);
        ctx.lineTo(6, -36);
        ctx.lineTo(-12, -30);
        ctx.lineTo(-16, -28);
        ctx.lineTo(-28, -8);
        ctx.lineTo(-30, 8);
        ctx.lineTo(-14, 28);
        ctx.lineTo(4, 36);
        ctx.stroke();

        this.resetTransform();
    }
}

export default Rock
