import Pair from "./pair";

/**
 * Misc trigonometry functions
 */
class Trigonometry {
    private constructor() {
        // empty
    }

    static toRadians(degrees: number) : number {
        return degrees * Math.PI / 180;
    }

    static reduceZeroTwoPi(rads: number) : number {
        const mod = 2 * Math.PI;
        return ((rads % mod) + mod) % mod;
    }

    static distance(p1: Pair, p2: Pair) : number {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    }

    static distanceFromOrigin(p: Pair) {
        return Math.sqrt(Math.pow((p.x), 2) + Math.pow((p.y), 2));
    }

    static rotateAroundOrigin(p: Pair, radians: number) : Pair {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return new Pair(p.x * c - p.y * s, p.x * s + p.y * c);
    }

    static rotateAbsoluteAroundPivot(pivot: Pair, absolutePoint: Pair, radians: number) {
        const s = Math.sin(radians);
        const c = Math.cos(radians);
        const xo = absolutePoint.x - pivot.x;
        const yo = absolutePoint.y - pivot.y;
        const xt = xo * c - yo * s;
        const yt = xo * s + yo * c;
        const pair = new Pair(xt + pivot.x, yt + pivot.y);
        console.log(pair);
        return pair;
    }

}

export default Trigonometry
