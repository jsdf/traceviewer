// @flow
import {
  PX_PER_MS,
  BAR_HEIGHT,
  BAR_Y_GUTTER,
  BAR_X_GUTTER,
  MIN_ZOOM,
  MAX_ZOOM,
  TOOLTIP_OFFSET,
  TOOLTIP_HEIGHT,
} from './constants';
import {getLayout, UtilsWithCache} from './renderUtils';
import type {RenderableTrace, Measure, Extents, Layout} from './renderUtils';
import type {RenderableMeasure} from './calculateTraceLayout';
import type {HandleStateChangeFn} from './State';
// $FlowFixMe
import memoize from 'memoize-one';
import debounce from 'debounce';
import memoizeWeak from './memoizeWeak';
import type {WebGLRenderState} from './WebGLRenderState';
import {initWebGLRenderer} from './WebGLRenderUtils';
import {initWebGLRenderer as initWebGLGPUTransformRenderer} from './WebGLGPUTranformRenderUtils';
import type {RenderableText} from './WebGLTextRenderUtils';
import * as WebGLTextRenderUtils from './WebGLTextRenderUtils';
import ReactDOM from 'react-dom';
import type {Element as ReactElement} from 'react';

export type Props = {
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
  tooltip: ?Node,
  truncateLabels?: boolean,
  renderableTrace: RenderableTrace,
  renderableTraceGroups: Map<string, RenderableTrace>,
  groupOrder?: Array<string>,
  renderer: 'canvas' | 'webgl',
  renderTooltip?: Measure => ReactElement<any>,
  onSelectionChange: (selection: ?RenderableMeasure<Measure>) => void,
  onStateChange: HandleStateChangeFn,
};

type MouseEventWithTarget = {
  currentTarget: {
    getBoundingClientRect: () => {
      left: number,
      top: number,
    },
  },
  clientX: number,
  clientY: number,
};

const CANVAS_DRAW_TEXT = true;
const CANVAS_DRAW_TEXT_MIN_PX = 35;
const CANVAS_USE_FLOAT_DIMENSIONS = false;
const CANVAS_OPAQUE = true;
const CANVAS_SUPPORT_RETINA = true;
const CANVAS_ZOOMING_TEXT_OPT = false;
const CANVAS_TEXT_PADDING_PX = 2;
const WEBGL_TEXT_TOP_PADDING_PX = -2;
const WEBGL_TRUNCATE_BIAS = 20;
const WEBGL_USE_GPU_TRANSFORM = true;
const CANVAS_RENDER_60FPS = false;

const toInt = CANVAS_USE_FLOAT_DIMENSIONS ? x => x : Math.floor;

function truncateText(text: string, endSize: number) {
  return `${text.slice(0, endSize)}\u{2026}${text.slice(
    text.length - 1 - endSize
  )}`;
}

export class CanvasRendererImpl {
  _canvas: ?Node = null;
  _renderedShapes: Array<[Layout, RenderableMeasure<Measure>]> = [];
  _renderedZoom: number = 1;
  _renderedCenter: number = 1;
  _mouseX = 0;
  _mouseY = 0;
  _utils = new UtilsWithCache();

  _framecounter = 0;
  _frameSecond = Math.floor(performance.now() / 1000);
  _lastFrameFPS = 0;

  props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  didMount() {
    document.addEventListener('mouseup', this._mouseUp);
    const canvas = this._canvas;
    if (canvas instanceof HTMLCanvasElement) {
      (canvas: any).addEventListener('wheel', this._handleWheel);
    }
    if (CANVAS_RENDER_60FPS) {
      this.rAFLoop();
    } else {
      this._renderCanvasWithFramecount();
    }
  }

  didUpdate() {
    if (!CANVAS_RENDER_60FPS) {
      this._renderCanvasWithFramecount();
    }
  }

  rAFLoop = () => {
    requestAnimationFrame(() => {
      this._renderCanvasWithFramecount();
      this.rAFLoop();
    });
  };

