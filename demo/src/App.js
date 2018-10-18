import React, {Component, unstable_AsyncMode as AsyncMode} from 'react';
import './App.css';
import tracedata from './exampledata';
import Trace from './Trace';

class App extends Component {
  render() {
    return (
      <div className="App">
        <AsyncMode>
          <Trace
            trace={tracedata}
            viewportWidth={1200}
            viewportHeight={500}
            renderer={
              window.location.search.slice(1) === 'dom' ? 'dom' : 'canvas'
            }
          />
        </AsyncMode>
      </div>
    );
  }
}

export default App;
