// @flow
import React from 'react';
import {
  CanvasRendererImpl,
  Canvas2DRendererImpl,
  CanvasWebGlRendererImpl,
} from './CanvasRendererImpl';
import type {Props} from './CanvasRendererImpl';

const CANVAS_FRAMECOUNTER = false;
const CANVAS_USE_WEBGL = false;

export default class CanvasRenderer extends React.Component<Props, void> {
  renderer: CanvasRendererImpl;
  constructor(props: Props) {
    super(props);

    const RendererImpl =
      CANVAS_USE_WEBGL || props.renderer == 'webgl'
        ? CanvasWebGlRendererImpl
        : Canvas2DRendererImpl;
    this.renderer = new RendererImpl(props);
  }

  componentDidMount() {
    this.renderer.didMount();
  }

  componentDidUpdate() {
    this.renderer.props = this.props;
    this.renderer.didUpdate();
  }

  render() {
    return (
      <div>
        <canvas
          ref={this.renderer._onCanvas}
          onMouseDown={this.renderer._mouseDown}
          onMouseMove={this.renderer._mouseMove}
          onMouseOut={this.renderer._mouseOut}
          width={this.props.viewportWidth}
          height={this.props.viewportHeight}
        />
        {CANVAS_FRAMECOUNTER && (
          <div style={{position: 'absolute', top: 10, right: 10, fontSize: 64}}>
            {this.renderer._lastFrameFPS} fps
          </div>
        )}
      </div>
    );
  }
}
