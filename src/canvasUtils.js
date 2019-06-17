// @flow
export function configureRetinaCanvas(canvas: HTMLCanvasElement) {
    // hidpi canvas: https://www.html5rocks.com/en/tutorials/canvas/hidpi/

    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    return dpr;
}

export default function lol() {}
