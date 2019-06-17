// @flow
import React from 'react';

const CANVAS_FRAMECOUNTER = false;
const CANVAS_USE_WEBGL = false;

type Props = {viewportWidth: number};

export default class Minimap extends React.Component<Props, void> {
  _canvas: ?Node = null;
  _mouseX = 0;
  _mouseY = 0;
  _onCanvas = (node: ?Node) => {
    this._canvas = node;
  };

  componentDidMount() {
    // document.addEventListener('mouseup', this._mouseUp);
    const canvas = this._canvas;
    // if (canvas instanceof HTMLCanvasElement) {
    //   (canvas: any).addEventListener('wheel', this._handleWheel);
    // }
    this._renderCanvas();
  }

  componentDidUpdate() {
    this._renderCanvas();
  }

  _configureRetinaCanvas(canvas: HTMLCanvasElement) {
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

  _getCanvasContext = memoize((canvas: HTMLCanvasElement) => {
    var ctx = canvas.getContext('2d', CANVAS_OPAQUE ? {alpha: false} : {});
    if (CANVAS_SUPPORT_RETINA) {
      const dpr = this._configureRetinaCanvas(canvas);
      // Scale all drawing operations by the dpr, so you
      // don't have to worry about the difference.
      ctx.scale(dpr, dpr);
    }
    return ctx;
  });

  _renderCanvas() {
    const canvas = this._canvas;
    if (canvas instanceof HTMLCanvasElement) {
      const ctx = this._getCanvasContext(canvas);

      // fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this._renderedShapes = [];

      const {renderableTraceGroups} = this.props;

      const groupOrder =
        this.props.groupOrder || Array.from(renderableTraceGroups.keys());
      // render minimap
      performance.mark('_renderMinimap');
      let startY = 0;
      const minimapTop = startY;
      for (const group of groupOrder) {
        const groupTrace = renderableTraceGroups.get(group);
        if (!groupTrace) continue;
        this._renderCanvasGroupMinimap(groupTrace, ctx, startY);
        const maxStackIndex = this._getMaxStackIndex(groupTrace);
        startY += (maxStackIndex + 1) * MINMAP_BAR_HEIGHT;
      }
      const minimapBottom = startY;
      this._renderMinimapShade(ctx, minimapTop, minimapBottom);
      performance.measure('_renderMinimap', '_renderMinimap');
    }
  }

  _renderCanvasGroupMinimap(
    renderableTrace: RenderableTrace,
    ctx: CanvasRenderingContext2D,
    startY: number
  ) {
    const first = renderableTrace[0];
    if (first == null) {
      return;
    }

    const {extents} = this.props;

    const currentGroup = first.measure.group;

    for (var index = 0; index < renderableTrace.length; index++) {
      const measure = renderableTrace[index];

      const width = Math.max(
        (measure.measure.duration / extents.size) * this.props.viewportWidth,
        1
      ); // at least 1px wide
      const height = MINMAP_BAR_HEIGHT;
      const x =
        ((measure.measure.startTime - this.props.extents.startOffset) /
          extents.size) *
        this.props.viewportWidth;
      const y = measure.stackIndex * MINMAP_BAR_HEIGHT + startY;

      ctx.fillStyle = this._utils._getMeasureColorRGB(measure.measure);
      ctx.fillRect(toInt(x), toInt(y), toInt(width), toInt(height));
    }
  }

  _renderMinimapShade(
    ctx: CanvasRenderingContext2D,
    minimapTop: number,
    minimapBottom: number
  ) {
    const centerAbs =
      (this.props.center - this.props.extents.startOffset) /
      this.props.extents.size;
    const zoomBoxWidthAbs =
      this.props.viewportWidth / (this.props.extents.size * this.props.zoom);
    const zoomBoxStartAbs = centerAbs - zoomBoxWidthAbs / 2;
    const zoomBoxEndAbs = centerAbs + zoomBoxWidthAbs / 2;

    ctx.fillStyle = 'rgba(200,200,200,0.3)';
    ctx.fillRect(
      0,
      minimapTop,
      Math.max(zoomBoxStartAbs, 0) * this.props.viewportWidth,
      minimapBottom - minimapTop
    );
    ctx.fillRect(
      Math.min(zoomBoxEndAbs, 1) * this.props.viewportWidth,
      minimapTop,
      this.props.viewportWidth -
        Math.min(zoomBoxEndAbs, 1) * this.props.viewportWidth,
      minimapBottom - minimapTop
    );
  }

  render() {
    return (
      <div>
        <canvas
          ref={this._onCanvas}
          // onMouseDown={this._mouseDown}
          // onMouseMove={this._mouseMove}
          // onMouseOut={this._mouseOut}
          width={this.props.viewportWidth}
          height={this.props.viewportHeight}
        />
      </div>
    );
  }
}
