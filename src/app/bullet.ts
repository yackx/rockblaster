import Pair from "./pair";
import Drawable from "./drawable";
import Settings from "./settings";

class Bullet extends Drawable {
    private static readonly TIME_TO_LIVE = 0.6 * 1000 / Settings.SPEED_FACTOR;
    private static readonly TRAVEL_FACTOR = 0.5 * Settings.SPEED_FACTOR;

    position: Pair;

    private readonly angle: number; // radians
    private timeToLive = Bullet.TIME_TO_LIVE;

    constructor(ctx: CanvasRenderingContext2D, position: Pair, angle: number) {
        super(ctx);
        this.position = position;
        this.angle = angle;
    }

    /**
     * Let the bullet travel in its original direction, with a predefined speed.
     *
     * @return true if the bullet still has energy to travel
     */
    travel(delta: number) : boolean {
        this.position.x += delta * Math.sin(this.angle) * Bullet.TRAVEL_FACTOR;
        this.position.y -= delta * Math.cos(this.angle) * Bullet.TRAVEL_FACTOR;
        this.timeToLive -= delta;
        return this.timeToLive > 0;
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, 4, 4);
    }
}

export default Bullet
