// @flow
import * as OpenSans from './OpenSans';
import * as mat4 from 'gl-matrix/mat4';

var scale = 22;
var buffer = 0.3;
var angle = 0;
var gamma = 1;
var debug = false;
const {metrics, getAtlas} = OpenSans;

// TODO: fix memory leack
const sanitizeTextCache = new Map();
const sanitizeText = input => {
  if (!sanitizeTextCache.has(input)) {
    sanitizeTextCache.set(input, input.replace(/\W/, ' '));
  }
  return sanitizeTextCache.get(input) || 'sanitizeText_ERR';
};

function drawGlyph(chr, pen, size, vertexElements, textureElements) {
  var metric = metrics.chars[chr];
  if (!metric) return;

  var scale = size / metrics.size;

  var factor = 1;

  var width = metric[0];
  var height = metric[1];
  var horiBearingX = metric[2];
  var horiBearingY = metric[3];
  var horiAdvance = metric[4];
  var posX = metric[5];
  var posY = metric[6];

  if (width > 0 && height > 0) {
    width += metrics.buffer * 2;
    height += metrics.buffer * 2;

    // Add a quad (= two triangles) per glyph.
    vertexElements.push(
      factor * (pen.x + (horiBearingX - metrics.buffer) * scale),
      factor * (pen.y - horiBearingY * scale),
      factor * (pen.x + (horiBearingX - metrics.buffer + width) * scale),
      factor * (pen.y - horiBearingY * scale),
      factor * (pen.x + (horiBearingX - metrics.buffer) * scale),
      factor * (pen.y + (height - horiBearingY) * scale),
      factor * (pen.x + (horiBearingX - metrics.buffer + width) * scale),
      factor * (pen.y - horiBearingY * scale),
      factor * (pen.x + (horiBearingX - metrics.buffer) * scale),
      factor * (pen.y + (height - horiBearingY) * scale),
      factor * (pen.x + (horiBearingX - metrics.buffer + width) * scale),
      factor * (pen.y + (height - horiBearingY) * scale)
    );

    textureElements.push(
      posX,
      posY,
      posX + width,
      posY,
      posX,
      posY + height,

      posX + width,
      posY,
      posX,
      posY + height,
      posX + width,
      posY + height
    );
  }

  // pen.x += Math.ceil(horiAdvance * scale);
  pen.x = pen.x + horiAdvance * scale;
}

function measureText(text: string, size) {
  var dimensions = {
    advance: 0,
  };

  var scale = size / metrics.size;
  for (var i = 0; i < text.length; i++) {
    var horiAdvance = metrics.chars[text[i]][4];
    dimensions.advance += horiAdvance * scale;
  }

  return dimensions;
}

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