  // TODO: remove this duplication?
  _clampZoom(updated: number) {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, updated));
  }

  _getCanvasMousePos(event: MouseEventWithTarget) {
    // const rect = event.currentTarget.getBoundingClientRect();
    const canvas = this._canvas;
    const rect =
      canvas instanceof HTMLCanvasElement
        ? canvas.getBoundingClientRect()
        : {left: 0, top: 0};
    const canvasMouseX = event.clientX - rect.left;
    const canvasMouseY = event.clientY - rect.top;

    return {canvasMouseX, canvasMouseY};
  }

  _getIntersectingMeasure(event: MouseEventWithTarget) {
    const {canvasMouseX, canvasMouseY} = this._getCanvasMousePos(
      (event: $FlowFixMe)
    );
    const intersecting = this._renderedShapes.find(
      ([{x, y, width, height}]) =>
        !(
          canvasMouseX < x ||
          x + width < canvasMouseX ||
          (canvasMouseY < y || y + height < canvasMouseY)
        )
    );
    let selection = null;
    if (intersecting) {
      return intersecting[1];
    }

    return null;
  }

  _onCanvas = (node: ?Node) => {
    this._canvas = node;
  };

  _mouseDown = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this.props.onStateChange({dragging: true, dragMoved: false});
  };

  _mouseMove = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    const hovered = this._getIntersectingMeasure((event: $FlowFixMe));
    const {canvasMouseX, canvasMouseY} = this._getCanvasMousePos(
      (event: $FlowFixMe)
    );

    this._mouseX = canvasMouseX;
    this._mouseY = canvasMouseY;
    const tooltip = this.props.tooltip;

    if (tooltip instanceof HTMLDivElement) {
      const tooltipX = this._mouseX + TOOLTIP_OFFSET;
      const tooltipY = this._mouseY + TOOLTIP_OFFSET;

      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      if (hovered != null) {
        if (this.props.renderTooltip) {
          ReactDOM.render(this.props.renderTooltip(hovered.measure), tooltip);
        } else {
          tooltip.textContent = `${hovered.measure.duration.toFixed(1)}ms ${
            hovered.measure.name
          }`;
        }
        tooltip.hidden = false;
      } else {
        tooltip.hidden = true;
      }
    }

    if (this.props.dragging) {
      const updated =
        this.props.center -
        (event: $FlowFixMe).movementX / PX_PER_MS / this.props.zoom;
      this.props.onStateChange({
        center: updated,
        hovered,
        dragMoved: true,
      });
    } else {
      //   this.props.onStateChange({hovered});
    }
  };

  _mouseOut = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    const tooltip = this.props.tooltip;

    if (tooltip instanceof HTMLDivElement) {
      tooltip.hidden = true;
    }
  };

  _mouseUp = (event: MouseEvent) => {
    this.props.onStateChange({
      dragging: false,
      dragMoved: false,
      selection: !this.props.dragMoved
        ? this._getIntersectingMeasure((event: $FlowFixMe))
        : this.props.selection,
    });
  };

  _endWheel = debounce(() => {
    this.props.onStateChange({
      zooming: false,
    });
  }, 100);

  _handleWheel = (event: SyntheticWheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // zoom centered on mouse
    const {canvasMouseX} = this._getCanvasMousePos((event: $FlowFixMe));
    const mouseOffsetFromCenter = canvasMouseX - this.props.viewportWidth / 2;
    const updatedZoom = this.props.zoom * (1 + 0.005 * -event.deltaY);
    const updatedCenter =
      this.props.center +
      // offset to time space before zoom
      mouseOffsetFromCenter / PX_PER_MS / this.props.zoom -
      // offset to time space after zoom
      mouseOffsetFromCenter / PX_PER_MS / updatedZoom;

    if (this._clampZoom(updatedZoom) !== this.props.zoom) {
      this.props.onStateChange({
        zooming: true,
        zoom: updatedZoom,
        center: updatedCenter,
      });
      this._endWheel();
    }
  };

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

  _fitText(measureFn: string => number, label: string, textWidth: number) {
    // binary search for smallest
    let labelTrimmed = label;
    let l = 0;
    let r = label.length - 1;
    if (measureFn(labelTrimmed) > textWidth) {
      while (l < r) {
        let m = l + Math.floor((r - l) / 2);

        labelTrimmed = truncateText(label, m);

        if (measureFn(labelTrimmed) > textWidth) {
          r = m - 1;
        } else {
          l = m + 1;
        }
      }

      // this isn't quite right but close enough
      labelTrimmed = truncateText(label, r);
    }
    return labelTrimmed;
  }

  _fitTextMap: WeakMap<
    RenderableMeasure<Measure>,
    {textWidth: number, labelTrimmed: string}
  > = new WeakMap();

  _fitTextCached(
    measure: RenderableMeasure<Measure>,
    measureFn: string => number,
    label: string,
    textWidth: number
  ) {
    const cached = this._fitTextMap.get(measure);
    if (cached != null && cached.textWidth === textWidth) {
      return cached.labelTrimmed;
    }

    const labelTrimmed = this._fitText(measureFn, label, textWidth);
    this._fitTextMap.set(measure, {textWidth, labelTrimmed});
    return labelTrimmed;
  }

  _renderCanvasWithFramecount() {
    const curSecond = Math.floor(performance.now() / 1000);
    if (curSecond !== this._frameSecond) {
      this._lastFrameFPS = this._framecounter;
      this._framecounter = 0;
      this._frameSecond = curSecond;
    } else {
      this._framecounter++;
    }

    this._renderCanvas();
  }

  _renderCanvasReq = (() => {
    let rafID = null;

    return () => {
      if (rafID == null) {
        rafID = requestAnimationFrame(() => {
          rafID = null;
          this._renderCanvasWithFramecount();
        });
      } else {
        console.log('skipping frame');
      }
    };
  })();

  _getMaxStackIndex: RenderableTrace => number = memoizeWeak(renderableTrace =>
    renderableTrace.reduce((acc, item) => Math.max(item.stackIndex, acc), 0)
  );

  __renderCanvasImpl(canvas: HTMLCanvasElement) {
    // implement in subclass
  }

  _renderCanvas() {
    performance.mark('_renderCanvas');
    // console.time('_renderCanvas');
    const canvas = this._canvas;
    if (canvas instanceof HTMLCanvasElement) {
      this.__renderCanvasImpl(canvas);
    }

    performance.measure('_renderCanvas', '_renderCanvas');

    // console.timeEnd('_renderCanvas');
  }
}

