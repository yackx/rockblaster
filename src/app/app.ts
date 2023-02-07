import Game from './game'

let game: Game;

window.onload = function() {
    console.log("window.onload");
    const fgContext = getCanvasContext('foreground');
    const bgContext = getCanvasContext('background');
    game = new Game(fgContext, bgContext);
    animate();
};

function animate() {
    window.requestAnimationFrame(animate);
    game.draw();
    game.next();
}

function getCanvasContext(id: string) {
    let canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        throw new Error("No context for canvas " + id);
    }
    return ctx;
}
