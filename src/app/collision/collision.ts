import Pair from '../pair'
import Rectangle from './rectangle'
import Circle from './circle'
import Trigonometry from '../trigonometry'
import Triangle from './triangle'

class Collision {
    // noinspection JSUnusedLocalSymbols
    private constructor() {
        // not meant to be instantiated
    }

    static rectCollidesPoint(r: Rectangle, p: Pair): boolean {
        return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
    }

    static rectCollidesRect(r1: Rectangle, r2: Rectangle): boolean {
        return !(r1.x > r2.x + r2.w || r1.x + r1.w < r2.x || r1.y > r2.y + r2.h || r1.y + r1.h < r2.y)
    }

    static triangleCollidesCircle(t: Triangle, c: Circle): boolean {
        return Collision.pointInCircle(t.p1, c) || Collision.pointInCircle(t.p2, c) || Collision.pointInCircle(t.p3, c)
    }

    static circlesOverlap(c1: Circle, c2: Circle): boolean {
        const dx = c2.center.x - c1.center.x
        const dy = c2.center.y - c1.center.y
        const rSum = c1.radius + c2.radius
        return dx * dx + dy * dy <= rSum * rSum
    }

    static pointInCircle(p: Pair, c: Circle): boolean {
        return Trigonometry.distance(p, c.center) < c.radius
    }
}

export default Collision
