import SoundHelper from './sound-helper';

class Sound {

    // The HTMLAudioElement is added to the DOM ony once, and can be re-used several times.
    // This version has better performance than the SoundBlaster.
    // However, there can be no overlapping playback. (eg ship thrust)

    private readonly sound: HTMLAudioElement;

    constructor(readonly src: string) {
        this.sound = SoundHelper.buildSoundElement(src);
        document.body.appendChild(this.sound);
    }

    play() {
        // noinspection JSIgnoredPromiseFromCall
        this.sound.play();
    }
}

export default Sound
