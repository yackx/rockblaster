/**
 * Drawable element.
 */
class Drawable {
    constructor(protected readonly ctx: CanvasRenderingContext2D) {
        // empty
    }

    /**
     * Polyfill for canvas resetTransform()
     *
     *     this.ctx.resetTransform();
     *
     * for some reason does not work with TypeScript.
     */
    resetTransform() {
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/resetTransform
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    getWidth(): number {
        return this.ctx.canvas.clientWidth
    }

    getHeight(): number {
        return this.ctx.canvas.clientHeight
    }

    draw() {
        throw new Error('Subclasses should implement this method')
    }
}

export default Drawable
