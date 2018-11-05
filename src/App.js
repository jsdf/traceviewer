// @flow
import React, {Component} from 'react';
import './App.css';
import tracedata from './exampledata';
import Trace from './Trace';

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
          viewportWidth={window.innerWidth}
          viewportHeight={600}
          renderer={
            window.location.search.slice(1).includes('dom') ? 'dom' : 'canvas'
          }
        />
      </div>
    );
  }
}

export default App;
