// @flow

import * as mat4 from 'gl-matrix/mat4';
import type {RenderableTrace, Measure, Extents, Layout} from './renderUtils';
import {getLayout, UtilsWithCache} from './renderUtils';
import memoizeWeak from './memoizeWeak';

export type WebGLRenderState = {
  center: number,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
  renderableTrace: RenderableTrace,
};

type Color = [number, number, number, number];

function getRandomColor() {
  return [
    1 - Math.random() * 0.5,
    1 - Math.random() * 0.7,
    1 - Math.random() * 0.3,
    1.0,
  ];
}

const getColorForMeasure: Measure => Color = memoizeWeak(measure =>
  getRandomColor()
);

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(
      'Unable to initialize the shader program: ' +
        (gl.getProgramInfoLog(shaderProgram) || '')
    );
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      'An error occurred compiling the shaders: ' +
        (gl.getShaderInfoLog(shader) || '')
    );
  }

  return shader;
}

const SQUARE_VERTICES = 4; // square
function initBuffers(gl, state) {
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  const positions = [];
  const colors = [];

  let positionLength = 0;
  for (let i = 0; i < state.renderableTrace.length; i++) {
    const measure = state.renderableTrace[i];
    const layout = getLayout(state, measure, 0 /*startY*/);
    if (!layout.inView) {
      continue;
    }

    const x = layout.x / state.viewportWidth * 2 - 1;
    const y = layout.y / state.viewportHeight * 2 - 1; // flip sign
    const width = layout.width / state.viewportWidth * 2;
    const height = layout.height / state.viewportHeight * 2;
    positions.push(x, y, 1);
    positions.push(x + width, y, 1);
    positions.push(x, y + height, 1);
    positions.push(x + width, y + height, 1);
    positionLength += SQUARE_VERTICES;

    const color = getColorForMeasure(measure.measure);
    for (let k = 0; k < SQUARE_VERTICES; k++) {
      colors.push(...color);
    }
  }

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    positionLength,
    color: colorBuffer,
  };
}

function drawScene(gl, programInfo, buffers, state) {
  gl.clearColor(1, 1, 1, 1.0); // Clear to white, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // orthographic projection. flip y axis
  mat4.ortho(projectionMatrix, -1, 1, 1, -1, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0]
  ); // amount to translate

  for (
    let primitiveIdx = 0;
    primitiveIdx < buffers.positionLength / 4;
    primitiveIdx++
  ) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = primitiveIdx * numComponents * SQUARE_VERTICES;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = numComponents * primitiveIdx * SQUARE_VERTICES;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }
    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    {
      const offset = 3 * primitiveIdx;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, SQUARE_VERTICES);
    }
  }
}
export function initWebGLRenderer(gl: WebGLRenderingContext) {
  // Vertex shader program

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        'uProjectionMatrix'
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };
  console.log({programInfo});

  return function rerender(state: WebGLRenderState) {
    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl, state);

    // Draw the scene
    drawScene(gl, programInfo, buffers, state);
  };
}
