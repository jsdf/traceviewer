// @flow
import React from 'react';
import {PX_PER_MS} from './constants';
import {getLayout, UtilsWithCache} from './renderUtils';
import type {RenderableTrace, Measure, Extents} from './renderUtils';
import type {RenderableMeasure} from './calculateTraceLayout';

type Props = {
  center: number,
  extents: Extents,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
  renderableTrace: RenderableTrace,
  onSelectionChange: (selection: ?RenderableMeasure<Measure>) => void,
};

const DOM_DRAW_LIMIT = 500;
const DOM_DRAW_MIN_PERCENT = 0.3;

export default class DOMRenderer extends React.Component<Props, void> {
  _utils = new UtilsWithCache();

  _getContentWidth() {
    const {size} = this.props.extents;
    return size * PX_PER_MS * this.props.zoom;
  }

  _handleMeasureClick = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const selected = this.props.renderableTrace[
      parseInt(event.currentTarget.getAttribute('data-index'))
    ];

    if (selected) {
      this.props.onSelectionChange(selected);
    }
  };

  render() {
    const {startOffset, endOffset} = this.props.extents;

    // number of measures drawn, used to cap render complexity
    let drawn = 0;

    return (
      <div>
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
            {this.props.renderableTrace.map((measure, index) => {
              const {width, height, x, y, inView} = getLayout(
                this.props,
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
                    backgroundColor: this._utils._getMeasureColorRGB(
                      measure.measure
                    ),
                    // transform: `translate(${x}px, ${y}px) translateZ(0)`,
                    left: x,
                    top: y,
                    border:
                      this.props.selection == measure ? 'solid red 1px' : null,
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

        <span>drawn={drawn}</span>
      </div>
    );
  }
}
