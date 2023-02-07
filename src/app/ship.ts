import Pair from './pair'
import Drawable from './drawable';
import Trigonometry from './trigonometry';
import Triangle from "./collision/triangle";
import Circle from "./collision/circle";

class Ship extends Drawable {
    private static readonly ROTATION_RATE = 0.07;   // in radians per frame

    position: Pair;                                 // center of the ship, at the middle of the A horizontal leg
    spin = 0;                                       // in radians. 0 = heading up
    speed: Pair;
    collisionStartFrame = 0;                        // frame where ship collision occurred

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);
        this.position = Pair.origin();
        this.speed = Pair.origin();
        this.setDestroy(false);
        this.reset();
    }

    firingHeadPosition() : Pair {
        return Trigonometry.rotateAroundOrigin(new Pair(0, -10), this.spin).add(this.position);
    }

    rotateLeft() {
        let dr = this.spin - Ship.ROTATION_RATE;
        if (dr < 0) dr += 2*Math.PI;
        this.spin = dr % (2*Math.PI);
    }

    rotateRight() {
        this.spin += Ship.ROTATION_RATE % (2*Math.PI);
    }

    setDestroy(destroyed: boolean) {
        if (destroyed) {
            this.collisionStartFrame = 0;
        } else {
            this.collisionStartFrame = NaN;
        }
    }

    reset() {
        this.position = new Pair(this.getWidth() / 2, this.getHeight() / 2);
        this.speed = Pair.origin();
        this.spin = 0.0;
    }

    accelerate() {
        // Adjust thrust vector.
        // If the ship is not moving, give it a kick.
        // It helps with the round to 0 later
        const thrustFactor = this.speed.equals(Pair.origin()) ? 0.15 : 0.1;

        // Build a thrust vector based on ship spin
        const thrust = new Pair(Math.sin(this.spin) * thrustFactor, -Math.cos(this.spin) * thrustFactor);

        // New speed = current speed + thrust vector
        let newSpeed = thrust.add(this.speed);

        // Avoid very slow movement by rounding to zero
        const min = 0.1;
        // noinspection JSSuspiciousNameCombination complains x vs y
        if (Math.abs(newSpeed.x) < min && Math.abs(newSpeed.y) < min) {
            newSpeed = Pair.origin();
        }

        // Speed limit
        const d = Trigonometry.distanceFromOrigin(newSpeed);
        if (d <= 5.0) {
            this.speed = newSpeed;
        }
    }

    /** Return a coarse-grained representation of this ship as a circle, for collision detection. */
    asCircle() : Circle {
        return new Circle(this.position, 14);
    }

    /** Return a fine-grained representation of this ship as a triangle, for collision detection. */
    asTriangle() : Triangle {
        const head = Trigonometry.rotateAroundOrigin(new Pair(0, -10), this.spin).add(this.position);
        const leftPawn = Trigonometry.rotateAroundOrigin(new Pair(-12, 10), this.spin).add(this.position);
        const rightPawn = Trigonometry.rotateAroundOrigin(new Pair(12, 10), this.spin).add(this.position);

        return new Triangle(head, leftPawn, rightPawn);
    }

    travel() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        // wrap around screen
        const offset = 40;
        if (this.position.x < -offset) this.position.x = super.getWidth();
        else if (this.position.x > super.getWidth() + offset) this.position.x = 0;
        if (this.position.y < -offset) this.position.y = super.getHeight();
        else if (this.position.y > super.getHeight()) this.position.y = 0;

        if (this.collisionStartFrame != null) this.collisionStartFrame++;
    }

    draw() {
        // if the ship is destroyed, it fragments are rotated during an animation
        const destroyedRotation = this.isDestroyed() ?
            (this.collisionStartFrame * 0.02) % (2 * Math.PI) :
            NaN;

        // destroyed ship will progressively vanish
        const alpha = this.isDestroyed() ? 1.0 - this.collisionStartFrame * 0.005 : 1.0;

        const ctx = this.ctx;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toString()})`;
        ctx.lineWidth = 2;

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.spin);

        // horizontal bar
        ctx.save();
        if (this.isDestroyed()) {
            ctx.rotate(destroyedRotation);
        }
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();

        // left leg
        ctx.save();
        if (this.isDestroyed()) {
            ctx.translate(-this.collisionStartFrame, 0);
            ctx.rotate(destroyedRotation);
        }
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, 10);
        ctx.stroke();
        ctx.restore();

        // right leg
        if (this.isDestroyed()) {
            ctx.translate(this.collisionStartFrame, 0);
            ctx.rotate(destroyedRotation);
        }
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, 10);
        ctx.stroke();

        this.resetTransform();
    }

    private isDestroyed() {
        return !isNaN(this.collisionStartFrame);
    }
}

export default Ship
