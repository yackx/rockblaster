class Keyboard {

    private static readonly KEYS: string[] = [
        'ArrowUp', 'ArrowLeft', 'ArrowRight', ' '
    ];

    // Keys currently key pressed are set to true
    private keysStatus: { [code: string]: boolean } = {};

    constructor() {
        for (let key in Keyboard.KEYS) {
            this.keysStatus[key] = false;
        }

        this.bindKeys();
    }

    private bindKeys() {
        const thiz = this;

        window.addEventListener('keydown', function(e: KeyboardEvent) {
            if (e.key !== undefined) {
                if (thiz.recordKeyDown(e.key)) {
                    e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', function(e: KeyboardEvent) {
            if (e.key !== undefined) {
                if (thiz.recordKeyUp(e.key)) {
                    e.preventDefault();
                }
            }
        });
    };

    isKeyPressed(key:string): boolean {
        return this.keysStatus[key];
    }

    recordKeyDown(key: string): boolean {
        if (Keyboard.KEYS.indexOf(key) > -1) {
            this.keysStatus[key] = true;
            return true;
        }
        return false;
    }

    recordKeyUp(key: string): boolean {
        if (Keyboard.KEYS.indexOf(key) > -1) {
            this.keysStatus[key] = false;
            return true;
        }
        return false;
    }
}

export default Keyboard
