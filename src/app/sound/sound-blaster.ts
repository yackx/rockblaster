import SoundHelper from './sound-helper';

/**
 * Sound that can be played with overlap.
 *
 * The HTMLAudioElement is added to the DOM, the sound is played, then the element is removed
 * from the DOM. This allows a sound to be played multiple time at the same time
 * (eg multiple rock explosions).
 *
 * Caution: this method is resource intensive.
 * It will cause serious lags on Safari if the sound is played continuously
 */
class SoundBlaster {

    constructor(readonly src: string) {
        // empty
    }

    play() {
        const sound = SoundHelper.buildSoundElement(this.src);
        sound.addEventListener('ended', this.destroy);
        document.body.appendChild(sound);
        // noinspection JSIgnoredPromiseFromCall
        sound.play()
    }

    private destroy(event: Event) {
        if (event.target) {
            const audio = event.target as HTMLAudioElement;
            document.body.removeChild(audio);
            audio.removeEventListener('ended', this.destroy);
        }
    }
}

export default SoundBlaster
