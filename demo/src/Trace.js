// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import memoize from 'memoize-one';
import transformTrace from './calculateTraceLayout';
import type {RenderableMeasure} from './calculateTraceLayout';

type Measure = {
  name: string,
  startTime: number,
  duration: number,
};

const BAR_HEIGHT = 20;
const PX_PER_MS = 1;

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

// const run = fn => requestIdleCallback(fn);
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
    this.state = {
      selection: null,
      center: loadValue('center', startOffset + size / 2),
      zoom: loadValue('zoom', 1),
    };
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      storeValue('center', this.state.center);
      storeValue('zoom', this.state.zoom);
    };
  }

  _transformTrace = memoize(trace => transformTrace(trace).slice(0, 1000));

  _handleZoom = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated = parseFloat(event.currentTarget.value);
    run(() => {
      this.setState({zoom: updated});
    });
  };

  _handleCenter = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated = parseFloat(event.currentTarget.value);
    run(() => {
      this.setState({center: updated});
    });
  };

  _handleLeft = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const {size} = this._getExtents();
    const updated = this.state.center - size * 0.05 / this.state.zoom;
    run(() => {
      this.setState({center: updated});
    });
  };

  _handleRight = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const {size} = this._getExtents();
    const updated = this.state.center + size * 0.05 / this.state.zoom;
    run(() => {
      this.setState({center: updated});
    });
  };

  _handleMeasureClick = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    this.setState({
      selection: this._transformTrace(this.props.trace)[
        parseInt(event.currentTarget.getAttribute('data-index'))
      ],
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
          this.setState({zoom: updated});
        });
        break;
      }
      case 'a': {
        const updated = this.state.center - 0.05 * size / this.state.zoom;
        run(() => {
          this.setState({center: updated});
        });
        break;
      }
      case 's': {
        const updated = this.state.zoom / 2;
        run(() => {
          this.setState({zoom: updated});
        });
        break;
      }
      case 'd': {
        const updated = this.state.center + 0.05 * size / this.state.zoom;
        run(() => {
          this.setState({center: updated});
        });
        break;
      }
    }
  };

  componentDidMount() {
    document.addEventListener('keypress', this._handleKey);
    if (this.props.renderer == 'canvas') {
      const canvas = this._canvas;
      if (canvas instanceof HTMLCanvasElement && canvas.parentElement) {
        canvas.width = canvas.parentElement.getBoundingClientRect().width;
      }
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

  _getLayout(
    measure: RenderableMeasure<Measure>,
    extents: {startOffset: number, endOffset: number}
  ) {
    const {startOffset, endOffset} = extents;

    const centerOffset = this.state.center;

    const width = measure.measure.duration * PX_PER_MS * this.state.zoom,
      height = BAR_HEIGHT,
      x =
        (measure.measure.startTime - centerOffset) *
          PX_PER_MS *
          this.state.zoom +
        this.props.viewportWidth / 2,
      y = measure.stackIndex * BAR_HEIGHT;

    return {
      width,
      height,
      x,
      y,
      inView: !(x + width < 0 || this.props.viewportWidth < x),
    };
  }

  _renderCanvas() {
    const canvas = this._canvas;
    if (canvas instanceof HTMLCanvasElement) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const renderableTrace = this._transformTrace(this.props.trace);
      if (renderableTrace[0] == null) {
        return;
      }

      const extents = this._getExtents();

      for (var index = 0; index < renderableTrace.length; index++) {
        const measure = renderableTrace[index];

        const {width, height, x, y} = this._getLayout(measure, extents);

        ctx.fillStyle = this._getMeasureColor(measure.measure);
        ctx.fillRect(x, y, width, height);

        ctx.font = '10px Lucida Grande';
        ctx.fillStyle = 'black';

        ctx.fillText(measure.measure.name, x, y + BAR_HEIGHT / 2 + 4, width);
      }
    }
  }

  render() {
    const renderableTrace = this._transformTrace(this.props.trace);
    if (renderableTrace[0] == null) {
      return <div>empty trace</div>;
    }

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
          onChange={this._handleCenter}
        />
        <button onClick={this._handleLeft}>-</button>
        <button onClick={this._handleRight}>+</button>

        <div
          style={{
            width: this.props.viewportWidth,
            overflowX: 'scroll',
            height: this.props.viewportHeight,
          }}
        >
          {this.props.renderer == 'canvas' ? (
            <canvas
              ref={this._onCanvas}
              width={this.props.viewportWidth}
              height={this.props.viewportHeight}
            />
          ) : (
            <div
              style={{
                position: 'relative',
                fontSize: '10px',
                whiteSpace: 'nowrap',
              }}
            >
              {renderableTrace.map((measure, index) => {
                const {width, height, x, y, inView} = this._getLayout(
                  measure,
                  extents
                );
                if (!inView) {
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
                      transform: `translate(${x}px, ${y}px)`,
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
          )}
        </div>
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
