class Pair {
    x: number;
    y: number;

    private static ORIGIN = new Pair(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static origin() {
        return this.ORIGIN;
    }

    add(other: Pair) : Pair {
        return new Pair(this.x + other.x, this.y + other.y);
    }

    equals(other: Pair) : boolean {
        return this.x == other.x && this.y == other.y;
    }
}

export default Pair