export function init(
  gl: WebGLRenderingContext,
  onReady: (fns: {
    render: (text: string, x: number, y: number) => void,
    measureText: (text: string) => number,
  }) => void
) {
  const canvas = gl.canvas;
  gl.getExtension('OES_standard_derivatives');

  const vsSource = `
attribute vec2 a_pos;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;
uniform vec2 u_texsize;

varying vec2 v_texcoord;

void main() {
    gl_Position = u_matrix * vec4(a_pos.xy, 0, 1);
    v_texcoord = a_texcoord / u_texsize;
}`;

  const fsSource = `
precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_buffer;
uniform float u_gamma;
uniform float u_debug;

varying vec2 v_texcoord;

void main() {
    float dist = texture2D(u_texture, v_texcoord).r;
    if (u_debug > 0.0) {
        gl_FragColor = vec4(dist, dist, dist, 1);
    } else {
        float alpha = smoothstep(u_buffer - u_gamma, u_buffer + u_gamma, dist);
        gl_FragColor = vec4(u_color.rgb, alpha * u_color.a);
    }
}`;
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Initialize shaders
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      a_pos: gl.getAttribLocation(shaderProgram, 'a_pos'),
      a_texcoord: gl.getAttribLocation(shaderProgram, 'a_texcoord'),
    },
    uniformLocations: {
      u_matrix: gl.getUniformLocation(shaderProgram, 'u_matrix'),
      u_texture: gl.getUniformLocation(shaderProgram, 'u_texture'),
      u_texsize: gl.getUniformLocation(shaderProgram, 'u_texsize'),
      u_color: gl.getUniformLocation(shaderProgram, 'u_color'),
      u_buffer: gl.getUniformLocation(shaderProgram, 'u_buffer'),
      u_gamma: gl.getUniformLocation(shaderProgram, 'u_gamma'),
      u_debug: gl.getUniformLocation(shaderProgram, 'u_debug'),
    },
  };
  console.log({programInfo});

  var texture = gl.createTexture();

  function switchToProgram() {
    gl.useProgram(programInfo.program);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_pos);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_texcoord);
  }

  function doDraw(labelToDraw: string, x: number, y: number) {
    switchToProgram();

    var pMatrix = mat4.create();
    mat4.ortho(pMatrix, 0, canvas.width, canvas.height, 0, 0, -1);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    gl.enable(gl.BLEND);

    var vertexBuffer = gl.createBuffer();
    var textureBuffer = gl.createBuffer();
    var vertexBufferItems = 0;
    var textureBufferItems = 0;

    function createText(str, size) {
      var vertexElements = [];
      var textureElements = [];

      var dimensions = measureText(str, size);

      var pen = {
        // x: canvas.width / 2 - dimensions.advance / 2,
        // y: canvas.height / 2,
        x: 0,
        y: 0,
      };
      for (var i = 0; i < str.length; i++) {
        var chr = str[i];
        drawGlyph(chr, pen, size, vertexElements, textureElements);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertexElements),
        gl.STATIC_DRAW
      );
      vertexBufferItems = vertexElements.length / 2;

      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureElements),
        gl.STATIC_DRAW
      );
      textureBufferItems = textureElements.length / 2;
    }

    function draw(str: string, x: number, y: number) {
      // console.log('rendering text', str);
      // gl.clearColor(0.9, 0.9, 0.9, 1);
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      createText(str, scale);

      var mvMatrix = mat4.create();
      mat4.identity(mvMatrix);

      // crap for text rotation
      // mat4.translate(mvMatrix, mvMatrix, [
      //   canvas.width / 2,
      //   canvas.height / 2,
      //   0,
      // ]);
      // mat4.rotateZ(mvMatrix, mvMatrix, angle);
      // mat4.translate(mvMatrix, mvMatrix, [
      //   -canvas.width / 2,
      //   -canvas.height / 2,
      //   0,
      // ]);

      // position text
      // TODO: not center
      mat4.translate(mvMatrix, mvMatrix, [x * 2, y * 2, 0]);
      // mat4.translate(mvMatrix, mvMatrix, [0, 0, 0]);

      var mvpMatrix = mat4.create();
      mat4.multiply(mvpMatrix, pMatrix, mvMatrix);
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.u_matrix,
        false,
        mvpMatrix
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(programInfo.uniformLocations.u_texture, 0);

      // gl.uniform1f(programInfo.uniformLocations.u_scale, 1.0);
      gl.uniform1f(programInfo.uniformLocations.u_debug, debug ? 1 : 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.a_pos,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.a_texcoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      // glow
      // gl.uniform4fv(programInfo.uniformLocations.u_color, [1, 1, 1, 1]);
      // gl.uniform1f(programInfo.uniformLocations.u_buffer, buffer);
      // gl.drawArrays(gl.TRIANGLES, 0, vertexBufferItems);

      gl.uniform4fv(programInfo.uniformLocations.u_color, [0, 0, 0, 1]);
      gl.uniform1f(programInfo.uniformLocations.u_buffer, 192 / 256);
      gl.uniform1f(
        programInfo.uniformLocations.u_gamma,
        gamma * 1.4142 / scale
      );
      gl.drawArrays(gl.TRIANGLES, 0, vertexBufferItems);
    }

    draw(labelToDraw, x, y);
  }

  getAtlas(atlas => {
    switchToProgram();
    // loaded atlas texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // void gl.texImage2D(target, level, internalformat, format, type, HTMLImageElement? pixels);

    gl.texImage2D(
      gl.TEXTURE_2D, //target
      0, //level
      gl.LUMINANCE, //internalformat
      gl.LUMINANCE, //format
      gl.UNSIGNED_BYTE, //type
      atlas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.uniform2f(
      programInfo.uniformLocations.u_texsize,
      atlas.width,
      atlas.height
    );

    // ready
    onReady({
      render: (newText: string, x: number, y: number) => {
        doDraw(sanitizeText(newText), x, y);
      },
      measureText: (text: string) =>
        measureText(sanitizeText(text), scale).advance,
    });
  });
}
