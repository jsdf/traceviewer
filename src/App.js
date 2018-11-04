import React, {Component, unstable_AsyncMode as AsyncMode} from 'react';
import './App.css';
import tracedata from './exampledata';
import Trace from './Trace';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Trace
          truncateLabels={true}
          trace={tracedata}
          viewportWidth={1000}
          viewportHeight={600}
          renderer={
            window.location.search.slice(1) === 'dom' ? 'dom' : 'canvas'
          }
        />
      </div>
    );
  }
}

export default App;
