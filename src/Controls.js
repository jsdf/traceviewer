// @flow
import React from 'react';
import type {HandleStateChangeFn} from './State';

type Extents = {
  startOffset: number,
  endOffset: number,
  size: number,
};
type Props = {
  center: number,
  extents: Extents,
  zoom: number,
  onChange: HandleStateChangeFn,
};

export default class Controls extends React.Component<Props, void> {
  _handleZoom = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated = parseFloat(event.currentTarget.value);

    this.props.onChange({zoom: updated});
  };

  _handleCenter = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated = parseFloat(event.currentTarget.value);

    this.props.onChange({center: updated});
  };

  _handleLeft = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated =
      this.props.center - this.props.extents.size * 0.01 / this.props.zoom;

    this.props.onChange({center: updated});
  };

  _handleRight = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    const updated =
      this.props.center + this.props.extents.size * 0.01 / this.props.zoom;

    this.props.onChange({center: updated});
  };

  render() {
    const {startOffset, endOffset} = this.props.extents;

    return (
      <div style={{height: 50}}>
        <label>Zoom</label>
        <input
          type="range"
          value={this.props.zoom}
          step="0.0001"
          min="0"
          max="20"
          onChange={this._handleZoom}
        />
        <label>Center</label>
        <input
          type="range"
          value={this.props.center}
          step={String((endOffset - startOffset) * 0.0001)}
          min={String(startOffset)}
          max={String(endOffset)}
          style={{width: 300}}
          onChange={this._handleCenter}
        />
        <button onClick={this._handleLeft}>-</button>
        <button onClick={this._handleRight}>+</button>
      </div>
    );
  }
}
