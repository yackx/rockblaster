import SoundHelper from './sound-helper';

/** Sound that can be played with overlap */
class SoundBlaster {

    // The HTMLAudioElement is added to the DOM, the sound is played, then the element is removed
    // from the DOM. This allows a sound to be played multiple time at the same time
    // (eg multiple rock explosions)

    private readonly sound: HTMLAudioElement;

    constructor(readonly src: string) {
        this.sound = SoundHelper.buildSoundElement(src);
        this.sound.addEventListener('ended', this.destroy, false);
        document.body.appendChild(this.sound);
    }

    playOnce() {
        this.sound.play()
            .catch(() => { this.destroy() })
    }

    private destroy() {
        if (this.sound != null && this.sound != undefined) {
            document.body.removeChild(this.sound);
        }
    }
}

export default SoundBlaster
