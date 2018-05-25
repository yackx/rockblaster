import Pair from "./pair";
import Drawable from "./drawable";

class Bullet extends Drawable {
    private static readonly TRAVEL_PIXELS_PER_FRAME = 4;

    position: Pair;

    private readonly angle: number; // radians
    private framesToLive: number = 80;

    constructor(ctx: CanvasRenderingContext2D, position: Pair, angle: number) {
        super(ctx);
        this.position = position;
        this.angle = angle;
    }

    /**
     * Let the bullet travel in its original direction, with a predefined speed.
     * @return true if the bullet still has energy to travel
     */
    travel() : boolean {
        this.position.x += Math.sin(this.angle) * Bullet.TRAVEL_PIXELS_PER_FRAME;
        this.position.y -= Math.cos(this.angle) * Bullet.TRAVEL_PIXELS_PER_FRAME;
        this.framesToLive--;
        return this.framesToLive > 0;
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, 4, 4);
    }
}

export default Bullet
