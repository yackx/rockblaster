import Pair from '../pair'

class Circle {
    center: Pair;
    radius: number;

    constructor(center: Pair, radius: number) {
        this.center = center;
        this.radius = radius;
    }
}

export default Circle;
