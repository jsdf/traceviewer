// @flow

import type {Measure} from './renderUtils';
import memoizeWeak from './memoizeWeak';

type Color = [number, number, number, number];

export function getRandomColor() {
  return [
    1 - Math.random() * 0.5,
    1 - Math.random() * 0.7,
    1 - Math.random() * 0.3,
    1.0,
  ];
}

export const getColorForMeasure: Measure => Color = memoizeWeak(measure =>
  getRandomColor()
);
