// @flow

import {
  PX_PER_MS,
  BAR_HEIGHT,
  BAR_Y_GUTTER,
  BAR_X_GUTTER,
  MIN_ZOOM,
  MAX_ZOOM,
} from './constants';
import debounce from 'debounce';

export type MouseEventWithTarget = {
  currentTarget: {
    getBoundingClientRect: () => {
      left: number,
      top: number,
    },
  },
  clientX: number,
  clientY: number,
};

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

export function getCanvasMousePos(event: MouseEventWithTarget, canvas: ?Node) {
  const rect =
    canvas instanceof HTMLCanvasElement
      ? canvas.getBoundingClientRect()
      : {left: 0, top: 0};
  const canvasMouseX = event.clientX - rect.left;
  const canvasMouseY = event.clientY - rect.top;

  return {canvasMouseX, canvasMouseY};
}

export class CanvasWheelHandler {
  _clampZoom(updated: number, minZoom: number) {
    return Math.max(minZoom, Math.min(MAX_ZOOM, updated));
  }

  _endWheel = debounce(onStateChange => {
    onStateChange({
      zooming: false,
    });
  }, 100);

  _handleWheel = (
    event: SyntheticWheelEvent<HTMLCanvasElement>,
    canvas: ?Node,
    props: {
      viewportWidth: number,
      zoom: number,
      center: number,
      zoom: number,
      minZoom: number,
      zoom: number,
      onStateChange: ({
        zooming: boolean,
        zoom: number,
        center: number,
      }) => void,
    }
  ) => {
    event.preventDefault();
    event.stopPropagation();
    // zoom centered on mouse
    const {canvasMouseX} = getCanvasMousePos((event: $FlowFixMe), canvas);
    const mouseOffsetFromCenter = canvasMouseX - props.viewportWidth / 2;
    const updatedZoom = props.zoom * (1 + 0.005 * -event.deltaY);
    const updatedCenter =
      props.center +
      // offset to time space before zoom
      mouseOffsetFromCenter / PX_PER_MS / props.zoom -
      // offset to time space after zoom
      mouseOffsetFromCenter / PX_PER_MS / updatedZoom;

    if (this._clampZoom(updatedZoom, props.minZoom) !== props.zoom) {
      props.onStateChange({
        zooming: true,
        zoom: updatedZoom,
        center: updatedCenter,
      });
      this._endWheel(props.onStateChange);
    }
  };
}
