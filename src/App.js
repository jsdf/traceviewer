// @flow
import React, {Component} from 'react';
import './App.css';
import tracedata from './exampledata';
import Trace from './Trace';

const FIXED = true;
const HEIGHT = FIXED ? 600 : window.innerHeight - 100;
const WIDTH = window.innerWidth;

class App extends Component<void> {
  render() {
    return (
      <div className="App">
        <Trace
          truncateLabels={true}
          trace={
            window.location.search.slice(1).includes('single')
              ? tracedata
              : tracedata.map((m, i) => ({
                  ...m,
                  group: String(i % 3),
                }))
          }
          viewportWidth={WIDTH}
          viewportHeight={HEIGHT}
          renderer={
            window.location.search.slice(1).includes('dom') ? 'dom' : 'canvas'
          }
        />
      </div>
    );
  }
}

export default App;
