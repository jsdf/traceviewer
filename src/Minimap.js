// @flow
import React from 'react';

import {PX_PER_MS} from './constants';
// $FlowFixMe
import memoize from 'memoize-one';
import {getLayout, UtilsWithCache} from './renderUtils';

import {CANVAS_OPAQUE, CANVAS_SUPPORT_RETINA} from './canvasConstants';
import type {RenderableTrace, Measure, Extents, Layout} from './renderUtils';
import type {RenderableMeasure} from './calculateTraceLayout';
import type {HandleStateChangeFn} from './State';
import {
  configureRetinaCanvas,
  getCanvasMousePos,
  CanvasWheelHandler,
} from './canvasUtils';
import type {MouseEventWithTarget} from './canvasUtils';

const MINMAP_BAR_HEIGHT = 2;

type Props = {
  viewportWidth: number,

  extents: Extents,
  viewportWidth: number,
  viewportHeight: number,
  center: number,
  defaultCenter: number,
  dragging: boolean,
  dragMoved: boolean,
  hovered: ?RenderableMeasure<Measure>,
  selection: ?RenderableMeasure<Measure>,
  zoom: number,
  defaultZoom: number,
  zooming: boolean,
  minZoom: number,
  renderableTrace: RenderableTrace,
  renderableTraceGroups: Map<string, RenderableTrace>,
  groupOrder?: Array<string>,
  onStateChange: HandleStateChangeFn,
};

export default class Minimap extends React.Component<Props, void> {
  _canvas: ?Node = null;
  _mouseX = 0;
  _mouseY = 0;
  _isMouseDown = false;
  _onCanvas = (node: ?Node) => {
    this._canvas = node;
  };
  _utils = new UtilsWithCache();

  componentDidMount() {
    document.addEventListener('mouseup', this._mouseUp);
    const canvas = this._canvas;

    if (canvas instanceof HTMLCanvasElement) {
      (canvas: any).addEventListener('wheel', this._handleWheel);
    }
    this._renderCanvas();
  }

  componentDidUpdate() {
    this._renderCanvas();
  }

  _getCanvasContext = memoize((canvas: HTMLCanvasElement) => {
    var ctx = canvas.getContext('2d', CANVAS_OPAQUE ? {alpha: false} : {});
    if (CANVAS_SUPPORT_RETINA) {
      const dpr = configureRetinaCanvas(canvas);
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
        const maxStackIndex = this._utils._getMaxStackIndex(groupTrace);
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
      ctx.fillRect(x, y, width, height);
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

    ctx.fillStyle = 'rgba(200,200,200,0.4)';
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

  _canvasWheelHandler = new CanvasWheelHandler();

  _handleWheel = (event: SyntheticWheelEvent<HTMLCanvasElement>) => {
    this._canvasWheelHandler._handleWheel(event, this._canvas, this.props);
  };

  _mouseMove = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    const {canvasMouseX, canvasMouseY} = this._getCanvasMousePos(
      (event: $FlowFixMe)
    );

    this._mouseX = canvasMouseX;
    this._mouseY = canvasMouseY;

    if (this._isMouseDown) {
      this._setCenterFromMousePos(event);
      // const updated =
      //   this.props.center -
      //   (event: $FlowFixMe).movementX / PX_PER_MS / this.props.zoom;
      // this.props.onStateChange({
      //   center: updated,
      // });
    }
  };

  _mouseDown = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this._isMouseDown = true;
  };

  _mouseOut = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this._isMouseDown = false;
  };

  _mouseUp = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this._isMouseDown = false;
  };

  _setCenterFromMousePos(event: SyntheticMouseEvent<HTMLCanvasElement>) {
    const {canvasMouseX, canvasMouseY} = this._getCanvasMousePos(
      (event: $FlowFixMe)
    );
    const updated =
      (canvasMouseX / this.props.viewportWidth) * this.props.extents.size +
      this.props.extents.startOffset;

    this.props.onStateChange({
      center: updated,
    });
  }

  _click = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this._setCenterFromMousePos(event);
  };

  _getCanvasMousePos(event: MouseEventWithTarget) {
    return getCanvasMousePos(event, this._canvas);
  }

  render() {
    return (
      <div>
        <canvas
          ref={this._onCanvas}
          onMouseDown={this._mouseDown}
          onMouseMove={this._mouseMove}
          onMouseOut={this._mouseOut}
          onClick={this._click}
          width={this.props.viewportWidth}
          height={
            MINMAP_BAR_HEIGHT *
            this._utils._getMaxStackIndex(this.props.renderableTrace)
          }
        />
      </div>
    );
  }
}
