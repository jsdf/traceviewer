// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import memoize from 'memoize-one';
import Flatbush from 'flatbush';
import transformTrace from './calculateTraceLayout';
import type {RenderableMeasure} from './calculateTraceLayout';

type Measure = {
  name: string,
  startTime: number,
  duration: number,
};

const BAR_HEIGHT = 16;
const BAR_Y_GUTTER = 1;
const BAR_X_GUTTER = 1;
const PX_PER_MS = 1;
const DRAW_LIMIT = 500;
const DRAW_MIN_PERCENT = 0.3;
const DRAW_TEXT_MIN_PERCENT = 1;
const DRAW_TEXT_MIN_PX = 30;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 100;

function memoizeWeak<TArg, TRet>(fn: (arg: TArg) => TRet): (arg: TArg) => TRet {
  const cache = new WeakMap();
  return (arg: TArg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg) || fn(arg);
  };
}

function getRandomColor(): string {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function truncateText(text: string, endSize: number) {
  return `${text.slice(0, endSize)}\u{2026}${text.slice(
    text.length - 1 - endSize
  )}`;
}

type Props = {
  trace: Array<Measure>,
  renderer: 'canvas' | 'dom',
  viewportWidth: number,
  viewportHeight: number,
};

type State = {
  center: number,
  zoom: number,
  selection: ?RenderableMeasure<Measure>,
};

// const run = fn => requestAnimationFrame(fn);
const run = fn => fn();

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
  constructor(props: Props) {
    super(props);
    const {startOffset, size} = this._getExtents();
    const zoom = loadValue('zoom', 1);
    this.state = {
      selection: null,
      center: loadValue(
        'center',
        startOffset + this.props.viewportWidth / PX_PER_MS / 2
      ),
      zoom,
    };
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      storeValue('center', this.state.center);
      storeValue('zoom', this.state.zoom);
    };
  }

  _transformTrace = memoize(trace => transformTrace(trace));

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

  _dragging = false;

  _dragStart = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this._dragging = true;
  };
  _dragMove = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    if (this._dragging) {
      const updated =
        this.state.center - event.movementX / PX_PER_MS / this.state.zoom;
      run(() => {
        this.setState({center: this._clampCenter(updated)});
      });
    }
  };
  _dragEnd = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    this._dragging = false;
  };

  _handleWheel = (event: SyntheticMouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // zoom centered on mouse
    const rect = event.currentTarget.getBoundingClientRect();
    const canvasMouseX = event.clientX - rect.left;
    const mouseOffsetFromCenter = canvasMouseX - this.props.viewportWidth / 2;
    const updatedZoom = this.state.zoom * (1 + 0.005 * -event.deltaY);
    const updatedCenter =
      this.state.center +
      // offset to time space before zoom
      mouseOffsetFromCenter / PX_PER_MS / this.state.zoom -
      // offset to time space after zoom
      mouseOffsetFromCenter / PX_PER_MS / updatedZoom;
    run(() => {
      this.setState({
        zoom: this._clampZoom(updatedZoom),
        center: this._clampCenter(updatedCenter),
      });
    });
  };

  _canvas: ?Node = null;

  _onCanvas = (node: ?Node) => {
    this._canvas = node;
  };

  _handleKey = (event: KeyboardEvent<>) => {
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

  _handleScroll() {}

  componentDidMount() {
    document.addEventListener('keypress', this._handleKey);
    if (this.props.renderer == 'canvas') {
      const canvas = this._canvas;
      this._renderCanvas();
    }
  }
  componentDidUpdate() {
    if (this.props.renderer == 'canvas') {
      this._renderCanvas();
    }
  }

  _getMeasureColor: Measure => string = memoizeWeak(measure =>
    getRandomColor()
  );

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

  _getLayout(measure: RenderableMeasure<Measure>) {
    const centerOffset = this.state.center;

    const width = Math.max(
      measure.measure.duration * PX_PER_MS * this.state.zoom - BAR_X_GUTTER,
      0
    );
    const height = BAR_HEIGHT;
    const x =
      (measure.measure.startTime - centerOffset) * PX_PER_MS * this.state.zoom +
      this.props.viewportWidth / 2;
    const y = measure.stackIndex * (BAR_HEIGHT + BAR_Y_GUTTER);

    return {
      width,
      height,
      x,
      y,
      inView: !(x + width < 0 || this.props.viewportWidth < x),
    };
  }

  _getCanvasContext = memoize((canvas: HTMLCanvasElement) => {
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
    var ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
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

  _renderCanvas() {
    const canvas = this._canvas;
    if (canvas instanceof HTMLCanvasElement) {
      var ctx = this._getCanvasContext(canvas);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const renderableTrace = this._transformTrace(this.props.trace);
      if (renderableTrace[0] == null) {
        return;
      }

      const extents = this._getExtents();

      let drawn = 0;

      for (var index = 0; index < renderableTrace.length; index++) {
        const measure = renderableTrace[index];

        const {width, height, x, y, inView} = this._getLayout(measure);

        if (!inView) {
          continue;
        }

        ctx.fillStyle = this._getMeasureColor(measure.measure);
        ctx.fillRect(x, y, width, height);

        // skip text rendering for small measures
        // text is by far the most expensive part of rendering the trace
        if (width < DRAW_TEXT_MIN_PX) {
          continue;
        }

        const textGutterPx = 2;

        const textWidth = Math.max(width - textGutterPx, 0);

        ctx.font = '10px Lucida Grande';
        ctx.fillStyle = 'black';

        const label = measure.measure.name;

        const labelTrimmed = this._fitText(ctx, label, textWidth);
        ctx.fillText(
          labelTrimmed,
          x + textGutterPx,
          y + BAR_HEIGHT / 2 + 4,
          textWidth
        );
      }
    }
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
        <div>
          {this.props.renderer == 'canvas' ? (
            <canvas
              ref={this._onCanvas}
              onWheel={this._handleWheel}
              onMouseDown={this._dragStart}
              onMouseMove={this._dragMove}
              onMouseUp={this._dragEnd}
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
              onScroll={this._handleScroll}
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
                    measure
                  );
                  if (!inView) {
                    return null;
                  }
                  if (
                    width <
                    this.props.viewportWidth * (DRAW_MIN_PERCENT / 100)
                  ) {
                    return null;
                  }
                  drawn++;
                  if (drawn > DRAW_LIMIT) {
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
                        backgroundColor: this._getMeasureColor(measure.measure),
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
        </div>
        <span>drawn={drawn}</span>
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
