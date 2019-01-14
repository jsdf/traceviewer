// @flow
import React from 'react';
import ReactDOM from 'react-dom';
// $FlowFixMe
import memoize from 'memoize-one';
import transformTrace from './calculateTraceLayout';
import type {RenderableMeasure} from './calculateTraceLayout';
import type {Measure, Layout, RenderableTrace} from './renderUtils';
import {UtilsWithCache} from './renderUtils';
import Controls from './Controls';
import DOMRenderer from './DOMRenderer';
import CanvasRenderer from './CanvasRenderer';
import type {HandleStateChangeFn} from './State';

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

const SHOW_CONTROLS = false;

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
    window.onbeforeunload = () => {
      storeValue('center', this.state.center);
      storeValue('zoom', this.state.zoom);
    };
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

  _handleSelectionChange = (selection: ?RenderableMeasure<Measure>) => {
    this.setState({selection});
  };

  _clampCenter(updated: number) {
    const {startOffset, endOffset} = this._getExtents();
    return Math.max(startOffset, Math.min(endOffset, updated));
  }

  _clampZoom(updated: number) {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, updated));
  }

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

  _getExtents() {
    const renderableTrace = this._transformTrace(this.props.trace);

    const renderableTraceGroups = this._transformTraceGroups(this.props.trace);

    const startOffset = renderableTrace[0].measure.startTime;
    const last = renderableTrace[renderableTrace.length - 1];
    const endOffset = last.measure.startTime + last.measure.duration;

    return {
      startOffset,
      endOffset,
      size: endOffset - startOffset,
    };
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

  _handleStateChange: HandleStateChangeFn = changes => {
    this.setState(prevState => {
      return {
        ...changes,
        zoom:
          changes.zoom != null ? this._clampZoom(changes.zoom) : prevState.zoom,
        center:
          changes.center != null
            ? this._clampCenter(changes.center)
            : prevState.center,
      };
    });
  };

  render() {
    const renderableTrace = this._transformTrace(this.props.trace);

    const renderableTraceGroups = this._transformTraceGroups(this.props.trace);
    if (renderableTrace[0] == null) {
      return <div>empty trace</div>;
    }

    const extents = this._getExtents();
    const {startOffset, endOffset} = extents;

    const centerOffset = this.state.center;
    const rendered = (
      <div>
        {SHOW_CONTROLS && (
          <Controls
            zoom={this.state.zoom}
            center={this.state.center}
            extents={this._getExtents()}
            onChange={this._handleStateChange}
          />
        )}
        <div
          style={{
            cursor: this.state.dragging ? 'grabbing' : 'grab',
            position: 'relative',
          }}
        >
          {this.props.renderer == 'canvas' ? (
            <CanvasRenderer
              renderableTrace={renderableTrace}
              renderableTraceGroups={renderableTraceGroups}
              groupOrder={this.props.groupOrder}
              zoom={this.state.zoom}
              center={this.state.center}
              extents={this._getExtents()}
              viewportWidth={this.props.viewportWidth}
              viewportHeight={this.props.viewportHeight}
              selection={this.state.selection}
              hovered={this.state.hovered}
              tooltip={this._tooltip}
              truncateLabels={this.props.truncateLabels}
              onStateChange={this._handleStateChange}
              onSelectionChange={this._handleSelectionChange}
            />
          ) : (
            <DOMRenderer
              renderableTrace={renderableTrace}
              zoom={this.state.zoom}
              center={this.state.center}
              extents={this._getExtents()}
              viewportWidth={this.props.viewportWidth}
              viewportHeight={this.props.viewportHeight}
              onSelectionChange={this._handleSelectionChange}
            />
          )}
          {this._renderTooltip()}
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