export class Canvas2DRendererImpl extends CanvasRendererImpl {
  __renderCanvasImpl(canvas: HTMLCanvasElement) {
    const ctx = this._getCanvasContext(canvas);

    if (CANVAS_OPAQUE) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    this._renderedShapes = [];

    const {renderableTraceGroups} = this.props;

    const groupOrder = this.props.groupOrder || renderableTraceGroups.keys();

    let startY = 0;
    for (const group of groupOrder) {
      const groupTrace = renderableTraceGroups.get(group);
      if (!groupTrace) continue;
      performance.mark('_renderCanvasGroup ' + group);
      this._renderCanvasGroup(groupTrace, ctx, startY);
      performance.measure(
        '_renderCanvasGroup ' + group,
        '_renderCanvasGroup ' + group
      );
      const maxStackIndex = this._getMaxStackIndex(groupTrace);
      startY += (maxStackIndex + 1) * (BAR_HEIGHT + BAR_Y_GUTTER);
    }
    this._renderedZoom = this.props.zoom;
    this._renderedCenter = this.props.center;
    canvas.style.transform = '';
  }

  _renderCanvasGroup(
    renderableTrace: RenderableTrace,
    ctx: CanvasRenderingContext2D,
    startY: number
  ) {
    const first = renderableTrace[0];
    if (first == null) {
      return;
    }

    const currentGroup = first.measure.group;

    for (var index = 0; index < renderableTrace.length; index++) {
      const measure = renderableTrace[index];

      const layout = getLayout(this.props, measure, startY);
      layout.width = Math.max(layout.width, 1); // at least 1px wide
      const {width, height, x, y, inView} = layout;

      if (!inView) {
        continue;
      }

      this._renderedShapes.push([layout, measure]);

      const hovered = measure === this.props.hovered;
      const selected = measure === this.props.selection;

      ctx.fillStyle =
        hovered || selected
          ? this._utils._getMeasureHoverColorRGB(measure.measure)
          : this._utils._getMeasureColorRGB(measure.measure);
      ctx.fillRect(toInt(x), toInt(y), toInt(width), toInt(height));

      if (!CANVAS_DRAW_TEXT) {
        // skip text rendering
        continue;
      }

      // skip text rendering for small measures
      // text is by far the most expensive part of rendering the trace
      if (width < CANVAS_DRAW_TEXT_MIN_PX) {
        continue;
      }

      // skip text rendering while zooming
      if (CANVAS_ZOOMING_TEXT_OPT && this.props.zooming) {
        continue;
      }

      const textWidth = toInt(Math.max(width - CANVAS_TEXT_PADDING_PX, 0));

      ctx.font = '10px Lucida Grande';
      ctx.fillStyle = 'black';

      const label = measure.measure.name;
      const labelTrimmed = this.props.truncateLabels
        ? this._fitTextCached(
            measure,
            labelTrimmed => ctx.measureText(labelTrimmed).width,
            label,
            textWidth
          )
        : label;

      ctx.fillText(
        labelTrimmed,
        toInt(x + CANVAS_TEXT_PADDING_PX),
        toInt(y + BAR_HEIGHT / 2 + 4),
        textWidth
      );
    }

    // render selection highlight
    const selection = this.props.selection;
    if (selection != null && currentGroup === selection.measure.group) {
      const layout = getLayout(this.props, selection, startY);
      const {width, height, x, y, inView} = layout;

      ctx.strokeStyle = '#0000ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
  }
}

export class CanvasWebGlRendererImpl extends CanvasRendererImpl {
  _getCanvasGLContext = memoize((canvas: HTMLCanvasElement) => {
    if (CANVAS_SUPPORT_RETINA) {
      this._configureRetinaCanvas(canvas);
    }
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('couldnt use webgl');
    }
    return gl;
  });

