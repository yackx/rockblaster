class Pair {
    private static ORIGIN = new Pair(0, 0)

    constructor(public x: number, public y: number) {
        // empty
    }

    static origin() {
        return this.ORIGIN
    }

    add(other: Pair): Pair {
        return new Pair(this.x + other.x, this.y + other.y)
    }

    equals(other: Pair): boolean {
        return this.x == other.x && this.y == other.y
    }
}

export default Pair
