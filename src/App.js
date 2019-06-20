// @flow
import React, {Component} from 'react';
import './App.css';
import tracedata from './exampledata';
import causaldata from './causaldata';
import Trace from './Trace';

const FIXED = true;
const HEIGHT = FIXED ? 600 : window.innerHeight - 100;
const WIDTH = window.innerWidth;
const LARGE = window.location.search.slice(1).includes('large');
const SINGLE_GROUP = window.location.search.slice(1).includes('single');

let transformedTracedata = SINGLE_GROUP
  ? tracedata
  : tracedata.map((m, i) => ({
      ...m,
      group: String(i % 3),
    }));

transformedTracedata = LARGE
  ? (() => {
      let bigData = transformedTracedata.slice();
      const last = transformedTracedata[transformedTracedata.length - 1];
      if (last) {
        const lastEndTime = 5000;
        for (let i = 0; i < 5; i++) {
          for (
            let traceIdx = 0;
            traceIdx < transformedTracedata.length;
            traceIdx++
          ) {
            bigData.push({
              ...transformedTracedata[traceIdx],
              startTime:
                transformedTracedata[traceIdx].startTime + lastEndTime * i,
            });
          }
        }
      }
      return bigData;
    })()
  : transformedTracedata;

console.log('transformedTracedata.length', transformedTracedata.length);

class App extends Component<void> {
  render() {
    return (
      <div className="App">
        <Trace
          truncateLabels={true}
          persistView={true}
          trace={transformedTracedata}
          // trace={causaldata}
          viewportWidth={WIDTH}
          viewportHeight={HEIGHT}
          renderer={
            window.location.search.slice(1).includes('dom')
              ? 'dom'
              : window.location.search.slice(1).includes('webgl')
              ? 'webgl'
              : 'canvas'
          }
        />
      </div>
    );
  }
}

export default App;
