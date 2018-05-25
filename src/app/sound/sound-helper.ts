class SoundHelper {

    constructor() {
        // empty
    }

    /** Build an HTMLAudioElement. This method does not add it to the DOM. */
    static buildSoundElement(src: string) : HTMLAudioElement {
        const sound = document.createElement('audio');
        sound.src = src;
        sound.setAttribute('preload', 'auto');
        sound.setAttribute('controls', 'none');
        sound.style.display = 'none';
        return sound;
    }
}

export default SoundHelper
