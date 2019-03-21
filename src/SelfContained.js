// @flow
import React from 'react';
import Trace from './Trace';
import ReactDOM from 'react-dom';
import type {Measure} from './renderUtils';

type Props = {
  groupOrder?: Array<string>,
  truncateLabels: boolean,
  trace: Array<Measure>,
  renderer: 'canvas' | 'dom' | 'webgl',
  viewportWidth: number,
  viewportHeight: number,
};

export default function render(props: Props, container: Element) {
  ReactDOM.render(<Trace {...props} />, container);
}
