// @flow
import type {RenderableMeasure} from './calculateTraceLayout';

import memoizeWeak from './memoizeWeak';

import {PX_PER_MS, BAR_HEIGHT, BAR_Y_GUTTER, BAR_X_GUTTER} from './constants';

type Color = [number, number, number];

type StateForLayout = {
  center: number,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
};

export type Measure = {
  name: string,
  startTime: number,
  duration: number,
  group?: string,
};

export type Layout = {
  width: number,
  height: number,
  x: number,
  y: number,
  inView: boolean,
};

export type Extents = {
  startOffset: number,
  endOffset: number,
  size: number,
};

export type RenderableTrace = Array<RenderableMeasure<Measure>>;

function getRandomColor(): Color {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
}

export function getLayout(
  state: StateForLayout,
  measure: RenderableMeasure<Measure>,
  startY: number
) {
  state.center;

  const width = Math.max(state.zoom - BAR_X_GUTTER, 0);
  const height = BAR_HEIGHT;
  const x = state.zoom + state.viewportWidth / 2;
  const y = measure.stackIndex * (BAR_HEIGHT + BAR_Y_GUTTER) + startY;

  return {
    width,
    height,
    x,
    y,
    inView: !(x + width < 0 || state.viewportWidth < x),
  };
}

export class UtilsWithCache {
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
}
