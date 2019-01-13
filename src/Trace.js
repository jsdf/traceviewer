// @flow
import React from 'react';
import ReactDOM from 'react-dom';
// $FlowFixMe
import memoize from 'memoize-one';
import debounce from 'debounce';
import Flatbush from 'flatbush';
import transformTrace from './calculateTraceLayout';
import type {RenderableMeasure} from './calculateTraceLayout';

type Measure = {
  name: string,
  startTime: number,
  duration: number,
  group?: string,
};

type Layout = {
  width: number,
  height: number,
  x: number,
  y: number,
  inView: boolean,
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

type RenderableTrace = Array<RenderableMeasure<Measure>>;

type Color = [number, number, number];

const BAR_HEIGHT = 16;
const BAR_Y_GUTTER = 1;
const BAR_X_GUTTER = 1;
const PX_PER_MS = 1;
const MIN_ZOOM = 0.2; // TODO: determine from trace extents
const MAX_ZOOM = 100;
const TOOLTIP_OFFSET = 8;
const TOOLTIP_HEIGHT = 20;
const SHOW_CONTROLS = false;
const DOM_DRAW_LIMIT = 500;
const DOM_DRAW_MIN_PERCENT = 0.3;
const CANVAS_DRAW_TEXT_MIN_PX = 35;
const CANVAS_CSS_ZOOM = false;
const CANVAS_USE_FLOAT_DIMENSIONS = false;
const CANVAS_OPAQUE = true;
const CANVAS_SUPPORT_RETINA = true;
const CANVAS_ZOOMING_TEXT_OPT = false;

const TEXT_PADDING_PX = 2;

const toInt = CANVAS_USE_FLOAT_DIMENSIONS ? x => x : Math.floor;

function memoizeWeak<TArg, TRet>(fn: (arg: TArg) => TRet): (arg: TArg) => TRet {
  const cache = new WeakMap();
  return (arg: TArg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg) || fn(arg);
  };
}

function getRandomColor(): Color {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
}

function truncateText(text: string, endSize: number) {
  return `${text.slice(0, endSize)}\u{2026}${text.slice(
    text.length - 1 - endSize
  )}`;
}

type Props = {
  groupOrder?: Array<string>,
  truncateLabels: boolean,
  trace: Array<Measure>,
  renderer: 'canvas' | 'dom',
  viewportWidth: number,
  viewportHeight: number,
};

type State = {
  center: number,
  dragging: boolean,
  dragMoved: boolean,
  hovered: ?RenderableMeasure<Measure>,
  selection: ?RenderableMeasure<Measure>,
  zoom: number,
  zooming: boolean,
};

// const run = fn => requestAnimationFrame(fn);
const run = fn => fn();

let framecounter = 0;
let frameSecond = Math.floor(performance.now() / 1000);

