class Keyboard {
    private static readonly KEYS: string[] = ['ArrowUp', 'ArrowLeft', 'ArrowRight', ' ']

    // Keys currently key pressed are set to true
    private keysStatus: {[code: string]: boolean} = {}

    private readonly keyDownEventListener: (e: KeyboardEvent) => void
    private readonly keyUpEventListener: (e: KeyboardEvent) => void

    constructor() {
        for (const key in Keyboard.KEYS) {
            this.keysStatus[key] = false
        }
        this.keyDownEventListener = this.onKeyDown.bind(this)
        window.addEventListener('keydown', this.keyDownEventListener)
        this.keyUpEventListener = this.onKeyUp.bind(this)
        window.addEventListener('keyup', this.keyUpEventListener)
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key !== undefined) {
            if (this.recordKeyDown(e.key)) {
                e.preventDefault()
            }
        }
    }

    private onKeyUp(e: KeyboardEvent) {
        if (e.key !== undefined) {
            if (this.recordKeyUp(e.key)) {
                e.preventDefault()
            }
        }
    }

    isKeyPressed(key: string): boolean {
        return this.keysStatus[key]
    }

    recordKeyDown(key: string): boolean {
        if (Keyboard.KEYS.indexOf(key) > -1) {
            this.keysStatus[key] = true
            return true
        }
        return false
    }

    recordKeyUp(key: string): boolean {
        if (Keyboard.KEYS.indexOf(key) > -1) {
            this.keysStatus[key] = false
            return true
        }
        return false
    }
}

export default Keyboard
