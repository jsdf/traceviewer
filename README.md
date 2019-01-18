# flamechart

trace viewer/flamechart component which can render large traces

## demos

- [webgl renderer](https://jsdf.github.io/flamechart/?webgl)
- [canvas renderer](https://jsdf.github.io/flamechart/?canvas)
- [dom renderer](https://jsdf.github.io/flamechart/?dom)

## screenshots

![flamechart screenshot](https://i.imgur.com/uc1vJXy.png)


## usage

I haven't quite packaged this up for release yet, but if you want to try it now, you can clone this repo. The API is:

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