  _webglRender: ?(WebGLRenderState) => void = null;
  _webglTextRenderInit = false;
  _webglTextRender: ?(Array<RenderableText>) => void = null;
  _webglTextMeasure: ?(string) => number = null;

  _renderTextWebGL() {
    const textRender = this._webglTextRender;
    const measureText = this._webglTextMeasure;
    if (CANVAS_DRAW_TEXT && textRender && measureText) {
      const renderableTrace = this.props.renderableTrace;
      this._renderedShapes = [];
      const textToRender = [];
      for (var index = 0; index < renderableTrace.length; index++) {
        const measure = renderableTrace[index];

        const layout = getLayout(this.props, measure, 0);
        const {width, height, x, y, inView} = layout;

        if (!inView) {
          continue;
        }

        this._renderedShapes.push([layout, measure]);

        // skip text rendering for small measures
        // text is by far the most expensive part of rendering the trace
        if (width < CANVAS_DRAW_TEXT_MIN_PX) {
          continue;
        }

        // skip text rendering while zooming
        if (CANVAS_ZOOMING_TEXT_OPT && this.props.zooming) {
          continue;
        }

        const measureText = this._webglTextMeasure;
        if (!measureText) {
          continue;
        }

        const textWidth = toInt(Math.max(width - CANVAS_TEXT_PADDING_PX, 0));

        const label = measure.measure.name;
        const labelTrimmed = this.props.truncateLabels // TODO: fix
          ? this._fitTextCached(
              measure,
              measureText,
              label,
              textWidth - WEBGL_TRUNCATE_BIAS
            )
          : label;

        textToRender.push({
          label: labelTrimmed,
          x: x + CANVAS_TEXT_PADDING_PX,
          y: y + WEBGL_TEXT_TOP_PADDING_PX + BAR_HEIGHT / 2 + 4,
        });
      }
      textRender(textToRender);
    }
  }

  _renderWebGL(canvas: HTMLCanvasElement) {
    if (!this._webglRender) {
      const gl = this._getCanvasGLContext(canvas);
      this._webglRender = (WEBGL_USE_GPU_TRANSFORM
        ? initWebGLGPUTransformRenderer
        : initWebGLRenderer)(gl, this.props);
    }
    this._webglRender(this.props);

    if (!this._webglTextRenderInit) {
      this._webglTextRenderInit = true;
      const gl = this._getCanvasGLContext(canvas);
      WebGLTextRenderUtils.init(
        gl,
        ({render, measureText}) => {
          this._webglTextRender = render;
          this._webglTextMeasure = measureText;
          this._renderCanvas();
        },
        CANVAS_SUPPORT_RETINA ? window.devicePixelRatio : 1
      );
    }

    this._renderTextWebGL();
  }

  __renderCanvasImpl(canvas: HTMLCanvasElement) {
    this._renderWebGL(canvas);
  }
}