function loadValue(name: string, defaultVal: number) {
  const item = localStorage.getItem(name);
  if (item != null) {
    const parsed = parseFloat(item);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultVal;
}

function storeValue(name: string, val: number) {
  localStorage.setItem(name, String(val));
}

export default class Trace extends React.Component<Props, State> {
  _canvas: ?Node = null;
  _renderedShapes: Map<Layout, RenderableMeasure<Measure>> = new Map();
  _renderedZoom: number = 1;
  _renderedCenter: number = 1;
  _mouseX = 0;
  _mouseY = 0;

  constructor(props: Props) {
    super(props);
    const {startOffset, size} = this._getExtents();
    const zoom = loadValue('zoom', 1);
    this.state = {
      dragging: false,
      dragMoved: false,
      selection: null,
      hovered: null,
      center: loadValue(
        'center',
        startOffset + this.props.viewportWidth / PX_PER_MS / 2
      ),
      zoom,
      zooming: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keypress', this._handleKey);
    document.addEventListener('mouseup', this._mouseUp);
    if (this.props.renderer == 'canvas') {
      const canvas = this._canvas;
      this._renderCanvasReq();
    }
    window.onbeforeunload = () => {
      storeValue('center', this.state.center);
      storeValue('zoom', this.state.zoom);
    };
  }

  componentDidUpdate() {
    if (this.props.renderer == 'canvas') {
      this._renderCanvasReq();
    }
  }

  _transformTrace = memoize(trace => transformTrace(trace));

  _transformTraceGroups = memoize(trace => {
    const groupedTraces = trace.reduce((groupsTraces, item) => {
      const group = item.group;
      const groupTrace = groupsTraces.get(group) || [];
      groupTrace.push(item);
      groupsTraces.set(group, groupTrace);
      return groupsTraces;
    }, new Map());
    const groupedRenderableTraces = new Map();
    for (let [group, trace] of groupedTraces) {
      groupedRenderableTraces.set(group, transformTrace(trace));
    }
    return groupedRenderableTraces;
  });

  _getFlatbush = memoize(renderableTrace => {
    const index = new Flatbush(renderableTrace.length);
    for (const p of renderableTrace) {
      index.add(p.startTime, 0, p.startTime + p.duration, 1);
    }
    // perform the indexing
    index.finish();

    return index;
  });

  _handleZoom = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated = parseFloat(event.currentTarget.value);
    run(() => {
      this.setState({zoom: this._clampZoom(updated)});
    });
  };

  _handleCenter = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated = parseFloat(event.currentTarget.value);
    run(() => {
      this.setState({center: this._clampCenter(updated)});
    });
  };

  _handleLeft = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const {size} = this._getExtents();
    const updated = this.state.center - size * 0.01 / this.state.zoom;
    run(() => {
      this.setState({center: this._clampCenter(updated)});
    });
  };

  _handleRight = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const {size} = this._getExtents();
    const updated = this.state.center + size * 0.01 / this.state.zoom;
    run(() => {
      this.setState({center: this._clampCenter(updated)});
    });
  };

  _handleMeasureClick = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    this.setState({
      selection: this._transformTrace(this.props.trace)[
        parseInt(event.currentTarget.getAttribute('data-index'))
      ],
    });
  };

  _clampCenter(updated: number) {
    const {startOffset, endOffset} = this._getExtents();
    return Math.max(startOffset, Math.min(endOffset, updated));
  }

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
    const intersecting = Array.from(this._renderedShapes.entries()).find(
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

  _mouseDown = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this.setState({dragging: true, dragMoved: false});
  };

  _mouseMove = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    const hovered = this._getIntersectingMeasure((event: $FlowFixMe));
    const {canvasMouseX, canvasMouseY} = this._getCanvasMousePos(
      (event: $FlowFixMe)
    );

    this._mouseX = canvasMouseX;
    this._mouseY = canvasMouseY;
    const tooltip = this._tooltip;

    if (tooltip instanceof HTMLDivElement) {
      const tooltipX = this._mouseX + TOOLTIP_OFFSET;
      const tooltipY = this._mouseY + TOOLTIP_OFFSET;

      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      if (hovered != null) {
        tooltip.textContent = `${hovered.measure.duration.toFixed(1)}ms ${
          hovered.measure.name
        }`;
        tooltip.hidden = false;
      } else {
        tooltip.hidden = true;
      }
    }

    if (this.state.dragging) {
      const updated =
        this.state.center -
        (event: $FlowFixMe).movementX / PX_PER_MS / this.state.zoom;
      run(() => {
        this.setState({
          center: this._clampCenter(updated),
          hovered,
          dragMoved: true,
        });
      });
    } else {
      // run(() => {
      //   this.setState({hovered});
      // });
    }
  };

  _mouseOut = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    const tooltip = this._tooltip;

    if (tooltip instanceof HTMLDivElement) {
      tooltip.hidden = true;
    }
  };

  _mouseUp = (event: MouseEvent) => {
    this.setState({
      dragging: false,
      dragMoved: false,
      selection: !this.state.dragMoved
        ? this._getIntersectingMeasure((event: $FlowFixMe))
        : this.state.selection,
    });
  };

  _endWheel = debounce(() => {
    this.setState({
      zooming: false,
    });
  }, 100);

  _handleWheel = (event: SyntheticWheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // zoom centered on mouse
    const {canvasMouseX} = this._getCanvasMousePos((event: $FlowFixMe));
    const mouseOffsetFromCenter = canvasMouseX - this.props.viewportWidth / 2;
    const updatedZoom = this.state.zoom * (1 + 0.005 * -event.deltaY);
    const updatedCenter =
      this.state.center +
      // offset to time space before zoom
      mouseOffsetFromCenter / PX_PER_MS / this.state.zoom -
      // offset to time space after zoom
      mouseOffsetFromCenter / PX_PER_MS / updatedZoom;

    if (this._clampZoom(updatedZoom) !== this.state.zoom) {
      run(() => {
        this.setState({
          zooming: true,
          zoom: this._clampZoom(updatedZoom),
          center: this._clampCenter(updatedCenter),
        });
        this._endWheel();
      });
    }
  };

  _onCanvas = (node: ?Node) => {
    this._canvas = node;
  };

  _handleKey = (event: KeyboardEvent) => {
    const {size} = this._getExtents();
    switch (event.key) {
      case 'w': {
        const updated = this.state.zoom * 2;
        run(() => {
          this.setState({zoom: this._clampZoom(updated)});
        });
        break;
      }
      case 'a': {
        const updated = this.state.center - 0.05 * size / this.state.zoom;
        run(() => {
          this.setState({center: this._clampCenter(updated)});
        });
        break;
      }
      case 's': {
        const updated = this.state.zoom / 2;
        run(() => {
          this.setState({zoom: this._clampZoom(updated)});
        });
        break;
      }
      case 'd': {
        const updated = this.state.center + 0.05 * size / this.state.zoom;
        run(() => {
          this.setState({center: this._clampCenter(updated)});
        });
        break;
      }
    }
  };

  _getMeasureColor: Measure => Color = memoizeWeak(measure => getRandomColor());

  _getMeasureColorRGBA(measure: Measure, opacity: number) {
    const color = this._getMeasureColor(measure);
    return `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
  }

  _getMeasureColorRGB: Measure => string = memoizeWeak(measure => {
    const color = this._getMeasureColor(measure);
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  });

  _getMeasureHoverColorRGB: Measure => string = memoizeWeak(measure => {
    const color = this._getMeasureColor(measure);
    return `rgb(${Math.min(color[0] + 20, 255)},${Math.min(
      color[1] + 20,
      255
    )},${Math.min(color[2] + 20, 255)})`;
  });

  _getExtents() {
    const renderableTrace = this._transformTrace(this.props.trace);

    const startOffset = renderableTrace[0].measure.startTime;
    const last = renderableTrace[renderableTrace.length - 1];
    const endOffset = last.measure.startTime + last.measure.duration;

    return {
      startOffset,
      endOffset,
      size: endOffset - startOffset,
    };
  }

  _getContentWidth() {
    const {size} = this._getExtents();
    return size * PX_PER_MS * this.state.zoom;
  }

  _getLayout(measure: RenderableMeasure<Measure>, startY: number) {
    const centerOffset = this.state.center;

    const width = Math.max(
      measure.measure.duration * PX_PER_MS * this.state.zoom - BAR_X_GUTTER,
      0
    );
    const height = BAR_HEIGHT;
    const x =
      (measure.measure.startTime - centerOffset) * PX_PER_MS * this.state.zoom +
      this.props.viewportWidth / 2;
    const y = measure.stackIndex * (BAR_HEIGHT + BAR_Y_GUTTER) + startY;

    return {
      width,
      height,
      x,
      y,
      inView: !(x + width < 0 || this.props.viewportWidth < x),
    };
  }

  _getCanvasContext = memoize((canvas: HTMLCanvasElement) => {
    var ctx = canvas.getContext('2d', CANVAS_OPAQUE ? {alpha: false} : {});
    if (CANVAS_SUPPORT_RETINA) {
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
      // Scale all drawing operations by the dpr, so you
      // don't have to worry about the difference.
      ctx.scale(dpr, dpr);
    }
    return ctx;
  });

  _fitText(ctx: CanvasRenderingContext2D, label: string, textWidth: number) {
    // binary search for smallest
    let labelTrimmed = label;
    let l = 0;
    let r = label.length - 1;
    if (ctx.measureText(labelTrimmed).width > textWidth) {
      while (l < r) {
        let m = l + Math.floor((r - l) / 2);

        labelTrimmed = truncateText(label, m);

        if (ctx.measureText(labelTrimmed).width > textWidth) {
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
    ctx: CanvasRenderingContext2D,
    label: string,
    textWidth: number
  ) {
    const cached = this._fitTextMap.get(measure);
    if (cached != null && cached.textWidth === textWidth) {
      return cached.labelTrimmed;
    }

    const labelTrimmed = this._fitText(ctx, label, textWidth);
    this._fitTextMap.set(measure, {textWidth, labelTrimmed});
    return labelTrimmed;
  }

  _getMaxStackIndex: RenderableTrace => number = memoizeWeak(renderableTrace =>
    renderableTrace.reduce((acc, item) => Math.max(item.stackIndex, acc), 0)
  );

  _renderCanvasReq = (() => {
    let rafID = null;
    let lastTime = performance.now();

    return () => {
      if (rafID == null) {
        rafID = requestAnimationFrame(() => {
          const curSecond = Math.floor(performance.now() / 1000);
          if (curSecond !== frameSecond) {
            console.log(framecounter, 'fps');
            framecounter = 0;
            frameSecond = curSecond;
          } else {
            framecounter++;
          }

          const nowTime = performance.now();
          console.log(
            'inter frame time',
            (nowTime - lastTime).toFixed(1),
            'ms'
          );
          lastTime = nowTime;

          this._renderCanvas();
          rafID = null;
        });
      } else {
        console.log('skipping frame');
      }
    };
  })();

  _renderCanvas() {
    const start = performance.now();
    performance.mark('_renderCanvas');
    const canvas = this._canvas;
    if (canvas instanceof HTMLCanvasElement) {
      if (this.state.zooming && CANVAS_CSS_ZOOM) {
        // not finished...
        const zoomRatio = this.state.zoom / this._renderedZoom;
        // const offset =
        //   this.state.center -
        //   (event: $FlowFixMe).movementX / PX_PER_MS / this.state.zoom;
        canvas.style.transform = `scale(${zoomRatio})`;
      } else {
        const ctx = this._getCanvasContext(canvas);

        if (CANVAS_OPAQUE) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        this._renderedShapes.clear();

        const renderableTraceGroups = this._transformTraceGroups(
          this.props.trace
        );
        const groupOrder =
          this.props.groupOrder || renderableTraceGroups.keys();

        let startY = 0;
        for (const group of groupOrder) {
          const groupTrace = renderableTraceGroups.get(group);
          performance.mark('_renderCanvasGroup ' + group);
          this._renderCanvasGroup(groupTrace, ctx, startY);
          performance.measure(
            '_renderCanvasGroup ' + group,
            '_renderCanvasGroup ' + group
          );
          const maxStackIndex = this._getMaxStackIndex(groupTrace);
          startY += (maxStackIndex + 1) * (BAR_HEIGHT + BAR_Y_GUTTER);
        }
        this._renderedZoom = this.state.zoom;
        this._renderedCenter = this.state.center;
        canvas.style.transform = '';
      }
    }

    performance.measure('_renderCanvas', '_renderCanvas');
    console.log('render took', (performance.now() - start).toFixed(1), 'ms');
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

      const layout = this._getLayout(measure, startY);
      const {width, height, x, y, inView} = layout;

      if (!inView) {
        continue;
      }

      this._renderedShapes.set(layout, measure);

      const hovered = measure === this.state.hovered;
      const selected = measure === this.state.selection;

      ctx.fillStyle =
        hovered || selected
          ? this._getMeasureHoverColorRGB(measure.measure)
          : this._getMeasureColorRGB(measure.measure);
      ctx.fillRect(toInt(x), toInt(y), toInt(width), toInt(height));

      // skip text rendering for small measures
      // text is by far the most expensive part of rendering the trace
      if (width < CANVAS_DRAW_TEXT_MIN_PX) {
        continue;
      }

      // skip text rendering while zooming
      if (CANVAS_ZOOMING_TEXT_OPT && this.state.zooming) {
        continue;
      }

      const textWidth = toInt(Math.max(width - TEXT_PADDING_PX, 0));

      ctx.font = '10px Lucida Grande';
      ctx.fillStyle = 'black';

      const label = measure.measure.name;
      const labelTrimmed = this.props.truncateLabels
        ? this._fitTextCached(measure, ctx, label, textWidth)
        : label;

      ctx.fillText(
        labelTrimmed,
        toInt(x + TEXT_PADDING_PX),
        toInt(y + BAR_HEIGHT / 2 + 4),
        textWidth
      );
    }

    // render selection highlight
    const selection = this.state.selection;
    if (selection != null && currentGroup === selection.measure.group) {
      const layout = this._getLayout(selection, startY);
      const {width, height, x, y, inView} = layout;

      ctx.strokeStyle = '#0000ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
  }

  _tooltip: ?Node = null;

  _onTooltip = (node: ?Node) => {
    this._tooltip = node;
  };

  _renderTooltip() {
    const tooltipX = this._mouseX + TOOLTIP_OFFSET;
    const tooltipY = this._mouseY + TOOLTIP_OFFSET;
    return (
      <div
        ref={this._onTooltip}
        style={{
          userSelect: 'none',
          position: 'absolute',
          left: tooltipX,
          top: tooltipY,
          backgroundColor: 'white',
          fontSize: 10,
          fontFamily: ' Lucida Grande',
          padding: '2px 4px',
          boxShadow: '3px 3px 5px rgba(0,0,0,0.4)',
        }}
      >
        {this.state.hovered ? this.state.hovered.measure.name : ''}
      </div>
    );
  }

  render() {
    const renderableTrace = this._transformTrace(this.props.trace);
    if (renderableTrace[0] == null) {
      return <div>empty trace</div>;
    }

    // number of measures drawn, used to cap render complexity
    let drawn = 0;

    const extents = this._getExtents();
    const {startOffset, endOffset} = extents;

    const centerOffset = this.state.center;
    const rendered = (
      <div>
        {SHOW_CONTROLS && (
          <div style={{height: 50}}>
            <label>Zoom</label>
            <input
              type="range"
              value={this.state.zoom}
              step="0.0001"
              min="0"
              max="20"
              onChange={this._handleZoom}
            />
            <label>Center</label>
            <input
              type="range"
              value={this.state.center}
              step={String((endOffset - startOffset) * 0.0001)}
              min={String(startOffset)}
              max={String(endOffset)}
              style={{width: 300}}
              onChange={this._handleCenter}
            />
            <button onClick={this._handleLeft}>-</button>
            <button onClick={this._handleRight}>+</button>
          </div>
        )}
        <div
          style={{
            cursor: this.state.dragging ? 'grabbing' : 'grab',
            position: 'relative',
          }}
        >
          {this.props.renderer == 'canvas' ? (
            <canvas
              style={{willChange: 'transform'}}
              ref={this._onCanvas}
              onWheel={this._handleWheel}
              onMouseDown={this._mouseDown}
              onMouseMove={this._mouseMove}
              onMouseOut={this._mouseOut}
              width={this.props.viewportWidth}
              height={this.props.viewportHeight}
            />
          ) : (
            <div
              style={{
                width: this.props.viewportWidth,
                overflowX: 'scroll',
                height: this.props.viewportHeight,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  width: this._getContentWidth(),
                }}
              >
                {renderableTrace.map((measure, index) => {
                  const {width, height, x, y, inView} = this._getLayout(
                    measure,
                    0
                  );
                  if (!inView) {
                    return null;
                  }
                  if (
                    width <
                    this.props.viewportWidth * (DOM_DRAW_MIN_PERCENT / 100)
                  ) {
                    return null;
                  }
                  drawn++;
                  if (drawn > DOM_DRAW_LIMIT) {
                    return null;
                  }
                  return (
                    <div
                      key={index}
                      data-index={index}
                      title={`${(measure.measure.duration || 0).toFixed(2)}ms`}
                      style={{
                        position: 'absolute',
                        width,
                        height,
                        overflow: 'hidden',
                        backgroundColor: this._getMeasureColorRGB(
                          measure.measure
                        ),
                        // transform: `translate(${x}px, ${y}px) translateZ(0)`,
                        left: x,
                        top: y,
                        border:
                          this.state.selection == measure
                            ? 'solid red 1px'
                            : null,
                      }}
                      onClick={this._handleMeasureClick}
                    >
                      &nbsp;
                      {measure.measure.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {this._renderTooltip()}
        </div>

        {this.props.renderer === 'dom' && <span>drawn={drawn}</span>}
        <pre>
          {this.state.selection
            ? JSON.stringify(this.state.selection.measure, null, 2)
            : null}
        </pre>
      </div>
    );

    return rendered;
  }
}
