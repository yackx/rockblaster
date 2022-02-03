import Game from './game'

require('../media/fire.wav');
require('../media/thrust.wav');
require('../media/bang-small.wav');
require('../media/bang-large.wav');

let game;

window.onload = function() {
    console.log("window.onload");
    const fgContext = getCanvasContext('foreground');
    const bgContext = getCanvasContext('background');
    game = new Game(fgContext, bgContext);
    animate();
};

function animate() {
    requestAnimFrame(animate);
    game.draw();
    game.next();
}

function getCanvasContext(id) {
    let canvas = document.getElementById(id);
    if (!canvas.getContext) {
        throw new Error("No context for canvas", id);
    }
    return canvas.getContext('2d');
}

/**
 * requestAnim shim layer by Paul Irish.
 *
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame       ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
            };
})();
