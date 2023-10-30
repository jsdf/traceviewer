# traceviewer

trace viewer/traceviewer component which can render large traces

## demos

- [webgl renderer](https://jsdf.github.io/traceviewer/?webgl)
- [canvas renderer](https://jsdf.github.io/traceviewer/?canvas&single)
- [canvas renderer (showing multiple aligned traces)](https://jsdf.github.io/traceviewer/?canvas)
- [dom renderer (less complete)](https://jsdf.github.io/traceviewer/?dom)

## screenshots

![traceviewer screenshot](https://i.imgur.com/uc1vJXy.png)


## usage

I haven't quite cleaned this up for release yet, but if you want to try it now, you can clone this repo. The API is:

```js
import Trace from './src/Trace';

<Trace
  truncateLabels={true} // middle-truncate measure labels to fit width
  trace={[{name: 'something', startTime: 100, duration: 20]} // array of objects like https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMeasure
  viewportWidth={1024}
  viewportHeight={768}
  renderer="webgl" // or "canvas" or "dom"
/>
```
