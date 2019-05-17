'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var memoize = _interopDefault(require('memoize-one'));
var debounce = _interopDefault(require('debounce'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// renderable trace has vertical layout precaluated:
// overlapping measures stack vertically based on start time
var EDGETYPES_SORT_WEIGHTS = {
  end: 0,
  start: 1
};
function calculateTraceLayout(trace) {
  // we need to find all overlapping measures, so we will create points
  // representing the start and end of each measure, then sort the points by
  // point time, breaking ties by putting points representing closing measures
  // first (in reverse order of start time), then opening measures (in order of
  var edges = trace // .slice(0, 3)
  .reduce(function (edges, measure) {
    // zero size measures are omitted from the trace
    if (measure.duration > 0) {
      edges.push({
        type: 'start',
        time: measure.startTime,
        measure: measure
      });
      edges.push({
        type: 'end',
        time: measure.startTime + measure.duration,
        measure: measure
      });
    }

    return edges;
  }, []).sort(function (a, b) {
    if (a.time !== b.time) {
      return a.time - b.time;
    } // break ties between different types


    if (a.type !== b.type) {
      return EDGETYPES_SORT_WEIGHTS[a.type] - EDGETYPES_SORT_WEIGHTS[b.type];
    } // break ties between same type


    switch (a.type) {
      case 'end':
        // start time desc (so inner measures close first)
        return b.measure.startTime - a.measure.startTime;

      case 'start':
        // end time desc (so outer measures open first)
        return b.measure.startTime + b.measure.duration - (a.measure.startTime + a.measure.duration);

      default:
        a.type;
        throw new Error('panic');
    }
  }); // to implement the trace layout we need to calculate the vertical offset of
  // each measure as they stack up. we want to place a measure at the highest
  // offset for which there isn't a currently open measure. to do so we keep an
  // array of currently open measures

  var renderableTrace = [];
  var openStack = [];
  var measuresStackIndexes = new Map();

  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];

    switch (edge.type) {
      case 'start':
        var nextStackIndex = openStack.length;
        renderableTrace.push({
          stackIndex: nextStackIndex,
          measure: edge.measure
        });
        measuresStackIndexes.set(edge.measure, nextStackIndex);
        openStack.push(edge.measure);
        break;

      case 'end':
        var stackIndexToRemove = measuresStackIndexes.get(edge.measure); // should never be null

        if (stackIndexToRemove != null) {
          openStack[stackIndexToRemove] = null;
        } else {
          console.log('couldnt find measure to remove', edge);
        } // truncate stack


        var newLength = openStack.length;

        while (newLength > 0 && openStack[newLength - 1] == null) {
          newLength--;
        }

        if (openStack.length !== newLength) {
          openStack.length = newLength;
        }

        break;

      default:
        edge.type;
        throw new Error('panic');
    }
  }

  return renderableTrace;
}

function memoizeWeak(fn) {
  var cache = new WeakMap();
  return function (arg) {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }

    return cache.get(arg) || fn(arg);
  };
}

var PX_PER_MS = 1;
var BAR_HEIGHT = 16;
var BAR_Y_GUTTER = 1;
var BAR_X_GUTTER = 1;
var MIN_ZOOM_SMALL = 0.2;
var MIN_ZOOM_LARGE = 0.01;
var LARGE = window.location.search.slice(1).includes('large');
var MIN_ZOOM = LARGE ? MIN_ZOOM_LARGE : MIN_ZOOM_SMALL; // TODO: determine from trace extents

var MAX_ZOOM = 100;
var TOOLTIP_OFFSET = 8;

function getRandomColor() {
  return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
}

function getLayout(state, measure, startY) {
  var centerOffset = state.center;
  var width = Math.max(measure.measure.duration * PX_PER_MS * state.zoom - BAR_X_GUTTER, 0);
  var height = BAR_HEIGHT;
  var x = (measure.measure.startTime - centerOffset) * PX_PER_MS * state.zoom + state.viewportWidth / 2;
  var y = measure.stackIndex * (BAR_HEIGHT + BAR_Y_GUTTER) + startY;
  return {
    width: width,
    height: height,
    x: x,
    y: y,
    inView: !(x + width < 0 || state.viewportWidth < x)
  };
}
var UtilsWithCache =
/*#__PURE__*/
function () {
  function UtilsWithCache() {
    var _this = this;

    _classCallCheck(this, UtilsWithCache);

    _defineProperty(this, "_getMeasureColor", memoizeWeak(function (measure) {
      return getRandomColor();
    }));

    _defineProperty(this, "_getMeasureColorRGB", memoizeWeak(function (measure) {
      var color = _this._getMeasureColor(measure);

      return "rgb(".concat(color[0], ",").concat(color[1], ",").concat(color[2], ")");
    }));

    _defineProperty(this, "_getMeasureHoverColorRGB", memoizeWeak(function (measure) {
      var color = _this._getMeasureColor(measure);

      return "rgb(".concat(Math.min(color[0] + 20, 255), ",").concat(Math.min(color[1] + 20, 255), ",").concat(Math.min(color[2] + 20, 255), ")");
    }));
  }

  _createClass(UtilsWithCache, [{
    key: "_getMeasureColorRGBA",
    value: function _getMeasureColorRGBA(measure, opacity) {
      var color = this._getMeasureColor(measure);

      return "rgba(".concat(color[0], ",").concat(color[1], ",").concat(color[2], ",").concat(opacity, ")");
    }
  }]);

  return UtilsWithCache;
}();

var Controls =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Controls, _React$Component);

  function Controls() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Controls);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Controls)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleZoom", function (event) {
      var updated = parseFloat(event.currentTarget.value);

      _this.props.onChange({
        zoom: updated
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleCenter", function (event) {
      var updated = parseFloat(event.currentTarget.value);

      _this.props.onChange({
        center: updated
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleLeft", function (event) {
      var updated = _this.props.center - _this.props.extents.size * 0.01 / _this.props.zoom;

      _this.props.onChange({
        center: updated
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleRight", function (event) {
      var updated = _this.props.center + _this.props.extents.size * 0.01 / _this.props.zoom;

      _this.props.onChange({
        center: updated
      });
    });

    return _this;
  }

  _createClass(Controls, [{
    key: "render",
    value: function render() {
      var _this$props$extents = this.props.extents,
          startOffset = _this$props$extents.startOffset,
          endOffset = _this$props$extents.endOffset;
      return React.createElement("div", {
        style: {
          height: 50
        }
      }, React.createElement("label", null, "Zoom"), React.createElement("input", {
        type: "range",
        value: this.props.zoom,
        step: "0.0001",
        min: "0",
        max: "20",
        onChange: this._handleZoom
      }), React.createElement("label", null, "Center"), React.createElement("input", {
        type: "range",
        value: this.props.center,
        step: String((endOffset - startOffset) * 0.0001),
        min: String(startOffset),
        max: String(endOffset),
        style: {
          width: 300
        },
        onChange: this._handleCenter
      }), React.createElement("button", {
        onClick: this._handleLeft
      }, "-"), React.createElement("button", {
        onClick: this._handleRight
      }, "+"));
    }
  }]);

  return Controls;
}(React.Component);

var DOM_DRAW_LIMIT = 500;
var DOM_DRAW_MIN_PERCENT = 0.3;

var DOMRenderer =
/*#__PURE__*/
function (_React$Component) {
  _inherits(DOMRenderer, _React$Component);

  function DOMRenderer() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, DOMRenderer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(DOMRenderer)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_utils", new UtilsWithCache());

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleMeasureClick", function (event) {
      var selected = _this.props.renderableTrace[parseInt(event.currentTarget.getAttribute('data-index'))];

      if (selected) {
        _this.props.onSelectionChange(selected);
      }
    });

    return _this;
  }

  _createClass(DOMRenderer, [{
    key: "_getContentWidth",
    value: function _getContentWidth() {
      var size = this.props.extents.size;
      return size * PX_PER_MS * this.props.zoom;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props$extents = this.props.extents,
          startOffset = _this$props$extents.startOffset,
          endOffset = _this$props$extents.endOffset; // number of measures drawn, used to cap render complexity

      var drawn = 0;
      return React.createElement("div", null, React.createElement("div", {
        style: {
          width: this.props.viewportWidth,
          overflowX: null,
          height: this.props.viewportHeight
        }
      }, React.createElement("div", {
        style: {
          position: 'relative',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          width: null
        }
      }, this.props.renderableTrace.map(function (measure, index) {
        var _getLayout = getLayout(_this2.props, measure, 0),
            width = _getLayout.width,
            height = _getLayout.height,
            x = _getLayout.x,
            y = _getLayout.y,
            inView = _getLayout.inView;

        if (!inView) {
          return null;
        }

        if (width < _this2.props.viewportWidth * (DOM_DRAW_MIN_PERCENT / 100)) {
          return null;
        }

        drawn++;

        if (drawn > DOM_DRAW_LIMIT) {
          return null;
        }

        return React.createElement("div", {
          key: index,
          "data-index": index,
          title: "".concat((measure.measure.duration || 0).toFixed(2), "ms"),
          style: {
            position: 'absolute',
            width: width,
            height: height,
            overflow: 'hidden',
            backgroundColor: _this2._utils._getMeasureColorRGB(measure.measure),
            // transform: `translate(${x}px, ${y}px) translateZ(0)`,
            left: x,
            top: y,
            border: _this2.props.selection == measure ? 'solid red 1px' : null
          },
          onClick: _this2._handleMeasureClick
        }, "\xA0", measure.measure.name);
      }))), React.createElement("span", null, "drawn=", drawn));
    }
  }]);

  return DOMRenderer;
}(React.Component);

/**
 * Common utilities
 * @module glMatrix
 */
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var degree = Math.PI / 180;

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create() {
  var out = new ARRAY_TYPE(16);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */

function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */

function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function ortho(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}

function getRandomColor$1() {
  return [1 - Math.random() * 0.5, 1 - Math.random() * 0.7, 1 - Math.random() * 0.3, 1.0];
}
var getColorForMeasure = memoizeWeak(function (measure) {
  return getRandomColor$1();
});

// just applies a transform matrix each render
//

var vsSource = "\n    attribute vec4 aVertexPosition;\n    attribute vec4 aVertexColor;\n\n    uniform mat4 uModelViewMatrix;\n    uniform mat4 uProjectionMatrix;\n\n    varying lowp vec4 vColor;\n\n    void main(void) {\n      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n      vColor = aVertexColor;\n    }\n  ";
var fsSource = "\n    varying lowp vec4 vColor;\n\n    void main(void) {\n      gl_FragColor = vColor;\n    }\n  "; //
// Initialize a shader program, so WebGL knows how to draw our data
//

function initShaderProgram(gl, vsSource, fsSource) {
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource); // Create the shader program

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram); // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('Unable to initialize the shader program: ' + (gl.getProgramInfoLog(shaderProgram) || ''));
  }

  return shaderProgram;
} //
// creates a shader of the given type, uploads the source and
// compiles it.
//


function loadShader(gl, type, source) {
  var shader = gl.createShader(type); // Send the source to the shader object

  gl.shaderSource(shader, source); // Compile the shader program

  gl.compileShader(shader); // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('An error occurred compiling the shaders: ' + (gl.getShaderInfoLog(shader) || ''));
  }

  return shader;
}

var SQUARE_VERTICES = 4; // square

function initBuffers(gl, state, programInfo) {
  var positions = [];
  var colors = [];
  var positionLength = 0; // init vertices using some zoom+center that we can use as the basis for
  // view transforms later

  var defaultLayoutState = {
    center: state.defaultCenter,
    viewportWidth: state.viewportWidth,
    viewportHeight: state.viewportHeight,
    zoom: state.defaultZoom
  };

  for (var i = 0; i < state.renderableTrace.length; i++) {
    var measure = state.renderableTrace[i];
    var layout = getLayout(defaultLayoutState, measure, 0
    /*startY*/
    ); // TODO: move these transformations to screen coords to transform stage

    var x = layout.x / state.viewportWidth * 2 - 1;
    var y = layout.y / state.viewportHeight * 2 - 1; // flip sign

    var width = layout.width / state.viewportWidth * 2;
    var height = layout.height / state.viewportHeight * 2;
    positions.push(x, y, 1);
    positions.push(x + width, y, 1);
    positions.push(x, y + height, 1);
    positions.push(x + width, y + height, 1);
    positionLength += SQUARE_VERTICES;
    var color = getColorForMeasure(measure.measure);

    for (var k = 0; k < SQUARE_VERTICES; k++) {
      colors.push.apply(colors, _toConsumableArray(color));
    }
  } // vertices that will be reused each render


  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // vertex colors that will be reused each render

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  var buffers = {
    position: positionBuffer,
    positionLength: positionLength,
    color: colorBuffer
  };
  return buffers;
}

function drawScene(gl, programInfo, buffers, state) {
  gl.clearColor(1, 1, 1, 1.0); // white, fully opaque

  gl.clearDepth(1.0); // Clear everything

  gl.enable(gl.DEPTH_TEST); // Enable depth testing

  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // execute clear canvas
  // Orthographic projection with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  var zNear = 0.1;
  var zFar = 100.0;
  var projectionMatrix = create(); // orthographic projection. flip y axis

  ortho(projectionMatrix, -1, 1, 1, -1, zNear, zFar); // drawing position starts as the identity point, which is the center of the
  // scene

  var modelViewMatrix = create(); // offset to top left

  translate(modelViewMatrix, // destination matrix
  modelViewMatrix, // matrix to translate
  [0.0, 0.0, -6.0]); // amount to translate
  // TODO: extract transformation logic to render utils

  var offsetX = (state.defaultCenter - state.center) * PX_PER_MS;

  if (state.defaultZoom == 0) {
    throw new Error('will divide by state.defaultZoom of zero');
  }

  var scale$1 = state.zoom / state.defaultZoom;
  translate(modelViewMatrix, // destination matrix
  modelViewMatrix, // matrix to translate
  [// TODO: extract transformation logic to render utils
  scale$1 * offsetX / state.viewportWidth * 2, // transform to clip space coords
  0.0, 0.0]);
  scale(modelViewMatrix, // destination matrix
  modelViewMatrix, // matrix to translate
  [scale$1, 1.0, 1.0]); // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program); // Set the shader uniforms

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix); // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute

  {
    var numComponents = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, 0 //offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  } // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.

  {
    var _numComponents = 4;
    var _type = gl.FLOAT;
    var _normalize = false;
    var _stride = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, _numComponents, _type, _normalize, _stride, 0 //offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  for (var primitiveIdx = 0; primitiveIdx < buffers.positionLength / 4; primitiveIdx++) {
    {
      var _offset2 = SQUARE_VERTICES * primitiveIdx;

      var count = SQUARE_VERTICES;
      gl.drawArrays(gl.TRIANGLE_STRIP, _offset2, count);
    }
  } // console.log('drawCalls', drawCalls);

}

function initWebGLRenderer(gl, initState) {
  // Vertex shader program
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  var shaderProgram = initShaderProgram(gl, vsSource, fsSource); // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.

  var programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
    }
  };
  console.log({
    programInfo: programInfo
  });
  var buffers = initBuffers(gl, initState, programInfo);
  return function rerender(state) {
    drawScene(gl, programInfo, buffers, state);
  };
}

var _chars;

var metrics = {
  family: 'Open Sans',
  style: 'Regular',
  buffer: 3,
  size: 24,
  chars: (_chars = {
    ' ': [0, 0, 0, 0, 6],
    '!': [4, 19, 1, 18, 6, 2, 2],
    '"': [8, 8, 1, 18, 9, 14, 2],
    '#': [15, 18, 0, 18, 15, 30, 2],
    $: [12, 21, 1, 19, 13, 53, 2],
    '%': [18, 19, 1, 18, 19, 73, 2],
    '&': [17, 19, 1, 18, 17, 99, 2],
    "'": [3, 8, 1, 18, 5, 124, 2],
    '(': [7, 22, 0, 18, 7, 135, 2],
    ')': [7, 22, 0, 18, 7, 150, 2],
    '*': [12, 12, 1, 19, 13, 165, 2],
    '+': [12, 13, 1, 15, 13, 185, 2],
    ',': [5, 7, 0, 3, 5, 205, 2],
    '-': [7, 3, 0, 8, 7, 218, 2],
    '.': [4, 4, 1, 3, 6, 233, 2],
    '/': [9, 18, 0, 18, 8, 245, 2],
    '0': [12, 19, 1, 18, 13, 262, 2],
    '1': [7, 18, 2, 18, 13, 282, 2],
    '2': [12, 18, 1, 18, 13, 297, 2],
    '3': [12, 19, 1, 18, 13, 317, 2],
    '4': [14, 18, 0, 18, 13, 337, 2],
    '5': [12, 19, 1, 18, 13, 359, 2],
    '6': [12, 19, 1, 18, 13, 379, 2],
    '7': [12, 18, 1, 18, 13, 399, 2],
    '8': [12, 19, 1, 18, 13, 419, 2],
    '9': [12, 19, 1, 18, 13, 439, 2],
    ':': [4, 15, 1, 14, 6, 459, 2],
    ';': [5, 18, 0, 14, 6, 471, 2],
    '<': [12, 13, 1, 15, 13, 484, 2],
    '=': [12, 7, 1, 12, 13, 218, 14],
    '>': [12, 13, 1, 15, 13, 165, 22],
    '?': [10, 19, 0, 18, 10, 185, 23],
    '@': [20, 21, 1, 18, 21, 484, 23],
    A: [16, 18, 0, 18, 15, 238, 28],
    B: [13, 18, 2, 18, 15, 459, 28],
    C: [14, 19, 1, 18, 15, 14, 28],
    D: [15, 18, 2, 18, 17, 282, 28],
    E: [10, 18, 2, 18, 13, 399, 28],
    F: [10, 18, 2, 18, 12, 337, 28],
    G: [15, 19, 1, 18, 17, 203, 29],
    H: [14, 18, 2, 18, 17, 417, 29],
    I: [3, 18, 2, 18, 6, 124, 18],
    J: [7, 23, -2, 18, 6, 36, 28],
    K: [13, 18, 2, 18, 14, 355, 29],
    L: [10, 18, 2, 18, 12, 305, 29],
    M: [18, 18, 2, 18, 21, 73, 29],
    N: [14, 18, 2, 18, 18, 376, 29],
    O: [17, 19, 1, 18, 18, 99, 29],
    P: [12, 18, 2, 18, 14, 262, 29],
    Q: [17, 23, 1, 18, 18, 135, 32],
    R: [13, 18, 2, 18, 14, 51, 31],
    S: [12, 19, 1, 18, 13, 439, 29],
    T: [14, 18, 0, 18, 13, 160, 43],
    U: [14, 19, 2, 18, 17, 480, 52],
    V: [15, 18, 0, 18, 14, 226, 54],
    W: [22, 18, 0, 18, 22, 323, 54],
    X: [14, 18, 0, 18, 13, 282, 54],
    Y: [14, 18, 0, 18, 13, 72, 55],
    Z: [13, 18, 0, 18, 13, 182, 50],
    '[': [7, 22, 1, 18, 7, 398, 54],
    '\\': [9, 18, 0, 18, 8, 459, 54],
    ']': [6, 22, 0, 18, 7, 304, 55],
    '^': [13, 12, 0, 18, 13, 353, 55],
    _: [12, 2, -1, -2, 10, 413, 55],
    '`': [6, 5, 4, 19, 13, 2, 55],
    a: [11, 15, 1, 14, 13, 249, 55],
    b: [12, 20, 2, 19, 14, 16, 55],
    c: [10, 15, 1, 14, 11, 374, 55],
    d: [12, 20, 1, 19, 14, 94, 56],
    e: [12, 15, 1, 14, 13, 433, 56],
    f: [10, 19, 0, 19, 8, 114, 56],
    g: [13, 20, 0, 14, 13, 203, 56],
    h: [11, 19, 2, 19, 14, 51, 57],
    i: [4, 18, 1, 18, 6, 268, 55],
    j: [7, 24, -2, 18, 6, 36, 59],
    k: [11, 19, 2, 19, 12, 132, 63],
    l: [3, 19, 2, 19, 6, 413, 65],
    m: [19, 14, 2, 14, 22, 151, 69],
    n: [11, 14, 2, 14, 14, 353, 75],
    o: [13, 15, 1, 14, 14, 178, 76],
    p: [12, 20, 2, 14, 14, 372, 78],
    q: [12, 20, 1, 14, 14, 476, 79],
    r: [8, 14, 2, 14, 9, 249, 78],
    s: [10, 15, 1, 14, 11, 424, 79],
    t: [8, 17, 0, 16, 8, 496, 79],
    u: [12, 14, 1, 13, 14, 224, 80],
    v: [13, 13, 0, 13, 12, 280, 80],
    w: [19, 13, 0, 13, 18, 318, 80],
    x: [13, 13, 0, 13, 12, 453, 80],
    y: [13, 19, 0, 13, 12, 70, 81],
    z: [11, 13, 0, 13, 11, 2, 83],
    '{': [9, 22, 0, 18, 9, 114, 83],
    '|': [3, 25, 5, 19, 13, 442, 79],
    '}': [9, 22, 0, 18, 9, 91, 84],
    '~': [12, 4, 1, 10, 13, 199, 84]
  }, _defineProperty(_chars, " ", [0, 0, 0, 0, 6]), _defineProperty(_chars, '¡', [4, 19, 1, 14, 6, 265, 81]), _defineProperty(_chars, '¢', [10, 19, 2, 18, 13, 392, 84]), _defineProperty(_chars, '£', [13, 18, 0, 18, 13, 131, 91]), _defineProperty(_chars, '¤', [12, 11, 1, 14, 13, 21, 91]), _defineProperty(_chars, '¥', [14, 18, 0, 18, 13, 41, 91]), _defineProperty(_chars, '¦', [3, 25, 5, 19, 13, 301, 85]), _defineProperty(_chars, '§', [10, 20, 1, 19, 12, 152, 91]), _defineProperty(_chars, '¨', [8, 3, 3, 18, 13, 199, 96]), _defineProperty(_chars, '©', [18, 19, 1, 18, 19, 345, 97]), _defineProperty(_chars, "\xAA", [8, 9, 0, 18, 8, 170, 99]), _defineProperty(_chars, '«', [11, 11, 0, 12, 11, 244, 100]), _defineProperty(_chars, '¬', [12, 7, 1, 10, 13, 277, 101]), _defineProperty(_chars, '­', [7, 3, 0, 8, 7, 312, 101]), _defineProperty(_chars, '®', [18, 19, 1, 18, 19, 410, 102]), _defineProperty(_chars, '¯', [14, 2, -1, 20, 12, 453, 101]), _defineProperty(_chars, '°', [8, 8, 1, 18, 10, 327, 101]), _defineProperty(_chars, '±', [12, 16, 1, 15, 13, 215, 102]), _defineProperty(_chars, '²', [8, 12, 0, 18, 8, 496, 104]), _defineProperty(_chars, '³', [8, 12, 0, 18, 8, 2, 104]), _defineProperty(_chars, '´', [6, 5, 4, 19, 13, 371, 106]), _defineProperty(_chars, "\xB5", [11, 19, 2, 13, 14, 475, 107]), _defineProperty(_chars, '¶', [13, 23, 1, 19, 15, 186, 107]), _defineProperty(_chars, '·', [4, 5, 1, 11, 6, 263, 108]), _defineProperty(_chars, '¸', [6, 6, 0, 0, 5, 63, 108]), _defineProperty(_chars, '¹', [6, 12, 0, 18, 8, 77, 108]), _defineProperty(_chars, "\xBA", [9, 9, 0, 18, 9, 18, 110]), _defineProperty(_chars, '»', [11, 11, 0, 12, 11, 385, 111]), _defineProperty(_chars, '¼', [18, 19, 0, 18, 18, 436, 112]), _defineProperty(_chars, '½', [18, 19, 0, 18, 18, 91, 114]), _defineProperty(_chars, '¾', [19, 19, 0, 18, 18, 35, 117]), _defineProperty(_chars, '¿', [10, 19, 0, 14, 10, 275, 116]), _defineProperty(_chars, "\xC0", [16, 23, 0, 23, 15, 117, 117]), _defineProperty(_chars, "\xC1", [16, 23, 0, 23, 15, 312, 117]), _defineProperty(_chars, "\xC2", [16, 23, 0, 23, 15, 235, 119]), _defineProperty(_chars, "\xC3", [16, 22, 0, 22, 15, 141, 119]), _defineProperty(_chars, "\xC4", [16, 22, 0, 22, 15, 343, 124]), _defineProperty(_chars, "\xC5", [16, 22, 0, 22, 15, 207, 126]), _defineProperty(_chars, "\xC6", [21, 18, -1, 18, 20, 2, 127]), _defineProperty(_chars, "\xC7", [14, 24, 1, 18, 15, 62, 128]), _defineProperty(_chars, "\xC8", [10, 23, 2, 23, 13, 293, 118]), _defineProperty(_chars, "\xC9", [10, 23, 2, 23, 13, 165, 119]), _defineProperty(_chars, "\xCA", [10, 23, 2, 23, 13, 494, 124]), _defineProperty(_chars, "\xCB", [10, 22, 2, 22, 13, 367, 124]), _defineProperty(_chars, "\xCC", [6, 23, -1, 23, 6, 259, 121]), _defineProperty(_chars, "\xCD", [6, 23, 1, 23, 6, 404, 129]), _defineProperty(_chars, "\xCE", [9, 23, -1, 23, 6, 418, 129]), _defineProperty(_chars, "\xCF", [8, 22, -1, 22, 6, 385, 130]), _defineProperty(_chars, "\xD0", [16, 18, 0, 18, 17, 462, 134]), _defineProperty(_chars, "\xD1", [14, 22, 2, 22, 18, 183, 138]), _defineProperty(_chars, "\xD2", [17, 24, 1, 23, 18, 435, 139]), _defineProperty(_chars, "\xD3", [17, 24, 1, 23, 18, 84, 141]), _defineProperty(_chars, "\xD4", [17, 24, 1, 23, 18, 31, 144]), _defineProperty(_chars, "\xD5", [17, 23, 1, 22, 18, 311, 148]), _defineProperty(_chars, "\xD6", [17, 23, 1, 22, 18, 109, 148]), _defineProperty(_chars, '×', [12, 11, 1, 14, 13, 273, 143]), _defineProperty(_chars, "\xD8", [17, 19, 1, 18, 18, 134, 149]), _defineProperty(_chars, "\xD9", [14, 24, 2, 23, 17, 231, 150]), _defineProperty(_chars, "\xDA", [14, 24, 2, 23, 17, 159, 150]), _defineProperty(_chars, "\xDB", [14, 24, 2, 23, 17, 2, 153]), _defineProperty(_chars, "\xDC", [14, 23, 2, 22, 17, 336, 154]), _defineProperty(_chars, "\xDD", [14, 23, 0, 23, 13, 358, 154]), _defineProperty(_chars, "\xDE", [12, 18, 2, 18, 14, 253, 152]), _defineProperty(_chars, "\xDF", [12, 20, 2, 19, 14, 486, 155]), _defineProperty(_chars, "\xE0", [11, 20, 1, 19, 13, 205, 156]), _defineProperty(_chars, "\xE1", [11, 20, 1, 19, 13, 460, 160]), _defineProperty(_chars, "\xE2", [11, 20, 1, 19, 13, 401, 160]), _defineProperty(_chars, "\xE3", [11, 19, 1, 18, 13, 380, 160]), _defineProperty(_chars, "\xE4", [11, 19, 1, 18, 13, 56, 160]), _defineProperty(_chars, "\xE5", [11, 21, 1, 20, 13, 273, 162]), _defineProperty(_chars, "\xE6", [19, 15, 1, 14, 20, 420, 171]), _defineProperty(_chars, "\xE7", [10, 20, 1, 14, 11, 293, 149]), _defineProperty(_chars, "\xE8", [12, 20, 1, 19, 13, 181, 168]), _defineProperty(_chars, "\xE9", [12, 20, 1, 19, 13, 75, 173]), _defineProperty(_chars, "\xEA", [12, 20, 1, 19, 13, 24, 176]), _defineProperty(_chars, "\xEB", [12, 19, 1, 18, 13, 134, 176]), _defineProperty(_chars, "\xEC", [6, 19, -1, 19, 6, 95, 173]), _defineProperty(_chars, "\xED", [6, 19, 1, 19, 6, 292, 177]), _defineProperty(_chars, "\xEE", [9, 19, -1, 19, 6, 253, 178]), _defineProperty(_chars, "\xEF", [8, 18, -1, 18, 6, 306, 179]), _defineProperty(_chars, "\xF0", [13, 20, 1, 19, 14, 109, 179]), _defineProperty(_chars, "\xF1", [11, 18, 2, 18, 14, 154, 182]), _defineProperty(_chars, "\xF2", [13, 20, 1, 19, 14, 224, 182]), _defineProperty(_chars, "\xF3", [13, 20, 1, 19, 14, 479, 183]), _defineProperty(_chars, "\xF4", [13, 20, 1, 19, 14, 201, 184]), _defineProperty(_chars, "\xF5", [13, 19, 1, 18, 14, 322, 185]), _defineProperty(_chars, "\xF6", [13, 19, 1, 18, 14, 2, 185]), _defineProperty(_chars, '÷', [12, 12, 1, 14, 13, 343, 185]), _defineProperty(_chars, "\xF8", [13, 15, 1, 14, 14, 44, 187]), _defineProperty(_chars, "\xF9", [12, 20, 1, 19, 14, 363, 187]), _defineProperty(_chars, "\xFA", [12, 20, 1, 19, 14, 399, 188]), _defineProperty(_chars, "\xFB", [12, 20, 1, 19, 14, 447, 188]), _defineProperty(_chars, "\xFC", [12, 19, 1, 18, 14, 270, 191]), _defineProperty(_chars, "\xFD", [13, 25, 0, 19, 12, 419, 194]), _defineProperty(_chars, "\xFE", [12, 25, 2, 19, 14, 173, 196]), _defineProperty(_chars, "\xFF", [13, 24, 0, 18, 12, 65, 201]), _defineProperty(_chars, "\u0100", [16, 21, 0, 21, 15, 130, 203]), _defineProperty(_chars, "\u0101", [11, 18, 1, 17, 13, 86, 201]), _defineProperty(_chars, "\u0102", [16, 22, 0, 22, 15, 290, 205]), _defineProperty(_chars, "\u0103", [11, 19, 1, 18, 13, 23, 204]), _defineProperty(_chars, "\u0104", [16, 24, 0, 18, 15, 245, 205]), _defineProperty(_chars, "\u0105", [12, 20, 1, 14, 13, 343, 205]), _defineProperty(_chars, "\u0106", [14, 24, 1, 23, 15, 105, 207]), _defineProperty(_chars, "\u0107", [10, 20, 1, 19, 11, 154, 208]), _defineProperty(_chars, "\u0108", [14, 24, 1, 23, 15, 42, 210]), _defineProperty(_chars, "\u0109", [10, 20, 1, 19, 11, 222, 210]), _defineProperty(_chars, "\u010A", [14, 23, 1, 22, 15, 467, 211]), _defineProperty(_chars, "\u010B", [10, 19, 1, 18, 11, 489, 211]), _defineProperty(_chars, "\u010C", [14, 24, 1, 23, 15, 193, 212]), _defineProperty(_chars, "\u010D", [11, 20, 1, 19, 11, 314, 212]), _defineProperty(_chars, "\u010E", [15, 23, 2, 23, 17, 363, 215]), _defineProperty(_chars, "\u010F", [16, 20, 1, 19, 14, 440, 216]), _defineProperty(_chars, "\u0110", [16, 18, 0, 18, 17, 386, 216]), _defineProperty(_chars, "\u0111", [14, 20, 1, 19, 14, 410, 227]), _defineProperty(_chars, "\u0112", [10, 21, 2, 21, 13, 2, 212]), _defineProperty(_chars, "\u0113", [12, 18, 1, 17, 13, 269, 218]), _defineProperty(_chars, "\u0114", [10, 22, 2, 22, 13, 86, 227]), _defineProperty(_chars, "\u0115", [12, 19, 1, 18, 13, 172, 229]), _defineProperty(_chars, "\u0116", [10, 22, 2, 22, 13, 20, 231]), _defineProperty(_chars, "\u0117", [12, 19, 1, 18, 13, 127, 232]), _defineProperty(_chars, "\u0118", [10, 24, 2, 18, 13, 64, 233]), _defineProperty(_chars, "\u0119", [12, 20, 1, 14, 13, 333, 233]), _defineProperty(_chars, "\u011A", [10, 23, 2, 23, 13, 289, 235]), _defineProperty(_chars, "\u011B", [12, 20, 1, 19, 13, 147, 236]), _defineProperty(_chars, "\u011C", [15, 24, 1, 23, 17, 240, 237]), _defineProperty(_chars, "\u011D", [13, 25, 0, 19, 13, 215, 238]), _defineProperty(_chars, "\u011E", [15, 23, 1, 22, 17, 489, 238]), _defineProperty(_chars, "\u011F", [13, 24, 0, 18, 13, 104, 239]), _defineProperty(_chars, "\u0120", [15, 23, 1, 22, 17, 307, 240]), _defineProperty(_chars, "\u0121", [13, 24, 0, 18, 13, 464, 242]), _defineProperty(_chars, "\u0122", [15, 24, 1, 18, 17, 38, 242]), _defineProperty(_chars, "\u0123", [13, 25, 0, 19, 13, 386, 242]), _defineProperty(_chars, "\u0124", [14, 23, 2, 23, 17, 192, 244]), _defineProperty(_chars, "\u0125", [11, 24, 2, 24, 14, 263, 244]), _defineProperty(_chars, "\u0126", [18, 18, 0, 18, 17, 432, 244]), _defineProperty(_chars, "\u0127", [13, 19, 0, 19, 14, 353, 246]), _defineProperty(_chars, "\u0128", [9, 22, -1, 22, 6, 2, 241]), _defineProperty(_chars, "\u0129", [9, 18, -1, 18, 6, 407, 255]), _defineProperty(_chars, "\u012A", [8, 21, -1, 21, 6, 167, 256]), _defineProperty(_chars, "\u012B", [8, 17, -1, 17, 6, 82, 257]), _defineProperty(_chars, "\u012C", [8, 22, -1, 22, 6, 125, 259]), _defineProperty(_chars, "\u012D", [8, 18, -1, 18, 6, 19, 261]), _defineProperty(_chars, "\u012E", [5, 24, 1, 18, 6, 330, 261]), _defineProperty(_chars, "\u012F", [5, 24, 0, 18, 6, 141, 264]), _defineProperty(_chars, "\u0130", [4, 22, 1, 22, 6, 374, 246]), _defineProperty(_chars, "\u0131", [3, 13, 2, 13, 6, 154, 264]), _defineProperty(_chars, "\u0132", [10, 23, 2, 18, 13, 61, 265]), _defineProperty(_chars, "\u0133", [10, 24, 1, 18, 12, 282, 266]), _defineProperty(_chars, "\u0134", [10, 28, -2, 23, 6, 236, 269]), _defineProperty(_chars, "\u0135", [10, 25, -2, 19, 6, 485, 269]), _defineProperty(_chars, "\u0136", [13, 24, 2, 18, 14, 424, 270]), _defineProperty(_chars, "\u0137", [11, 25, 2, 19, 12, 445, 270]), _defineProperty(_chars, "\u0138", [11, 13, 2, 13, 12, 214, 271]), _defineProperty(_chars, "\u0139", [10, 23, 2, 23, 12, 98, 271]), _defineProperty(_chars, "\u013A", [6, 24, 1, 24, 6, 300, 271]), _defineProperty(_chars, "\u013B", [10, 24, 2, 18, 12, 343, 273]), _defineProperty(_chars, "\u013C", [4, 25, 1, 19, 6, 314, 271]), _defineProperty(_chars, "\u013D", [10, 18, 2, 18, 12, 35, 274]), _defineProperty(_chars, "\u013E", [7, 19, 2, 19, 6, 2, 271]), _defineProperty(_chars, "\u013F", [10, 18, 2, 18, 12, 464, 274]), _defineProperty(_chars, "\u0140", [7, 19, 2, 19, 7, 183, 275]), _defineProperty(_chars, "\u0141", [12, 18, 0, 18, 12, 386, 275]), _defineProperty(_chars, "\u0142", [8, 19, -1, 19, 6, 198, 275]), _defineProperty(_chars, "\u0143", [14, 23, 2, 23, 18, 254, 276]), _defineProperty(_chars, "\u0144", [11, 19, 2, 19, 14, 361, 276]), _defineProperty(_chars, "\u0145", [14, 24, 2, 18, 18, 154, 285]), _defineProperty(_chars, "\u0146", [11, 20, 2, 14, 14, 79, 282]), _defineProperty(_chars, "\u0147", [14, 23, 2, 23, 18, 116, 289]), _defineProperty(_chars, "\u0148", [11, 19, 2, 19, 14, 214, 292]), _defineProperty(_chars, "\u0149", [15, 18, 0, 18, 16, 53, 296]), _defineProperty(_chars, "\u014A", [14, 23, 2, 18, 18, 276, 298]), _defineProperty(_chars, "\u014B", [11, 20, 2, 14, 14, 2, 298]), _defineProperty(_chars, "\u014C", [17, 22, 1, 21, 18, 21, 300]), _defineProperty(_chars, "\u014D", [13, 18, 1, 17, 14, 464, 300]), _defineProperty(_chars, "\u014E", [17, 23, 1, 22, 18, 380, 301]), _defineProperty(_chars, "\u014F", [13, 19, 1, 18, 14, 405, 302]), _defineProperty(_chars, "\u0150", [17, 24, 1, 23, 18, 176, 302]), _defineProperty(_chars, "\u0151", [13, 20, 1, 19, 14, 485, 302]), _defineProperty(_chars, "\u0152", [20, 19, 1, 18, 22, 426, 303]), _defineProperty(_chars, "\u0153", [21, 15, 1, 14, 22, 298, 304]), _defineProperty(_chars, "\u0154", [13, 23, 2, 23, 14, 233, 305]), _defineProperty(_chars, "\u0155", [8, 19, 2, 19, 9, 327, 293]), _defineProperty(_chars, "\u0156", [13, 24, 2, 18, 14, 343, 305]), _defineProperty(_chars, "\u0157", [9, 20, 1, 14, 9, 98, 302]), _defineProperty(_chars, "\u0158", [13, 23, 2, 23, 14, 254, 307]), _defineProperty(_chars, "\u0159", [9, 19, 1, 19, 9, 76, 310]), _defineProperty(_chars, "\u015A", [12, 24, 1, 23, 13, 138, 317]), _defineProperty(_chars, "\u015B", [10, 20, 1, 19, 11, 158, 317]), _defineProperty(_chars, "\u015C", [12, 24, 1, 23, 13, 201, 319]), _defineProperty(_chars, "\u015D", [10, 20, 1, 19, 11, 115, 320]), _defineProperty(_chars, "\u015E", [12, 24, 1, 18, 13, 46, 322]), _defineProperty(_chars, "\u015F", [10, 20, 1, 14, 11, 454, 326]), _defineProperty(_chars, "\u0160", [12, 24, 1, 23, 13, 298, 327]), _defineProperty(_chars, "\u0161", [10, 20, 1, 19, 11, 2, 326]), _defineProperty(_chars, "\u0162", [14, 24, 0, 18, 13, 318, 327]), _defineProperty(_chars, "\u0163", [8, 22, 0, 16, 8, 364, 303]), _defineProperty(_chars, "\u0164", [14, 23, 0, 23, 13, 275, 329]), _defineProperty(_chars, "\u0165", [9, 20, 0, 19, 8, 405, 329]), _defineProperty(_chars, "\u0166", [14, 18, 0, 18, 13, 20, 330]), _defineProperty(_chars, "\u0167", [8, 17, 0, 16, 8, 422, 330]), _defineProperty(_chars, "\u0168", [14, 23, 2, 22, 17, 93, 330]), _defineProperty(_chars, "\u0169", [12, 19, 1, 18, 14, 472, 330]), _defineProperty(_chars, "\u016A", [14, 22, 2, 21, 17, 380, 332]), _defineProperty(_chars, "\u016B", [12, 18, 1, 17, 14, 492, 330]), _defineProperty(_chars, "\u016C", [14, 23, 2, 22, 17, 176, 334]), _defineProperty(_chars, "\u016D", [12, 19, 1, 18, 14, 221, 336]), _defineProperty(_chars, "\u016E", [14, 25, 2, 24, 17, 340, 337]), _defineProperty(_chars, "\u016F", [12, 21, 1, 20, 14, 66, 337]), _defineProperty(_chars, "\u0170", [14, 24, 2, 23, 17, 241, 338]), _defineProperty(_chars, "\u0171", [12, 20, 1, 19, 14, 115, 348]), _defineProperty(_chars, "\u0172", [14, 24, 2, 18, 17, 135, 349]), _defineProperty(_chars, "\u0173", [13, 19, 1, 13, 14, 198, 351]), _defineProperty(_chars, "\u0174", [22, 23, 0, 23, 22, 438, 354]), _defineProperty(_chars, "\u0175", [19, 19, 0, 19, 18, 2, 356]), _defineProperty(_chars, "\u0176", [14, 23, 0, 23, 13, 42, 354]), _defineProperty(_chars, "\u0177", [13, 25, 0, 19, 12, 402, 357]), _defineProperty(_chars, "\u0178", [14, 22, 0, 22, 13, 468, 357]), _defineProperty(_chars, "\u0179", [13, 23, 0, 23, 13, 490, 357]), _defineProperty(_chars, "\u017A", [11, 19, 0, 19, 11, 157, 349]), _defineProperty(_chars, "\u017B", [13, 22, 0, 22, 13, 297, 359]), _defineProperty(_chars, "\u017C", [11, 18, 0, 18, 11, 318, 359]), _defineProperty(_chars, "\u017D", [13, 23, 0, 23, 13, 263, 360]), _defineProperty(_chars, "\u017E", [11, 19, 0, 19, 11, 86, 361]), _defineProperty(_chars, "\u017F", [7, 19, 2, 19, 7, 364, 333]), _defineProperty(_chars, "\u0192", [11, 24, 2, 18, 13, 379, 362]), _defineProperty(_chars, "\u01A0", [19, 20, 1, 19, 18, 219, 370]), _defineProperty(_chars, "\u01A1", [15, 16, 1, 15, 14, 337, 370]), _defineProperty(_chars, "\u01AF", [18, 20, 2, 19, 18, 105, 376]), _defineProperty(_chars, "\u01B0", [16, 16, 1, 15, 15, 157, 376]), _defineProperty(_chars, "\u01F0", [10, 25, -2, 19, 6, 64, 366]), _defineProperty(_chars, "\u01FA", [16, 23, 0, 23, 15, 181, 378]), _defineProperty(_chars, "\u01FB", [11, 24, 1, 23, 13, 360, 370]), _defineProperty(_chars, "\u01FC", [21, 23, -1, 23, 20, 2, 383]), _defineProperty(_chars, "\u01FD", [19, 20, 1, 19, 20, 31, 385]), _defineProperty(_chars, "\u01FE", [17, 24, 1, 23, 18, 131, 381]), _defineProperty(_chars, "\u01FF", [13, 20, 1, 19, 14, 423, 385]), _defineProperty(_chars, "\u0218", [12, 24, 1, 18, 13, 444, 385]), _defineProperty(_chars, "\u0219", [10, 20, 1, 14, 11, 318, 385]), _defineProperty(_chars, "\u021A", [14, 24, 0, 18, 13, 464, 387]), _defineProperty(_chars, "\u021B", [8, 22, 0, 16, 8, 246, 370]), _defineProperty(_chars, "\u0237", [7, 19, -2, 13, 6, 82, 388]), _defineProperty(_chars, "\u02BC", [4, 7, 0, 18, 4, 284, 360]), _defineProperty(_chars, "\u02C6", [9, 5, 3, 19, 14, 486, 388]), _defineProperty(_chars, "\u02C7", [9, 5, 3, 19, 14, 296, 389]), _defineProperty(_chars, "\u02C9", [8, 3, 3, 17, 14, 398, 390]), _defineProperty(_chars, '˘', [8, 4, 3, 18, 14, 262, 391]), _defineProperty(_chars, '˙', [4, 3, 1, 18, 6, 284, 375]), _defineProperty(_chars, '˚', [6, 6, 4, 20, 13, 205, 378]), _defineProperty(_chars, '˛', [5, 6, 0, 0, 4, 278, 391]), _defineProperty(_chars, '˜', [9, 4, 3, 18, 14, 336, 394]), _defineProperty(_chars, '˝', [10, 5, 2, 19, 13, 379, 394]), _defineProperty(_chars, '˳', [6, 6, 1, -1, 8, 205, 392]), _defineProperty(_chars, '̀', [6, 5, -12, 19, 0, 219, 398]), _defineProperty(_chars, '́', [6, 5, -9, 19, 0, 58, 399]), _defineProperty(_chars, '̃', [9, 4, -12, 18, 0, 156, 400]), _defineProperty(_chars, '̉', [5, 6, -9, 20, 0, 233, 398]), _defineProperty(_chars, '̏', [10, 5, -13, 19, 0, 397, 401]), _defineProperty(_chars, '̣', [4, 4, -9, -1, 0, 246, 400]), _defineProperty(_chars, '΄', [5, 6, 5, 20, 13, 486, 401]), _defineProperty(_chars, '΅', [8, 6, 3, 21, 13, 291, 402]), _defineProperty(_chars, "\u0386", [17, 19, -1, 19, 15, 353, 402]), _defineProperty(_chars, '·', [4, 5, 1, 11, 6, 499, 401]), _defineProperty(_chars, "\u0388", [14, 19, -1, 19, 14, 97, 404]), _defineProperty(_chars, "\u0389", [19, 19, -1, 19, 19, 258, 405]), _defineProperty(_chars, "\u038A", [8, 19, -1, 19, 8, 336, 406]), _defineProperty(_chars, "\u038C", [20, 20, -1, 19, 19, 173, 409]), _defineProperty(_chars, "\u038E", [18, 19, -1, 19, 16, 201, 411]), _defineProperty(_chars, "\u038F", [20, 19, -1, 19, 19, 227, 412]), _defineProperty(_chars, "\u0390", [9, 22, -1, 21, 8, 378, 407]), _defineProperty(_chars, "\u0391", [16, 18, 0, 18, 15, 58, 412]), _defineProperty(_chars, "\u0392", [13, 18, 2, 18, 15, 313, 413]), _defineProperty(_chars, "\u0393", [10, 18, 2, 18, 12, 415, 413]), _defineProperty(_chars, "\u0394", [14, 18, 0, 18, 13, 119, 413]), _defineProperty(_chars, "\u0395", [10, 18, 2, 18, 13, 141, 413]), _defineProperty(_chars, "\u0396", [13, 18, 0, 18, 13, 31, 413]), _defineProperty(_chars, "\u0397", [14, 18, 2, 18, 17, 2, 414]), _defineProperty(_chars, "\u0398", [17, 19, 1, 18, 18, 486, 415]), _defineProperty(_chars, "\u0399", [3, 18, 2, 18, 6, 159, 412]), _defineProperty(_chars, "\u039A", [13, 18, 2, 18, 14, 285, 416]), _defineProperty(_chars, "\u039B", [15, 18, 0, 18, 14, 433, 417]), _defineProperty(_chars, "\u039C", [18, 18, 2, 18, 21, 456, 419]), _defineProperty(_chars, "\u039D", [14, 18, 2, 18, 18, 352, 429]), _defineProperty(_chars, "\u039E", [13, 18, 0, 18, 13, 82, 431]), _defineProperty(_chars, "\u039F", [17, 19, 1, 18, 18, 255, 432]), _defineProperty(_chars, "\u03A0", [14, 18, 2, 18, 17, 170, 437]), _defineProperty(_chars, "\u03A1", [12, 18, 2, 18, 14, 395, 414]), _defineProperty(_chars, "\u03A3", [14, 18, 0, 18, 13, 52, 438]), _defineProperty(_chars, "\u03A4", [14, 18, 0, 18, 13, 192, 438]), _defineProperty(_chars, "\u03A5", [14, 18, 0, 18, 13, 306, 439]), _defineProperty(_chars, "\u03A6", [17, 19, 1, 18, 19, 24, 439]), _defineProperty(_chars, "\u03A7", [14, 18, 0, 18, 13, 328, 439]), _defineProperty(_chars, "\u03A8", [17, 18, 1, 18, 19, 214, 439]), _defineProperty(_chars, "\u03A9", [18, 18, 0, 18, 18, 103, 439]), _defineProperty(_chars, "\u03AA", [8, 22, -1, 22, 6, 374, 437]), _defineProperty(_chars, "\u03AB", [14, 22, 0, 22, 13, 129, 439]), _defineProperty(_chars, "\u03AC", [14, 21, 1, 20, 14, 390, 440]), _defineProperty(_chars, "\u03AD", [10, 21, 1, 20, 11, 151, 439]), _defineProperty(_chars, "\u03AE", [11, 26, 2, 20, 14, 412, 440]), _defineProperty(_chars, "\u03AF", [7, 21, 1, 20, 8, 239, 439]), _defineProperty(_chars, "\u03B0", [13, 22, 1, 21, 14, 2, 440]), _defineProperty(_chars, "\u03B1", [14, 15, 1, 14, 14, 482, 442]), _defineProperty(_chars, "\u03B2", [12, 25, 2, 19, 15, 280, 442]), _defineProperty(_chars, "\u03B3", [13, 19, 0, 13, 12, 431, 443]), _defineProperty(_chars, "\u03B4", [13, 20, 1, 19, 13, 452, 445]), _defineProperty(_chars, "\u03B5", [10, 15, 1, 14, 11, 350, 455]), _defineProperty(_chars, "\u03B6", [10, 24, 1, 19, 11, 74, 457]), _defineProperty(_chars, "\u03B7", [11, 20, 2, 14, 14, 254, 459]), _defineProperty(_chars, "\u03B8", [12, 20, 1, 19, 14, 169, 463]), _defineProperty(_chars, "\u03B9", [7, 14, 1, 13, 8, 49, 464]), _defineProperty(_chars, "\u03BA", [11, 13, 2, 13, 12, 189, 464]), _defineProperty(_chars, "\u03BB", [14, 20, -1, 19, 12, 208, 465]), _defineProperty(_chars, "\u03BC", [11, 19, 2, 13, 14, 300, 465]), _defineProperty(_chars, "\u03BD", [13, 13, 0, 13, 13, 473, 465]), _defineProperty(_chars, "\u03BE", [10, 24, 1, 19, 11, 494, 465]), _defineProperty(_chars, "\u03BF", [13, 15, 1, 14, 14, 92, 465]), _defineProperty(_chars, "\u03C0", [15, 14, 0, 13, 15, 319, 465]), _defineProperty(_chars, "\u03C1", [13, 20, 1, 14, 14, 23, 466]), _defineProperty(_chars, "\u03C2", [10, 19, 1, 14, 11, 368, 467]), _defineProperty(_chars, "\u03C3", [14, 14, 1, 13, 14, 230, 468]), _defineProperty(_chars, "\u03C4", [11, 14, 0, 13, 11, 386, 469]), _defineProperty(_chars, "\u03C5", [13, 14, 1, 13, 14, 113, 469]), _defineProperty(_chars, "\u03C6", [15, 20, 1, 14, 17, 134, 469]), _defineProperty(_chars, "\u03C7", [14, 19, -1, 13, 13, 431, 473]), _defineProperty(_chars, "\u03C8", [16, 25, 1, 19, 18, 405, 474]), _defineProperty(_chars, "\u03C9", [17, 14, 1, 13, 18, 273, 475]), _defineProperty(_chars, "\u03CA", [9, 19, -1, 18, 8, 2, 470]), _defineProperty(_chars, "\u03CB", [13, 19, 1, 18, 14, 342, 478]), _defineProperty(_chars, "\u03CC", [13, 21, 1, 20, 14, 44, 486]), _defineProperty(_chars, "\u03CD", [13, 21, 1, 20, 14, 453, 486]), _defineProperty(_chars, "\u03CE", [17, 21, 1, 20, 18, 65, 489]), _defineProperty(_chars, "\u03D1", [15, 20, 0, 19, 14, 319, 487]), _defineProperty(_chars, "\u03D2", [14, 18, 0, 18, 13, 90, 489]), _defineProperty(_chars, "\u03D6", [20, 14, 0, 13, 20, 230, 490]), _defineProperty(_chars, "\u0400", [10, 23, 2, 23, 13, 189, 485]), _defineProperty(_chars, "\u0401", [10, 22, 2, 22, 13, 474, 486]), _defineProperty(_chars, "\u0402", [16, 19, 0, 18, 17, 157, 491]), _defineProperty(_chars, "\u0403", [10, 23, 2, 23, 12, 112, 491]), _defineProperty(_chars, "\u0404", [14, 19, 1, 18, 15, 207, 493]), _defineProperty(_chars, "\u0405", [12, 19, 1, 18, 13, 298, 492]), _defineProperty(_chars, "\u0406", [3, 18, 2, 18, 6, 258, 487]), _defineProperty(_chars, "\u0407", [8, 22, -1, 22, 6, 386, 491]), _defineProperty(_chars, "\u0408", [7, 23, -2, 18, 6, 19, 494]), _defineProperty(_chars, "\u0409", [22, 19, 0, 18, 22, 342, 505]), _defineProperty(_chars, "\u040A", [20, 18, 2, 18, 22, 269, 497]), _defineProperty(_chars, "\u040B", [16, 18, 0, 18, 17, 130, 497]), _defineProperty(_chars, "\u040C", [13, 23, 2, 23, 14, 429, 500]), _defineProperty(_chars, "\u040D", [14, 23, 2, 23, 18, 402, 507]), _defineProperty(_chars, "\u040E", [15, 24, 0, 23, 14, 229, 512]), _defineProperty(_chars, "\u040F", [14, 23, 2, 18, 17, 318, 515]), _defineProperty(_chars, "\u0410", [16, 18, 0, 18, 15, 450, 515]), _defineProperty(_chars, "\u0411", [12, 18, 2, 18, 14, 492, 497]), _defineProperty(_chars, "\u0412", [13, 18, 2, 18, 15, 34, 515]), _defineProperty(_chars, "\u0413", [10, 18, 2, 18, 12, 90, 515]), _defineProperty(_chars, "\u0414", [16, 23, 0, 18, 16, 181, 516]), _defineProperty(_chars, "\u0415", [10, 18, 2, 18, 13, 474, 516]), _defineProperty(_chars, "\u0416", [21, 18, 0, 18, 20, 55, 518]), _defineProperty(_chars, "\u0417", [13, 19, 0, 18, 13, 154, 518]), _defineProperty(_chars, "\u0418", [14, 18, 2, 18, 18, 205, 520]), _defineProperty(_chars, "\u0419", [14, 23, 2, 23, 18, 372, 521]), _defineProperty(_chars, "\u041A", [13, 18, 2, 18, 14, 297, 519]), _defineProperty(_chars, "\u041B", [15, 19, 0, 18, 16, 108, 523]), _defineProperty(_chars, "\u041C", [18, 18, 2, 18, 21, 252, 523]), _defineProperty(_chars, "\u041D", [14, 18, 2, 18, 17, 131, 523]), _defineProperty(_chars, "\u041E", [17, 19, 1, 18, 18, 2, 525]), _defineProperty(_chars, "\u041F", [14, 18, 2, 18, 17, 424, 531]), _defineProperty(_chars, "\u0420", [12, 18, 2, 18, 14, 492, 523]), _defineProperty(_chars, "\u0421", [14, 19, 1, 18, 15, 340, 532]), _defineProperty(_chars, "\u0422", [14, 18, 0, 18, 13, 394, 538]), _defineProperty(_chars, "\u0423", [15, 19, 0, 18, 14, 446, 541]), _defineProperty(_chars, "\u0424", [17, 19, 1, 18, 19, 27, 541]), _defineProperty(_chars, "\u0425", [14, 18, 0, 18, 13, 84, 541]), _defineProperty(_chars, "\u0426", [16, 23, 2, 18, 17, 227, 544]), _defineProperty(_chars, "\u0427", [13, 18, 2, 18, 16, 469, 542]), _defineProperty(_chars, "\u0428", [21, 18, 2, 18, 24, 52, 544]), _defineProperty(_chars, "\u0429", [23, 23, 2, 18, 24, 278, 545]), _defineProperty(_chars, "\u042A", [16, 18, 0, 18, 16, 153, 545]), _defineProperty(_chars, "\u042B", [17, 18, 2, 18, 20, 309, 546]), _defineProperty(_chars, "\u042C", [13, 18, 2, 18, 15, 205, 546]), _defineProperty(_chars, "\u042D", [14, 19, 0, 18, 15, 177, 547]), _defineProperty(_chars, "\u042E", [22, 19, 2, 18, 25, 106, 550]), _defineProperty(_chars, "\u042F", [13, 18, 0, 18, 15, 251, 549]), _defineProperty(_chars, "\u0430", [11, 15, 1, 14, 13, 490, 549]), _defineProperty(_chars, "\u0431", [12, 20, 1, 19, 14, 362, 552]), _defineProperty(_chars, "\u0432", [11, 13, 2, 13, 13, 2, 552]), _defineProperty(_chars, "\u0433", [8, 13, 2, 13, 10, 136, 549]), _defineProperty(_chars, "\u0434", [14, 18, 0, 13, 13, 416, 557]), _defineProperty(_chars, "\u0435", [12, 15, 1, 14, 13, 334, 559]), _defineProperty(_chars, "\u0436", [18, 13, 0, 13, 17, 382, 564]), _defineProperty(_chars, "\u0437", [11, 15, 0, 14, 11, 81, 567]), _defineProperty(_chars, "\u0438", [12, 13, 2, 13, 15, 21, 568]), _defineProperty(_chars, "\u0439", [12, 19, 2, 19, 15, 438, 568]), _defineProperty(_chars, "\u043A", [11, 13, 2, 13, 12, 458, 568]), _defineProperty(_chars, "\u043B", [12, 14, 0, 13, 13, 41, 570]), _defineProperty(_chars, "\u043C", [14, 13, 2, 13, 17, 152, 571]), _defineProperty(_chars, "\u043D", [12, 13, 2, 13, 15, 61, 570]), _defineProperty(_chars, "\u043E", [13, 15, 1, 14, 14, 199, 572]), _defineProperty(_chars, "\u043F", [11, 13, 2, 13, 14, 477, 572]), _defineProperty(_chars, "\u0440", [12, 20, 2, 14, 14, 309, 572]), _defineProperty(_chars, "\u0441", [10, 15, 1, 14, 11, 2, 573]), _defineProperty(_chars, "\u0442", [11, 13, 0, 13, 11, 174, 574]), _defineProperty(_chars, "\u0443", [13, 19, 0, 13, 12, 226, 575]), _defineProperty(_chars, "\u0444", [15, 25, 1, 19, 17, 247, 575]), _defineProperty(_chars, "\u0445", [13, 13, 0, 13, 12, 270, 576]), _defineProperty(_chars, "\u0446", [13, 18, 2, 13, 15, 100, 577]), _defineProperty(_chars, "\u0447", [12, 13, 1, 13, 14, 121, 577]), _defineProperty(_chars, "\u0448", [18, 13, 2, 13, 21, 354, 580]), _defineProperty(_chars, "\u0449", [20, 18, 2, 13, 21, 408, 583]), _defineProperty(_chars, "\u044A", [16, 13, 0, 13, 16, 329, 582]), _defineProperty(_chars, "\u044B", [15, 13, 2, 13, 18, 380, 585]), _defineProperty(_chars, "\u044C", [11, 13, 2, 13, 14, 20, 589]), _defineProperty(_chars, "\u044D", [11, 15, 0, 14, 11, 458, 589]), _defineProperty(_chars, "\u044E", [17, 15, 2, 14, 19, 61, 591]), _defineProperty(_chars, "\u044F", [12, 13, 0, 13, 13, 39, 592]), _defineProperty(_chars, "\u0450", [12, 20, 1, 19, 13, 141, 592]), _defineProperty(_chars, "\u0451", [12, 19, 1, 18, 13, 477, 593]), _defineProperty(_chars, "\u0452", [13, 25, 0, 19, 14, 436, 595]), _defineProperty(_chars, "\u0453", [8, 19, 2, 19, 10, 291, 576]), _defineProperty(_chars, "\u0454", [10, 15, 1, 14, 11, 193, 595]), _defineProperty(_chars, "\u0455", [10, 15, 1, 14, 11, 161, 595]), _defineProperty(_chars, "\u0456", [4, 18, 1, 18, 6, 497, 572]), _defineProperty(_chars, "\u0457", [8, 18, -1, 18, 6, 2, 596]), _defineProperty(_chars, "\u0458", [7, 24, -2, 18, 6, 211, 595]), _defineProperty(_chars, "\u0459", [19, 14, 0, 13, 20, 353, 601]), _defineProperty(_chars, "\u045A", [18, 13, 2, 13, 21, 307, 603]), _defineProperty(_chars, "\u045B", [13, 19, 0, 19, 14, 270, 597]), _defineProperty(_chars, "\u045C", [11, 19, 2, 19, 12, 121, 598]), _defineProperty(_chars, "\u045D", [12, 19, 2, 19, 15, 226, 602]), _defineProperty(_chars, "\u045E", [13, 25, 0, 19, 12, 86, 603]), _defineProperty(_chars, "\u045F", [11, 18, 2, 13, 14, 333, 603]), _defineProperty(_chars, "\u0460", [22, 19, 1, 18, 24, 403, 609]), _defineProperty(_chars, "\u0461", [19, 13, 0, 13, 19, 18, 613]), _defineProperty(_chars, "\u0462", [15, 19, 0, 19, 16, 380, 606]), _defineProperty(_chars, "\u0463", [14, 16, 0, 16, 15, 246, 608]), _defineProperty(_chars, "\u0464", [20, 19, 2, 18, 22, 45, 614]), _defineProperty(_chars, "\u0465", [15, 15, 2, 14, 17, 179, 618]), _defineProperty(_chars, "\u0466", [17, 18, 0, 18, 16, 140, 620]), _defineProperty(_chars, "\u0467", [14, 13, 0, 13, 13, 457, 620]), _defineProperty(_chars, "\u0468", [21, 18, 2, 18, 22, 479, 620]), _defineProperty(_chars, "\u0469", [17, 13, 2, 13, 18, 352, 623]), _defineProperty(_chars, "\u046A", [18, 18, 0, 18, 17, 268, 624]), _defineProperty(_chars, "\u046B", [16, 13, 0, 13, 15, 294, 624]), _defineProperty(_chars, "\u046C", [22, 18, 2, 18, 23, 107, 625]), _defineProperty(_chars, "\u046D", [19, 13, 2, 13, 20, 202, 629]), _defineProperty(_chars, "\u046E", [13, 27, 0, 21, 13, 433, 628]), _defineProperty(_chars, "\u046F", [11, 21, 0, 16, 11, 318, 629]), _defineProperty(_chars, "\u0470", [17, 18, 1, 18, 19, 229, 632]), _defineProperty(_chars, "\u0471", [16, 25, 1, 19, 18, 377, 633]), _defineProperty(_chars, "\u0472", [17, 19, 1, 18, 18, 2, 634]), _defineProperty(_chars, "\u0473", [13, 15, 1, 14, 14, 401, 636]), _defineProperty(_chars, "\u0474", [16, 18, 0, 18, 15, 73, 636]), _defineProperty(_chars, "\u0475", [13, 13, 0, 13, 12, 454, 641]), _defineProperty(_chars, "\u0476", [16, 23, 0, 23, 15, 165, 641]), _defineProperty(_chars, "\u0477", [13, 19, 0, 19, 12, 27, 641]), _defineProperty(_chars, "\u0478", [28, 24, 1, 18, 29, 337, 644]), _defineProperty(_chars, "\u0479", [25, 20, 1, 14, 25, 475, 646]), _defineProperty(_chars, "\u047A", [18, 21, 1, 19, 19, 137, 646]), _defineProperty(_chars, "\u047B", [14, 17, 1, 15, 15, 48, 641]), _defineProperty(_chars, "\u047C", [22, 26, 1, 25, 23, 189, 650]), _defineProperty(_chars, "\u047D", [18, 23, 1, 22, 19, 254, 650]), _defineProperty(_chars, "\u047E", [22, 23, 1, 22, 23, 280, 650]), _defineProperty(_chars, "\u047F", [19, 17, 0, 17, 19, 97, 651]), _defineProperty(_chars, "\u0480", [14, 24, 1, 18, 15, 310, 658]), _defineProperty(_chars, "\u0481", [10, 20, 1, 14, 11, 219, 658]), _defineProperty(_chars, '҂', [13, 17, 1, 16, 14, 401, 659]), _defineProperty(_chars, '҃', [10, 5, 2, 18, 13, 2, 661]), _defineProperty(_chars, '҄', [10, 4, 2, 18, 13, 70, 662]), _defineProperty(_chars, '҅', [4, 5, 5, 19, 13, 124, 651]), _defineProperty(_chars, '҆', [4, 5, 5, 19, 13, 237, 658]), _defineProperty(_chars, '҈', [24, 21, 0, 17, 23, 422, 663]), _defineProperty(_chars, '҉', [23, 23, 0, 18, 22, 20, 668]), _defineProperty(_chars, "\u048A", [17, 28, 2, 23, 18, 373, 666]), _defineProperty(_chars, "\u048B", [14, 24, 2, 19, 15, 163, 672]), _defineProperty(_chars, "\u048C", [14, 18, 0, 18, 14, 70, 674]), _defineProperty(_chars, "\u048D", [13, 19, 0, 19, 14, 454, 662]), _defineProperty(_chars, "\u048E", [12, 18, 2, 18, 14, 475, 674]), _defineProperty(_chars, "\u048F", [12, 20, 2, 14, 14, 136, 675]), _defineProperty(_chars, "\u0490", [11, 21, 2, 21, 12, 51, 666]), _defineProperty(_chars, "\u0491", [8, 17, 2, 17, 10, 237, 671]), _defineProperty(_chars, "\u0492", [13, 18, 0, 18, 12, 92, 676]), _defineProperty(_chars, "\u0493", [10, 13, 0, 13, 10, 2, 674]), _defineProperty(_chars, "\u0494", [13, 24, 2, 18, 15, 332, 676]), _defineProperty(_chars, "\u0495", [10, 19, 2, 13, 12, 113, 676]), _defineProperty(_chars, "\u0496", [21, 23, 0, 18, 21, 253, 681]), _defineProperty(_chars, "\u0497", [19, 18, 0, 13, 18, 282, 681]), _defineProperty(_chars, "\u0498", [13, 24, 0, 18, 13, 398, 684]), _defineProperty(_chars, "\u0499", [11, 20, 0, 14, 11, 353, 676]), _defineProperty(_chars, "\u049A", [14, 23, 2, 18, 15, 185, 684]), _defineProperty(_chars, "\u049B", [11, 18, 2, 13, 13, 207, 686]), _defineProperty(_chars, "\u049C", [13, 18, 2, 18, 14, 454, 689]), _defineProperty(_chars, "\u049D", [11, 13, 2, 13, 12, 309, 690]), _defineProperty(_chars, "\u049E", [15, 18, 0, 18, 14, 419, 692]), _defineProperty(_chars, "\u049F", [13, 19, 0, 19, 12, 226, 696]), _defineProperty(_chars, "\u04A0", [17, 18, 0, 18, 16, 2, 699]), _defineProperty(_chars, "\u04A1", [15, 13, 0, 13, 14, 27, 699]), _defineProperty(_chars, "\u04A2", [16, 23, 2, 18, 17, 50, 700]), _defineProperty(_chars, "\u04A3", [13, 18, 2, 13, 15, 475, 700]), _defineProperty(_chars, "\u04A4", [18, 18, 2, 18, 19, 372, 702]), _defineProperty(_chars, "\u04A5", [16, 13, 2, 13, 17, 74, 702]), _defineProperty(_chars, "\u04A6", [23, 24, 2, 18, 25, 131, 703]), _defineProperty(_chars, "\u04A7", [18, 19, 2, 13, 20, 98, 703]), _defineProperty(_chars, "\u04A8", [17, 19, 1, 18, 18, 282, 707]), _defineProperty(_chars, "\u04A9", [14, 15, 1, 14, 15, 162, 704]), _defineProperty(_chars, "\u04AA", [14, 24, 1, 18, 15, 328, 708]), _defineProperty(_chars, "\u04AB", [10, 20, 1, 14, 11, 353, 704]), _defineProperty(_chars, "\u04AC", [14, 23, 0, 18, 13, 247, 712]), _defineProperty(_chars, "\u04AD", [11, 18, 0, 13, 11, 307, 711]), _defineProperty(_chars, "\u04AE", [14, 18, 0, 18, 13, 184, 715]), _defineProperty(_chars, "\u04AF", [13, 19, 0, 13, 12, 442, 715]), _defineProperty(_chars, "\u04B0", [14, 18, 0, 18, 13, 398, 718]), _defineProperty(_chars, "\u04B1", [13, 19, 0, 13, 12, 420, 718]), _defineProperty(_chars, "\u04B2", [15, 23, 0, 18, 14, 27, 720]), _defineProperty(_chars, "\u04B3", [13, 18, 0, 13, 13, 206, 723]), _defineProperty(_chars, "\u04B4", [20, 23, 0, 18, 20, 463, 726]), _defineProperty(_chars, "\u04B5", [17, 18, 0, 13, 17, 2, 725]), _defineProperty(_chars, "\u04B6", [15, 23, 2, 18, 16, 74, 723]), _defineProperty(_chars, "\u04B7", [14, 18, 1, 13, 14, 162, 727]), _defineProperty(_chars, "\u04B8", [13, 18, 2, 18, 16, 491, 726]), _defineProperty(_chars, "\u04B9", [12, 13, 1, 13, 14, 227, 723]), _defineProperty(_chars, "\u04BA", [13, 18, 2, 18, 16, 371, 728]), _defineProperty(_chars, "\u04BB", [11, 13, 2, 13, 14, 97, 730]), _defineProperty(_chars, "\u04BC", [19, 19, 0, 18, 20, 269, 734]), _defineProperty(_chars, "\u04BD", [15, 15, 0, 14, 15, 50, 731]), _defineProperty(_chars, "\u04BE", [19, 23, 0, 18, 20, 124, 735]), _defineProperty(_chars, "\u04BF", [15, 19, 0, 14, 15, 296, 737]), _defineProperty(_chars, "\u04C0", [3, 18, 2, 18, 6, 350, 732]), _defineProperty(_chars, "\u04C1", [21, 23, 0, 23, 20, 319, 740]), _defineProperty(_chars, "\u04C2", [18, 19, 0, 19, 17, 392, 744]), _defineProperty(_chars, "\u04C3", [14, 24, 2, 18, 16, 184, 741]), _defineProperty(_chars, "\u04C4", [11, 19, 2, 13, 13, 441, 742]), _defineProperty(_chars, "\u04C5", [17, 23, 0, 18, 16, 227, 744]), _defineProperty(_chars, "\u04C6", [14, 18, 0, 13, 13, 418, 745]), _defineProperty(_chars, "\u04C7", [14, 24, 2, 18, 17, 97, 751]), _defineProperty(_chars, "\u04C8", [12, 19, 2, 13, 14, 206, 749]), _defineProperty(_chars, "\u04C9", [16, 23, 2, 18, 17, 2, 751]), _defineProperty(_chars, "\u04CA", [14, 18, 2, 13, 15, 26, 751]), _defineProperty(_chars, "\u04CB", [13, 23, 2, 18, 16, 491, 752]), _defineProperty(_chars, "\u04CC", [12, 18, 1, 13, 14, 151, 753]), _defineProperty(_chars, "\u04CD", [20, 23, 2, 18, 21, 48, 754]), _defineProperty(_chars, "\u04CE", [16, 18, 2, 13, 17, 361, 754]), _defineProperty(_chars, "\u04CF", [3, 18, 2, 18, 6, 252, 743]), _defineProperty(_chars, "\u04D0", [16, 23, 0, 23, 15, 460, 757]), _defineProperty(_chars, "\u04D1", [11, 20, 1, 19, 13, 76, 754]), _defineProperty(_chars, "\u04D2", [16, 22, 0, 22, 15, 263, 761]), _defineProperty(_chars, "\u04D3", [11, 19, 1, 18, 13, 287, 764]), _defineProperty(_chars, "\u04D4", [21, 18, -1, 18, 20, 119, 766]), _defineProperty(_chars, "\u04D5", [19, 15, 1, 14, 20, 385, 771]), _defineProperty(_chars, "\u04D6", [10, 23, 2, 23, 13, 440, 769]), _defineProperty(_chars, "\u04D7", [12, 20, 1, 19, 13, 306, 771]), _defineProperty(_chars, "\u04D8", [16, 19, 1, 18, 17, 326, 771]), _defineProperty(_chars, "\u04D9", [12, 15, 1, 14, 13, 412, 771]), _defineProperty(_chars, "\u04DA", [16, 23, 1, 22, 17, 171, 773]), _defineProperty(_chars, "\u04DB", [12, 19, 1, 18, 13, 226, 775]), _defineProperty(_chars, "\u04DC", [21, 22, 0, 22, 20, 195, 776]), _defineProperty(_chars, "\u04DD", [18, 18, 0, 18, 17, 350, 780]), _defineProperty(_chars, "\u04DE", [13, 23, 0, 22, 13, 26, 777]), _defineProperty(_chars, "\u04DF", [11, 19, 0, 18, 11, 148, 779]), _defineProperty(_chars, "\u04E0", [13, 19, 0, 18, 14, 76, 782]), _defineProperty(_chars, "\u04E1", [11, 19, 0, 13, 11, 2, 782]), _defineProperty(_chars, "\u04E2", [14, 21, 2, 21, 18, 484, 783]), _defineProperty(_chars, "\u04E3", [12, 17, 2, 17, 15, 97, 783]), _defineProperty(_chars, "\u04E4", [14, 22, 2, 22, 18, 47, 785]), _defineProperty(_chars, "\u04E5", [12, 18, 2, 18, 15, 458, 788]), _defineProperty(_chars, "\u04E6", [17, 23, 1, 22, 18, 246, 791]), _defineProperty(_chars, "\u04E7", [13, 19, 1, 18, 14, 271, 791]), _defineProperty(_chars, "\u04E8", [17, 19, 1, 18, 18, 117, 792]), _defineProperty(_chars, "\u04E9", [13, 15, 1, 14, 14, 376, 794]), _defineProperty(_chars, "\u04EA", [17, 23, 1, 22, 18, 397, 794]), _defineProperty(_chars, "\u04EB", [13, 19, 1, 18, 14, 326, 798]), _defineProperty(_chars, "\u04EC", [14, 23, 0, 22, 15, 292, 799]), _defineProperty(_chars, "\u04ED", [11, 19, 0, 18, 11, 432, 800]), _defineProperty(_chars, "\u04EE", [15, 22, 0, 21, 14, 167, 804]), _defineProperty(_chars, "\u04EF", [13, 23, 0, 17, 12, 224, 802]), _defineProperty(_chars, "\u04F0", [15, 23, 0, 22, 14, 347, 806]), _defineProperty(_chars, "\u04F1", [13, 24, 0, 18, 12, 190, 806]), _defineProperty(_chars, "\u04F2", [15, 24, 0, 23, 14, 142, 806]), _defineProperty(_chars, "\u04F3", [13, 25, 0, 19, 12, 21, 808]), _defineProperty(_chars, "\u04F4", [13, 22, 2, 22, 16, 69, 809]), _defineProperty(_chars, "\u04F5", [12, 18, 1, 18, 14, 97, 808]), _defineProperty(_chars, "\u04F6", [11, 23, 2, 18, 12, 2, 809]), _defineProperty(_chars, "\u04F7", [8, 18, 2, 13, 10, 478, 812]), _defineProperty(_chars, "\u04F8", [17, 22, 2, 22, 20, 451, 814]), _defineProperty(_chars, "\u04F9", [15, 18, 2, 18, 18, 42, 815]), _defineProperty(_chars, "\u04FA", [13, 23, 0, 18, 12, 370, 817]), _defineProperty(_chars, "\u04FB", [10, 18, 0, 13, 10, 494, 812]), _defineProperty(_chars, "\u04FC", [15, 23, 0, 18, 14, 117, 819]), _defineProperty(_chars, "\u04FD", [13, 18, 0, 13, 12, 271, 818]), _defineProperty(_chars, "\u04FE", [14, 18, 0, 18, 13, 245, 822]), _defineProperty(_chars, "\u04FF", [13, 13, 0, 13, 12, 391, 825]), _defineProperty(_chars, "\u0500", [12, 18, 1, 18, 14, 412, 825]), _defineProperty(_chars, "\u0501", [12, 20, 1, 19, 14, 314, 825]), _defineProperty(_chars, "\u0502", [19, 19, 1, 18, 21, 211, 833]), _defineProperty(_chars, "\u0503", [19, 20, 1, 19, 21, 90, 834]), _defineProperty(_chars, "\u0504", [20, 19, 0, 18, 21, 334, 837]), _defineProperty(_chars, "\u0505", [18, 15, 0, 14, 19, 140, 838]), _defineProperty(_chars, "\u0506", [15, 23, 0, 18, 15, 166, 834]), _defineProperty(_chars, "\u0507", [13, 19, 0, 14, 12, 292, 830]), _defineProperty(_chars, "\u0508", [22, 19, 0, 18, 23, 476, 838]), _defineProperty(_chars, "\u0509", [19, 14, 0, 13, 20, 2, 841]), _defineProperty(_chars, "\u050A", [21, 19, 2, 18, 24, 29, 841]), _defineProperty(_chars, "\u050B", [18, 14, 2, 13, 21, 58, 841]), _defineProperty(_chars, "\u050C", [16, 19, 1, 18, 18, 267, 844]), _defineProperty(_chars, "\u050D", [14, 15, 1, 14, 15, 189, 838]), _defineProperty(_chars, "\u050E", [15, 19, 0, 18, 17, 432, 844]), _defineProperty(_chars, "\u050F", [14, 14, 0, 13, 15, 238, 848]), _defineProperty(_chars, "\u0510", [13, 19, 1, 18, 14, 455, 844]), _defineProperty(_chars, "\u0511", [10, 15, 1, 14, 11, 391, 846]), _defineProperty(_chars, "\u0512", [17, 23, 0, 18, 16, 362, 848]), _defineProperty(_chars, "\u0513", [14, 18, 0, 13, 13, 117, 850]), _defineProperty(_chars, "\u1E00", [16, 25, 0, 18, 15, 291, 857]), _defineProperty(_chars, "\u1E01", [11, 21, 1, 14, 13, 409, 851]), _defineProperty(_chars, "\u1E3E", [18, 23, 2, 23, 21, 211, 860]), _defineProperty(_chars, "\u1E3F", [19, 19, 2, 19, 22, 139, 861]), _defineProperty(_chars, "\u1E80", [22, 23, 0, 23, 22, 84, 862]), _defineProperty(_chars, "\u1E81", [19, 19, 0, 19, 18, 2, 863]), _defineProperty(_chars, "\u1E82", [22, 23, 0, 23, 22, 315, 864]), _defineProperty(_chars, "\u1E83", [19, 19, 0, 19, 18, 166, 865]), _defineProperty(_chars, "\u1E84", [22, 22, 0, 22, 22, 476, 865]), _defineProperty(_chars, "\u1E85", [19, 18, 0, 18, 18, 29, 868]), _defineProperty(_chars, "\u1EA0", [16, 23, 0, 18, 15, 58, 863]), _defineProperty(_chars, "\u1EA1", [11, 19, 1, 14, 13, 387, 869]), _defineProperty(_chars, "\u1EA2", [16, 24, 0, 24, 15, 237, 870]), _defineProperty(_chars, "\u1EA3", [11, 21, 1, 20, 13, 428, 871]), _defineProperty(_chars, "\u1EA4", [16, 24, 0, 24, 15, 261, 871]), _defineProperty(_chars, "\u1EA5", [13, 21, 1, 20, 13, 447, 871]), _defineProperty(_chars, "\u1EA6", [16, 24, 0, 24, 15, 114, 876]), _defineProperty(_chars, "\u1EA7", [12, 21, 0, 20, 13, 345, 879]), _defineProperty(_chars, "\u1EA8", [16, 25, 0, 25, 15, 138, 888]), _defineProperty(_chars, "\u1EA9", [12, 22, 1, 21, 13, 365, 879]), _defineProperty(_chars, "\u1EAA", [16, 26, 0, 26, 15, 285, 890]), _defineProperty(_chars, "\u1EAB", [11, 23, 1, 22, 13, 406, 880]), _defineProperty(_chars, "\u1EAC", [16, 28, 0, 23, 15, 2, 890]), _defineProperty(_chars, "\u1EAD", [11, 24, 1, 19, 13, 193, 891]), _defineProperty(_chars, "\u1EAE", [16, 25, 0, 25, 15, 212, 891]), _defineProperty(_chars, "\u1EAF", [11, 22, 1, 21, 13, 162, 892]), _defineProperty(_chars, "\u1EB0", [16, 25, 0, 25, 15, 82, 893]), _defineProperty(_chars, "\u1EB1", [11, 22, 1, 21, 13, 56, 894]), _defineProperty(_chars, "\u1EB2", [16, 26, 0, 26, 15, 26, 894]), _defineProperty(_chars, "\u1EB3", [11, 23, 1, 22, 13, 309, 895]), _defineProperty(_chars, "\u1EB4", [16, 26, 0, 26, 15, 468, 895]), _defineProperty(_chars, "\u1EB5", [11, 23, 1, 22, 13, 492, 895]), _defineProperty(_chars, "\u1EB6", [16, 27, 0, 22, 15, 425, 900]), _defineProperty(_chars, "\u1EB7", [11, 23, 1, 18, 13, 385, 896]), _defineProperty(_chars, "\u1EB8", [10, 23, 2, 18, 13, 449, 900]), _defineProperty(_chars, "\u1EB9", [12, 19, 1, 14, 13, 236, 902]), _defineProperty(_chars, "\u1EBA", [10, 24, 2, 24, 13, 256, 903]), _defineProperty(_chars, "\u1EBB", [12, 21, 1, 20, 13, 106, 908]), _defineProperty(_chars, "\u1EBC", [10, 22, 2, 22, 13, 328, 908]), _defineProperty(_chars, "\u1EBD", [12, 19, 1, 18, 13, 346, 909]), _defineProperty(_chars, "\u1EBE", [12, 24, 2, 24, 13, 404, 911]), _defineProperty(_chars, "\u1EBF", [13, 21, 1, 20, 13, 126, 921]), _defineProperty(_chars, "\u1EC0", [12, 24, 0, 24, 13, 147, 922]), _defineProperty(_chars, "\u1EC1", [13, 21, 0, 20, 13, 167, 922]), _defineProperty(_chars, "\u1EC2", [11, 25, 2, 25, 13, 366, 909]), _defineProperty(_chars, "\u1EC3", [12, 22, 1, 21, 13, 188, 923]), _defineProperty(_chars, "\u1EC4", [10, 26, 2, 26, 13, 208, 924]), _defineProperty(_chars, "\u1EC5", [12, 23, 1, 22, 13, 50, 924]), _defineProperty(_chars, "\u1EC6", [10, 28, 2, 23, 13, 274, 924]), _defineProperty(_chars, "\u1EC7", [12, 24, 1, 19, 13, 70, 926]), _defineProperty(_chars, "\u1EC8", [5, 24, 2, 24, 6, 292, 924]), _defineProperty(_chars, "\u1EC9", [5, 20, 1, 20, 6, 305, 926]), _defineProperty(_chars, "\u1ECA", [4, 23, 1, 18, 6, 90, 926]), _defineProperty(_chars, "\u1ECB", [4, 23, 1, 18, 6, 492, 926]), _defineProperty(_chars, "\u1ECC", [17, 23, 1, 18, 18, 2, 928]), _defineProperty(_chars, "\u1ECD", [13, 19, 1, 14, 14, 27, 928]), _defineProperty(_chars, "\u1ECE", [17, 25, 1, 24, 18, 467, 929]), _defineProperty(_chars, "\u1ECF", [13, 21, 1, 20, 14, 226, 929]), _defineProperty(_chars, "\u1ED0", [17, 25, 1, 24, 18, 424, 935]), _defineProperty(_chars, "\u1ED1", [13, 21, 1, 20, 14, 247, 935]), _defineProperty(_chars, "\u1ED2", [17, 25, 1, 24, 18, 318, 938]), _defineProperty(_chars, "\u1ED3", [14, 21, 0, 20, 14, 102, 937]), _defineProperty(_chars, "\u1ED4", [17, 26, 1, 25, 18, 343, 942]), _defineProperty(_chars, "\u1ED5", [13, 22, 1, 21, 14, 368, 942]), _defineProperty(_chars, "\u1ED6", [17, 27, 1, 26, 18, 389, 943]), _defineProperty(_chars, "\u1ED7", [13, 23, 1, 22, 14, 124, 950]), _defineProperty(_chars, "\u1ED8", [17, 28, 1, 23, 18, 167, 953]), _defineProperty(_chars, "\u1ED9", [13, 24, 1, 19, 14, 145, 954]), _defineProperty(_chars, "\u1EDA", [19, 24, 1, 23, 18, 27, 955]), _defineProperty(_chars, "\u1EDB", [15, 20, 1, 19, 14, 292, 956]), _defineProperty(_chars, "\u1EDC", [19, 24, 1, 23, 18, 54, 958]), _defineProperty(_chars, "\u1EDD", [15, 20, 1, 19, 14, 192, 958]), _defineProperty(_chars, "\u1EDE", [19, 25, 1, 24, 18, 215, 958]), _defineProperty(_chars, "\u1EDF", [15, 21, 1, 20, 14, 2, 959]), _defineProperty(_chars, "\u1EE0", [19, 23, 1, 22, 18, 449, 962]), _defineProperty(_chars, "\u1EE1", [15, 19, 1, 18, 14, 268, 960]), _defineProperty(_chars, "\u1EE2", [19, 24, 1, 19, 18, 476, 962]), _defineProperty(_chars, "\u1EE3", [15, 20, 1, 15, 14, 242, 964]), _defineProperty(_chars, "\u1EE4", [14, 23, 2, 18, 17, 81, 966]), _defineProperty(_chars, "\u1EE5", [12, 18, 1, 13, 14, 103, 966]), _defineProperty(_chars, "\u1EE6", [14, 25, 2, 24, 17, 414, 968]), _defineProperty(_chars, "\u1EE7", [12, 21, 1, 20, 14, 315, 971]), _defineProperty(_chars, "\u1EE8", [18, 24, 2, 23, 18, 335, 976]), _defineProperty(_chars, "\u1EE9", [16, 20, 1, 19, 15, 361, 976]), _defineProperty(_chars, "\u1EEA", [18, 24, 2, 23, 18, 385, 978]), _defineProperty(_chars, "\u1EEB", [16, 20, 1, 19, 15, 291, 984]), _defineProperty(_chars, "\u1EEC", [18, 25, 2, 24, 18, 123, 986]), _defineProperty(_chars, "\u1EED", [16, 21, 1, 20, 15, 25, 987]), _defineProperty(_chars, "\u1EEE", [18, 23, 2, 22, 18, 265, 987]), _defineProperty(_chars, "\u1EEF", [16, 19, 1, 18, 15, 166, 989]), _defineProperty(_chars, "\u1EF0", [18, 24, 2, 19, 18, 49, 990]), _defineProperty(_chars, "\u1EF1", [16, 20, 1, 15, 15, 190, 989]), _defineProperty(_chars, "\u1EF2", [14, 23, 0, 23, 13, 2, 988]), _defineProperty(_chars, "\u1EF3", [13, 25, 0, 19, 12, 214, 991]), _defineProperty(_chars, "\u1EF4", [14, 23, 0, 18, 13, 235, 992]), _defineProperty(_chars, "\u1EF5", [13, 19, 0, 13, 12, 436, 993]), _defineProperty(_chars, "\u1EF6", [14, 24, 0, 24, 13]), _defineProperty(_chars, "\u1EF7", [13, 26, 0, 20, 12]), _defineProperty(_chars, "\u1EF8", [14, 22, 0, 22, 13, 457, 994]), _defineProperty(_chars, "\u1EF9", [13, 24, 0, 18, 12]), _defineProperty(_chars, "\u1F4D", [22, 19, -4, 18, 18, 479, 994]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 12]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 24]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 12]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 24]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 8]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 6]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 4]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 13]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 6]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 4]), _defineProperty(_chars, ' ', [0, 0, 0, 0, 2]), _defineProperty(_chars, '​', [0, 0, 0, 0, 0]), _defineProperty(_chars, '–', [12, 3, 0, 8, 12, 103, 992]), _defineProperty(_chars, '—', [24, 3, 0, 8, 24, 75, 1003]), _defineProperty(_chars, '―', [24, 3, 0, 8, 24, 315, 1008]), _defineProperty(_chars, '‗', [11, 6, -1, 0, 9, 411, 1001]), _defineProperty(_chars, '‘', [4, 7, 0, 18, 4, 149, 986]), _defineProperty(_chars, '’', [4, 7, 0, 18, 4, 149, 1001]), _defineProperty(_chars, '‚', [5, 7, 0, 3, 5, 107, 1003]), _defineProperty(_chars, '‛', [4, 7, 0, 18, 4, 361, 1004]), _defineProperty(_chars, '“', [9, 7, 0, 18, 8]), _defineProperty(_chars, '”', [9, 7, 0, 18, 8]), _defineProperty(_chars, '„', [9, 7, 0, 4, 9]), _defineProperty(_chars, '†', [10, 19, 1, 19, 12]), _defineProperty(_chars, '‡', [10, 19, 1, 19, 12]), _defineProperty(_chars, '•', [7, 7, 1, 12, 9]), _defineProperty(_chars, '…', [16, 4, 1, 3, 18, 373, 1010]), _defineProperty(_chars, '‰', [27, 19, 1, 18, 28]), _defineProperty(_chars, '′', [3, 8, 1, 18, 5, 347, 1008]), _defineProperty(_chars, '″', [8, 8, 1, 18, 9]), _defineProperty(_chars, '‹', [7, 11, 0, 12, 7]), _defineProperty(_chars, '›', [7, 11, 0, 12, 7]), _defineProperty(_chars, '‼', [9, 19, 1, 18, 11]), _defineProperty(_chars, '⁄', [13, 18, -5, 18, 3]), _defineProperty(_chars, '⁰', [8, 12, 0, 18, 8]), _defineProperty(_chars, '⁴', [9, 12, 0, 18, 8]), _defineProperty(_chars, '⁵', [8, 11, 0, 17, 8]), _defineProperty(_chars, '⁶', [8, 12, 0, 18, 8]), _defineProperty(_chars, '⁷', [8, 12, 0, 18, 8]), _defineProperty(_chars, '⁸', [8, 12, 0, 18, 8]), _defineProperty(_chars, '⁹', [8, 12, 0, 18, 8]), _defineProperty(_chars, "\u207F", [8, 9, 1, 18, 9]), _defineProperty(_chars, '₣', [12, 18, 1, 18, 13]), _defineProperty(_chars, '₤', [13, 18, 0, 18, 13]), _defineProperty(_chars, '₧', [17, 19, 1, 18, 18]), _defineProperty(_chars, '₫', [14, 23, 1, 19, 14]), _defineProperty(_chars, '€', [14, 19, 0, 18, 14]), _defineProperty(_chars, '℅', [18, 19, 1, 18, 19]), _defineProperty(_chars, "\u2113", [10, 19, 1, 18, 12]), _defineProperty(_chars, '№', [22, 18, 2, 18, 24]), _defineProperty(_chars, '℠', [16, 10, 1, 18, 19]), _defineProperty(_chars, '™', [17, 10, 0, 18, 18]), _defineProperty(_chars, "\u2126", [18, 18, 0, 18, 18]), _defineProperty(_chars, "\u212E", [13, 14, 1, 13, 14]), _defineProperty(_chars, '⅛', [18, 19, 0, 18, 18]), _defineProperty(_chars, '⅜', [18, 19, 0, 18, 18]), _defineProperty(_chars, '⅝', [18, 19, 0, 18, 18]), _defineProperty(_chars, '⅞', [17, 19, 1, 18, 18]), _defineProperty(_chars, '∂', [12, 19, 1, 18, 13]), _defineProperty(_chars, '∆', [14, 18, 0, 18, 13]), _defineProperty(_chars, '∏', [14, 24, 2, 18, 17]), _defineProperty(_chars, '∑', [15, 24, 0, 18, 15]), _defineProperty(_chars, '−', [12, 3, 1, 10, 13, 291, 1012]), _defineProperty(_chars, '√', [15, 21, 0, 20, 13]), _defineProperty(_chars, '∞', [15, 9, 1, 13, 16]), _defineProperty(_chars, '∫', [9, 25, 0, 19, 9]), _defineProperty(_chars, '≈', [12, 9, 1, 13, 13]), _defineProperty(_chars, '≠', [12, 15, 1, 16, 13]), _defineProperty(_chars, '≤', [12, 16, 1, 15, 13]), _defineProperty(_chars, '≥', [12, 16, 1, 15, 13]), _defineProperty(_chars, '◊', [12, 18, 1, 18, 14]), _defineProperty(_chars, "\uFB00", [18, 19, 0, 19, 16]), _defineProperty(_chars, "\uFB01", [13, 19, 0, 19, 14]), _defineProperty(_chars, "\uFB02", [13, 19, 0, 19, 14]), _defineProperty(_chars, "\uFB03", [21, 19, 0, 19, 22]), _defineProperty(_chars, "\uFB04", [21, 19, 0, 19, 22]), _defineProperty(_chars, '﻿', [0, 0, 0, 0, 0]), _defineProperty(_chars, '￼', [24, 23, 0, 18, 24]), _defineProperty(_chars, '�', [23, 23, 0, 19, 24]), _chars)
};
var imgData = null;
function getAtlas(cb) {
  if (imgData == null) {
    imgData = new Image();
    imgData.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAQACAAAAACyw74cAAAgAElEQVR4nOy9SXPkypIu9mEMDAEgMeRAVp1bdSWZSW3dbfZMC/19SQvJTCtJTy317bb3dKrOOVUkMzHGgHnQAplkJsmqe1taqn1FgghEwP0Ln8IdBP6d/p3+nf7/SwrwcbvxDUxDlf4z/i4JDG0ZVB1jW53+EwDAPWw3lj4P3DcwsPQhW0fuD1vPmAeWPp4AAM52u6GGMY2yyrENTG3u2emxAABs4ihwDUMdh6Yq8tN8nvw8Gzv9nwCw38a+oU49O/0F/3USEG0eq+L0uKz3JneJb2jzwNLH42Xx+mGXeMY0svTxCQAQHXZb30TPsvQ/4tM29g0AmAae/q/4r/Zb39R7lqf/cR29uUsCQ5uHKv2/AH0bha5r6MvQN2WercvWo23km9o0VKe/wIj80HNMQ5uHvmZ5kQGgYUipbRjqPAwNK4rT8szYZL/1Df15vetk57+NfZk+cACIwo1LLUNTprGpTo8V/mG7rnml8+LcJAyopevLODSiKNIegL0NN46j69PQi6rIGIDDNvRMdWzK069QD9uNZ6hDXZ6+Xp5GAi/wfUMbePq/PU+hA9vDNiCYWgdAchdb2tLpOkZpYwVAtD0kVJ+7IiLoMrR1s17dHSIydxlaVQoA28M28U1z6oVrTofE1uY2RScGAJvDNt54xFDHrvYcgqcLk9bZVkSF20MSWerUpvgLkrvE1ubOI+jXv1phchcTbe4ytLw5j4+2+11Epj5Dy+v1GftdYqHNzHVBEQGAqcsBbHf7xNLbnJwHW1FyF1va3DoAtP0+iXyH6Es/cNcyUACwkyTahpY2tQ7+gsN2s/GpaWpz3/PKJkq6stwnxFTnYRCVS7QLXBFs9/uY6HOXoZMSWCe7AKC20fEV80FgO0RTpr520Fc47OLLAgGsi3MP2yTwLVNfxr6uXEt/7OHutkno2aY+9S33bEMtV0Fa6sgt/Ipoe0h8S+25ha8v4g+8wLe0Ln+ZATqw2d5FLiaGGgjie19buKNjzLHy2fU2yX2kz9yKPXA0UjQAibww2R7ozCHvA1meRmy3h11kmVNXErVL7gNtZqipPQBWvL2L441lqGPHHKKMw3kF59nQArCjTXKXeOp5HcndRpuFja5pJWD5tuvH9542c0j/Q11JADD8TbLf0UlA+n4NAK4fH3Y+GIEENsldQgFgEhBAkOz2gV7ZkOfJoyi+97WZoQaS7X4XxZToS9+VlqnMI0eQxEkSx562Lmm3T7zYI6Y2913lEnUeKmwPycazbFOdh467loYhXR9uR2Gy23v6LNAIJgEviO/9ZwCUaKozJqON5RNNmboKdQUk+513BQCGGthuD9to45j6Mvac2voyPGC7323jjWvqU18zx1CXUSDc3kVU7Qv0wGaT3MWO2uUYrsXvbXxXExA3AHC96EO4TF+YC7jU/6wtf2xtNGAWACiGadHogz1/wX2y/F7z0gas/Xbj+fH2MH8R+0ByCw/YJLvD1jcmaatjHUUfjOlrbuo6gCCM4vs49Ax1bHJLHVtRTSu21tkaASCKk018l2jD19wEiL35kznnaJq2lsB9SHXX9T5ry6+eHweCngrAsS3Hiw/b+VfPd+2waQHTtLz9DllPDMDxortkATB/CQLAcqP93shHStcXd9wgij5q85fCAsIk2e+iwNGXXjpEHYeW47BN4iROIn38WrlAsjtEXkBNbe6Fa2lz31RItoeI+o6hzoOsbGPum/Sim5Iw3u315TfJS0eb4Hqe/0lf/6i0KE0D2Gx3+10S+J6lKXP9W0FMwI/3uxfpTF+FB4Tb3SEJAqIvY1055jK0D4iT/X67CYg+9RUl2jK2An4QfdhotdoKwA028f1GFWonAZDA91fx02Cj/2rbNwDQdNO9Nx5dYgAGcd1DxYxf5l+XZQHghZ5p6Lrz6eQN3l3DCtPQge1+l3ih5e9qv7HaOkf7AOpH20Oo6aXWN1qwicLfNU3TNAC2G0TRfULtZeG2NtSMOhzA82y5ATjeJkqi+E79pigKsCyLstXRtLUUnOGw9c2FuO4h9XPj81ARFNiHjq4bpruTQWEacSCLFKZpmuamHoZhAFRNt7cLYPCgMAHDMOzI6z3LPIOPOpYfRt8tYgCbTZzsdxHV0FeWOvaNALaHJEmSOLEfXcsA/Hi3jwLbVtBI15h6wYEg3t6Fnm0Cg8jJ3El2ln+4SbZRvPNzPzd0TZugG5bnX0T7Rdd1HQjCZLvfJRtqKwu+mKahA6blH6xn6aR+bgKbMN4eksBWlEkW1tIJH9gkyX63DRx1aYJMn4a6AgyLhh/NJ0YIYBgWjT7qj5yYQBwG/kX8vl/axLgBwDzP82zO8zyvP5vzPE/zPM8L4B2SDTFN0zD63jTNquv6gQBxst9HbgCA2o0UEC7gOnYQs8I+dJWr+2FQlrIbxgmAY5uWH9+djrMbqy2zLctaAXA1see4fhhH7vectwPQNzyzf4lrKYXrMWwPibX002RM0/QLaW10wF3iGSoAKADiYGDkDAAzFaLpgXkamxwAJt72wDRN03jGBgDXcanv0U7W3QD4wWaT7LVTq7iJOjWyokCU3MdJkixneRiEbreqyCad7vRJcs8FDMvfHmTZTbq7MWfue6t2caIw3oTbmATFhc+qqqoq/b4AwLKs7xyGfrzd7x1WDIs+jeM4An1b1906ZCHRNE0T4HqbcHsQD71ibe4W4Qcl4PlRvN/VD4NO7/W5Zf4G0HVdt7yCEAPQdF3XLTszTQO4S/xn8Suilt1wA4DlmVYuTfOZJiBK7hJHMU2z73vTNPq+tw76P2ETx7v9JrAczxub+ldCCGBYrqOWv4cupZYdbeayqEomGwCmRT3q8uPjHBobmxBDPxvD59kAb+MR2495VhRFBVSe5VBvI0rb2zDAT+79pRnHcZr2NqnQcCC5i031/BZxPHYZAEJM0+ylaNsaqHluNAAwCiGAoWvYHxoX69sTl1LXcb0HzoQEbOoFofnwJJRw3teUehTwo+g+iXm7ChVD19R1VdaTHiIWLrEIMLSsWirWTbo/feR+bpoAoMZREsZRmJyiZz5rmqZpdbU6PxXvxglw/SiIttbjSQyL3vJumICmZl/O3HF/qYTsBsAwLS9oHo+94o6ffD83DMBx7CBqH9JeD8ekKSNZAuMw9KypZTsA09j3XSWbuhuA5C72AzfYBB4EqypR1281wPyiAeZpmqZ5BV8YJ3ehAtPs+5mQvu8P1AFAvSje7RaudIO5GQkxdMA0TbPv266jhJAgfCp5zuDGTyvaFHXsWUtHVVVVVdXjusHVbIDleJHvmZyzsiyAwnULuom9jeA2AWzL/4Smnacptizzd+nZwCa+p+pF/hg5JGCZlmUx0UohgNLSJwIAY5dzQLAMldbmOQMA6rqORekgRFsLwCYW9UR2POqjvfH83LIBg3jRNs38M6eamj1IJqrJQpAQyzJ0oAroF59V3WR8CFpimqYOAPEmDuMojqTgz3xWVVVVp3GdvCmySgLUpd4m+v50TIdF79qMSaBykK8AOByCb5UUAjAMwyBMHEvl4EnDMFZTQV3/S/7ArcFwfD8nNtA11akzmKgl0LUtO3UaF3UNJMmdvwkCb2G8rGpWZexv0wAz4PpR/EFTZrNTP89GP32aC0jAILYfTY/y0/DFdGbeDuP6itM0zbOqqtGmLsvG10uizN8xDsMwDKbtUddq+q4bzM9SFqcbDeA6th1QJqXgZQFU1N80kvnUIo4LmLZtb+a69Vli641taBoQbDa/KICiKUkMjF9cF9AJscipyrmsgZO2SAMAxoGfgNJCS7SOpzkAuC51qWcLIaSQgEEsy0obdjK9urFtmxjA0PFyzGVw5lTloM/bQnSfx3E8X2MZvLytJj3CgjPL4EVJGMdRTL7hJS2gaZqmzfPczUNXd1WRFoBtW5SKKiuJ0XWsSNMCSFEbGgD3c+gLzjhjZzapqqnouqZO64YxDMPoupb/Fhh+4zk2MYDKMZbcaLMV7qkx59r6SxAnd4G3VKyqJKtEVaU/1ACrRKZpPG9M3SBeFAEuXMCFgWHKzTMmeaUrwBdnZoxJXJMdbP4oKK2lrc39dwxj33L+Meq0JHhgbWd87mtGcHqebQIIIbblHqXkQgiAbQTnso1t2yIE6BuWl6rmGoSV0zwtywKYdhAFAIJtBeDBJQYwTVP/ZeCtZBz4+vVmUSd03NAGWZ4AuI7rutT1v4hWSrmqr7nvuxp93/umaRoAK53ZFRf5I8XQGEPVfLQMwxhXi32CDGL/F+jOxtHatu1HwIjCOI6iODzm/svsmqZp2jRRbx46USijtACTOI7Dpf5ZmztZWfoypHjsSl2D8qfQ9YJTVTMmgHHsa+mHg6FHATmK6+02De04jqZhmgaQ6mgMo2dpChREQ21oQ5Wmq6ty93AseFM0XAhRZG8BcNYA8zTUX8dmPoG1wwiMQ9d2ObTw6wh180ePmV0cqkknE4D+OLdZdcapqWmqOs/hpuJ7G02hj20N9IJzXtjJYrhPaVGSz2ZbZ+hOl9m6ASAmIUTr2ratJQe4aNq2bSdCCCEAy+1e0+/iL0n+0E5d2XRA31QlA5ReCgBD3Q1A31S/aVNZMnmLSAD444+rX1yXujZ1mZRSCrnKZ7yQvjrppQVGtGcAPAxtqY/6IQxct6llO4zAkxXFH7wAuhXEWcW7rgPiMAnjOI5ZXgTK84SqqqrqTANlHprSIcrYfYNhmqbZKX+2tLljrjEPLfBN2JoW/uK5vj+yKueSA43gVUH2hqeG4VMhpBArt3VdNz9otqadw60TulI3BlmkQKmhK3VtlMUJGFrG4RsBZ16bt4JZxrc3JuCsAWqegyyF2qHKKgm0bSt+tfCJsSM+tPIbZs7Yikmx68sFsIdK8roDhr7vA2LbpO9D74u7UzEbQyMZEEe+qbRV+Pn4kGZp+4GaQkC6z7MJCegmIaRbaQLQtV3XdR1Z/YuMwLvfJ8OTmgzfH4s6rYDKp79qQBLPxxroRV0DlY1Cm+qsKKs3ALgmzaGuSykthZBSylU+z5ZQVVVVBU6oqfX5eUzZC8fd77bbOPYK3jZCAppuEPrZV3RjOpZpVTEBREkYR3GkZM/bTNkcoaqqqvneDH0Uno2ulase1aZfNu1iWIW59E0FdEfYnzaBTzceY03LSw7wijpkif9UqvNDccxLJoGh6zqNBveD5seeoiiKAkTJmuw21EdE+3NS3FCfUAXer4HvB0HNhS9kfhUFvtYAhQVhLLVSoEnTAghd5LX22ey7amP2ncjHLmNAw1npqkkw9KFOXUudu2/oO1lPwS92cDI2ufjcPWEXycqxgU2c7He7uBFbYSiIwo+G/NXUtefZ0vJZRU7T0HcA0PXDNE2Tpum6DqRuGCVJ8rV0P8W9KNKHFGA5iIYkAXCs0XcZA05oTG3qyzSfgP8u8c8xPwD01VUGnFLXtSg1pGikkBJQFEV5cYVWfj52NPp8xaqauvvdbrdLkibPK940532tOlCNWrNcSgMOhHEcxVHwkGfnlB79aB0xjUP9mA8zdHtjo20EXUfrwfC1WcxwN9fcWwcEnuP5oaexqmBCcsBxbUNXlgHWYJiWY1MP6FrB883kDZq76ex1914nu2+S4jyHzx0/8GjEOa/IfJsJvNYAKVpHXzrFRF+dToAff6AOTLPrQsPoOt9neQWg8hxL6zn1P3i8zFdFL2Vd2vFGL8tQKx3n+3Gxf7EtYgI0iJLDVqbjvAeU1g9NdjNbmV5U5MUVORuZadI1VVXXqNY2GGdeqVsWMWYGpBCGliQAgGM99CwF/vVfrwSW3MXWS06lra4y4K5Lqe85XNa1lHW38kC5EM6bQXyIrh6H3X6/2+/3u52SZkVelhyYpqETaQ3VsDeB3jfCAzZ+HEdxmWbnI6+D7QCoea4wMszQaXcXisq2V9Qp0+OJL3ZvBr5DCAAQzw8829swXje85BLwgmi33w6/SdtPHH3uGg5wwXNz2cWDNmTWmWvXye6bpHgKEXhWlPuB5903afteIuisAX77DTdkEPpnG7Dre8BatltkU2EChUPUQdBQ52rkGkMjSoBXrqk05lSbPiv2yjBM3bh6U65jB2HzeASWvaIcHbes626cbmZ7DYDzZjwrt2nsxWPnVk3p9IVY80sPraPvEwALgCPr6+J26fDje+8l51nRqwy447qO4/qPnAkhJVYeqBe6LGK4edxuv9/td7vdzng6nbI8LwrArHlOZgOqQbv7UFS2CfiRH8dDNp3Tfp+ZC3GOQcgwQ9/qnmcRYqzvOIj88bTETp0Qssol8F3PD3zzoeSMSQ7A89xw1z2mlb3Z7ZNWUBdghWUsbWEqY11/Htb01nWy+yYp/tD6pU+FVwQ08HzdMG4BsCzLskwXzr8CgGHoPpRwMqDuj/6iFIqiAD4ZszY4hEp/jPYhr2wLKC1DGXIyhfu57M6yXI2pQVzH+5I+Lcuy7BXVVwRrmvrWTZvneZ519Wx+L8r1IgvJMnXgtsiVbhB5xmQDPHB7Hw+9TCfW9MOxappXazeJ9+dnDbCwX69w71LXct1BiFZKIQAMwzDouq4b+sUbfMOK3W633+33e/PpeDydTj2JahwSf3gQGlQjIaFnGoYBGMTz4zyKAcBvPy/Vr6YBTD1vNWOY4Tv9cHbazkFwlyubaVrOb254XuA7gVdxkTPBGQCDeNQ5nh5Tr4MVFTYxgNzU5o7bpjLWfzK7fhzH22T3TVL8Ow+oG1DPE1Zk+xZvbzOB49DKumdt//alMXTiO8PG+N7CtY4cEHXbA8ldTPQWAGr4xNA0DUh1dRKE3gfhU3HRp+c5dF2fpqnmWBbszfBU1YKLBvhvksBUB1acvq8AePZnXwOgIMrYuKTLWjK0VZqWHIDogppnRj0JwWWTv1m7YZr6iwaQ5wevAHBdz3OkEFKKesLqwS6maVqEENL3fT+8edx2v9/t9zvj6el4FPQTY9YfSO5i0kk5wQnPGmRduVy1ua6GAlzTNGB7F5GpawbVfHmroe/7yTRNr9U0TTnvQN+jnh/4wZdSNoIxYHUW+74tjxxeaxiGYQCFpQ8NJaai3jv0SXLR3ia7b5Li4NyljFLfo8LL7aq8TQT51NJKfTKvz4guxDI0ZLvt+9/8zdh979HlXK7aVa8HANCUs/I4YWqSj36wqavSmlRVxerVrbvbMIhvTBmgfz7mhRw0J/yG5C621bYi+nc8x18msQDAtohhGIYcx3ECTsrccccYGDeGgRXpWoIysNLSJzJ1GeP87dqHlj28BLy9uMqAU9d1Xf+raKVcNVHfNY10aDhpvuvwpun6N4+L491+tzOfjk9TFKHhGYAw/kAb2c/QfcscL9l8VpwZbHwqT8rQdgPgRR/oJPtRNUKHtF3XDUDftY10/GSeffuCOt2nvu8EXsk555UQwKqiNU2nnxXX0M/gCZO7iBjzYsbxphW87ZvbZPdNUhyAlIXveW5APdNusitrqQOWG+32Rj6cz0lvKEUvPptm33WEdF33FQNPC8Ag3p+1pp+wRBv/QXT9ADQ8tPxNEPnfC6b0A7FBsL7o0DaNDBJtUEwaRL/H0ahAUWYgju8DVTg6gHFYgz5CLMvsoVkWIYSQvOuGAcDx+HZtQG5qizCmgaXl27gflaO06vNvc1G+gMSlFqVcCrnGAEDdtJzvo4Eqm43OWdO2bx4XxPFurz8w8xcAqAQk4Iebj3Xdz9C9ODjJbhgAVtrLqvq0zwtkOpeyBgihfx5lP6q6HwffeNt3QN3UjH1sJme24oDXbdcDnhf4vu9v/qhqxiQfAaBvm0YNtuaokNjnTdMO6xk+NWbV9JPwoaylkLfJ7pukOACgT0uPVh4lZl+dbgDw6pz0hh5HkhBiil41zb7v++9jXZwAXde1D0M/mmY8PGQVEzUAx/VDP9zwsspsyTfjEvK67zugaUVJdx+DQTEt+ylrtgqgTBLw4/iDVpiTALqubdvOsizHoX4Kn7qOZVlL27Zd957sAQDjTXLnNXnRwXeffxNL/ZIboA71aMWFkOeMUc0r17N2pFXc8FgJwcWbxxmWn+yycA0MFv4rMQDT8qOk7Wfo9qbMS8YboLBQKqv8AUAc67QCTMsiH2U/qrrjHfOK8RqoOaMF2ZN6Jv6Ql1zWgO16vrvxal4xvnoAQNvwKt3q4aiYvvFQyqYBTJPQ/0KbVdOxnk55UTJxm+y+SYpf2FW89pMB6BfTMV7OSW+o1Q3DMDH0pqnXfd/Lx4bnQN/ycjR1xexEWxVpVjEAmm5Y3kY/FZVghbu9h8yKSjQAL6lrDJ6vLn17qrJ+cQ5Kc+EfJQ0xgLbt2lZa1PU86qXwKfUotUXTdG0L/LeJZwwNKzmr3vFUf0Cm5X96VmrKqTFfnEDDom4nRVufFQBYRR1biZxg6b7lp7JiVybl/KOqqkquXDaJqmka0LeMUddXMXXfyyzPKwakqIlyln+/APXv1Qno26blNlUxtX/kWZZVFVB51CZK722VUZZpnjN+Ti15aslbUXG+GiLGaKp0XqJibJ6KLGd8TZwZW3XuuyzPT2vm6zrZfZMU/xnpr89Jb2kah77lXc/H+kvL2r7n30cArHIXm+jWp+4ba8o0S4v13pafqp7lJSFaa6Mt1xctXEsbmG+qy9hwWc2DOVb8PJtyPjBpm0aWm0+l5/ih/BWb0HcoDR6qumkaILmLSFdXPit9xtZqItxtfGqTtVKSXVWavqx9mubhkow9h7lnGlr2kPVCCilXXV+4lql0zNOXgbH8lFYMlzd6Kvq1RKFlX18g1PO2BxjzvlCiqZg6yaosy3PgsasMBcCf+lZ86Vk7dE9HoOvEb5Wtq5hazos0ywqgcImu9Mw3lLGpqlOeFcA0Dp1IWV9UvBFnV6JyDKWrPKJibBgrsqwAxr5luVTnseG8yE6nvLhNdr9NioeB5zpE15VlHFsheS4vABAsQ6lfzklvqWlqXkCdixnalGeVbMZ1SagIoZ8B5GlVpmkGoJYsN0d1Lnilq4M0MPDzixJ1avxSV5exaUU91eoss+x2NsE4Z7ykoWi4D/h+GIaeZIxzJgE/+kBb4QSVz8qgWiFwSHzftgx9GXtZOUR9eL32oeVfnOffqmuAV47aqXOR8wt7CktXx4Zb+jLWPM/S9ciwkSzTe3UucgawFNW1S5FzgOeg1gqAVlZ5mhZAJRxdAXYr46q0EjUHWIa6WAHQiiI/pTlQEE2ZGp4byjjwcp20kSwzR3WusrK6FL+mujI21CIqxqbNeZpmgGCFPRvqPDatyMpTenrltLxOittRGHrUsQxdWcahFaK0svwMgNJCa+qXc9JXAOClBQ7wmaszz9JifdwJtUPcP7FiEm3xvSyyEgAriDZzgKflMNaFgUGyU5qvPrzwLF1dxrbnQ1sBdZWmNxMJWflB4dxvSrphQLCh3mbzvZRlJTgQBP6nuqArBOgKgeQu9i3X0JexZw5R5zcAqBxcBTZNmb8owxQDB3iaXfz1XMfUCmrqy9hylp9OHAAqSpRpvRE4oXavns7TE3CCoOYKgEFWVX46AZg4ANhnxpWnggFIUTPT1lVMXc9ZkZ1KoNKUueMeMZRxElWZnU4AKy194QAv07w8T3XC1HJqEhVj27GqPKVA6RIUhjqPbc9Znp9eK/qbpDjg7LdhGHiORXRlGdtWMoeY+nEFwAkd1/XzOelr+vbtnYt47CubfCyccRRSlN/KBgCmk4bWBpryxDtuGRhaXqQnoJz72nOJri7j0IpZ2kAji9vZKj/guW0ZZsSIARiWH1unLMsFZwww7SCIfXaGAKdBzuDHH2jgGvoy1qVlzG/jthS1fX0WcOX7/s9vbj5OXc0cQ1/GrmZFvuJ8+PLl5Y7//j0+dC41TE3FNPRSVvmVk/WKcQ+tqIipq5iGTvIzGPO5k55rGso4Naws0xGYXudiAeRTLyk1DRXj0IqC5w2Qm2hMQ53X3ZzXr8fcJMVh7/e7JAyp664AEE1umjqGAtBfnZP+bVRJx966FsjY5Vyys6pqfv31/dsZ+/LXntjzwiaW3hmrdzC07LGZqyxLS9YAfVNx/86/QMCrTAbddP/s2Za+jMI1xuatr/O//JteKcv++j1v6B1p/YDej2PL8gccu6Xq7dkmY//6zo0/IC3Z7vb7MAw95wwAZhGCvu8l9Dd323Hord0u0zDUoiyPABDfJb6hjH11+lcAGBk3LEhjHHhavBOD/9spsyxTnwujyTIGVI42FnOTZXmaA6gC70sQBHeBzwoqgsrBv0LXdc0T1ahaG31k7yUxfkSbwzYwjGlgp8efSf3vk0BXAWCe26GWrCx/cvM7wwBgYKd/+tsX9v9x9PWCRymri31DFCfb/W4fRo6sx1nTnTgjJvp+aN8BQJBEiedbxFTnaWgbRq0jAJokdzFRxsbBGXnLa8WxTj8N1emxxH4bB4aCqa/SvwBAGAWea+m6Oo1DI4qLC3pFU2ZoqE2jr9ITkKpTbc59laZ5D4DnEKzYBP4KARctMHSStbwbVXf6WFFrddDNaOO7DjE0ZZqGvhGseLvzjHB7F1vG1GYYWnnLu2XuRimLqsSa7z7zsxlqxlySTpdbp56dHt8HxPMwAOgy/Z9eRnTbjX1pwvv7JNDVeayKkzhsA6KfO+R+MvpRvUuee+cQRKHvWrq+TMPQCFaehusFt4NkHtHOJsnfRFGy3+35b7wdZ02nQWyi77qa4w0AgsM2iSLfsk11ngbZlqsbFYRJfO8pY4U31ub2xafWQd/a20MSWwqmZnXDt9skCDxi6uo09A3zSvP0JuSQ//k/v/zyz/9887cUkvm+KMLK3wd+9UfNAcGr33TRjup90BnnAy4vTCLft2xTU6ZpaFrGyFsA+EEQ3/vGxNE3Qt5KbZm7vmaUmkcgjO+9CwDahpWWoT9O51unNkUn3jk8uRoGANxYrkb0+8QzXprwiDp3lMDcHhJHP3fI/WR0pz7/+Bds9kkUeF1SleIAACAASURBVJapL9PQtRWz8P16wW1bV7aGcTWMm8CP42Sfp2lpEbWv86i/S7pWVu4bANjb7V0Sx57vGOo8DbJyIAEYDvWT+F7pfyus6+0yjLWsinx5WfrE0NXCDpO7xFcwrYDZHnZJHPi2qavT0LSZZ2na8lcSFDdUKNPQ1pJKZ7PZ/+mPyjLWQEfvuLHHetoAwDskURJ6trsCQN7UAFxIcVw/CP5kTt+6unKt9kZqy9y1de4SZU4RhOEvCgDMU1sLzzJ09KfzrRNDTd13y46ehwHAaZZXI7TdISTnJrwwvvfUWVhopyC53+gLR//z0ZQ8/7gWf4S+Y+rLNNRtkKH9fr3gTnJXx9CuTKZ+6IURe3paPnhEncamTM07UbiUvgFAHG6TuySOfdtU56mryy/EAKBpumkFifc7Icb1dhn6pvIc83F5Xvr4rRXUtV0/vtsqGL9WDhBst4dtEvi+panT0DAvN7Sl61+neH9iJg7b0POswPV8z5ufmrod1kBHH/fbXUjRtm0PkCS5S6LICy4AuKkBuBD1PJd4wb4UhUup295IbZk7yV1HnboUhuVvQgCYx65mBTGWvu+r9dbxa+U61rsAeB4GoO1yEy8j6GF7cJXha26cLy456qYhzuYXa/7W1T8f7dh+uPlFXRvVwu1uHwXBCgDmQbq4XnAvq9M81OdN5jqWH6hZrtwlVJ91RcwPNKDUMsw3ANjEmyS5S2KwbNJ0206vT8aV83nqy3YZ2jrITUzH56XnPHcptSilwZ2FB5sYQBgmyWGbbDxLV6ehqQpTnbq+fxW4/8xMbA9JaHkB9bym4KziTQ08dpVzuNvvtvuoqOquA+I4Se7iOPIdS1OmqatvagCeAUCpF/o0GDxKqeuu6uvCu2UcJMv0sVstnbL5bQJU098WlrH0fSeq9dYHhxj6Wwf6wqjN72u6cpJtj+cRzi4+7Lby8QUnPeqmbXRdJ5+YKIyfjjZ03bSCMHx01l62ZHeIPFtfpq7h/7d57rU5L9jw49PSSO+cuLAdz3NFyT5uoxObjT2WVjS25TjWGwB4fhzG20OZlc2k6a5ZyPZtgvhluww1o0Sdulqcpz9Rz69c16auTb3GWZOvYRjE28N2W+T9rBH6kahT37f8FgA/NRN+ch/5lLrsgZe8YSxjABvtTbLd7fcJO+ZlxYFNtCKAsHSAZlhe8U6RC1kLgv0vHwrPcj3PvegIZfPbBMWwk0zrGnEOKhr5CKimu4kN9F3D10Jvhbx+6itqxNoBP7PzWYxCAOy2u2Qvno7szFNlMzb1qs7WBrefjj6vkqw89YIg2u15Oiia5V1ponXBhr9LpEvIuR7GJJbl5LUbRMXjcf5Fmed5GPy1jOMVAKjneVHEn445nzSd6mI957ml5+0yD3WVaUPzcubYbKnjUmq7FqU0PSdiXT/exNvwIav6WSNhcpj7Tla3cdvPzYRp+R/CWaa8lFXDRMVSALbjeuF2t8uPp1NalEAQRHGyvZO/MzlAM1yzqt/C16Wea1E6FBb1N8x1vWcj0chHKAaN73pWOM855PYRqunV0yGuue+5rx/3I2qeAGBusyvhbHe7XX08HU/PF7OwrhuZ/k2jb4kQNwirh2JQNMtp2254VtTtI1RzZ8eWZZln6RqmaU5d7zkqL55iRVmWZZ7PFTuvAOA4lu9bj9nTsRw009G7PH032Fm3i2Z9pFrXCH5paW/k1vVs13Wo5zm/nU9t4FHL38Tp4zHrZs1tZyOSOfVuAfBzM6Hrul4yxpq84ZxJXpUAbNu2bX+bPx5Px1NaANQP/CiqH085XwEg8reFIq7rUt93ZV3vXNulrmu+5BDbR8WIQF1Kr47G20fNiCfN2lSubTuvH/dDap6wfuHj+Yq/222H4+l4Op7OF9siCJumeZvERFMC6NvrFh5srm8wCCF2mn9rFM1yxlxcnfq2uZLE03R1/HWuuNb1YRiatUPpuSzpFQAIcV234kX6dGo0m+gjS99LEJ+3i+Zs7zsuPPuiovqhcCil1HEppdmlIM9yNgEdy/z4xGctWkzvc+kX1m390c/NxNCyJ8GavGVcVFLwqsF6cmpbc3Fai/RW9G7cr+njseqgEdvs8tNr+Lqe51qU+l+EiCm1XM+lV5FC+2RrYWtr1+VjaFNn0pxN4jgW+Wu6/4oCAHNzVZKy222X4+l4PB4vacGmffzQNM07ibTNBkDDjeHVpVtaloFxxSajTKsXpPu+Ytrm1Pf9ML66HYBuGMY8wzAuJUi3jzQIIUS0rayecs01tUkWbxXUSu2jooWq59rGC7sUyIRS4rg2pZxfRGyaJnGEFPnpaSKz6Utp29b5dH45G7+fm4nKVhveciZEJZlgPbCeyGuaNnQyezwdT/kLerMn1deAuZ00+3WC0HNdL/RpJYSQru9Rl14DAOOCtySEvVnrlcwf+n1v6AAA81XeRN1ttafj8Xg6no7nBKSqFHbcyOaNkl2FXXHIV5eeaej7vreDO7sWIpdtdXo+hvB9KKYXZEx0/Vm3nOtzh8E07Q+e46hqRB3RdMNbAGiapmnjMAytfJgdQ5uat7VRF2qfLKPrnHMj1ZkEo/6G2dSj2fOrG6ZpmlXXNOzE9kHf95251ov3LfvqCtENf81MnJSxaGouKsk5P1uWeRqHjouad0OTPRW4oLeuK/UuMgBgEK/LHE3Xpa7lehnnnvjkUkqpS19CRe2z6dtWN7wqjun6cRxH7VYx/IwU9QAAGH+Tz1Z8tzWOZ3pRqplth3X9qp7ZDgMFwMK+vAQxF/lfANp3jSiT2fK5rKsyay+V3nbgA4oxZmVWVfyMn3EcR8MwhGzDeXD9393YD1XG6qZ5AwD1qkdqfhtD3xIx9LVDcZqer/E6dm3XpNcR+HPXz9hX4TCO42SsvGQpGOnynP81M/E41WYvBedXDdeu6xANmdGpJlkTwbqu6/o4jqMXfXAAoGF4xduzC6gIEXeiop5NqfscB0D7rJpeZGXsVVHoTY/C30LWp3Xek3cRoaJud08iOx1Px9NzclJR6szZN282mQoFwPIy3xkSwHJBhBSsIIh9LkTp2qY6d2cVoM+AoqqaaVPqnxsbh67rBtt5KO3o0zjn3Pg0DsdClJV8A4Dnan5VVUEMbXrPQznTZmMErsP7GwAIkVBqUd+9EpWiKIoyv/SfPPPyhJoaAz+lPzcTrw83VzKJRaPd3iwGSqn9PM+yLAux/Y8AUH/NX+UBqOtS36cNPgFK73nUpdQ9W1rb+gzVtN1jzji/scuaqqqqOrzfOvEuneuTXursrFDJAhl3XSuFfZVOL9y3KqA5F8uwlwJ+fTpD4aKCKs82ll74QcyCwtbGy6FGk1WAYjihp/fPwWw3dFJ4mzpFTdBVzVyhLdOcs/INAKZz16lOnI+qaeijLN7JpgIANhvoTjyWJa/bF5SMkjme57j+b+LZYbpGlfqiY26O5X9oJn5Imqbruh0Fg5+buq6dy8/nMwg6BcovX95sWUoppdTX19JzjVLLpZSeN88vLeax/f1SnvdCrnUpUb/1qpxpevc4AI1Yd7l4KUNSjjDjruu6/tz+ulLh2B+i5nXRxVqc1ZaXIq3mueBje1aKBdGXvi42rud9tNS+4c/OTlFB0YPpU8SZY12Ww6vqPh5Pj7mFtllqC63MslPJ3gBg6Pu+Ny3LDYZINQxjqAjeRYAdBgp0RzymVVmJK2PB5C8FdSkXLwB4RpVOYtPQNE0d3vDyh2biHxLfuJbi8wcs18+LjHIYhmEcp6t5jI4/NUAY4A25lNqUtmcjHLiez54BMH5pMY8t50WWXZd2YOOHgWNb5/7/FwqCaTp/se4N1UcAaOWlDKnNnnTzPun7vu/67uWEqrBtZ9vUyyvnM2cAevYSBmbrc3YXVpQahlpa3PLDeNezyn0JUItKMX8Jaos8+2as8mlOdirh7bjQgNjar995maan/A0A+mFo69gLm9meVN0wW0eZ3lcBiqIsRH7LyjS/6TQRonGp65Wcx5dLF1TZm2E2PYsQi60NA7ePe99MJHcxuQHA5QOW49i3NfumCd4Na7wzdF3XEdumD+qYvxc2AS51qUerxxYANPWeui51z9mdYfh9mse2FWV2Ol29tLchcbTxhJRtd22tgwDTKOgPCjPqI4BB8LMIl6UrTXLo2q7r265/8fsL27HD+k30MQJYrO4l7Mw4gJcvyN0lnlYIyq2oAXUdYlwJslfUecFzlx3AWGGb6hx9Zt24aBqxM5c8/FGmp/ENAFqR+zwIm8mIJlUzTaZO75flN3kF3N2zqiurvCivn8B9z9GvlUI/DG29cf14dhY1jHzXeqzb4da5+KGZSJI77wYAlw9YNlKwDJXe5vn6LSr0XV3XiRe2C/vNfFf+8FyLUkOw7wCwk93qBj7/+fdhbHvBiux01UPgacRLEv+B1fX1dyeCAJiGivyoMqc+AqO4alnNTGJGXd91Xd++MCyzHftj9PhqsO8DmNrrICbjV/JHcheRvmtLpTG6/jY+cV1FD2yrf4llCsc01GWQvu0byjQNeS27YcweZrwBABMtL+zDbNBuUjXTfBhrCqgW3lJRUZtuhKwbKeUVogOZUIfLK7+mFbm3CTb1ZHSL6sbRpuC8qW8LC96aiXOnVRAn91f3KZcPWGJgpYWW6J1I81UF1U3LGA3bhchped9fp9T3XS5rngEbh4vVDXz5+7em74UoC341QtGIG0RpmldMvAAgCPBaRK+oPmKq5cuTxoyYJO66rmv7l0qwyrUdZ9/cLtf3AWC6DWKy67m86APtm35WNMvQ22uL6rpQdBpb+dqwBQA50dV5aAvfJpoyTUMtuJSymYE3AJA8d2wDsR12k6qZQ12YOvBh814OvJgo/SWStWyuAdBLwT9PX1j54sBVm1aUzmE2vH5RrSDRjqV85We/Yyb4mqky7SC5ktD85Vmx5SZ6oeuDrE7ZCACCMS+zDjD9elqUd3M2lFIafONMHGtDb7hIqGe518miJ97Vgj07abZHoWiG137P0iy96i4LAgCYqtdx5jXVx+kmasgIMe+Tvuv7K+3XZY5j2+E1AOxgPXMav+bvNGud5/e9z13Tz4rmhU62frBmXbALKLprHC8NWwC6kzKPg/ALi2jKNPdNI7NLw8ArNhW2besYpEccZZm6bvV7Dsn6Cevb7gqUjuduhJQ8lF9ernIut0yI9gUAkmWOpSO2635RLXd6TLOsfNWx8sZM2E912w9A3zTtCED78289gGV+XsL0umKZ89y2TER/4u20KLrpvq34MyzqMslbKX67F1LIinr+LZez9MrmLScCYG4ryfPslGWX3ip7szqY49fivUBlOdu/VydROTFNsu+6vr3OsFS2ZTsf6As7ltP5mRohPwSAaQe+3fWzojneseAX47QuGHNVV2meP+eH5eM0NNS3zRUAfSNYWq7+zBsAEG0Z68KzNWWZesHatl0dsfnFLD+/EM1dGkopL9nspVOAVshTw7n0sMgV16Xj2DpG6RFPmfuiqo5pnr36is87ZoLVTQ00LfuiA9jz7isAsOqHqYnCtix96aVnBSqWqf/S8Nf3Di37avaNFEIKKZpqXMQliL1Irbu697sJAPPQibbM0jRN6zObz2zTTPONiIaWfTd73g3Xcc4iAAypaZomXQvfL+xCZru2Y4vl1aTA+YNcV0sDsIiVp31TN7pN1WXqfi/TomDyeuzcS1GujUorNd9b7lHbMDVlmvuhkeLSBPAKAPykYeoltVYAtCJjEgjie29WHbMfbqI3kbkeTaRcDd364k03yLLuWStb9s1ce7Jzm2gYm8KzNWUeJZP58ZRlt8HFGzNxKmvOJcAy5DqwBxR8AdBmWXUpUn4ePffs9M/ILVNbhqb0bV3FMvVtLeSrbGblgKlzwaQUUvAc5tJlTLwvtcpBs5bYDV1b8yJLT8WPRHQ7RaPORc7kJWR4fnhmmqTXVqY8s6t0iOOMRl+1w/WkAOY2YzdL69vq+5mnTcO/eERTl6njvDxlRXk9du7busrTq1hmfL8u/W1RaI5pkBUllqYsU98LlhaA7wd/mlXP/yba7hqTrHQoCWRJ9JcX53ChziytCGp1LgoOiJOGsZeubenKPMq25OnplE438742E8dTljPGgRTS1LFf7/oCDFV6AuLb6HBuM/wz6pOGsatpfgFA27xqQDu39/C05DUvLQh9GVhavie1tWFmffowdPz530i8FdHrKToO8ItniquH14Qs9rnT7MIuWeeOg0qdWVpdTwoALUuvlzaxFO2lUS2HZ60AaEWZrR1Yz2PnoZe8zE/vdAO/pjeuUj60nFJiasoyDYOQxQkwbX/jq+NTvvoVz5jsbFo0kLIbr14c4ACvTnPHgLXfLMfU1xU1LV2Zx6areHk6vnKersyESvVfWZGesqysgMeW6vr+ctsXjKJIgSiO76+iw5lBAqgw9TXzzDMA+q5mr84y/4eXH5+erq6/lRrwP73PsbciuqW3w54fXpuQ1pkpl4slVwikC/Dq9PPRJSHo+Xl4CukZKwB6wcr0VP5gwf9w6ed4NA5b31Cmvjr9y9Xf3/rK73xso29Yzpee50VR8StMjjSHhj4r2btLf6F8aASlxNCVeewbUfH8dXbhykyo/p3asjxfe8u/cdu4igO/TDVrADeI4/sXAExfhQ8AVd8IjxJzBcDY1vJva+b46eL/39/6ZsQ/vXfx220J/E/mu6qbf2g91zA1dZmGXoiy+GHp0PYQE2VsbHTm9hBbytQ4+DkA3iFWOIO59G2ZpsUVePPZAlfPHw35Ob33CZcbujIT2kHfzsuCZZk6jiHDh+sbfx8BwDDtIHn51xrPp27NO72M/5j4BsauOj12h+2G6m82wQ/o77a+qS4DK0/qdkPf7p1n+vskMJRpqNJ+u7F0jF2ZqklAtGX8t/YF4b/cbiwdAP7aGt9rSvv77WWzX9mlZHvwlLFCUzlR/MFTpletHTrwj1ufGBh4lT5WwH9IfAODKE+PL0q6sEDMpe94kZ6KH+yBf0x8A1NXpY90u/FXhvwc2rf0YiZ8Xdd2y7LMU/NOw/pKQ9807TnIXv4spvc+6/XMgruYYKxt9N32LqFEmRob/wJ4EXUp0fVlHKUo8wr48zbxDHVg6fFXANtDYqlLV1pQD4lPznvn7y7//Glg+f/+PIGlTK2D4ZBQHWNtQ71LbG15/uc88V3iG/oNV4MocF3dVKZxEKz4fr66PSR0BUDj4F/wHw6J/7JFx646/Y8/YeH2EFvK2Djo5YuDFcTbO6X7rTANGsTRB2X4rbxJXunA9i6yCDqeopMj9ruYoGMW+pe9dIIwjWXoZVn80K9I7mKCqUnRbQ7bgChr/8uFwsPWN41pZKf/AwCSJAxsQ1+Gnhen8zwXM2EcdE3TPKhd9U5R95natuNfzr74fZ+X5/+BQKPQpbqpjDOAQcriK4A4vvcwlmgY2SR3kaWs6Rvv/6HsTZokR5osMcVigGHffYnIyoxvDiMzzQuPPJAi/Ns8kyKkkMIZYVNm2NMz3RlZWZkZGe7YDLZh5wFwD/cIj6z69FQVCYc7AIWamurT9/Zp6DgrwQBxDKVaZKbUNtfmz7CIFKgzs0Cq6V1sre/OWfypLc3/53SP73xlJCC79C7WYShBKOk+1GYKS0rpxOk+MfXLu5pkaejbhqGMfVf7+OQAYXoXLw5QAwcI031yMeC81h2DOHQc3YBuoKwsX14SP7lfhrca/+UpGVaQur8jhHQdYT8OFoWUKwfw43sXA6tAUHqEdLt1gZcgiXUOAf/h+u7fChIQJHcejBW0PMj2saMsAyyrncbxVgmwdJdmgWvoc9fWGE6O1jDi2qYearqmdQpc7xJeGSM5LFWSzX1cF3lVNwDgb7LI99DqAB0j5hcACJLkfm6hcW3NduN7X+l+L41Fx8tzsKnPg2QlVqZqkZlSGzRJgIViRp8qYLEaxPfB+rGz+FNzro97vv+gjF8FZW58b4MAYute+BHBH2uBJIzi5M7TeQmSLPijeLvJksDBhjL2InjZrWE3vrdnAKX7vbIAHD+5fynCdktpOMnS0HeRAV3HiGOq5zTH9bwHpfvKase5ek1V5Vy8UdDrrpMOoJvu30xogDeUH8GPN1uoobFMY34HDnYrSEAQBJ/mXpW0Cbz4PlT7SzCG7frJnY9GCgwA3Djdp2lg6HPHbHj5kqmqDGz0mq6NpQJTxW+R1ixWYmDIAIjv4xh/K8pjUQFY2XaTRi5eHUDwxd0Q9mPvh207ju7a2Ps0fVEUBcANk7vQdk19Hhix1LEFsLxonyqHobEBAFRV1e5nhXGhJWG875e31HVX8afijHlCpuelRV3gCZveB/iGLVs1HW9HmtIAALC8MIzje51A4wUL/VScbrdp6DmGMva194KeUhTF+KABwDe8CL8Yzt/Oj6z9UiCAaLPNktDBBnSSVqa2ElIAADJdN3suHcd1rF9UqK9tIYkaNtHvIaei/a+AsLdRhQqg/DZwRtZHYO0ulsdbQQIMKwjCI2W1H0Re+Bt8PdfsQcOmibH/yZi+0AAAgjhJ9llk63NfAr1CWncdaJo+U6zAxI/1u6C0A0gHoWAfx3GcF0VR5wVAnGTbTeJ6qwPQFVPZS8Y3tmvZjm47juP8oFT2AJblhL/5jqnPAy31QVIAVdVxqosVidS3tLQ/xIwzLYoj42dOlkEd19sCQN+dQ2nfSqljjI3ZsrCrFrZtAcbYfl4R34Fne0EUR79XYdPULgWAKE422zR0kDp2b+aXhuqEJRqHrpPnzc7ytzjdbLPQdwzoaGPr83DelfYtY7HjYsdx3L/HAXpJjroaMiHaU9BWFEV56AfKTvuL+HJ5vAgSyikTg07UtRc0dUi9IAz8r9VSHQCwfAfrOjJN67fcLxCA5flBkuxTXwM+Fm/K3UcNpIsUmNr68B4aCfh3aqX3YRLFES+KsiiqAsAL43S7jV1DGSaYga2YSsYZa2zXdRzdwY4zMCo4BdCRiZ3feMsV+wPqeG0DzPPcc/VU7iSVbdl2yDjXojh6rsq8JAB923ZHgLuLCqCUUnLLsizFsq0CbBtbE8ZYSNFKADA9L/AsL+yCkHp+2FAACMIk3m5SIifdfpPpjnkDlHYDQNtK8iJ70ZO2X30nixwDOloac9+y0xGMUcp913Vcx1JuwZvfcYDaMZGmbpJOkou27wP0yxJTAoDlXS6P5yChfhwFr5cYXrte6X1sQlZHbhiUVVUvM0VJFLq2rgHAvEYEH1ueHybRgSnaa/glAIzfv8OfW9+mYZxESWx/K8tjlRcFgO14UbrdVMVkBJvPXSeXJYRRSvnGtm1Hsx3XoXzp6w99K5uvnA9KqIQVNgwASUtrUOu121DapmVZVsSZFkdNcSxJUQC0Hf1sQ3CJNhBcCOlhbCqWZTdzZNvWiDGWsm8FAAS+6/qBL6t9UEWN73kNgOMFUbz5ceSTbvXizVKXN5LnBIDW9gUgq2+PNUAQxfF2G1dEwR+MuRXnqRxgTFCWuS623ZeJtz8zHSBHuqbCZKGXoA1wZ0AvWYW1eSQAhnm9PMIaJIaBM28RICF+7QSFH5IojAL7a9Us/FTbLA19B2kXDrlPETIdjzzlikqL5l3CgV+aFkdpEMVRXBR5UedlOQJgjC0/qb9VE97i+RthC8ck45KyyXEtW3Ncx/3aNJRxAM6aAirOBx1Cd8EfjisMacF+FpZlWbZ9z5kWmX8U5TGvKoAmB4yv0SayE0JqGGPNsq18NC3L6jHGFadUAhieHwR24Fa1H9bUCyLaAFgW9r3y+KOcdGuq6BtYWV4wcgQoTeAvy0Pf10cA2w2jOPt24IrXZ23tvYxYUcYZI44X1I7t/h0OcNB1BSZq0+bsibPnGdDTxtLnsSWrtMHF8rjYgzL0vHZN7RkAatfxSu+3kDA38Ku6qkldAmSbXZqENtYuEsp0nxgIoUqSQYgiL0/biiY/Pr2PQVboVVCL4zhIozgWRV7mxYLg0JGJTfyz/tqnDresn9+WQj1jTDBqu46jY8cRjErBKIBrTNwE7OmqMqzwM2RYwSf1K7VNAIDStmzHsq2Qa1FRFmVd5AXAEaidXaONpGyllBhjzbZ6MXLbxjrGIKXsJYDvu54f+HNT+XchiakfEALItLD7nRx+9IY58eMNDqA/WAnwX27UghwL+35ZPFWQGYF/kqpbLpQ2Dc8cy3FcG72bQF+bDnDQFJh7y2zpS2fjb64BPa1MWJaYeb5eHgEAYG8qg+S+rcEzAJSeXzuB54d1FBrPJSnrmgBEabZLg8DWpvZ8kV5y51qqOpkPQ/19apvTtqI0oHsNjQKAlTwxb7padgv6E8CNTgtAUeZVwawNkSssfJoGFk2TpqrzUqhnnJGG3duOrTmuQ1nLGeMAUXqXhIFt6CoYp0FJhJChnsBVTWnbpm1bH2J1cbOyEAA/pP0xu/59XLSdFNjCho25GIRt252Fxcpy6vl+4IQerQkJwqoJSUAIIIQQdF3XPGE0tfWN8bvhxzvFU4Rty/3OwhBAtuZJZQAAgFIuF1i+45yhzn9mOgA8K/PALNTTU2djTj3RqPg3c2554wFA310vjwAA7t5UBk4cfe4BAEjtOl7pfgziMKwrkpO6qgHiNdvVprY6TbWYhvs32/YbrHS/l4auw7KtoBhkU95CIApGCjypU3kkVKwT53ESxnEcF0VR1jxyO1r+6yJPN5ruJrWwyfu+X3CHlHLJWOe4luI69nNTNYxzAD+K75LQFcP4Hti/sLBtW7b90D0WZV4VZQkAP9uH18d1kjEhAmyNlnPgA09sW8UWl1IICeC7nud7RlM3lX8XET9ovCWkTtM0TfynPvf0vYd1rrhckIkhhBBCn5bRkSs0IKeUSU5tz3Ndx/47HGD68Yqr4eOXH9Wgul3W1osaat9fL48AMD94hjrw6jB1FACgdj2vdv0qIj5UZU2rsh4A/CCONlu/oor5oXAW/zIwNrURUCyFFAAAIABJREFUhh6Gvu+HAZZtRT5TGxv6+Lb4QCrbgAagKQ6npkcch0kUR7IoSuK60LXE/FcY+pazOu7tyYhUQsQ6HCkY45JT13EM12aMtYI2FMBz3fhOfGX9ON+9+UoAABjHaZE1VBRQrib4r03ITggJGE+WKkQvWssGjHMhWikAXD9wQq9uZO6RIIhY6UdLSFVVVVXRXje62nynl3OuuFw4gKqqqrq+9uMVlpByRquQ/uY4pu156xb9GsPz1m42g0j9/LNVM+R7QW2ZAIDQ9fIIAElMqWre42kdDu9J5bpe6XnZ7veKFHVNKgBwPD+Mw+8HppjZdv2xnWwezQ2RX2Eksu+HZVuhCKSp6p0+iHPx4WRvCMkAojiJ4tj9VpTWAwC08gjLGlgY6QOdDP4jJ6RekKmMM1o3LHUc6bg1pYwtgraW7+nFt6of79XXp18sjuIwCaPoqEec85azd3qLUspWSIEx2FSISXDLnvAopZRSAgS+73vWsSx5UwX3pI55s0zrqbquWw/IMJbWxC07V1wu78Y8z+2ZRfSS4pk3lLeUCdcNiWU5Lw6gKIqiuOfBqSuHuOkAQrBjbhsRt82FfkvTr5dHgA9f/6h61R02jbvOTNeu5+Ve7T88VyVp6uVdxdjygqp4yhV/tlYdxaYA/BsAjF9HmdfschcQmqhnrDz86c7A9qI4jorCeAAAgJYAX9biblZ+UGVo6zIvGsIBABhlQjLGHU93DMYkX0QiNE3T+o7lWmzdHvq2wyiKozg2nswPQggacc5vJqlCSiGFtCzFajjvmdhaA+ZCtFIKAMNyIr+pKSO5V/shbWwToJdSCttLYNaw8T6y9Fxxufhb3/e9gtiaNrT5CwPuLBjlLaWei23XXbdr62CoETqKY5wVL1/spgMMwzCU2iqjc7th3FTPP6WaWTHGK5nCSErPq52AUEKqql647pGJMc6b4vvwwRerqx5APCyfeOzr4xVF9UdsdIxg+AL/LnL1ocO6MXcDBVc3lH5gtFwHZJZ9aULv15HJ9kthAOjIsIIIfX9Whq6TI/bT4bjcF8YppZ6t2IQxvkaAcRxHjH2secmFwueFRVHsR1EcHWrkxIxxzrm4maRKKVspRGSq+CcXgxCAB9wIwYWQS/RksmYN8ZvKNQ1d1wFkSwmJ+eTNGtZ/p96t08JFxeXC+lZKaXv0OGqao/dd87J8MCGaKmSZ62LHXc/ZSynB8Xd4VJzYt6l4VXW4+XjPWrIX0yWvjPPmuYjDvn/JQiqvjuQ0TTCPkq20mrqu63PXdWx62UA8ofMu6ltdHC7Svl2KseA5yC+wSwOj603DmLuuUTxkKH1PiWWs7P3zPIPyxzn/GXVdBzA1TdN0zd7NMPecOPq8vLCMMSYZy2zNKSilbAk6naTUT1CvWejnh1uXGMVBGsURK4+m48aC8Zbz2w4ghJRSToYqhZCDEAz35kHKTkoJ0LfNZ1fQqiaktDtridlNw0mBtljOGm5uSnW82KuhZClFU20kuKOmOegLJS/rkmgaLs+lgNPhtKnC3ghHxQwSqGshr+LNTQdQFEVR1Lcw4AsbhmGoo+t/vQoty/9ciMGdR2sv23zl98u0f7v1MW2AOQDpPrE6ibExd7JRXGwovaSFcaI+BJi6x5cPLojKKLLnujY/djNMA6+fp3aphnDOOKOMYEWlVPJVJYTRJlfCWB35z+km7iCKkiiO7T+K2vScHWeCxu8sTctyzw2Ncy46xoTf9VLIhbyO5OBgKYu6tE0wsaQ5AaAkx2gObVcZ5XA1J/CnxhpS2voO81HTLB6Ul5UZxihrGp46ln0aeGuapsTqnSNHxfDhuSDkeprxpgPouq67p2H720iLP0suLw47CzLeSqMvw5G33W5N9mgiHSBI7oKOWJ4xd6RRPM9Qetpgdej+FQAARFPCRWhaEJVBGO8yZ6pHABXd44FW9um+MMaosNSGc8YobwEASIEVWRvqyIn/2DVv6aSiIAqjqCyr3LJsO+JciHcdQAghWkOrhZS9FGLbC9kuKQAcgbmoF82xNIFh1DfkCFBaBppEtcCT2C29NniPi6J2bRNN0k3UuZOCiUuBM0YZk5Smjmudxl1IZZnqyJ1QnTtCyueiIFdbjpsOYFl2hDXfsUV7S0Dt77BhGAYNIQN3f4FeY5tuNoeiafsBwLCCT33ue8bckVyLPEPpaa72Yq1wLmT8L9bUBwDH9eLd9IOOAKq5jyrrVCNhjHFBaZo8Ns1JJwxypHTc1tWRS7JCba8tSMIk7oqirLnt2B+ipYVwy4uFbFshxLZ9EkL0gnO+feScC9kCwD+eD7vocRSGPne8cHVlHGnxFloM4N9ZbxQQAACgtEx9ErVnqPMgaiouyQV6ThkTrHE87+QAJTa0gfkuWg4vn190CADgHQfw/FTrVT+0c1Lz9zWb/oL1bdu22PL3EGD8JwxL2maXHp+fi4IswsqGnrhC6oGrmD5vNOdeXdhtAQD+z1snQKbjhF9+HkYAdRdd1EhaThnnrGk4k4vAFgAcYBAE6+rYChegOb6B9yLsR1pVVnmJK9txzKjG6PaYXCeEbGVbApdSdIJzNkgpO/lGy/JsB3XuRYMtXRlHToq3PEw72zZvO0COtKnjhY/UeRCiKa5m7Oiy5fUdZ2XPhqOujC0rPF2dByGq5vh8uBqYuuUA8+fpPuhVOzqURPI/g3O+MoVfFtbaVjLipbMHZvpeqnuy7Sarnp+fn4+n4fxPv/+oRiO934w/yl6L7n0/fzuIc2Gapmkwz4oCumUZ/QXTD+OUieYROsrZqnoDT4OkjqmrY7+qXJyu/rS6LcJCZUkKCzvOaCzLxC4N3m4apJSSVXxmQopOSvLF6BoppRwA1v2MoZvKMAhWLaRb89PY0so2dGUcJX2r5vVRFrcGcgEAcnXuRWPZSJ0H2ZJrRC5rKJfkqXhZ0g7K1DOCbV2dB3kDkX/LARRZRZ6htM/FsarIX1cDGIe+pSXratH1a82e0qZyzZ0pwfTqX0zSAgBkW7JyKK0d0Kb++bP39GDzeHgSphIkxkle9wyoFJRU+WkF7aVsW2/njaDjIKzZCwcB47zJwYCpfFFREl+/vv4FQy+bR6VbPXgVFsqLSjpHOC0T6T4J3jwbwZraAXXucsLadfroNLS+7GcMZCpDL2rH1JZ5hMNt+r3FPgKxbtAcL3YYWlY5JloEWJor6ZVZsNrWuoslbXoaJK3sk15L1RTXYemNA/SyeaQN8XSlb0h5zMu/iKwHAMGbygZ1qs/iUkBJYZlz5EdTmxP3Im1UXl/ebGfyxKK1Bh0heN489IMQLH/+1A+nTWmytJgNZexFTWz0vCbRsmWVGT2wEXRTr/KiOheZelJhoAigOVb1+yGNkQKwMpWLWtNJWOhYYhP4aZnwk3vfh1cJMCVLUtKTYyXNdfpoFVha9jMGNpWh5Z6lw8+3X3xt6DdlLvv3EbG35P9OVrumMjRXS9rbxe3S3jgAKQBLRrGu9LIpT/pZb2yNk0p/cSuayjFXoaRVdAdK20SzqG1t6mrjkRPZvzT3iOwvGjFKqoSVberaPJ/e6NMWZBzHcYZ1dwoQvQAqWx6Uhjo/LeGmqR1j4rahzi2VpMzzl3GJG5NxS2hGhgGzWLstJQZmADQLO+oFg9E/vfwnMt2PgTLb1w58OY7wT1f/su5nTM9UBkFsNHenrzYRUvqesfJ6qmMSykpL9vau/7l178n2vGdvHOAIDPXMNXWl72hdHg8VgB9dHXIKlH3f0sfuYj7y7VRGaerQ8cLWpoEh1JO8vmju5fUFjYRzeN4lXdd1bS/Xncc7NyF5AVQK4mJtHrslClZYn9rCMdR57IUgq5zhe7ZLA6PrkIFhbtZuyz/+4y+OX22eZ5gUKMe/uj8yrOBT/0fmmcogKjy17PTV2EBK37HaMbXzS9aJ+tgBAJDXMo5aHPmOpevKMHSclQWDuyz1Uf/r8YsVjzXLXtUHycrPAPFum/lGRw7HH0e44QA/pKMPwjZ0pe95U5QFAOyy4LIeeA6UTQnqRI/vjm8AHDQYBMWmNg0CaWNTHy6ae6cgCQAA/LlBd0nbdl3bdb+MkheASlEXaOo7fli/bO6YhQ11HvtWkvp4PAD8wy4NjLGrD00aBUYnyOF/X06zhGaEMYzl60l+APifsgChri6Oc5oExtDVx6d/BgDoW/roA8Bcixbgf8h82+hqwtLAQB0lZRaYRleXx/94PhFCyNDvI9ao5t3aOlu+2rSQ0kvqYQ2GlzlSNBcAALIsrpeqbZb4voV0ZehbQWzjXyDbZYnZSxsA/v02DQylr3OW+bbRUXJ8+rJ8aMVjyU5FvazNz2BE2WabYnnUQRqEvnWAWy9Btkuti3fxeAqUGBoASg4A/2MWIKOry8OYpYExduTw9F8AAIanQdLKQto0tLo68bq82dwDgBly07zrFvulAwRhEm+2acVmFLlo7iRd0/Jn6EVtI0Odx74XrC7zHCBN94k1ChvMfRxbQp73QEto1gMMrSopwCaLPFPpeXX4ul4zRsIxYd4niTXI40ocQArwCwCYRV4vd8YSQV7tU4wEy/V9grFwX2eJD1+/Vb3qDtvGw+bpq7GPlJ4SW4ehPTnAUQduAAB0pLpeurN9Gnu2qStDJ0VhwL9Aku0zt1/0Q7abxFKkbdS71LIEy6H9Ald4LKFiKW0ASBw/2W59gmb2kZb//NdmA4P0LphhZfEC+F/eHpHtUmwIB8OwyxJrlEdY14Xh6Wb5/KYdTSNZIsAvD3P9IErSHzmdjWiTdsQ/SUSzW+ufn2a7YKyBz/F9FAhypt81rOBT93samsqRmAgg26WBrXQNVr6u1+yjGgOF5C4JhhpW7ekjUN8AgLmrjwB+euc5tQdKug9Q00CX3Pm4tuDV1uncOlsAPIYVfOoK30NKT0tzPktXAfzTqwTixdJ0n3i+pStDxxsMEsCPk13afSEOgJ9sN4FCzFnP9p5DG1ga15d4LNWXBDjALrNsb7N7luaur81/Bh3gYZcG9ml/3dXHn//p9ZfbTvBRmXy7fENAfbIgvfON2gI6Jvs0GGtofw1KDKLIdRCa2/r40grPTcNMu7Ztf73zxBj7XpV/L2a7Qw/Ur35J4m5gP9sPv5cGMt0PsXih3UEIGZDuB6ksePso3See0hbqklEi7H9CeWe7s+3epcOXciWK/r+vzo5M78GpP2MviD8g9tnB2P+Ei/41qfSr1hlCyFATn0vV/mBeAXvfNz9J94lvaerQiQIIBkCml+xzZ1Xh3mXacZZanO5t9rgqBcRxku3S0NEmSaoH8aVAANk+di3LUZRtIi0A0Jcrt097dGGrb2eykGm5m9HqCZHvvJ0I+5+MonfcwXH32fhdVBjg36ahoY2SsfL1XjLcplHgImMWR7h0ANOMk46+5nd9+2uw+40cf3SJEVLbxoYO8N+lYWAZMHSCMQ+hvjn+X+cPKLjTdV1VVSXorwvSRlYXQiG0GwCCKLmLNKotACfo27a7ky62ALvO5rFtbxbs+77vw9ayOsPxt48utj3XVdru9bE3Wmd/+/q9GtRgk8ozsDfcZb6L+rY5PL3dtHium+51yhVkwSDlChFZT9hJ8tO6n6TU4jjldbMyWvpBHK94rDvDW67di+893wJlAwOBhSzaCZL7sxRGrQ1vOx593/dU46xsyDvDOr2U7b51sTM4rrP5nRG2UAvZ2kglcUzlKh+3s802DT3TmCvgsG4reD/mpkFGclJUOe0CprUYfRKQQQgh6PueVnbXdWiRjEv3SWhjGIRk3DVR++5IyZXtP/98JoqscgJgWH5yb/ykK0N121JGHM93IfAcymjbtQD/LvNNNCwKf8t1L3hg03Js59F2bNPEVi2WJsCF3djPNNXzz1bb6u4JdQV6lO1SB7dtAR0qXleREfY998uhV5Ct1uKVh5Hcdgq8k0JN4jHP62Ip373gsaxk6y+3BJnugx94WQbL8J4OoCPsPdgrtOInN9+mBUNHvwTqQFlxQ4IDAABkyxhxfJ/02HE4pVJwgDC5C7WxbktTnfpLx4mibLONfNcYobJg3Vb0RcONUZ1EXtQvW81O1F+NTrTdS4HzusW8VoeS5C70bRgEpb3pIvpuHe3KapI/Pyl9XR2XuOy4tbUW0RmlDY8dy5mx41a05ZStqc7QvhTTpRBCOJY12HZdR5ZtYYyfhGjfmaq8MCHooXCNgFsr6spKPT+9852WAv1YGed0Zi0J6Lqudy0pBmSrTfHqPSxsG5sYx1KP/e95fiRVCQCATez5VfGUK8For5kyQgiN0usAxn7VCxjHcRyXl+7f/LxZfSA5sFIdJKuO+e2tNaWEsJ3jmMh1naahjFEAww5/M/qmsbSpE+zlzI4XhulmF7nG96W2ewSGlLE5atAACHIsXraatQ1UncqG5IvgOznLH6y2JqZBmtxFqwPogXFLLuyGdV3XHPhAqwqg7/uOdlKs8YeufVU8u45Om7IRYpkYN4YLHQfZCiESjEcHc8FsG2MshJDyz0fzhmEYCq3rOm9BXVm7LA2w/8ntPlufToWJi9J017atGc9uI+u6veD/AgCACmNsYvMu1pIiL/Jird8ibGGraIrv4wd/Lc1C39LP7gOpKhiJXBxg6GXziAFAv6PVC73khR2A14Y69LQpD7fVdimVTRO7XsQcx3yigtGlo4c/drREQ8vqCyI87Lh+EG+2dbUSO9zYVpy3msC9Rau9P+m4D8MwKAghCxBCqB+naQIwcJBZYjb3Qva6e/iL0g7TNE3TExN1A9AJkvc6o+vDo4xx1tieN3s2YaxlpFkmxs3h8UVSSkgpRI/xbLmFaLFjW6aQXcv/vIEyn2wNYVm2y5JQ03fP1ofuVJi4KE13kpRGYke0qb2io9ejKbmJTROb+KMl8jzPi+OiNvWCx+rOjTGSQ+ICQFWNMq8B9LUCjgHusyQv8oK+zQH+3z+9HEopbajnYs1zGsoYZWwJLaX9AQ2icR384gAGQoblR9X3mjTvTYDf8ImT9ZILbrnRMNueY//kjMnl/c2b2XIcbA1F+e55b9kiLFT7AfVnQVcGS8Yoaeidbc+290QIpWxxafPTk/MC4ZJCtlJgS7Ul5zyxbGwfOWVvyePemKIoiqJpmraG+Djb7NIwxKbxoWPauhF6eQ2g9mxz5F6UNHWpT/31GiMqx3Zc263Sx6qqSEmWusItPNYRjIXFu8r7+gigLxVwjPZ3SdLmeZHnf73782KMUtE0ietK2z02DWWMAfSy+Vp7U9xgA6GLPq6mI8NARl7/zsktLMSfGG9bWmesd2aUhKIhsm8X9RnSzLblYn2g5JI4Y7U/E/xQkeml9lAaS+yglMmGda47Oz2jktGV/vp6jRRCcCEDrFmMcd7aNtYXJMCfXoWu67prvaCuwjjOdmnoz5u5+9msK9jFa1BZ2ihK3/OCD8bUNtc7XzeJ0yhO4zD3Y9lKObTfAG7jsV5I3JufrFxGw0Cm+yyOYutHkeflMQf492niGx0Bbe4NjPr6+PQI/5D5SJ06cvhpLSRAlzRGlFLKGHE8zQFKJad04XjkxccoRYaB9IuQvP6geR5/5OswkprFkY8RmoehY7TMK9CyKHIthJRpGCQrixc4jWgq29I3mM/IM3+WrKpXPknZtJ5tmfrQNvl1rqIoioL+BJOkqqqqqOc7xSljtKHYnW3WUM4Yv7UNlG0rhdhi5P7BOefYXlKA1w5wo3VmWXaEke+eUFe+H8fZrv8hQcdSvg1gpqlx5pVuEG/jxkTXKU4SJ3GSxMnP+j5pZdfLpeJ5xmP1N9Hd4uuyBIyaEydJkkblMc/zvMwB0n2SYHnE2ixNE0sb2kfI9ompTjJXJmuXhuY13xillBLCMke1GyYYpawDOIDkD2cfPH9vdoELaL6VAADqbpPGvovQPAyCE8uoYLNNo8AykTINbVdbxosDVI6F0dy6rjqKY3EomqYCOAAzukb6Dkb60DckPxVSp2maJk3To8i38HsgC4ALJOzS9mCMUknpgw3e71QuK8BbE8tMgDF1nEvO97YlhJBXKkDvtM4W1FUY4MOCurIdO4zGpwMH3aob+WYbEcT3bt80hE6uoyN0/TijJEqSJGmLGt+3XStk1+Zwicfy8Q3aYePO+gI6QBIlURzHsciLoijLCTcQJHdxUNu2NkvVxQ1wAuAnd546EW1scbpPnGu+MUqXNNDWvO9NTRmnAPDUKi9tRLw9Ffh36QWkZsgBAJJsu4kTH6F5GBqZGwCQbbZJZNlImQYpnUs0WWGZ+iRrX1dHQUhxOFYNwFPr6gNtHQfr+jBwUp6S1a7rujbxN3+KSVJVVVVfXJUxyhhlxJqblVn41oeElFJwgSfGGOd89MNHIa8jwDuts6/DfdCrTnxCXRmmY/tP+VMBCMsbKMEgDD62tJs1B13LdAEApHGSJDH+kdfYSqVo10LRgsdKZg/M5O21258I/gI6QLy4j/lHXuRjZBDzACb2P8RV4aFZthvz0Q1qANP0HtTx58AJ9pP7UF04k1br2ZIG2mq3rAAcAIqLBx3r+OQA6T7x0FkfZAIAHMbpdhOHFpqHntbmQpC12UbB4gDNVXG9MLWpE4Wvq6OQdXk8HAqAd9vgfSdI422MDky/el0zni8a7y87y+XfGGOUNtwC3lD2TgAAKYRspXwYHrkUreAP1RIBLgpBN1pnAADwM/YMpX06oa6QYRggRf2tX9qJr7/JsILQ5N2s2fFz85pSwkuSOEmOx6LG2Exa2bbrTBSpHHOPJZh+E19esqIo5kObw1IKTpIkTuKnsuizTLICFgU+z/Q8Y5YsHGJSGMvf7hvZuIEVuuGH6bqlR5c08KFpqOQNYxPAacBkVhTtPnzZPvrJvevbVtd1J+SY7/txst3ELpqHlhVDgQD8INluI0eflUHm7WVxvVCnXlK70NWxlYQUh8OvcKusaZpc9UN1ks/NJSbpCv4F58zkvFhRRpmkzAJOBWO3AwBIKYUQ8gCCc9Yw9gNEK8UVGPSd/Yw6fblCXZ1Q+N0XSx/oW6muTnBphJoytt+Lsn6ltoAMNw5pXhY1tnCUDLLGAABN7VgmRH40ycO4XsA4DMMwmNh70BrgADqA5ydxElelSBIASoEB9C09qg9uUajOPfl5ILID6Fta+UFEYmYGYeB+vRIWd4NhSQP9nFaNWPfB49B3XSex/7Ccdv21pvs3D9vPNW+7RR3acnzPS3eokKDbaNETMrETbrSjnDXD6vurHtRxbHnlGro69pKSshAA8G+zwEN9qyK9J8XlNHVDCqzywFCnlpwwSQBwEZpXkprXEaBjlDFaUOgazii77WSTEFLSvIFOiFaSH/nMRPsLNPCFKcf8EnV1ntycan0clTfzWEI2XzxTU8aekPI12X7f0aKdmjyvMUZ1V5ZUAgCUNjZgxWOdiHWHoZeMt7E6aF/ZkgRixwuT5POigcE+mzoAKV1vnn8+EzUc7YnVOQFoKr8KgiBipeOGflXX1YWw+H3k6mM/TxNhTPJmAdVB13Utq5+T3wT7/JKEIIT0bDwS0vCl7Gaapol9L/n8nYJu41p07RJw7OMfdNYM+zU85gYoLtsnvtm2qqm3hXE5TV1aSOloravTQA3UN2c2jnNoXn/sqyQQgDFSWrMKU1mckKTzPAO7kg9c4U0wlU1tK1Kdu6Jhp1aAFvuR65hIg7FvKSNlfkVF8HiJujrXN1MTjX2DX7eDSA4Um5oyDrUsj6/os5rCnI1J5gXBaFAnsmL/ixc81jnx5oxxWqIwU2RpLr2AeZ5V/XntBrVLYRph1yXl00HvzMC2TTQB1F7p1WVSuzEOA3woSVW/uOEu8w0ttB3/JyEvC2bXSsEonmPvjwsNwL6V4osV2TNtXMcqAUxNR6ZpMl79AQbGJK/XKtJoBmNT9Vge345tvLIguQtcSTVXp/hqmjpHMPDa0tUFk0TPbByvQ/OrJBCArBDHCxLxvqU/GLmcIjrBm6A5HqFrAPrmUK3z7WaWhmFgWYYGYyd47Vnm1Wo1P16grvq+7w3DMOMYmSdCzUs7AguQqSnjwHldvsIUFwZQferIkWhTA9BUC5LzqJ/wWOjhdCjnTWWjvkbKIjygA1zN2a1/1XVd7yV7xn7XrSPCle/XtueFDTVCv65JTuqXklG2S7Fmh35PG8noifTIchw3SPbukbf85aYJQb4YoXrXuCbSdQDYxaqqquowDPLJQljmx2IlJdlpHm0I7TouAKwsCx2ElL4XVf78qinluMHHQH5F91oxXVVJxNMoGwfr6jRIpE6cvIcTfBMBbkAcm0LtCllfuONteBMAANjZJk29GHuGBmNHZFCaSD2sq8MyefB96AWtBcDSV2wdf+uAjscbvawfMqgMpCnj0FJWFtdLwH94ffRiZzyW9vByCZVjqr3AutLzfBGOvJqzm8qKrK8fQvZGxcZp19FUju1V3qb27AA9LRwg59P66T7QjCgoak4bxteHrWvItN3o+UfZkZfyODlC4Rrd4mWaMkO2T9bwoN5BT4/HwwGAN5WN0caRnFRYHTqAbJ+lrmEofd9YCF45ADJt97djjRK7w9eCo+IWsTb4uywwlK7xjY7S8l/gRgS4YQfomdGRtyIBN0zPduk2jX3fMzQY24a4GGkq/OiXkW11BIDua3+qC0gpmiruDAk6nj4bb6ao3k4x/AUbnnhjW/rKorBYYShj25i60kuylIKv5+yaYwUwdZLSD8nkKGE48oWytSFeUNu+FwS2X1ekIOxC+N7AwSdd94q8rAk9ywZruq7rmt7xH82FtMYBeOzCS0EQguQuQAAA6gNAX4DIJYDjhXFiP3aOG9jLTGCU7rLYNJS+LQ3oL7jzARb8RiG4zrruV8zhJ7OzbJ9YiqhiLFlt/gtcR4D/PvXQSxo29Cfa9yCJLbPHmgT4lCWLktbYN8f/CHqWRj5GSt/SKj9wAMjidJ/s0jiw1QH0iZEcqxoM3ROAlOSLWleAKJRpAAAgAElEQVS87V+AU7SpHUvd+S1o1h/mX2tmnu0f9mlw+Ym+Pv74zwAAQIhpmQ/TNM3lOiklfk4dtw1d6Tu6aAffmLPzQ8+a1J0RK07cAPYiChDEsW+NlbcneK4qPe0EfXkTOimk2ZV1URRVfRomuthV5fl5/wtP7Yf4/E3u9gcYVvARAyDjAUDhQLCBAJBpefHhO3XCNOuIhQEcP9llHlJ6hqF7nWd3Lf1GKdUejbOqlL7bpB4aB3J8eg0yNbM0y3aB0liJT1Zac0VRxjzv2rZfmOwuHOAMAAiSOx/3DTBYmMUBAMa2AIDNLk0Dy1TallhI/QwAUZqmd/EukQcxgG75e1NVoevEE0BtQ6HKY1Fd7OZIZZlqT6z7o6zFqSf9J1nk2aJ0n1xWOeUFBXPbpkPf0i+VWDtk/MuXi0Nvg0KR6aabhnvhLJ/87cQLBGA5QbLZKpxH+8fhbvqdEeelpitl82jObUPyvDhPn+4uCkHNH+e1t3opSpl7pP5Yemzg659GgPFxfQkRQggN8lBxcC0LGwA6Mr1dNM24ANm8ntAkBbSlZBo25NoLhTjbbmJz7HKQr9gotTTLsiTbK4W6S8lKay5ZARVI2rYAYXLnXjjAGQCAsP+A+0fLgoVZHABgWbCzbJcmDlZaURgL23wUx2lyFx+fiWlpsiq2mQpdKxkAHIAjtSOHonypS5QmUnvqbv3quW3IspH8syzybG6Q3F1OLBLgFy09wZsCWClvCBwB6ACbKPJthOa+O0Uv6Pu+42XpobkXmVktyAFkWMHW1rA3bzzIPXzZ4CE5mObctgU5HouTW2e7FMOp9jS8JF9rCVDT3N8KbQIYhqH/DiL8NgIo/Voe7Pu+751EabpxWKp1Q99yLsUc3lHrTYg8QMuNjukG6uslRUZ+mG437kiB+f61AyRZmmWbJDP1MdvHjwsGsbaAY5BtTgCCMPztJRUYHk9sCwgh47cnGxsAthfv0xkApscgAAjTbJdGWGkJ1hcMmx/EURo+/2x3gaUNknyf0k4KRgDgf73xDI+6OrbNRwDgX2WT1/AnWeT1U0TY//Tyg+cvxWWzgJUmcGJ0khwBwjgKbRNB3zVVfhCgA+zTKHANNHctsQ31MwBAJ8m3htSWPo8jxYQ3NcDQd6KuG1Af8hqg5/I0AAoAcARmorlvSXUBGUnSfWKuDe9LTNw49K1suZtZDRoWzbYvVhQK/gMAeMW7fgDoO9EUG82jMjQObMGu9Pybb6k93OhtvZFmsS1se8kumz57vmNFl+0ZyNIsTbNNnJdphnK6xNsDSIJgyYwMK4hftMd/OBf+droOVdOtbAZATVAaAEGYbLapMU2VPogGAMD1vCgmz82HrVv3ul/nYMSMvhC7vrKDMnWtOXRfB87/oPXxl1nk2daHrqqqqr/cYeUVs88lNH+XJqFnmNC1xEbwO+gA6T6JPIzmjpemOn0GACBHkIXMTX0eNQPLnDAAIYQQ33UI2Fx0wGV/yWzyf9y6Jj9J957rsla2l86y9FBrO/0gn7mJAGobql0EAO0PgLbJub2lwEhlab3/iXT+oaCcATh+stmG1jz9lVmGbWTrOjKcDQtKAyUBu6yuR2maZWlWPePM/3Fc+zz/7b+9HNCJF0V07dPNL5jGQRQAAGMjOwDbcaJMfJ/8bV8v8QJjy9WrIo3d73mvWxXT/E8uxhgAkl3mWwh6Xh//8/mEz53iifp3c2gY/dqUv8wil18wTXM7j+MIMPRtc9kMWUg2blq6T5IAm9DxwoDhd9AB/OQuClw0d7V1omk8QMdQX4M+j8hEPTmUAIaBsP+gA/j9Xpnl53UT/wtDppfeYXiuhZSX/U3BGlKYauugJTIQS9cX7IpoAfTIrY1/gco21Z4Fpet7ua5pGoBpOf5G/tHpD+t5nDQMHPO0EPWyPrwoee9PebwCAEnQE/PCAVw/SdNMHIdt+nw8HIs3QNfadz+f1rf97boubwokAAAGSikAMh1bO/5od9h1F8CQgW2LU3Adkn9nusUKoMyysQFgRdk+sUxo2VVzqqG1DaU5yJw0X9tfZpEAADC09ButaTesAioXp2pzwgD+5zQw1K4+Pm/SwOj6+vC/AUCQ3CWhb0BXY6WXCyrYcD9EfqfMLurXGsr/d2PeUNMNw0AGAGimMve6rusaQHi/SwPU1+T49G0C0OIkDkx9Gurjf4J5nqFlrD4UhF4SmbSksgy1L11EaNcDpJtt4mCTt+0eAKCTNgB4LuKSVY4XxJuuMjGAruuGmT/r+zXfdZdxuZMDtMKGFwe4zOOT5BLICwDYdqPM+H6825DieDwcjgBpFju60fNFwogUYK6n3d98/AAV1kdzeQ5FswThvqcyHk6k6wghJDrDsGpJviIshdt1CwA4jsPkzrOAkysBr7EwgGM09ORQtnCRRaowz+ynf5FFAgBAbUNbyiYnABUGdrUNJMdqGUFUhQ3TdpNYJ8EhwwruY1+ZZ0dpqQOgrznZV6GkG/6qhnJl49DJ+gsCjOXvAE2z5ABBlO4TLIMCWnEEJwnTOLb1qbVhddGe8vJwrMjle1SYujIwByNZ580y2BRGfQkPAADQEeCLPvpIyzyg4GOMEcAwDJ0MdN1aV55ss00T3zk7wJUe2kUenyRwCeQFAMnKILT9Rjam7XqUNgDZPg2Q0TVY/QYAR6CLNNi7zx8O2rzc86FvDov6ue1tB99i7dJdWgB5qqqO49g9oz6cpmnZFQdhHIa/WQp7vB6BIeSfL//3lEUmkTLPHT1cZJEAAHCEnhtdQ47vjTUHyV2g1iDaZJcF3YUWvXbgcxqzYu0F9G3ztW6k42RrcpVkUWAhbewFKQ/nyMlpfYQS4QdQ5i8gm4IwDuB7QXLnEw+o7I+wy+IoiUN9akACkAJk2UteH1+xDPQHZZK1i1Bf10cAZLrbbVCFK3pkkcZxXfdvA+0m1TSMpRTZCVYfPKt78hYwcZxtdkngra+qwi/xCac8XtGUNLnM4wEAoGFt84zi/sdhlw1D3/VLwooNuQ6G/ZCLxgXs5hnkzTH1q800QNcKUm3x5ABpFgdYujvDNCmKYnlYihWhCZBEfpSE+0N92VV6a2sWSdOwnrTMnR5fZZF/Kkl4YvfVTXe36VYNp07UT4JybKXLRI0OQHIYUKwgmy2N2GSfZoFraGPHalODkwfUrgnc8B6UYYL5S0fJoSQAjh944UfyOdjOLUC2S+M4To35q6Dr1qzveFO9btmLq9unqqqqEPWsyIwQAjCw5wS8m1TDqxoie4CG5Ej4Wkc8TtseIIzTzTb1TQ1gGDT18WprcMrjg6yGV3k8ACO5rhta2j/pu7TvOwEQxMmdjygaGADAj8bSNADI+rY5tKT5c5QvJaWlxza05ZEsXdKu6zrTbDqB7QhrFilM01zQ2UGchGGS/3wumAQIs8i1jY74aJb14emlCbBmkQiA/9CyT5VdnbPIv2Yndl9FUcCe19tTW9pQCitAsj8NhtQRCtK9Yow/K9a2AFG6z5LA0MaOWNrcnhyAH6CtPatjj30t2q+UlocRQEemGwQsg4m7i+xdEiduWRfoL7joan3LqovoveDmOsklwo4y91Wd04YAlFgbvULrpNnyogFw3SjebFOswe8/GP7t+pxrHq90jAJAfy1AVmJdR7qup+1B22SsWAZ2kzvzma2DYQsE2LRJbsyFrE9p4jzP0EyvAVkAAJVjah2xoa1P7Le95HzvVZRFqTpoVg6hhyu+6E75adz8PBzyZcI8CywsyxDPzIJxPAfqJYskCQC0rd9pGjllkZep1lOYhVifenL88ZfG4Q7qxP1NlgZNI9duoD7P88RAd5Kx9gOAOEp2WWRroyjR1L48maqjwccF2JbXzR8NGQHA0Vshfg+ttjAMAOzGH+JYyF/Br99aUztXrI/0SACEoJ8DU1PmXhByzAnAQZuYj7S+03veHAAsG/vRJgLoYH5+9fxPeXyaTM8coKP8Mt066EsjSi+POrRLmUvXDdcjNr6MFG1pImBGR0517H5JvG8MHRSGMorSglZW+ULKw4WkMqorF+39QdM614/amgoBoOs6aujz8+FwOAJE2S7FLsGJOxfKOA5Pp5MvWeSiO6b7cyu7UxZ5mWq16S519anNQdK/QjiKkBlsNttNl1c1ZQA6QJqgSqlATz95foEAwiiKdpnTGdzsBb/oS3KuLo0jVp875H6yM3JVj87KFSqu84/rBy4cVf7CT1+zPlJyACA5eKWpKXMvBcmP+Su5bwBApm05Ady2JY9PUwB45tC1V1VQvniA0Gmu0LYp66UayYfzYNhqx+N1FCM5yFI0N0qqB2VqG9uAXpLqeAAAYE3t2Hd75XnysNrJJtnb3wlryDKdZVFyeD4cDwBukN757gFt4l6fxmEYTvSA61gHAESBPv6s2DmLvEy1WJTexfrUAHOtv+IA2Xaz3Ww24/PzkQxwVg6d2YiCYSkgWV4Yx/DYGZuY8Wtut7cdct1w/w1SXSaHaQKQrLSgcdcAcOWov/DTm6yPR2A+Rpoy972oSX6DVM0wDMN4h+p/yePTFAAAnnnfXXdwia7r+mToXdGZbZuXAJ1sikmj9NcjHUfo+O12cFm+pvwntYOxsdHyY47VoY2S8JAXRU0BmgIss23yw/OhWsu4xjxsdnTB650cYMUIAQDvXCDPpX7KIi9TrSqK4ntrejSNX3Ions1PttvNZvz5PCUmUAB9wehNctQCJOUyfatj9/mJ+HiD9XfIws+maZpiThWpSCMAasdUxHjKUy8dtf37/BTgSfoO1jVl7gdBX1DeF/bL3n28XesA81oHuM7jC6TPTNeHhqG+JUcAUmIgSlucVvtdFrmG0rHq8HSx4P8FEqmXr7CwaahjaodiAN3y1B/HY14UJcABqIV6Wh+fjwAw9JIyLxuEzIZh6F962UsWaQJA++XDh7Dh0ymLvEy1Qj+K4u0fhoH+2jikZXmbrVLhjzA9+gGADqBpmpopg97/LJpWrnCgYXi2h3X2/qpbdNxdBfO+bR6dqW3Isa4BcgRddV6OLx21f+Wn2e5Ks/ytvZax+TttrQOw49i8rQPA2/WkMIDZSnei10uyXeb//7y9WY/jSLM2FiSTe3KnqlTV3dM114YB/33fvcCHDzDguw824IMDn6nunlol7sl98wUpiZQypZ7XhuOqR8PikvlkxJORsShcnSnQX61xs/Dqvq+NW6RIIt+3tWne9cDXJA33+/0+CM9hREhOAvGhe9sJm67ruqMNmlikDQAwxtjO8+HAIpdUy/Vtx46TvG4p1HSS1UoRZVVV4REAEiuSABBAU2Uvmcj3bRKHh/TrgeeVY7X49WnRZqXM0wA0ZairLNhFADvomqfTJCyAqq5xqjjrnuX/jlzmRyzkcJ7XwxNc+AEosoPalLi2mCrGyo63eXB1rgyhq7KcDdelV7deG7e9KHJ9W2eGrgjQ1SSbEHBBgfI0kBES/e59/7Dp2uaI1JlFEgCAUNedZDiwSFhQLcPxHC4KoiTLWdZLWSbFtTWZo2CHpGwOfoAyFPm+LZIpGq+uqko1nmS1rNu2PT8tWpOOPeS6OLR1lux2AFEne4sHL4B6hlNVX/csP4q43biGKrVtrkhim+7eXw5zfLHWmrqu65pRgZp1nmdsN5YpQpunu/dldOC6kqSqm673aHEZ3+S6kgMTrkuvbrw2bv2O67s2t3VFEaCrqzxKd+FufwHZWBVFJEqKW32KT5v8WMPowCLfh6BrUqyIpnpgkQuqxXmW5b2FSRDG1OItSESmgTVVPeCWZOmPCQ1DFk1h4XtoiCzyfVulyX4HUDdVFt/zrWjskrysz0+L1qTjf6c8dCEHoOpnOBWEZc/yRWyZt9n6jqq0NVFlqQqhzuZpWq21GQBFngR39BOp5Xnewg8gu5utb8lQ53toakb5fwBJlmXDexTeMlmWFQAWXO2lVxed2eD6vWsrK9NFRYCubvI0iXbh5QYS64aBDd3a14bRZwuf04FFhhEpxbCyfOdzZpELquXZrptGUYQ0XaO1DDfxRhslzzy6jxINwhkAdTBlB7+3pSaJfN81WRLtAPLE0JUeK/1bGEcpOT8t+h3SMTGuBVCPOG1lty9n9X3sWX464NAdz3/wsNYWRMZSBvmx/91qrQEAQE5IpPKVxNH8qcvzvJMfAG02rv9oYyhSaOrhfRqx//lCvwsCkiQJi6Eii0gAWMG1P8YWIGfp1b3w67ZvNcl0XRYF6Lqa5HFCi0h2Np6/8Tfxrtn67/uMHNfxkUVmM4t8PbDIBdWyHUd+DaU/MiiylAIAfSNWo4TJ0XDtoJiPOYY23QGgC682RLoqDSkW+iwPgig6Oy26Tjr6vmvr7G1Iq3YF1AmnqfbV1ET4CdB3y57lqX5AgGkYrv/gqR2Juj/E52PUkaSt1hoAAKSJJvN1LHH99vJFFud5AEc/wGaz2fjeowX5S9UMY/cyAABc6ve+75qmyYRDJMMKrvoxtkDDS68upbRK+BvOOWz6nu/3u3S72X3u9icfA5tFLqiW7ThJ6GrDzzy9yHwEAPiRmfZYxbFy2AWdVyKkKNBYEaHSFaGv8mi/j89Oi66TjrrM0wCyMQtXewLkOPJrqD4dohCgzJc9y49nkIKqmwb2H0FJzdopBUEQBG4E8BzdXK61eYBEvk11icP25YuczvMAAGY/ALY3dxvf9x75t6qDsS2zGGByhKz1e1PXdbavhYxMkQxLuPKn2AKEll7df7MNNpIUayPsdr6f7faTc3D+BCaLPFEtzXG7qPfuA/PSBAEAABfG4tikfd+n9AMNCgB2AtQZFoW+JWm4252dFl0nHX0aKVDLYxWs9gS24yThwykKAdpQmXuWSzzPy9ocwsgLSFRMIwsU+3Es0rRqu34EgK1vocVam5ZpIPJ9iWXJpGV9U1MlVN1w7+42bth7HQw1wWYyAsBSv0/DX+ZpVpTG2LdVVZYALuajGa6FXQdo9g8KaOnVjc6ODM3tKl9xsjeXP3ZNlYRotxeker/b707F3X+HRTqu/RJubZOpaTjuWRzbYgj7akpMP2fBFAA055kUy9Mi6QbpCERoiDi26WpP4Lhd8m0RhQAQiwhxomJzIBlWoiuTWR36rq3Ksn4RUyxUQZbNTRf8B0/m57VWKG7/fwAA7LihSrG4rDZwQwQkytj3s93Q3/eZZtmpTgBgqd//EwBA3piKqJj32nMoISQAON6jwRMYVBE9QSbOM80pkij0DXBdkwX73dl6ENx1vmLzAgBw+SNJQ6UTyY4v62y32+1O25GbLHIE14lDx0tYDnEAgPF5bKtB6pt0BxQW/DvxdcvTIu4G6QBqbWDXfhnQIgoBAKqOV2XDuo9JpGOsTwDoy7KsyHM1PEjtryoNgnQqd+R4jwbPoYx81o5zmID+vSFY3/oXT5u2kuLY5mmwW76OIAiCgHaf6diWoksSeWITSzoCACDd323uHFWU+n72NViO840DGAv+CWA3zIwFG4Z+/ATlXAHreJ2vmKolTAHcyx8BIk0GWazDTq7rYLfCEZNFHqgW56CP9mGcdTEjmKd5aZsB9R2JaCz4BABpu7ExOvlWh/YQsrg8LRJvkA6ajNiJw6hYRCEAAMbYcExstQbGWNfDaVLLPA1AFp6s+5js34J9MLUTnyZgLPgtLCZgDFL8RHmev9n6jiqPdR5K0C6cyH3f1uQvKP+Q+mcxi4o5dHJJR6a/v7+722wcY1/XU08LUTEP4SpQ1YetOv0TDqJq63xFVS0B4PxHgEiGXBTb2Sm9W5foYrDImWrJ36wwvDffYAQAyWsuA/mmFMQfbYf6vkguWfCvBQDczYOP5QUAqsMEL0+LLkmH6jkGVkWRH/q2LUgcn3TYAagu+ohel1EIALKuY13F5vOXyFB0w9AnEKexAvmXP+ZRjcpkrm9KnQCglPkHAGz7m62H1THPZGhKcopFKfMsBBk9WfcxeY7i/ZyZEyzoCACAOyOgStOqqudwVs7+NVnf/lAEjvEJBxHQOl9xGq7zH6nNTG5Kn0YKJ2iuU8e2FwUYABw493afUhDHv2uh7xsAOGfBCwCopu0/uMoCAMeQxcVpUbc9Jx2W7/qGqcgSP/RtVaZ4kdk+AbX5ZoVhHKBFFAKAjg1dwbiNFGzaqa4b0+gNOxnfU0f1cgJYouuGu9l6ypgHUBNdPwEgjRQgX2d4JfnnzNt2CCEVD0U/8ggAwHHdzf39pv8IkiQlBztXko95XOZWRIxPOE5St85XnALjxWH5o0jZvwCcx41TvJeKqpm245g/8ycJfQdcfw/78Pw08JSC2B0+4pwFLziAaRrY/bIgVP3PQyOGxWnRBemwthvfdU1Flfihb/MqXh4fSwI34TSKYnEZhQCg6zo2TT0vijtd1bGuS9OsasxRvZgAhnAq1nW82aaCxWW6vshfg3GnrOA18/bIGkTFtJ03beInpuW5m/tqt/sIwqRSjEOwQvkBADBUc+oZ6xNmqZspX7Epp3zF6ZTH8dzxhZAKnqVUuONGam2Tddw4xXuJLdv1bNcJkmHIRRhBQJRzUUoKon7Ggk8AkE3TtLVlQtTeOETHnE6LhHPSoW42D77nGaYm8kPf5om2VESu60w4DeNqFYUAumHoCsbmMyEexopu6Di8OapnE3CaV+CAO+6OBIQkBevpT+kPTZfXu+Nri5Y7niooKnbc7vPjc/cZ2WosH6NVyhgAmirZX/2EWao8DaGu/5D6l9dqHySTKpnYDAYAMCc2Q6ltso4bp3gvVc2wHM8Zo2B4lgAUrfw7uSyOSklBdDxDQLvPtG9L0SfZAgCWiQ3TNtRP+PNlMnrtsSvS8bRIvSAdnrPxH3zPM1WJH/q6iJ8X0ZcnnCbBdhWFAIauG46JE0JIrpsG1vE0etdHdTUBADA5Kbv6uSvz50Na+JyJxmkjf9F868ainUWUZQXvws+PT/kPtVDhPw//w7YBoMzEFq58whEAkSzr47RJCN93u7ADoLEZSm2Tddz4BW+b+IVu62EUk1AC9QnGbvd+EadESUG0HOe+Hi0LoG2R5eVHAEiGaVmaZcQfWtpMxrYgc/Wk42nR4yXpsD3b9x98D9KgF5Cq7pfJ+SecRvI6CkHSdawruhFkmUG+6xhjrONrwKBMAAAANHWZRYDGCLgxnCoj9X3XVln2pI99nq9z0m4t2lkQQgj1fcV/URU1OjVFt20AgGSKLWB+wlFE7bRJUMfyOD1nbIZS22QdN37B2yZ+kcdFE0XvoqQ8Nb+GtMrer7WiPLyTYjpr/M0AMC1smJZp/Ig14OBXDwBVeYiOmU6L3G8U0mGYnuNttnEQl72AdGlVOuyE0/1mHYUwq2KOEK8mCTZUjHWd3BrV1QRMUmaxAhk/Fgk3kqndHxQkI2UWPIW/gpTkS4f1rUU7S9d1fSer954g6ZLQzIxDdSwOAMZ0UnKsTzgKe5OwZjOU2ibruPEL3gZQFlmiAz9E4b5FX0NAQxYmJAAAb+tbiAcA6PuuInkan+e9neFvAoBoGpal20acTYv+DQCa5BAL+1ql2vYrlXRgwzBcN/v4DLNeQBiRYFE67ITT1FxHIWBdx6aJS/gOwDWGgXWMdbG9OqpnEzBLKEGl8mMtc2M1t/8VBEEQRJUfhJwkyaLC4+1FOwOgqYrMejQ7QdIXDWx44ABgnMNrWJ9wlGt8Y8lmKLVN1nHjF7wNgCRYmTrvBZGnQIqGKoiiFEB1/AdPngHQlnkWa/vzaLo1/iYAmKZhmJZp/5jWEHoCgPLI59qPwWaQDk1TTFN5Dz4+41aQNFSH+5Mn44TT9CwKAWOMMTaRAgCgChgrOsY4uj6q6wk4POOiROi08nTj+UtiKLqunMz8zUU7S5GTSOG2XSeIZXcMpilnGzsXCWN9wgkA1/jGgs1Me4WCX9Y2WcWNz97LfvZeAsCMe4Ay3n0OUCloaNNdVAKYtuM9GjMAqipPsCIKF46GJf4QAAAyTdPSbSNOUwlgnNJvE645breYpEOWdV1Psmj/sSsFVUZduj9ZohNOz6MQdIxVjKv5Uks3zHQCwJVRPZsAprBX3s1FO0uaaBLUkcT3bZUlJ6/DlPBRxWEK7E84vsZVvrFgM2kIdWT+yXU/gkNtk7Ymz18FP4+gmaPIof3GdZP3chqME+7/72W1JA3PXmuAvq9IYaiiMHYXdm6BPwQAYJqGaZqG/SvJJQD1OwcA41t+Sl1kkg5RlmWZVFWefISCLgn9Kg//iNP0LApBxzo2cPJeAQAI/CPWdazrt0Z1NQHM4DH2yru5aGeJFBGaTJP4vi3rZNEYNUwBoEmTPbA/4SBX+caSzeygrp5M23nTPpOZx5GiNR3nTZsy8LMQZPXJdt745yrer13F5yKg4zaj7yuSaJIwdpcdtBb4QwAgmNi0dNtM0twGAJ6/cCowSYcgCILQtW1b5W+DJgr9qhLHCadnUQiGrmAskvQVAOAuryd1fHNUlxPACh67svJuLdqD7BG0JZYlvm/risQLct0BwKjU8pVPmOUa31izmfdWcA5eiOFkkE5uiT0Q8wk4GaB/icNpfV0Nqubsnz2AINlupKCxqS/O7Jb4QwBgYMs0TNP+lJ4AJDGYArJTclK1TNLB8/wcPDyOA8WcMgRj09SzvMgCAFvLyKSOb47qcgJYwWNXVt6tRXuQHfR1pksi37dtWSziuEwTAPop0Z71CcdnXeEbKzYTM9zBR3mr7o8O2njqr3AjqLrM3wEECdsbNNZVcbYPWOMPAXCmbajYNg3kAICkcs0rAEC1rEjMIh2nzm08D7Io9OWC6bBj5jHG2HrJUvJZiKjMiI8NRcc3R3UxAZ5DDx67tvJuwesgw3nSwPLx0E+J9qxPOHzhFb7xu2xmlvdlPnCfAVwJqj5I9Q6CZJXjtsnz5Lws0Qp/CMA0DMszTOu/agAA4U+A5hUAmnTRfZ1FOvq+73uEEJK1r7wkoi4/FTq/EjMvKlhP86zKyc9HkpM8wSYbazIAACAASURBVIYZSrdGdTkBW986Dx4zAK6vvBvwuiGqNa3Dbuo+y/oEODzrGt9Ys5l/Lsyg6uMJffWOZH8QNcMKzzvrrvGHAEzL0AzbbOMPAIAtgUnVdoOowi1pm6ZpJEXRrdblRVFsExkOCLgSM99W6Q+pKedWHGXSjWROnGaP6noC/AdPXgWP6dsR4PrKu7FoZ/m+9S2xzdO9uDFEaLP92ysAwLibKbEgy9KVT5jlBt9YsZl/Luug6hodVbV/f5jt7VB/ikb+MCeUr2SJPwRgmKaLTStI9gRgCzCVbIUyP65lVjYFQNO2VeEZTjmoPY9EqdK4fv6zazHziQYpP0RpnpOcZCFIYx2k5Oqonk2A4z0afFnWL2KmC1XAPWZTv/JrK+/Gop3F8x88pSoCXrp3ZahDqF6hrdLXY/2KKbqS9Qmz3OIbCzbzb8g6qFrA5qE2o+k9ThGSTzCQl7KqRlmmdAta4A8BWBibttUlcfpr3ALAyD8BAGTHktVXsikqEpqZ5ZS96Pa8IEkp38/H79K1mPkdFPpUq7/IYgUIGqeyRleAcTYBluN848aXjDREEarHzfAyvdi1lXdj0c7i+P6jkWcIpLt7DARKApBoUB6yZIep4CbrE2a5wTeWdPLfELlPw2MU07fUiKXdpNZV1fhTEmTpCWD8Qequ6+i90k74QwDYsjXTjBMSJxIAgDL5AfJD+1V6NsUkKamySN0OIq57XpCkt66YdKrjWldi5v91+ueKcF0BxtkEiIppOw0U+TuWhQf5e0oiEeD6yru+aMf5X6bteo/5J4zS/f2G+1WQDGAH9YlKV+n+yifMcp1vrOjkP5fN9s731DGGQRXRlyowFEGYWmuLsqp8M+Q/a4DQDKu5b+DFDRb4QwBIUi2zTJOMZB4AFPMOtDrU3KFnU0ySZ6GmiuCpTt3zgtQW0dTdZ7PxLevo0U7B3O5+h+/86/TPM2BcTAAAZ3dlURav41c4lsy8uvJY8Or7rq3SV6nJ6hZAlLHjYphiQ7si0ySA//4b776Wa3zjjE7+Y7E2m+3Gt0xTEQblzyI1QlEY66YGgLYuq5/a1+cGYEwr/liXai1L/CGArimTH1KTRUlq1uRYraeZNymMbIpJIlVVEbS5ofo86eu6mjrXb7Z3vmeZCGXks1a24gmijHD5G8KYgMApijJfEalrK+9fp8tW8BoLkmhQzr2p25pE0v09gHR3334GWcEKQGPnscJVvnFOJ/+xOI7vbze+bSiI79syiSS+r5vmDQDKivxlPVX1D4CepKYoit1F9fw1/hAASTTI+CHK0jSNtWO1niGatguMbIpJIlUWxq6IDPUpzvqGpFVVnSBq8J32rS2XEGWEywOA41qGriDED22rSGObhrv36z2Yq8hyyrJcTdDvMf0zSSMZ6gwg24cAaayKAPf3IN63Hx+fwdQYx3ItXUcS13ctSaNXgCt5rABsvkGhk/9YHMfyNtvNJgqbQZDxV5nvm6bK3gAgC2BjAcD4A/pmxKraVdXZQ87whwAiGQoMkO3j2d83Szad61xmUxgnbZ7tBOibHH/x1LDbxRUJ0vwqRBnh8rPRMGQJ8UPTKMpYhxIccuUZHqWyev9SluUKJeyVd8V7Wi59G5HCAwDcbYX24+Pz83MXAYC38W1TkySub5vEVF7hWh4rAJtvUOjkPxbd9Gxv47wFSTMIsuNvh6ae3T17TtkAAMAYINX3bCMrinpRou8Sf2iVLnhRAghgs9Gn88icn88j7XY8oSSEvs0bKMsftlqHr3G6j65ClBEufzAaqoT4oSklY5zTJgDYHiWei1SvzMvl+QiT6f92SYr9ND/SU/H88fnx8bnbAbj3dxvP0hWJ69vSmjDIymOdhMU3qGzmH4qBFdP29u+fQT0IejWIbh7iqYBkvpmvwQaSbc9Hn3G+jKG9xN+tzCBrs9lu1OrFdDZ836YpmA9HbQ4AACGy8KlSWPkS7a5ClBEuv+A1/NAW9SMEY3rwYLA9SoGqOsWyDDGb6VO9p/+TbyG+b9Ld+wlE3mZzt9lsrB3vduMwjkO3A9e/v/dtQ5e4vk0MIMDOY53lX6dXWvGNf04nL0XRbAt3cfj5kQ2CO0rGU2xGympLiTGHZMPWdvs4SRdnAZf4mwDA9vRc0+aTCMKyUtgQ5VchurERLVx++ZihKXK7y+b9i6wKa48SOq5ejisC7X7VqZm9PV97T6Hvym7OOeyrPdT9MXTe3dzf3d/dtx/y/d0IMPYVgON6d/e+rYt836TT9piVx/r/g0iSJGskJ+Huo5cHycxzVV1VeVYNDByScfK23wfhssnkJf4QwFVPzzVtPsmE/UOlsLqBaxDdbO98TyIvhED9LKVJOWp+m60fg2RrUz3vk7LpAHxHF7SFR2n8Yi1bpkX6mQr41+mfq5XnOyvvqdV3JEwmf2KfQmHjtizSGgDAsN37u/v241OG+3sYuzIDsGzPvb/z02pA2myXbGU45rGiMsgyMswZBOxtDvt07OiFYP6w+G9RkiQpqcsy3aX3VtM0tSQt+jLCuJMBxoHs8zgK9vuA1SgPACYAXPP0XNPmk/TdslJYVsIViJ40vcv3bSmaHTcZlOVjkPrV4lRNk0QJYOubInfyKKGnJpGWANDUL25JoS7nsvVN/uQ95bi+SaRk8id2PxL9qelKEmdhP/kBNu3n54c8gnffE00G0A3Lce/e9sWA1Las2+lLbLl8Mb8jvq+rXnP72TQytzkMLrP0Qsw7tvUPFxcIgiAIfd/3XZM4bdd1vXjw982XAsA4tBUp4mC/2wcA8sZ2sIJEGNqmyMJF1T0El56euDxxpCvafJYyX1YKSwCuQJRpUBaPkb84zt+Kl4eGgQE2W0/m+oNHybT6UoNFScZIVbVNWRyD/5lUf7P1ZC44eE8tbrrPISHo29C0ZWJG4mcHbU0ivfj4+JRGGLh9WtQAqqqYRrR/iwakDjG5utFhbXNYXGbphcgna7b+4eICjjv2Xj8kQRz8ffOlMwBqkkbBbpcBbDe+bWqiCEPTkESVuSP7RAD+maentclJy94mHGmsLCqFEbgGUaZBOT3G8zyv2plPphmqCoC/2RpcN8dIfjG4ftUVACBSNdUpuhkAbKo/3Sf5hEEV+bvFfTgZ4GEcmqrEpsKPb5DFmtrl5PNDAsiBJHEyeVjxa7p7ayV5KPbJlS/xnfNtzjZMABRVAMbp2MILMde1Ovvh/IJlEAZ/CslZ3gsA+ratCImjfTYtDM/GoghDU6e6zA/NYQOKALb+2tOjLLXsTcIBw2VPSyZEmQbl+Bjd8zz1JRByRVUlCcDyNg9c/fMvlaQ72/3CtT9X2YcQqJr61T0UAWAHSsz3+TUQjWTe8j688ADj0JSpEfJ9+wahKkNYFcGnBK0MdZgkU91maJome1fEoU6ubXS2vrne5jzqUgIbW0egLk/H7OGw8Vh5IQDgLOTi8oJjEAaSPUkUBIFvD/6+y3tN4voPvm0rCIY2w4rQ12QBgM3WW3p6vq207C3CQRUmRJkG5fCYwXM9dx/Gdi1Pj5FUy8c/xZ9ynXX3pmu9KuuOcYmuatp9OR8FMAMlDvfhX1W5tlb3kb+XMHZdmYZi15RTvr7UFOle6ok4N185ONWH4gONLYmufMlm68nNaZszfi01+A/Y+qYI/YnLcF8T+Xp45xU5BGGodjtIhiLLSjp1emCL6XoPG1sVYSiLEHVldiyrgybteIo8LzcrLcsmHFd8+kyIMg3K4TGe67lZECx5DfDcCMNzSx4AOPF8p1UHmqaqDrd4MKX63PE+8IZExVrf56MHDsnfYrGrihTg+fly/MZxHHme53nxAUlNIifsL5lszaGLKf80jab/4MnQw8xlcgtXGlBOE+baPOxdOQDMQRi2bnqDNvKOa+rKe1G1B05B3WqYBva2Q1iNgn6P6jxSj2FmaNKOkO1JONax2DyttSxTm7PJ7hWIMg3K4TGe5wnvQaAueM0k5QvDoZ+oiqp9wbPdW1efsyhViH+cFxUp83fgkJZvuyLVGAf0Xdd1PEJIfRIlqVThP65sdCZbM3UxdQ+jaXmPBvTxxGXEJ65PoaCcJkwAuFXNsiKhYVt20Yv1yOuea0dZVhbHDLbzgpoAAKJiGurzWzkKrmBoknTqK4kO2rF53XOFbDydaVmmNr8gu4s3ZEKUaVDmx2ie57yGQfDHgtfMcqnhxpoDgEDVVU0l4/zTstyL23OXapaiKat3DlmDaqjzh1/WGGqrqio1w4NRUKQEyitfMtualyBH+tPR1liW9X1sefKXSlL0xebbH6EIcHGaME3JlV05AAAkdkVibTuIRjPyiuULn3GeHWoAXBbUBJhITJ6HH6OtddxqbU1I4LkRgKSpa5xrWaY2v/DpL0eUBVGmQZkf47leGAQht+Q1dJl2xmXdxpqsaZ3YJFUL4Pp3llBMVF/ditzwe3a2+hC/WbV1aEh6WWOoqkmausVgjIKCfhLj6l58Gs3sl6mfbJakWpa9J/lPuUaP9jf4xfM8wMVpAgDQ6vicSZ4GmoLAU4tm5BW9f98HQTw7fO3LgpoARxLTbzaOlldNc8qZXp4FhKML58LU5hc+/cUfMSHKNCjTY2TNa4Mg2Pu3ec28M87yItQ0SPgh3ScA2PYebQ3LbdtZnHoMT7spHeI47qBzKDWGsqxIQ/FeqUZByQxFuroXn2VVz68pk8SwsiR9Nr7blvkrzusO4OI0AYASf3EBgFjTVARdbsgGNzRRknzuwzmG/6x47flfbrabzRjEZOE+v3UYxNTmFyVwFn/EhCjToEyPMRTtLQgD65zXUGQ374zjjJMh1wGyZAegqrr9zdRlNHYkQl31m6kqwpNoKlLTTCUxKDWGSBoo4mjjDZ9VXdM0V/fiNEmwERl/ZHaeONi2ojhOknRqFrI6TQCgxF9c3CxUZQG6MjJUgRu6PM3Dz10QhABguOvited/aW4emqmq6XFkbgGAqc0VNNTkhZB8TmtdAoAJUaZBqUhoOJZ7/7wP67tzXkOT06nGy6I4GhJlRf9W1AWnfRWbIvm9QnbCEy/qnrUjVdPQawxFqiQOZYz/jNMqzZvu6l6cJqmZ6FZo2qljO5b2K86iOAE4VMXM9LkqJgAl/uLiZmQnQNfkuqogbujyKs72u92+BzAefFtdFq89/0vLGj4+9rsgiI6U7RYAmNoc256vcoOzGbu8BV5ecgAmRJkGJSUVSbSnhIDnXPCa35euravsV1F0nM3ZsfJbXXRU5Ql4UbGiIM6ygl5jKJTQ2BTivRr28XsYpP94L55g3YiMb3aaY8uMkzhJkwigLCvyPFgyqro864aJgciHaparfPCVhNA3RYIlBXFDV9ZJFu8+SwBw/QfP0KetRtEL6KLFIC+MXdcDUszisEG4BQCmNr+mbZkQZRoUjuM44Brhm90M57yGJgyff5FnIcRF0SGw8W2H1STfKhj6+u8kCIM0PdYYAoE/1Rja8SMnKXPUSxXsb+3FLyQyzES3DNNOHFv6jNIoSVKAruvAOR9DbOli/peu4LF774/54GsJ25JgLIuIG7qmJEkW1gBHClS2oy2mNAqU5493gqJICLr/mn+6BQCmNr+qbVkQZRoUJCmG7T43hmrA6jF0w8ry+WNpKGRQDMRz3ZqUsQ1091zB0Ncki4MgiAA0oWurjGy/IzjWGBoHddkfb7yxF7+UNMG6EeE/LNe2kzgN0oQ5hquVVY8dpSg/QEZdGzcpUBYIrqJICE5QvQUApja/rm0ZEGUalK6psgTiwFQQrB5z5NeY405MneXzd/xHz7Y0CfEgXQLg8j4AAG37qx/6usqDdLcPAFzfVyqy65WxCFLSIx3gIurlxl78UhJsGAk2Yyc1IY4SEkdJxxjDf4/HwG/9aSC0tfeAoCmPALoFAKY2v6Ft6RBlGpQ8S/FPI4vCCQCnx3Rd14miKNk6p0tTkHPH9vmbjvvo2bjs+vMdEP0+s/xq+7rJ0yja7Q96FNX92AnWAJMePYt6ub4Xp0ibxhgbkWFstj/jNEySNAbGGNJQ4TtYV5HMDV1FNFnh+i4ncXRR9+EmBYq6uqnvNk1yCpRG17QjAFubs7XtFWEalMTQIJfrQFQQrB7TVlUFurlVek53TY2UZd2yff4Gxu5j+Stv+/HxbAao94E50ualahuSR3EMDD16FvVy5UsYo5lgwwiMxHz6jKM0S6a4CeoYUlDhb30Lq6LMDW2ZmKLO9W2eYEU4rwt3kwKJSV13yNDxqUMuuqYdJwTQtTlL256dRaz78TANSiRDkYhtChKC1WOqimSx3Up2z8mWB0lSVuWFz988bGok1TRQ+BK3/Zezhpf0+xwjbf6umiJPGwCGHr2IemF+CWM0+zQyjES3UpKmcZxkKXMMKahw/AcPq4rMDU1umorO9VVuqGjsz3TAzUX5VKaZVjfLfEF0QzsCS5sztO152NOarDENShz/X7SHAGRZFin8o171nGTCZ5imSX7eccbp+NnlKwiC0DZ5ILiq/Dv3OUXa/F1XM+qpevQi6oX5JazRjI3EqYZhgLGv8jhmjyEFFZblfcGGKvFDlWDD1Pg+TzURLor/sCnQJPdm6g6iIqeLGUZXtONVYWjb87CnM7LGMihMSWNV5vtCt/mxSdPoMwzTBADLwlDFPAyqyMv3gjAXzoC+73tFMRXB8Mzfuc/uGGlzynai6tHLqBfWlzBHc7WoOvYYUlChW5b5HasSP5TJ3nFUoc8jBdrqnHOyKdAkyqNTDaLZkEVpEsTSjnDjWJqubS+KApz342EYFGZ0QaRIQpebWOTHrkxI9LkPYwDXv7vf2Kbedo3xRUNjN4dBNRUhpie2gip+fF29Lv0+tCj93yU3jC9hjiZFqGNIQQUSFdPy8qIXbY3biKSX7mSoy+y8WQ6bAgEAjGNFdJPvq31IyHIXQNeOt46lqdr2spHeRT8eukFhRhfsEdfXeWggfuzKMs72n7tgjtPfOLoEDYmksa3zqfVdTrKAs12+Lz6GddYV/T40oenRdf3+WehfwhpN6lfTxpCCiq6t0izPml7efP0yvgW9Vn+r08w43+axKVBbZc9cE/YY8X2VJmG0BABdO946lqZqW/2ikd55Px6GMENpd9zQ5qmiIX7sqqOitRzXvb9345RTvkpjfYxwSkOFqxKJ74vUfG6WNZjo96EpOYoeXdfvvy6M0aQKdQwpqMjTLPtLIHVvSa73vH+rbdEwDEU69xKzKVAagsINUYQR31dVHJxaGCOWdrxaFgDo2tbbWOeN9M778ejbja2KbV6Z0lAnu/cZiYyMQYDhvatIrMmIH7u2InEWlgCgYdtxNy+7gjPaTZ0Yhzj1QOSaQkN8X1TpnO0N1+5DU3IUPbqu30/p8LAQxmjOwhXLUaRaLAoq+IEEg254At+3ZQUPAFVrSJJ07sRhU6A95BJAJqqI76smjYPjDhKxtOPVsgBA1bbO3f3Gk6ezCNJxooqzYz8ecerHw7mbrY+lOqtsZShUaOdFSs8YnN6dkkCpq4ppRuF7DBvJMs3w4PLYQVemCuL7usQA2epPafehKTmKHj2r33/Z4WH5GJat6bu2JlHeJGVzqGFPtVgUVLj+o+9YqiTwgAz9CQBGQaDUfmFToLdKFwFKJCG+b2sSx8u8ALp2vCwLsAYARdtO1EzP29ESjJma7RBSjIYUc0ML03b8R1cqk8rGQwxNOftx6Q12mCIqmopfc9sGqGpZlg8xbO9dRXQZ8X07VzW8ehdqLwaaHl3X76d0eFgIw9YAlEUWa8APSZDkc+YN1WJRUGE47oNv46Ideq6fXyqFS48TmwL9D+YQIJZ2vCwLsP5DiralUbOiQ5Jqfed/TZ1cVd2w3S96ptW22wpVfgg/beYGO8fogpYdMwtTiJsoTrWMuMVaKC9zFK5WVaXF3lD06Lp+P6XDw0LoowkAWazLkAFk8e6Qd0O1WBRUGBi7D9WPvB3E78nHfL+UNOfhB2wKxBYEQNeOwvmx9JlfkaJtadRMQEgURYkXDncVZd15jPTWtLPslFPvGjLX1pW1gYY0oyAbbsaKmQWYK9TOb9SXV73QV+sC0GJvKHr0vH7/RYeHldBGEwDg5SKFkWqxKKiQVNMQX9+iRnpCIgom3lSFF+UlWBToSlIq+zBI4dua/CXqj9C8jllUnDuHKNqWRc1OIojQ1lUV/qF1elIW1bGhC0150GNmAWDyt9ZHcpWR+eVojourVVVpsTcUPbqu30/p8PBvCtViUVAhCILQ1CSQHVnWNJxlgGS1afJzADAo0JWSrRMAqE4Yx/Us3Z+npOGAP4MKRduyqNlJNGy5Bhdz73fy88+YlMfMbpryoMfMAgBA27YtJ+azia+DqbkN1XHBThYCei8Gih5ta/K3xUNfZeHu0OGBCMcOD4xqUffbjW9KbZvs3t/ox4Q0i0VDRd/3vawYCrKdPLd8rgYkq29Ncb7AGBToSslWAMRywrC22leERc0WTxNl1f7iOt2zbvld0nFopjQ05UGNmZ2krauq0gyy7wVBR22TsR0XV5OF2pr8BaPLJ/GpFwNFjzYtWN/5X2TqK5iGUEfuA5+8VlOHB3q1KM32txtPaSsV2or8fu0ICiqaMiOmizqko3du+4gbQHKfhxfbQCqgrpZsBUAsJwxdnx+KZXUdFts82b0vtRCLmp1kKisvplHkPvh15pWHHEWa8qDGzE5SVWUW31WAe0HQxR8kZTsuzg4O74Ol0s5CkM2n7/yvXy/HXgwUPbqiMbCDun+yvvO/yOf7bseqFqWpuuk9+GabQFukdlnBjSr/V4TkJOBsj++K3Z4bbYygLwtSXZBAqlx6Z9f/m+WEoepzb+Pbpi5KXNdguSYatEsA3KZmWOxIpEKZw176amd5os8smqY8LKW9jJmdJM/SSENbpegFQS2sSBKZjovVwaH6IIufCx24B7L1RIkXIP1I514MN7eS77xxAMSQfTCqRd07mqLI+MFv36pEVr/n0f7361Sdk7YsVLgykfiujBMuT1QEfZWSPJ9Cvm5kEl56Z88BQHfC0KbEORbL6ioVFwnU5dIPwqBmyy/z7+5MNDgb6BJsx6qqHQBAUR6W92i8pbLB111ZgKgtLF6CNVkcKuzxY1OVedm0zHqGWBGGKpp8UcYfkcSP7ycfw1v9dPhn+RLOvYmoenQh55GflGpRAA++IYqKInt5IAjKU5vK+9tV/g83PCdtgcjVRYz4rk1jLicigr4qp4p8NzMJz72zFAAwuhxTpsQ7FsvqCskhL1W+cg7RqdlSHM/bbD1bR9DlhaZpqnpI0qcoD0m1vrd/bwyZ68pYGeqFBohUGQ1lYkiTv7UsSprjQidwfGet6XpPxIow9s1pTafLVKgrQchXhVItCsB/8CS+KcrPturFp64O4AYfXcgFadtBV2YK4rs+SyA1BAR9XWdT8asbRzbO/d3Gk5CYkc99g7DdDO9rHxs6OWEOvJZXhZ4+JadiWV3RbndZuEoIo1OzlRim6222XVCPInY1VVPlmQTSlIcoihL64uQZLz8qA1my0EAUhqYITZEfu7LMwiynOS7Q+p37MgnFoW2Ka/7Bf6OQbX+R31EC2N4j5gFesjZXnqDLID/no3xZptTUtUvSdrBKXV+mkKkCgr6t8izewc0jmwn/Gmk4V03P8Q8AgAA8U+HbujR9ri9H2ar7vtnRp8SyPffu3o/zUbxHYbwmZgxqthJd122vf99Vo2hvTEk8klKW8nj69RK3PO7uM0NZHHAF/NiWmaqJ/NhVdZrtIwBV6GryF9IfuH5fZ1FRgwiwemcHi2NTkfNT9KVcS3pnCd+XFXkWPIkryjRN8mYAAMs+NOLeAED3rOsAaMlHa7Mi0flBAgBYlnpB2q5YpVtHNjfxj1jX0KYEm5bj+W8BGXX+KRZ4nlsdO9Oo2VpERdfN1/17PCoVMhcbBZbyyOLPj4rfqO7ZpnLX1Xmsy+Lkb82iHYDjejY+fIbUF0Vd7GD5zpJz5zepaVK6BB2FXeGJLY7rWbp3Nn6SarnW8ZI3XRYBNhutO9apemrKVL4EwGbj6NKCtPHO9QTnC+Zzdv1N/CPWNbQpURTFNOLgNX907edtbsbrggo0ajbLHBspSZI01lXys3fUqlb56YgQ2MqjKLLP0LXb9nxTGV3wXcanHt45HLVGfCJmfN5CZz2erGPpK0J9cFMm8WmH1BZ1C+D7D57aT8nrrlpWtIiUzda3JOlA2sCXDiBhuHM35pr5bM6OJ2/iH7GuoU2JKKsKfknDR88NQk3VzlzhNGrWd90UjTIATBlgfd/3XerAnGE7/SlLeXRd1yXO1bj1G586v/P+rfEkm2iacuE+WcrFjsiidZf+jQcnJv5LAAC9qwGgIUUBYPqbrdUn70Qj9aNVpkChgRNIJs/z+HQCCcud6/v32oL5tOeb75v4R6xraFMiiqIIbet6Xhc0jSSK4goANGpWVfkcjZLNXeYEQRAUJIqC0HZHALCUx1mI+v/imyK0JKaRM8anzu/cklhrmkY8f+czsZVuuSOSHxDFTP/Og9MQZAG2f7rt+98hNHWQAkiKuXnofka/5Prpq1tS20XMIPlLJansLEDCcuea/mZr7bOpvo/honNQ3cQ/Yl1Dm5K5zoTn6S+BPmXHL+9Fo2Z9GilTNMo+Bmjruh5V3eVHSde0oMznyohU5UGR+ztPhjpVaOSM8anHAl+njP4rk+n7D1Z12BE1jsqIG7z94D0QUXrStW2eStV72xy6nCgNQvnbF56zWmoznxkkzx81eCeQ8CbLnTtfH+yaVnukgOom/hHrGtqUjOM4CoLsuUEYYI7SC+qSmsF+vwhGqOucxNaGt0dk20OWVe28EaIpD4r49/cYiohKzhifui7kQHOGLmVegG+5oOjO00pLH7KGL4T64LdKk77XdZPUbd/nb02x5CzXz+k5pUEoDJ6OINFMTbzizuWUBiGU8FRQ3cQ/Yl1Dm5K2bVtAnkeCPRLFRpJ8pQAAIABJREFUtr8YzEtqthaSkUi9e9SqEenaLsnJYaJpyoMipnt3DwlkqixBdTYXjE/tuq7jRFFUQRSp7wzLuT1o6ffs6/1pAS5pzOUfUR/8lql/1DX5LNo0KWryVv577aEAAODRweJyZ6Dc87eZySw38Y9Y19CmpK3LstRkPgjSra59FEcN/ruSJpok9LZmcX31GnxGyTG0mqY8LkVUjDu+5AH4b11J0tVKYnxqWxVloWKnGzXj4p3XFHWSaUENywV1ojF1c/lH9AeTMU8DsVPrKogSEl9TO7dku7HE085AeMSn5pw35Sb+EfMaypQUVUWSp+o5gC+eXWbppMHp4QQPvjV3jO/bdP82vXGkiMJQxBhxfZWmwef+tFW6pTxOwnEc99R0OVl3XmV8RlHXJNnkrT6Ki3eeZUlRa3ZFohONycrLP2I8OI8VNBK5bpNdGP2/mX/YbH1FKg87g77aXxxHsOUq/gHm1DD6NZdT0jdlToiqfRlEQ/6I8jjJGc4z0fUfPGUGQB1ANQEgEIWhzkOMuL6q0mC/292A8qyZuXat75+4piWpLgmrNk3UzyizWFPRnVKMi3c+flC6nluG/I9VTOX5H7HGb8ePlSbVHYl+q2UeWyz/0ZSS6C+VpOje6hOof79P+1X8AwCg37jmKKJieG72oWO+L/fhLsyymOE8MwzLezRnAGRw6GC+44amyBQVcX1dp2mw202jTtUXBz3btjV5bpYdth4lrqnySBGgOx3gMD4j1lVFHGu8euejrCjq78rZH7HGr399Zdzgt9PpJxEV87sUtn8LNff1YdO/lvFF8R+mXMU/AABiXfPlwTdEqUkHU4Q23b/9AoC2ygK9/zQQ35dpGu72ccZwnqk6Nszv05az/3nsMNFPIbMS4vq2JmkUTPN/oS/yGo7ZLFmZRcAPZH9cRoYhcQ3J1FNO4JVPDVUZDVVirt75/1O5OcYr4TiOE2nBMpTrZpC0VVU/1Fh57f7A+t3PPKVRLwaoruMfABDjGtPxH1xZqoLBk6EOoPoFAAnG+LknAeL7skqiSYMbZ84zeQMhICQphnkHAABBfApeGnc0dnehL9IdHLNZ9rECGQBJD385PhkS15BIHtuq+HHrU0NZGJoyNFfvDAAA9nZjiWLfprv3W9v989XwujxSpT/YcLGOZYTGrstJHCYwez4FATmOqSrXFvEZSKo6z1PdNNNW0fWCkKosrl6/lJv4R4xrVM1wv2ApheELhkNIbow1kPt6QHxfV2ka7nY1wHYjLZ1nxlcZQoCuqcp6atrTFreCly70hQoA8L8yrvbsPOOVr/JYl9nCuDI+NeSHtiJauHpnAADR2Tx4ithXASXRer2gLlYDWdIj6oONB9/WdUVEY9fkqS5xMUDTNE3tmXcGyD4rwpIGEkLSNN/quixirGfZMRSIdf1S2PifBTGuEZAo4z/FvwXOfOD+ms/WYwVysW87xPdtRdIoLGHiqCfn2b21hwYAW4ba/MQyGru8XFYmpR5qXOgLxLNp89efL3HH47tNnRrLkw3Wp+77uoixtHpnAADTsrxHU+wzaEqyAsDFgrpYDeoKALQHTyX7FBmNXZVHCjc0BbRNmWbGndSAbMaMIykaSAipsszFhpPruvxOynzxurdAxcT/QRDjmmEYhqG/7x1O9j8Pe2rqsfTEUX/luaAo/tPMUVeFdkbDOuod6qFGd64vuuP8XyZmp/HnR837yDSsRF1gnvmp9A0mp+mmZf0h9S91kejKjFD6grpYDStdS33woWoxGrs8Vfm+LgrIsywLeNPmh+ozw/TzLRpICCEkIwZWBEPPSJ6TPL96/UpY+D8IYlzTd21N9toWuDGI87pl6/CZo8Yf/Tf/yFGZBcuohxpVVdfkvxRP7HfQkHJxEkBJzC5LsgtVqch1ee3YvvWpa8GGocuGdR+TSMdYnwFAX1AXq2Gtn2gPvig1lQJkaajwhSXxQ51Kz0VKS92igSQnpMwyD+NKw/ssI/kCALdBdcPBghjXaBLkkfpGJGiyfRgfQ3IvQ1APHFXv9BNHZRUso8eoV3kagPVk3sfkOanDND/O3ToxGwAmv0u4adsOHcq7X/1UVswsxthwTGy1BsZY18Np7OgL6mI1nKWuUh58sQJUgEgVuYYkiB86IolttqeEhtNAQggheZ7qhqADIVVBFibgd0B1VViH49j2Hm2xL9uxqwYkHaJ3KSGoVI7KKFjGiFHPE9Pm59lIPj/38YHk2OvEbAA45Bb8xske64Wn33Ud6yo2n79EhqIbhj49kr6gyiILteVquO3Yv1gBEkAgQlckKuKHrhSFniSUHRENJIQQkqb5Rue1LC9zQvLm6vUAAKBuN74h8m26/zyendN+QwwvDL3qKC0ElcpR6YV2VG8do37QC+vZQM2BMazxMv/IcRzHreuzf9luDHFs09EQxTaN9++nAiismFkdG7qCcRsp2LRTXTemD6QvKBKpqsL1MvQvebTfx0lKfex/LibyYgUggPK9rzJdQfzQVSI/FClFY9FAQshEAzXBeM0Skhfk+vUAAOButhtX5utAGI9n57Tf0ERYL7y2dCNOC0GlclRqwTLLd33tGKPealv0eXU2znIaDm+MEMIIIXSswGY6mwdXHusQbFmsE3XRIJnZfUPXdWyael4Ud7qqY12XGgDmgiJlPQgTYYjf9rvJXlw8dgmAixXAAUD58yfcEBpI2nyigRrfTBaguH49AIBq2P6Dj/lMHI5n57TfAAFQvbZUI04NQaVyVFrBMmu78V3XRCgjn60pVKfWVIzZOMtpmC9WVc1ReEOTy3pq8DDv0kaijq4uEg3Kk3eA1X1DNwxdwdh8JsTDWNENHYcAzAW1IgxBO03AxWOXE3mxAn7X9UsDCZlo4FOWkarI8ny4cT0ASLJqOA8+t+syTbW54uK3BQCoXluqEadWDaFyVEqhHXWzefA9zzDHVv3Wt3miHaItGLPhnnIawl42jzTU9IWWN2z8d5pM+ZzTLm0IlH5jSzEsSxmwum8Yum44Jk4IIbluGljHEwDoC4pOGC4eu5wAask+tqm6KtjqJhpoBiTOyuI32iioBs/zSPFRqUiiIxrxJ0yBC4ffjr0E0FSqfeGFmb6DasQvkm/ynwyOSim04zkb/8H3PFOV+KGvi/j5MFGM2XBPOQ1GYsDB8P3qvlgtrzr7KK2K0wiOj5rS3m0+k1UpA0b3DUnXsa7oRpBlBvmuY4yxjgkAY0GxTNTZY5d/QivZd2mqpqRhb+tbiAcA6PuuInl65q794mDUt+MwpHleFdn62NLZbkxJ7DsktG26/z+nHy3f9cVxbAu+7TpfT7HyCeBt9PHw2+gOr0cAOFg6eWFEez6foxhxy0JT8g3hp+QbtwYGR6UU2rE92/cffA/SoBeQqu4P1RVYs7HIV2jSv47LmvtwDYmrd+E+no9dpl2a8MD3/udHVmWLHC9G9415RjlCvJok2FAx1nX2GSvdRF08dvkntJJ9l6ZKJwCgOv6DJ88AaMs8i7X96nBiuzElwdZ08yNNV14gODm0G0lo68Nfzca2CTo+EZ/yydi693cbT06Djk8qi1uWibMc52s/84qv8jDdn1Ytb7N5MDnybJo+P/RVJW+HHBgclVJoxzA9x9ts4yAuewHpUpTPe1bWbFi2597f+Wk1IG0xuNzwbCKuzdJoH8QRAEBVZKHEC+hReN3tP4Jato+ruG9r8hcgT+LyNumPRS6wrmPTxCV8B+Aaw8A6xrrYMnZEDBNVrh+brgBEK9l3aaoQAIBpO96jMQOgqvIEK6LwubjXZusrgmabLcmqnKzd1ho2vUdT7AkW2my2qUdjq4m8dTS27jGx0zMXChUBiIrpOPN/VvUcVkpRYQwdTuWolEI72DAM180+PsOsFxBGJJh3U6zZ0A3Lce/e9sWA1HZRv5gLQsS1VRYFu30EANbWVrg2RWIPZD9gtMxW6Zsix5daBGOMMTYnQ6gKGCs6xjhinEszTBQaKhIJ02OD6qxaDLNk38pUddMcWo4z5ZH1fUUKQxWFsVuc2Zj+gyVIjhUmBcnyYuHqERRZVhTzuzT8+sa3B5tKnyiGQp3WBGf/mpxb/aHXGEWFsXQ4jaNSCu1ommKaynvw8Rm3gqShOpwrMrBmQ1UV04j2b9GA1CFeAv8ZcW1Dkmi3ixd4l1pe/r4kl8DUIjrGKsbVvGe2dMNMMcYR/VyaZaKmJaV3Cd+7ggFklXJDK9nniOem6tAmTDFt5wCARJOEcVUIXFKs7wgZYRAl6aLKL6imriAkyrL6LUgd+/ngGKVPFGMoZqVYkokEDGk+GQOKCmPocCpHpRTakWVd15Ms2n/sSkGVUZfud1dnQ5RVBb+mu7dWkodi6Tcdn7m2LbIwCuEauQRgaREd69jAyXsFACDwj1jXsa4zzqVZJup8Sa1OiE4r4H08kDb/wRt3S5tR80efMmf/7AEEyXYjBY1NvSR6TVVWchMlYRjGyalOhufYWEMCAIw8SHKWkTmdhj5RjKE4uoLLDwCAoZr32xQVxtDhVI5KKbQjyrIsk6rKk49Q0CWhz6P91dkQRVGEpmmyd0Uc6oOLawQAaF+7tiRJCXCFXAIAS4sYuoKxSNJXAIC7vJ5mlXYuDWwTxVhSk5xWQH3ftG3bdgCTqd+JPZD9vkPGhkOnZP0yfwcQJGxv0FgvtzcAVZU9y2OdpUEQnurO3k/VWoTJGarIQVoScmWiGENxOgsoYwBoqmQ/o+5ChTF0OJWjMmqdCV3btlX+Nmii0B+CBFizcQyyLj7Q2JIIpmL8fA8Aza/2ECPIJJcAwNIiGJumnuVFFgDYWkamWaWdSwPbRJ0vqRUHOK4A+PMu/iD1KAEcTH0xdLZEDEVEsEzWr95BkKxy3Db5MYZuAlMAsjzWdZju9+Fh4jZ3W9+zNUUYKwAAfhelaUKuTBRjKE4AsG0AKDNxGj2KEWfocCpHpRTaOfVXHcdhyZhZszGO48jzPM+LD0hqEjkBqKr0B5/ERd2eAmOZ5BKApUUAY4ytlywln4WIyoz42FB0DKDwfU3+S9MlaEhNyrLjgG2izpfUKk7rsALUJ13MM8mvC4CjqR+6ukgjWRybpkngeOhYvSPZH0TNsMJVCuceclkc2zqNo1ONe8ffbH3L0oShTgAgaLMoStMrE8UYiiMAbBsAIDlsJShGnKHDqRyVUtLglDfD8yCLQl8212ej67qORwipT6IklSr8B0CiQchX+zBepI4xySUAVYsAAIgK1tM8q3Ly+qXMCcl00wwlAMf1PPtQrxIsr8p/XDFRZ0tqtQ2cV4D+BKCqf/bPc+jKZOp5ydxEijg2TU0S8O8Ps70d6k/RyB9UTVmm+P1v50MJAODODEQY6hhGgBcS7KPpw+kTxRiKGQCqY3EAMKYHBkUx4gwdzuKo53LstitrX3lJRF0+9z07zcbPR5KTPMGGGUqTvi81w4NRUKQESgDYQSHyTboLo1PoA5NcAlC1CABAW6U/pKbMCdEt27blfpcUVcMojsgyUedLahVsV74WmSbq3+s8j7bjq3IgpmX+DsBLuu2J0ExNP0zvcYo9eYKBvJRVNcqyfLPprWm5zt29GRNO/hrqe4D9+35+BfpEMYbioAF4mMpBHU4tKEacocOpHJUSVH7otqtbrcuLotgmc4bTaTZykpMy6UZSVA1AVZM0dYvBGAUF/SQGAPw3ykgwySUAVYsAACQapPwQpXnu6Tp27+L3XZASRnFElok6X1Jr7PdBrMrf8jz7bCUoF+7p6h14ySj6rVdkpqEDqKrxpyTI0hPA+IPUXdct4hGRirj7ydmb7t4XjEE3TNu1X3c5J2/uOQCAaj/XkaZPFGMoDtvAufBweigxTTHiDB1O5aiUoPKmbavCM5xyUHseiVKlcVPbs9NskJxkIUhjHaQEIMuKNBTvlWoUlMxQWGuCSS4ncF1oEQCAHRQ6QLaPSyQqWBfzTHKKlFEckWWizpcUnAX49KTL0wD1GRq76NSvHap3QfR6QbETXVW1yZR8M+Q/a4DQDKu57dx0reVixOHJ2RtA3ZweoSiqYcXhe8CZozpv1GabSp8oxlAcOcCUZ1cd8u0oRpyhw6kclRJUXpHQzCyn7EW354X/h7g3eXIc+dLEPuw7QJBgBCOisjJ+cxqb1mHMpLv+buk0Zx1kspZkPdPd07lVZkYGSez7qgNAEIs7I/I3baZ3qSoWA6C7v/e9528VxfAy3Hg8jSiNfBkx31XhyQfi8CwL3UbVmSavy7IEOT+falwCRBQBgJcimDaBHLU0sdktTUUtRapYZXjlnsS1mcJ3dTqxS5Cf1IZTN46qypIEVEWWf1X/+FwCXZhfcKU//8PeEhn0zl4kd8z1FYIky/I5cn/Uf5jZPA+MfFCUrbjeAtwQQBkG1AaGFAwn2qiEpPIwziNPObSCXjQsJ4o/66HZ8X+5vuLXr8n7PEUU2szXeaYpg6SsKfn5VOMSoKLIj1iXgCJyd3U11dLEZrc0FbUUKYL5c+JQhBLf1YU/3dY4VjZFUUiSJPJAlsefrOe8+AI0cWgK/bBBABC3+4edwgDmR7H9Eh/4C26jz4vpyrJM2mrZs5x8UJStmOQE1gA6uZAAcvYYBcOJNiohqTyJXFURsFPsomE5sUq9m916AFfkuzJ1dZ5pmtg9h5T8fKpxCRBRBADCUBGBMkOWzLQ0y7LrZrc0FbUUKVL3sRlHX6ko60HVc0B0xt4C0H1BU3a6otR53js5LNvePVoMICkfTmYlTnNO5l0JZk8nHxRlK65nYJoAmryPpJCyx6gYTiAJ0zTaTgXgKYrCo0oMSWW6pijyS70QidkA4Mh2VdZXkjZp6J4o+flU4xIgochAQ8OGZK6lic1uaSpqKVJvzeGeUK+whjD7iZH3/adnXnF2GyNK06IAAEWzbPsPDgDLM6b2LQnmj2BGmj2dfFCUrRh/tWkCQBMiAyV7jIzh/3BJZgCAKjz+PwAAe+eIwZBGy+/aDoCnSFxXp56hcEzXlHGY5721RmI2AOhemmKoJG3y2PMo+flU4xIgocicFlqa2K/yv1y/PhPopUjVAGBtN5rGiyjrOPE8Wlk4x7Isy1b9CpL98Klu8NJm5/CvfpKkAO5NXpDNrQ1AMXnz7E8N4bqua04QRHk2CfjGQVG24uIHsHpDsv7iisDOnmaP/TFcq8gYPiYz9FvG9wzQez3bHNA0HNsEQHTk0JSJLvcMkF+aHROZradlJSkxP/8mMK1RZEFzLf12s9sJLUWqwtBOXRdElGUSahJL6fKoyYIgCMl8SrOuM7xkbNTjyQ/CqHf2alWanwDw8q+0yCYV8qiKoihkxXyAJcvzKYHkg6JsRc8A3XHwU3CSJAIHx+LG7LE/Q+k0LJiE4WMyAwBEwuCgGb2euOYYuGiqJNAlmWO6pizjsG8ERExVJFNNys+nGpcACUWWNBNqUnNEavL3UqSSYXDeRpNFlHnsS+NM4wVtTNtSFTnPJ1WziqGD4SU9+Hk6nV0/uDh7jYRri/QprX+EcT654BZFnoSG0xGKAskHRdkKfpihPvxnG+blINV99lj3cZRqMoaPyQwABlnvaZ1j4FZ5pOuSyDFdU1Vx0jcCmqUq9lhGS57c7jam1GRsiSptOEk1N8GbxiWxHp1GpOaI1OTvpUhNZhqLKONInfcvuJKxkXbbjREnSV5cjrQ7SkDXxqfE986n09lbO3vd47T9ehxHvi4dpBySEcwatlKVLXEr+GGG+vCfbX4OL1J9rtmAe75KNRnDSbLe0yrHgDhtd5qqWIt25d/I8yeODKYal7eIUjBGao5ITf5eitSRPtN4RrrBSYbjmD/DNE2SYabJDxFA11Z5nPrn0/F0Xjh7VQDJz4kKi0NXkTrbtNviHM6LAmnKlkj8ZYb6QHl4mki1iqlUUzCcIOsDLXIMSGTf3e93cnSu2SAU71gOTUTP8ye66qnG5Y1JGrSCMVJzxBvJ3yuRes+gJV1nOEmztqeTG4RxAqTxRQS7tsqLOPTOx2O0cPb2Ejrxc3mqJHRZoHJtGfQ1THVzSS6gHRTJkcaTZqjTpJqM4SRZH2iaY0DusnEFzQ1/AU1qnj/RVU/j9xuTNKgFY7R+lbTk7yW9PThPMXQwnGDkP86n88nzIyD0pIsINlWVx7HvnSKQnb1X8iQeZeqqXFsnglCF5yBORxygHBTJkUa7vJKlmjwxHVRZn+QYULpsUEGTlOdPnktH5vdbkzSoQxZIzRFpyd8k98Wbg/O6owSgzYMkcs/H89nzgOy//3fint5w9gI4cqizWJa4voYpCo7TSyf5oEiONB74MJ9693/0X6ZKNZnm+UQDTXMMKF02SKBJzfOnzKUj8vuNSRo3hiwQmiMqXH5N5EuZa6cDgvvi9uC80dpuqyLO/fPpdDrd2Nsbzl4A9Uudx74icG1d8GybBt7xzZplkiONBxZT70ZaSLW43ZiaKgkc0zRVmcWhN81dn+cTAVjmGKxfLlQgg+Yq4f6i+mhz6Qj8vjrk9NpX9NZc7PVN0d49GmyfyMc8jhYx2X1xe3DeaG23VZGnkXc+Hce3iYf9zhTqOjy9XO6lN5y9AFC/vKw+G34axbVKdKTxwGLq3fX7M6k2bGdrmrIickzTVFkehtKEARb5RMMKpjkGq5fv2C8ggybXXBPuj2cvGvGP6KqnbMLikE3OuxjkhkKqcKPSYBGnYD9MLeKZ+8LCJBJP/YGjtd1WVRFlvnu+ctt2/+Bspbo8I48GVLjh7L1NNNeqIS4cafLuO3hgMfXu+gdTqTYOztaxDUXrGSDJgwlWrPKJACxzDBZePPVjKH0BGTR7w1BvQlSyw01u07S5dAR7f1nGyPWvG1YicRx/fE2YvmBsV1IeAoBiEYvbjXR1X2x4q4fD24Pz1tb29WysjfPg6HWMRJMHBqA4e/tKwqYMjy/sg2MK/b9OXI4016pxcLZ6F1wcaYlyEAHwwGLq3fgHU6mWHOfB2W4N68IAgT69kyzziQaa5hjMumxU92bah45JoEk1DCmjpUj2/mKGGJdeItX9Sqz6VdvumaZOM/GhjSkPudDKIu7h8OK+2KoXOHx7cB6FrK1tbB927b+J/HgCZGfvUEnY5CcU7PVf46uRMMOmP7Nk0H3jEcpMy7C6tOmPsC8Nm069G180lerdznEedrutqcoc0zRFOikuIuQTXWiSY2DpqsLVMSOwNXsHxIO2IIEm9TZNdtVTZgZXRfyJNR6YOgSerFE5UVZye/zewiK+wCFzrtmA/3iFQ9IPZA73lzknQVunvTL/26ilPwGAZujWzto+/OA4jlN2/ZGRnb3bvpKwCZHeYfxXfXvVx1PX6mOVJIPuoy0cWEy9G58zlerNtv9zKTxV4ATZ8OZ2ySKfaKRrjoGx2Tr391tdZOoWHZJBW5BAk3qbJo6WEncLe/9nDcAwdVm0V6+jruSN8Xszi3gGh+YUDkk/cLcf55zYbRX3oHDV0p8A6FvVMAxrU6V5UZnccGRkZ+/TxrLtD0z9JdB1SPbmA1t/CbQ9MzKAuZNH1+odyuSi+ygL7zNSPufsPZMf8/A8hgnnUm1Z252zf0i+hUkFTtDEIJ0LOzmfaJJjoGqG7dzf+W4rWnefyjLv9SMJNKm3aZKrfmdrC3uf93zq66greWP83swipsMh6Qc69mXOCY+2CEREAK5aGoB5t7dFSTVNN43Lw/ZyZGRn78ExZXNj/1SlZwCyZdsvqnS4orGyv79zxPBcs0H5CGSj7qMsnO+T+uTnjf3z+OK7k8r0qVTrpmVut+nL0Y36v47dxd1rmk80O/8hx0CWZcXcBd/9Vr6Xu+9h0uc8kECTepsmueoPjiXM7P0/Q8mnvo66khs3w54mFjEdDq8/UI6T4Qfe3w1zTtIN2lRBmbTAVUsPR2ZrHV7KSHq+HhnJ2Qs4j7YKRgKGei1G6vAYX0MU293+/m6nGyKz3eCqaqkL54ETEuMZjATA/+FO3NsTqVZV2dxoX04vr0EBTlLEwj3OtmiWTzTw4izHgBckWZJ/Bd8qR0sV5df3HmGI0+lot2mSq9552EnixN5/zE/4r9TXUVeyUxeDh0nnP1jEdDgcfyAn3Qdf+h+4v7/XjDs2E56B1kcWqDFw1dLXI8vL2nEmR0Zy9gKG/YcFlucv588Iwof2azJKI0XVUhfOAy/5/Whj1O7Uu3CV6kv1xfkXa3JAmzecMvVzz/KJelrkGDAMwzBd29aJ3bYcy3b9HC0SaFJv0yRXvb17NNjR3t/l276lJOV11JU497v54OHZ8c8tYjocjj/w490vP/rhRglgOnf3DFjuGUCFQFWUPvdsCIDSj4zi7GXFe9mSni9xZEt6zjx/7KJI132UhfPAz3k+yeJUe6nuqy/SNGAftgIAVPFE2OeyDpByDOqqqqpG0u8cRZbSqqqqEiCjOvU2TXLV9ybRJ/ST85zn+kuggfo66krM7d19Hby6XeEL0azNEICFRUyHw+EHPjxrYnIUtpnAAqJs3Ws68wwAP2RJ4PU0QR57Ss0GYV7Sj4zi7G1LF8HTt8sP9D98K5vJ7Yuq+ygLv5HJOJVq/tKYz9g+qQCQTYS9l3Vp46djSdM6x6CuijQJtpXaijYbhlnZV9OSUJ1+mya46gXZ3Ng/j5+LM5Nun237RZUEUF9HXUk/jgphlEpC7i+76s8t4htweKyLJHjGWGogA2UexlmrngCgrir1jsEn5FXTaIyYBtqNIyM6eyOPi6XnvBicl9LHLP9aT0ryqLqPsnAqA8ylukfUruskxfwDANIvA+qMsq7lx3ic67LOMUiSOHJF5zluxfTnOQyDZGgkQJhOR8/MI7YDZiQAP88duwUjDdYy5XW3VgIwDOOGglCF7mps3dQivgWHXlrIk1IDHoii+JNjpYEHnqnZR4VH8wl9U5CfqiTcODIinZjSfAYwiQ+3X7OrjFB1H2XhNAZYaPC2bdt2eELBgPnw+eL0G2Sd/9uCmSziAAAgAElEQVTefznll9++9nqmWVGWHfMzZuoi8M5uFKYAGdXfHkNPomiWF0V53a2VAACembpKeUlUlj68iUV8Ew6LWalBDUQunhwG2GkiU2eRiHpQ38ygeolHRg7RAnipGXM0SoBOAIBf13pYqu6jLJzIAGsNfqm+EIroVwbY18novaxvnjUhiYQ8p/Za4wVRsWzhxytTl2XeyKZTnwAiqpMMw/806971/xJesJn9F+11N1YCAA8SU+epqXJ4xYKuFvEtEFmUGqTASTQAsIqj1oyaH1GmS2cZ6choIVq4vejzzcC1/abEv65Po+g+ysKJDLDW4FVRFIWkKPpPtnaHO1FPL1WqYLOZFNiRz0riOI7jOfXQoavSUOO7gTPXqE4yDOfduwi0mTMA9XX0lQDQHySmTkON71YJGBOL+DaIzEoNwkvFZrfPjhWr7O6K1fxu4pFRQ7Q9ZccLQu3nCaF03UdZOJEB1hq8LNI0dQw778Kv4mzXfuShpGvTAjvyWdm22gWB9GfZoa3T4LWlD78jGYbz7l3rv1mcJP119JX046jYOvWPbbn8cVOL+DaIzEoNRubef/oaVMyGfVZVeX7FJB8ZNUR7oXN/QnfLODFV91EWTmQAkgbPw1C3805Kmm72zuy7os7L4MlnZW22h73WBg3ACk9yHfsq8L/M0gQvio5kGM67d61+32VBY1Yc8XW3VwLstnHMSk9yGy+yOecW8U0QAbkgMIqjn7HA5/l6fjfxyGgh2iudIwB3q4+puo+y8HcWtMVhaJzlA0QzbTpm/kdZNy+wI5+VphvbQ/szbgBWerB9pQeLaZrguDSCYTjv3rX4dQuTiPq6N1byx7e//IrV67tIl2a+kYVFfAtEaFQURfz1uWmadXIH8cjIIdoZnSPC+dN1H2XhJAYgyGUUuYosYvtnlDcdw4vaVA8vCuzIZyVImrb58uvYAOzBHhy88zTB8YEEw3DevWv5ixcmEe11b6wk8l9/5exe2crypApvbRFTZGmSqbG+thCzunoiHhklRDujs0L4kKr7KAsnMQBBLj1FlvmuTAzZYtE15ecsmpThzwvsyGfFcRyHrmMY8IoiVlVVVcA8TfD6C9aGYVHE/yZjz9bnMl6NYieYRMTXvbGSNI1e3e2mqmYZOGuLmCJLk0yNd91bx78jHVmWx59z0Wj/6qYh2ncQVfdRFk5iAIJcurLIdVXmm7LIMG1T5mk8mV4413r9WWlshOlZVXleFMbBaMDL1iZIiqIC5mmCt9YVniEZzxv75+u3dJl0AIJJRHzdbCUKz6KbraSu6zqwL3NoLrS2iCmydM3UWFUD3CTikYVnSMb+I/vt21+ZeyLee8hE1X2UhZMYgCCX6ZFDXaS6e/+Ri780ZZ5nVLYMz5C2zx/Zb99eiutZ5UXiS/Zz0oCXeP/s+kkKzHMUZ/msn/C/7i2BLcPjyz8BOCHZGr3v5PWV0MRkaRIRXzdbyWUfrivplmcPgGQRU2RJv2RqaJShkBQiHtkJyf1WEFkO9XfPXVYgdZOBBfHcpKDqPsrCecIzSXIZoCnT8ME0TS6ov5RlkYanoTlAU4acKTB1GRz/GQBOSP4QBJHlkH8Lx7OKAk1sU1VkuyLOQ+989gJgXuw7y2f9hP3DTmbzMwoAeMn/2F4ela6cNFiZRMTXTVZiiMM+DCv5HaLJ0uje/Y1WEaAc2Utx1YjBjwkCDJWEZVRUdV3mwQ+xjKeD7Ki6j7JwHmhmz8RaLvs/L3PBUWVZOQVp9q3O08Qfyoib/MTvJKbOVPwzALy014F7x1E3+DLfFq4msl1TZVl4Op884KzITK58YKuX4+nkA8Y0U8baPZpsiEQHgNObsDo3iYivu6wkiw1dEvt9GFZCoEveXjfN3gNugghDi6zeIOKRBfbkG9MxhUMlYeu5YdKEJ+T9v95WtTcWzgPd9Jk51nLZU8bxgqxpeRCEYfSryNJLGXETgns0mDoYLv0zN834w45cVyaKLLJdUxV5GJxOR8CT0Mj3G/un2kXHIyBNM2UE2fzIfnF/p/XKlYivu/ym799v/OVIFzTqJtl7w07+PogM6oWp1krmxpER6FJJGJ1cX5JQDv96W9XeWDi/eGaIQS4Niw0C7zRpb9bUVZ7l6Tk4h+HJbYFLMP5LoO8emfKrd2sk+iuqLFAFke2aqsqSwDufgSOr7kexyQF2mikjCILICeKqvu5dRHzd79EFjXDN3rvQe0EEAOq6yqPPTNmiqor4cxkub7G3jmxNs0pCQlEhXfeRiV8+E4AngTWsj+y3OH6ZVEBnWVbEn9r4HPpe2JsGF60nW47xbVEJt6Dk06f1h8v7XDfNlAGApa+OSCSTiPi6myXjK7qgEUZMmvzw94EIAORJ6EJmWi/KIg9sG58W1vPvHtltoug+6sJJ+HrSHaG34oDkKjhZGp0htuX55AVXJh7ElyF5K3+byiFTJshWvh4akUwi6pdvVX+sYPqCRvWISX8XhZ6MRASiky8jAuLwMvlg4Nsb5sqELvb2sdhvFAFNFZz+Cf/ZMQVU0fn0Mu4XWffRF85jeEo7mztGotSTEQttHU5qGt9FkxHwL+7Nb1bN0DvttlNgSiSTCOMV0rIEsczC48tn4Gb1BwGmL2g0waTZMPuHseCDCDYXOp3+cf3h1ey+ba5cafQylfeOIaDJVQB9xYEnohxzh4i678bC+ctTGmkyd4xMlK6Hb9F0BHwR3xRtQRAV6yP7LVbfbU0fCSZRP8SAzU+8tZPFPD2j+AzcGCQLEGD6gkbNiEnzYfbXgo+bDECkq9n9XnNl9DJxdwdbQhMiBZz7ex2xjDzyLo0riLrvxsL54SlpNZk79u9L0xHwvnKTAXh+1D3vpYmfZmLJWM6jyYZCt703xTRC2nfxpA2SBXBaw/QFja6YNB9mPxZ8TM3DC/3DjbgAgKvZTTVXFjR6mfTD/qAx1RdX6FNZce5iVRb5hvQzBrqxcH54SuBN5o6RF5OZvZb4eRvG1z99MgKe/3cxFd4mUTY/ssfc2t8dhOyzPLhmaINkAfxv62dc0KgYMWk+zF4bCj4iUkyGWLZ5JUpTkBt0sbfVu93hbp+8DB8ad0wmcCz7yNd9GSiR824snL8kxFqTuWPkxYTbXkvkv8kA0xHw79ftb9B/vujfQZ9NSjBfMkAQRUk6Mc5+f+d6UT6kRVEGyVLogkZXTJoPs+f7jWOJf3yNC2hv2vQ3wohDF/T+PxgJwN3+zrmPf73OY8QbSaiSxDumZM67sfDLiTPTuWPkxfBPvZZ4Z6hj/O3TEfDkF/wdNOrfoQXCpARz0hRh7+yD48nzhzZplEGy77ZSCcPsQWnecI0LyBMGIL5oWvA9HlpzdR/MaX93d5e+Hl+Ps3ZMf8pimYQyvpA5j7ZwTK6B0mTuGHkx9abXEm+h+PK3T0fAR7d8HL9Do/7tWyBwpr34BOg63dkXx+PxeB6G6fSDZNs/mPKzEF0bfr3bSiUMs7/x1SEuMAFV8ovMDeHQ8on7oJj8JPPubl+9Hl+Pr8eJ8/HgyHKWnpF/IXNev/Buywb+dOHAhAH4ydwx8mLSQUu85Zpd/nae54Uofn09Ho8njxBu+7to1L+SmAGQZW3xCQA4e+Z4Oh6Px1MvbknkQjKeHeNb+zn3Ryfnu63U6Ure/onruAD5RapOOLRm4j6Yjgu/u9t3r8fX19fX10lI7P7elON+MAeR85LIhWQ+f2S/ffs+WTgwYYB/U65zx8iLEQct8VYfzuVvVyWmSdvEez2ejvQJ3eTXLkK0V5/fQv9y/FojM6xjfT4ej8fT8djvqycj3hpgOKD41vdLFhWOfbeVWhXx8V40AqYIf6cB7YU25BdxPOnQiO4DsHd77tfr6+vx9fh6vSwa9/f3UvL5EoZcc54nIz7sBJHlEP6a98we31j+Ksa5Y2SSBi3xJoovfvtleVz5vgqPC1VF9IlNq358+SpkCQwJ+jMNPP3EtG1R5Bl0dT1g3hH50yWo3J5+esDO1jhWmVqpW4buDGkhXJjs95HMsJQb5vDl0IzbTWXu9sLrQBMWvHfu7o5utJhdyT1l4fDBEcXz5ePsuzv1411ZLngNT7PRZzMLFAA7aInflGLg74uSIjxDYiu3NxtWIcu3iZc/27s8L/I8L/oBGcUsqFxEwMGxeLa92nbcn6H0VtTot7t29fRk69Jb5rDywTvfUC4Mu7/7FZ+Pr8fX40QBcHcH5/T66rqzlsDMc514Qx/CItxO/k84ZbKJokj/GnoNUizQeNASNxPU/qOt83Up8hJT11nie7+ZazGlExKBbaLBM74MWY7E8kudpPRAE7z+auVdkRdFUeaUnnrOw05i226w7ULLfMMZeos0mWuTqGmapiH974NjiVcjMmf1tdPNkANFAH3LZJs5W8muKPIkVq5AfH+3919fX19PM9F+ZqtQ5l6W8bYlzSy6oH8oxQINXKk4nzz/JgMcHEssK1GQmLrKAk3i3uE+vmr2mVz977Mv0Rqqqh+8ebtN9a79CQBo6kiQH3dFkZdZQWEAe/dosG3c23bNM99FeHcYakn9BMJfcdER8c552CklL0Txa8jZjMRjtTPCc66KKGI6wDGvEHdFURRlURQjm+3vw0ErTAD8kdAokEQkk55mgX7jq4WWWJPzsFPKXJQlpi5SQyEsc/amhWa3TQmgJecRyVRCmZu4Upk7DldwPUlSDwE094Nl2x+Yzn35pMTh6fmD3H5fxQjfTZcJhA75Edbu0SrDH4a0t7NQFbo1oz2aoYREU6gMkJ9/8eKjU5ZlWZTFoAQ6dZ9f7IIrtjNPQ6PAt3418U5HtkCBz3Wy6kh7Ed+L12f3aJWhZEhMTVnm7I8Xmt3abB0dv3rd8w+OxbNtHXjH+LC3JL6rwuMyWKmbfa7OZRnds8cUV2x1ZUna5kVBLUMTZHNjl0h/MEWk8tLHMPb+3rAvgPmc4AWJivWx+mtvSEyd+XJbrDSAvrFPpSTeiDt3XeGL0qHIi6LMi7LXdIzDbHxV4rmum+jCsVHgW7/4t/Kt6i9ZOJOlQXy7y+jGdyxzTgvNrmn6du+/nLwou+jnQpcg7g+OyncE/fw85OrsbQEA1I3FRdKwphKIz5K83ZXxqpZoQsymztLs+4/qGQsdBADvxyJUyznBA6lNU6NPcOKf7CRipcdZ8dlWBQCO+2A2oigKt/0sZ1ESt0VZFEWZ9wygHV8Pu7Isy6KaWJbjDJa3fvXvJdx12dzk6osmTJ1VxbIPmVOXSaaFZh9QVFBkadTPMvLGch43JP085urYzsOWB+x68DT1RmxenmUpbMJVFtacznaaZsnK9rpYwu81+AlzggHAspomDXpBeP723a9Yvb6PjGvvT2d/UADxOfU9L55ccolUnyVR2hVFUeRlr/nS10h43BVFWRZlOSrcSxLDm8NTfo8BposB+mC88/Rnyxrm9zi/GIzEZb6bRhQd9DPSLJPUDVE/j7k6uuU8OLbg/Tx5UVFdw/uQGrbNzoRSkivlnmVn2ToH6WIJb0l/RCDSnGDAstDUsf7PACbFZ9NO8ubWebAl4S/f8wL3/NYl9yxJ4qNTFuPoxw5nSXosexoZ4JJY9e/LALPFAMBLVauKuTHZ+pcbhBcXEXGZAEY0pI6Fms9xHfRzlmc8T9bPY64OL8rW03bzI/zpuufwGt4HIiALj7cud1n+8pRl2UpZeTIScWvtwDDvimMeSXOCLQtoqkDq94xYfCbIhvOwCaNvgX+OTqdCb27pTVcSRem+KMpJL46TJO56BBg/qn94bHY+BzcHnAC/xwDzxQDAD8Eus9CNujJyPS8YjFByjR0mALIeCxV3wBpFe/08dOEjQPH5kqtTl3mcJDHLIPzhHonhfSqxjKfssiRbuimPyPd/Wn8yral65dsecBwJc4ItC9P2icTisypPklf3HvC++yXrbKYSNqMuBvCHcBZFUd+GE9k6S6LklEUxtbiOABqjZf8ZAEwbNPoNBlgsBgDyLAk9tRK7MvdPp8vMXnKN3RRA1mOhtBggoShFPw+U9WwOJEkSf9raAND6tEEKVDorip2mS5fJCzRBUvS7RqnCMC/f9A8QMuYsCwCacVg78X6bJNHn7TMAqOpSwq402NuOIUSeVHKz3NfyLEnbXRlPGtXMD+uwt8hpCyMDLN2+BFouBgC6QNdkSGJXFpE35opSnjQBkPVYqP53rFCUpp8v9FKWwench7seLsq6oakYlng/Y5j0rN5n2VL3dk1dVVUVc2niRZRAKW5tm7Lpe4fUX27eLcMzHrcAUcKu1F+Xs8ePXPLpuzKkE1Z59JlJ8SwEYthM+wgsDmt/cBTKr+SvCbE3ibIYX5UQi0JXlYnv3U4WnixvpwKLsVC9qlihKE0/j/QjSbwj4En8bHg3efLg04Y04RuAp5EgoKrrMv5isXWcuMvWyLjeEi7/PUsZBtAdB+nibhe3HIX+qkSSsMm3UETAB9PkgubcDumEoQuZqZyPXPKparOzOwSTV4dlOY9Wd7Fl5tYMP0mILegoR13Mjx83ljal6fIOjjUfCyXscQYIKErTz1c6noNwUUqH9bTH/hZwcMyxR/1McD1VedpmS69pnoRnJB5b54l/Oq+4u2naxuISaWj5Mk8ZXreVoFL//96Ci5cqVbQPfW1m/gPI/GMfLmF6pvjaZuGQ9rA+LFWb2DLzUAU/SYiNKIGD31gMjebLcx52EnMdxdU83gjBkPXzhIjtM8iTB52HndRenFYzBlAUdZ+lCzDPPAlpILJ1FUfe+iIhS7JpcsEl9jNPGe49JFYvm/nbHR7ehIsfeXi/udRm+j6KyAV+5tpmZIoi9o+Uw5rZMvM4JP8Oi3ndI2N7cCyB7arg9PKu6NlieYOLpx/Fdb67EYKh6ef+qSvDZfbJevKgtXs02ovTqp4Kgqeoip3WCz15e+6wNtRK95p3M08ZPqKIcJHN/Gbt6HV0LECXsOz7H7trbeb3qswA/Ig/7EemeE1Dj3RY6JvvjrbM3KJ6zy1g3SPDdh52MtvlKoqMHDyZeADXyxtcPN8bH3FEdvFciaKf5/p3GcEmTx40TevqtKqmgnBWVOWP7buuDyOTXWulARj2PGX4pUqdq2wmc/N4XiN8HR0LTA5tRbPazP4QT/KkYPd47kA6LAAzW2aezshfQvgSL9JC+OseGfZ292iyXYgiS0SmafKZWum6TrfzcZnr5Y0hmDOKxnojBEPWzwvDZRnBVjt/Nnmw94eIU6dVPiv31RRVvb+0pqeFoeZMdt16AE/2PGX4R60IV9nMQmLx2bCU6+hY4HpoKyLVZs6YogMoo8lmtszcmuXHEL4ovj+Er5tb+wPb/ZUn/lZg6ibLgks/yjz6zJR4FqJxmUSeHEIwx+oJRBfPlcj6eWG4LCPYzsNOifrJgxErm/vmFwDMnFbRFAGKs6oqij38EFoYas5k160HcHCsWcpwNi2mP7otsfisJ1qmw5JItZnkgt0VHem2DD+G8BVxFsK3H2YdX+flQIIoW7YdhK7A/9nn/hgDcPTLtD9yyae/hmVSxuXddvFMiKifl4bLIoLdR6XdSmLujGtUeua0miNhoMiK+qT3nEoLQ82Z7Lr16DeRF6L4NVHtLAOhmJ5QfPabRPA0EZiCdHD/N/2h/BjCN0WmzkJt2CxhO+/4miezZHJBEET5Jcurj4vcnxMScTB+/mpvLfMtF8+VfkM/j0SOSntTp9VFA3QFA+CsaIqq9A7pMQyVZfksDPWPMyY7Tbfe2j1a5SdFdZyCzWMQZJNsa5Nnqr+fVkxx++DWxI+bZYpMnfmvTb9ZhjHv+BrNjlKWJFGM01R8Wub+zC4myCIP2O1tna9LQRTRZWMt9ZsunpHm+hkA4Bz2pix0FSOgikkFmOSo9HHltOodrFlR+aqkqrVQBnl1tVFyehgKwP81/Q9RsT6WX52NxJx6L/37iukpM9X/B/iCdnC0LeMvm7WNZ5ulaPOOr/rMQSmJoiS54b29yv2ZXUz8Ig6A/cGxxLIURBldNNZSv+3iudBcPwO9z2WrSF3BSChiWgHmOir9f66+M+QjRUnqqioCtg1PvWpgNnWW5kOjy3dkBAiCIMJ5qHOmHvpykYrpt4f7vSmW4fH0s9d9lJnqNL7Y2htNlwWObcd7xDJPinJwqy2bMEC/WX/NN4vn5x1fecGc3E4ESZIQCwSUnV1MvicZ+jujUuaCLKPxJgl7b7p4BhKb00Q/D/uwfdKVLmY1JCFSXSXdnOhR6Stdugv4ESMh0YAouCDd2c6ybN6RbmNbmiYIqKskEXVBZqo6jf2xram4D9yMCWNqEF6093f3jpyfeORiGIM80B00vmDu9jvLUhVpxgD53KpbHRzPtqQtG79P3qy9yc86vrLmgesmKYcMw7gBMfdnfVvVeyODt2QM+rF/xA0Xz4W6ggGehdy76mcAprmxbetPGZ/2OhN9cUVyOQ8hKr0qzrwaqN//af7XmftsZ9msK62zdyxTEwXUZRIKlqgwVZWEuswPPPPw6ddryOT+ORxukgC6tqrTJPDcDsBOM3f392YodMmfsffPIA90B40v9vd3zs6SzTkDLJxodT1v1VvXDHHLLt/niZtl7feHvdH8MhSObatUuOMFrivK0ZyoiuizGB5IuT/ri4mw0o8DkV08Iw36+cEQosgf9TPA2tuNsdlt7n5I1ofXX0le1kQNuY5K/0avEuTFy1Oe5pNft727dxxLVQTUWeLLlqwwVZH4Co+6x4AgPL++MFXgn4abJICurcosMFTxpQMOe0U17g6vuXQYgr6LmepVI5shKHyx2e8Pe8cyDXnGAN/zmRNN4doi/jdFE5kmi+JGULfZkbRll+/zxM2ybcc57J2NIfNsU2WBJ7JNUZY/L38VniGJKhFl18YPv9aPPZFdPCNNA6CfJ/pZMyx7Z1nb48m2zscgzzJyX7V1oHZdnEnJTALAMmfZTrP0asFt9/d3e8vQBdRxpCqGJbNVGqoC6qL/UlmW0TGtY98fbpI9A+Sp5YpoXoH9w1ZXFI1h7nd90Hd/sPjCuzRljGrzwHFdtOaLugGwGQ5FV6YMEETuTL/Z251jOxtNYJsscNm2KtMjacsWDLDYLNu2dvvDfu+5ZctJ+h8S25RlHo0McEIiWs/k3B9yJyGSfiS7eEaaBkCbr1f9LPOiYjrb8Fg+Nsfj6RTE2ZvZOgAgquviTEpmEgDAVZTtVEVtt7v7u72l82hiX5EdS+KqxJdRXfzYbdu27UuSBdFwkwTQtVUa6hLbFGkMY/tkmAqYO9QhsgFoHUsXmJbldVY23AFo63TWrDOqOa4ZDuVu57tFy0ofX/u3lvl8moC12W3v7h0/6QRbF7oyj02AX2/Z5fvkWIBm7ja7vf3zHJQtJ9nOoS2LJLgW1v3MNccCPfdnTVP9OBI5BHOhWQD0hQOywAOwP+wknufj8PUud1+P57ITjPh2SSUAYGdr5qo4k5KZBIBhcld5mhoBG3u7vb+3g6ST7hRWuWuzVnpUUOSxOX1PP0NSkM2NjZ4BgjNXZUkcQ5D0Z9My9nv0LX6oQLtzbEtqUkZgm5rVdk3XlEfo5m6z229+nsOiZQ9h9aMEgDIqZmaUblr2zvl5jjvRvnPK0DQ1gOP5yZadTqdrK0IyAxi6bG52p5fXc9FyWt4K28TVjSsD/Ij/cIAVcPzPczz9l8n/murHkW67eGYB0MgHisgfpGbTnUv5ma0Yo1PcuXlCpYNj8aviTEpm0uXnydssGzOBFGOz3W1/nLJOcg6tVL4GrZr/UUSxQe4Ozmy+NmA4+Q+dK7I4MvqhyE1ulEBTVdUNoLW3u7v7EceFHscNTTat3fHX6zlvHwEGP0oAZTEPHsmybBr++YfbqaXwHJu+ogIblSujz5p2x/hZwcqapmkXrUlmAFndWHrtu6+/opbbdqLx7JuefHUFUNLNF3g6ZYCpfhyJ4OKZ0DIAijLD2+YJlZyHncReizN5MyWFjacL8xRZ2V5VlCrJ+sY///Q7s1Oeo88vr60tGIYhi5Tc9yx5AcOp+8ciig1FAqoi/qQ/h76PJsyrG0BLxHFZtUyj8s+/XsND/4KfAMp4HjwSJEXWv4enn+VO3MSqKos8YG93d86SoXoiM4AoipIaJ7F7/NVIrWgmiaK8o1fmAk+n/2uqH0dau3gWO7gOgL5pnlDJ3j0aLMNH8WvAWIzcm2WrsPHUMxm5ivJ01QGCrCjKOXa/Nw96mqap/CeQV8YNLwPyF4azWUNTBI7jgPCMnQ7A95v8HNwAWiKOC6IoKXEauxffBPMMIHP5GfoJgiCgqqrYV8uyFPoZVUSG6onMAIIoimJQZFl4DO+tsiwLUbxVtHb5szmerr9wXPj9ZiGYNZFiXW+ZJ1daBN97s6xLmf3mapYpXH6cho3nRaSurCjbLB8QQBAEoauqKu07ujt7AB3LsixLy7gF8l+yUBQq33fWOUHcAQD8cxWcbgAtEcf7Q8mzrHe5dMxzv4Xz5o4sy7LtSMOvIzJUT+RbAMdxHNc0TVOXgV3Vdd0Iyxx/Ck3x9Ob31iGYNZH86W+ZJz0Rgu9Es8zePRpsn5kUQLaqrpm6/s6KIsvbn8P5MsyYVdm2LTsoxOiKX6TUakngWbYZmgZEu8vH0a/EuwG0RBwfD6XnUvkjA6BzqzkAjcfOjqxAYaieyFnBzHWxw6re1RVjgaf07xFDMAQiXCnfMk96Igff12bZcFtLu26vjbAwkq/KivKUDW6mrut6gWcYhmEu47uH8faU1OrNRrA0NSpXXSOyb8ENoCXi+PVQ+sWwDAitauq6rhlBEBQIgiBUTdu2FIbq6ZoVnP1xfUo756Nr8e+CFigbuZM0nITeEpAagnkHvc88oQTfV2YZERaudJYVRXnmPo9by/I8L7I8z/MC96U3GPvx9uTU6s0GvLqrfT9azroTH5UvdKAl4vj03wFkfwEAwkV39CpPs1TR7bpTDU39lSZJTmGonsas4KEV3TkAACAASURBVOxx0w2vvQ5H5XlpJwocxy0rTRviGIRA16U+DafZsS2dAW6EYAitFOcfvc88oSa6LswykGDhSr6syLI8zCIq8yzLFG3TdJamqJ1m/MpZTlLKMg7IqdWKbTHg1fjlFPiL1krqx1D+QgdaIo5fD6X/3c03AMjP7syESosiDvZJpXXCbpNFYV4VFIbqiQd+5poA7s/NB7bVtFNVVUBVlmUpyrKyqVrRkCVJDudtNnLiGATd2j1aiQ/1YRr2AbDQj/QQDMFbP/vI/R8wT4ZfPjPLAAIsABcbhQ9dWVHMy5qzKLC3jdHJO+u7YJdixXKS+qNMdQrHMQzTScn3s39yAz+8bALDMNJzccYNoCXi+HAoirIZNE3zDUAZnmbXwCzyVYW/k9NOMKRfXuIHCYWheuKBH7EsyM+SpD40iheFeQmUVZWnG83ctWrH2ltTk1/SvJqAWEMcg0AO+1xTKRm6uTwQoZXi7KPb5sm75oHMzLLhaBewcLFRpAdJ9I1t1p9KEoW+JhzkvJPM6ijfP1kVy0lNTJ1qlLkB8PAYBoUfuJ4PNHVd17UkG89chPQG0BJxfDgUwxnDsk0H1Jw8K3jzNUUWukLX2SY7uUc3inwKQ40McPJk5WNd13XMJZEbRxGQx66xsTZpIxQdq+22Gy+KsnQaciF2kSGHfa4VNGPYlnZShFaK849umie354FcXkEyyxawcLFRtk+62GiK8lqWJRAGmix0tmahjL2T2FgWhyZPp6G1JXmBruibOEmzJEl81HWVJ2mxZWvuWxLcAFoijveHYmetUAzH9xFAns/9kK4i8W0emDzbZGHoHk9+RGGokQHQJEJdFdG3kK3C+OyFQLDJY189tIJRdqxsOdyrn0TR+4YJrMI+1wqay5bTTkq0V60U+flHt8yTG2MxpudPNMvmsDDYKKmj/01opG2UJkXVb22XBwaPJg59ITZVDk0eRUlK3xiv0fUP2yRNsiTxkSZJGnvC9m9J7knCDaAl4nh/KPeNYJQty6DDRwDIw/mYNlfi2jJzTZ5tsjzwTsejS2GoKwMAWRKekXlsVUTuyQOS8KzKPHZKWnasrDUvp/PZDyMA1tY2NZnnu6aqsjj0jytTbxX2uVbQDHF72klZW3vZWZyz9dlHt8yT5ViM7+t6V5pZtoCFlypVgOxeksSPDRefvSRJAFfkuip1DR51kntC7KocmjyP5v0ZF+SrhraJkySyk89I08hXBcn4nPTV3VSgJeL4eCjbsmVFs/yTAdAVn+fhYJdtqzxWXZ5tijwM3eOxoDDUlAEKT0YWiWxVRaF7BHxVVXjUiSEZTFt6QfB6cs9+AGzuna1lyCLfNVWRB6GMVXHoKuxzraAZ4vaUASabe2d7Ta73WtlKcL/fTVt0FzekRl+OxYgI6YZLs+xy/nNY+JGHEqBuizT7yjRZcHKDCDhxqLNIlXnUeR5woSRzaPIqColDni7nobuabidJkiVAFNglVN2Mq9PxfAtoiTh+ORRd0pm2PqI3V5vJlQ4AcGqK1NdFnm2qPA49NwOFoaYMgMWYGleRONSZZygc09ZJmLivx/PZBfZ3945tqiLfNVWaW2fkKwZYhX2uAZ2hdS1lgEn/bJ6P4tdM2Etn5D+wf3C2Ki9E8eup1rZt99/pUqMsx2KYawZYmWUACRay74oI9mOaRp9UtslS93jyAPyq88TXRB51lcacrwgcmqpIIu9Gin951gzdSZI0iQDT0vgiy75ulMJNgxtAS8RxV5E4VJlnyDzTjjH0Mlw60daj18kMNWOABcVHDnWZaIrMM22d5H50Oh5PDWDv7+63ltUzQGggWRfcr8I+k4BO/wFlgEn/bJNr5Kfx2Y7zsDPMtIStpZGM/IbUcMuxGERP5MIsA0CEhSyDlIRnqBLbFFl47K9avzd8sosB5jn3VV2yEl/iAVkzdwfxzPJ2H0GiAi0Rx+Mji7pMdGXGAG3wDicakaF64tdpUf8CwEVTpoEuyjzT1lkRRP7xNQOw2Th3h62h8F1TZNG/UdIxMQv7rAI6lAEmpGebO+dhZyocW5eZi1C+ITWG0I/FSLthLAY5djU3ywAKLACFJyFRBbapssgnTnK7Rf1NMn4Woij0MiRJUQMcx4v6fxBYPcnrtr0BtEQch9u1ZWoOhzK6ZSP/CHBb29QUnmfqukwTz11YJUSGGg5jnRb1LwDgVlms65LAM21dZnEQuQUAGJa1vbuPThXDycY73benZUCHMsCE9GxD150HPk4ZQUGd5/kNqbH3lpj/sLZ3XVN4YcPylODlzCzriQQLwGlZtkZIIPyfHFOYhkjqPDj+K3C5SdofueTTD3Aoz344hHMYqfVDP4yyG0BLxHHAq7NY12RhxgCZ7wH3+51pKgLP1FWRhaq4rDYkMhQAgF+nRfX/Y90SBQAkSbPs4KdXMZys5nnxdu+sRQUNAMhMGX+SlQemdrPJABPSswXZNPQvx4oRVLbvekeVmveC08wsu+zsChYItG5tFvWtLibfqRMF/wrM+gNkX1hU0cnrcz2jz1pbROEpCEAHWhqRDwXA/sHZGqrEM3WZZ664HipMZCgA4NdpUTd+AARJkpST+z1jOFmt3fjmnGMamTtnN+J6N76Q9Gye5/myCN1aUNnIDeIbUvNecIqnZtmFFrBATBZetzYDHOfBmDGAOwjQtD/AdwZ16h+H27Yqt0UenXs8pAAtAGB/2JtvjnMdqLeVFJ6py8FWei9d8gFmYXwqsA1f7qowYhSpTk7BG9mYwmG/NRSxqhJZFKrw+PK9IeE69dllURTSttOjPAiKs+uCLjXvAKe+sXU4McsuNIcFchvDdWszwNo5j5MXMBnC3jE77Q8Q+Gjy0AVCX0aiCW1VRMHQfYQq06al7h+24zjXVVHZ4tsrW2m99V+JlcP8Oi0KdGDr3TCK9aCkcewmeUAofJyFfXb7g2MrclXEiiTmLorII+E69dllHnriTrXjKDDcMt4AVKl5C5zGvvSFoo9m2YXmsEBrY4hV3xlRsZxJMkr7eQzWTvsDfK+aogLQfpuM7LxNzt7W9e3TZZzruqhsTgSZWm39V2LlMA+kszB+GN8ANpRFFvtOK5tRkgb+OZ87IVaDRjR75zzsdLVKY0kXIySa6pFwnfrswFClJjXsXRR4fFv1YEGVmpvgNPalr3V3NMtAhAVyG8OG0HemzLK8BsD97WsJoGtH1iflM66J1oVhe3e/N8Xt5jLOdV1UNqe1TK23nlw5zAMcquTUh/FPNQTlBrAhiUNPws6M4tjXFJFtiykErAaNmIaxdR52Sh179Z/CZ1ngRSsg4Trt2b7CNZlnGob1h9gWETn/uqe3wGmcMt3KiC5mGREWCG0MawDFQlKyGsjy8DMP4D4qvgBAOA6+J+Yz7rcbTRKYus7627ZEKeYfBL4Zx7mui8rmtJap9dYTKof1I/iLAdEGTLMRewOCCmwIDEXoyti0dqHlKVydzy6cq0EjO800dOcRcmgWdsZxnPEkBkRcpzxbkrg0MTzd2t5vo6EjH6V2/jY4URqVEGHhwTHnst6Zh38F9rYuITuKDeJTIppVlf9AeIbLA/cAg88A8nGkJCmf8e5+bxuSxNRlquBfAMfWFiLZ9o1LLgI/jnNdFZUtaC1TynLrOcCS5pXDm+oTeJIBQQc2T+K7MvU2mmH8IbNlFs2yMf9xGSLeH3TZNKKzvHns0jDMN5KK/0bGdfKzre2TXkVRGLe6xgsCD3rt/G1wohARFpZtDO91Bf86ekGlphOe7MFTeUIi8rjvH/YZqILRZUTIZ9zfHXa2LDF12Y8cPzimNhPJB1UMgKvA4zLOdVlUtmKAlUxJvDDb+qoGHGfDXSuHcRAA8CQDgg5sPocqTeRINu3dXRkG2i1QBpz9wciy4rsQaVx+xlMTIAUN10nPtjbWn0VcdpwmXGK1lJ4KZHB6q9MGERYGE6hPFmYeLyYQydHwkus8f3/5w8+o41tz0rbO3f3WFJkm6XuX7g87aSqSe13FfwOuAs9dxrkui8qWtJapva02162PGM0GTGd/sPzeOG53aohkmB6+NCDowPbgGJwX65G8zaBr6lBK1d84hK5KwvNxWull7fYPCH/EZSxzufDMVF99hYzrlGeLirWR0rLj1O1rlBUV4JjL2nnJCgAygNDQ4jaNJlAK9sPVBCI5Gr5HijAxlz43adjLJ3FLzO3u7n6jMPXP3lHt7A8GcxXJrRUMsf2LwEdRq+uGui4qW9Japkxnf7BOQVDGMsdYf4RIAFE29w/1188p8PC3bfbFFXtH0MqAoAOb87CVyiL3mUwoSu6SjOfsD46tSF2RuCKqScREVCxH/8qcfV3itOet1U+CIOA67dlllubihmOa4ofrBVECHBxzXjtvPvWwSQIQGlrc7jFEMYFIjobqjKfpn367XC2JW6Jr+u4u+6sR0r53qbXbPzDFv/UGdvk0yAeWAs+vi8qWtJap4bC9H5708XLYABi55Hk3fGIZq+I4DuBJBsQLK+q7S6bZhzzOwtdBoRnbJ73MypbhZIHPh1QcfePsDztd6ZJIQpnFs4oQlukA3xVMDYww1OiscZ327CyPvhgSxzRVGHpnP+hhs57Uzt8ZA2ySAITWgYXWMKcnign0O15Q8pYIsq7x5++VEPepEb18dJ8BQB7lA0uBr4E8zzgdQIImIyUgEWWKkUue51+ex8MeacJCPMmA0CzncWcCQIcPiGIk2nALsEzjucjKluEMWz0neVUD0DRjuz/s5C45o4g1jVAS9NWelFCvcZ367PCMWJY4pqmD3Dsd3QE262ConeeemwtskgBk1Wmj3xlqw5ye6CbQu72g5C0RBEHI8+hFyONLvhTLdMh+AfLzKB9YCnwFKIr+N5GRlWe0nwxz/T6KTL2DeJIBIUjq5tEBeE38AMSfJJ4bcFpULFMpypbhVOPVi9IkARhF1zR9fwg5i4k0TXtzVN0a16nPPiGxBIljmjpNA+94vMDm179kCUWu/XmFTRKAbNV22mmD2bWfAEmhNszpiWICvcMLeiFpuSX9rLUhoTn1qnkDxeyX/Lz8BZMq0gQQJFW5N4WnGr5JMgIpMvUO4kkGBMMwDLdhoQr3EZDxPH8JrZVZmvGKoSEsvvknzwsTgON5Uda18Kv4p6pJAs9JbxTrr3F98myd7Zrrs3/mli8KHNPURZx4bnCBTeE7JBT2wwQ2SQDiOA92d0GLyhTPABxb02gNc3qimEBvORqu5NjafEu2ohug31cACI7J3BrNFqNM5lWkHlAVcZzvNl8qdEQboJcpXmijmUy9g3iSAdG2bV18BbSPPz2gyotLOieyLPpsSMLHU1BEkX88ez5gi73zn+sztOFMR7mSaI3rk2dzbNdcn010nrNMB3wVoNpT2CQBiOnsD1bjnyQUuXWXheitSGHRMGfhqaXc7d7vaDg4pjDdkp0RiLP4ZPItvikk8yrSIxBH4ef7XV19Rht5hFBnL1PCx9dTPJWpdxBPMiCKLPIgQn5uEXhogjS7hOxCF4ZsPwtt67/E/vl4coH9YcfmUXz4yCNJCvnPUHqDAda4fn12zwD55dl0aj+rz7MPSAByuff8RPX8x2AK7w87iZk0zInkXfnfZk+i3O1ue0GntD/sJOa6JfdONhiqIzVvdzQZKPsWFECgosebz22xnl0yyNTmme/4yvvx1nznobqm/1eeZEBEvoyI7/VS4DXZaQSVExLDkrMvG6Vww7/809HvXclKfGzkLj2Hez1/M3Fujevjs4WeAco47J99g4qFD4oEIBhMYd//MJrCzv5gMLg0zMlsM8Aybki+2932gk6pN1SHLYk/MM3qFe8n8VE5pjip9lBUxgkF4b0nJJYp9efC5v7UwFjWdTMMw0yq6YjOFldErujP/TeCUxkcvSHC97NTjWtaY/LLwwVng09Kl5YHq8fZm0QJiv7MDU0QObZrqjKOfRLS3aKbADIxi3sr8rMahZmRjM6pd9D7vaCDofo9ULo0cp7e/4o1qR9DGV9QNU3TNLJsin1R2ZJ+QtOv58JfDnxx2G3bti3H8bZtKpeCMp5klGcvZbgb+Sx+iS75vKhmaY19hdkFZ3919Yizfw99/fr2d27QewFkcE59zqNYml2+3yKyF3Sg3hQR+p61F0PVlbpia/7GK8anzapI8y+o6zJPknzHVX1R2ZLq1bmQDrssy7LYmXcGJOdSBc0TjfLs+9Pu+vT8+2gmz9Max1r4Hme9P5cuB+pQvYUr7r/+1vaQ6TcAhGU6ZH9FhjG7fL9FZC8o2qYukyTIc6jbNL5IymCodtr2d15xoXkVaQRkSZrGnmjtu8IjMdP6XEiHXZVZGBl3YgnJ9Af84qlGOeWXTdMaF2PG1qVYY/GuzjAMw4ypQktX3H/ts9DqMji+CIe9KTBNGRwHu4nQMoBEvwsg9a/yjdHmCyJ6QQdvo24le7Sprs6uwO1nlTKosCeqfMyrSDUgTUJPEapA6KqYdMtfnwvpsJMois6suWHb/DXS+1fzVKMcALPq3jNPa3xTS9d1XQuCIG40RhMFob7s2tIVNxjOdaagEPeHncw0o+G86A/w/x8RvaCzah9RFOc+kKWhuiCafFyqSDd7JvckgQdCX5O4JpWFrk5JQ6XW50I67Ch0ZTa1RLYtQvFzGubV0CCCYJQ3dVXE56gM8nI6YG2e1kiepjqhKs9zaOZBbhhta6px1jupVr2rRw8vskDd7p6MieG86A9Apv90cCyxKYNj5NiWWGbh8WV2F31Xi6M3iORoWFb7UAtliESTj6GKtAoEpoz7dCRXZLsiFIWuJg6VWp8L6bA9RWDKOODZto5FoYpOAcBTjPIsCV25ZVvvFMbZFQd+I60RAPI8jvxNJW4aRrJ2CIIsz0jtvkfD2RMF3dptJ4bzsj8AGTYd52GnNJkK6WG7VbL8jGJkgIUp/HcTydGwrPZ5e8j8lCjyAUS+JrFVJvNMlZ7DBED22pWJKghdXcYEMVifC+mwzwLqNFB4tq0zgWvi4EifGxj6qogIiNx3ID2VoijyZPZRyxtGNPHqhmGQALtV7+rRcBYEnhfkq+EsWMaiPwAZNoerKNJu+2RbWYhEB8im8N9NZEcDxSx+F5HlAwBckWmKSOKZKg/7QdrJWMf0PiIddvbS5JEm82xb5wLbpqFHZ4Dur79IH99swrLG2dBXJLZJtQ3blWHovbpuGAD7O33eu7pfNcuMon0xnLW9rS36A5Bh8xL9FgVJ76+iPEA2hd9PCxOI7Gi4aRYTaJo1T5YPAMh+tWWqijxTlbF/oy6Rfh6kw0a2tpTfMzn0SvQmLGSc9WSRqxNTF9iuzoLYez25vetwO/au9roNPXq5PziWOvYHCErmBmz20W+WHa6iHEA2hd9FJBOI7Gj4HbN4mTVPlg8AQPrlyzt+5q2mOITDJtHIAO9psERu7XEDZ0880xSJa/BsV2eZH51ej+cBr+PXKMyMRHm+5Tq0nYed2s/j8+V7nm1uwSaBSKbwu4hkApEdDb9jFi+z5sny8X56V1Oct54x/PM9DZZke9Ha46UCbuLskWmrJJRVnu3qfKziGvD69UcsPdx2HWrW7snQkCSwLARcnd6CTQKRTGHq5XtKJBOILFEks5j2imUzQbJ84D3SKCkc08iL84i5runDduZhbxlCVbACX4XuccIaS6/KwADv4aX9Rlu09hBcHzdxtn2p89hXJZ7t6iqP/ehSl8zIJc9zXwnZSjPiBdl4Vnu7ovuVSvxN2FwTyRSmXr6nRDGB3km0VyybCZLl4z3SuLM1nmnqxXk4XNck3gngtvuHnSkVBSvxhSuiHOfyrBox9gywkm23WReYHhxTmLX2+BhIPt7A2VWR/W9Rc+2N/B9+9U/+LdgkmcLUy/c7SDnsHUNgq/D0OsoI4bP3voIiH++QxoNjCUxTSbPz+CBxXR1KJ0DTrd2jpecxp/OxjDxULs9YNWLkAdFUFX7BS2adBUvBch52Ej9p7fE4dKgj4ey/E9VVHn2WAfCPsR8XZXUDNklEMoVpViShJHx7cCyB7argUqC93R/2W4ktzlw3ChXhM6qhuiKifLyj3ZnzsJOZJvdmrVZshesKF8B+o2q69aeVfxOeOLeNVOXB9QFICrdqxMgDj7amCvKMlx6EKtHVxRAGa/doYGztscu3Q4c6Es4S+878PiWhC1kGnva7s3t245QOmwMtrqIEU5hiRZLaP9jOw05mu0srRkkxNs6Do7OR0OahlVYAMPtsELTfMlRX9J52Z9bu0WSaELNWK/aG62LkPVZLqv7hFAg7tZRF4UmX/F5vqFOvSod+fPzeVMVyxkumWAaqtGQAy/rYVZ8Qu13hq5u/XWpUSDi72s6/jwE8GYksPDzudsX57J7P/g2z4r0uP4oVSWr/YG93jybbhSiAfv8Uw35wmGMdqerH2PMAQZOunykDA/yGoersbVMV+LYqU//Y3/wO+qKJ1j27CoEYpvnMNN+yIv6EzZ/IPguRJ2z+FPBXlvRYXRalm6V8UpZ190euAtg9OKbAXL0qtXnoHUH7g6MoWTHhpVqWM33lOBMVy9qc4u+nM9PJmw/4NpSMknB2tZ1vHTXZcD4idx72W3ur/HTPZ+90Bsiw+RsuP4oVSWr/oJtb+wPb/ZUn4/6xvOzwmSwKz2UoedD2tsaOn6kH7njjFQRyHpy9pUl8W5aRjIEB9sZMGp9ErBhAkAzDcQP3COkP4w98P33O/TvNOISRJw5Y3XyP45j7LIbscxMiBXZ924fBq5Iawhn/BPCA6Tz+f6S9yZfbyLcmdjEHEIGJADOZqVIpywsf+7R7ZW/sf9698dT2pu3n/rVfn/dKKpWkTJKYIxCB2QsAJEiCqSr7bkrKUhJExI0bd/w+G2cF/R1aVytSrUieHXTNRAIANc8y2y2yvLNdz3W+pjPEwoqdvVnO1ddf2Ot1x7lT8CYIgtBPjlEURcnd2/5vpPze8yKv4B80Hbm+n+WxBqf1G5pSbtrhUy8i+MeYqRrGn7WeZEiHnz3iQrAfPm0Dx1D7uopnYJftLkSL0yjpcJtfbiohVISQnn40EZFjS38FhJC157yebfWfnwVTEPrgyaOt3gTBsy2BpBZ0X/l+P+ZfVADNsF9w9vuX4+aXXzT2+5/Udj6huLnBwM6Indi/Fh7LfOK5SZpm2X1SkOvlvPmfV/Z63XEO/MDfbDYbHsVxnCQ9ujeL8TdSfuteZLDRL0fCWT+BX6NXLho4rR9ErZwpLzCu35ipaqJWzupnbsndO49YEXfjB7utb6l9TWGeknXDZ0f/PNB4qFLN3plQ3aaXhBCiNE3TlEzLjMGykNkjhLjglTjZaraPjI/bk63GbhA8SwBDKe8AoPtCHRgpY5qm8SrTzHTsPH4mKLYJkar6BgM7dzLsxo6X+57vWl/TIkmze97eDZrG8oPW7PW647wJ/CAIAuPPKI46X8+Ne2nxZSiar0zOLGTdiwzCpwDOI+GN38M/ABmGrtNyZBCe1w8ArNP6TZkqAPC8KVN19xG3oprY9f3d1lGG6osxs15oyPmkx78fv0ut8cu2+87T2zuNl5wLGyFDMk2rGHzLMjuEkBBNxc+22qNLW63pprswjwfbmMbDm0oIgZBhYgt/trBlGMjMOBfXpzYj2E7sj17OiOukWZrlWXIHZRBMmV/jzpxlzV6vO85+EASbYPOaxM12K9j9dpBFKMoeu6IQ9/Hr1r3I6XzPI+Hj+TZ03TDiPGcM7qzfSqbq7iNuxTSRgZxN+MokdQxyAQAaIaqniiDUYoIf/mA5u83JiJpzoSCEFNMyo84wTbNBCKUlpeKerW5qzsUUUQ6/0W7CWAcQnHOOTbO1rCzzTctECL1yXl0/NrGdDLu242W+p++TPMmy/B7KoB8+BWYzLqdA2PaWH7Rmr9cdZ9sJNsEmTXgQAFB6v2hwDkWH3x7SN0r5O4X5NS/ydL7HkfDxfGuGYQAtBKNwZ/1WMlV3H3Ej9tYwTGyZ2WEvqUVcTCk/UTGWY8fJG4RxSangt7lAIcZTixTLbHhXWhZSEQIhRCPu2WohquLzlHV/ruOUVQ2MClBxzgOEOoxKziwLIcQ5Fzeha54RbCfkV3fjeVmaR3mWZvdQBifT2EUAYXgyjZOspQ5nx/nBaIuz44yw7QXB764LAMB+N+7WLk+hqPmCNVbo4T2+iHuyer4lSZLirKQFgzvrt5Kp+uuy3W2JoqhaWaeZKuLj5ChSmudsh7GhEYKLgjJ26wOUvKoFRybSLVTylluWVZuIc14Jcc9WszwCQwcAePiwyeIozQqYuoIF5w1Cg0liXiFsmQYXdXUzhZwR286Ik/q5A2mS0TTJJjt76+2tm8ZJVruVRscZe7vX4uw4D8Mgq/upsbK6BkZfyByK4hcA0/yt+2xO96bu2iZSVLnrmjJ0kQaNSI//fIu7t3q+m6r4rOdJTincWb+VTBUAqK5lqZrUddutq0l1Fh//AwAAeLvd1iEAIj8ef7yCv92FjiRJw+B5ZZb2YlYAURQbYvsMY+OVckZvDV8tGOPcRWZn4kPZloFlycgsheBc3LPVCQKm6QCbD5sN+hYnY2iiAgguKsGRKVuiLMvAtJB1LCkT18FHk6eE2Iltb3d/pHmcZXkKayiDAPdNIwCspw5Hx7n3/bfD69Jx7uvPp5de7YedNeAbzS3D+lQxluyGUyO+v3FtjFRV7pq2dALTgKo04Z9vcfdWz3cegaGLY5zmcGf9VjJVAO7GxVjVpa7FTwGSOJ7MovOw3e5CIvc81kC8AnbCJ48YBvN9oH8kc9hFKaUFtQlSbFxQxii7VQAuas4FINSbMucNr0wLEIo4rwS/Z6sPILCmuU+bzWYTxXGcRVM1kHNecuEixWSsLCvLQqoQor7NXmbEtiM7c172aZIX2VgnvUUZBPiJaVxLHR6kvtECgjV2kLrD2+Q48yKBE9FUn6TvhJ1dnJroI2PFvtGBjwgc8LANOd1MQQAAIABJREFUXNc2dFXumprLz64BVQp8BXdv9Xwfgelakx2iGO6s31qmKtiGnoM1XeqaJnh2pAwBBQCQ/e3Ddvvk6F1h9NQCUDXD+dXGxCTQfT5HxIxSXhQBIcIix6KgbEUBhBAVFxwhsCjnPS9Nq0edEEKMV8CarS6/UzP84AX+xi/jOInjdFIAUVWC80ekkT/LsiyRNboAtwrQ5YltZ9jNaZ6naTae9sRQZWVEGTwc3+Z7bN00zuq7kjrsX40NwGy/5fTbyHSBYBH5F8d32yV61rE8UrtCHdqkoACwfXwIA9cxdVXuGs5z91cLGKT6Cu7e6vn+35Yfv7p+K5kq//FhG7gY6VJXlcj5BHE9BnjYdsPHh/DJ6A7C0EaI1ryg2qc0GqQFiRWllDKWY1vBQKko6coVwIXgggvTlMyiLBvGH80WlZxXQvB7thqaKvQ2gR9srG9JckxHhEYVgI+fpvd1WYqyfLJMzvl4mVxJame+6Psehk6wiRHkoCiyqumNnMXR/vA2BeqrpvH89dd6K7q2OdtvdeAAAP/+vQ2/FZEYSs9NdWjLYwrgbbe7beg6DlLkruG5rRq/dJ8lSVrB3Vu3jxeytn4rmaogfHwMPRvrUsezBpldM8Zbsmvqpvv4iPIkHnu9WVHYv8ufGiiOUKflfMFRSmmesy2WrYJxRim7zQQKISrBuW/I6K3kLeeAWlRwXo7btmqrQdn4oetv/E0cR3EWJUkHsxMoeMlRzxgry7JzvM9crFkAgPb2L3VEWhm5n+SvVAMxYZCtJ/HfF84W9rv9GyAnCzkqUOWGOrRVegTw/O12tw09G6ly15RZnKpaUZaiWcHdWz3fv50q/b/fWb+VTJW/CR4eQw9rcsezGFuvRcFrAHD8cKNrukiTJI3jogQo8giMFwAAeqzL44yZS+noBlqK/b3IKCtX+swE50II0euy4Fy0nDPUGAch6hEneNVWw2azcUN/s+FxlERxmhQAcx5AVEK8tJ9LwStevqSjBfiLI+yKqmqapssXNbgV0xj6WJHatkjysZ/FszWpafLDf5x+hS3tdzlpn+tYSteVGXMdyw0dW69Fdvyf73+ZC3RGf+ME291DmMR1rxiEIOR0eS4qvoa7t3a+z5X+3++s30qmyvWCzcNjkLFBcyxCsiwTJQMAjJ3Nk6PKiIiEx8cEIEFQv0yb/kNk81Bew0Y30JLr8QZYi2jH677UlbIsec0Yd+pGcCHE6Luv2Wrizy8YJ1EaM/MhF6MCCME5FwfgZckKxn4ArwTn/186DE+yYhp30/SfAeP0n7kxpAkLfXylpf3Ox6s/3PpE7VpKct8n6lNATC7+enMvdgIv2Hrfo7zuFeRtPzjwI6VpRtdw99bO97nSf2/9VjJVxHH9IPgRsUHzHl7+jA95mlMAzSQY208BRWSgqakNAAcwTiO41R/0xAFMRzfwpSioKAvG1nJaQnDOeaUrGReiEZw/NlxU1clur9hqfxN4m81mE8dxkpU+qWnyrwAqQM+5EDQqoOa8EvmPaGC8Ev//FGDFNN5M/z0RacRCn2Rpv5MxdNzuto7eNZmBQ9/RyQfi8AVPov2827oEoIgPr985AMBvWw9b2lCzPD5+Bxsj2wuOb/uo6hXMB834cjgmRZGt4e6tne9zpf/e+q1kqhBCjp1F35MBVbrXxq+HKM1GJCWTkOxP65NlrsyQDYf5vYjbjm6gE9G0WEWFA+Ciqjjnj9Ur57zhZVk+fi7L8jaBv9iTjRf4G1/EcZITAnWVG6MCzD3Q0CdFZklCHuq4YPc/SSp/Pv+0Yhpvpv/sJ2g+L4v3t+i62+0uRJ0wwXjabJAgv9n8zJOo+v52F9pyn+hQUQ4AsN2FtokGwRIDvgOyPNdu0uhtX/TKZtDJi9kX+2NaXMNwwZ3zfa7031u/lUyVZpiIfCui741vbKhlaXURJaeBEGmCDXqnM/mDT9SuGfo+Z0yUxfqsSc25qESVQCkEr3lZsnaM3e+fW38T+JsN+RYn5gsAVOIIMCrA3AMNxfEIdQHQFIc0X0u6dG1T0YTVGa/f99NWTOPN9F8Xkq8/QU5wwoed02XAh80H3+GSuv18Hr8LgsALn129NqEkljQAgBc++6Y1UIqgAtB13TAZY8l+36HBcMvStEy958U1DBfcOd/DXOlv767fbaZK0zQNmqZhqdXUjaZpmqZ2AI7e1iIvHjStYvxdL3e3dXTFs7DzluerWSAAGJ0AlpYD44LXQuRf9LoQQoj7Da6W7W82fhzrLwAAUI22VIW/0wPNyyK1QO6zKGP8vV7aFdN4M/3HVCHEIrm3ggOgI2e7674kmmaQX3wRoYzROUNp+UEQ+P4viDWxripKCwC26//imAONQRQAmq7relZxXhzynVtVVaVrmqap6jUMF9w534ImZitnI07k6vqtZKpOBO1T1XuCkgjCR1LRfWP0NMrYoNv7e2u33YVIsTynoYVga0mAcStYkWGQhzrKWZVZkMt9EufswgBc2mrdMG0/oB+mBH01zmP8vdGwIsUGFABFeojfnYJaT+JfTP+BR77n/FzpuulYn/6hWWuaJsuy5KXPZJ+WM4m5j+1NEAR+tM9F3Y5ZFIKx9zFWPCnHeJrb7Lqua+t803Rd1xnqAvNwEv41gzvnO8UIEpmPOJGr67eSqbpkN5/0AMAPg2cba3Xbt6o/yF3zL2Cv+7NO+OQquu+OZajyTvqb5uOzm/yYCgNKDFAcj6cplhVbPQwDSH+eOia7kSn9WgF+Asfx7dvtz9blZ0l8OzBf4zQrTgpw07F+Ixb7HsXxhNDqeaGrk02wP+wPx5yWA8AIxht9lz9ZeC7mSeMGDPfvXf3Z/HLnfCcGlLpcZ8cI7qzfSqaqbdtWUlXV8FRVU5tuUgDihuGzZenyULNYbasS4Cn0bn8dQEfuJ1W14yjJckrv4tEut+IWYmfVVi/2BKDOxFQOXsqdY/i35edJ/L48ZFEUn6YPLnEAFGXljsz/zGkUTTB5jucFj2R4E6IWosgn/p9hGCSQpXGz+8vDKM/u14UeWJ9y9OXO+f5/LsH91tbvVhpR8tLEfjcg27T2JRt50FUNOaHNWK9gX215YQE8PgRrNqAWXBh1ksVxnGbvMZO/Jyu2+mJPAPr8mMGNAtw/hn8RqWeSnyfxWfmFJsfjjHqo+0scAOMXEq28ebtP4uM4lY0s4njeUyBBItWFhXQOANCIgj7/qkqMVc1UklRVVdXRRtcURVHabkJCvIThgnv2cSmr67dC2VpWFc2CoCODuvFEkYumEgKgbUSeRKzqFe/Zzw1NB9jutl6nKMrpmhhFiOKzMVRFHkXxZTPpzR64G9/BSFWHrmk4zdPDWSdvbfXlngAU2QGuFAChm8GRWf6mafhLSfzjWzyj+fkbd4EDYKPc0l7XdD/7Ho8gRqqq6sjxssQOqaHP37WgNOrQUMYFZRO6s44QIg+DTpBhGFlVVXXbXsNwAcDPz/fq+q1QtvIitUz1EfFBJeZbwtKM8Q6AZsRqB1b1+uA+6sZIOrh7GGRivlXV7MQAjEVoY6iqOD8eL0iAb/bAeww3ro10deiaSmQ5ghsu94Ws78lCAfSNY9nLwRF/OE+m3jUNjv/OM38i/G0/Ul9vt6HrzjgA4mmoYh3qVePXJeOonCwriqIoVayps58NAEWChsQcSholGUDdNKJ0LTvoySD7GwcbZcnruqqvYbjgnn1cyur6rVC2pthE2lARW+74t/gQF0WaAUBX5WpFSKDIUju1w2vIeUQKjopC1NXZTToCM7ShqfI0uWwmvtmD7cNj6DvWyOUu3AjE95+Rft7IWQH03dYj6vkYyh8zY1IAQ9Xumobd1pXhSuwPu9DV5To7vv7H6/93KeW4/7uHMHAdVS3ovkKOPVAE4sJtWEwQjB5N33dtLYSnmqJqmvn8RBow0xgqlh5iAEFj23e9sterQcbBxk2KgnPOq2sYLrhnH38qK5StsWmovcgcVe54nseHY1qUAOCHz4HnmoYiS/r0No3glSRlRVTQYhG//a93nuXd7MFEYzUqwERjdYf08+7A+VkBNtunkBjSPDji2lPW3bBNU9UvTMMyutzuQvPau3b98CkwZW7BXyoouVPZ1pZb69emrJ4hGnJ0Ag1YnfiqOOdlfvzwUn9OaVlNiAsHEA7ShqbMkgNATgVNzMdet+tBRl6g7FM2LfUEw5Xq0hSi/PTO+m9XZx1XKFtjQ+lrHjuq3HGRJcfDWORx/M1z4GHRdqfV44L+bkp1URyj/B0yzEnUCy+p72Gdxmqd9PP+wPlJAUzHC582SJoHR6AfM0WhT7CpGouZMqEEi2E1N3x2B5jDrRE71iRu8OzKGfCfvhYAgO+H4Vy27euSeW0xHfj7E1+SNHRVr5r7HYJ66GF858uMFssjy9QgsMp6kBHu3o5RlI5LXaTYUBF5UuifxRru3q2szzquULbGct8IasWq3FUiz+PDoZr+5eaZ/8mabpiRyPMIEJJqQaNjlIzdFx993xlzJn2VHS4GKjFZeEk1fujzVRqrddLP+wPnJwVwHJtsPjinwRHo/qAOQLgLXWJq55myVH0wCFJOBtLC7q9S71hJXc+WWNM03XQ/yV+ptRgJu5//9n032O622ySue9Vwt+LzcaIUvj/xZRNibxyniXXb3VCCnRVVS0zLUqFhtmFLfZ3k6f4Yx2lWAQDwWjKQ4yhZt98fAf67C3a5fw/PT2HoaE1+3L9OI7Lrs45rNMjHripToqty1wiaJ9NMgG46RI2/pU33Yb4yj8BMTaqbIo/my34X+v64Zn15OVEbbF1t9pJaR7agyVdprNYZr64GzhegJieIGMdxPMv7eLYeRxtpY4M/MZEh9apW0D1zsGC2qQ7dbAM0wyQPndnkuajrsfdvtUNgdfpvVImxbOv/iLK6V81fXMm0LF3TAaCpebY68SUTbNumizmlT7ZpOd44mf3b1jMtfWjKIj18hcQ0lKEtE9tUpL5lOYv3h+PU6WNhbE3s7tnriAN8Zpcbq1AbJGKlFz/m91ybdVylQU7WUF0URVGbmkXKxpx/eeXaCZ83/rh9fXoxEug/PmwDXdUKut/jxzKDiv++SmO1znh1NXC+ogCuQ2zHs809/PZttEZNXTcArht8ILapy734Q6+cQO5YbmnQnkBbm6ZpqFKypMgzes29sZR5+s/HYGrT9N+YpLQJcrzg+LqPKuOD7/+JAhbbNgEAlhc0ktxb8BHbdgmyCTkWhNseLUxscxirgQgNFcsRfIXioEBXM4JGBRBpcTwcjqO7qKgndveiGM/3mV0OwA+3u9Au9I4twH5XZh3v0CCvyAT3jhQ7eGd0zdl88IIBAKCRxbITaGw0s2gt+Ybu02+CzRmCKxqrdcarq4HzxQfPZFC247qWa6dvVl5/7QAASlrVANh1nU/E1OWeZ8cH31Q6liBozmwZbU2/uHJLWRwXxXv1gUZwDsTZoQ7QhlilEFXbtQAAyPJc0qbx/i0IgkAcnBfHiU0EAEURI6l0DLmvs3GC4JT0J47n2TlleekSRBxMkmasBhp4YHwctY2ha1hGDKRIfcurrEgPh8l4L9nd8/F8n9nlAFxvs92Fe37GhF+fdbxlXPu43dim3jQM6VqTH06nvBaUOoHWKKb29sv0s1vMdM0gv2wGAJCy/KJQem40a8tmdyhGNsEVGqt1xivtYuB8mYGe3s9xie24jv0ltUCCrx0ACB4XYwbTDVjZaZ4lbTXa6Q8GVLw4aXEeAUvkVrD0GCXv+XxcsCJxd7rXge4Gcp6LavSaQNd1w6KMxjgIAvNbpDBkmroO4wRBxZYTBLTsAcCyXYIwcb/nmVkEtm3ajm3HANj2fyHWUGZQ5gAAcSMKQgxdkfq25jQr4vnoXrC7A1yyywFgTDbb9I1Ww2yvV7vf1yhbd6FvoqaipqGLhUVgtIgkbyN35Vs/qc8tZjo0lZhsa1NeFFDGRrMwZYP2qMbpyAW8RmO1znilXECJLIf1RwXQHNt1sWenxWjDfwBAneWHMYNZsKLujO0vH4YfUWdVH6u8OBeyDlBmutw2tEjeAesBAJoXCZI/EN6BjtVDVOQ5LQXAuWzbB5tgc4xTrzJ0XddgmiDIlxMEI3WFTbDjOzYvhk/Actt1chvjZACMkf1rLod/pmQ0c3ejqyt292bJLteMVaXLEbPDWvf7CuNaED4FxGpKahB92e+Ux0gSmS53Ze58rgvRrGGmgxD09zHaqehFbwdxXD8If0R0wPJLqsiyJK/TWK0zXjUVnaBdtOJyWH9UAMexbcd1vC/ji6kvAMAtYAAsL4rfFVp1rr4JPh9/VJ5m2zbST0r0f7236UvJbEuX2xJ7MrQij6IozvN8ADiXbYNNsCmiqG27Oeznr+3VBMHYOGUTh5iOUxICAG1gE0QchxSgGQTnX6VPmPyMouOK3b2ILXNil4vnytXFiBkcFFnVuhRoseh+X2FcszfhU2C2NGl/1T6j87eINKkuLVXuSjGW7gFuMdMhjwCNS1vVF+EpQsix0+g7e954n3fMSS1zncZqnfGqiMGAKpJKQxPpRWVGBQBQHcdxsWenea4DDOoLAEAm1SWA3NOox3agyF3DBTwBiMbW9Rv0iJ9LgjS5ZSnRZWhFTo/Raannsm0QBMprFJlTtAAAwNfRyYlDTMd2lDE0tC4jwWGOZP7t1jE0aIrs+JoB/PdbR5e7muXR4Ttc959FJpIEMqASyfGYAjRXI2YAB0XTgSGoaJQcTv17t4xrjk3CZ0C5U/l8mbw6QMtzpMpdxcnYewW3mOlwBDYpTVNfwMKPjWZ5/BxsotgyLaRr6zRW64xXR6AaNPmQa1qTx8sPVgEAHMd2HMf2vmZMBzA/SQAw/GCxBrAJn0PfNXVFBtXGLwAwnHLvi+LUTzK+ACfYDEeVoRWiiOLjIRo98qlsawWB/z2Ool+nsu07n0WI7bj4x9Q66vpjJAjQVJR9/CSjYyEagO3TBhlQFUeoWAvbpwDJnWCRtlIySQxoCt2Aqi6i4wHgasQMAHikAc9Hby05WfZbxjUNOXYRIe95KPMlYt5rKyg2VLlrhAnA0wPALWb6fXs6NZptgqCN6lrXNE37OzRW//vdpVQBQHGI42LPyXLmAYAsL1KJtr95Cj1SNn0ndZPdz2EYhsvi1F+Qg9Q3LENElaEVdZEf48O0jlPZNtgEcRTFkqLIzYgQc8+jBsc2bdv7/K0GAJB+24yRIAClZdpbwz5ltABwNh8IApYCp/QITvDsyB0tdKgAfttuHK1tisN+VIYDtBzrGjQ1S48HgMsRs/Gt83++falbxrVGcF590wqsiKhYIKOs2DL9EjP9XZzhqbsoCPC3CI9NDj+hsfqLogKATVzHdhxvr78A6Fo0pj5yKpoxg/kkvrCm1z5lb5NbktO6vSxO/YUnDW8NL4iFVBnapqJFepydnLFsa1hBE0XRMTQMlFdV1dz3qIHYrksySr8DADwWmUMQcTBAkccQW0NZRmkBoBrkNwMKKAtaHkFHzielY8dBFADbXbgx2iqWh1EBiuJfL77sYTli9o6sMK4J+lnQmiJF5NH7WWZVPWGmH47HYwLw34SOOYWFLDv+WDx7GIZBUYxgE8URkaas+x0aqxUxd9uNrUlNmR/+AeF2g1W9KZPDNwAVQHI82ySeY6s+AOimVH8HABBRmgHopmNr338ktf6iamo0XrMijnKAZXHq3VWa5V6epG4aUXo2sn5EceRuHIxeS9HU9z1qsAkm7lue5zGArTveGAkCpAioiYaqzI4JQNd17YP/h1dSXv1n6Pt+6E2nywwdwAufA9JSdQURFwAADssRMwBtt/WIBn2dHV4vch0z41pfFRPjWh6BUQlBDKXi8TFarj1Vu5YtkM6aqpjoC+l+fzzuAcKn4BQWWlCx8w3SNE0DahDQ6KhqWtP1fX+XxmpFNttd6BtSVR7hH7B9Cl1Nrwskjwrg2LYb2I77rxUAgPIbQP0dAOr8mIweel3RyPANw7JIUYBqmHXNcoBlcWr5sL/dITCWbTePn49x9YCDjZcUBS/L+x416KZjU1YI+iqkTz4tMttLYx3gAIJY2pgKBmhEflRlj3FelSNYv7x9GQNM4vjPm+6tXSb6lnLpIiJ3uwttBD03obpQgDwCijafFPo9mhjXjsC0RlRYUxqRxYfl2jda1+QGRItfNpEoqFGx6LA/ZABO8GybA5PGsLBwz95aU3HOLUOOonyHrbeSMXGPxmpNbC983hCJnwADkS5ieRoOdVzbsj2nSd8AAHYUxpp722vmeD8byEaq5zPmhlIFqmH+qEsCsKTyWD7sqkPgfAKmi6JlySWCTk4FzayXjELgy8gNlX3KioLd96ih5tkXvWaU0j8fioJlv8MIaHE5dZxhQ1Pkh6AWOQJgonMcwseChWZY7gdR/rVbc+thL3zemNBnwC+vhCOw7SfHUbIuPYyMazfu1nntDa0T0SKLegBmaU1ha02ZHfdHANAM+zdzSDR7oH+wgtLzOpVC0OxFfI7gQ+DxIhdNdY/Gak2QafsfNlB+iXUAdxM8OxrV2gkn0HacDXHcKDtSgB0AgPwCAJzFAFDzgjobtVWx+irtnkkNqtGxWFcBTsWpsW36vF6XHQLnEzDZiSY3LhVAkiQJpFr56NW9jHD3OpZt73vUkFlQyH2SFbQwaR6DAVWc3zhRkaYqMvSmJssygCRJyjY/xIWoR72u69FonjW0aGmSwsYnity1NJn3ehc6pr354ED7R6Jf3nY/NG+uKaXfk9VW+dPaD47WFVDzU6f/P938277vW9sZDg8PXz2W+wvXqqs5o9S0PvSabYyNZvdorNZEUVUd79o/hmEA0E03eDb2DJkwkkcT4nhum6X512EHAIP8AgBQUKAAlNFI8gK5LQ9HafCICh0vqahbAFUdi1OHw+FiQy86BBYnYI4Vqki9fHVVR7a3+Vzbpg19nWTZ/hhHaXbfo4YjlASgOKY5NRMEVIOmON7U4A6qKkFPLVpUzVi3EfxbHCUZQFvRuO0yXjdLDQ3q3AD5KXQ0uatzY1aA8ClAyCC/Sn8oin5ZlZYXNaX0Ww236nRee/dXvftWlRlGdxwPgJpnR0116UFxKSuXLHkasoNN8YaJ3PHj2Gh2ly97RbBlGLqRjpPqqqrqxM4tNOEEEtezHCfNaJrpAABozAOw3w0NoIiRxDNdbnmaSSwzVehEPgJXNRX93aT5YX84XrRPXXQInE/A17kEUVxTqba1KDJIIwepMJdtoyh+x6P+d4tdPvyHe299UCQYGtOoaJQDNLXIv+T08HZMAPLUhHjIoowtNbQTR6jk8Ckw5E4cT932bvBsm51pfs9672pU86KmVANcq1O6WPsP7mNKE0wInhXgxrfMsKFryoP/WXkMigQtwutGFBHu9vai0WymsSKfFPqaXvNlXzJeIYQQqopxUr1t26ZsBZ/nAlTddB2eZwUtAgAopTHcF6qqAkSaVJWpKrdNnkqMaip0gtMoZwBFDKZRFdFhf8nTfNEhMJ+A7s+X0770V5aKFTn5wy6SeFSAc9n2xqP+m7KXhpaZWkPzIwDNjxCLJD6+HgBiA6gx8PgYL2y01+VQEsMPnm25W8S2rut+QgVO6I58KS5ruVc1JbhWp/90XnviELexCSEYx+PeXPiWtAOASNc0RRr0bg+Whc0FlU5GCPnc0eii0ewIzDZGFyR6O9FYSarU1VeMV5pumijLeFFQgFoUca9QKvioAO3oUhVJljsVnTE+YCxYHKDlBVLltisyyG1Fha6qivyYAhyAmlpDJ//lLBcdAvMJeHPn2EBU1xxBmW0BM6pIQyrMZds9hxWP+mxfoxn77ZbY4iz9jwXifWJAqdd5ejy8TogwQ51Fh5ON/vKb1H7JsGU6vvdRbr9kpwBBQ477+BmO9i9/2OjSB7iqKcG1Oi3W3ibO5w+JjbBtYwpw7VtaBQAcNVWRBmoUnOEiW3ZXpMQCo6v6i0azH8L+1Z9ckPzPmcYKmdhx3VBhB1HOjFeapsm0TLOsKADyBEEuVXE84QTSyaUq8jxPrVNzdJ9E+TmD2XY8h8JUVOgawYr0APB/3ln2iw6B+QRQ2xvbDKC7AaBLDCgzrclBV+GibHvjUZ/tK0GqKndtwylx4r80PfOPfyz+shybmGw0/eT/sAxNVXXk+v6rdS4nNYKLqN4Xvx0qfjUucFVTgmt1gtPaV0+kSRBxvBxjmwJc+5YqAMBRVeShNoyqxEaVLX3rFAHTuqa9aDT7JnlnFyT/Nn01E6Gp263rummpqzKVMlaMgIGxDsyS6uJ4BAB1XP/RpcrIsjm6OB7uVmPek4sOgfkEpDanY2zd5+wqcZimf5U+/hxSBTP2W26n+iGHpXWIaZIpGxerUteynxOxTTYapHOZXDKWFygXxe92lqhfnJxeA+jeYBpcqhOc1t5xMCvLB2xigrFew7Vv6ScAMOylvqWG1nBLa/JlZ/rqNnQXLsismotut9MUemYCNyoWJSNgYOXoUlOm02TQfzov/18e/TyJt9u6mtY1+eF1vqOvOgTGE9ABAH8DAOhF9F7j0JX8V6Gry02eHL4DLOwrm7HfRGQjRRmKC+uQGUC2nqNJXZMZ6cXFoSpy37aCn9drttH3v0MeAUEiUmks0p+2EN+o07j26Ik4nykNCEHYxiSGa99y9C267+/N9tzIrQsCl91u81k7QFVoDcuPSQmwX06m/ywRMvJknP7a1/lhaUo1f/sUoMsEx1VFazwBPgCMWZRaZJPPYO+2rqEObZEeRgZC+Dehq56SSE1++CcInwJTFpmhfh/fbQqpns/Yb7GmDFVdna2DwY9Qebuta0idsGCpGrahKXLftIIV6Slmmmz0FN+tDOwegRG9ziHXmiw9+Tun79r3omUsm3bgRp0OUBVa8OSQjFLKsGMTTEYFuPAt76Qkb1dkKbcuCFxFJlNu8D/fpexRp2d0dX54PYXAh5NRCC6nXEI0AAAgAElEQVQnTUaejLM4rhs8Xyc4LiUzgRu6DwDgeQDAC23cbXmz3YWWOlQ5gnq0pOFTYJxet4rUf4IgeHZlak16OodUZMZ+41miy11V1z/O4aadQlW626cNlkY/7HxxhLqhyH3TiDwnSJ32crLRowJ4Kwrwf6y+1+m79r1oWG4bSgJwrU4A8Foz/xNG2I6KwqafMCGEYEKvfUv1vNlDX7WMJVm6uiJLuXVB4I5ZuCvq9Iw7IfCJJ2OS/pLnVbKw4/4kwXGAqsAvAPPiZnNZh9hu+OypQxmDyJMaAMAPnu3T6xbaAOAEwQcl0bsxzTfZ12oaIlAM8oshd3Utih9zuPn9pZEFLVx7c+JKOV0c3EajArAiszQFRg0YbfT9/b8jp+/a90KUmalAW8CVOgEAFKpnY0SIRGlQ0YzYJiEY02vfsj1v9tBXdZkTou/XVuRCbmGV7piFJWxy23CaFJPrrE7PuBMCL3kyAE48I7MQ28aGfZPguJDXmm0xAJi+KwHAkH+e/GvLIrb30YAUqGVaNQCA6/vnyYRDzwB05GyIwadfmezrPESgGH646+uKZeQcbrpHyjLH9e0TV8ri4iBIkftW5DnW1aFrMoDJRo8Zvnn/53U+Gcdq65kadE12PNm/03ftu4oVWIVGFHCpTtMiYUwch3D4BCDVtk0wIVhrJt8yl0bfUpw3e+grUcbYkPrjyor8VFbNwjh/a9+4zqBOb3InBL7DM3J6N0Js/ybBcSkF17YAACCDBADD3O2lWhhblvPUd6aFsZUCAGjI8W7yBdJpPyb7Wj2NQwS9gkWvbVhMbHIKN3tyw5UyXxxu6BBTkftGFOlRHZqaZwAArzXD1gucVBRgmN/xZBHrx9DWoFuCFJ6+a9/WLDv0TVkAXKjTKJgQQghxVAQAYCqEIEwISUbfMnzp8s8ijXJ2Vqmhr1iBLbmrjusrAupu6zmq1N2UpwFg3SxM87c3rjOo05vcCYHv8IxMYmBMsHmd4LgjfHKg82KMpTG2TIQtn2PLsrClT9ZKup8vmO3rL+MQwYj9Zr+kToLMU7jZ3XKlTBdHu9u62bHpZQN/NNWhricihoIXm5dxXbvpsM2Fx5NFVB52vgHdVeuL5P3RAciaExwGzkbuoJM6zUIwISYhYorpXGw7OSEkgSOw55fgQ/clfj2mx/SsUkPbsDwaYWTGFRk3oCvnFdlsd1vHkDpuQX0PROhC3GvY5Nl1nqKAuyHwHZ6RSTCxMSLXCY67EucAACId/2tZGBNi/mlhjCwL43m37+cLJvu6G4cIDm+d0esOY6aJdO3kfXW3XCnTxRFuze9x0fSy4QSP0JTMmeKANt+MTz7MSZCtOa3bbBzJbrvD0gwrexLOXgFkzXkIGTYMBLBUp3mRMMHEJtmrAABQ5GeCMcEY4LUzJUk2Wk3TqrcR9mJUKUkzw0ip+DzBw+l+WpEJIEt3vO3TxpK6DDjNx/B79CC7Jju8pvC4DVxNgq7OjqM3t5y/vXCdfxoGrvOMnN4Nk9sEx32JcwCo8+wIAJqFLcuy7D8Hk2CMLWvhxt7NFxygKl8m7Lf8kD+6dV1X+tjjMXlf0i1XypSJcMOvPw5J08so6NSAEUzI9edPHU8P8607G0frIdg9bNnr7SuJV5D1BzNACE2d0rM6zTIeEo3m3wEAHlg1uoEAbLtc5yljw9krSBoJnuo8sU4XTrkfV+Q4GlHLwvbmgwfN1zLHeFSA0YPshAW1MLe7MEASdHz+hOX87YXrfKEAax7wOs/IKNi2MSI3CY53pAWAAVUGAGBsWQjjmktbC5sWNo3zuMJVvuAsr7UWnrHfMr9pz0MEU7KL3HKljKrxKymy+G3Pe9lpVeITexw+upSoAICH5U8kAwAetg/hI33brxBji1gKg66738eMCXEcXLCyiAA8q6CjG3h3jcSrpG2AYELOEAmjBvR1PtoJjIllOh+VQ4oxsTADmD3ILoeqpKYfPoWOBF02X1nT/O0Im7x0nZcKsBoCvYejb2Ns+7cJjvviOADQjQD90w1QMqmysGlZ2DorwGW+YCFFIN1iv01DBFOy6+mWKyUzgRvPhlmUNN7HnbzTvZLrCKFbBYCouNz/UbYPDw/l/rA/3Bolx5F0U+/qsfa9IoQQQtxvRU73pabygobERvi+AoB4MxVfmJc9nuUeoG9pAgBg2raFMCaEE4QxHhVg9CDbb4ISbGIneNpK0H7JJhMwzd++3bjOCwVYD4HXeUYAAEDHmKwlOO6K4wAAdDlwAN20LNOy7G+lxEyMLYzPd8BVvmApEwzFLfbb6H2prYpvuVIOUJUvqqq2bduWb9R3m6Zp0J0m2shc+eIPD9tmf9gf9odro+Q4IOm2G+W0qtfvP1VDBOesEIz+8UwZZRmxneuC6IW0a6ak3EPf8tF7QqbtEYw/24RYGJtyD7MHGRcxJgQRQtwnBD/M2Z2f5m+jt70AsHuN/Da5zmcFuA6BZ1nlGQGAkwt4k+C4I6Y7ZhDaL7EOYGFsmtiqSwblR4yRSeyJevsmX7CUEeatU1VVVY1A15TzEEHBC1PpghWulNda2ZzsRpd6S7vxl+ThYTvsD/v9fn+RRp/eSdLaKI2yrFgP0ttG5F/0mjNKGWWUZ+1Ay5sAR5FPjbXKi+6YqGomHPtZyn0/+QkYY9PA5AsNMEYmIXhyyyTvQGwnw9gk2CQ2t857Oc3fshH7o6Hl7DrPCnAbAp++zhrPCADcT3Csy3CYPlkxDB3AwhbG2GKUQSks7GamMSnAdb7gQrp2xn4zvabXbXQeIoA2BlCUFa6Uwh7VZjQYI1qs0p1Jen4m8sNWedvv94f9YX/VlaL2AJIsK7pJiOOu/jadgHxzxiijRQz6UEXXDYz4YzqX+5QXWbc3KMp5dakl88piC2MLY3xkFNsOsTA++eV8SyxMiIkRIeS4TFqM87cTDirkJ9f5ZAFuQuBZVnlGAGC63FYSHNfSdW0j8u+z0etzUQNYFrYsTL6VAigj2EAWsUbbcp0vuJC6HocIsBP01oj9Ng8RjM9a5UoZUQFbTdM0ZJrIUBVVbW8UYKCLPy5172Gr7Se5gg7jUQYgaZZvqzWn6/d6MgP5pkVZpAioOjT51byJa+VoVAATvYCsm3gf58Udk2Jhgk2Cy5LxDTYxxtZ86jjbYtvE2CK2bf2xfLtp/vY3LAEADIfz/O2kALch8CTrPCMAAHAvwXEtQ0kzC/ip0UREOQDGJsJWzVgJZRlYloXPQc9lvuBCqkrQ2PZcr+y0EfvtNEQwyhpXCrRtU9dVaSADEbcmJjJNc8/5qeNmVtG6qJq2rUX2XT/jG0vy9uGNRof9YX+4RfhOMpBUt/u0KXLrAsXqpE6Lavtljm50YXtJkjz3zJzyUUDfiq/pMY7z1dl22cLYwoRQytgWE2RhjKf3rJvEIoQQCxNCouXXmVxndYxQu7g9XYEnH+A6BJ5knWcEAADuJThuJE8MqM4vI/IjgGVhQkzGWAmMCYyRtfjVZb7gUliReYKm1q7X7Hq4GCKYZIUrBapKlHlRBtjZcC4FnofxUDJez6o8q2ifxDnr8iOIaYAbAAD5UuSyoKoEo+btDFySSfpHt0TGCVx2qU4rq3H+ciNIDtJddzjRIrefBfStKIokiuI1rCHABJuIYPONlWVhEULOCiABCwkxLGwSUhTLkzy5zuzz+O8a5TR/e44CbkNggHs8IwAAcC/BcSP8X/7l9jWwZVn2VyZqYIxhgi1rcWUt8gVXQlkeWUiFwJyw305DBO+I2nEu8jx1fV73+jb0fZLklJenO3ZW0eIYp4YB9fjH6X9Ke9CDqqqquqqqW7ehluR+gGlcE+BSnaYMXd9myYGO7Q9Nfvi/AQCga9talGUQmgC/m9N2Nc3Xrm+FoGl0OKwG1djCxLExY6woyscxgDrVYWlOHC83iU2iC12dXOcv0wXfvcyu8zIPsBoC3+HJAAD4mwmOS7FMhHFVlvoL9IyFFrass+4s8wVXkqeWZarQzthv5yGC+6L6262ns9jahc0gofAh3AxJzNDmpAAXKnqlrSJ6U/XnsK7ruqqrm0sAY0l1TVQvnPaFOk0Zur4iBuhT+8Ns7QUveZmnGnH6zFrkJL42rahpnkSH1bcyMbZMiySsEoz1mJgWwac6bFEG2MQ6IXDpZU6u8/AZAAC0T2fXeZkJXAuB13lGAGB0AtcSHMEudBdNRE0eH277nLCFiUVZEAAAlCXG6GwBlvmCa+li01Cg5RfYb9Ety+PFOxAnfHh04SA/9xIoT+GD9pra5l8baoZhqFLd2FWiqmpR1VcthhiDpJIAxQt+3At18oNnW+4pAtGN7Q/FDP82lDSz8Q+O5UFky7jwG69rStM7iEuEWCbBKqNpyUtqEYwxtmalojQkBBEHX/EMjLDJ2HYP9Mp1/lktYJ1nBABGHJ21BIcfPgXorABVYqwgMmgIW6SZSt39gDGeo/7LfAEADLD0S+hBgbZm2ETqDfbbSS65UhRVR87DozwM/FESpfMUJrYLzfz5dzolFhLphr6p6qqqanGhAKaNASQVa/soy1f5/cYM3RBDyblheR9R/+0EO5RntinXVFf6Nr3Apn4rqpLmd4JUjDEhuChZxfKC/YIJxmf3qWW5ZdsWdv6gF/fn7DrPsMln1/lnCvAOjv69BIe/CZ6d855NGMpXoiiKksnzl2xAnT/4Kl9Qi/wLpkvKkRi6usyIjlTpYohg/oa3XClj+hgBQE8VVVbUVEIAkj7WAu51SiykjQzdCKqqqkT9+3JxDgYAQJ+V2fFEZXIlGnI8v4aSC66qqvEpp8mcaqkSA9rSVpW+LY8XDm90XOA4DZfWHGOMsb2njJWCsQpjZC2QQXL2MSGYFPRSAUbX+bG7dZ3V62dchsDwDo7+vQQHcTebX84fEgNdQRBpRH7BOzGGXbf5gvwIuTHNMMwf2HBKiKGpN9hvAKtcKV3XdY0Y36LJ5vdpc1HDO50SS4kMQ38O66pepHvP37WvGU2j+zCRktfykpfjyi1XN4auKkxV6dtqagGfN+L0RovwdPoJthDGQ0l5yUpRUkIIXlQWKOWYYDstzrRYACNsMlLPsMln11m9eMZVCAzv4ugf7iQ4RlKw0xvUqzPYmaXUyyHykVbmNl9wgJJoTXGRg38XWXuFK6Wuzm/R02b+Uxnl73VKLCU2dN14rKp6gd55/q59LcosPq477QAAEPllydltVHupM7ebPT2lT+L8NIKPMSEWZWXJGM2KKRVw+veCFo5tqfQq03jfdVaXz7gOgeFdHP1/d/7pRYKjbYSoTldlz6q1MtlRai+3sRinza7zBe/wBN+RW64UXizegvXzn8r8+F6nxCQDBYDmqOu6TjZL9M7zd+2bmhVpfFgN2wEAROL6i7zTPbnd7PkpC/A6wBbG9g9KWcm4YIxh4iyC78RlIbEKduU/33ed1eUzbkLgv03gDgAgREV/P91AQ05vO3sA/pfVX/2f3vvcixZ5AGjr9LiC27Qi73Cd3e+UAFicyUjXjVq5sI3vftdL4eL1A+d84Vz+l1vX1ppK1tQmjw+TX3G72WtP0U2Cs5KJkjFWUlro2FyoZc1o8dJ9ztPLms5911m9eMZtwmZVfg19snhA11wAGrE8AuOsACJ6H//qL8tFizwAtKUJ//y3KVKuZIlUftkpAbA4k6VhDOalbfwbIkuJGXC2QBfZPgWOUVWyoVaxDpMC/DWVqnn2RatpWTLGSpF/0S5Z+YqCbXNKxVVR767r/H4UIG13oWNoTZMfXw/nsCR8Cp2Fk9kJC842H1IEzDh129TViRc98F0br8zmOLuL8zDTGSyQrV4TuGqRB4A2BX6PIuXfbB1N6upMdnS5b7LO1dWhzY7/dPOhC6Tyq04JgMWZLHVgaLKN/zZ0NOiq7Ph6mj87/gP+662jy0OTpwd56xFN6urscGadi0zTL8uzXXaDZ5cIqhCVrgZJ78jkeyc5K2lmQSafWPmGSgIQlB14UTAbBnbhcN5xnWcFWMPB0lzTDp8Cw6jrCFpUnspAfvi0WXj2XQ5LMAvRaV5w4vfgkZBaAABluw1cx76dzVE2l+ehngz2Atmqos3V0ACAJCDV71GkjPzk3JJCJPfC6gJTHSpLvv3QM1L5VZMxACzP5GIiJ3wKDOiu58+2uxDJQ5UikHfh1LE7K4AklZH1yPl5pzFxf3XFV+2DEvfFtJTXunnnp8fJ905SmiAorcl9Gm8rXjUsLetcMJF/u3Tn77jOkwLcYhUAuL6PCQo+EKOmwHRGsxnizLI3H7xzt0H7JV8WgSziBs/OrAAZlKkJALB9Crcbd2U2B5PL8zByP4C5QLYiZnM5NAAA8EVV1XsUKSM/eQbysyP3OXTPrjpQpbuAyyJms0Aqv24yvi9u8GxDdz1/5oTPjjwwE4QcPm9M6dyPBwAACb4wAZphkY/HTAus+vS0a92889P/8fyh2WJKb7qtCsAg9/kxM6CU++Rd/HYAmBVgBasAwm3guRbWyW96+6/Wr7zMCVIPPQCArGjW83mRXvFFpKeoGnI+TbnA4cs0+x5ut7tt4N7O5mw96/I8mE9xCgDGAtlqzj6dhgYA8DQmtU6R4gabD1L7JVOdT0r/hXH3V2N4bcoLuCxVhQXB9HWTMXgb38GGJg9tI4o0iU6Roeu6n4ab+TMdOZ/UPgW2kd3NB1eq/0iWbV+JZX7Y8JMz2lRVHfNSZXU9T1rcKPw7P12R+bYCKACK7NBX+cmdD3yXWKo61C3DasviZVCtAgBsV7AKNo8PYeAhTzXRr9/Jc1uI1NIVGDu2u67rHv5spj3uLiEKx8TbjDc7lcmQH4Tb3XZlNmcXOpfn4QMxUgDQFshWp4bbeWgAjE+TAq5TpOimu3G/m4ZK7IejE/eG+bHkiX4BlzUMcEEwfdlkvHnYblxbN+ShbVhOTO111gDddF3vZv5MlmXlwyCxkiuBt3lqrrLfiWlaW17OL1JX9BulpfxZz2cgkDWFv/3p/7B1kF5n6bHcbV1NqrPjj7Hf4B0P8nEbug7W1KGuGdGazJD6c5inAoDpXWEV0AYgDB8fQt92dEXV5YdNW+SWofTNGwBA04jiqKpztaqgF6F+1zYi/zJfo7momxbAdb1NuF2bzQmfAqM+n4fhl2n+ylogWy30axwaMF7me3+dIgUA5OkAWuO/VMb/XH/o3Sbj7eNDuHGQIQ9tUySmBu18fGueZfbN/FlT0cT6ZcNKpvgbX3+L8su+v8S0TL+c+z3zGKrE+U1qv0THqdN4VeH1659ud6FhcmJCuX0KkMQt+Olg0PbhcRu42FCHmpcYCUvuqksFcNwrrAInAvCD4PEh9AlSsP1fZF3NUkvrm/EUsDzWVfX5oXs9AgBwFi8R6jjLLEhmH0BEOeMAtu14zupsznilfqOUKp/1XH6Z5q98tEC2qszzXcbfAIyX01/XKVLuyuJDKYe7BNMA4fbx0fdsQx5akVpIasWsABmxk9v5szy1TMvyWFkq/sbfp0l0OZsdmZb5y2YeLTlAJV4cz/9h7bPXMbV2ofCkzwDAdk31SmOd8MkxMwuoFoRPjjRi+gNooe9hpKlDW9WUFRfRqh8+PG5dx1KHOittkisX+KgqgGSRK6wCEwBcLwweH4M8abXf/uCquTPVvpoyoYmhqqquPG7b9scbQE0vetzaXIfyVN+u82PSACBs2+7qbM54pf75WTAFodOVGm5DfUa2GjwZLerw/G2x/3coUu7KAi6rbGFBMH3dZOwG28eHjW1K0DLbkip+hg13Mnw7f5ZYhmmapl8yZeMX8THJL/O8GTYt65FPhuu1Ufx5Iq+nAADBQuGHJyfWjgAffKJ2lxqrGc6LGbfEVogbPsFrmegAoO22oevqSB1aXrMi02GhAZtN8LALPUvtmzx6wK+X+KgqQGiqV1gFCgAQx/HD8PWYt5+q5k8g5WNf0Xx0tw6qpukqqLu2bbsfPypG08Wi77aBq59as2TLU9A3QIaOyOpsznyl7iPj4/Z0pW5324BoMi3TPsD0sheXLwtd6xQp9xXgDJdVAJwJpm+ajB3HDR/DOG4V5FkSL4uTp5kRbN/On8WmaZqW9aFkim/8GSfHKL2oHFeRZZmmPylAej2E8bgNzVk3jZfpnt6Frl6fNBZw8AZNJcSudmIiYYsEezYStW22u+3GM5E6tJyXuQX1QgEcd7N5eHSyXDKeFXdommZ5YasA291GusQqkAHAMi3HSw6vx2cAgM+bTt/m2Byv56Oqawqouhq2XVvR5OtF7WH7FASL1hJexACgaoaBVmdz1q/UYLvbunafyY+BKNZGRGZZp0hZGdQaf1TzPOk7RVGgbwFmpPKVJmPLst0w+p60Cq6e/HzR8pnYTnY7f5ZYpoVNy/RKxY+TOMniqy6VzESm9YGsx2XjPa0ptEwZCuZ7OnwKzFpoMi3T2v6AVHgDIUqaY+f/Ze29miNHgjRBhwhomUAKskRz7mntxnb3F6zd/e193RNvJ8xubGfmbG2LrK4qkgkdARGBgLgHIDWS1T12/tLF7CSYGXCEe7h/n3+2BZplDWVJmxrA8PzwIXRdTR45LUtrlmSezbQdb+X+imtBCx68Z855d5Y3yJMAsn6agyXZQfMNAGmGYeyPivR71QsNY56S16eKKMpIluSwIyqShItar7N6DM4g8kUJ5TQbf5mbsxxS3VX4sHYsWew7Wn77QAFoWSLlQAOYXxRFUZxg4IruBJ/6lxQhJLdwQkrcgIyRZhhDkfyiUqh4Z5BPAFxY5i3/jGSGoRqG/nklTgj6g2ToXKGDRDd1Qy+XCYRznB7JEMinOO0Gj26L1a4QNzY20NgClCR3yVNua6Nl66RqqqoEMEzHXz2Eni6PLauK75l2vkdqmm67RfqaCQ4YzjAMwzkeXgZwwvXO7fAzTeRR9DUDKgumO8Y5pzMUhHLOj6ANaCrKGOfDKAtnaMjDJVXrMTi+NJJvKjqcDZe4Ocsh1bLdcOcX1SgpYf2BEsId423bCrruzTuhZ+ha27YtgHBgZMvTNe+CjBFCqG0p3jvuMFzQiArLtm/5Z5DqmmHohvHUPqdZkqezfuixQpcbqmF06BxRcbLlOK3o7h/8x9pWha7JtYFV02T1srBcT7JM9wXnZVUDGKZhWKsHyLmo6k6rXjbgkappWkzSn8Mnp2nH8XJ3lAEUzVk/dC/pa/5kfV41L5mhwzzC+9JOL3nrIAzDMPB/pSU7DqObTRRF4QyTXsuyfOB0LXFzlkMqUk0reH9rRknTcfUxvnrBWlZV2A7HKRQFduAUZbm08ndBxoIgCH3fy0+SgRDnZ5UOjvMF/hn0/dD3wzAMggDCCfhxqNBVdWoYUIjniIqTLcdphJAif/IrIqqP2lASG6AqCcHV2jS4ZVVVySpCJsybabjPP6io2gauLxvwCCE0cs7rseu6bsEBAEDQWoQQ57zVBENXEEyodVmW5fm9yryBAwCAsV6FQRiEQRxHSYorWz6HQ/GWls9n94LQ9gCCX+LmLIdUSZIkgeZvg2SodbaMtvrASFkX5sNO9VuA0QkMX3vDTbXQlbyLlJi9/UmR7JXxWtL25D2FtcA/g5W/8gLP92PZr+ua1dUk7nqo0OVEUKEyLxAVJ7sfp5/+/Jlz0eq2xNZUgJKUDSG+7faWiUtWn/Xa+569M9U2SHYJTzxuveNB3v3czveKKSOeBKmAU0q5YQdzSh24ptwcBqUe7n8dx3EUC194ZZ7BYeorEFGWEoD73JzlkMoZY8wItG6sya9rJtXvrSappsDqM+OiE3iyjl/jaEFR4COkBAAAqP+AJF35leQFOa3pIv/M8Hx/5a9Wypv6uWma0q/ruoXzCt3P8/l6V3Y/TpN8/07Ftb5SVRUBlGVZlri0rdZUSpKRpqkOkwGpvRayIldZEufndYBTuF2iW547wNj3fW/MDkBZXeZu00+b+dYL/XyeLw0QrIMwCEMxjpNY/ATQFqp4coAbEFEcAdzn5iyHVMaq4t3/Qrux+aZU15y831qmKwqwytBENLJ2eK+LNI6W3Og3IGPLXEtFXtNBlM8q+0v8M99fOb6/8qMCmauqquu6bhYmityx+3G6rsk+XXmcTylzWZKyJiQwqYmrilWYNAANpazK9Y2oGWaeptElOq3ruk6SZVkdj0nc2SHtAg9wrIoBQElIpisbxW8FAVbIXPVJVs4ian4QhmFoviWx9AUAoDHEszRgEUR0n5tzJ6QOfUOkL3QY3xQFyX83B0gUGViTG5q0JeVrz+o6TeJL5O3MyP4YZIxJJSmeb8hdc+7UC/wzf+WG/sqvslg1rVVT1ayu3wB83zFNhIR+mrF9Sy6c7H6c7rquK/zjj2VZkrIsC5OaESFlWVUAYEotyTSpW32ybFNDEnT8x+nanDHGdN3twZnGf+mby1PAyc4dABeGqowrL2xN+w+sDGWaxGkxbS2mvQrCII7kr9PvFVL3O47FB9ycxZDqes52IzzTYewqypH/4zfXv7JYho7Vhqo9Agjtn4xVOE2ii33kwMj+EGTMv0mS4m+2XWFdSoXcmO8H/mpl/EgL1TZ3ddWUqxogXIeuYypI6DtOCdbuOcD9OH1d0SjLkmBcPfGxIrSqyhIAgvV2u/VNNDDtk44k4G19tl6M0QrbweCA5nsA4MnnZZUbRNDB+TJNUUZKbE0i+hvtWVVkSTzLssiK5qxWxR9zQBn2TYoAHrahczivj5zE//f5ZT/g5iyGVKS5nvnyVg9jj2FzOAWew9f5R+MdmreO1YUx14z7H01N8jQ+LyedGNkfgoyfJclqFdeyl+bJnJvv+p7vZ1me6Lph+HXdNPVU0HRMHQl9R2l5X/Li4zh9bmVJSkoIefpZsaqa6tleEG43W49nJQq2IrS0tC9/I7fUncZAteLBePC/qWffRT7d8qM85TAAQKQgoDSzNOlLzV46xkiaHTZRURSF4efpKsf+WXAoQIzsCiP9ETdnKaQihCsO0LkAACAASURBVBCjeTJIyPanSuAJNc3bpniRW3Y+QuNSIgWaX7Q0vafDj+9phdNuXulrRvZHxv+U1jqlM0bgA3MDL1i1aZoVtWEan/26rqpDQXOqZ31U0Pw4Tl98oLIsy4ZgvcQZqeoSAMB2VsF2k+9TYnJYt9h2zimaJU51dfRdaWDJHla7nxffZXKAYZBkWfaU6SzIOQCkCnBaWar2BAzgR8UqnB6QBJyzmWg8Wcv7HsAPt9vDHx5L4TJsf8TNWQqpXdd1nhXag4Qs9M2y4Bw1Lc9YODIF677j7EoiBaCPit00a2gEAMC/2PG6Z4zsf+dbctcqsip0XVPlC22E+/f9kn+GNMeX8ixPMi03TFP1Cw399YLmx3H68q39MPSCWNUVq2devGHo7qqJ3uIkAM1znBRdYlFUNDaFIQ0trkQikAsQqTxP3XA0M7BUxzRKShkHgP6N09qy1K9V9Txg+quqyixLphb3FVsEplthOqvN9vAYvrLLrOADbs7y16QYmxuNDRLSybT/nlDTg3rCwgFAU+FUG8Qhi/FBIgUAoO07zkhUtJi2XTcH9itG9i50lZYrSBU63hSmKl1PWfVtUHRVJZeqnAv8M07xa9JmGU51zTR7ZVLc+asFzY/j9IVpmqYZhtHUTV3PgzGQahr29zx+TUarrtWr+WeZKkNbp4Y0dFVDVYFm541qGYC3TVUFHkWd7PkyIXTixfT7pjTNzzV5lntC8I+6wodj1PVBb7oVMtLszbxxldXVHKz73JxlK1w7Gl3Dh4E3dJqpdIZ5uRQrx7mhAAEgaZSdV9maCieoE4csweUhsb9iZE/tFkVThY7Vti7DhQMgZed3gFxXqaqLMuIC/6wwRCYOWZLm1IwBzxDyjwuap5Tm4zh9Yaqqqpqm5Yw1TTM7AEKo55wWVd8Pg3JVnI8k6JpSU6WhazhBQnuhsCcD1HVDimQteZ1sevusPBz2gBDjESegyj1LMP51cslltkjHKZkK4I7Z1Fc8mPvcnGXDiTKWro5g6JqibBaI4icbfyyfEXCmSQMBIHF89PkrRvbcbrFVoWvmdsuZOV9L1gEy3aggF3pxC/yzGPj8p7SDBE98v6B5OZTmozh9fQpACCFVVcW2bRmj9PgeQRAExZMkSeyvDhLdW0fLXEfS0LHekA9aMbPJABUuzFhk1loY2I8sTvNTxazOVKiQ3HMc57+dVF7hzOACQLA29+/46p79nmF0GVJjBMzNdARDX9MiJQAgrAPfMRESOK9xlkT3guTpm18qyQIAwBUje6HdcmZNZloi9OxHFuXFxWZ1yzU647CdDQW6V9C8GEpD78VpTsmz0F5WbyVJRgihruu6rm0n3+Ccc0EzVuKg2bqRU0ovuI3d2wcVKRmgsA1FbLGFhIFhksXxmQBlcpsq/4+70FV6XkRvvy7jQGZooCrb7cZ7i973f0cYaCGkxtBWhaohGPqGFSQGgM02DF1LRQJnJdYV8W2A/2ntIrHFkesipW1w9Pb8uz91xcheaLecWR3HSISelThbLCP+3u4WNM+H0uB7cRqnoAnDJbS777uu63gyTT6bXmtpWRXuWvQG5PsjIZT/9cKZDJDpSOya1JaFoatIFsfJXZYjwDT/Qe+pAay6cgBVEh/Wm433Fr3G7+8xAIC7ck1TVoS+a0qcJ3fUrRdC6htviKUhBEPPWIkzgNV6sw1CR0MCb8pEEYduP7ExaCy7gabQOgH2DMJuF9pIHniNsyi66b7fMrKv2y3nJjzLIvSMlnkcxQD/c+gqYlvE+03oKi0vov8V/v3acS7CddcW8X85/XivoHk1N2k5TsdQKQAkPr9+33Wc4he5OGvD1lWVadtHkw7IMqI5iP+ntYtQW8QR34WuIvAifv3ni1oNb4v4n0EGyBH0lBi6LAxdQ3AW7QkAgL6yXUuTxZF2ZU6O6AZw/eDR7THUuX45HFyzV0EYrldv0Vv8Gu33ABCsQ88xkSL0vCmwgfbLWf8Spftc8xEAAPwg3OwC30QCr3JV6nmzBzd8dESMxtXWUWoCtQkQrDfblSoPrM5VCW4rb7cs/qt2y6U9i9AzTnAWR1PKKDYGDNtNoLdUB4D1Q2Br5wPZuuZ8GsJfLWgux+lXaiKAJv969s6hqQoDUplmKTkQTXBhqFLvai709GcapRkuJ6oSagwETfgQ6AI1gF3WalpqwFQJjHpWWYYqC0PHSjIfEvTd2rNcHYkjbQsnVw6MvRtMzekOuba/CsMkeo9eo7doD+BvN+vANTVF6FntZoo4vi0H7g/ou6e1dINwvQvcYZSxIfdtU05sDDGi7nqzQ82zhmQAxw83W0seKNGlkdO/QOa8ardcWvcL+o5VJM+KKWUUC2hYsFu7LYYGwAkebefCAS4YQUsFTXvlmpasCn3Pqyp7mX9tKU7/KjUEwC4HbxWmAjWSW5xH2fyXMg1JfekYCHqKSRrFWQ7gho8OKpShktzg0RUwNOSyVtNiqOdS8MJsC7Re70LbMxRxpI1NNOjfDpIeV5iaozlu4KxWVRzH79Fb9NYABOF2G3q2qQh9gy1NGvv277b1TmY6rhtutPdqNFbbvq7LEgApiqrGQrheb9KMUN4BaKaz2myloc7kvqXlwQGMdeBZpqpIU6G1LeL9ge531W452QgA0P7qe9YQzGFKGcU/S0NWrd2mfUkRgG1ZT845O/WSEbRQ0PQ2oeeYiir0XVtj9eWDrxxnmgwgm+M4joTP40kWhu7FSOxpmRoIekpJGsdxCoA05w8UUdPkqu7+IfwoDfWiViOw51S9zw5eheH6wTddTRxY4WRi37W/a24atuO5xkuWxvF+ovj6q2CzDT0TiX1TpGjgbR1NSWTHi4iEvjulbt8AjLVvymNXqaamCm1X4jy+OvpZhmq7q++v2ej2n/2yKk610nW4LqI4y3EFIMtIszeGgNWe1cSxpzxF327WK8fU1NkBGkM6JtfLk/45pVTsAaD9s29n0RyEkCJKAIIggDHK8qS3Y6NxmzEBYJQ/fx/g4mq3BU13uw1D19RVoe9olQLAf1jbpzSiZUV0OlD0FQB4HWfkV8UXxApmi8ShrbCqIehZi3Ea7ysA3rb8U21pOpERUkEcx/GyVvOiqghAvh5WMG/1nh+u1zvP0cSB4UzuOCW/cwBdU20LkzzJkmTqqLpesNpsw7wakW+hsaWlM2NQO6qD+rBa6Q1NgH0DZf0QOmjkWHEVQ2hbjHX5/bKWqBuuYxdF/No96o5jqqp+uH9WuGZRFEVJlgN0HackHoxwqKvCMmcU7nqz3YQr3To4QIH63/QvKcUvYpHXjLOPxhtwip813ZhYSTtcpN3FxLfbguZqvdmuPdtSxL6rCFQA64eVc8w+Kb0ZqNRUOIE24/cVV9s3XpNcRwh6ziqcJxUAMFqWhWl7RSaKojAXB6ZaDTLHuh3atuUTLHyJnG05/ipc73jdSYYjd6y0f6uop6i6Zr6WpCyyZFYGdFw/CF+TclT8TdhixzGPGFRoxtUn320wVBbAKgwfAnWkqbrSDaGlOEFC//3q8qqm53WZ9KbfBLp+yr3DtRDFURRFcQpAK5yqdPTlVaGb1mGQsh9udpvANWcHGPeN+pv5aIUBqUjjNL8zsvnsbf7TxEraAYxFRM8xf7cFzdUq3G7WnqWIPa+fNQRgrz7Zx3EL9HZ6Ics04LXC+RKWbDK+kEFUVVnWvqmZpizLMpsOjRUuTGftxjlpB4ppO8nGXZKzp1+3bMv0g2afd5K7DVnhkd+eg5GiKCLnnJaV6lUcADRNc+w8+ZWORoueSifXjRMGFSH1hEF1vDB8sEeiab5rCC22VbFvv99cXmnb1oO2bYdTe04QQ/c5iqIojqICAGcaGlRJ8ALT0gxrnqPr+6v1duNbpBvUh283oggLFkGNxBZHafbhmyOoNxNn/Xk3rfvP8xHHtwVN11utttuwooOkUlEUARzHfrLnPHKk17pUsFiM+QtWVU05jZBCc4+vA0CqbrvbH69x3g6sSQoA+XpYwbyxaqrm2Nbz+3srb9U/bCfXF9qTZyoHcNZMNv5o6rJIAJCqa9ZPHL+2geKVhnHQVbrFoPqutQofxmQ0dytDbHEs8PbqSZBlWR453wDAjFedXnd8X1FkAcap4ZMoCEr00NSlYdvmYZCy5fj+ekufq3YMUPsKxW8GOQP8L39tmd/a6/vFz0Ulbgualu16wWaflIOkA2EcQNEcWxnEL7+4ACMsJiQne9iFKxdBi3FshK4i8iKO/p/Fd5ZVXVXYtG1LU1WZMdZyAFnRDIOWyWvEBt4U8aQbeEHOnpdVVjRNq2uyz12zbnR9adbbmcoBwJRMiaIohzpvKmyiN0AIIeCcl7nRti2a0YbHlTrDoLpeYK/CtpL8dZB0xoPAaX0V8URRFCVpIoHI0unIJmvPfkApo5SytoUxAmo88oa2G9M0jXmQsmGYnte9vxctGs2gfn5LfisD/tfsSiIMAOB8D78taOqG4To4fk0HSRdwjqdZmAp4bv0LAOhZqrfdhQ4SeJPHb8eSmxc+BCsNKE4k9SHQRWrcazFXVUlIvTUMU9d10tS0ZTM9AwDQFoDl0hQCLocVzMU6hNCEA48Nzvn1vQOAc0zNZC1j7WC6D15FaZVr8ttpTxjOwWYHO8eg6rbju9o+lU03/dmsHld1fj15XhAEAT1N3Q/JLY7AmWL/PmgBo4yxlr4B8EgLbNu2DdM0NdOcBikrqq7bUbZ/p76BV7ad0FPr/+oU8GkXuq7SNkX8lj9s144ytkX8elH2/utyM7cFTaTquvWG41cm6QKNcwAcQ6p4Hgj8JwA9pXreJNzNah3YEe1iOsGnlQ3YQoMSPrgiVsY7OUpZ1nQaHWzbdkHKpm6mEX50Y2/MHqAygE54AFYeyNlF03bH7yiK3dK9u4upaVldFqveaJqmLnV5PMMYiudYo6OdXVlXVdMucGYrCi3fwP6cmerCsPhxIn6BcD6jrCNIewwYo23D3gDAsh1bdxz/RbMs05x09ZCiKDJjVVxrlFJNNwxNBlhst3jhQ+DqTWMAE8PNLtDGxgB2gQm9Jzg1mbE5lbVuC5oIISS2LcOviiK0OAKIoFY2HgAA/wktO6YQjh+Gj5bAMmjwUYtJkhXzMQC874nshY9iTJU72WxdlhWtS8O2Vi5gTOuqmnRAc2WjNj1ADlgDkOdhBeGnHv+i8cJItzPOPADcYGpOVlVlpgkPfk2bKkN9Nb1VQAjpgBBCvL/vAEjVdT0riSMIfV/VDb8VdRuGYaBs2nK21YUzxao6bQEcAATLtG3HtV5JMA3TN+qpLdv3fd8z3nWdLB0ceqHdYjnBJ8etMdR55wbrnTMWwKpjwJCR7NiWoev3zmSbj2lskiRJwzAMQ/OKhK7MAN6YdWC38p+cVVMnRpMMywmCR6igUJGsnMpwgsBtvc091fHC97xs7zRYyroqc6/8ati+n+dlXlQ1wMjrMoHxj4oDP6qHR8DkScN2v78VKfBkWZZ4dxLYWVA5mAznuiKwQlcDuVBZhQE4rZtat/xuNGzTeK+r6mYi2uxaCCE0MtZNO2vXdbfP2OQu4wsAPIjShQOkmqquKGOsBADbcSzNtr2XujQt3TQNs75X7Flst1iWZf3h1c8pkjWkOZvt8KvGp3HMjrU2RiW4KP8ev4ogip+r6bG4M/vu9Eks1NRlkQP8ap6O1+AvrCkAwHV1GWRFcwLtmyiK4q6vJ1GMjrPym7v94jiZ6btVXlTFnWSmJmXNyqo2woCmWUFIXgA4XrDebsznigOwfhwBZIA35B2quzx/v3LslaeYup40dX1oMS+rHABAriFoC1vXNOcLzzMFoGasLNYVN0cUeA3BlLM7GNT5n/OVhomOeflJOOd8QEh+4V/nY830egtQJqq2CtoyVQDANm1n5dq4rBrXMg3T0oURDmMgdOFAUp6SnYV2i6FrtuWklPJgzWlZhgHW9ZOYgblGdFSs8nYD4JyD9Q/8vysK3J99d/gkypQqW8orNOejz8JKbBms176JOgAAAQQA2A1dmUUpTFM4HaY5pmPbrvczJ3eGlAOMTVXWrCz1rfqaZFlekBLAdmx/o/1KCg5AM9IAyAAX/ZmLHyTjcTVIntsTQvnBAe6oHABEEnBqa5qmf3amLbYhuaHLG60eka2+Z1VeVHcwqBOp8nDL5/36an0ZY0xRVVVWVRWmMtYUwmmbaCru8SRHZnu2bthOjJt5kLJtEWgppdSwV8OoW4bxTttuuvxCu0XTTVMv64b5qsgbWtcbw9DU4wP/QhxvpHmune0oQjcCAKtIZNtvU0vxzuy7qcRMDXfnTKmydJkjPHBcqDmsp3L54dWVMvBChRSmKZyh6Pp/ZJbnFnmWk+Je875qGpJ7lSrv4zhJszQHAEW1HO89ek0ZQDsB+e78NgAArGWPDpJp7/OyPBbE7qkcQAQ9I7aOtrqMGGMtQG7qGhqZZYl9E6dRSkh+B4PadV0nqXN1TlZVtW2vhTgZq+taN53N4NtG2TS0PQvhai8OTZJiAMswbd+1e4zbihiWY5mGQ4AxWhZe3Vkj8r2G4KquKcBiuwWpmmZEdcUfbZEXhFJ6EoYGACHN0djivu8xbSdFurZ65pi2QxH1utBMFQb9evbdwQEoo2UeDnp9TJUPcqiCIGwkVhhwLJcf0sGv2kD1aYR8BDTQaFlVlu06f2Yky++FAGgIqSmJMbTvSRwnWQVTMizQKv1FAKaW84cO8Kt0HGGgP9MoO+ky3VU56N7ayja3Xy3XbQmmDCDVVXmghSOLfYNxGsU5uYNB5bRpGsOd9LQ3K5vW1XXro6EU488+U8H03Tfc0PoUwgEIQIOjBMBxbU23XYLLtqxDUzfMYPgJFSlMA23UZkSWts/Kksys2tt2C5oLZ573RWTfs463SFFOOtOC8IxGXg9pT2MMwKZR9EMV4wENtSy2eYYB1gG6Kq8cMpqK5IYmhu6UKg81HEA+nWpsB4mY09TJqVw+mffoDBgm2djulWtlzUriO26WFznOs7sl2qrCqdqLMGTvcRIlAFOoFQRBMBFrOkrpbxxASDJVGCgmSXTSZVrA1Mw2JsR/Qqrl9lFWEQKQqtLQNqkji31DiyyOovQOBrVmtMwfGBQAgIJw9VrU9dX5tixMJ9PXkg+6m6cFJjXAf779zLZlrxwHEVx3VbU2TS2ciG6mhkbPcISuSdIozfA5H+ii3SLLstx3Xac73upFUXjXK5cZ6fg8cjoofYuj0yj6CkcD0FwW2zrOANa70Lwor8jWvFaFpasiJ4a6QoXGqgIAOt51HS3X3B4k/JIpp3L59CvO6tPwnVhzxl01DcmcMlyrPycu/V1oPc40eSQAQOJ9lI4AUyIl6tajRw8B6NoBLqq7gvAdCQOlOI2j0wj5u8oYMxS/fHHolJuk4sBpaaSy2DOKcRpF7A4GtSGFocs7zZc05cmw35NzaOpkueOkqtTZtsCyNM6yYvkcZjq24VoFqchYV8S0NwZUAJmuykOTW7LQNTNk4uzyF+0WQRCEKU8VBDgmpOcZafuTt4PcT1reqQJUB2jKbGhLTRY5LaJ5Dz+VV/RNz+aR4JmmiLyyDE23NtzNFABoW1rmhiHY3sjLw58StBbNw1DbTjB1JB2ms5DCo3VNHp/TjzcAGP788/olzsqq8EanpocAdOUAV9Vd6H8KA2MYp1H0ITL7YE2FE3BSStM4A4C4Z3VuKbLYc1riaWrOIgY1t3QVDY3p29ojYX/mcZJcfzOSG4rUlQ4SOoKzOMkyAFjv1o6KgJMinmdcO7Zu295zURDApPocGC9lAZAo0tDWqSULXUNxNkEmTnbebjlgrOcfrwbgTM/RC+/kvq8LAGi+nasIHew4dqeSAj8wppYnAADEstCxUtd0dWfN1YiKFJahibUujbxaUKHnnDun5pdl2oaGJIHSBhNc3NOWWraqrDI1fPQbSsupVnPpANfVXQD6PnBWFXly2JCXZ1of/0CuQeUiTvHEIstu37KIQc10RRrq3FKdpz9zRkgWx9dScKmGxJ6WmSx0hGZJnGQAmr9+WGkqMBIDqzoAAFX3PDsjpCESxYWxIk6qAETSyBui6bLQMVbgLIrYzQebre/7XpIkafaBebxUD3AGEhl/MKnvP1AAWR67AwAQC0Nb2QYKHxVE2KQPnRu6Cm2JpJG3KbkBKszjmeZb5a5c2/O9FbIcD5uGfnhObm7MUiUCFwYaaa4rKzTXag7k0LuMyea1YzU++dnyTOujfQRBn2wRg5oq4sCrQg+svk/iSTfz6qNUkTCwytZkoaN1kcVRCqCbzuqTpUGVQ1OWMQAAa8q8F6ualOBaca9M/LPxraNlbiiy0HFa4jw928/+XegqIsfZrG7I27blmm6AJMmyrOi6XrH5Rp1AIt3Z769D3zVlJHBeF1kSHULowtgdAACI2hqb66+m44wlmQ7SJFOB1xaSRs7JLf58GAbxmIa4nuuubM997UNTNy3TVNmdG7NUicg0aWxzW9dUezfVauQ7GrYAMNQDY7yrXyk9nXn/8vTq+7aEQU2EoasL6yEAACh/lThLbiR48oE32FJkoWurKs0SAJAkWbX+QQUCNSnrpgKAEqegiW1KyiFRRow6HGMAGKO7aIrwIdBFWqjy5AAta+rSdDfg6IrpPFm2vq9moP0iSGS9W4eepSChbUtLR+LbRcnxYuzOZEXpPSHV9oQor2d9xwg4dTQkjby7oO1MNrdZRQAAyfVc3/U8qRAFy9ZN29pM58DbG3NdiQAAiKShq21N09QHe7qkfEfDtm2KPRswZYxdRJnlmdaLkeGkrOGGvolk3uLonwGWs8i4o8R9mn9of+VLupkYX4fbse/7vtv43726bBhkMUCmQoXEjsR5i6DWUUeT3wBRg+DRFUvj8GWquiry3UYDp3teQ6OukoLUVQWwDBKxVuuHia7QUqyr0thd/LmLsTuz9X3HGflB2LGMN+7vTY4AuKxju57ruq7v5jnCpm1b1sawMMDSjbmuREzfoGPY0pTwEcmYsakdvKhhW+jykA00Lsr6IstYnGkNi5HhpKyxWYe2KnMaw/05SXk1nE2XzH/+pdxm5/QUx7LoVU3Del2NASJgpiz2dR61QLGCOl7EAP8xdBzlhm7ZFjj6P8AJgk9SpvTzsaDCuakJ7nZs4lqwvYEkSVFMw7CXQCKu7wePoW/JAq8yDQ1tc3l+XWqENxVOgGaMJnf4RofC0GXJHADA9Tzf8b0uz/Tqa2bpnlGo/wywdGPkBaBH+8oqywy/mI47TLUa+Y6GbSRBrQy8iC5nXt8b4r4UGQ7KGrQJd+uVLvMj3C3YrR0dAa+L+KQeyadItB/6Y9J1pQjVtzh6u1ix8CFQCySJm6CltZ7I/3SRhLxfvNHWbxygcVIAUDRnZanNgRSSmZoisEIZWd7UtjxUOEnSu+U2ZFiu7z+Ebg8S1uWeNfXvHYBlKtBSadsijhYVxDjnnGuqMvXOLE3jU+kbwHMd13O995x0ZWW7K2Piobiufn5jZJUBoOG8EoEmTOcQY/tJVi1PiPO6LKdTwJKG7b/+KyyZq13PW59sKTK4nvvHyMWG1OF6t3bk9mWeNa3764dAV4FVBpxNEuk7zspvNjlTTrxUhOppDKw8PyVNOlIlDDqSnwi6D6ZygkfbvXGA4iCyLZyhBHNNFniVoZGXTaXJQ0WTJE5TAHBXvmNqsjz2nDclziMOoGmqorsr/x2DHcpD01RloV+fmMfrZuQFym9BQazjlNK15U+BIfStsqFTHmo5vuN7dZEXYonD1TAUUMPUPDreGO6jLCrBD1bjz7Kk8KxgaSMcPkDb9x0r/8SMpMV0CvhAw/bagrMh7kTy+IHqpS1FBkVzXS8mZVHbq/UuUF+tOb6sVl7waOtQX4pNNRVOwNJomRyVEy8VoXoMtWWe138OOlJjLT5BNEyPnr2yPEtDSBoH3tKyyH4B2Lb95FwjTMZiaWZHJAk9xRoaec0KRR5YUyRxlAF423Dl2poijz1ntMAa/AKYzgk6iV4hHL/Qsip0zWvujN1ZtgUFMdpQTIoVRwAwrr21EufVxANzHMPx/D9zkoqmrW+s/iVTYGoewXxjbLXBKpTz4lgAAM5xcWDWc2gOAWhiBt1Ud4OH0EFC1xbRuTSjv90chrhz5+uR6uVe6RqEZkEAoKVFYTte4TUryw/HN0ZpCwCK4Xorz/uiC9Vzeo40xLkGlaW0JT4OOrxUhOpeCtO4AGKc60hRNs2k8CclWBVJ49Ayim3t1wS8RIO0ezvcB3F3h6UGzfvAKlNBI2etgeSB12WWRgCw3mxD3zEUeex5Td0E6EkWZujrYtQsN9d0cy283hm7s2wLCmIlIWWqrj/ZVLS8jSXtk2Juxiia46H3PMuJbMajjThj7aF5NA3CDw5ci6XFAZied1YqLcNxfCgEXeflVhg+BKrQNQacO8BM9eqxsHWOVC9l7Xkm4ie1g8/z4NAis3PnM/Eq4niO9uMXKRkDCHzT8R0/8B6i4vLBWJjzcKkI9Wqop6bKwY46Un1FWwDwd+swNAJNR9I4tA3NDYAD8PJrsT8UgC2d/wlFuYQNrl+W6Vr+erNdue7kANiGygSAFWoZY8y21yi3vZVuqFsE98buLNuCgliJc10RuKNbrrhmJc6jJJ1K3y3FrzXgoshHdSSOPJU55sLjj6IizpFrsbA4k13s8svNINcPg0dbuCQ63qF6rScQ5SEyKE9jW6jACRBSmK7leIWju3aRJ79YSgB2oSuvAs8Lkvd9WtE7eKbZZkUoM/hzhKn12t08twcdqQFXNYC5Xu/Wa892ZgfAJpQwAS9XTw4mP+bffypt4znBfwcb7HnhZreydXnsWUP+uyJLAPAQrlBTFMZacuqOtpr2YEN5d+zOoi0oiGWGKgsdcQy0Mb/TBpdZNJP2cSx2GdAkKTgwO5U7mhSnwmPC4Omi8Hi5OEu26ADIsJwweBTa79kF8mmRnABJbgAAIABJREFU6nUAUU4bEHw9gihzy5yVABxb3Wc4i0k0C8A64Yq8R1Gtrfp/uhZ/7dgJBj0pQql/4DyDWZxqwWMmHamBJgXAyg/Xu/XadScHqOcwHwH/YhjaW1UkodbTdNvQUNe76P0y5fnH0JXFvsVRH3qqDBxH0ekoYbvuarMlMRckzT4EovAh8OUmhtVXQjtQ1e3qm2F+MHZnwRYUxFJVFnvqpOYjdO33ipI8jqfKaCT0tQK8iCKlLW1F7g58IUFrEfqZPFwXHs8X50J9eWhx9JYtO4AkyYrmhvafV4T5RarXAUSZCEVFst0JRJk7TmG6meMVroWLMi3e02xO3AWZlHvm+wSNN+Kv3RkMGieQyuqTAGOeA9AyrY2dEt3spk0OAC0tYgA/8MP1wzrsMO1FWbezKcrkrqJpGmOMbbZuX0DbtoOqqkp/uQOED4Eq9jSG7iE0ZGCJDPw0OFo1Xb94zbggaQal00x2N3gMNKH5Wdm6Jol9gHJTQx+O3bmxBQWxLhJ6RlzjCQAAohzjPN5XAAD/8i93rwMAUN4WHs8W50J9eaAxsDsOMJlwA29dpHodQZS/VFYpZyBKUtiWk9lfHde2X3Jc4vy1OCTuYy3uAKbc9Er8tTuDQcdQKea0ChxGQQt0bKjSTZPT8wCgIYgD2PbKD9e7OMFNL8qmRmrGAUCS0UQsax+32/4lIzO56Cql8INHW+wx1EP44MtA0EjL/JCmIFVV9Tj92QiSZnTpNKgdac4nWyBv301dlYSv6LnHlH88dufaFhTEgL61tcOe5nfkP0mR/qVu7ELh8WxxLtSXBwy1/Tvx6CtbpHodQZQ/RU4fzkCUuWXbhVnkrmcVpEwxJgUsJe6Xqb7QQHGkIb1RyzUBAATThHHktEpUabx2AG8aCEmgArAdx/aD9H2fk16UbaXJcAmzfOUEOxXNVlWLI2Ph4kqu738RupfCbA3/sz5GQ2Xq2kXwHEeOiaCrXRUXBAA4pYzbK6K8aKr0dRyGF5wWf2/szq2CGAC0b+RpfXwLfzvL0hfLaAe7qTudL86F+nL/Qmzz7zrAEtXrLoiyxYVt2bnzZbN+zsumxIftVvD+nJ6qvqbtdao/Pp/Rvn6SnQsAYFsGwDjyJtfQcJVO6b4rAMCIn1UEoJm250h5/L7nAJAobOqunWlCHu1aOwNm73w1VNRLkvaVsfQMyzX1dXT3Qa/LMq1oEWUAQBn5pj7Zgti9aE+CMAxjEqd3x+4s2o2C2GR937VtS7vh6mNelNHK65b0lQNcLs6F+vLeUpH8Nx1gkep1H0RZWI5dWIX99IuQ9KDTBgDQlFOJa8B1fZ3qj8NZ2YTPBSHjcw8AEi9N1NHrpRRBAIAZxKEipBm4xOgTAECTvGV5BADD0HddZyBkSbIkSbJxmLR2c6gQjuOO4QqX3rKmzMNBc0hVF3lCEQIAnID/JPV93+efJEnqhr6nOdwZu/O3rGWsbYrvUoFpe/4xL8po+hIm4dxjLhYHztWXu4kv/LccYJHqdR9EyXFhF6btlnVZsqrAZ2f+eg8AMNAYX6f6gDG9ViEC/NwDgKR7qCusy5E50MxHOUwonwK1ivkcUwqJ1zQFAN62lNKtHeqmZTMndFxLpJQuHiquzJZnSkRV4kyFwCFlmZu6Ig4sA4gFbS3Lfd/3EkII1e1h0N0HwLm/ZtM0qEyicXySgFF06aKMNm9PdwuPl4sDcKa+XJWM87/pAItUrw9AlIXl1N04jn3f07mjerB6D9NJ5DrVB5okGOxLykHT/AIAyRq+FvZt9XYSSqV5OmsNSdo8yH58q2cZTEopxSQNJaasvqNQ7vUwJSWj9IaqdG2BVVdF2gNAYetobEvHDbCb6VJHKwCgkiRJUtf3va1rmvZO6Q2e/d9qhaVCrUgtjqJs9tPANyXzvIzm9gXAvXnfN4sz2XQwBFqn+AYS9htbpHp9AKLsLyLs5VNd7wGGrsyuU/2x11eyrohXmV77C0D64tMlmvL0JVtcxNfS5UdrKkxIIvmu2GeJHAZiH6cpJqRazq1PUXm7YjW29KgByFR5bOvMM237sya2DbnYiixn7Vqkrk5OFexOx+6+LaK3vzE6EwCg+W//7fqlXejK4qmMJnyylKk++EHh8WxxDhdOhx6AV/i3xJBru0v1ug+i/OBiexi6Bt+k+t1yqt/+gi+XapBn1gHAqDF17qSTA7wCk3maIsY402SGdbGvM6kyxL7O0+QSHH4y7+gAnzrGKmwo0jeAXAJeVxrRHD/YtLgwDZirk9w3VpbohN5bXlfV7FRmcHbs7hsD2ur38eY3NtUpDmU012oM+FeA3xQeT4szm+sMnDJCu+7vhoBFqtcHIMqPrd4PPcBNqt/VhYYWAJeTatMiy9NxAKCnOswOgPjMxKNJiqsWAJrcUAVeZ7rYt4WUGWLf4jSJ0nlvvUz4Dvd/hC9Dx+oqVWT4BvAQ2lJWWkRbNWCZxnRW5V3b4NJZq1w0vCTJclzOeADXD07H7r6AutDvnwQu7RbrPNtUp5ARKfd7w4f+UKr/qPB4tjiTue44cFoTXYYu+nsOsEj1+gBE+Rubt6mrVL8rU3Qp0TTZV22cmdXX/8dxAAB6DM3MIFQ1+XsLANDiWg2GbwCQIKGjpaaKfUdEXRX7jhRpHE1VMvxilse+0HxygtEpPgtDx+pcV0YGAOHDSm0ZzYUGsfZwVm1KUpaJ4AXiwN6yKE2zHFMAANmw3DD4NOfe7fdc1/6qAyxgnWeb6xTf9BK7G1M4ziT8oPB4vjjz14Nx4JTkSOjY39wBFqleH4AoZ8N/YSYTHFN9zd/epvoAW8seDQvd+pbuOgAA0L2kCgDjnNW+5QYx7gVJeeiJBt8AoH8fWJ3rSOy7Bqb/4DSLAABwDFhlaXq4PXI/bwciAsHWsKn0DQEAe/XJapt2ECQNyXTmF5OSpJpQF4o48IKkUXyQjEWyrGhuMH02+KUtNDLv2QLWeba5TvEsDevNNiTvh+3wbuHxcnGOX09SxVwDXuO/6wBLVK8PQJTz0D7cYsq730aFY6r/lC9INFn/gwGKnxByOQodxmhOCiVVVQBolTqe59NBXfWCpKg8mzEW3c2sjoNFUFuIk1kOB5po8gSE2HcQFXO1myXDXMd+Yk07CJLtG0lFeQcAONOR0FaFLA5dzrI4ipLp84mSLMsyEhMBQLP/2iMw2yXWGaBvzs4qggoA7W633uD390Pz6F7h8Wpxjl9PUt01UGIaf9cBlqled0GU0Ez0xCFLinvtyHNrfwFIn/0ayfLF5xq5AJLgi32aJuS8r8Yp/nVwlQHTFgCXjOTGbkQ26wVJURsgd9SXjva/X7+QEABATyCMLyLyhyfbSVUAUHTX0Vk7CJJh77PZyccEQVcXuiwOXV3hNI7moK0oCCEkN/sGxD+mKfQobH4rugAAK/cC6+xCVxVXoOHNOtyV+2gfzc2jxcLj7eIcv56kbZBjavOk0BsTb6dfzLZE9foIRHmgJ5IkSv9KLaz9BV+Gfjil+v1RIawruNDXRZacq8IUBjSHQ8FAEzyJQRsyBEbFekFS5Of5f/u70EVSzwvRQWLXFtHbB58nIYCeAADGZ310KnWiZbVN3ci6JY49+zOPs2xy8uatp8RSZXHoGKmy46dDsizLMqq6n/3TFFL0P+oa347gubGH0BFOWOdRAo6tSwfwN5tNE0X7aH9QIFgqPN4uzvHrSYFJ/elEveQAnzxz4VUAWKR63QdRLtITP7b2Kk7SppoVwkSQxb4laXrO6pt0pA7vxTFAZhi6PHaVpRjCOLTVPAAK+eFDoEk9NcRAFbvGgLb6ICQl9Gn6R3+WgjUNebZVSRx7RkgeHciLzYIuCQDI8qFEOt8EW2ubsjBv+C43Fj4EqpjOWGdsS8Dyqydys9l0+/0+2u+PdJeFwuPt4hyMna3ykgPsZlGB22bJkt0FUf7/YoU1K4SJWBb7riyyc4rP/3bz/sxQJeC1ZWuyMA68wTlpAMAw3eDRkXoM0oMtdgXUhfFXcvJPmqPr5QTJxinY2uQAtMyTKP6w2IumLaDrumkb9mxOG2yrMvxuaaazXrGHQUfiypWgugpiymYN+30U7aNo/8HFbhdnNsuSTF2dx+QsOUD4EKjDaTbYEUcyDLSrquKqsXEXRHmBP+E4+if4N1ihAMt1gEbUZLHvGjJd+66RSIKOTWLQ49BXdHpQdcMwnSep+7NW1zuJfc+Uv5CTj/AoqNaKzRS+GCobTQ7QljiPo/wMQvSGtqErC12bx/8vwHEDGDjnCgAIvtfzusa6DN3yPTspiDm+90Xk378PpVGS8AFBDpdxY72R36Jov4/2+yO83NutXYR6jqO33w2WtSyQNN/FNWV3CkFu8GgPoqG0vOu6MxzJMFBeYVuVLr/CPRDlBf6EJfLRAcbfx8GT3eX06bu1px+ktU5fPBm7gxj0OPQVL6IUILBkpBrGQ5xvBXdtvoiiKP4+/UUPgoDsLkrKkgDAK7VNpEji2PO2LPOsgDMIEdM320AVulqfYLQIHbWdAMD2vbHnNc4RdDfgwGsFMUVzff+Hin7pKtsGoc/5hWqpLPvOS7TfR6cMAAD564dAQz1NgNM501x+AHXbApAUN09yUtfLDuA47tdBtJ2fJWXtGY5kGCitC12C7i9VNC7wJ0fWxsV3PbejGLBA72Poz2y13oX2wQFoAu38xVNOS9NSkSyMQ09ZlUYAu9DljNLO3nmC7eKa9727W2ZAHL1T6ECHsd+XRZSkBACWYv0RQmQ54WZnCV0+F1ymU6B8aMvIoyBrPNdGflviulYQAwBBBoC94H32V8H26s8ibRM3TdPUzZkwm+O6waODegJtU84OsPgAjpEKACP7TtIkycmyAyi64zli954WuKzPcCRDzypiysApgX8MXSQMvEghdJDQsTxdu4oEHMevh4W9wJ8ciQnX3xXOU33OB1YXTTudbz3fNS0NIXHkXVPllxISuu2Fj/5c4B4JtPXhiy/U98OHQIW6MII/mKCSpCDyl8UAfuadbfUMAGPPyiqL4nvb6hFCZJhusN4JFPIp5GuqoijKwQFIVAqy5j4ArewbPYBrBbGjaaEfrOznq95HUz1vN8MwDEPfHwBEgmE6rvtV6X+yujC1aWVvH8DjwXDkFJdpmmTLDtA2OCVjS9IsK8gZjmTo2qqIBl4TgPAh0ISBWmq3m3Y+tA10CVgCx9lWy8SE6Pa7nlJ90gDOQBxIUgCsNqHnmKqqiCPnNbYuJSQUVbf9z9a0r4w/aZ3fruzR3ODRFocYalUCXudNGJSL0qxH7xxmodOxZ7Qq4jg6C/ds7ekI+raI/vUEIZKRorsb42WuYCiKoiCE1GJuDo9RLRsb5GbaLUV1SQQGAEBc+cHKe5au6xhjJOyGoe+Hfhj66ZmwbNtUbXebl5lpWebkALcP4PFgOHJKSR7FybID4MzgytjSPI6z6UERvO89gIicIBqbyjYB3ODREQaiQb/e2UKXgbDZuhKQiS5xsCvwF8BybnpM9eMcNCAAZRFPCleupWmKOHJeFgYShrNkQxRFUdY+T6lcQSZwxD+GDhL7tojeYDfvSPn/BQCabv+DMOx/ZqoEnIpfEbyUS3WAo3fCQei0a9uS5FF0Fu75JrQR9IdOnHBqs50oho++qiiKonDO55f2bWhQ6/cq5CfzVqvVKk13N/8jFaTt0A9DP/TDGwMAsCzL9h3L5bZlWaY5DYS6fQCPB8ORt5TgLLozJi7TQFXGlpHseJxrqjcAETmbsDJVVQNAmvMkDInAm3CzExooINzsZHg2Lod8X4K/7llR/NeFV/31duPZlo7EsWsKS5WG9swBponxUlsLIP5xuJnTTWp0YNJ6F+rHIzRSde2hastnVQKu/eGtM+dWlwE+ODnBWbiXtltfPXXiFu0hdJR5nuXhpYvk76/UpYLVatWnbGEs+V4U1/3QD8Mw9D8AQDVNy9Qt5/lTZmumbR9HS18xg5a+3pIDRFAqaORtlWen8zx9A1HZ6MEM+JNlWX7kAufvmrM2niVpsw43TmRq17oC5+Cvv2eWE263rqUpIPCmiEV+Iew6JVky/j7C+hj05yM0NLkerh9OR2jOKux4pPD+bGDrebZA7isw3bNjuHe22/NO3KKtd4Gmaxo9QY6clWOoB6zOQl3qdnlWq8D7mcoLDhCJories4AfAGBatqlZFs80y/GwadrHY9a/jRn0fy6+k6ZCGPT9XBzgrEyUhzXnHEAAAClYr8P9fpJuu7Az8BfAhJM5EoEGXsT/9ewwLT5MeziO/gVAVjR3FxRpO0ia+yDypryY6Koq0znrzzA8vjgfoTNNW/nB2REaF7Zp265PTGxapuVGhJZHpkzPi+gth+06cJEAfVvEi+SLQ7i3dpeduEULN1und8zyMGJZcBzZ8L09aRiHxbrUzSUcP/DTNNktOACNxGkP6CdEhWmaluOYVV1vprlBZ4qeS8ygcWBdVWVFDn+nGeQ4gqIrfdu2vAMgqYoQeuB8PteGYbBOoyRK8E1ydQJ/wUw71Y4OQA04P0yLx3/+C0DX0iKvMG4Hydg8+iQ9l2idQqwytu350WA+QqtIX61WZ0donDtW5gTYCSrDdBxO8ow0h4NSTw1oqb7ehYEmQN/cTyYFFQA24WUnbtFsf7MdHCCYUgEAbMcGWdfiuCBlCYt1qZtL+IHfpylbVKbYi6K42wz90JYAYNq2qVmW81yWgWVppm1aZ2ecBWbQOLC2xpal7A8O4K9c29RkWew73pQZSW9TZMcBQbHdBJesbQEShBCSUcC7qcsahmETx3G8VAQ+gr8AwPXD8ME5OgCG+vwwrR7/CQAlzs1vSpm3gxSo3lX+pGmaoqoqY+yqpC/IAAChtzo/Qhd2bheF4/rEEy3HLouyxvnhoNRjYHWp++FD6Ai/ie1w24lbNlFxNRbHJcEuwPCuAgzkHadJUpQAK/O2LnX56+M4rlbezzS9uf1jCQCxKEriNuhKFQGAbZq271hFWZaV6diWaZ07wAIzaBwYrVNTFYZ4coD1OnRdW1Vksedtg+1cia5Cku46AALqkjwpClIBRDKSZRnJ4VToUMJQfI/jOI6XRjIdwF/TRJUgfDw6wEuFzw/TuuN7X8TupTABoLANUBWWg2jO7IhzeoSu6Zqm3KNde5dH6MIpLDt31tgtkeMoGFcYl4eDUveTlpapm07wsBageyk+OE8udeIWbWh/Sl2ZxCnWm+KnAgBDW5c4SZIU4CF0rutSN+HECPw0TdLg4sVjnSISRbEWqpJxAMU0LVMz7YQQu/zDtCzLMq1jFrDEDBoHVhHTEHs2OcB6twkD19EVWex5QxNbk6TxqpoiDwCCKEqKblmOCxChqdr9EPIaAMLQfI0m7bal5+d4l2RZVnQ3PKi0J06Kzvg4sqxoru+/GSoC+P9Ie7MfubWvO2xxnsniVNXd0r3qnx8CG4Ff/WTA/rfzFsABMiKx/SEJDCORdCW1urs4Hh5Oh1MeyKpiDd3S/bJf1K2qLrJ49hn23mutjVTF5MmbDXh1YxlVs6jkAAB4TdM1VdP3tyvslyF0blo2yWzH2RDOMbKiLAp6zHAkRWKYpmqapnOv4qd2QzVkZTcqcTesSCGLfZvE+1jVUfEARtbUKdnv4xt5qdG+CPYmeN6QxGlx7gCnPAUvDDLHkqQ4HgE5Sv2W5qalmaZxiANuM4OmvitJLPbtnAp2wvBuVtUQ+KGriZVIwtSeE9rrOAc4SXctkdXUBJq9NNtD8AwgCJ6X+f8+9lmYcTJTDgDi/THBtg6mlUPSmDO9D5YD8KrhtUleroAxpqGrqq7xdX0T2H8ZQhdFblk2Se+IA8v5ktHiwFPiNnvTsnPD0ExDM61a/0X58zcrcREKUexZkUSJskj0jayrSJ7uo8Oed8xLseCqJ980efZTkl6mK495io6fqMj1xT4CTMMwbdus8QngmGWZhmka0jJZrplBfw3gJC2IhbamJiACrhsEd2GwsVSRH7o6T2V+aBm7QFClOTjRGT55BdFVAMVelCRJkqUP/WSafx7G/xelqLlIKjQ/WwAP74PEBFFSzEebAy+PFUmSeEWxNnTDNA2dVlV9a75ehdC55RS5blnOZjKzoihIfkwY16GpG6apGappmtG7yz9uV+Ju2HOjiWLfVVkSo51j0bFnVZmRDMdgZc5Ljffbq3ofDP3DaxwnsXP+3zfzFKZpmqZpiyoAaIJpqoZpmrN33mAGlc/gJNO/ZyTV9cUBHD+8C8M0YaOgmB8VfmCsKS4hdGnOyX84laos2c6qruq6rupemySdZ23TNOvyxG1bcDJN/23Aw9Wr5yxJQRAEgdcBXqo5SZY19YiL0C3bUHTDjCitnKuPuRFC0yIzDDu3H8iwecorQspiODyQ0LA0w9BNy9L/+gVu8WYlDgBwcRf/y+nHG0viEqz8fFUEuB+u6n0ARJcmSRpnt77cpRmmqZlms9yPY1g2OTrALWZQ88xJHkzDNNVZKtaw/Y0fuj/jnI2C4gZ3I2vL/AqWC8bx44QD9VQM/TAIgiBkezePBb9lHeu6jr3vAkuZvO/7rzfG/9wBhr5raVQBvKQ5noJZXB8A8OAYlmeZoLSpbzyj6xDa5GlRZLptWT0lpKBlcXgerEt10zRN3TBNM34TDDfbzUocADi/M1Jr40QAP3jnVr0PAIwfaRpnq/3orLgL4Ig8gGEapmXmzw0ACPyDaRjmKh97zQxqXjTBbbQZ2C4ClqnaGz96fo3bUTCaUfLKxLSuHMAwONHRVLYks/xgHn/tmXjjEN2HXcc61rHndxkBJ5zM9en9YvzRlSSRBwngJT14CJv0tFPehY6t2SYpqxNaxtwd9ayuQmgvdDdqZtiZ/Sh8ITXJSXG4PocyME1FNzTTLH4FIL1ViQNujb/mu5apSRI/Dl1X0Sy7qQWr3Kz3AdO+S+Iki1e3c1bcxSykMn9hy1BNU6LkCQC2ZTsfA1fvxAUzCP3KsURA1TeO2WfJ60sxCt4kW4+ZnaqXj8IwwImmrya0ZR3ghX4QBEHgv+w5AJF0H3SMdV3H3pMLP+Bk+r6/Omyd+DiL3QUy/UkFgJdc3vbV1fE8vAusjW1EGdsd331IpdwKocO7cGOWTW44OU9ysloAAFBi2huimZYZ/xK5fKMSh9P4n76TE3iBZauKzI9D19TEVG85wO16H2vyJ7knaZxkImvIF75kl+oeAI7IA5imbRtFWRUxsNELOh8Dj2+8YgZBeJRtTW3nmSwCsiwrOi1psn8ZlFG2y1LT1ItNSbMMgBMN6TWeQQKhH/hBEARJlPgAUkm+79qu71jH3oHKLTiZG7J5Bz4OpvUoq0pbdCMUfRzX/EM4wYPtOimZVzoOEB+P1JdbIbQb3gWbctQdw3jOyzwv6Cp4KCrf0AzZNC9PYrfsuhIHbXMY/+Mkc+7CwPNsVZP5cejKJru9styu95EIDT9WcRbHGomR8CwuLoq7wAl5ANM0TedHQehrJYl1QQPTUo2jA1wygwDhkZctT41JvYhFS7Isy3lb12RPdg5jrJUvq5YzjgRjXuVRkuQFMM//oI2iOVSNZMljfcfOHeAS/LXgZE4tik925OMcsXp28GArddmNEDeaMqy9RlLtT6q7v19CG6f61B/brt8KoU07uPfbUd54NMuKgp61m5kb7Jq2QX8H6HRZicO0FwEliFpgHBcAeBjeB75v2brEj0NX5vpN9MEb9b49WAFUZJ/mhopS5rsiulD3AHBAHgCSahqkLJqS/vVAS1rmpmUf0BfXzCBNfQQva8ZrQopipocLh76qPcvdru/7QTrrknQiGIyspFkcJwkwj7/0I47mdSmSJXnZBP7L+u/OwV/nOJm1Hfg4QHiYLbJqf1LLuhshGp6Tl+Up6ydJkuyl3KE28JP3s2Njr1shtCirzodxFB28pCQiZK33j74kumXphv0XvdGu+NLOK3GHZ2PJ6SsAsLbrAN8Ng/vA921N5sehrbIvt5NLt+t9q1gvOQPSntQ9YKx0kbuGfJVZXVJa0pLWeT/RA/riBjMIfzQY++ZbFiUJmSFhHMdx3CzMMq20dI4XOBEMRtZUeRLtE8DxgyCwn5Io2gIAiCzJ9wHrOlad/d0Z+Euec0cKuaWcGs8esD1emOd54UPbdCNEza6ilJ5LTNDPK+jgvzj9eCuE5nme5zbcWGXxPqFpeh6akfKP1DTMgv6OA5xX4pZnY1ng6hcAY1rUwMbfBMF94IPEgyBqWnRjxcO79b7bdlT3UD6tHCrXQfgxJWVJS1okkKc2JvQtZlD/pcHYN0WRxnEyQ8JOgj8HO8+7nwgGY8fKIkv2KSCpdqhG0WtSAVMPIJJlaRMO1alKfg3+enAVRZIk6borJLB4wPb0+zAMXaxbAj8N7DVPLwBzAHecD/zj6r9vhdAdq/MfKje2eR7vo+yCnkNpbZiGlRUXidfbdlaJm7+jZQFL4bWIMsCyfdcP77I4qwdBNOT0qgkigKtg5UIwE32T7y8lIubirvK4ft8elQEUUVZURaaCilNHouwtZlDXfRvGvpm78iRzx5BDY11R8WVJEAS+O9ukb6afuob8jFkWvY4N+Sox1ueyJGQsXxVJr//uPrAlRVE4xlh3w+3jYj3+YHX+g+iKwE8Dq0gR768KjYsHnI3/jRAaKHMdpcSNPc3OOuDN1tDCtnSR/vIMeF2Je+4qbR7/aR6dOtsDpmVZnle8vCbFIIimSOPrfgPXwcqFYCb6UsOVRkj9Aijn3/e/P/34smqR8DYz6FvXN4ySNN7ngHhoa6Oq2qYbZUtVFJUsndjfsVznW34kUSxEM5wzkoSOH4v4vSLpASfTNi27tdrGZ4flXEejzVQc1lQpic5Ejidg8QD+EdMpArsRQgOJgiaVuLGvSB7v9xfLT+qUgam/JRdzsJuVuKeGKJratuxbT2tGErRFAui6atvqc/zymnWCrIttcqszyGWwciGYiT7BjTu8Obs+AAAgAElEQVSqXy7G/017G9/2o2aM0rkrjwiwrmuqjWH7oz7xrmcb6nPVdIeHxIV3ga1IXUei5/0pUxqhK4Ai3wvLArTnhxnNGQH/KrRlfupItufDjSlxM4L2gJMxaVW37a+32z1aqs9UHNaVJM9O5TfWEFr14zh+ncA9TtOQjKRmb4XQ80cpEjf2Dc3T+PKxspIWj8MXkr1bBrxZiat/aNpjy+hnvaNVWb5WrAagKIZh5EUavexrQVPEnkTXnaCugpVzwUxwNcitxGS9fnL/beCI/Njl0Wvk3AWOIkz971CwXoq2onMvKBFoaGJtnE01SO3EG763SYuiXjCckqNZwb2vKIzF6NWKHM5zV5zqtYV3gcpPbaaCvwtshTsgaGecjFCQuq7sX97lM6sMfaHidBXNSHL0v6Kgn4Uir1n/DR/bKuXJWBDyVgh90aHj2oqiDAmlzbsOcLMSB9RcWcRQ1a5NSFnOK72kKIpCm6bMXxLBkIWhTK9YKNfByrlgJsYvvyG3FNz7Cj82ujB1bnAfaMLUJgD+zUaT0NE0Ku9muN0lzC2ODsVeEcg3Dc30u1Gy2MSrTiC8ZmUxB0qO6xqm6n8wFUZRyiXN018xz4A5guenUkPDBw+exh1RNrzsqMNrWhRFA6zrJKuEwUSXdTDPb/XkBACQGIrQZHFO6VhkGhp1bBLyVgj9nk0tBzS03NdFUVqYyjeP5G+tqFWqgmpy1536XMzScV3XNeXPUZeE4UbR+jpYWQQzIfzjLwZgGn+DmjsTHog0tXTjBvcbYW78dxdYElqiQl5w0sci5+FBH4v94kypV0X4WsUmXjWG5yiO5/4UQehvHN2QzX/I/f+r/1lXxFTF/XhCcQqBLfFDl+/5cP4h+r+BOYIXxwylxzveB+eEoB3ZD2Eo4yQjfdcW+5yRpjvn4zT5k8xu9nFYW4RSEhjJ9smAVEFbyGNHordC6FsMzp+z0C95klnddmVWMdKUDfnxGxe/tOuWb6dQaprGN46W18HKLJgJ7Ir2KwCQd1GHsy2Eh7EilmFv3D8WwkPw4CqoEjTCASddAbdpeSKQ6bomoi8txeJGlub5a5TEWQ54u23gb9SNqKl/PpkPfdFkuizg5YTi5Ocf9NMPhwcgfJi4sqoFf+Pdd4fWKkUKWRzaNIrSisRSz49pnK8TBsO8hqcJWUVFx/E62f+6+rko/usvntItBmdbjscLFzDAjyTKFVT8mKbFymfEQ+sczbMl9E22f/61ysc6sIYiCcOtkbwKVkiMRAR2AIcvAJp3D9SzHQgPhuM6pmodCA+W+9FEBqoPB7idDtyk5UEEEk0R0NeppQnc2JekTF73cZwAQbDbBq5ly4Io81uvL4iuCGP3ckJxSkeyxArMCXQtTfWPXlmVguu58ku8pCEiFKI4dEWy3zNVGAugiKJ1wkBRwBZqzikqOo7Xr+0019en7lsMzlynpwsD84F2bMnq4vzQRBDvltY5VuAq6KkKVl5cZ7sNbZHr23x/8MRjYK3oH3lZEvvyCttzI1iJUMoilurWF6DLr4+Ol3YgPPhVYdorwgMvP4BJAi/JmuNuDjC3G7Q8iADdC+jZTKkf+7LJimi/jwbA9f3dNnBNVTCsf5EPrMx0aezaFYpTPWA45c3mD374sohnkkzXdH1TVpXgeu5rlsazpsBzo4ni0NVZvO+EqdGWsHm1cK9Icseo6Dhes3muZ+iKKAhT1zW0PEvrneb6urvcLQanJOG9QOnoM3p4N7fO8e49C32Chhjl2XU24W7nzcvKwQEOgbXhdB4vSVKXK1h7wO1g5bkxRfFY3fyCnl4fHS/tRHiw14SHM+PkwzLzFjMowXCg1I993eZFtn+tATibwN/tfJL20j/+qkXtThPHtqErFOeM4TRUSVbtjfdiLinvVFc0TdPcqhQ8t0iilMwKJiucDG52XV/bISo6jddsd6HraNrsAGWVG5p8mienub7uLneLwfkLfYgTDcgP77n2r1SxvA8eV4GosnR2HeK44Xa3IoZjCax9y61HbeBFSW50blg7wO1g5UehSas48MtQkV82iXiD8PA3bG4b19XUNBVJ5Mae1TQvkplyaNtuEDxHpP/Udt9hVruxpUvzxyOKkzvEqtxpNUs0TdN0/UNVCq7yPUmjOHu7YcZi/z5w5DnqYV2+/x9WUdHFeIX3vqtaswNkjaVJIo4ecJrr6vk8uMngBLDZbExdVGZt4Y5E/7T8/8nFNScwv8myJCnmB/7zUiVZXYdphu3vtlyD7HiNhiZ24bj1IHkDL8gy4YcziO3tYKWL8WH9rm+/oSz7BuHhtlmeaZiKKE59X9IsmZ/QXFK8LZmra7q9SffP0QMAfPEGOSSG9ivYJIBU13RD07VNJbhJmqR5EierjXPvbixDkQQMfVOWWRqPWHp4AwDYDF44tBG47Adq+w+ubUqCMHXtptBliRvYUZrrBDD/9V0C2IbuxtblxQHaWPqn02tHn+H55Q5OgrKr6wiiJGv2TvuykrYjtClS7W6UzHbgBVn+2VdnAKs3631/294gPNw06z7YGIYqiVPPSmLIXAa8Tw2TVF3XX7NDk6ZXZRPouvob9OYi1XVF17WPHl8ncRonaVKvNmjJdxxLVgQMrKlyU5Ne+7l/5uIAM3jh0EZgvt5GPzRllhTro2sogjB1TZGqEje09Wq6H8ZN+A214mC7CxxPVxcHKN5he14Zd5bKPM8elEWiaxJ8zW0HXpC76hb16+/bOlmy1FLeIDwcbX2TXnDvW4aqiFPflKnKjQcHOCy+09R3dZGfoN2LxkmzLL9N13Wi+FtzK9FUXdd0/ZF9SdI4m+VTjxunGviOrSoCBkZr25AEPI+QNeeTAAATm7EdxzYCAOA7rKpIWgEYx7GTkfYDrxgfNZnv67q+Pk8Yj21d/WI3NNxgu/MdW18cIJp+R8fx3LSb/HpN00R0paXo3DS0bdOweTnnHFvXFUUWFWnqSfSf/saFTjH8SU7lPcIDOI7jHoTV7Zkb/2Gjm4o49SXRDruSeFp8p6lvmiKScHCAM1TAm/91y4ZhHIa5BTq4w/w4bpzezEQTMDCaG4qAgUWQJEk2E/4kTrdqI4DQZ11FM32fAQ0lqdLTfuAVx99yrK6ra1lD2+jbqiTJu5kU2/X83c53dEnkALTt+5ygW2aq3Q0vSzVFmPoqtTSBmwZGycIS1zx3Y+iKLMuKNLHfyame7BTDiyc5lTcJD+M4qpL6YRRE5Xjk0TRj84dtKOLU01Tsm3k9EU+L7zT1dZlJJx5Xv/RWOzSDfgPMdcM819v4G9eNRLeqqrYqy2y1cQZ3YbAxNQFDXWWxOPWsmuOd6mcHYE4PntoIANtpZE1NDEVABkIiqR5oP/Ca33F+TRTDury+Yw+MVUWm7d8r8eqm47nbnV/U5QR8fLu355tmm113I81b7AUMrDTV2QEaOnOm9V3oOY6mKIqsSNNtkZo37RTDjyc5lbcID21b16E7NqMgKtrhlC5Kimr8UbUVp3+UWLVQIEUcF99p6hui4QTp6Zqm6XTLX6JR3zHEuv4dYQV947qe63nys/KxrmvqVlXFgGXjdILwbrtJ9wyiFugiurY6Klo8MYA1cY5TGwFwW0wjq6pcFacuQ6oIozIwHuA7TrVM27liczrONLRtRQxZeH7HA3RdVW1v+yMu++nvI/uxdF64amIFIMHQlbmpqAI3DYxREqWAHG53gbtRDUWRZRlf6a/rYStbHRzXciq3CQ91RfL9g96NgqBOhxnbd21TfKuqnttwm+wgViTOADsz48AJxi6aqlMnlKataObUw+xCu03gZpQ2vxFmuq5nu67n7nPJ8MqyqqqqPqHFN44fWk8JYRDNcrftyqo4RS5PDGzuhnpoI2CHIaaR1bkujl0D7IWpP0QMmVPa+hWb03EwDW1VpbKA7h0HECXVMPU8eUr76Z81/s40dnWd3VjLk64pTFORBW4auo6W6R7wgnB75zm2oSiypKR28nfOnG/YG4SH3DZex1ITp6HNK3tZAqqySJBVVS9iRbZfDgnVjx7gldAvjNPjpEWRavJWdhnHwZMMb4jT95rgHs31nMD13DKNFMP06rJqq+rkAIrl+M8vrzGD6PbCH1VemKs1/Il1XXmWOJUmcELQpcrIKhsoPPkUMaCVLrsIaa4DTENb5Zo4dfVtEcv5u4uiKEhNS3/U9t8f/6XzQl3otwbyRmDtekG43XkbQ2CsIaxsflnqWSy8CwNnvgjL8+j5x9lLtwgPuS5Npa2J0zA00uGrmfJYKVAtkef6E+rzcErkfnTgPSNc44FJrivy5G0CZlifiDzSJI6Sa3DTtbmu73qe/j3JFcu4q8qaeivKhWObTZ68vlAoHa/Zhp2oa+DDU9WtwzqQpxacoG3uxrK0dEAQxWPEsFRez7N64sCBE3fUlEdWvrfMDsMwDAPHC+rfkvM/mDSAE9QpVfB78keWtfGC7Y5FNWOMtfQt2SyOnt+OugnuQn9Os9W2jmbFanmD8BCJU0tTVZyGYXg8vjd48DeOLos85GsHmFyA15SGrcBgqSrLU1NYqlBoz83QlnkaR9FvyEC7jrtx3TTNYk3Tdbeq6vr0ZTeKqldVle1f4ApGWQeqqpzNodf8/AFMT4wTTKZY1sUb58d1GZjU+wLgJH1zN5bUPgsQLqZ53zHGWsf0efbP8IB6T8AJqrOb2vVIOt7GMEQZrKfleb9I07Etz69f4ooxxtr2hoD+0HctjQuWN+zU01IzbP8unO89N1Ea2ukP3yA87NGVuSaL0zD8cXyv7XoP/sas+2FdWFscQHc9gFeE57xqj6fhvSyhaVJTFf6o2q992xZJegbMOz7Qi3nm+BvfY0mS5pVu6B/datU0cLOBLLG2rmnM5I4xJivKxbhejcZTJ9xbrTkv9kPfszr/umwBoXvdRSguwAt2p9p2qq4zIat9nrPuIjDGakKskHf+lgMcYDpTXHCCtpWctVyYHwYb25RkMFYSQ+FXeVldVW1be319FjnW0LQg16WeuiSJOvJjGhFaH+5JECXFug85AFP++bz1zBuEh+eutk1NFKdhVVywTNN7qL+V3TCt/ndxAC0AwDdF0+OEQ0pkdE1pKuojWuB72ZYkSfan2z4+UPvCASTVdoUszeJUzXTDUNz8kD/UXIebBHWmobCuH97sBHdmjXKa5kpLcx3p/Cf3Yn8jMo0LXrw3a+W888hq/K17CXMzQZII3iPtJsC6RWk7/slRiUzc1MdDX0yFwGjslfinu92F/sZQZbCGZoqA4XQWUDXD0Allf8ocK6j22l7Xo0imyyiAItmfipwzTd6iDJJHLhpev0V4iKmtaZIw7VYfLmu2JSY/sm74sPqE5QHlXyeAl+2NSK3jaA7PXVOZpvJnWX4ZSfNUljRN4+PRZX6g02H8V5NoxoynKUk01TAGmR3lCSAOHA79h1c0lKtHcWa+LzpHNuNd6HQ/K5kHIP+pqS27gWBuuWs45YnByW0VeSoBQkiiCqwMt9GNZWf9NzhK0W0GrK5Wixf37gXbXbixDRmMFro49Stktigripq2j6bMMZpI6K8TCNP379c3sSBLyic8eJevvUl4aPdQRWEL4AhzEwRB6FgZC562WhcXB+i77wCvPHyy1wva8FpTw/hYFV/EoSjI96o8lZoWSuQk2Y7FAZhWc23GjKdxkjVGBLJAfIBlg97YVzSU6699Ms73Ieq++WPmJYd3gcY13QDBChzLyuquuzxOmyYnbnStWS0OKwanHfhRq0gASXWZFzVfSX42UG4gcA8uzs3jz2G817lTngSGITi6vKY5uZ6/3YWuIYPRVJ66tjxFIXMHkQ9e1fGOI4GVv8T7zF9fVSRRFIW+upF1fo/w0ID3OlbnB5jbMAyDqtqqYPmrFfv4oT0F7wzjxZm6KPQHEkMRhzYm5OmUu5r2h7/8cfjhdDRZMONRlKoKKnMB/swWF5Y1CIIgSAoniYIg8Kc2k9ONju6wPQ8QVe1l4SU7wYPDNf0AQXUDdywycgnoN01wounJ+5n/en67GGNrijmOA3Rdtz3X85QfyesNsP3BxRXH9wFgErWH6eeK+mQYEHTP3VenHKLjet5u52WEUz/KU1sXqwBXFEVRNKfvtBWc3bZJDBP416HvSBPLk9CWWUvqjS2zLt+/rlBuymxd191wgPcJD3P/6XqBubGGUtuXOkGTXj6e7mr5dwoC8Jpt55esrSpVUEri0JEoO4z/mnW2MlYsi/EKM34tuhnLrJVVTbN2k6UoitzOLJSuKb5w7Br4NcUqgLHc5/HMS5Y150+h6QcIiu25z0lRkLOYW7NMgBN1/mXhv17d7m5ZDFzPc1zXc6Mkff0Dl3b0mel1OcD0hdWddk/NMgBBteM4PZ1BdHPjeuGPfcVZXdjm1lpnY+ZgPu/zWtopj6alKkB47wXqVOviLlDbJmo8V2WNzo8rBzA1VVUUpW7bGxzz9wkPyM2jED1Q0iLmNh4/VC/jGSQMAPQgBHjF3ufkMj9xA1O/Zp2tbEzj34mI66q2DdPrzUkJbEMvm6ZtAZJA5ca0OE7aYxsBABi7qshnXrIkScrH2QF0PO/jmeR6tIXJPmRldnjp4naPZEzX2/iu51Zpkl3Wjt9w8Q+nzXPpvNAkRRwLmJZdwNBU206T5wyh7Nh2shaH5ziO6/L9877cGHWtKIoE2N4H355yadre2S1Be7exGRGG1UjymmEamqYVdX2hoAL8kvBw1n+aJCrX5DI/VMT+cjyWLQ5QmgCm/mce57+R6Tljna2siCLA8Da6rogi1/eMFnly5ZZNUWwcf5C6SdwErvU9r+pqLv7NFMfDHxzaCADA2NV1mkdRCgzDMJaqznNjlxdp+hqnyTE1cRq3gZVlEkdJenW7JzkGz/VczzO+J1l0Odi3XfzjwXVWnReqoohd8lWYy7OSqmvmU7nZAE2rzIN8sLk6OtVRafZ9vyj0KOZ9ML2it8O79mtihXcu27N8dUh7cG1VNU31ufxnFKvOLJY4VukiP1TN6lgmLosvAEx9Q0gc5zNEYGL5vg1sUwbLo/0/rT/qPVV13IWupSuSyPVdWxBTfr70gKLI9GCQ7G4STc+PE1LQCvjvrj/p0EYAwNixqkjTfQz0bfGDagLPjUNV0CzaR6eWaadxG1hTZTOTfWZwHm/v9Pm267qem6RpSk5607PddPHTxrnqvFA3KRmRLuXZmf/+adbmu0hSDsMwQBCWEv182Olb+lN9mPp+4LRRFMMwHLOf6epQgbtg421sk5wyKbL7/abc/L8PHJlneeQ4ktTlWXTZKnWPviaqyA9tvTqWicviCwBT3zQkiWZVYW2qdTT3vqGh1sW/kSgJ74KNpski17OmyFQMlxpYuaFJCPWqn0Rtk7wm2Q3u7PzGm20Ech0sXRygoUm+3++Pz+Y0bkPXViSbdSufGnKcUkHX0LLph2EAJMWaN4CYBsDZLnDmM4t9PMWK684LNamnSlvKszzP8/wy7Yf6PLplbdu2iqJo3UGRAyCJosTitu9fAMAPQ26/z+I1lTS4913XsZ/zav5Uzp0A3JKbD+59ja91+IEqNaaG5sIBnvuGGorID90Rjw1APCy+ANB1NSHxfoYITDkqw3+wLOTS3PDHergLHWn2aVbn0f94dLpnL3QkeV4pNsGDZxiyyPWMUJ3r25UDTBQAjSSuq0xT4Ib2W5a8xnnyG+nlo0VglTw7QM0Kkqb70+O6vTTVP7TDEm+otCw+izN6vmuLhHEsi8kwdPWXsTglFNY+s9iO1XlRDtM0vbMETtM0tcnhhoozllHH2rrSzE3r6bqmRU3DgL2iqAKEYM77hqH6c7+P4mSVI7T9B8t1i0z4EwCgPRgogVty847/4PA52t3OlogOelkkr2928RRvLr6y5nwa/0pl3fM/GHhtZp+23fAuUGcHqOtF6F3jax1teBeo8rxSqKb3wdUUge9ZkYqsPuYmTvxqdFVmqgI3tCXJ4/2x1/Xa/l3oSDyrSPSs7wJHBitJ9D8DwHPX5LIi8Nw4sIbSLPsNXMVJ1a8kMRSxKeIcIKkKhRtTkqJIwY/t6Qy78pnFHJMU9LNQZNV7Rbyu6zpOKheYchsnq42kqkqS/+F1yij6NqFF0wKpJgkQJSEcakxy4DxH+/1+v663SIr1D9ONPB+AaJlq/lkRgVty87LmfOK/0X67vRPTXrns3PGG3X6XJEnyKIpisPG8Xbyk6hTddIIHe3aAiqA6Ol1dOMGDLc8rRdM0g6G1zSQajliX5FiOOYKamoGVpqoK3NA2ZZJHr/sbWdjwLlD5porROLutr6EplwPvWwdfx3MMQ5S5oa8pyeLbwCWSqSglkdE8AhIFVF51KmrX2flL0VOOkASK0KRxBvxL1xR7pkgS13XlmpvStU3T6BaNBkEwxI4Vq2RPSYiZqltxM4qW+pyWtABiiecFSRDE4FWe/PB1v5894GwoxLtqSWk/2VwxHx5vyM1LkiTzAsJw6778pG3Xr7H2ALou3/8H4B9hYEl8R6LXz8DiAKdn11GSPh0vrm08F58PaSNZ1TTd/iQCwFR9TaSj0+mKpNqf5Hml6FmTJ0PdTaL7wbFWjngENZGuyk1FEbihZVWepftbGnpO8GDzFUFV2P5u64AW70Oo/DDY2IYkc0NX50SXXm9O1LNc63/6O6BMkqmgksBIGgF3gSMzpsoS17EyNxTh4MFNUxfZtoE5CIIhfaVrkH5upZrCd9aWG+rvi+JNnSqapqmq/sgsYlRZmqZZRi6PRN3TUUFrURPoL+XmTyeYbRi+vhb7pKjWWHsA3Qy3D+9CT+HbWJiODuCHwcbWZZkbOpbb6skBXNdzn4/nWJ7nBUlRuZab+IcvgiAcnQ4QRVEy5pWCkkTtxrqbdJmdnYPng1Wd7eO5s6PADR0ryzS7eQKQVfuTUH2ltmGa1m7H0S+KBPybwLaOazNr8/0h5+TutqHvGKrMDW3lpDI/Pf8GLvxv2Fkf7ODe11ijaBLXNdRSBfTLmJUFSXXxTq0GQdAqJ12r7WWGKvEdcSRuqAlJojgD7O02DMMw9Eli9cV90I39MI7DpdzqFM0b6VFBSxvrtdw8rY8ZtDDYRq/71ySO0jXWHkA3w+03wX1g8oU0zqUIEfBOz66rnfVq7HouyY4R0oy9EMpvgHtRWV//muoKtIeQ52VLI01zyiuduuP9TrpIkmXl43cnMy1TtawtXwuCAAT3vnk8njfN6ZzjB7tdsLEMmRtqYqrCNLADX+jfzgfUdD+EgSMPjOyfFyU77y5wJKnvyf75lyy88+/rPziMqLbEdZToIvp2+Uq5qSvS2Jg+P7GmLutViwMkisgNNU0lbqibPI32ERAuxj93PReJu6EfMA7D8OPyihHFWkEruPdxlJvPeTM4XGfabvP9fr9/3cf7E9wTALDA7TXLvQ+4fV8cQaHe6dl1ubWSy+Q8T/2rDA+/Lo3axu7HparvGaAuUSQjtB55XtbzmDRXlZq/Yd9t0zAty7XNZHFD2/9gHisZDTl1d3E9f7sLNobED3WeSGPHqoMDzAdUQ0V/F/ra0ERYbkl2g3tflfo2QbtIh/6rXeDIXJfHZWjrMqMkev4KAP5daGsSuiqP/i/MD5YltiVxHU2V6diuF6mmiGOdWzI/9XVOz6gJhciNbWErEjc0LZnboC/jr/3cO8D4KvgDhv6WAyCiawWtOUxLFQGdbFmHMA1QtLB6fd3v9/v9vj/BPQFMu9cZO8fzohqItXrCBK6eHSOfV7kr13XXDPWlUVvfX+QkLwCV/SjJmm1pvFhUbJz4A/WE5dE+DByZsTx6/lHjXx9+aQLbkRldDvlrY4ll6aaimfbhlCAp5j/MZR2cmq+n5n/Oxve2uyArJ8k1pYk1J8ztfEDVQAf/PnCGHO2hnYbh+A+21FOUpjk7QLjb+hrX6HJ+F2haXcZovwLQ3PDe1xS05TxtJEmSed+uGl7/qKxrPrEkjKxKbImf+roukjNFynRsS9uQJW7oGppnSQ0EYRCGW/s5Sh0AkShsh34YhtUJtmvq5lvHWPesuw0t27nCOYdpX34K5odVmAaYGzPK8zzPc3KYG9WPHgCOlL5pmrqK7w6FUnF+drttQJpR1M8WZ8+tkug02LIsiqIorg8cAKAv68FhqbnzwGryAl407rWxKcxTtIj7wNdYraOlNcLDL829b2s1vYXHKHe2aTqWVa0KftOEif/0recmrCqHpu24fvAzppPsbgNG7BMYTFLtT3LSGWZvmPfh8FRnS+VXVVXNfpSGz5Z52Fdsf7d1OKJMYnhvGbRAmQGA5238B0tbYp/Z/vHtKet5Zxs0q5pPzE9dXWi6xE9905LiHECX518uvqDj74Jt8Lx/5QAgEwRhO4zDGspcN/SzUhctYyMt6WepJE13DNPIWZgGgCSS34/jMIzjcLg096MDtMfDBzY01Xr+qOcnAobluN72Z1SNotbVq9SFZ/xIsqMDyLIky7LcdxedAY0FdeIsB97w3ldzseR40eH8QlOkU7TIvPvAYTmqTAPswy+y/8FyiluHfI5uLEtTbZ0emk51bfHFAnxCX4Bm1f1RVVXbyuKnZNKZ9Ejt7ERi7ZqmvW9N1egN09j+VR71MQRRUlT1jxc7kUWRmwBAVu27UIimRvCCe738osoigI2z8TabPzSu/HJac4rs9aUVdqJpOfkJYbHv2zIzFImf+q6hRfoLiQdJtXbm/nW/32IYgb0g3IV9sT46khiK0jQxKcUigSI15WpVPg/TAHTt/i4cFiXb4/t+dKfxx7AIwS5AOhHQNNW20uhnOoramB16cGM0Nuk6RRfKoiRJErvc1PO/RgDgvGUW2P6DzbfJMEkyWzDbh2hRVMz7sP0rlSVxroOE7V+p3Cvmo1N8ucU6rSrDtixTPuJkSQxDg+cB9Qua5vQsJEVTzR8k+sl8eUN1XT3RMZu2LIlh26RTDaOitJkRqrI3r9sCB2X5OFQAACAASURBVADKXdICYA150T6MTSN4XlDlRcN6wHJ913b9zf0+X+EP65ruE1N2Kk1ZA9PTq5jmsAGKG0dmdR6FtiazPI3+DwBdU7ykLNkXbv2F5TURhIYr6froGKGUZdaQKBNVUEli1ar1w3mYBgDcnr/fLry8k6O8PJ7eIR1jdwAzMUTRVPOJ7H92sjJW0eHPJm9I0xPnHXeBZWiqwtoLB2D1TwDwD3AlWbU/CWUzTIKjLYC9Q7TIcRyMSZwZpsdfeJ7nvOoS3D1b4VuWY9JjNilCacqeBwD1C2tPz0KSJAld19FMZ4ydkQUoJaS8MwxFMk2jKGhZUgB66LvW8ZIbwVT3FCCxbiTqXVPzvjfEcZ6QEvjgOp6/2fjxy2tyUtfp+75PBMaY9QvG7GED1DxXq2udu/dVrTbnbSjXRcaPedSk4Mc8zoRR4Vgcr/KH//H04xMu7TxMAwDEvHC/HcdxGIYrmVEAgHiM3edfl2fHGCueVWls88Oi9Y/0R5JGJ8mC4N7XNN14veLCcewJ8I96h6IoSn/SdpgEw90X1d/V3Dq3sjBN0/5WHBzgZ2Mau8XV6u9teZxuPM8foIYHgabDS5Q2ReGZllsahvJM65KWgLbbBb6zDAP/YOeaJDxTJLquKqrqNaJnP8VxRLIUuAsc1Q684mW/j+Pj9jwdbLnYMUXBKIl+/jgdlA4boPFh41QElf9gawcB+YgfCqDIehRAkdGplLieRL8ZlF6EabO9ivxuGMah/z2lEHH17KoXcero4Zn+aJM07YBpmfG2/2A61ljeUFRlT6fxR9/3Q66ZPMb2Rxpnv8Mketvy4s406Km9wxM1P52u9O0EqzsXvB7XWHFKKS2oZaqCZRS0LGlZAuF2u/M9w9I4TPpjURmyiJ4iU1VVUZUHT/CTOImTOM1m1xelgr5mvDcej50cx3GcIAjCAmM7pihqmqBZnWmPS675h1t9TWTV/qSl/Xxu/5/e/OZzLYTspY0ts5pEoa3KjKTRz1VHloswDcA0TbEAwdrx7U2Z0WsTZ1fmeZ7npXtRZrmSH/BZeRoPDfkhs4Z1gGPbj6qTFXV1/cnrXaFvi++FLvIYWUGyOPkV9FEM33mR0tbU6Ck2GdIzpsf+OBx93/ecJEkaJEmSumHlACWldVH4ptnoZlQUtCzLGb679V1TVW1mNDRTRPTsC2JFVRRVUf/U6jiO4ySKD2W2soTjsFXjDVEURVNbGNP9KkVRFCiNVTH5sOTyPLeZc6Oik/4SCT3XQiJonqs2dczdBaraJCqaVWR5HqYtoLoCPGKWrDard02cnx0viqL2KMlyreG/HPBZRZwPGip+TIsKkDXHNooozYkKrjwBBA44zsNKketoU13kMfZ5k0VvdhKcpmmaBEF7FFXz5v4PADUpHfH5Nzp5dE1VV5rp9pNuGfpLVZ6+P6WUliUxLMEApU1FaQlsXD/cbT2Jlqgmz9EldKwC6szQDVM3s+BLlmUkJQS41q4AAGia7qqSbep1y1h3SlFM9IsqicIH1lS/SkYfq+k/6If7wDZllpPof5tfc4IHmydojA8buypQBQ+WRjRQXVs5wFmYdgDVNWj5MYui3wMdizMLvNYtH5OgyjlqHCACNI96zNJ5GcDq/JWr8ijKHZrQg8bnguRkDfm6rBQRWCnPDkCbtcLzhfV939ZGIA6iam1uT4cJKKhREWpwv8onVm1L87DsjEnyN3VBmu6IqqGUUkLK0OD1oqxLSksGWI7rhTv6VLikejW9u4k1pQWYvhe4XuBtYttr2qbp2x+41q4AAFh2IHT8xlH3JF8gPNOESdjWgiAIj31X0/wXOIdjNZ0KbnDvmVrtHKeLrNqf+O/LxvFFkRTrUU27NS/oMkw7gOpmSHb6XmfblYlA01JCvGq0JkEV/6IWbkIEkOtizVd1HBepNi0an0ckJ5nh/0UFPLPaVGWRx9g3ZZneqvUDAJqqyFPxo9vzGomvNT66pvjSkUbMa0ZqoWgZeVeZoC4yXRO3ajVJlvKSlll+nCiUzsdAXbCeipyWFQWg67rjsv3zsAFX573klalhAL7ne77v+S/5B79tWNfUzTwkZ9oVAIBv/Qen4w1vn5KmKk4pChcAPo1dVxWmun9XTuNYTbcGw/Y+WFZuHbMhkiwrx41jzsFusrPD7WWYdmvQcMCeAd1tVJcIFEVFEmmnNpOgFpb6Fms9EgaFb+s8Kg/spRWSky3w/+xdoOopq2gClKS62FoS+tfKvn5OJIHaNVEHfqRRh8Xj3rTM0FRpak2TH+oo2SfFSXOgK+djoM6zeQeoAMiKrlvP6d4DgBfJfjRNVQFc3/V932+TXP3QsrZuWLt8nbV2xWwvniVz7XMSZRkpDymK+TT8OI2MlUSTcNl/9cxO1XRBlFTr0co//w2Vmssw7YYdVuiua8sv/U3tYRGgJFalaaOb3ND0jLH13rR65q9jJfJdTdMGM6YsftPp3rDwcNwzHwCkuiKw3JLQ19INEneEUuoYKQuAkrI4I5eAuzoVJJoijk1ui/xQE5Lso+z0FjofAx+LgjZVUZYj5lZpPGOVBwBD0zSzYkLg+b7vqT/jXNWCpm4XcR8Aa+0KAAA/frVEritIGsVptqQolvHHNLKGJjKGdx3gGJE7hiAIguCR31CIP9plmOb4rqmKEjc1PS2zlGK1Qhcp+LG8NYVEINVkaawzU+QGlpesX+9N5LRu/J/Hn36l8XnbpjDELNPoK6BAqnBDbaoS+v7xxtvf8q25oSxhpOn64XR3iSKMrE5skV9qrSeUken08zHQjmlWLGpzPM+vKElLDAlYvu/5fhQluaoqftu0a+r3hXYFF8Ui1zVFGkdRMqco7nwA8iMwjV2VqVz3eyfxjXOjida7ditMuwt9R5Elbmo6Skz1NV+t0CoKYJ1DPJoIJLI4sSoxRW4YaBKT9d5kvB/F/0vXFPmuTJuNYYgSuq4sszfiPj3kAICz2w/tZ0UG9hhaYsoS+o83/+ANq0sSKwM/pnG+zkgk/Ng1VE9EfmgbQpL9/ngI/OCa4tBN40jKsqmKmXdwiH3ntxwZipJsehsap0muaqrr903+nnbFF5HrGM3TaJ8BT9R8nK9HAAgc1XlW/ZZ0hLuZuvYNtYg37FaYFt77vqpK3NQ0ZaaKGIvfWaFFYM9PXV2omsgNQ0WSaL03uVbdzo95F/q2rcizoh7Lk+g/YoZG8SxXesfRZQkzPkq8eQgol3NepIZfFEUGumdWmqYo4Q7AYaUJ70JbkdAVefR825FIpklYmIfrd0RDW2WmLPJD11CSrvgod6EtCxvdsF8IKQ+95xhjDLK8DK8sy3Mns47RpB2LOM5VVcpZmtKzOXyhXTF94bquKua+H0O6FEO+FBMg6CHXZNrKfZb9j3u8+EKT605TV5d/aw24FaY5/oNvqyI/tpRqEjewd6LnUzwjAtPz0NJMl0VuGBqapqu9aWP1VVukFRBu7wLPUtXZAWpjPnwe9grOdwxVQleXliZyw+XB/0g9AQDrkMobo8LUJDHo2iIijDQMUN3w3lMVtEWEtrx5gh5vgptxqwqzWHgXqIK+sTtaNCVdil1dW1WF4cx59HBjNlXVdECRKJM8NnFCVKnnRxIl599lOv+pe+q7mubnudEpKgDBkz1VPR3ppuUAxD1e3J3uepimrrolNfW23ZrasuZ88DSRH1uaKXzPqq+AfRc6ltS1vCR2JNk/10B/zsIUAeCtkHGzGbq6zvR9BjcI73zbWhwg1+Zw5bBX6IFjGxI6SnSJG9pLBzhSTwCs2hqjbcE7GonlgZ95hZphex9MFWWGmtK/B9N60+zg3hFk10nyihZlNc+0qqpy6yEAAcA/+O5rXtYVkMig4shIROZ2Btlli7nZuqZp+AEA+9bd0HrKAMk6ywLNGyBv54/AuYCrFgAQhEL/zfaRsvvWuZIx1mlCM4qaq3JdQ21A8MJ731ballfENpHBfgDl8WQI4H2tYHeDoWGFoQgZnI2/3fn27ABT0s2+fdgrZkQROpqqXH+9nZ2oJ2fjDwAjyVRxOhzyBUFUzH8oKFAVtKpLABA81za0mWtYlWlyDRuwXccwRYWbur4q088AtLsV9llWnU+iaCVxmhN6UNItSKarfKBWky49avY+SvK8AP73dx7HypqGfOXzrGq79vqQNAmPgGjrDWPHuu6yAf5cyobVqi/r1wkQjMCvbm55FxuH6E0AuLtdYEvoaLbPhuqkA9iQl74eRdPfdpTaBmCYjv/gmA0VTJGqaIhWI1UPJ8P5E4H/5myVOB7xJ9edMDRNrooTYNobZ7vzSD9hkrRkSWUve4XtbXcOIZzyoHJdU17tPT8b4wBZMnEhxjH8tWIODcMwDP3W/WtT0bqdkXa70LdtbeYa1kSX/x9cmBcGjm3ICjd1rCbKZwDeGvvMmrpRWJonSZLlZPGfzFRlfmgsy1B3tPkrj+Lo15L2R8t1JHwTJVlx7Y7QPnGAaAivRdMyXGyAi506E/Xdd0Dw5I16wwEuNw7zQUUJ+OFu6ytoiYpNTw+ptjLXxbqvR9GbNNvJNB3QdMN0/nSab9IHIRkLXdNq/Of/fHYJEThfJQ4OoLseJgwN1cWxARRVtTfu97SbgIdL2pzj+u5TVHF6/dCVZXYxyYEnuqA91E+Mdd+6NyXyhr5rSCTym7Ku24rYBEB4H3iWrohcz5o6kXHpAJsF1KxwU9fUEQBo1hr73DTFF2VqCxLHyXFLT1WJH5rMVjfCj6Qt6KJ/tppb+dhXJ7mCc+2KPSqJZ2SfpNfpNSLLAMaCpnFCS5xvgAcb01OeoqeQ7Jtlg4uNw7aNeekN3GC3M1GlECeWK5i/VGo7reE4AGjtKLIszpgn3fwjyiVfZ6os3WiTsWgFn1aJwwuzbJTcZkpfU0CUFEWh6fd6woer3Uo1nTz+mXIub1h2ol1VC6NUFQFA+MTa4rPGjhJ5K7DtcwKgLnNDkQR+67OGqG7PZ0AQ3PuWrYlcz6pidYMH84PdNtyYpsyPfVVgTvOtsc8khqJMbZuQKDpuILHED6yyktAapvy5LvN4v4/O5pY7dnRmdl1rV/yHW8OFoe/aIpojv7GldIb+rzfAk53QglMQQLS1W4nui43j2RkznueB3db2tjvkqDZTrXNDVwKAJOubj0uHeemgqNa1LUvqSiwZ6/uT9NzJROB8lTi8sMhGOXd9nqrLDOA4/oaY0uRA05Iy/Q449W599D09mvm5ayWJoaqsXShza7BtSxlgKsLYZDxGTeKVnSBgKGD7wb1vawLfszq50UzT9f3dNnRmB5j7tPP8GvscoVSkqWtJlp5KkwXGriH2QwgAzTdKsnifns0tjG0uo8At7YrbVpckloel0XrblOlcCn0/GNeDcN4wLlIGtzaOD8vohLudYW35WnrElPNDO0c2HMdxgjezONmc42CMtfQHpSX/RSZ5zfprLxOB81Xi8MJBNsrUNFUGetbUte9x7XgpqKVvNlDRdV3NdV0nXiq3nj2hTEWpyqwr5rBjDbbNNHYS2ep6Zn1YRLYs0wzuRVpxkoZ+nZpdzNn4/m4XFO0gyMIMzpqmNfb5Nuii6JvSPXjT+BrlaYGzuYWx0sDK8ZZ2xW07nGcBYGSMkt+pyJUmgJHSJLGntQ/c2DiO+hR2sN1x4IVHYHzu60zX6uVbdz8AgLPuZkSMZylc1zZOCEbZJCiWd3U+E4HzVeL0Uk/B20M/Y47rpiaZvDOGEdP5gmbsAKcex3HkxmNK9Q0777F4BrYVBdwW2ZJU2zK/7jtO0vm8ZlfJAdNyNn7wkpaDoPJzta5jF9jnW1b/4NzTb/T7CJzNLYyHbmW/W/E4O8+u7IxWn0fPT4eDyHGWj4zSGC8pOzHUrzeOU8JUVp2dYXKPAGiVSKI/vpaAITYJZADw3AWk8p5o2WIiMK8SVJhXieMrUxCAVyw7b1sGlLltvPR0p1wde/O/Rs665ziO+y3Rt9NjcbQ12HYccVtkSxRFkbUk6SWdL5L8KuzSNM22s/1zPggqXyQ5gK47wz6/lV4chmEYxqjv+77v5y1+NbfQIdc17f8Xom22M1q9jq4+9LQ7zvKRNSUB41cqS6fIabGVPgVrCK1HPQIwFI32URXwGXCC+82U9JO8tbSyadvufdGyxWaFkDb17vn8qYlO9aJZNkq2o1k2KjN1UdI98/vzZRTA6p+qwkmSpE6iKA6zmuMtCZML++CaygpsyzrcFtlibdsq3mQWTZ63cXKVmJEUTTO/E1UFBprFCebo9IR9fjO9OPRdSz87ZdEce6mu5haeVEUSzeo60DvA9RA4MhjZPz/lF6+8bkNb7ubuZ+e0+pxjVXbg3xxn+dgx2vRnJc9j5LTYjtU5KWZpk6KgnwOnylOInLxzUhHDZ8AwNn+i7CfJ8bUfc17rPdGykwPs0Q6Pzif+G319Pm1apQkA/TOJSJ4Djm37nucl6b68jAI49v+R9ibNjSRNg57nnpERkQsyEwTJ6m6+JtNppJ8w/10HzVEXSWZjNqNvaukuFkkAucSWkbsOCYAACbL7lfxSViQIJCI8Ijx8eRy09v1wY4SBr1vd9tcQJvKtAbrJIveUbFtPfiivQ7Y6zUo3DRLBa1p04h0qy3Ecx1n4GdNXSgsAsOzz3OcP3YuN4gWEpZbFCTV4trZg6PtgbVyJfR7T9ebbFIHeQXvq1Xj6zSbP/P5Qu3pRVv9LFo6NzSXA8tnZcrw5HSQidUS/moItDmu4zwyAFLvG0HB3gY46HiJxO8wODl72dc3V59Cyg9gATyY9DtfEnwHOLdChOWCj0iRNViv7uSivuCwbzsJ0pgZOwr1oO30NYRK8NT+y2xSZtsPFy4t34y5Im2uQrZoG3qhokvK6XFpGXIppmqb5RQEAiMt67INccy8CAAAvfRCh2ym2O2K9z9fWYN6hZW29kSVdzxy69C4CBopg1Jz/BrRON+uwP9SRnZXV35WGYRj4j6bl7+lpb2S83HpCugfPbPm+Bti5FABMlOHeCPQWlqjjMAzDFNow6r/K7b6s68+hZQexL1N6F3m1QIfmgI2iq1Warl6KonzHqwXgdeHe+trwEl6UNW+uIUzeuSCWOMJXJJyHE9LmGmSrQtbYlCGl0Rd3avm7toXzPM/DNwUAMNcX9djHkbxwL5pNfTrmHt+VWlxfW2/E9cM/zCdVmCj63fheY+TFSKvTb/4SgePRm3V/yCB9LavHBACABr1uKn/LAMDdZCl1oFd/15R6QZuYvai3xxmbc73tTZSu26UOrm/FT+7bMGrGi91uX34OLTvI1VjAqwU6dLpm+y2A45EkZEVRshVMF/ireZ5L5EEcJNCW5bYsq/oawuTd1WA5pf983pwhba5BtjzPUpKWJFrdrLj3/o45DMMww4sCgJnv6/fqfOOfuRfbUBL348vZaW0Fw9naeiOO63q2AWA5jgeOCUBRp3glXxP5DMMwsDpciA9l9WNXYwCAkI5txwPHYgCwym6zxINW+NCNn2WPXMFIr78+7nojNh8OzRx5AbrwbRh1w6sFHPwZtOwgVxXgytnUt6LUkyj3C31YLteVo49sOzcVsaEXrNruy+JThMlpGN8jba5CtqLVPek5Z2Ii2Hbeo4+WpGbCi8lyUTq9v4Jssgj2R/fiQ1d71hbAvtvk1IWOb59ezgb+uLaai7X1NxLTvpM13n4Qjz6U1S9DMEfhPLa6dK35v0EQkSS7TQm0BWiOP+n6ek0YL34Jx9b64HrZQqtcz4ZRd5yV2y3/HFp2kH/a0ZJXCOyp3VdNAMqcypoDvPrI2k4VxIZe6LJ42ZUATn+JMHFifTWueom0uQrZiuLo91Z0s4WdcbyiSbpVjMUZhJPl+tv5fWbNAj18gQk55v0BeuhHaX678kEX0KOzQ2GR/OuP+nxtXZfjlSqJx7bjxLM+UIBDWf0wAACJ43keW4HsSQPcrXBAV3cpcGD+wyBK5/DNwzSJiGeb/dDwMUSOA33fVGVxkTPQdZ388TCO46E6/KlTlW/bMPZa8rIUH4znG/mnClB4wK2pZ7sGNDsFE48+MtFw5NvQ66auttsdQL5ZDa8IE/83dMXSAIA3SJurkC0XRbGnutkKVi+8ea/DjPN6b2+QniwX2iutuBaaxuOTCAS5PUAP7xO6Wt1T4NBC/+5Q4IJfrK2rQg8KkCTz2GqGPoJpHsrqF6i8nQKYblvYvWIAt1mELCe4MbVh/D52zIe+AgAIN3kaU881+16yIaKOA33PCXKN8xSJt61Snp/fffZn0LKD/FMF+D+u/nTxVjRVJavAtaHvpajKHRypHKVnQa/JwxmV441cIm2uQra6Rmk3toyxfSzK+n38VdaB70wxJsbU8faKu/4APXxEq1eaxiaLSJrewaOWYVd70F2MTNu24nxtXREaUgAA20oSmMeOl/b0wRF+KKvv+94E+LWbwXSTTV/7aNmbfAAAA36DUe9BiwoAUL7epGmEXLPv+W5MQ8+Bvq2Ra07Dv3VIfAotO8j/v6bG/+dHv1ioHF+/m9B/uaByXMobpM1VyFaj+XfqWcbYM1buq3c6XCDPmVRNHGMaGNPvkcoHmsaEzmga2W3quziB2n2AJji7yQPA+7V1RfzNBABGOE4AhtvV/tB84DM8lNXrtkUAhnwBE80UIeQue5MPADD9BjAykCTwNcAqzfJNGoeu2evKa9cxdqCX2LOm4V2y1efyGbTsIFcU4D/nkWt39T6N3KGvt0+rPAzcrq52/zBdBuCVyvE4/H5J5biUt0iba5Attgfhe5YxDrUud++ZkoVrTZ0qiWNMQ8M/BtZf0DSi9G7pp/gFoAZVIf+fJXCfpP4+AoD5h36cwXDDQ8z0mhzK6p+bBgEAqM40jlFZF0W/BwCe+wcADN8L17YsAIiTVZpv0hCZvQxab5OHDvR1YE998+lV8cpTfgItO8gVBchvU2Q3gZumaNAI2vw2RaghCAD+UxbZ5tix7RONKfEdx5qHoVWHff9MPqByvJW3SJtrkK0dyMjxLGMclKqvxNe25tw3DCHHmIaWsw+veBc0DccP//DBgXsD5u/l1UyJz6Vr/wKAu25uH8E4xUxPn3X2yqWsfliqVWe4AxNR9NJ1PcAwDFMPsw+dATAOwzCMIwBQGidpvpHb0UX9oLUhNeA7e2zUlXaUn8pn0LKDXFGAKL2L7NqZ79JoYNDwML2juA5AAGS3qWeOegfTKgmp7znWPPRNw4j3RgGuUzneyVukzTXI1i8dVa5jGePQClleqTp4HrQggesY09ApVgKEyZWPuqRpzPMM8wwwGTBP0zRN4ae38Gsy/LWkxnTKpMOltXAqgQI4ltXXtewAwLk1wPSiHWO6A+g1++aB6/W/OoCp1v3g57sGcEhJkspfu9GllWzrXc8hmXLNBP0Hl9Jz+RRatsirApySnlwU/e5sdU3usuFPQbHj0YdgIRok6R01RwbKyFYJ9ZFjzUMvdPUOrX6VynFF3iBtrkG2PkoDP/uabzKqN3n0PiJ9SdPoNfvmuQ/wqwNgunPuMdr+m6sLhsXsX4PphfTx1fycL+YfXBSFAVtK1TqDAMzDz3rHGFtSCz33AcB8audJN+jOc+2vgHw/pMHL7pdyqdi3TjvW9uARGpYXXol/YKl8Di0DAAAbYBwuU8W7rhvuJA6UzOMKBYFt20eiQZQkvxnD9xrjPEtIiBxrHjrJgneEr6tUjuuPeIG0+TchW9cl32To3Z3skqZRB1DQBwB47EB3ScCxa/+7CgAAAHZugOmE1WurnUMJFNDDodc19Quoer+ztPgGADAPDWO7fQ2wA+WSBwCYbmEaWiUL14av4PoYIy6q3TbwdTVOxSioFymKjp1T30zYJ/L342kDaC0vkp46LaTCBGkpc4x9dMZccfwwTn4FnhNv8jRZFECranwXZLhK5bgqb5A2H5Z3nMmxIE3GGDuuMY69kOVZLkaU3UUzGMYFKOaSprEDtUDCEoB50G3p2fDfTm9wyGkwPqioBljaS0zTNAEBgOGF7Rk7qJfE4EV1C8Xhj+vAbgzV7PeoXJqOzoNu2H63B3hqq4QAAL4zYBpaVfnu3C4efE/qVhV7p28s5Yz6i9Y6PXX8fp2wm/dPdil/O542wMheU8V5A6CUFJJgXAohAhKVrWVZr/05DQ8A/Gx9s151oh0txw/27/1zV6kc7+XfR9oAvBaktXGIXdcYh05w70wBAhz9bkxhUHbdK9Pwkqbx1BorALCSBGAeWo6cWQOcr62+b8W37l0LLYCjA7wfYeq+AQDAoBnf7dkpjBr5LyVAv/zxzho9o23qXQiHPaY/Blh+itvFXHFnMB2fYXdU7NBfru/7Xst85VgdK41hGAbjRCM7TVi+8g3T+AdnwcdiA8Bud3Gfl3JZ+14rRRR4AXiu0w8Xk7xK0vVmu6/b0XKwV8l3Ka1XqRzXhvE90sbe5DF1jKGtdh+wYY4FaVMaYeQa46AvMaOOh8h6RD1j+tgD7y1NY7+48WITAExH1e7QcIDztbVUVIvdlWvl8SVwWNJwarWzhFGjCKAuYZI7BktZvTEoUSp9MJX6oZF1WQAc2zTLbzOYLl5thorSQwhnnud5zm9T39I7+9d0kW23d0BjB+DL6p5MAdkfW1e6d5s8DNy5r3cvB/z1670tyWPkQN9U24suTte6USoppcQ0KhK1DrA/Oq7HW33uYglpku6fX/bNaDnEEZeN2wA+oHJcH8a3SJtVvskizxgUglZc3YOPBWleFlPiGuMgOJy/f9/3vbCULDk7ZpC9pWkcpPxrBjDd+HaoEQI4W1uHimpx7Vp5YrEcl/TQacZOwIwFnVyXINkWzsvqPxbz22g68fRAw0tXdpTehVbtzG+2z/mpF74DD7aL/5j9kh/3qTDJNxlCsw7s+YC/Pt3b2nyTUQd67kN3jqK+pgBSt1LEgR9hFGASAkLopblwIvghNavd8/MIMCKnLd4Fwq5SOT4YxkukjRPG2W0a6BeDUwAAIABJREFUGEMJDQ+vlksd073Smywmjjn28tsF12ToxPfIHIQsiuPF+QOaxtT9BDDRSIJgeYc3m+F1+TiR55fGThQtyXt12Yh/YNAc5M/Zh1i5rusutsVkGIZhun74h7VtPedNuuW8K337t3HoJHckL8TyNe0wirI7imfmjEf89eneRuLsLvGgLZcCsZNcUQDd8CqWOcYQRY8k8CdCmJRav/5VHASYS+b+BgC93j2x9+6Za1SOS/lgGCkhNL2PQYOkmFxVgEMgmaTrJRvcby7TDdgeZGkOWla7/WEK3tI0TtJLMOfhE6f/vyWPwo+DVrffeqW7/U6yV9pKm0euO/X19unX1S+l7dP0juM4jrZt247reb63M4zl+D/vkz5KVyvOyHd7YKKoGMAydGH0ewAvDSWElCOc3dsCEiZfMEjgCNPPFYBz1UrFMXHDscBB4CakZI16tePjGDyP9ct66hk0lXirAFepHP9EDIIpReFv1lPpk6hGnyROxUmWPxdytBBcAqS2oGrXHHrBy+3+Ok3jJHkOJgrJvm07AHqbxe7FiEwd2z6VADebfBWd7TKdYtunx3d2za6Mfa3FV68VWjfbPbwaLN1t6nuTDmDQ4kodWG76FCG+QAr6vu8dz/Neb/2HeOI5SKTjNQ2gsAfNy2UHJpjQIAqHmyYsaUhpBWf3NkQICn+DHz4JCSlf3+eKAiglpRRqFfhxUccY23Ff14wfAfQoiYzZCtkfy5LpvheObb11vFylchwMEhVeXBrnnm2fTq4cSkPiUxp6Ikw4vtDVt+JTWr081aOFgF1E9P+vy9ddo2kcv/1lx9xVdpsGlwqg99CKHpL8dpWeubuaZg/tlfr1sZFsD57XdvtD+ONESk/vQm9iRqdq+i6iM+W56dJVK8UC32uaZhXg5OScTFYEB0rri2B4jT1Qjj10nO+3AEBpRHxC6DcgUcQJIYePMbxlYFFI45mEBaGUvJ5N12wAIVUjZO5ZwIRcYxI9FqyoT0W/9miAZZkLKeDY3f7Ne1ylchwMkjq9MMZmvYfu1HKDYkKTiFRNRH1CL3T1UuYQEPnJvTVALz4liF2jaRxkWDrmPtbLNZ7E6V18qQAMZBjuIaCr+9VZXwz5hgZ6ElX5ID2n7469to8Gix8nX/zxlzqbmZPgtQGmQ8btXkgBoDstZRquOjgcnFEUp1H4U4gLTrP+H//j8l0wCVcx5cL+rcSEEorP911KaIh/miQMOcGfK0DXSKmU4tituJBTmj3typLXRy98s+UAScgPRT59rbvhnR/gKpXjYJCg/KI8YebQNcfzBdGYooBELzqnYUnokuZ9RYIoAt83vwAADF9x8ElY+5qxMY5D38lvywMsnjm2lFf+5p/fPMbvIsQIwHY8cp+ezIRZffM+CCC9Tcs4JlwTFEZtJt7PDADwAGAet6Le7gsGIKXkdbnqDDI5vum46wj8fFVXtf7sKPXCkHg+CbfCFpQGhBJ6/mriUxp/M79UxCchJadb07WBk0pJIRSeeCmFcLfb/W5fVK87556H4Wh3S0ptr3e1UG/X6VUqx8EgMTcXvvL5p1anYALFiCYRnZXkJAoZxfgDBcAbgMhfssFL4v/DLoknabXi+6WO6uiZ2y0eGP+P89dt6TLRi11283MyAGDGlpj+Xe8LotR+tN/MzDRNY6++AQDMYytkud0VAJJVYenbt34zORiPv0Ud+AS2lVjqotabnLpO3zCCHejFsdwpJISuQhpMt9DRiFBKiPd6c4/9JCJMmS2JOcf4bxRASKXrny50sqm/OwPb7ovdeUnO3u86z7d+LHV4dedGzZt5ukrlOBgkQ7g59/oxsTSQAACwMQ6xT0IuhfhSEh+HlF53BtU/JoN++dbMADAzfeqS2NUXtppk26fHK6dIv7QBPPzn6Jmbpmka27tv49JmCf5VD33fDyPAOLRibxvzSwMAN+F2y3U/jACbTZ5ETi9YSNy5q3dP//Xq0wKEYUQEw2lICMWnmem04gU4AADz2GpZ73ZbgIrSvWtPCUph0Nsx9Kkxirp4KTgrl5Lqlee2zT7BHrRiB20NAEAwJSjE850BAyVhSSklJwWIYwhItGcmj4jv0zAsj7+6pgBDI+odNCZMJQNmTnK/3ZW782HsdBOSKN2xybSDWAcwvFGAq1QOWAySvh/oc7dsp3MQFn1/6kJDaUgQpXirbaFptBKEkOsK0DW/fG8yXiQATLwS3dHeJsm5rab20Ipr+KWXa80qh16L0nOsJTBo34ttIdp+6AFkTXzbMG7yp+foZr172m6XaqIkv12tfC2LFUZzE8AHLd7nMAQafxMioxSRkBxnpuWlD2I5SoauE7zabgFY6Tv2JGtsw6DZGCF76TT4sqs4AAro6p64DXdTGoCq4MCWISFBlNJv3cOWZSSkhGJy/OZxDADEEDaIjIQrQTD9TAGgJh60DAA4VxhA1bvt9sKVJxmLkmbyVpNpuS4zhrdf/CqV4/i7emu7h8Dk+ma7Z6+leYQSGkYE+Q8wj5QgQgn5IFfH6KDViLBisrwg6/ujvR3EZ7aa+MhWuy6ypsi17du0e6r923y1226LkssGoESeZRiGcbMGut4/755eXnZlDRDQ1X0SCu6llM416OtndBBFANQ0H6Al0WKEHY6Pp6crLy9cx561KrENg9ZjiWzjjH5p2Y5H/uWqnZOtsMGhOkTiKKFRRKrK1PPee6goIuHB1kJJZADMJIzi2QhlWJCjlwA+UIDm/7nebeQknFXBzeTSdjIt133sm3dcsGtUjoP0e9fZrMdfW+P2Nq92231Ry8W+IBRTQki09zxPTC6liFBKP8rUaBhL1BxOlufanTra28NvyautJg+22n/KQ8cYu9oMXXPq6zFy7Xmod//3m3essO84tu1shnFYZTnbbl9edkXJASzHxyHxZ5lbQde6OFbYs81xMQ5X6sVZp2R6lOV10DLeAPiE/Q7Q+iXxSVSTTwmSW2vuJEe+DUPbTp5vG2OrWV1uX9pjoVMWO9Y6w21zuoJhSjCJfrEYAERNooiTI4LbHg0AmzzaLnQ/E0p9SunxLvr/LSm0CpA9p0S0k2m5nSzf2WBXqRynX9q2fZcNg5Nl83a73e32xTIelFASUNr+qW7RV+N3HFJCMS4+wO7zeu9sgmay3F4UztHeHkdn8+diq/1rzw6VBPkm9Y2xCYzMNycdjCmy5zZ4lzVSLBn8tp0P/Spvt0sr52IGCKNotbrNE81/e4G7xp9bzSktwOhb8eTfWF62qj4Oz9c/JmPV/TQe/lK3NK45xvSoADebLHSMvrmIfI1PfSPqwLFh6NvJc+2zToOQU6vlL8bmxl7N3xsp28P5GdIgpC1nMQDUyU2JfXLYC5stBzB/rx/bP+YfyCVRzOnpLrrMXLKKKPZt2xyHvhElv8JiO8osAIDvbOglcbExj22rdf8W2/BxKxSAOIata2+Gzs29X7vtbrvdFcsRQjAlJCSing0wav7Hso+995vAUpDmO1MSZMbUylceG/R725yeNQDc7l/2ou2HEWCV3lNjrMG8C82JwXgX2bOw3inWbNq2De3OcfIxgZetnCxn6SeHSRjFq/WvwkV8Rzap5pQSUkC8Cp3xxdqg6PG5YZW6bgN0za8/CCvCftyRNQkQjY5uizjNblPPaN9EvsarJsoiSXazJqYubh+m74JXQk+LIhNCQsr4BADA+YqGiThB+Pc8eoieaw9gYjwtMSGEHO6iNgBAnmdRRD3XNse+axit3O31LarX7NHteNtvoVcl9S1jHjvOr4BbPpalz+TWSQcn+7GrBsO2j0uRhCSg1PvFCQBwIS49WmdPsYTsX6amJo4x9YyflQO8GMYmf35a3WTb55ddwVQDEKWre2P4XtvhH9b0XTbR79781L8LUIXJKss3eYzmGz/6k7ossIa2kRoAE4JCWu8fH8CQjf+FEUIIBvDJ6n6FfIwsJ55G+VGDJINQ9MxDgJ6vSJRwjE+fmGV3xGhLaNjfcJmPQqL0Zh0R4o7Wl6TCdt8uM+n6IWkFA2OYQTDmhegsCXyidODcAwDOU0oDSgl5VYB8s87SKESubY59o/fUt6z5qvFdB9CYU1kwPSiJ0aIAjSiYBPhfs9CBoa23TzzKV3Fg2/3Atm+P2cUgAZiNDLk7Z0MKe+waubCCMaEkwrUQBAAGzvLFo/X2KU4h+04VxDGmQVWnbPA5gv4F8rURrXdP2+fn7b5kAC6KVtEj8mxC17uwmDz0m2reH9g0oMkq3+Rj8/2Pv0a82Vu9lpyWHVDsERL9WBZulTSUIkIIgNZ6DAL9bbJpZGt1am/3ViJS8R4AgPGQ+uSAy/StgIRpegcSas+x3SP3fRVhbLvGODSCVfs3u6vtoug2ZbtutPzo3u6bQ0u1Ttc/3U5M8ltXK/bd7c7jtyQkTDQAAFLUNCSEErJ4rGyAKM83eRaFoW+ZY98wWjjW3HbXdrMttByA7wrWSkHcRQE6wbbl4uiFQSHoYL3JEurYfVu8D7HZowFg3RTq681eB1g6Q9vwernshcSnJP5RL/tJzdPFb/L2LY6BZHbMBtesOrjlD31sdW4nvPWCUHLXNicAAPMw3Qckq3Ut+EdjisgqV88yYc1PL7vruaBBgDsgNIkI49wEANCch5Rggpfq6WKnhslO7qKwuFJ4AQAAM40eFxXlPKVhSSkARBGywXb9MPW/mqZpbkbFOACkeRaH2HGNsW9qFjgvlzGnoWvqStW8G61gfZfwwl8862wHjTmVAObh9l6eXb9D6j/VIwBAXyfZ4mQ9zAdAkmTZJs9i6tvm2Dd16Zpj23XXkLRPvUIATbXdK0mw51rGPPadFOUWIE3vKAwVNAzyfJPGnt0L6x3SqdlyAOvLy3PtBf1fkGxSJQjGmAMAEBpFtOaH1awEoyEh9N2qOhakFadscFEdnNvBDQCCkYvfn60/ah+6hrN3R8iH4iGaRNR9fBkSgL4wMY0KTDAqAWMf05LzCABAcZER4mMCIFjhD5MapsDt7av19wAAMxDGmW0oAMlrEoWFC5DnCXYGAAADDADYTIMotwUkB/Cla4ytikrXnJ8ujBVRh+Srx+tutFIvJqdEwe0S6QB+vL2fBz1CUovDCcN5vVjXy39tgCSJ0nyT52XRTZZHvnjm2HWaX1OA/zhhOtk7IFaUpvdzC5xgK8nWNytiDVeOWYA9Tx6Sn8/lAwD8OfhphQIcLHd1SjANt+xgUFQRTylF5F07kU9yNtj32YjyX6UfVEW4STWnBP9zBQiQ52LMJQsAAIpQbQLsI4QAXJ/iRnAdGe0MIDnDYVi4AGXgAbrLTdOlqNb6SgbhYrB8dzoNpey4rL8ZUukOIN9kkfsK7lu5U197UECa3dxkMcWuMTaM+NY8dhfB9ooE4Hm6AhMP0xm/9H//5Is5JPqL8cX/qrm4rah/HFYbAIdpnObJ4551k+Ul2WbqWlm/xwn9jTh+uKK/AoyxGybJ+ia22ZVjFgAGjNuDd3iskyzAvhccaDooJEKyIoJpmkELUeGIev/OTbVrH38Pqt3LAxi89Tc1JvQtnvoTQcgPUPCiVAAAMCs1oQB5KDgdsCJkumPaYt9gmcXSc3BOH0zTDaqiPqUgnslisMBxc27AM7o9EwsBFQ36GFL+3Z80gvaAdsti7JhjUxfO1HfqUgF8gJUbx2D6McUHHNhnMgsIaSl4syhAQUVFoqQ+hGRtAEr8ME63zy/7drKwnp2VLAglAP9LFiJn7g0Helnvfp1tKHEeBzZ0qtzuT/Z/r6VaY+IHuKeUJuuaGewqpi8IAtm0B2paIxEmeEnIg66pv7ud0G79w+2GRtUDyKYdACDbfPQsbwXT6Ntiq5XxilKECX7tnHU+LFdwdsjzEQKlDt+paSQKlu3pcMCWCMyp3LXgQ1dwCaAmx0UhRabFVTtP5ntlPdFWls1ZL71hK4AwyzfRcDRe47twYtAwgChOV+ubtJazExFn7rS43AJ7k67uaQRg+nil95VsNMB/ziPH6er9dsjT0Hf6pt7+l8OssEe3a76ZnRIB/zYzrUUpRyaON1YbwA/iiPT1/vlFA9DJIQ9VWB6rl725NTxoRQDtsadFkCTBOiMOtNy3ES8OP5ZSShYQQnCPSRQOu0c4hYEuJAiCUvIlQ1upZoWWXRYA6gC4OZVVD9ycSl6AC13BOYCXfPAs7yXEteAuAIDgnFJCCFm8Z2dZC5cNg86eDGOMmqY5WC7Lw/k+Oh2wO+AAfC+kAwPflQDj0HcNewbTDu7QpMX73ebDBELXD/Pb4fshiBKu7qcfnCAAEkZJmv/cqdmJb7KOheGlEWTZjkceQgNMdxSs2O8ZX8LvThO4MNymqe+16phMtNzbtG9OJbPAm/W+DsCcmv0xj9cGcF3XC6SU5gYAoBdSIuS7DkCY3lE0SwODZKB4tOxWUZ6klN6sXGgKww0rd7ssGCk5VxuMvaBHPiYVq6r2aq0uQkNzzGxoVOMghA4lT7tD8zm2/DMIGwa+rQAQvv4s72XG4ZbxFACg4SIj1McEoO+6zkAoPjxOHCB/aRHz5sl8hHDVHLOQGtU4KEAB+viAdXvJ9rY0TCs2UlH8G03fAAAMv3OcZR/qBgMjx7IBfN8PaVn8Kme/8x5E+JZSY1mWZZkBgOkIw7LdAKGFx+DU3iyM9G4Vec0BUHa8t2kfgO+0dOaOKeAADTtWidlLBzW30qf+z23nLqal49F/obl06Cx+SC4Wxje9WefxisQ3eOamQ7lvmU8tAIBQWsoRk5hJPwgcKaqfil2bJ4zkSQG0UioI/MMO8L99NFKW9fZZjP6q82kGLCXXYDQzgBSMLonWXSslo9m8fExK07AW4j2f2/ERkksJrZgBtGpqhD7NNdjkmdtva8t2vd498kSsNIlp4DrWNPSNrK/1uHgnfd+Hx1FHPnnkCAEMQgSBf5mleGibpgBMxw9DZPeyXqqdnV2LsbNa3ae+OrW4/S9/98H2QaXsL68hFDgAxaZpGmg4b9frP2PJEjUq1kCW3ayzhNA8n38BDgvHnJcbo5RKSU6wh4wQB1ypVn2Xb8/qWQCguVEKAAYAaJSSXhD83coxpzfPouNBvi1JX+ztv9xOClmpjmnFvgJXugPgQtX4duMlHcAcpkHiP7HmfcHycmCypueF6JjWrfg28vd+7jPJN1lGkWvZdhQckzbtmzyNIuJ41jR0DSOB+/L3ZYd939tL5Y/jOI5jHDLYR+cdpaaRrHBHB8B0UHZ30xYIAfRd1983xA/8KE6Tsv9by/Ak9qEP+uZssw7FkiXdNfXOsSOxtSIhldKBKP8Dkiy7uVklJNj0I+GFZ42d+gUAoKRgXKaEYMNFAVdKKfXnxRGwjO/SeHjo1LeJt/1rz2EAACMMoywkztizasdfmzFt4unyWbx+YG9L0l/t7RqDOZX7EVxo90wAKF74Lqy+tL0ZprGN2K/dtmDvFKAODG1O5X7wZ3Mq920J5tTs608WcJzdpVHkWLaN6YFgZOQ362wVh65nTUMnauxZxnzADfrW2F6vN5ymyVyW3Rn4EiAq3yVc8sp3ZmEBmE5sRRkKPAeg1ULUmEaV61PC/hJiKTo69ykSx+llWYx5gp1xcTkcFGCapmn6WZ0ezLhzFxOZFZ7rWOvkm3WT8pL6Te39ByRJmq1vVm3fDHMWetZwXElcqFZKhbE/BwF6Vk3TNJf9sw+O5Mmc2K4pwZzaPXNPPYcBAK9iirMU+2NbI19EZXFYfNlt6rGzZ8mueRlf7e3FVts1woae7SqAErkutDLwTWduu+lZ1cVuu3t3ldhBx08lP7yYgAPo+kpN9UnCOL7LCJqmofuz3BVcAKR5frPOooi41jQ0jCDbmNxRsRqiCNlD27Brmc6vfQynaZqGJdUJjLXzLvXMnnU1MtexTDuYpnlZq1IK0cSBj22MyU78JfcM3vgUI8ft6sAd8yxyx455cFKAcRzH0WSnqO3vVr+UIORZNL0Yszu+QBDgh8W0DGicZDe7HciJe+ubQchDl95GSimExITMQaCUahr1Jjh2cCRzAF73wAFatuvPfFZxniY0RLeUjCIAyljgHQzMxcv4+izhNS/jJ+TdvWtD21SBb91w8WtslSr2u907A+VvD8x34ng0vn16GaexFbwshAYIkyy/uUnjAFnToOrCgbFLBlE6TpJgp+9E+a7rEZzfShd0+bMCALg3+/GtAqxvslWIXdcybYq8aZkqKRshMkJ8Jwi4UvIH28Ebn2Louw32YdjkKRr17ohtsxcTufP8YUFROg+eV7cLbDy7C536q8cbidv8YFpihMJYbJ9aOvHY/D2uy2C5pkh1rCodcaCUatRbIMnfjG98s85XMUXxLZlK09V16doHA3PxMv75JJZn2XzkZfxIdjYMrQo8/w7A6P5sW8mK/T/sr/6puK7r6mo7G4Zhh6YLEiCJw1V+sw6qujc9cu8Yg7aNvvZNN48jt2uZtyjAsQBsmfdjDT5Ar1WjgqDez2gTkBcl3+CV8vVmtaKua5l2EEe1lLoDEFJJyQNKzcBrlVLqZwlvfIph6NYIxJjeZtEZts0G6Ppeq4jQaCtmM0kp9pTSfXc0Lb9+a1VydzItHT8IyC/2Ir2pnSknGB8sOCmllEIKTAcU7JVumutcoI8E5+tNnq1whLJNb9myJr5jzcNPgJOXsdh5rcJ3X954GfEmT6jvTn2rlB5UuX13v2uehlbVgfcAAADjX43iVbE7nO0kT6LAMbpeKXWIxxxlkyf09DHzFep917atm+LZMAxjFN+CAICEq2iVuY8F700vWd8MSqWGDszRu10lqD25/vq+73vfc5fpJb7fL23mVNuKOslmOjtJrDnT/eU+muTrmyQKXMu0/VDuSqEUgJSCc3kTBGZAS9U0jXp+61M0/nCLHpMBkwtsmw2gRUHjKEont51NnKZRyXmj1Mm0tJ/OTUvHcRyj67qf5uRHuj+zUqWUTStEErRBe7EDWPebLD6VA819vXv6WQIA/M/ZKnKMnu12/x1gleb5Zp0mNKBZa8ayLjx7HtqmgFcv4+5XH27eehmtNN9kse9PbSt123MPzqtfDxrwqAWOH47/fS4kO9oXKN/kEXWNrlOqGURZvG4Mq3yTxacM5rkJoGsureuu5aVNqTHPM9hT4DkABPthtPr5/FL0Ju7MIOE6Mpg1KGd1H0dtfbyhD73WOifJkvqRJUQ0uu0AGl4FyN6gZnYwei5l9cYIJeFqfbPC9jD1wyMvd0XFAKRQWsiRkBlppZpGNe3Rp5hVcnYS4jy1ty3x8YAvsW02QB1rsaT4dbPpx5n1UknO5Qem5YkX8sN6OPjXDlaqapaq0kD7smnPToAwzm7T+FgONOsAOiV6AMhus8Q32r0D/x2AxqtsfbNOe6mNbm9l2LOmtlWqgDMvY3HFyxjGq+xuhdHUKtn2bQHt2yR1ABi39SYGAFi6/7LH07Ja5fltGnlG1zSq7WvkwlEDzHAh+R4fvAYt+WWCGyuR3RB7UQDQbQ/goZASVRfbJ2WmdlCvybSxnhXBDia/rfT3486lG814veodAJjzOHd3lVQNQIWR78wtoebY/Cy2BeeXxqrr42jtFWqYxq5hotgzBaCkkFoKREb0uvZIGCVp9msvZjdZZ911bJsNINk+8G1IA9XNpo/Hp91+XzH+gWl5NFfN+8myLOusm17DuWql5FgHz5JLdfgIHCEcpvfRMa9j5tAKclvXAHF2m1KDu9AAQBKSVbq+KfY1VSObouxmaptmgZt+6mVEOFyld4m/KIAALUV1JT2vG4e+5du6Y7obXtOYSRRn+SbGZidV0+vAhZYfFgfBJEzv4+NtY/yr4Rh5Fxty6Rm98A4KMIu2XRyrSCpZbLeBTWIF/lN/Iwghlk9w8u0UMRSci8LL76k2Sbwm1su+rhgHKJBnT7oObXNsGCu2u+rSi+A4juvLp2IA0wAbOy5oAC6lqLn8DQ/B0+n09X0/pNX+sZiDznkQ369i22yAKgiQDYOkHjWmrqzrl12xr+oPTMuu67rZcZy1N7UHkslxV1RSCiHkv/pZKd02h+aAdyvsOB75/ZitPf/khbuhBD8CocldauzH2gMAHK1IklZPL0VARz5n892qYXTJbP3My2gjhHyS3tUmhaYd/moERv4166ORbO8M5lTuD8kxB/WhUZJvQqOXqumZD7JEGgDAzJPIRTj67eiIK2rP8W7cizLELYwNdY4K0C31Za7rll3XNftJ9X3fu65oCEXEoiTgUh6xIIJVyDX6EJHIzFvBqu2+qGuAwrOmrilC2zzLBT+TcRzH0U0QGKYBc69A1gCKS6WFaFA3ve4Ajod88pPtfnWpG4sAXcW22QAF8iwYmpIiy5gGyWTxst3viw9My75tGhmQLAwmEVGi9FmDXClUI6R4+Nk0jVJq2Rk2eeTarRTJdvDpbg4nxvRtV2P/ERwvCO95vdTmB8gPQ6vaPb8E/tjOkxNsahIs2XOfeRlNy3Z85NU/bccLookVH2EfWekvHaF3pwYhsHiZcZTvOy9aN13RHWv+jJt1topmWTOngBuurA3nLflCkANnGvA0tgzbRwUY2O7gyBnHcey7frlhm5yHFGMzwPSZ8+PIl4FnGwMPA2eNf+iGiXK725cAhTn1WgSFbY6tZqzYbi+NwL5v5T5/0AcFeCw9B2BuhFBaCNIsS68BWMw16PteVEHXdY5zFdtmA4itBUMnMfJtYxqkrvhuu92NH5iWqtG83uRgBlMVpGZdv5asdkpKpYSQSkqpjjGVBTyqamfH1/pX+xuwZnMAj47jOHW/ynYCAPA8jDEXfPdsuWOPXJIMGPuLhfmJl9GP5qHXrJinO+fpm2sy3fVXGmQCwHC1q5tpmqZpsb1nP5n+meLk+c06XSHc1dafjtn+jObSu9NV4MI4nHWdee/kNQzDMOYzMYwlKmViPAqhj7ScwrPNUYcFvoOh+yE1r3ZLo8nd2KqKuLY59lrMWxfCAAAgAElEQVSw8m1vmYaXHijfMuZ5BtM9oC3kYoC5DhdcNQvM42SuHQhDV7FtNgAUMHaqJq5vG9PQtDWvti8NfGBaKl4iZK39Ie1D33spavbayU1KIRX/anZM6+MJcACPbp+Ek/d/1sMIfHMEjw6dqlFmKs8BAMfzPI81qmHcHof7pm1b1/OXhLePvYzxKokI33v9TIu12zxaYs+6YPNZufilLK3DwvYhZ99aix3yyAHiLN/kqwg7Ux9X3waCjQ20PPDNcWg/De6ceE6maRyUQQqGaQgECaVPe++wNcaWR8EDAABsK8aq3YsE+Du0W+Xb0CJ0UADPWgj6Deeq5dsaOqb1Aebx+iCLKlzFttkAAEXfCEI8xzamoWtEzZc8/aumZYV9zx41DZMe+H6/Kwp2GmypFC/AM6dqx4Q6IyI7W/1XcJcNf4qfe6An8CivsaszYzEjLWvB0fXt4zQm3TAMg20drhgfehnjTZZG1PNEdU/nUclnE2DlEP+wT4erCGPbM8axl7L8Dv9TnoXu3LNid4QCupbiBdACP1nm/Djqes+WltGrJM026xVxppbN35K7lNjQsMAaukb8CQCAVjQmyHWseRyGhrHq8UwBLMuybPfYKqRl4p7gGdO/WPWKzNRPnQrbh+O8/uT13zaSAgDYWjAI77gDeF6x5KKrQ9/aqdzXcnEkD8MwGI7jIHAcx+nH6Rq2bbFwrkOIr5qWhe/ak67D1Jh+VrXY73avtX8jKz0QHgAvt6dj9g149AdKTuDRyrdHKWDpZHK2df4Iotd1tGjWdS8jzfNNmka+B4MRBE/b4Xcb2qYOXGMcJMBq8YV7xjh0ivnfId/kqT+3hXekQrqbPKVWM8HmxtvWDR96g+QG1ABhlCT5DS0aE83TNHQOa016Zw6trCkAQJjmcRj5nmvN4zCImvkHBei7rutcDyFy4wa+67pt23KhCZmxlqJVr0ky3RN/eK2U75/OjD3ft8Y0j32tZfGmRmMLo8bIWRTAcj258NVYeehby/e7clmSvVaNQiQZ5oDi4FlJ7wq27bOEu6umZeFaU9cQMeuZ/yV4sd+d1X7t9+8TNj8Bj26tWUkPlhvd2db5MFuWZZ1e9rGXMcny9U0ahy4M4qfPvC/IhpZhb9mnk1Nj+XHQag8AcXabhTP34bjUsvw2W0XIm7uu2tdxOrS89IyxV4BpGCern8/MDE3WysoSrZlB1pQ0xLA09cho4geuNY9Dx6PT7HVdpxUJgrilxooGQd80WnNO6eQL0Sohz5b5OA5d1+lDcufpx84qxNaIbjIi+tp9U6Mhxo4FyF4UwLE9XW8BAMb3TGXVtqLOZY9nJ40bzvQ1bJsN4K5CzzQAYuzO3TmQ/appWRlTrzntJ2/S5RNjxW77eb7DJ+DRLbRSONCzHSwb1mDbtuPf2/PgObbj9Ke8rQ+8jFGcZevNKkQw8P1X4y4lNiiOrbFrxJ+wOvrCzXGQHCSAT1a3+VxMp9StJM1uszDy5u67cr8gaxDMN8auUYAQolFVvDyZoclKDVy0CPyIRqUfAKAs32R5QsNFAVRNT6RCrapYJNFqcAYDZyvKpNJlJLJgIjte8uac+d+1bdfUP6ya6e7VcnU2eUztYb65WQkdWHN7uT837x2d12XxKa59NTvUey5l5VzBttkAmzwOTAOAUH9uqA+vrtBrpiWUQytpNjFv6vhux6p9AwA0oZ6NgsB15r6py+1ZQ75PwKNCnHVl7Nu2az2EcLRy5s5Hvu+LU6L1B15GGkZJnm/q59F3uhF6p26t1306SRdfuGuOg/zmOQCGYTg0HPApASVZrbLbLPKnrvy6yQNrEIU9tFL8BNcPgqBk++1QmHpvaV+rFMUcLUTBVZblt2mehL5vzeMg+NfTW3KpWYXTwYkGw0syKCshDClqf2ZStpKdtyCfGlkHUFp6t2OvKMUs32Sh1/J0vdHMHpt/YNAam5ssdKAX5xzQo0+RmGOzK7YFR1ewbTbAbZ4RywBwVsHMEZzFnq6ZlgC84cmgA2fqVbUtlqKuTRb7ju9jz51bRX04V4C/B48CAEA3dFKuadzMvj9rM40JCNEcEvc+8DISSkmU17/2o08qYVQmb63XfTqK0/RmnQk9Wd6SbDGPurTcs3xQHCZJdjtJCKaptfrGu7c6JRle4nxT27Z855p9PwinnwOt29BxHBsgTtIsu01z4PVo2H5YvQZtZY3x3jHucTMYHh2firKsjZrJaBbvqdk18UC5Vse22/IY3iZJlt+uUFPFSW5uu+q83Ihs8iT0nbFnbPd8VkCa5jfr1IOW+dCdTMm3PkX5Ftt2UIBsk69sAwBW0VQcegYf5IppCQBDUbwNaWe3WeA6PvXdWYnLFmHn4FF0HTy6zLHgdR0menYRmdm8TuOCS3X0WF73MiLkh6FVbp8an/C9AYy3wes+TWgUp+unvZwsZDDdAzgeWadlLU8JUwTTKLF+7YDUwnnRAx5XsgwwXnhBfd/3feWludv39Y70yxll2wBRmCRZdst3VTMath8IdXrLEuPAMQaJI3Pu6rp8KcrS0Zyn1pPQ6g03/xqJAQV0ld1GdeAkK66VOo6UHfiWnW+yxPNHzffmZI+9PmwbYZLd3BBQJeielNtlpt74FN31W2zbQQHCdJMjAwCsL/1QXKQgXjEtr0uc3SaujXDgzk1hXLQIO4FH5zB6ugoePXxWTWiFbm5sTMhUz3Gui4LxI5rqupfR9YIgYKLeloHX7o3Wa+XZPo0QCmm1fSonCxmsqpdGIfs9O3Q9BADP8zGtyl8tUUWvm+GGpJj4rrdcSuZ5nmfvNk39Xgcgzy4mJArDJJNPL3sxGrYf6PKUYFZhzzYGWVHXnAdVi+Jl5wztNPVKainExwntR7FsxyPpXUWbeCzrpjt41OKE+DYk2e2K+iPj9tRGY68OPYhjHK7WN1ADjwPuwbI3XPgU/d/fY9sOCuB4dLMCALDMVyD1IldMy5O4d5s8dJyu3u/+K3hB8gVbKAg0gMGC80TmE3jUDsf9b1fAo8eBC8PSs+b8S2Kue2RH1W5b7Mv6cAe67mV0XNd1pdbql+P0DN7s046HEHnk21+9hQy9rwCGTnw1RL0/ZYM5nud5uuEvvuai0EGkted53nlBU5jeJ1HP4ALRFgQoivzn/fNL3Rku8rrXQrzKtYxRpkVkm/OgdMH1xoUVJdF3XnF5eBe6yWLPmvt6ilxz6s9LXdbR0Pf9wDKs4m3JitEPAQDWeRIhB+Zk9SXxR/Yyylun71XlPisAyHLfp2uzMckfbQHtYYc/8ylm17BtBwWwLMvynxQAzCNvP8uBPc09skyAJN9kntMELgBYluV9gVa+tPZ9gC+SfE/gUY/UV8Cjr4pS+Y4JY0MDHGkt/2TFblsU5XFgrnoZT2T94dEeJGB7uDnbpx3HcaDrOv7keEZf7wDYHlyjLevd0dC1bdseh2FgT53E7vSw/LFlLlFPwzAMw/HIl1X/vXgFNs8ArhtgzHhZPL9ow0dOr6qT7fxiTK1Sfmmb86B17d6mPpA4rAXXjVi8NkaS3WaBNetgzJA56fNSl01O/Vb8kCJ+UK1DfyugBYA432RJ4EHr0YRqa9OzIHL6jvvG+DgAhKv7AACAkE6ACI6E3VLxgDqWOeZXsW0HBehbXjbqCQDmUezPaorNCTabLLTtnu9+Pb5eU9MEWyaAH2Z31Kk9UADjOPZ/Da2SbeaM6iIn+Qge9Q37Knj0KIVnWzC1RYhujP5XKTjb71+2Jy/TVS/jaU4mUY0NICs5dyCdPA6qdoxBFgBbkLbR8+qU9HHa6J9bm0+/nWLdy63Utm3bGU3TiLjrLh1gDxdYx/NcTzYNK18KAyF7aPirG+e5kxJj3zbnodNOlt6F4KbRz7oR/ABDwjTObhNrZnZ3F5kTA1Xh4xfNb1fYY6ppvaH5EuASNAewk1V2m4Y+aDbPL4V9a1v3gdPr0hy1KADCiD5YRkAJ9F8RCk5crHZrYtsyo+QjbBvYAKxEo6drCTCPujrmwHoRssYmzm5T124L0FxY48HQ3WSRbQKA79MHe98XDkDX1D+8odVqHMUoLnLBDuBREdj1NfDoSZqtOY+9oFViqqn6JWTB9rtXp8RVL+OZVJM1V/ZFv7DTIrbW4yCH9h1F+OwlwcbptWEYhjFN8zwvGVu25x1TtgAg8DzPOYS/7aMydPJXj5A1NucmTSkFIq5tzsMwP7h++AAO2hZldVp7tuMFyRd/eh5V9Ls9fmcYo6MC0NU9wbxGSfz8EoWBwTwHICDRKr1fIWiK+psWgZbjfWwP3O4lxgWA60cRCY0NwDbwXfvMjps4ALjNh9g2G6D0/1/O3qM5dqXZFlvwtoFuAG1IbsOj0XvxdKd3pl8vhSI0UWigUNz7vVBscjuSDV9wVSgYDdAG3Wzuc55yRIMGGqhEZlaatZBorE6Bsef5gVfI9VeW3FXK0r+35RKltQykvp7sdnDnayIA6IZhpqIoArmBVOtY24hc7dv44u2egEcrCx8Ajx6lGPue2o7ZMXMo031F8jQKz3W9W1nGE7K+IASGPPa1NLfTXdd1kqIoxqPcc6Lj+d3nT4fon5YaaxpZluWm77oO4LShjWE7wam3xF9Zpp01U/P/pCpTqrJ5l8JvQ1iqJI5999C1tK4VFuZRkmQZmfZHkiAIgvKZ0nLhLIM3S1Nk6dAdCtO0/zIzW19pb29kZSUF44BhGKbj38voxPKJUVMTP283rbavLNs2dYqW5mF8pz6P6Avadtdu/ABhfQu2TQZC1JrCm5xj7LsqiwHA3a19R+GkcZfLL9I3TVO/ynJXpmGOA+bv5RVCNLrScdboldzz4qLh+m+BR49S9m2xsNZjrg0si5IqJR/gxJ7khKyv6ktbHruKze00Z4wxw/bQyz2LQScF8Hbrpat0nIT/x/EQazkKls1Ip9ummVHacoAyWpVL4ncHSBHsxMB3pKqilF7krUXhJmbsFOQKdd005EkZmjKL4lNEs3N62jSN4ymjsegpZVzx+tdJAxTNNDa21S+TnCSZTbKUTDsDw2giBKaJl8J0Hy3zmWlrW5+g2kmktg/o+E8MpCiqdzusVP8Itk0G/uM/3n17abXeBb7GotBeuG6racrKUeSWaOJQHDB/AQCn2Yx//evdOU7y98CjR2l+Zc6yq01l4CQLi8PrgtVu7ahiz3PRlcVu3pvL25a3qq7r5tp11JHnZG6nGaNlvqy7xSD3BSoLAFRptb7zl3rHYmA6hDhe7wq6S4tO9lxaFpQxoKzKPDP9XmaCqiqi8akTF4Gf5qSqqpnmacZX9H2Tf0COPjYViZAoQ8PyOAoPaGgI7nyNklT53Ax6G2fVuJFV8Om14azYt8uvTZfGbZbqNE4TYOw4K590grItKH+zDZo/56VbE8o7wa4RKaIOAN3PgUZk3BjphYHlzzes3yS3i0Gm7Qb3nkOU0dBt5xdj/WdXk2kkDqwaJszf6cDbnC5X8rfAo2epqhvAJKv1LtDFnpqir4ldY6KtDp6Bc06bhWEu6UIL9JGanj6z00VBMkvdGM0g90+aIgML15AVx79fOl2BCkBRksxWdgYT9EXddLKthXldFiVQ5Y5tqpt7uxXURe/LdScaqyJKi5RUx5KfrlvubkDfVfZHN5TbGmpFGVpKsiQ8Pq2Vf78QmzdmykJC89iyCg20nMA7SSzzouSPfQHbSn6XJMqA7coc42qkSFqakAp5hJSWVUIbze+xR+IcyopdNqp3qyYzwn/YESEDi4dd4KqTTW/bPPrfAFlRDffBD4dGt6yxbdsvjrmQidQ3uTntY5Y/BgDIx0PBzt+d6KnKdx7o74BH/0ZsJ7h3xJ5A3i3ELkedm4cgo6nyogpcn0uDvHRHYnZi4LtiWVJKgZLEujK6pm3Iz9PG8GFly6KiLT6vuifDAFDllq6OS90dWawtpYG+hmFKygrIbFNTRO7Y4thmRF04Etp9GocxIelhlsKzl81gDeg50XADHAQA2BWo/yTuavVZ4N9zQxb6RvqiIB4rS9crAIjEvlfXxmvj2rY9ZPufWQgEm/XOtsaiDN9aEqWthlq1H2x9IIU8zJPqq+XYs7awVCmfCDoAjEPb1VVG4ltjiTLgroI73zgoQHPO4YhW3zTVMKa089ylu5BClp1wvZvykInOCeWAsTrRU0lN8RG255/kv6xsuWs1RRE4r6p0nnc0TNP5KnXfK319J7LvqXrq+asaVuSJx0VnkBfemC47cRF4aV5UVQmkpqYMtWOpxuPh+EnTRVFcVRNLVGJoCprMkkdeWIo0MELCfZQRIDNUVeSFq4kjr4m60CV0VZ7HU0MhLROncFd01OsBPYvA3rHm/EkU3VmufmpPoiz03iZYta2uyIe7ooK1XLnG733hmRkAZBWw8DbrnTmWYU+/v0RhDSZ9eXC/aAMJ++Ycco+r1Tj2lGWajP88Bevj0PKaLFJlf2NdZMCwXf/+wLbb5qgBYeCsybKl15RV8U0hyfqra/dpmNUzJsZ60oAmjnNgvTzSU7FFnarRQSn9444RANCxLPrvE6r79DvPw9ff5Xlt2lZXFYG3VW5p0jkAlBXNsHZRNgju2nyaE5RUJLVTXd4ZzSAbS1hNJxrL8minE1Ua2iqxzcfjlz5r+kFSTR7bKrHksSMLSRq6ksRhGCZApCpCR0sii2NXUUXXJXQVTdMoihKAVLRIjd2oOnRAX6C2TuTqp7s9BCuWtzRNTZaFrmvLc9ePIAN4kq1PK8/fzj20rGjW0s3jt4JYMamnzJyi2et1Le56oikSZcwIFM3+vKTqriPGKW9prjyMY89KUxnpOVgfh5Y26UIXxxvQ1DKgKKrhfpUAYGTfUxV4WFpFsSLEWWbJb02hTBCMKk7KIs1m/G+TBrR5HAG74EhP9cgLXcGUNjrYhdMjqQ3899kidNQAO6KXBXe+0VLNUAROy4Uu4QSfg44zSnt7uxQWTl7X9Nz0mS0WiSb1S8NHx56ExUIS2n0WRzHJMyCUwGui+4+nr3zU9FPwGoojbwpdl8eu0SVp6BqSR2HYAM0efVs6piyOXcNkVZfQ0SbPp5HCiiSmocC3Szagf9IURZF6XN7tIVjZrVcLU1NkoeOsILY6p20cpGDle4un+aCzKIqi1GZ5nqVmEWV5UQGQJEkOQ2GryLIsS4dtqPiWSjtlhk1nBABEhWUTD+YxWB+Hti7sROzb2wogy4qiqPY0bj0MA7ALHEXJ3cxsCN33CnfLfVeQJI1Jr6/PlCj1HgCv0hgI7nzLWa5ezHuwRAGdsP6c5cWOsUvRnBcB6Aia7OhyXP/ebYnuKAIviSmjYycFMAba5Kb3tRW0IskpbcZjqpmkuiz1VW7K6GkhLFRJ6Ko8SyY7Pbx2TZndH5FPMAGKSwBG57AV7t96WmamIo8dUyVp6GiVZ2EDAMXAa8ee8nmNoikSOl6XWRr3AFLTMBTwytZcQ/2uKIosSf3l/vgYrKx3wdIwVFnoWlpkOvpZb7LgrXxv+STPSZQ6zsqfRZ5lxNBYHKb5CICz8htKqeEl470iuY7EWfmNlQYtS3YyyvnzCIiqu+tIauAUrI9dV5NE6dpbLYenXUD90gJoCeVAcO9pCkv0ti6TPJaHTu5I0UK27y1bn3Hi1Huga/JmqpiY0ATfR6kNpWUQADDt844REBrk2nkRAP6cnFv4VcP92iaLhSrwMtVGPoPeD+78MUKli+B1RsTFpqcTLSZiVZZGWqWmjI5RQVcloauaLA3DKAEw7MvqcX63iqKo9l4AfvBDq0l/zfFzlqq61UY+SWpo0sjrdKHLpwBjvj8GBPY91TWtwDK49yxLlYWuJaUpdGx21qXneV6S3M1PXRcJmrRJ4xdD4SSaonmSQAO3KBrZDTpJWd/5asFammqsjGem8icg6ne2aRyYNIXl9x6CrH9NlI7WtxCbZOAw/Sa8MKClcQ443oOtsLZ9YnWc/B5MaaCLhwWqkmaXgEX1HlN+WNHsTyvJWXsQIqopB6skybMdI8YnSZIOi5CImPKwp044RVFUyXPrQtQ/aSNrijNEsOvfu2Oe6CK4uljkylBZ0/AOxlBCWxW6LqNjraCqktDRJs+SYwq5dvq+74d4xkpShzWAjvyPAFy/kyKUxr6tLEPXH88Zjfnd4oc2zZjotvewMjRJ7Noildtmvl8MPM/rE34VloBWapun0Sj1ZTqFQhFKffdgL1AU6Hu39/z7paO2JP+dVHN2266E6PTdmQezqV4hyFa16+vCuly8SWTA9+9UAFAU8Gq/jwBFs/+SWVtrv7OXKE2DsdPWi0fURW7hsop7vPlhGAamgo2HVRXOrETHHSOOO0YA9QsH0BF6OcPx+ON31ol2G9B8MYMIVg336/D96VW0Hx4s7OmMsIu/tnWZmYqMrmNQVEno2rpKs/h42r7jrHxy64KdJtiEsAI6GhPgvwWuIgw8TxA4itCxLFm7qgROopcI/7b2XXVoSRK4asvyZukqvM2jt9cCQIKeV7mtnieO393tgauAUtpbBqOjbLlyU13gSa88b/krUS+wTkKwOlN4laRU6o8j0K+w/PXys43iV991Si973sNKbbPfrH77eR4jGIMAou44OTvDp9NXQV72um1q6q2kjzyhLwiCoj1CqEGECui6rrc3fcISVayTIV7IiqqqXl/k3z6Ac+Ks/OY8kDwBSMn44pMVnaL4qx3j9Jx+t0BHo/wia1lk+zcmrhVn4ebG2S8qiqIOspwHS8/bxlPq/3Thj034dPG6SOCmtJmXOcMKXUsiILjzdWGgttbtfE3oakPZ+oYEFoNGWN/5vjHQSNr5BqVm4y/1lppiP/VoJpwWth0s313wdLeHGZOupXnSN3yUVw/uQptjjjme58VJfOEBMNy6Iy7Jqr1ZlvC6Rvui9Ux3fNTaukpVRTq9a2awBkTVjfI57T3TjcRhrnyNNjWJDKiG6y8c4QvQPx1KoW313VlYPee869RW7TtOSUhU9R1k1VFIgqUBgKRj32qfyEKXcd7HXewYAQCjM3LWt3yU5gRiTVOGiaGualO7cSFj6a3Gb++Qg/8sZaqjytX2DIwHAGHVdWU6sXMLQ6GjX+8WQpdC2GxdCVPe2PHufXfIZax3LiVgd67TEqlvDp60qBz7c3Djkse7zWNSNxOeNB8aPppqK13iSa98r0/i9h/QFk9Rf/SKrYDA1vsqpzTPF17dzAfhqgMPJonzGZXqvWO/HoreN84sA22TZ0Vr/R4BPllpEqNKbasrGbe2gtRvbR4rXFE1Wn4APxZBXAKA645929TEUNAnOPmc+Y4RAEzHHTnLLVUaulmmrOu6LlmfEdMuZbXyVi/nv/63Y+qRrZeGgp7fRpB9uQV6jZB0NQEU3XkUhljgTbDZCQ1yBJudjKepK1Cz7wLs0TvrO/qcOMHdso3a/GQDh0zt+74f05ZzPufOPN5tHqX0Ek+azPCkx3H0PPdXml5EAMuVa9m6oogj75oqy6LJQk4DbGI5Nqi3G60vovKpTDxS0KZpONB1nBbTbnLsGlJEs9m47UbuRY21t6HjZCB3rG9bvy5DoM7qlgMRGmKbesfUz6ZgyJ1z51sOKVSN3sb+BLIlABgrF2PfNiRThY4BwfaoAhswGr9U6aEQtRQ7YawdUxoutibjOI4P2nwkaC4rb0Xy8yTNKfXYboOFgp6aYP8YFxxTTVyWZfmeC5y/6c7afJKkzTrYOKGlKzLQsfJF2wZd1wt6L8vr9bpPf6fzbpe+79ryOWOEtpyfFUDY9C2lZZXnJYDkjCedx4Tys202/FWSxMncinibYOlYmqaKI+c1sQ15Qoua6rkigyo+7gImLfrqiWVUYzGpGgC0Ign0gwLQhiRnBCyp8LdcdPYl47ey1TKQm/gMQKj3YEWclcArLW136Xs7rRA7X+G9f7/wfvOfQstuYn+eROkhSHqXGQKn5YQ1CwB4BGiBKj02zmU/uKC791J/ia4rCIJ2Z9azkaD5Pz1P2VdnBTimHmtps1tp6Anq7MzW7rqKwvMsum0AjsJZGat3a875lByS/PU62O8ncEiSaFokb3v+BgB+sEYYZvEcr4FWJEadMhrPuvqBx7FvK+qkqiy8MnRHPGm5qNthPOFJj6O/6pMkLU8KIAHr7cZ3bV1XxZHzMjcVYXgGDpTEishhP6rKay7vNKn+VRQKJ1FGcKj3HjKCvKWExIetgaE/As3j8Bal+fsWDAAyEBmHSKbe8yqLEmCvee6dv/J89ZVTW+NMWzyqtM6fU/oO+3MuTUggSLp7J7R1ZgKGsfhLlTT1EQB9mjVb1uRNMIP7oDLMeVAsy/Jm6+ay3N+Acl6tVheIfcfUo2Xv1jtL4M+JIp/Z2v1AV6htgP5RAYpEUxTljvMDYkgQ+OskjMOYVECoqqokyn43AMB6rb+EYRgnsy9RZToaoraMnBEHVPVRGPt2Ypoc+G/sPBzwpK07Y6DFUeNHeO6vJDkV55UVTbFabzfLhW0o4tg1ua1JQzuliUNQSxY77QstnprSoqRg9U9L7qos7ABE0UckCp8phi4b9vs4zm4VCGVg5rx+V2VSTNXg4M5frdCSVeDwolSUVW4s3Gyf/JHwbowLQTI3yjLTNHWCqPi80P5iwPikacrZrwv0bSVYj5atzxtwDcOU11uV63QGO3EUb1WnySzoPhDRaubG323W1SHLeWBrZ9utoxAT5a2t71liRVEUWfF5N+lJEARNFEVRFKZAqsmyKMnSumswqmv3JQzDMIySWbvTDd5H6bEFetrksSr2bf0b6ztfz+VKEGVX8AvjFEKYxn2YxMnxllYD+L9gO8F269q6CoE3eSQeGaEwvBWGJPYPJIZOmZXQPCZVJPUN+XMTb/dEMXTanUcwsA8swCTjOI4j+1kMmKovy82dVuZpubxbd9/iPNYcJ9FNK5oiyfEjhqu4lHyjcSfcY84a+t389NQCaBnj81alBm7TXHVgL5wgpTxo7VO+BHsAACAASURBVB9Fwy4nh8bRs34l2eFpmZsQmIhosVlvgm35tp8IhA9s7d1ms5PTTvsbUulQVmRZVuRgShKoQSC+RVEURXEIhJIkSbIkS+s3rQiCtygMwzB8T4N4Jd/ZKKiGb6liR+vJDzoiS/pRUds58q+yKpI4jQ+3dG8JbQ3Iqu7u/DxpB0l370TenF1kXQOyqaFSW2YrPM+j9PxVbkTEE4sx5z/6oQtU3bavUacnkU8R5MR7OABAx1mTGXpL8jL5ovt7UUwNY23bxlSIPZHHves9A0BnV2lo+c19pOwZQFOyS4B2zjm/Ytn50T24nP4l/cgIKS4zTqO9TJOD8dU38w+tN5tNvQ/3YZxXJ7b29XqzenspbzW5j7MEZKjIsqIoyl3AawBBYB1e87AGGDFN0zAM83Fp5VadZ3me54VgVadIo+yWrsJ5Hu7PDVENfR4F1a42m66qiAOouvNVqmg/Sq5x6FWbxPodp4f+TOVufG0ybUoaZBUh7XBghLp4QdB91NlzIyI+P1UuQZX3hLa3jIV8iiCHtGgO+aO6zCPd/MabIl2q6lhXrDBkTho2jbCeyOOq99lUy5YcSz/0ZBUx1i6A8Rlgzez4M3rKxR5YePMWqhAvqqKpr9rGR69Lk1QHgKWo42zMnM1mzffhPtyHM++8Wa/3+yJMruKemaYDAGioTHIfvAIIgtfD+58DcNaTBCRZdOQ+6HreDUZZpq/HSIO3i5XOqSGN84648UlQl1z47C5LWwdkWVa+lKwfJWsVFqdNxBi2cZLEiQkA0uNzSykDSpJZ39Qya4dLRqi/k3NEvN0eIuLzP3+ZyoA8it6jY+PQFq4feNiyw0RJnxqmCY2zQt5qGiFlRaSuKJNimso9kcdl7wICyxIk01vGNWUciAR9itrHZ3BKwpTOFuEMjnoSYXheyAIPlg25Nt5/pT+TLH4AnKWb8hmP0GazHvfhfr/f7/cnBVgHm2gf7pP4Cuj5WtNRhLKiKIqqPHSjbX85rn8MAOv1er3erDfCnndCLO963gMeKfTXY6ShU3PpcCIPV871yWhFw1mYqqpPadXcsM2RV7/SOCtKHGwoJ2mcxSqnxZMlNk3TtkC+MKGp7IoR6txudW3hj3KOiLeb7RQRz/4bjgRNHIa3oGfkmxFkbugoFc7Lh7Zt67yp3vpWbeMoLTr8AfPXWFgQJN1KooRUNXDetI3PHT0A/B8WobMURZlhzAEAhCiWBVEQ3zP6/KJpknJgTHZZOFMbcbOW3vb7fbgP9yeXOG42eRiG4T6ML/t0oitNB+qmbpqmbjpjVEyxZYxSemjzPqy/9hq5wBDKfo/OoEWCQ6TxXTaJul3xkF1zY41volVRR9M0BehY8bMwFW/1XJYki5McRxtaxVmcOyTB1+1AG0opkOoYz4xQBwi2xepPFh7AOSL+pAbbc0R8lJDqaPMovLWD+yBIikBNueMmZ8UTL/M85aXCiyj8Y5/2GGoAhioiSRxfWYfxR3Uov0WodktLcpWFKVN6TdvxJAuuUOcX3nuyGXkW95T80h7pHD95s1b2BzmttWas6/1+Ctku3d47QHF57a+DIAjWbbjKY8lv25bzlvMawHodbIL14jVMXQChLG36DqREeYw0Ho1nZ8OTl/wdN1bVdV13yPvmJlhqmlRcFulbNuGpTDa0zqO07UZ54VgNbVldAVywz4xQLMmrhgJ3wR8t/EEEDfjC+PoYEU+PfbL631V05e0N3AcK0L0WhtR3n0kMjbM4zzNL6qs0/qjZr+84Jb9VABjapijiOL62N0f125ub5Re74pK7TMvyuig7PonrNm3SufeebEYR570B+dGK6Qk/WRDXm7cyifbhPjxPy9tLO8rzPM/z1rgZ+JzFD6b1N16JN/TRXTCtP+q8guNv/U3wEoYCAOSyJAU6ZkgQgqTYm26/T/bvMMlOAY4ARGgr817MVztT7ePXMMSJgLNMQ0tWNNt2f9dVzfgFI9RQkySZCObu/IOF/8JuWfiTbHSWnyLiebAeM/T17bX7cJtUVYCY6qgUzkmUEV3q6a195CR1mZtoRAAYWtoUaRQeU4bXO0ZBEARp23eiTeOkLGf/HQGAp12ttnk2c1iT4S7z0B5102wpZUe10VdC7NY1Y6yqzNO2gSSK3w1D3w/Lyn4+oWcUcUSuHoO39oMgCAL/LRQARMpdwHnLW7u0/wVFX2ztMAzDDfoBCCVpt1LqeZFC3Az7/T6cA89PdyueBoeA17ZVN86jNLkJliQAflOiAawiud51Xdc/MUJb2lwwQjWCoqqGrgMr/37pLFcv5ueK3LLwJ1E//1RPEfFFsP5xj/gf98nDz5+nn/8M/U5SDQcom6HlTTFBDR3swuWOcRiGgYem3O+LZJad4pRSsQeQs0zhVZqeH+qBKpYwz7Btk1LKTkkCYQ/VZ6xlbXtOHXEW7tb9MAx6S7TnE3pGqsK7MoRrP/CDIAiSKPEBpIp6x1nLJZ5r/wKnxVvaJmGxap7avCGSRP2H2YdH+Pu3/X7/to/i4z0c7tZUFEU57PliU1Y0y9oiKZojCGHzy1CBtgG6nrPym0zLglTNBSOU4XoaWJUDzmr1WRQ0YTPm2qWFv5IR8vIUEf8xWD/L/wgt5x+k+X+vMUOAk1243DFyVqfITHlkpEzi+OgZKCXPYp7VjIeG3DX5zDL8LnUFYOVWFEUxGQp2sgA0fpPV+6BtWcv4UJBDbCiE4t1m6McVTQAEE3pGqUMb2lzF7GlM73/AomhimotUxeMdd6kBgMRyKw55RFOIQx5n0vAwr9uompns9/v9235/DD8Pd8sDeJaps4l2Y1pUQscqyYrqCKF+nCdsqiKBJlOWFAUB+JkRygzu1zQ1jImWxLcXX+v+SZxZ+FviCbOI+B8RoMjA/xw4igAAXZtFCJaqjK7Nw3/h3wNnoktoC8JX71Iefy9Hu3ChhEVmoDF0eWQ0K8KTp8hNJCKNkqz4LUv9hYJHqS4DreZzVjyZfXmogAEYR5ap2h1jbdu2epke4SxiUbrbDGZboAK2G8fbbBGPrT80Jtr6HBZM66/8iqOp9hipihq0Sp+jAUKhL4Ai61AARVaql60ItreOmrzIybn2HoIVnnvf9DA2rvtaMc4ANBUhFuSRZVH6biaWpDpKRW5ZEaYVsAvU8mVihFqJjq8bmjJtJEtux8PQrGcW/r0IkF6vI+K/ExlY73xtUoDagLj1TRldY+JfCO582wCApow7b6VzaojDv85px1fxLnCU6cebNaKbdiHVQImhymPb5iQ7uc8QtSK2JEzSkV/bt35CPq1IDFPrWRzP5sNjVVX9tmVMLYl+wjPZy+IWXfuka8B6u7UWG6HRHzHkaMqCnM7v+kEQOL+TKNoAAIiqqHfrZf+cKsDbQA2gyUANoMmvd14klqwlH/thGMe36YyvHI77RW96aO66yLIJEYyQPEImj7xIw+Q6NB5nXhYTA6jGCj5AOzNCcVZ+W3wmRTSsNjMLfy2CsHR/lnF4ioiPldFXb+0qaptH4ct7vZGBYL1bTAqQodE226WMLkcNOP7DxDFNCgy7pcOJ1DeztCMTzz++mwf7UIriv9/68//6tx9kqYbKVHpOonMNDV2saarP2Lgsj3vUcRxjCaLv/NR1FXCCzVaAJD4C3Y+a2J/T8PgaKrqz1qNon9TA2AGIVFVZLhpVVYHXlmgAKzAFbI8trZvv57aKrqU7jP2UrZmg+1JXFEX5E++hOGWY5HFOAPSphlqTx67OkvDPoRSc4N7RmooPkJeG1k95EpJgZQKodpv3OY+z6CtPdyufMVqVRo1zZZStd4GuNqY80psK4PrrOwAQKDJ1s97sVGGaD1E0+y9bAMbym2avd6s2Ypk6Szva2vlHK79SOABo8yT6v/52Yf+xxDfrMLGmqndBaxcFqlOesYCI8uuUZlZ1d2vZ+AtAlGn21xlSAKfkJW6zaD9Q8qy0bZeripQ9Tv88RWqGCrRW3TTlN7UpTwUNASHfjHMFGMdxHPvMUND9JmmYFFkCAHn+n5df+WxDpdPoVN/m4X9C1Z2vetXwAbLluXlVMQ5EkFbA7ZzHXMSnR9NnjLGWMdafKqNN4Qb3jporQ2W9/9DUE7i2AOBZltfrzWazzE8GZhwEiJtaMjfrdZ++ZHU7SzuahrNafhanH/MrhQOAxtKA2SwYpkapl9+X3+FiogoYeB69/h0ywFliVVXV+3Eon3TlnOylwPFuW0rKZpAiAIwu5PqEFADkpsjEgUSxFCEXh7SIFKl/PJ36EKk1DQCxIjE0ldFZT9S4304acNhbdpw1mVQYMjpKymQf3YIywdyGSqdhor4x8Z8QRVF6YJQPkA2njtKyqoB8BQCCsN7s5xb+WmjMm+ixbdu2ZS3bnyqjpqbozld1T2/WRmWgbZqmw2gpI7DdrNfr+O0trdn0NtlA4AHr9QZhmEZxdk47KrKs6u5q9WpOfdqXCgcAuYHqaiCvWZigV9jUFxNVwEBNsHKeXPNWrm3KCoYmT+b5zLEE0EWqqmmW2UiSdE72quexgqIovwXumKcAddblESkAACLwAijyUMLEXxhK5myQaC5VpqNSFU5Pbfhj3zX77WYcB35IQdRlHqFNdRkdpVkR7afW6DN/Jy9J+ntuQ/XTMFGfH7GWYnMhGaDNPk/nwbO+lJILC38t4ziCfntglLGWsjY7VkanepQlXFXeDiIDDSXPMtSvCiAH28063e/3+ygDSAJbRxAAWK+V1zAM40NXp3Du2Ra0Y9L+QuE0AGPCNWU+CwYgt1CaxqUCXCGODAR1OZ922KwD1zUVBUNhqzg+7dOmu9E0tV19nf56yBlkX4BDZglFgodAAPJ0u91q1dPsRXjppgAvlZhtAE025RdusrteN3+MeDLzUtiu+/JYaO9TDbzSVRkdp3mRhfsWB/5OU1WFnre5o/++sKHHYSKh/Z4ZQNvkv4ipyavl96omxUUBR5pyHicLf0vGRPdYyxhr6flFcW8fO4kMkBiJrD4KANbrYFtMUUYERKgsNQgALDfm61Qo/0M7xIXC7X4fXOJ8FgwYs2+aIkvKRZw/n6gCMDxXJDPOv/ubbeAvLU1BlxtohSJrgHmeS1XH4dgqdMgZGH3f9/u+aFrgZA02m+12n8yR8I5xXi6Vlgawwht6XmfjvK3+lkyRRrxvNIEKVXnKN7/z9gC8M38nbyZQ8bMNVVTDXS0B4JeuKUBughq6ptfiqozDlMzoTWn8qmj3wdnCv5d+38Wa5jPGGG1PMMzu3ylAhEo98FZsNpvqGGcAL9SydwEArIMf0+7joh/m3VDE4YIAQKISIGXbHWbBMgHAKC9yURRFzyTZTAUuJqqA2ElmmEmAF2y2a9cxFVALdbfIzSjHLM9Va/I5uJlyBuNXTsnToiurEifcWnm9WYf7fZKcR0TOGbncUIF2MOsi0dhYTPiUor9ybUtTJPSc5uHrKftyiDSS1ukToU0+aJU+fv0Tfyc/g4rPbejq+zANEgEhWGkqdyDVzlR5tM9m2O1jSzRte7bw7+U1LitNuwvaWe/N+Of1hwy8UNt5BAAs1ut2yjPswxz4VdrT3827V5JleZYX8ztd3laA4wWjEjQ9Ppr6VwcAuwUA3C+rzIwuOn7OE1Xy3bWRWXn+ZrtemgqqIV3Zha3KyE8FlSzkF9+jrwAoVW6i0LuLLvbNdp3s9/t9NN+MnxC+ph+KVFdGbWRxDkDarr2la+iahJ41Jtrq+KYfIw3qV6rQFYe0jOGvFrahKOLQc16XWbY/ff2Jv7MlNyer6nI/DRIBr21tPXw5VQ7q3xflt0hV1fcWfiZPdNBUfcdYSw+KZh5W6SaNFgDIwO9yO+W4hPVmOK5/CmBIDw1p9bct64ZhwNi/nmzj7fWfKVxUtiQ9WjDhFwd2ACB+aZvC1uW3iyLRaaLq7nDH9mm6bbn0vM1uQQh47VhtZshg+amgUiTLjjPW/mDN2W7zVENtqx2fd7GvN+Swh/p4i5FoCiplnD438cDrtiahZzlqEhwJ7W/yVLuBFywcXVPFoee0Iba+Byb+zu0mIHSQzWtLcXyE9R5NERMgp511UTm48PVdrGn31xb+KGMJ8B+6rhma7ZGjolnbw5f7qJtbniwgAMiyv37Kov3+nNw+Siyu+35A3/f9ka3guP6XAdOFwkVZmZ6v+4tP6//Y0SbTZWG4qhJO8zTHOTnfouXhcRsLd+U7L1EDeS31lamMTYX5Nr1t2/KbSeel5Ru8S+aGHr3bTYIcAEA7a7rz1sF2E7iOrUnom++F7Wl2+nEM5O7Wgec5uqGKQ88regxjrIW78jYvUT3IBm8upnPO71C9bwmJALCblYOjxJqm3V9Y+IOcIuJaU/VWak8TXPn3AQAEz8ZtmY8qBkhWNWWsKa38Mhubj+J6wNANwzApgLFyp7BtvDRplwqXveSzZ00BaOojOkpMVRz6ax2u9+f133qsLhZZNAIwNN128/i38GltK7zQu/pAU3Uw37QiMXSdsuTjhQWEQFpmpiaLw/C3eN2He1it19tNsDQNCf1PS/P03NKlPc41EgBoKQn/dwDGen0X+P7CMRVx6HmVm4dBasPQnUUavaSDbAzZDKf7wobWvyqSAX9TOYg1VVM3Mwt/lFNEXGsaDHFIj0XPtnkBAN8DANzwP3NQ0WFv7PyWtYxxejWhGkriduj6YTh6Qbk/xO2XzuVK4dj1kgh/1RDqTBcH/r6htN4f1/++Z22Z24YcdoCi6boeV/WDtwtj667LDnSip4+lOipdbVnxp6klMwp3Pmvbtm3bF36ugB2ko3l4hWU28cBvF+meQ6lrz6wXhjTy9FwjAYCGTVf1V+vgLvB9x1DFoWd19nSwwopm6PZvEr5wVRvq6FzGu7Sh/PcE7fdR5WAsAfBI1dS5hT/KOSJWUetAcRrOFtrfgO8DgOrf2NvMFCAP3yz1vqUtaylrL23oXhSlzTAM7UHzmvC4tGtjftylwt2Q53rUnDtxYMWNtOSxyv8w9owWjqVIeB2PBJi67VTRfmfbC/2qVfZWZeSd1G+lche0jLVtx97OFbCDdJWBKwWwHc/11sbvuOBQtM9jTUx54E16rpEAQHNoz1r6yyC4C3yQuJdkw4iODeBnzHJdGVh+jOrf29Dpbb9ROZi1VSSapjGxfTeje678/t/v7rz9Pa2/c7OpY6YA41AzXfNYy1jL2WyMhAB9KIm7oCvPmnfAA95cJZdmCndLKP3ea+u7dW1YHzklSPfC2LOCWJqEnkfH9mFZURqar9qbk8N/LyNiVb1vadu2lL2dK2AH6RJc+VvYpu4svZe3t2Rx7znqWKf60NbFuUYCACN9mtqzFo6/8te7LM6aXpItNa0OTRtnzPI3eeTl6cX6wIbeyCXM2iqopo3azML/I2kBwFkunjPj/T8vH2WsqVOyidH2O6ZehiIiLaGZKFKhmmteXADY3Ljc74/XHwB+WILlWbaufXTAXzXQN1UeKWPXNhHOgNDjiEO7FfBvgaOgZ3n0aq+XjiK8b5W+ljHWtBXjU5vGsQJ2EKEB0a+O10xnYTV5HGor/74r5Y02VFU+Ga5xECB+/dHh1L9sLxYLzyve9knRS7Itl/GB6+IEQa/cyWqbawcfcLahmxvLciGztgqqTojpUQL8L2tXUdo8CsdN4Cp9m0ev75s1jp3lY7LNTF19f/JLBchUVdtNGsC/Y5pKVntxSONa7HWhTeZxVlyc199Yn7nM/pxEA7Jl00wd07fluR4Fxdya8tiyqphQA0RFqXsuq4qisKlGGtz5GvomAlvu1q4mvG+Vfiexqqo+a9u2mlXAJhme3s+jq6qqGXVdFZ67wluodbtqYZrWuUZCyleAFtNLYZq64+iv8ds+45Jqyiw5jEJ3XdeJsiwbj4qqNgZO7/fBhm7/Fh5i3lYx6+Bf7wJdaUwF427t6z2NcMXDdRqDaSl5Vv+n29e5Mqaxpmh3jDLWMgAg2cQZVETNUKlCV0TzOCs+qq66Pj68k8L9QQuOVAwf/Z//agVlUa8DXla5BXBWN7Vhk4b6trewkoryDnD9+wX6DKx213eeJdxslb6USNU0L+Bloh4rYBjlv74zARiH9/gZiqqqat62mm7aJHu1FtyydFU+1kh8H6CvoCwiwIH7Oi/S6C1sJEOTO3KgJeGU0sZc+BglXc3njiYuAGz/5kt/LG5w7yi5Olajt1s7fY76qk/sNAZDItSPH5zlWgFUVVc9xtuJ96m/Sbh9JYILY1aKPyhce8HifdSLUjiTNHx8xt9c8bj8qXISwwJqyso8qLsqX60kP8nIIEiA67pfRy7SsnAX3sNS/KhV+jT7WPM+1lTSFYS2xwoYsC3odwDI3zf3S5IkSX3fq6qqUlpJDVVVVVUPNZLJz9HXlk11K0XTNK2ktMrfEslSpf4wBwPKSkK8eliMki5/LxezK8TF9frfdmy3jb2iO1+VkFrWaNu7TfecXg9/nsZgWsgfpO3nCjByAchUTdNkj73bZ3wshmtn/PBinBSOiENaHLidjooxdV+UTBRFkb8HgJjLL6VXnNpeOKY+EWCaykavR/JYZvvh01jlgGq47jIqq9xxV4vlZ/y4gSkyyWH2kSdFrfbiUMcxOVTAgC0gjM+4wC86ypEUQpIkoe/7vu/VadTjhVr29hDn0J+0SoEj9zXnnFYvg6lIfXPY5xZFTRJlq9NR0ovFpRuOr93Wbcd229hzxtr7eqFbg2Zb62fGrmcgjpXRcLkCxts1TsgA+o63Tf4st4zzWFXVBlO091/XjiqOnGShuF7aitC3x4LIrNd/DC0xE0XxQuFqezaAdVSM3BSoOKStqShK1d2aLD5LZHq00VRFkYHMMgx1WNm22D8prtynma4CbZPnC7fIl+XCXbrOj6xiH5yRpDoqReiLSEIBNHkUT19WPrx/4zPQnomkTnd2CN/6k3M4OLhfpfV4Oqr7WU6FoxNVyTheJDknzPKlFUhN2b1L4V3Jbcd229gzWpa5vXDzceXY5EBzMJdDZbSo3HEc++h2jVMGQJsqN6eOmKbUtFFFGydkUjxxZJkOcRc4mtA3Jtp8Ph3e0vy3GhwmAG8myHFWjAht8WDrq9E29BlY0k2hbcs7a4oUElOThyZ3ZLGnuqUILWMtkNuLdPGlWFb5yl66aZbl+Qdbo5voGS/UluWj/R2fwav0WgH6vu97SZL4MIzS0R/0PTCkFzmMeJqrn3GIQFPOEH+poSpDk1mb1XNJqr+ZVLrt2G4b+7IsiiqwDGvUrUVSlOU1E9+hm7qxp078sbg1HyADB1YDEyiirNNQyuBFlEwdiuJYGaBicO8ZwkH1zoX4nkSg2/X7s14968kSRaMR2H8NdFwss7K8VtdLmc9WpZo48okAk+qWIpQlawHi5JabOEuyWq5c80dWpDcRUD6S36Uhn6c8xucJ8fZCOGOMaYZB2rbVNE3X9bx9/wZL7oSefOYQMT+JqiJ31QHkM1Hlsa2ToJdWJfl1LE/ObWh5DoduO7bbxr6saFEGtq2Pti2WRVMV1+PfUzc1qiIz0Ggji29UhCYFyP+fWw9J1Z2v8pCh8kTXe3CF9nuqyvOBE01Dd949//vSUMDLNKoO08x59JrhbIlEWdE0dUdHE69ZVV5829nzyIGDQT3MVsXi2NFiIsC0NEWgVVIAuW0t0sXnJals18nyLCd5CvzXbeCqAs/jau2YaluS6PUZ/7YOXLVt86gLXFNt8yz6P9FG+DS//o/3b2bLOatdyykZqy17sbTUqmqu32C3Ay1qzDlEuCcqisJzbUJKDMWRN/09y1c7U5WbDPOhPd42+S+1LY8jQ7cd24Wxz4/GvizLpiosZzEurKKqq3cW4HRzqQZKjjXOWwrwgYiiKD2MQlU3kr/07vihl/NUiI8VwZjNyuyChQJGdKhT02NjTt3iR0t013Fa17EmZmUaJzODPXserAjzllCuK4py5H5C2LHKmggwLUUReFmEQLpwcstdOMt8tVT3KUnznEwoW4ZATTXfBYbRVDHYM9Z3gW+0jYnuzjeNZvG3CYNJmrrIlu6y7hNS+Y639NKybC74QyFvDJSmUePAIeIvVs1g9KKsqNQU+gQAxlfR1uxTiR+Y29Dh/OPU5nTTsZVVUdT+tbGvqjJbll8se7AWv8iBJOOmfNCJP90C8O+BY5+LW8RRxzaPXn8V4KxMzU9eVVfSylupb/GEMnIqxDfU7zit6pduSs3crzTUCag0NT3mqHOT4GSJmrpuimdHE3lRplF0Nkfnh0BipROHtFy4rmEY1WG26lZxFyS3rUVqf3G95TLPSEzyLAccf7txBaKN8vpuYZUFqgxwvLvAbXPUnf+wsHILHz2oSymLokiN7aAs2sz0Rhtp2uvO3OEZX4tv6gG4+MAh0vSK14uSqhKxPzo56WI4EHMbSq9Gp247trKkRenPjH1ZAiiKipVlYdujzcqS1sU7F/BPZEJWs0+GnJKFMTYmWFmAZKZhmsuqrqWVt9pnaZySct5HNdZVVZff1AmzfrH6ZCNDafbHpkfTMGZhR1ORGGWiiZyWWTTrLjw9j1SXhmKz2K060fYd7a2kHwfNub1Y5LaTrYiDLM3LLM07QNWd3VqKRip5wZ1ZPemqPEF+rtn3VBX0xaOZfYR3fC3FgRTCqNuxWy/Gp9S01e6cbRIKW65PlQlS0iI1doNis16UVPWlq4/VjssSPy6G9q4KULcdW1mWTTk39mUFoK7KsihqdzHYRUnroqoHXFc5R04Pfvm1vfTRitC3efQfE3v4g31KT5CF7Y456twAUlMzDMNY1ZXkrYokSkkyFShPfVQTnatKq4QAENV7tIokTp2OL8YM1RsAWKqjclVV5LyYzYTNfEoojcpy8SiyTtRXfpKTsqpwduE0cFy1LUn08qsHJ5ltL9LFYr37npEkz0kGoKXkzXgYKJU8L6jzgrYdIAgCrFGWt1ySpFV+M2GgvI8BUsMwFPDaNhfCjkVLMgAAIABJREFU8AOeZ460TtTTkkYkmKVxquKgLivWi5LK63Ne5rLE//7a82vedGxXxr6cjH1ZlhUty8AYtVeSFk1dAtdVzpHVB7/cvl76aF3oGxMH9nD7L+tY3CJP7hc8p6qiAolhGIZpPtSVtNJ+JmkUZ9llHFmkOkpFbWtyvYcS1Pd5h9uTPXOf0oiKqqqfWCeqThomJCUlzi6c3vmO0ZQJaJlMJiBe5M7jPktJkU8sUyQ2rUTf0Ub0vT6O81kDKNRH/pGNVL3217tG69TQJPA6dXRJGDqJmDL6Q/qiqUis9Rf7n9QwDBm8su27mveM0TMo13WJ/zwY9C4qv+3Yrox9NRl7WpVlVZXEGIuypuU0iHhV5RyL+uCXi9ezj5Y9/94RpkmESUtHYFTXvwFgVLRRURRZAlLTMC3DNJa1tErSJM2T+Lqb7vfVkM//Lzn7lL7jnHeproB9z9N9QrJ05sJV/2HhFgUqywDQk3SxyC2XlIRkx37VxDR1Tdc9KnvO7ziOSHYOH9wv3btGukm8EbR4F2cUoYSeVXYyKcDClFEccikkMw5MjSdJDU0auzpd3KnPbd+WhJ461K5L/H+YqLzt2G4ae6CqyiIn5WOWn6zCdZVz/KUd/LI+89GD63mfhO45N4/s4U8L4DOJCyCfofEWqWlqpml88sQmidM4SZPrvfI/kNPI4K+P9+lHn8K7jpXfHU1C15Ai3odpPnPhnWY/usWTfvAs2SJf0alVlVYH05Tpuq7p2r0n+UmcxEk8a0p03OpW4XVU7xaoLON9oJmg53W+UHVJGDpDN2RQMu3jh0i7hq0vQgl9W9mBrDk/f7V0zsN+VeK/mKi8FF0TeHp2bBSKDqCqjsZefy2Oxh4oy6JiZVkqZUmrYmo2u6pykrJRH8ZWkUQRlz7ac18MTTkOhlgGvggYoxLN/MYSQzdNwzQf26ckjbNkFo0b3mJpKbrQdU2ZZ9HtPDOA2YxqSf5w1CS0IgmqRJPQ0SYlURgmZxcui6IoePUZc//i9Zl+iTVd03RN/2I0cRzHSRTnh6ySJEEAjPfu3/pSf7uKVk73z2lpW7oiCUNnGaoMTvJDhafvOC2rH23bHsFPEvScyW6fr3aG/DMrSXRj7wJgPhikXyuAs1rvAqWYHJuwU4WOFhW8pYWqrogxkrJi0B3vFwD0VVWWjDGBsaqspp71Y5XTXH8HgJbeKroJOPvoaTDEVr8AAKJSmStA3w99P/VjQBhPZGuCJUvOerlwVV3oeJMvDPltXtq5bPU4jQwuPvWs+XPJlqYa6kJTJHQtzfN5pPjPpMks07JNOwuesjwjKWmlHl3Xscbys1F4cFZXHxAK3X+SZVmWhRvqWXwUso11WVblN6Up2AmaJtE967Tfz35XaQj8l8BVRU7ScO4qZ8OVXs/p/NGZ9jRYSUhJNyhlXllGhcUyuF8NpHpMSTHsNFBiVQDAutNnhwPc9aHKqXwleQqgvXUD3jw+uxgMAaIL+hJv5S395WoVyau6rtu6rDIAi9VCkeRtsFgautCx2jEVYTg0kQqCINxLF9ml08jg2utYRdI/cjVFf+rr/Adi+16w8gJvGTs+pZSNdvYdtC7zVPm0krZlFp093CGUXzx+fLqPpaqLBJrCmjNcyeV+v/5O+MH80VyTr2Klw2DQbux4U82YpyV5GqwUHfrXKLxVk2mybGf1SUVZKKVttyhty/gg6XeociqPAsYsA1p69+4Q01Nnnnw+GPLuyOVq5a08T33VPtVNU66qGmTALlhq0hBsV7ariV1DLFXs2zcAwzDoiv4wSLI2qz0eRwadZc9ZkZl/6Mr/s8h/V3QA4Hu+5/ue/5Y/eJS13CD6d5QkMZTWlu2fJL8/HzuF8u7i3UkUf7l0DEWRpuXJbrWbl6mOUlF4Q6KTSl+19HMAvn/viqX5Qb51K4y8q0r7HKhMZecOwti1wgnVWFY009lBdYWvDMdh7NsSoVJl5REAkGVory0egHtHzWe0rED/UWS3WnnOauWtwlyx/Lqs63p00h8I7gJTGqzNdunoYtfkkTRREjLWNOvVQAdJ1ozrBjtoj2LPWG5p4vXj/LvnfXDhxqOs29K7OxfquQld+Svf932W5PoDa6nAYgCppcs8W9hf29f5x0lmKLdGZ/X12nPdhaxKY8coWViqeCN8vcFEcaOl3/H9BylV+5v7T08RRt5WxNKk4wa57zglzwqWTvNz4t/q+qmHqsuBTooOv3xIzvxC7TOTYZZZNxTA+ap8P4cnV7p5fhwmsPLcYOWtqjTSLNur63qwiP4Dy+BuJQ3ddrNltFc8U+QTJWFTkzy8N/kgSfr4Lq/yqIk9q21dGq7y0n/7vCcXHsi9rC+W85Cm7zgr06rNz8xJgef7vqe/xLluBKxblqiAVBf62g6u25CHSFZvmD5lvVsHnuuoqjR2rM5tTRxvL+C13GjpV3XHs7XmZu7R8hRh5LTMdAlHBajL3ECiuC6E/gdoPDmYbtqoOc6Q5ijOoHt933HGKBjvjw02v0tj5tOyd733giBIsjrrx7tUgNNgn7UbgdXKX3me+TPJtYW1q+pGLxMAlr36pPWvy20Zkl5d3/l1aVsAcsf6/1h7k+bGlWZtLDHPAEkAFKWedL7dXfsHfP7pXthf2Csv7LBv3BtxW9191JKIuVAAClUYvABAgiQg9XnDueqWRAiqysqpMp/n2BWa2Ld1VtqXJqD/oit8W2ea2F3FAB+vNynzLBE/bxteQ9H8L6rKPNWB77IoK6phSSzX3bluGMaZqiquRr8rCkDAtSQ7GAg11YUSVNUwVUhLQptmcFqarPn+Ye/aG10W+qZChib0bT2+0Pu5zzIYELfSisM/KhLXM4x08TyrhBIFKslzAADaXxRFYVoCFCgCU7VtAEgyckZJq+uakOwHlxVlOfZX0FC/9WmTdF2nyhoAgH56qQsFOO3/ToICYOtsN9ttkqSRpun6rpQGGB5J0ez7oLL55PXYWbxhG6qiAECmS31ha2LftkS6tKy6uTHbXqlMiVUXTQnvr/cgGCW6WFsSNMfSbgAA+OHg5qmhDBBuQTwaDUk2dxscJXGmauph/6QoEgB7pUWjI+uJYvMCt5TSmuLvOikmgGhtZymC6+3v9q5jykLflFkidU1d/Po494FleIAVEYRHbVCAROnoSVvKAOr04A2Orf2VJ3EAAIkKheUOf3QS5ihMhpC/KXEWQsJVUVaU7/ZXAABAXZPK37ZV3wuPJ1rG+WzgxgEA6KVuv3tSVADH3bg7GsdJVuqG/vnOHWB4eJ7n1E7Vq0L9ClDXytjjHYp9jRNV7Nt2wtnRhuoimJ/Sv+te2R1Yps6KMe+t91kSXRFoZknQVEOSak+R7fMzXAmjOK67PIoyVZWaETUE2qDRUAwqFfWXiOan4QZS5BGoKqHRCGR58DeaIOzc/cGXs6jhFOOz3FOC8/dzn39B5EdaMdoJ6melK2edohnDX86O7W2YJIuAWPf2aOzR3/lpRDUzFShljmanE/CeVGWWHe/1WhD/m8Q740k4K0AXjFvD5G/PmiYDSKq9FdIkjRI11Q3DHmF4WF3TcqcbaM8BQC9NlZkAWJFpsti37RcAAFBO3eLoV5rR3uAcTVNn7vCd9Z5JonBtZaoSNM0jQC/uNVhLgiCPlV7uSBQjVVJnnbCZqUIhsQ1H5mM1ZaIC1mRKUZhiAAD/4FlCv9m4Pvc7xg2nbHy/zovMgPXcB2B78BxJaFnG2xLf0Cx4/YO5nd9FRdtOMA8uNpVZ5aQU5o5t3NYIf9mdjD3+dTrsxX/8E9zOzDaObaFJSlOh0hpzqnNT6K9TT4Ay4qsNbbxJgmJNNYzWexy+XddFItqKPhVWg7Hn+5VVtqmJYt8+AABwG06dbt5J9RIS/pGxSz7Ad9Z7JgG0NTJlCZrPAKB/GwC7Tzcqre8oIowNq7EMWOwoCrF9ESh3ARBDbCuazwcnb6YKN97DVupre6P//RokDacT3nKcTDdgNfcBkLbevasKLdF5V+GbSgdarEbpk1TVz4K2nbDXd6p60Sq84NgA6n9m7E8LfPG/TJc6bGuir/yqxCn8FQGAVUWmA552Rn48fYCv+S6J4pQYIfBT8w/KdKGwt3o1GWA8YhdH2NY0SejvAACMjRXT2RQn/v0IQ6Ho/EbvrPdM2CstTFOU4AAAyBQKQRBmNyrdnaeLMDasBkB0oWuK5DrkJ79+wceiW9vPWv9s2Vkavh57sGQLbXRVkWE19wHQDcd9sIUWgXBv8U0GZab/Sa0jSNrO3zXN9YzErWODJWP/P3uOzFEU2I4isQyFL7cf888KIG1HHx1rDxwHb6d+yKEn0JChnPzQaf8nELUwTFRlZk9TlaM2NRuJ+zkoep2PPfV1AKoo7AEA+qPBJaut+qO8s95z6cLc1CTRY3UeoumPOt2oSPvDRoSxYfWVIlXomqpUGWPsucHLsNqj3BRqRUkxv2S5pkUYad8AoCC1MlCbreU+iqbqumE/Cs2vUvEPQv0zkUVFrP6AnD4LXR+uD8WK3Bp7797VOBLCzlUVYsdAbhRgtv/bDgCOPcWO+ggXM1AiAAAOgOajQZcfYRpZfx1A1NIg2M1NWsC1+N6oKtuw3moQFEOoz/cyBPjd0OnovzsiOvzy9fW+lLoG3tFQJLeHaa1ONyqbvX9QpoZV9pYofNcSh7E6f9JpMfXwuQfPObXKTFCUN4VaQRB4qQepo93X8UttP1C9reQ+7tYQRUnR9fswveMc3/jB87z42BTJHxS18eUS/bNYwnEfHA4B3d/ZCjJvGRK5cf97AHgwoAR4Y5WTfyUloWe05DEITFhhDYGI8Ni2zWuXVRTgpZ4aNeyG1TX9OcDwvLbk85YgZG6pwkBQDALZLIrpqiLToTrMtXoaoa0v86Z31vtGOpSqIn9OIaYbFXvv7/fb/G36FUMTWVWgCDSV0rEN2/S8e1c9KcAIRXlTqGWMMWI/qrr6eFogdYhbVnKfg+dIHKsJaazDhrMcVLK2fwSGVPin1xrrsYT56eDbI9oqLVH4+syGOxbuR+zd3d3J2dMNCqjtjS6715uH7meiAECMsVhV+Lsw81DjxzDWhmP3jRL0w2hxjuaNGrSua/xdG2B4mhcRI2RFsidtGQiK+nRpwzJTgea8U6fJsLrKa3oxgvfOet9KGygOXGAScQoAHPb7vZ+8vWYXHdskUaHQZNqMndDO1vPu7ZMCjFCUN4VaRspM29i29HC+tUxghOxezH28e1fluqrMdPdbzSl5lOX1owB1BAvAzO/LeizhbP2Dpw6rQsoI6jwa7lg4Sbrz9u7x9w1DYheeTlEBVj3Sz9GBhFqoN9AVw2qc9GaohEgYhYCUdsTbOdMaXMDwoDyPVRmY5QjQkay5nKytjpw2Cz+nybAiT4Dv8vkI3jvrvSB1w2iFy2d2QSvr3e39LDgGx2jOMXF1rSjppuN6DycFGKEobwq1eR5LDMn+3dPs2rrPCF3NfRz3wea6PFagVHlgZRrHD44AczzaPxXtNpYQpre3vfsRbbVEUKT6qblO2B+84C0/njmWhpzu59yKfj2dKJSqUEiCoIzTCDd3AQO+mtSy/OImvkwvYHhQoskyMGyrAnQUo/QyM8Few0hR0qGt/zQyqEIOgLPZzryz3gvSVUVR4u/SBUyF63t3xYfob6IoyprjTXHuAEUJANeF2lQVmhJ5W4Dj+Y36PM5Wcx9JtR+5LuJe6kQ7cPQnjrb7gwhPuvGuAswKksXoFu3bWIJXtQoAFFmS1QlttXyK5dll4N3eD4/BWxSe2k/qqsh0QDMr+vX8z4GEWvB0KPkuSfLbwZAkWYTZeLuoefWRLAGrrVgVoGsQicKLOlQ3dItLOK/Z+sggvLveS1IUKAJFIuUMIGW/31cTtiFa4kj4vwAABEEURVHqMwCAWyjKkwRCT/CdVXeKcsYr7+soWc19RFEUHxjH2M9vd77+JCSG7+3twFDfYS2eD8KMNT8A393qV7FEawtGgABESVFVRQPK9fzd07kjCgDAu4uPx2OY5udJq8xQoJyp33z/gT7nqqgDEDQWRP41zqAqAEqxrSgCdE1Bridry3GnincxVN9d7yXJUxUKSaLVuQdZ9vdsgtBPYM6RcO8OHAkAACBJoiiKAnmpAeBhvUoT9KT4vKkqbNjbKiIdL0iqQNNjsJr7sBpH8r3PGBs6rQTX973jMScLrMWTzAZhEq3nuzTKAA6+60gXsQTzN5nMo3FOTuDxM8Dm8vpSMPd5CoYvStDU07FBEtTZOQa72H8AQOhiGkGEVQqY/+47Ek9R8Op6jixRFIRnxpGcMWIbqiRA15DyerIWjTtVoGD58f/+4Xovym0P8n7fH4/Hkjd3HQfRHLLeHTkSAABAEkVRFCXS/Grh4eaxZ6G/K6mqSI4/YwI6G14IA06H3GdHELIvc588ViRJumdsbMnyPNePgyiYtYTeyHkwSB9qfkkI4N/vPLUvQygVAViZxvwjJTrf/edgZURR7OqXa9zfu8409RqnCrC6PLU8R6wwTmnZA6vzDAq6Vg8R1ylg/IOn8iSE2rt3NYmEIhB8Km+8X1mbF7OWHv/vH673H4ko7uwnYn7Jq0SWuLbJFjgSxh+URiK3H+/tPwBUZZFnhqV6oG6GFxK/W7Y55D6ZYSeKf5H7RJIkSaLksmZoEPE8rwrDMAxPOO/nXspJzoNBM74ge/fJtfssqBPNrguCVc+mA0XPgD0hCG1bXnevBHkCovFF7etqDj2CkDaVUnYOSo3vXB7ni9O7/w7iOgWM4z3YPAKSO+6DIyGpLwztD+pb17L0+Ov11m7W+3Yc6P+4fbTk7bpH3NQYaTLfNiQ7Q9ZLkiQbpxrb4ALEpmk+QgklOcpMXRP6e7MaXiiz48Gfo9S2YxmotdMgZ2PuE4iSKIqS6A1MV7Ln8W8jAzXAgJZj4BtYvwURFfPe64/wovmH+kcg+YctDWimAIAiT29//SEWpiA61KtzbF0EnafZLTE1NVC4OooXp3cHzqAVChhZtb/xf2NdkTXnqxyQoRVt4HdpWRa8pnDnu47EwTQJflPK+g9Yfvzlemu64F+v9+040JLUT10vKK4byXzLylkaeHlURgPQNVPbxzuSmYamCD3Fhi7wfctwVY7+PLNTVQKKbP+vJ0TLIfcJpOHh9x4rAcDzjJeBWGHoCEEhIKWO43zyqCUKX/U7z5GBFih8+X3a06bGL+pD3zQtp3Wi6Pt+l74kZQ0gS7IsyzJjbCF4SVPZF3TLTtSbJrzh+4YKhcQxFC5O7w6jYSsUMJIsKxMBhGyGI1zDwO/SEh0o0fyD56ocTJPgN6Ws/4Dlx8/XW9cUsaO5adkdbpt8XO/bcaCFv65Kjl0vaObugW+rAp2ThytfKUmitMBVvihlokpCR3PbUAS+bxuS46ocTFYsC8AqW/DbNkhIGYYZAAmkQR68VwDwvImBfniZAEpTYnkQjngrpIyAOHd7VwNSRMOM2yAoVpRI3DfNGwCA6/tcEKRRmALsFXFUgMUd7gS7dBRZXp54ncN8LUzvTlnAIgXMaTUv/jfwu7QI6hJrW+/eszmYJsFvSlmnZ64+vkw0me9obpnGtyJsGoKH9b4dB1r8+8rXXjAcCl6VWuZ0AzhC1p9/ES9MNvQPyO1CUehYuc1UReD7tq0InoosRQAtbQbzlb2VKAgAIA9ESZIkWfrU9Kb5ddr/MdP8H7Nl9B5svkRQ5rZ7t3cATzNugwSKogogeENzo++rL0EQRnEIcPAsQ1XlM18uyLsZH2PJGLtMDVfldnr3T9LAq9M08Ls0zwSbhmbY7r3PwTQJflPK+vidIJK4rim3xvaxB/za1FURo2JpHGj54+RFsDxQHdNSp7aKW44EVZFlWRb/yAIAHPumxliXRwVgeT4FdKhtVYBBtaqfeMh9yqqsqqqsGq2XdJ7WhJCqWmi0llX7m1D+wLZhmtbdHYefLtq7E00SQJQEv62glz3nNQyCIAgTAO/e1XXdfDvNGl4CMc/AdP7JfdJsMugkS1hyN4wjA79LnMeGaaqmaTr3KkyT4DelrItPLkPV9W9dW+P8YQsAQP5mBKPwT7MAAID66IGBsaaqqxwJ8mCkFfRnCtC9UYxTQxEFvm9bwgp8ynKLbUNJSZ5oRSh7iQkAiL47MNDTYJtFgltTRhlj9EYFJFlWPv/tpKZlqpa156vLYxtJPC9IgiB6R7l3/WMQDBoAYLsP1sZqi5F+mb8feGcm8MMZmM6/0psyU4AlCpBFxhFuE5iWnZmGZhqaaVX6ZGyb61LW/FMrDDPQvdHcnw5W84MUOP1HA2Fltq0pU8+rOUHWu1Os+bBVFEmSpAWIp2VJkqeV71QVIfi/FILrepz+db1h/7VXtOva8N5njDLK6OvSr/rbNg3Tsra2GXvXT04UTdNUVX+kFjLKNEmSNEUIAGzL+kvbpHlVqgCgfqsHhIsR/LA3h/iAMfiXelPOCrC4QSuMI+WdaaiGreiqaZrh6SaakItSFp6fgrX9B4AEdm3btkGHCG2eczy3Wn8wDtRfGMETZL13umy/92xJURSOUspOObmxX5kVf1dIgSKQlbqe2kh3/sBA7r4FHACE0r3HKGWM0deFj9PYsjRT0Uz7BuHe3u993/d9F8VWk997rGvarmtfKciaY+lpGKdIBa4wtk/DB0IolE+WWveuZeJqoCJZvU9al5MCLFPALDOOVGVvWttc003L0n+ez3mB81g5lbLiOV3I8uNHGeZhrBbnOS6Hat/740Djs4a8b44oBgAjZL13PmL+wVU1VSU1qekUju5vgx/74DuWxGpeEhmKg9elgamJPrJGYVoCAPiu53qe58Vh7AJAIsn3rGYNo4wuZa7FnW0aG8sqi+un+6Pwr6zhQvGubVro2rZ9Blplb1yJoihzcIx3LiE1A4AX8mVr/kXr3nAhyypSwTCdeHWftHS1Pp/eHddhjQLmkgBC3w/GuaaJaSq6qZmmaUbnBFRRVQ1Knop9UxS06U6qsfb4UYaeRLWtIzTN466OA01yulGxDVmWpeYixKe/Z/sP3v7Obm0Tl1VdD3+79vU2rxR2/r1rK3XNK2Idy0CXWvNu6COH8+/VYZi7AAChLO1ow+iyAnB4Y1qaauu4u3bN4/5rL4ED0B0Ft4W2adv2GTJdrLiShGGeaP03g5DB+WBPVg39oe41IYhzlBUwzEpdOuH26vfcTO9O/1yjL5gRQKj76Xs8hz3TUg1dNc08P6cymmZsvtiGIvYNTsRmRmyz9vhBWKJAacktQ+EEZrk6DjTJeKPS7V1ha+pGQsi8/e/CAVvb/V1nCzmqqtIGADCVasorz4Vaw3TcB8ckWDBFrAJB2p+gYQz7Lz1H4XDUQlmSRyewNCRSloZjW6aMbyyh53u+v7dfw8QBgFAU9m3Ttm0DEPKNytUVClraaoYekwEmsGkoyTGnACqSIIpRBgDkxgnX85VYmt4dFWCNAgbOBBAbXj3XcAtkWE6mmZYZza7yRUlRjS9lXXL6Z4mW2Sk4eOfxALCEA3c7DnQlAdQ53B862vK263AYEzbmyRNk/fkfvOyo7THJ85wAAGSa/dQ0zVWhVtMN0/nqkF/SJyHucl0bFOADx+C4nufZv+MwHLgTkCzJ9x5ljC4jIeSuaTomRjc67bh33t57DY4cAEAqCMK+7VqGAd66UuJYhZN7STV0mRBSEwCoMMb4u61Ak+MkCOMUAKrRCU+9KZdx2OL07skYrFDAwIlxxEmYcvrpAbdQti4x9xpWk/xXWTbchtukqjyrA6w/flluxoGu5ZWV/lfzr5a2vL5zoywv8AyyXhwIRkYF6Oiz0BZRnKIBitK3SVWzi0Lt6D/NL2EmuTpVJ/i/jxyDpNq+GobHuAToGwAIZVna+G25UgQpcssy7V8jY5Lifj8/yLozg2MQ7KHtAAJBOPhNLksAr7Uhck1V8g2ra/qjqurBBRR5DFasQFMVaRgGEQDUeapKUCdfpfaZ4CiKL1orFqd3z95gkQLmzDhySIMZxDvGnmlphmVeTPGURR5DWpaNCBtTvqxOLjPMyAd/Y4pnrehYFv4/ALNxIG67XOT+3Rmyahk72vK6Eh2jLEb41H+mfe0lSWTN4ALzBGSxrZMwTEoUSdxfJqlIRS4KtYP/rGlclWJB6WkE+8YxXL3GMDyThseOoB8SpU0mS0JKF+gHBsnyg2Xg8VbVvXhQ/pbQOMi31RPNKiQIhCswZQAx1gSureq7uq7xd6FEAwx/lSiAbVmGhuI8CYIKACCWReDVvX2X4uQ1DIKLUfvF6d1ZODCngLEOz5cEEMojKadSBAA0BTIsUzOsX3gWUppyVyqgWiLPNTds5fPHn2Tn33vmDNium4hfpnEg+/HzdpFcpGoaSqoaK3KXv2VxEGVpMvaf7fdy2ZqaHpOqIgAQQi6KLcvjIJBbTrBM52dV1eSiUAtQU1rjZ4xp9SSjrKLNsmO4eo1heAaFkRAOeOuhJDC+y2/pBwbBuDb1AdFMfMCzSDTTRcp3WUgS4LssSoVO4WgU5TA1OkNVoBgUoS6irABYJktjDejW1jYdZplmUmcXnZGL07vztT1TwBxkuCSAgEcjIicvCwCo+GKYuonxXAG23oO7cXRZ5EG+pauPbt2/Zm+8+506U4DprngcB/I3PL/l4qXkkVSE4O+OzHeszFEUhEkG8EIM9dF6lMtW27Q4J4wBwCvRRLFlVRpFj6qx3ZqUkJpch3ikQDHU9Ve5ff5NwigbvOeNY7j61Dg8kwUClAZAHgZ8O7Q+LjcFV6iwRZwDgPaNzDFLQ77NAfK0GcbCcF9IXIPmT0GpClgSWJmtwk+BYhimoZn206fEUg3LMi4aZW+ndxfvAjgHLMCzbk6JibpOCaln3KwYV6ZpaEWez+yYvd09uBuzatr36EBmYtuWufs08/HtTzz+rwtzU7v3AQDQC13gOqjKPAY7kfmOkSpGQRBkAL+x+ygtpMHAAAAgAElEQVQIwpe6VdRjjHGOAeAZqaLQNiSPNZ7neR7jihBy3dpAEkUxesu5S3ESvwZB3AAsOIarT/0P+CfSA+TYKBE2OGqKT/Nu6v/9409fzIz928LNO4BhWoZqmixRTXuDDMOaK8B5evdMe7igAJpjDuOXE84/kzXT1Akhs/soIDi3bVU7M0Bb97/BMs3dQ/WrYG2/2nhziswAQLFte6NvvpwtQGidr/3qeqwCcvTv5La7ECcqYEeW+I6xEqVJEABA2DlN09CjJpRBEiVxXgDAs6aIQtuSCuR2wNrIs/J2dkvSzZP11PoRx0AVuxo/Y1zwo2NY+7s+FEbyJ4aImFUUVUJee85Y0fnXZOnmHcAwDNO2jaIs94ZmmIYhzw7ONL2rf32wpMs08JICpo8YY2ec/wPP83zc5fXcAiRO4RlaPhW0lIMMALJmW2L8nLL200UBal6ymyuAY5uWvbG0I/z1PDz6suf/JE30emtRF1B6ABijVfYr1YS2yJMwjS6xjSuMIjBVINnlFAHAmvU0N66ncd3W75uCAa9oyzduir/ZGIokCVzfsrrECYqv/w4Ug8pIyIDvcMiEbzohpCIA4G1NQxMVrmsI1hWVa5sCp0kMANutbWqiwvVNU2GUxHO7unjzbliWoZqm/YSxa5qqYRnmvBw1TO/uHMV61KckRYQbCphP/FBZHnH+lYbV+ZPe4hkgGgAtcP5X84RSCQC4DWcCHprXGC0iYaedI4PT4y1VFEWRnS9lZct2HN2x0jcd0V8tAECJ69vouQcA9oc3hCXONChVVWhJmYZBclmOo4kKhSkDRbd+dNl6LtS2bm/cEPgHb2PLiiRwfVuTCpmpHFyZmBAKiVFU5ACY2apuHAmhNYB38BxTkxSuY1VmSwbXsiIzVSEAOHiOrUsK1zesREiXjzP7s3jzbhmGtbXNDGNcGLZlGuaFAkAdgPqwF0VRfMDnyaALChhOeDSjavCQA85/V6AIdKWtoyiZ2eE8L3yEMZEAjI2FvivSAHKmqrYqTHgmAKfH9/6O3xm6UtOTI7Ud07Id2/qR6sDBrxYASDVPXAbMtLc2q+jYZf1hvb5NFCBIk4SWligJg6sfiNeHR5at50Jt6/bGDWDj3buONipAQSJTFfjXyzn+F2KIDcOWBlB9UQ2dr4eKzta7d01NVbiOFratGlxLCksT+zYG7951NFXh+oZUWSLz/esMfW/h5l02DNNQDSvKcwt/M0zTNA3zytKN56v+nZ8mg85dym4napYlEVLNYuQ6UaDQpZahMB76XPqaAyC4CKo8LyzoA5uFjDEASjC2XYkJmvR2ImQJoM5hv+dIy+ue4/zEaMyCJdtyHGNjpfnwUi8AQLM57njbUIJ+mA3OR+PzB/X6f4DTcyEr1nOhtnV74wZg2O7Dxp4UIDNjke/ZZRP7b6yKTVOaCsCGEVL/Koeo2nHcT6alyXxHMtOydb4tkC5BU8fguA+Orcl831TIVMW+peeRlqWb99GIcRi7Nc5MSzNNw7h2daP0IZomg05w/ZUoKZZtVKSae/srlPfBolc1K9KSIlIQ9Cx/hsFpFDiPuM2Ob8u37mQsXllpf7UeOdLy6saNUkTI4LBs27Jsx978GKy7+AgAlT6/pCkxigCpTR3nQ+r8r9Xr/+Sab816LtS2bm/cAGRJsb46qiRwfVtVWSzzHSXkwtyEiSq0jGoyaCqp8Xe+QFVFAAzHsb+Zmsx3VRZut5rQFokKjBRDE5EzKEAWST0j+Xkrlm7eTcMwbdus4BsARy3LNEzTkNYCzfhlnAw6wfWbPM/zQtJhepsln2S06DkYwHcozBTgH+3jYM1QrHIkk/m2RPYTzYfbmd9EcBVFeSAtL9tpEKMYYQAA0bZtx9hYKUIyQC8+AgBk3LyGzhIFClNuWB4mOQBwK/X693f5j6751qznQm3r9sYNQJRlWZQK2racpHmmzLekvm5lHjxqVQ2wbwpf4whhAFFSbcctylba6Jwv4VbeK1BXuT2Q196VtAHZN6SeFs7MPfLQxNPNO1WcEgDANE3TNG1RBQDQBNNUDdM0l4oGw7B+FACIsylwrW0o/q53eZyXZG1RJ4cBkAPkWSM6tsVVQ2k1kjha6iLflgSdwJgq1jDGGqQoPf2F4iAaMfxt27Jt29r8ygoZQPvGAUD/UlwQwF5OKir+Rl6q13+wy39kNtas50Jt6/bGDaChBOVZRduWk8zcu2sJKaw1wL5hcIpnGAUJQMMIyouctor/+VP/ErV6/aVGuaUPoKBPhDagbvYezbf5rCtj6M2kACDvIRgmoAzT1EyTjE7UMSwb3ShA1zSUlORvRilrJsKIMU0iwxB4V0dhmq8t6uQwgGgAVfZFUS2TjHfUATQVUkW+rStzoIoEAGCM1fhnqgh9U6E8DoYrX8E2bcfY2BkqNgDA8x9fE/kHb2Mu1OtB0QTuepc9mMhb3zEbZ1mzngu1rZu2FzwQTD11gwI4Vf9pV2S2tTYf3P89mwiCAuX5dwHXrSPv3Kfwpd5IlmWpsjIwOYh13YBBxG/YTuaF6KE3cxBSD0w2hmmYlpm9EgAAgX8wDcO8mVKuyqrC35VyxDmfF4LKRIVClTuGwmCABF04OpPDAKQA1DbP80LU4bomJcBrQ7ChiHzLRmyZ8TeiCIpYEfqGVEkeDHPclunYlm1vjvIjgCxFQ1KPBlCfZXs+hNrwjHFPhrKMaBX1ANPC8Ve7/AgTTMvyNd+1AqxYz4XaVs9IifjGkIBhXLcdJwD0ZQTKoACK1yvmLjVVdfHm+0b4DkedYbkC37KKwD0AYZYsyyIA1xStDCBCnW4KTbueOOY2Q+4MbTEUSi1DNU0Jo98AAPuiHgzZjQLkMSgKGXHOLx55db2weHTODkMGEHVW4+9al8e4rAGqxYFBkihQ5coABp2hJDj2AJy9sTRzY1viFgBkjaO/AQBIlGar9vwUant9Wxe9uqFcz36PMC3d5S4/CieYFkdYuua7kjXruVDb2u7c/Z2/NWSgOJF7Vhc/wLt3ZQnGi6zYLnxNO2FdfRCD7rwHb+tossCDaBmPADAS1Q7FnvEhlMmSLF9dMVd4mNrvUDHGALZt5EWZRwAbPceDIbv6S3GiApZlWqEwvVaAK1k5OqPDqCoAvcxjUNWOxOESL+0oS7QPtmU5rmU7/1UDAAh/AdDfAEBRmKzewa6F2gNMC5nvsqudYVq8e1fCzxhjYX7NdyVr1nOhtuVsd7u7u12KOPWz3NdVbgHY7oN5Dl7aulYUZbwN/ygGtba7e29jlqxruXb8HQj6vh84g8evdELHL0CnVG8AAB0Z7h5N0zSd5xzhYymJVT60bV0rwFUFVQT4nzzHORNHZkn4fw7/3Nn8R0enTFTAZ6fhHjxHPBeBGYqCpXItAIDtWLq1sVn6BgBwwDCQvjSdpK3ewa6F2iNMS4SfMa64JxlldA7TMmbTmtdUCUIV45ZaNdas50JtSzc3253/HJScxfw6sywTwDTM/zbzLIJcnfoxP4pBLdPc3ZMfBeukb9nb+D2EaQMgy7Ly+KvjAICzk77vb29Fq4Esb7j3lVTTQEVOCvzzARe4yEzLjj+YzhnGw52Tu6qMU/+Ff7d3RfyMcU+fZJRVrWzd1NEukUO2w+DgJHUswwvA9t5zpGF1WobClxgAwLLtnWk7URZigAMAAP8IAFURw+od7FqoPcG0/K4T7y+u+jsO/TlMy3vZ9EnWrOdCbcvQVNtO4tcUfNmx7ViWASTVMg7np/F2PiqAbevX2ny45KmWNduSfr8kVH4UJXHsnCJxhAbty4ecSdPY4mDTZgMAVT4k+4ygHzKtCowLXOAqa3o8oogv7gEAwEgcaZ/GfzLt1OS19e/2G8vUtnzfVLJN247+uF25uWyHwcFJcgUIgLTz7l11/OV1BKSoAcAxTXvjNFmKfvUHAOj5RwCAHAMG0LrFO9i1UPsE0/L2aPv6k1DsLmBa3sumT7JmPRdqW5Kqa+bvYrMBIBNaXN/3vfLrVD3jH8c2dd/dmlfa7DuFEcz8pSAIAq1xpGwVRdfNPAdR0Sgt0EBILUrVG4C31ZKK3N5FDt322djjnOmA+C5BRYELnMcg93WEMADI13tQnl51II785kzEkTE7NSmYtnd355iqDByrspBndQHwbkxjDMnpJFFfGACW5bgP9vjLcyhzFACA6Wx0204znGYyAIA61AGK74oE4B8cbuEOdi3U/gCm5b1s+iRr1nOhtjUMmg3vy43hWtd1Xdf8PW3QA2mHjuyD7zpSP9dm32ED8Mskbdu2imqp4mZbFI7H1SAq2gstB/NTZLYLTNpuCpyT6/Lc2G3fo6dh04KxKSXNyzxVAYs9Q2EKsNte7wGfTfG+OO+ihb/C6OxoRFl1Dm4W005QnXueVdiE92OaYep0+h+lqiQC7A3Tsr8NVrz9WWSmNjxcc+wKZTnOXQAoxwFiIooiwMZ72BmG6PkNRQVl/WhU1kLtD2Ba3sumT7JmPRdqWzzP8/x4TNpqxNVmjDFR/JsAAHCPihJRSpsJ+KU6x6BbdQJ+OS1TlWN7JzaiIb5yhweTgqi0RSyLAEVZpvrdg8UkU32NcZ5fzzLwMKjhGB7+L+fvXPjme8++3IMvyJwpAKvxj8EFHMI3dO55aCjJ0gIh2gn6/mGbx4oM78c0jBJCUw4AoNd2BWOsATh4umrZQztglMay6AwPr7IfMs2TDNk1Tqf673DGVHP3aaspAt/QPBFpNTqltVD7A5iWD7LpQdas50Jtq+/7vo6n6+kc1wyA1aQuVd1I407wD7bRVmVF6zPwy0viPdToN7E3J+CXSXCBI27j8k0ZhFy/MUVoqxIT2gDkma6K7WbHd9VzHMUpurrYqcY2GZS/C4kM3r2rzPfgsE1PkZ4IkMeAEwDpYe+Fx7fk9FswSo3vMk5pJ7jKdBOy217HNJ9P1gTqusbfVQAA0bt/OyLCRua0qh4UkpVgHXoAAJzpkPNdkiOEUh2mwKFLIgRACGkNrSa9aDhiVUxN9Guh9gcwLR9l0wCwbj0XaluMMcZJxZjb1lGcA9SkwKVr7Vq7E2xv52R5QapqBvyi+4f6R6zPgF8myWOVqzKZb6o044pME6ElaGCCTTRJbItU5bsKZXEYpjdNEUO1naQxgnec89Z9sPjzHux2MwrVgTgSycZh794lx/D4dhrOziwdFLlOgTeabmIwu/fsy5jm69maDJccKoB1t78L3o4DeKfjPjj9j+HkWq44AnclCpQmQB6mmanCOSzLw2CwPXFbsV7cfnKsEwzuWqj9AUzLx9k0rFvPhdoWqwkhuoXDVhAMkdE8AyjKKstMt1PrTjA2XhOnOMfFe8AvJ4kkri5TkW8YSrkCSyK0pBqIZyOJ7+oiVvmuImkShuFtN0OMAICiLHzPOdvbzRee/ddw6umdBOl5nEMEeCG+aPu+v0dBeAyOb1PZJlGh38mbDfDqxjJKQulwnhV6jmn6b/XZmkCqQqGo/t3+bp+9Tdh9suZ8634+lWB8+mTABNz17/9++tTt5RxGscq6ivW6TGdT9Guh9gcwLX+QTf8jIaTK0z0BsxUEQ/qBUQqAM8NK5MPnTd0JqlMGURJnef4e8MtJAmiqXBX5ps0zQJYgQlvXOQpTgIDvWZkpCt/VBGVxECwY+gYAerVW3nPOsupst3/zTwAAm0/elrHzyIYIUPq26/m+XwdBWLbcqZLDOHP3yXIAeNXY1XFWVGTC/JpiGniEOSFzAOT+k3/w7/bp8W1AbxzwujpRjL3NbncX/RE4fqIroD34PC9bGiJk6gheC7U/gGlZyaZXDObHzQNFjhJdPKhlKwha6SSyBBCbVizy1FENrqNvWXqM4jhB7wG/nGRyMk1bIcg1QYSWkSJPA4DytalyU5H4jhGcLVJ32zYAtESDDy69OBGA/gbj83bn3v2cPUAcTojl+9sncSeYmtizEYBGECXFfLQ54OWuRHEcITxZk58JKQRV3ny9sCZQ1aq93fkHPw0iqjlN37Wnmou22W3h+7lTbLtzLEMVRb5tWIWTPJ5FuLEiGb71yPOynkWIsFEB1kLtD2BalrPpFYP5Jz1Hpq5IHTFdvqekKirKAPJUFfg2cXSR6xqMcHwM4zh5D/jlvGjvIC6+9z0AGPcfWgQVwPbDSy+qeVt3Zz3NO3ZFAEGUZFlS8V1fZrHU0clBCYIgCLwOwEsVJ8mypqqTNVFejoV4+OReWpNRZ7b+JtmaVa4pQnfu8Nxud9sZcafve45jKbLIt4xWyErlWXGk6SRZsy2NF/OSdj0/xgBrofYHMC3L2fSKwfyD5oFEU8SuyqyhtoirsgKIZZ7v800yKABJ8jAIIngP+OX/D9Gc4UA1P2IZ4OBp84IDZx2u72D43dbdbZ6EeR4sjkPl5RMIqvVJ7upqisgGcuUSgJc0Z6dAXQw+lRMBoKS73bU1GYUrK03SCqRJLT0f6+1ui9LT0L5/2HuuY2uyyLesIpGlCkJ/CgUPO6AVegNeNO61jkyVm7VQ+wOYluVsesVg/kHzQCQJHS1jW+L7pqryOC8A6iMPxESqKnJdU9YZSoNjDe8BvwA4O8cwRJlrmwqjNJo6Zf+kf22QPhjPnqAo8pBuFZNzpttOvIl1NrvdbhfHh/nXRICqqsrspwCC6t65JDOnRhZWoFhuJQBe0r0HnyTaXHM2t9Zk1Jm/EXCS5nwS2xkhHrfbqT+LCe/F8f2D7zm2rQp8yypkxZLQ1yfb49+7aiYWHC86nJtrU21yLdT+AKZlOZteuer8g+aBiO9ZlWu6xPcNqVEeJgBQvVLkZKoscl1DyyId5wLWgV/A9b2NbUgy17IqQ7p0pAB/ClMBY2/m+O8OETqmW9kTKYR7y3VPOMkzcXe7XRvXF0GYCEBwpkEigGi2ysY8j+YcPBm/YAGAl7a87araHOBxyZrA1iAohioGTjI8zsXGmRBvu93OxiW3W887+N7GUkW+ZVWWyHxbUzpdHdrug83XcdtLMpXOFDJrofYHMC3L2fT1zJdg12jhy0vNA0FTF6mhSHzfMILzAUOsWtypdeCX7d3edx1Dlbm2Lp1E5vvXFv5B22umQ3WqnpAITelW8ip+cWfp1lx2O3fzHIvXCvCw6YNKFkC+swiZMfb4B09V6px1oOhd11/G70vWBA6+rZLfWAZO2gmOPzKKDr97W8bhqUq83Tquf/D9JKadoJifFb6llOSTAsiq/U0oSNsLjjbDflkLtT+AaVnMpv29xdf4GeOueZIR6t1+8EF0nBGemgd4TbhVgVs8izVZB35xvbs7b2MZMtdWyFSFvqUB/GH/GsDUmzkKQeEp3RJX0y17627jODpcK8C9Z0stq67RZMD2HmylKlgH4kZT2svbyCVrMqlM3oFijchd07d2xnOcnhTAsN2N629/R4h2grL1Dh2ti+x0SSOKovQV120vGNsgL6cJurVQ+wOYlqVsevBBpqo4At8ySTr5INdWeVZXtse1Va84dTvsy4ey4rrXgV+2O3d/520MiW+rLJY6RssA/rB/DWAOOX4l1+nWWbbuto3jmrtWAO/eVdq6bjlLkeXyPAArq/Y3tahYB6Kxc7KimI8yLlmTa5U54/J1xiaJZ8fGMlV74wZvx6juBIP00q6ITeukAE3TtJlm8tDVz0mU5mOiuRZqfwDTspRNr/qglX35KDRbc93rwC/Oxt3t79ys6CXHlHpKhrHoFc/0D+Qq3Zqk7/vdbvMcx1d2QRyQKNuKtZzhOUKJT9AWPM8Ln2rCOhA1uwwTXJyjikVrsq4y/a5NkvRcAVf1jWOyLHo7EgCrk8zH1E7OTZRNnf+d6yIPHc1RGk04J2uh9kcwLQvZ9KoPGvbFS4te2p735cPQbM11rwO/mLazdf3nsOylzZ1HkW0bsO6ZZvKRLl6mWzPR3W0cR/EVnaMIICvWY1uxltM2bpTiiWoR2rZlkW4JfN/SY5aE8aztb9GarKvMX8lznIQnulKQZVnRi6LgDwAADBeFpqnngkKmQ53oIg9dk5E0nEp6a6H2P4VpgZMPeomyKx9k2s7W9V4i3Mvb/WlfPgzN1lz3OvCLqqq2lcQvSa9S5RHbqaa/45nO8pEuXqZbZ+lht2vjKMlvFUCSZfmuYi2n8mEYpSd4R1plz0hXBL5vaYnyKJgwk9esyZXKxMFJZZ7rOEkYQD/uiCTLspwSd3qZmspzSKEQaCEPCoBJlp6bSpdD7fdhWpY70kzV3rjh6+iDupMPUlXVttLod9zrVJr25ePQbM11rwO/SIqmmr9zTQNoMNZ1VRY/zI4APgYtuky3ztL3O/t3nNxcJw3j4WGlCHxXlCiOwtNNd6YD0QbQdErKBIVnvJJla3KlMigOgmQC7sqSqCXoWaaEsrHIKH4+KVAPF8jJr7QyVVnkoWtIUSTJB6Ph78K0LHekqfrGMZs0Pr7lnbDrZWvyQZKiqeYzCl+oK2+mfdldt3XdhGZr2eM68IskSZLEjUaxHZPdD7IjgI9Biy7TrbMY+qdjFMXRNeuMCJDpCtMVge9YWWbnOxQIoMa6NGwnK9D5JK5ZkyuVifMwDCeooTzKWg1KvkvycsCr5A4z5bXxPGWIFnndVhsb34VpWe5Ik2VZ0XGB4+CtVTrZPvkgSZIkYIzhVKd0KkIc/K30fnVgLXtcB37heZ7nP4+NME4yXGx/kB0BfAxadJlunUXc4jhOonRBASIZMkUR+I6RCiXRyeC+0tLQJVng+5axEqcoHv/sNWtyozJJEExQQzgLG6gRQB6m473ec3qqVXIP8kfXtLK23tj4nuyuO9J2bTz6oKyuKhSgO4dSWo8+6IQ73HVd141gu/69u1W7Z4y7YmxSvLYA/zx77Lqua56qHgCA20vDxfYH2REAgHXdq3/51Kt0aybGc5JE6c0aiwABFIYsC3zHWInT5HRVlWUreNpr1uRaZZI8bpeJI9u2bVsenQ76V4HN/hbv4Nuq1DNOAoYHCjtwt4Zw3diYhH9QOj/4F91Q8p6DePRBbdu2Dc22rGmaVjp3d/InGRsObPdha5uS4PasRgxkx2/ppZ9dyR7feb2maZoO3koAgE88a7uu+zA7AhjK5BdjLhfvcZ1unb8RsDiK01ukNhHg/13kCn1H1qzJuspcC6OUUkVthiFJ6VFRsrqeckZt69/vNKWvOQVqHEKdAsDBc0TlqrFRCf+gdO4fPPncDSV/DYHC6IOGUz70Ok14803TNJwkSRpIkiSN+yIp1uetoQhCz0ieqBLX1tWlAqxk9e+8HiNlVep6FvXaQTePAwjjB9kRAIDjPri2KmpujdM4vIY6uk63BqEk+y03KIniVKQEPfEzGsHV0bClYzjJijVZkYVTQBkjpWNaToB7futahlKWp2v/3Xaz+2RqPeYNKBCUJsDIVTU/yneb1fnVC3G8B1v+eygRdu4mgxrD6IP4uYwtb4yUVamZ26bXLUN/G/al6zomQ9K0vGJ81mS+qarqUtWXs3pZW3+9sq5xtvV6q5e2G5IjwuoPsyMAAFlzPu00ke9qnCp8U10qwHW6NQgKgfBdGaVRpKEIYp5Gp9rCxBw6/b+p0/A/YeUYDrJkTd6xxEungODY2jiO28l1zxuu6yR5PnBzyZpgb7Zb56sK332Ty3/EsggA4LgPFt/NGhu3GIo/KZ1Lqv1Njr+/AMD+L7/9XaUqjD5IFEVRVFxZEgSBH31QWdc48wtm9JK7qcZ9IRglSoObllccd8/Rqppz8wKsZPXu1lCuO2iTKZOq8lTXxINW9ZKhvSVFmhUfZkcAAJRSpgmkE7WtyjGCzzXfpXRrkABoDlCiIMkMFQqZZ/kpoZuYQ08KUGrwn7ByDGHNmrxniZcOabYhONXvOtmiPa9uPOGYFnleDK5e21gbd7P/rThfjm/F2MCjatZfXHecNTb+wAjAuoqJFR+uYlNGSH1fm9Lv5qtp7H8WA9MHo5RSWVW1DetkS1UUFQ0+aNiXvVr2kqVM+4JQKFUtblpecxnnVkgxrsAfFrP6g+eI1x20yrTyqaGpUl+bFt9Wz3EQ53n6YXYEMOBJvDVVJ5runmFsnzVxKd0aZHZvEP/fly9+Yg49PT+BCgDsxWMIa9bkPUu8dEgLFOmqCK5e0p5XjfY1jKIU5cOa8VvXcXZBuHWiICPVEChLiqbeF/TvVwAA/tvGT+xYAjj48jwmtj4r1wpA6qJAhm0jphpGiTGpShh90Maw3U7v+e3ONtTXwQdN+2LybRVO+5IoQqe0lAfgGadapu2ckfBHBVjK6r17V+Fnr9d/rc8vF2uK2JHMFvm2QigOwjT/o+yoyHSxaqpO3PWa7Qx1qkGW0q2PZWIOnX5jBZkCoG93S8cQ1qyJdTMAeS7e3CSuZgyprmsiNIWlWFxHkyw7hnGUZuOadba3QwF9aIMgLMxhjoDVBbI3eZb/IrD/vLG4HBE23D+SUxfMnRPCdfUXY4SKg2EokmkaeT403I8+aFO2Ut3zhrvbTD5ocV8CoW/uXY0HAEidwta167v2xax+cFv43EHbz9ChY0XoaBXbIt9WJEvCIIg/yo4AACCxndpwHADAlaPI8jmIW0q3/rvvSMPhpiwL/jewPh08Rx6/QrPwfz0xh44f6J8EQQB42DpXx3B68WVr8mlzuckPhnJSAFdt5odU3PM/IdYUAZoqsTSB65oCFfExiKJ4WjNexOi4J/Gx2G7GNUOZZViWs80NZJiG6QQ5wdkY4mW/ikJQVe+xHUO8SwUgeb4zrW1hGMorrgpcAIw+6NBJFu151Tn7oMV9yXey4z44o5msZz0qkyxm9aPb+j100JpfR7c1rh7fMYL1WOTbmiAUB0H9QXY0iCTrm8/jdi28yJX4B08dt5voAOBsvUmTgU7cwQDAbX4NEDj98OoH39FmxzDE7fu/5+BZ82GBz9XMQvr3nnM+pFspBgAcCNDQwtBUkeuagqR5GARhe1qzJz1HlVX05zVDqW0mtotstxE2cnkAACAASURBVNAN22Z5muTVFOKx9K394t2fQry5YIxxji1TFSwjx0UxXFBNPki79kGL+yKIoqw538ZgTLgJzFay+tFt4SdUiMaDNbmtUcK2LlNTFvmWEYyGW+p3s6NBOI7jhJ0EAGDTEwjBWhDueA/2uN0ISoAhLRm/MnEHAwBUeBzvyU6WVZyOYSLt+ZE2ZC3W9x62CkybzD222YwgfGABjo+FoDrW48gCHENLy8yUVZHrmqrO8jQ4VnB29U8kx8rZ1QNkVmplme1s8w1v2hbOcInSU4inGo0xC/HmUmBc5blrmkQ3wzzHRVEArPugxX25klsk/OWsfnJbbpmb9ubktiZZ6Ctaz45O0vd9z54BADjrMFGlrQbhsmqPelv/iCUASTppcj8AzJ5cSDloQBVFk2V95XNUWYV2sqzrsf5AS/yzLARV3vw10hKPMrEAp+XjjAU4ZhU2TUUSua6hFc7yuAaYufrX39anz7M1y+zMtFLbRw6WbFtGqEAIr4V4c8EY46JAhiUYgDEpMS4A1n3Q4r60TUOr7MfoAvztjKJuWr2lrP7stuy523pHVrOjsxgiiUEGANhtp3a523rDlpUdwEBXasb8ia5PFCVJks3hHrfrunkhaNAAmkXhKXk+xljZny3rO7H+QEucvIr644mWeJQVFuD8ss1hlPOamfrFmmWmZaPUdpwN4hwjzYs8x/laiDcXjDFGqPANXs+LqsC4oPCOD1oUpcaZDsmgAPdic1OCX87qV9zWFZLOVHkBgPXs6CyOd7/p46aX95ZWkLpmS/UGU2X4BLpcvjAAmFMulC90+MolTFx5BABWJNHZskI8S54t+zrW9zN0WQ4k5eOZlvhfkbU1gzzPLMtGyQE5YDlPKc7zPF8L8eaC8fAzumD9zjNclIOGrPmgf7vzHJljWVT4ti5TjMLXH3DwHfZSyjwAyF81tab1NdD/Yla/4ra07WLlBeA9z3QSw9h8haLpJcfVnrOiKpfqDY9NncknveF+UwBKQgTgDvUc7qUGoCTKrnACjwBNlVUrlvXT1rwCO9HtdA55+Ofyb74t8z1DacD7G1PiWpoFrxmsrhkAZJaTZ7plOZveTPM8R9mgAEsh3lxYMfyMztPBA4w+YsUH+Xd7V+OILmcHT9OqIoL6B/gHT+MIa0GwPMey0oqxq2xzMXtccVv2ZqnyMj1mzTNNIimauambXjL0Y5RleXlbb2i+cnOtAoDfFChFAYDr3ssAAJIErDgew6u7gPIIAyDmomU9eM5F1WW/ySz1zxVgzgLsHzyV7+tUBf7g2QrXVjrQDFbXDABwnhqGndkPqN38zkqEirxdC/EuBA8/85jnmJR5UUzee9kH2e7d3uGQ0ov+vWXgHIoUwPEeHI40LQjq1tt2eYqumV8Xs8cVt6WbC5WX8V0/9kxN0zSdLUJL/k6CKMmyaWD3fEW4N7kmhYs3/E0ZwwmA47qfOE5SHoErAXHF9WXQZNgWLat372r8DOxEq5zFxo0rWWIBtr0Hm+8LDQjvPew0rh1Q91fXDABMHud5qtuW1WCEclzkCNZCvLmYTjP8jB3hNK/KGwW5FFm1D74Q9kTYefd68aTKIoCsOV8F0rQgKPZu+xrnObrSnsXsccVtCeJC5WV6zopnmm1RjZ9zVYSWoDwOwygZK3nNj5eh3kCkuz1H4OpO+HfJymF4xLVs7itA+zTkkMu3gYuW1XEfHD4byxrEtazMuiHgXbiJXmIBllX7m9ilUOx4Z/fJ4eiAur+6ZgA7f7tRU8NO7UfhCVUoQzmDtRBvLp+2ptiyvutQUZAyHyKKswsS/I0pci3NgoFmgBL0pn3qCBF2O6/MckIbAEmSlM+DAujwGkRxfK0Ay9njstsCgNvKy0kDlj3TWfIYSKyK0JIqT8MgjMdK3ot+fKWFKEvyo32nPYnXXHvHrAcAWmVpTo3fPQDrrrKAuSxaVllzvvG/8BMqRFk6WI9WNqc9u6UlHmWJBZjneeFTzxVlJbib3f2MWmFtzfyDvzELkhlOxqMMjQZgLcSbycG3ZWGjG/YbQqcQ4eyChHvPHFzQoAAo0o1YPZCKd3dtFGUxKgDatu0KVee5jmV5khyjha6bpWmhZbc1yFXl5STLnuksAdSlrIjQEpqjJBg5eTkFAPI3LMr6I8ACAoO6KRgAZLbx/c4tcQBQpuU1WDQAP+riomWVJEnmBYA4aeVvgiDs0JmcfImWeFqFBRZgVuNE/7wrykLY7rbyW4Sm24a1Ndv6B29TdLpjGK9ZkWX5QDuyFuKdxT94qqBvbIZzUkwe4uyCBO9+p3LnylWs66qiqjsi7uzfURSiNAFo6vwZawLPdW2Z/3+kvcmD4zizJxYkARLcRZHKrbb85mj77LP/9DnPwQf72X6HmVdV3Z2VWSlxAxcAXH0gKVESqaxnx6mblaIgICIQ8YstTw77w43RMzNavrYmOkNe/pjeqjIhaOwiEcdnDM8Otf289CGya0R+AIDUgC8AIJXvILIwyc8ZgATN2B7npmbduFcdKxfHEo+0NAWYJoZuGJuiLBVv670ncTj1plrbM8sJHn3RqZttniRZlqfjpq2ZeEdygkdXUT03Sss8K8ph5acrSHG2nxypmqYuQUII0Yj2tFX8KIzCKIwTgNSAKh4ZgOdRut/vZ3ef97BzVNw2dP9/nn/1yrV1xMjmyMui+3nc8Yedoypdkx7+r4verOdkkXqpkrDfKFAmOgDAQd8AAPSa9/JSJOPEkJHUQAI+xpBvaVZv09fiQtAWxxKPdJwC3DTPx2eGpuu67pWFsvWy6BDTaFCqK3s2NC381HXIhd8xPVA6wmMfm3gqcb8hZEdhnNJ8mnR8dgV5T9XpCgo1omlEI191FoZhGB3CFOAAVakODMCqjMbxfhZpxd7u0Sd4Ps9npJVrK7ifWOAOBA9fizhccT9HQt7uISBKJ4zLbzgnx6rr63GIYOy8H0QjBNcAww1k3OnfNTl8i7IZA7igQ2Hq4+DWVc3ae17f16w41wGLY4lHmqYAQ3OcIwWRruu6YXwqC8XT/oniQ5gMRdsrezbEW6WN1JVJuI/yOB4VwKKJd0YVZ1yr4jSKoiSlI4OcriC02W7xW3iEyVhiGqZlWEnwI0kSGtMSAN5qnqqaIktdW/E8T5I5nxmW4z85uM2vLOKVa8vxn4Z0kmcAnkERH5IV93Mk03KCJ0fpMriZB+06Xc35tQlRf3shREWKcjyzZlcoiqLUGRwZQN/Yca2dCh7WNKvhbaHv6zI5Z/fFscTT9w9TgDE8AMCIHMaGbpi6oW9KxYviKE6jEe1Y2TOAumLpC5E6kabh/pBMuZCLJt4ZcZ790HqR0TCMjjUv8yvI834ncRiNjGb528DbBttN6Gy54LxTk7eVOgUAAFCIphHifFO7n/llkuzKtaXr9r9URVOfAYD/0DRNhRX3cyRimKbzDfV/sysTd0au23c1Y8nFiK/sB/l2+v+mqXn2w/1yejJODt2bUjwLcq1qVj0AAEXJjHNDc3Es8UTdIbN0jIJaZAc6QNJZbBiaYeiftzKLwjiMpqjb2lUPRWpAgaWuyZNocH4AYMXEOyMagqb1QkT0cDg2oooNzTAM3SsLtPVodIjpVOXgb/2t72/93+knX/CqUS3ytr7pumMShLCm6V9CJ7oMma9cW1jTyRdb+5cA6H9oGkYIVtzP6T0Ia4b5GKdX3zBbiedC39UsM87aYNII3OfZ/1sEy3kz59RpcujurMpnVbOmP3sAxQz88sxyPY0lbr/ANQkBsqvTUG3loRUoRDoxDN0wnqsfURwm0eRErewZQKQBj7HUNSVNw/1+skkXTbwzOkCh4b4WNImPNU+Q6IauG/rn2RU0/h7P93zf90WUkk+iEsjWAcDcbgxTRQjahhdZHE3f7nsby0AKAPTy1RevXlu1YPwv4/OPCgAqIeqmgSv3M4noFcRyu70ebkFSSB9rMPc0DiCd6SXL3Wy+dFrTHMubxsmhF3Xeq5q1qf8BULbqhpwxwDSWuG/XhkZ3NCGoz6ZRUm3btW3XdZ0kgTRzXFf2bCg60rDUNTxP4/DIkIsm3hktFmd5/saEyDA2BfKiOFE3QpQDqB1sfd/fktcwJXrAITWhAHjYebahYQRtJWhmqEPzKbgfuvwoa7GvlWuL8fy7+8zFTwBguRiaKMzdz5cwDLN8/GtT1z8Y+TC8dE9BUoh7358Z6JEDADPHHGHieLb1zqpqYLyhMqi5rBe5oVmbHLBzFTcdxhIr/f3qCtu/5g3Ftt52428874C8sixFWYw2z8qerZULLpt4H5Pp+E++AdHjVmGR+lziphghKtv3t75/OEQpIdrnEevaPQQbg6gIWsGyRIP2BQBgd/cQ+BuDKP2KbbZybWUh7FwA6H8CCBYNOSzE3LhSqD5sFT9KOblrygQAwHIdw1jsbn1JfZhJin6H3XjOL23bts1bR3nVtC0ANDXPi/ZAY1ryYRY8Ang3dnCB3qxr1j4IADn6VXdqsQeClDsAgL74sBeosfG8rbfdqm/aZ8ZY7pXlMI5hZc9WadHEm+jubucgqRHp/u1CNyCVOJ9cQD6S355bOJSnfsSqtd3kYRylRCcPfqYoytS+XkXQijTXpZpnFAC8YPcQuK6hdGIZyVm5tg4SGeJi/U+oOd3HHIaxdf9Fkfi/3vTftl3+0BACgG3guZau4rU+MWcU5kpgcuesF3ZTc/rTbPMsy8sBOi/y73qT0UOSDtcrAmjqiuXsrZlVva5qViPYASBTeV/oW8JB3tYVS1/UYSzxRLvHwEFKXdH92wSXet7W8bytt0+xuS2Ksiw7PX5d3zMAz3NNS8NY7uu6LOLkMPzTook30mZ3f7/VpKbUoboAiNq2bdsKRPNZErXUz/D4usoj0WVhmBKC+9GgIdb2k2eoitTyLFKq3HEoAGzHekClE8kl/AkAq9fWsXuDuove38fZdkgltrEBx/jGnyr4B2OMALYPu8B1dIKVj9vrAgBDV6lqRWoA1VoR0QFiHiZDNjwL93HaAwx9AsuizP9DzbPRHoEbmrWwAKDL8yhy+mse6FgxTpaNT0yje8Gjryo1D0HkI194Wzfwtl4RHzTT2rKi7HSLvK7vGfh3getYmoblvhYsNXU03MOLJt5Akuvt7u6HyGhqnDtQTc2zHxZYn39geGdAczFOJ4cs0nq142G081A+NVrhnLemwUWHHEcpHDcxNAHguFvv7t5Jckn7HJkLzT9veI8AAC6YkEfJ8MGm4mmUwBb/Vt6qvhaibgB2u0c/cAzjzxjANBXXUM8HC0UalCZuazpOdUsIFERt6iw9jK20EUBRZBFoKi/CY5h7UbPWPPsx5JJVeR7C77jKLhNjUkubRpGffqfr+E+WUlMoLGOytT3f226Nf6JUs82HsmB6rN/cs939ne9ahGC5rwtuG+p4D6/X3wPRTccfI6OXydMFjcByP23xq/a5ZP/kaThxeaRCjrqKkpO1PFgm0aFsOuR9cpwII0UGANN2NtvNr30habv7PxLROem6k3w/IS85jUjrPu1+pp/cXy9NyrgA8HbBY7BxDKxIIH80htI0QTG23v6sF/1liOrlqngWAWQxgRyrVUEP8fjhRc1KIyAjA/CCQjW5dDNi//2/X7xf1nXTdZxvcvUzIse+kZ7rbTwvjpNQ1w3DKzE14BbIAd7uYec61sAA1NSkmhcfFL4oCKv6GBm97OgRE03bjleQX+ZlHk1lNHvghtI17fPJWgYoUkuv+7Lppvb1igIAhOi2m0RvoeT0+hTl8DzXMglGclfXLI3jtS4B/V72UvmY1g1dU9Wa7xeD+/kPzcoKYLMJdg/BBvG27z8wA3TbBFCIE4bx1WSpm4QA4Nevy6eLmnUoPQKArq5y3hxduhtkOAZRsaq7rv+3NgMaXX/jb6soitPSMI3P37Kk0TCAufVMAxOpb2tW0Phwulhd13+4cy2CQaqL5CBVZZGnPQCoQ9NxLPVNLcqCXhoCk2Q6LZ+5Lu5242+mK8gry5IX5bAJbxUlStc8zqxlgMggoD/tZAXbeiREPVjUWCOEhFn0q/nssFEV+nc7x7U0Dcld1WSWoSnXMFLb1Jz+Us87+W23ge/7k/vJBOccwLA22939nvKmh9VJxAAA0O81AOh5lIWhAv28oeND4OJpF5oqObyeG8TLHsaiZl0qPbpJUuC5lkYkAJDkMysJE8dTkjgJY5IYpul4qSzLAA+7rWNgXerbiqU2QW/HDxHL9R88GlWtonu6xIss0QkDMHf+xrEJxlLfVKLMEvVt4AD9vHnOHWo4DY+vG3yQ6QpiJcvL8fKrf8ea3Fn2zFoGiMf29QrWkyjlXHABw7S6vqqqoquPWcK7h13gWERHcldV1CQI6qtLjZcZtXpyzgD2duv729H99AUXogRQNc3cxG/7su1XR5HDrG1wX5dZFnr0p1KJ0RSw/ODRJ0cGKHUQ5wbxn7iY/x9Jetj5G0c1pets66GxWxzTSCem2Qajtb17CLY60aW+5aUbqdAcFSjP09DM07xqFVt82iQEq6rKQL+7DwLXIgRLfcM5SwlUBQDoW5uYM3fIvENNEZ8SGLfO1tser6BNWZTH6QJQVQDS3FoGYP3Uvj4pWN8rWNPYZTeZ8cXBw51rWzqSu6qMddzXLL9I6QHjGo4DwKrlHd1Pz294SsZ2AWH2FrXWjfM/tQ3ua8Zj2kEsd2MyNbjbIHh0jgxwbRAjAADr08POmUoGKT28vYyy8j8HLpLbiu7fdsFGQ1DT/f4Yj/7fAleVq/Tw9hC4alul+7dfZ6/e7R4Cf0NMqb1q1zc0dovDqPBMrTpa25vgaWsbRO7bkloa1LxR5LZmNUBq2+Z3nNGqVXZ4o2njfbK7u7sPtqZNsNS1vCzNoW2aG/gb3Zw1Vvhi45oa6pEBnGCz9U5XkFdeBJLp3FoGaJt6bF9vfdKAZ4ZusiHZUTrS+GLXv79zLR1JfZVZWlcVjnNpBijXcBxAXeXx0f1MqzjOZ+gSb5dGHR7p2Da4rytGWV/qx9pgrFuuHzyNq5M4JOqFQTx0X/BORYSchsCz0VoPHn1NbvkBRPAYGAhEqEA1GZbBo6/LzIAqePT1lhlQnVdleMHuIdg4hjybknbXtkwcG7sdDnNhACDW9vNW15SuK+lBEoVlILlp8jgeBlhhnoJi1seuLgBecHd/N7TV61rOEqBEBXAfgt3W1jV1Mjm2gUV4NMtXVImznV1BmpeS8205t5Y5K2iICklGW9nPiIo39WHIz1UwVkl1qhUklhs8Otmh6pF1p3VF7pi6qZzZH9Bew3EAWUQAdzyMKMGN3NFDlAzf0GjGVl2rWBlotW0wAEJI1d3j2OOf1wYxAgBsWE7wOJYMUhsKU9eGgxoSjimU1iZ49BBkqBPZVL4+JIkCK7b+k9umUCb6HbSn2ixv6+8edhtdact41JCPqG2L+ABvzTCELXHw3NrmnDe6zhvAvgmZbbkOlpuKavEwwAp7HiiaZxspbwat63n+7v5+i/K8U7CDwmG+ULB7CAKPGKoiDwBN8GTbmT7zMypOf6mnK0itbg/e61NLkxtNkg2VbzEmDxgAoBZCCKI7j+ASMnIXz9ODQdO86pHX3+e2pmraN9Rwmpxs8/IajgOIVMhQV9EDVboMIEsOEUAtWEldjtltBrhBCkIIIbVPAQBMPJzcmUGMAEBTsUqmksHsu4bRJ6VtijicEo5T09AM77Pev7dFYpBRoMckUUPV3eCp+StWsbOFpoynO8Jyt9u7B0IrmTyOIz0xaptUO8CroBqAyEhzZm03NadRWzag3j9ntoYffU1u+AH+n2GAleUCKJq1LeKEZkxUALaz8XZ35WsqOgUbcsqrpgbwg91DEFiGqsi9BgCg2c92VM0yWOlB4nIXh1HCzQNMI0EBQNvanmmoWJG6phE8T+N9DwCJKnUFkqxnAEkynwwoAEAIXlA76G3QgumKpqltfkd5WvWkdwJN01T0ZKKmSM1TgldxDccB/O9Lx1cWWUzkz45oAaTRqP1fAgfPQYfpVlaDzcbSMZa7puZ5QYcMK4wRQkjhrwJAex424NwgRgCAsEaIpkMl9coml2XZx0pbUy2cEo41jBRFIV8Fj1R0zGKfkkQBQNJkhBD6hqHO9IkBbMt2t+avdyFbd18YAMAXglphAAB70VWAij3mZ9Z2npqkbssGfLtUFEXxn2y5oVCOw4j+ZUug4JomURynNGMAhmluvGb/FrJOwYaUR7RSADZbf/cYbDXW9JIMACDLshPNYdL9dAXFZJpfeAAAsLe7jeMSoipS19SsSm0N3gEA3jthKrYFANjSk1bDAJDnWWJpDxoHzU7H40ksAzQkUkDbsQGZ/NnBNbW1EwPQazhuhWiqa3JNdYwBYD8c2e7BPwsMj7ey+rDzXVfXsNw1dc5oqkkRAGCEEEKYN3+32vPwgQuDGMHY3kKR8xeA3WY4KKXlo/siHa/OoxN17lPD0Z/xthqIU9ICIbrt0Oh3Iu+wgwHA+2SjNh/ybweruzi3todxcXeyQkwkhKgf3K9y/TPWp5p8AyQJN7KqacTQdU2AqhmG/Ts+vJpE7nIAr5U6AN32/N1D8lY2PXxZBNBmvUX/ffbYfgy2ge0Rc2CAktsGiCF395CTjQ0AELswZkPnNNK13nO8ToTUGlOdCHS+7XmATMeUGOPVo78h/LyjzDUcBwCe55gmxlI7DI17H96GlYba+tDkYyjmDHYP9pwBMtSJLIbd3UOwdXUDy11TJyI1pDaCsRoY46Zp3p7HD1wYxAgGhxYh1InX3Q4AwHlylDaDqwzrkb6e+9TuMePgMbAgP5laWCOEHIrkb1UrGQYA035G3Q9n5gBfWNtHf1vDr2kmMHFc/x+iYYC2rUX+noMkYd111b4qU1MXgFVVlQXPzNGCSZW2BCAqsbz893ve9F//MxCtvgse/WBrORMDUBPy6eg4t5qK09/xw/R7Y0PDPUsNpatS9UdJeQ1QSZb/ZLsASN9s3tOM8y9Pnp1ZV/mClxTsAtcxVSy1Tc0zSt4BAA5YbosNIQMDdHGYArj+7nH+wfe2SIzR4nZcA8tdwzeZKQ+DtNGgAmbVzFvfPjOIEUzipbTteOSW86y0P846lM6azz5i1BQxHhsY96fzB//Jh7A/mloYY9zXdc2lMUChGcbT4Txz6lwYymlcHI6rWlFgnFAGAKzIItxgkCRsBI8Biwkh5OSKj00P+ncRqwBY0zQtTd8OzVV60v8aONYRH6hyenh7OSmzbRAEj37gOTpRpK4RLP2uzWLxLKchqj8dWSrWEFRlZChdU2Bc0zAFUBSkWv+yJUAqf4sPSYo0+7OX/picjDNcrqvTw9sYNNk97HzH1LHUNpzno/bdSy13KFHHNj9ZtAdQdXc3AwU5j1SkAHib7e4hcE0s9Q3L07emTAFAwQhjjLsZA/hPzplBPBiBI5uMUk0s6/63Na/62ZwYgNyruKYEBgYwxn+xYgBFNR+An7zvYzPOWaOr28ktR38bO0+oKmb3I42J0uUKSBL2ZOeRkCGVbnLFMcYIetxD3/fjldZ1bXrZLgYgePSt41Oeh8CzU7jE2QS74NH3lTxrekXV7eisbIsmRFZmUrFXoGE50ZSuYVhps3R/mrUoyR3IWNWwJEnShk72hxXMcbmOGyDyASTxdw8717aQ3DZ87KIC0L1dA8kVY6wB6NVv3xsJoC151bQAput5uwclYa2sGZ8JG0rt8GAEzqf9EOfcIEYAKlZVVT2PI57fnJu5AvB1zCMY3VdzSAGS9IXCqFkD1muynx52U+/viqWHt5dq5m/je82NiSpJ0ujww17puCGDJDl628qyLMvO4z/DIG9V1Vj6UwHpX2Ncf+gCic2voCpIURRHU5Rj199PJ1Aty6EwZyv3XNvb7R5pmPCmVzRDTctjmBgA6j3ZwMwUat4anic6VrpGILkr03i8qvYFSLJm3VmKuChVc705LtdRKHM64ETuNnjcOQMD5N+vB34diXH6EwHA56J8BYCWlqwsAYhuuR75e5+3smZTlg5JpYqCRhPg+DMkSToziBHAnYauGOCM5ucP/pOLM5jSz9O/hh41Xxc+1jRNoyCEVEVRlHPADMAZih2G38QMENlh5m/7DrdVbCvHg4PqrcqIDJLrDD8C3WMAqAVjzHSC/a9Ysb6odAij14LzwvFBgOaZuhWYsmeWQ7ctrFn/MsdF9MV3DSMzOAa0LHfreEH+tg+LgQHyiM7T4aqmrhjNy2k/m2sBZUUWqS0GSdY27XNFz/KzABtzXA66nwVNRlGzbDd48NKiV9Rg7KJiby3T0hDqm6bIk2luDg0hQgCfAUC8ArQ8TGt9QHxITt8Oray5dplFaQ4AmqZijFG9fraAAB4C2yREFeIStB5I99xhxb2zBwDd/aa+0IlFK/YKAPCpGk933tZwBErsT5JJNEVRsDQeKABohuUGU+/vkkKZGABHf9u1q9o0t0SxDVHXgxBWb7Eqw2a0OKynHHKAkvM8eWS9UQN2PSXPORcAnDOaPDxZFWj2XtnhSrb0N8rEAK72AL3y9a9Wgh4AtsqxdycYhu662lv49p40PSJEFdFhHjqrWZHl+XelWIeNspigPldAko3GpIZ+NmtzxOWOoEHoRMcAKdZMy//9xnqF6LQQNYD9GGxMk2DUN1VBTVUaAtYHKFQEQ42NeAWE5TtN+/ehCL/v2rLoICechXEMoKoYY6yqWV3Xa+HkoVWsYRjWb867rpMQQtJJ8AAAUDtX4rKszPWTVP0CeOw6RVFsGSnV7NIUgheZs202kuk5ueE+g20IIUQFACrRdWPs/d2XP48b8d4JU7F0TrM0QEKxjdeMT6PHhJiMUckxBjXJssQgyj0pasCmtU+KosgBchrrauuYTi/2sdKYTi9+hXGSlQC1yH7YALucHgCyTNy5MwdNVQ3TpFl8+F24qgpCgLZTtVmGQ5bREDRF5Jd5ECc6oJ4bvmz2zgAAIABJREFUMkjy17quMUJorvYUBSGE8IDLocd5nFBRFEXiyVunGFoZpxnANnj0bZNoqG94EROpGxjglVsITTVW4m5Lam4AQCM4Z5a5lXkHwFj4eogBnjwVqypWq6qq1vJJxqlhG7stCl4LwXXrKzhGVVVTr2E2ViDDSk/C6ldQCeFbga2b1lt1alGcF1liafekknT37/6TxED3opyJCobiPKwRSUi9/PRj1njvkBP1S57nkeK5CojXQ0KzK380McigJhOTaKhjlqdAy1+iQ5TQAiAxCW6pQ5S+phRlFuqrLA3DOAGgIZg67HYA+QEq53mCJYYfqGmqljNWFI8+UQEAan6W8EATAgVW6oKuToOYrqrPTdO2OkKOoijHlMM5LgdPZ/huLYQQhk+avsx+0UMCYG38p41haahvCqrL7aiff+U6ep4+5Ww/2TWFEoALTmMUyK7oAFITirgBeAwcQ9M0qaqqWoexv92FTYYAHNv+l75JMlZ2JU2DbguGty8GSQUAgKG3OH6GZap4mVLnTq3VDc+yUy+qIjV1Ap4nd/z1gBXblqr3KErzAo6eZ/E3gHdeUcW5kdOYKDzVFaizNDykM2+gaSqevSdTtUtEVNSxxCIKtIJm4T5MUoBIVTrmRETpmzJDkYX6mtHwcIgADlBY6oB25OXXb/gMlphc5tr1n5yBAdJzNGQRwrnYjbdYleGpqTjn91ZgyI7JBR92ZYbLwUUBhRBF+tv7wpuefVeL9z2ArpubL46pob7JY9Tw0ZysDtLpIDR7+6n6GeEBlUKVu9nWHfTpmGu2e/CJoRMuuKi6blDTeBiUceS+oQGKbSSHKKFdluit6UD1O4ySWal9mK2df9/3fZ/aTixvtnLHk2SWQxwbRAOWGnInaIpKG0lNkcRhnAIAGhigq1/OLEwAACgTQ5WqMtIVqDkNw8PMw2AFDXF95JlQlbuqsAhRoBUsHzPJ9wpUua0SpW94hnWC+lpkabg/ALxyy3was3I13fh0Bkscp0hg4nzTAACqn/GfVGWckxAgbbnglIY7LGR985uy4Ro74XI/rwpoupZlyhfe9W+qilE9APTml1KUkvEZV+Vle+qJcDtMGzJNFSnQE6UDiY65ZsHdvdM6Vl4yISoh+KPlG/LGZFV1KjxDABVLf0slDcMEDqjNLAxNkZ53Jwsz/Dzu0Onh0J++A8iyWC5STe6qNIlPwwUjDYEoI0PumpyigiCpqWgYHiKYolSoadjCfKMQSy3LNU2BuhoPbiIaa0onT/11IJa7hlFL1RRoRZXRaL8vAIq3qrQtDSt9I0rZxKhvRJnGYQbwK3ee57t3fgbTFAmEEMIAyv2s08rmYedi3NZ0//ZxZ6S+zFPXDmXPsEH8CuN06H6Aj7jclRHpbpz7O+kH7/qm4DX2/oGmFjz7uywbaSNtEqLe5kTb9e7vvDbd1x1Anou6aQFs7+6+s2VKOWOC0zwMsJBN45Wyk8GPAFIDMankh8OhVzqeaxiGg5q79uFd13Wtoig7rKB2uNOG/vRxxhICvKBI7poiCU9Nyg9oAErkrmGpmqpIaupsGCQF6oA9tVcDiwEAmreWFwnBCtR1SaN5A41mL2tzlgkbnlumhhVoa1FkcZQDABTF1ajQkdp4aaju9I/jFAlccfpTA7DIyRSeugDwEGr+cQUSzbKYyDw1FKizSZpGBdA1R8jtRJi4G/PnW9n1LYU7BQDKIosgKcsGwca6nBtyRYZhuvfl66GsOwARjQnesuoS8R5nlOYky0LFM+xe/Arj9NR9FAEc5IZIgtH9oetFYWMMTZ2n0f7M0KmEEGLrPG6xayRD2H1IEs0OyR6qkhpI7hpGk/D4sXoESuSu4QUyMZKapqRxFAKoA/jU1PViCmvz+rr0GACgrJpa8OpnxYeU9PQ/017lA6qFEELTdZMeIFbBcZQTguK4rv/k4DaDii0VIV8Qi3UsVWVkKFBzGg1qDw/A7KJXjjHGgidhp2Dby6AAsNSu1IDYSJaaVTztSCoxTeM9fI3rDqDOhGL6BUBXvShtFkYxpWpMkEgNpa+zJDokRzFFAL+7Eks1y+NDJ1hmIAxNU2ZRdKbpqoql1H4gDXJaSnldAbxyEwOwZP9Wl7lFkNw1vEji08fq1XPcqQhjjKvLfot/QFwIkf+HzvIV2GJG/sPO0THU5QlyH/V81yOEJITQGdYrRFkWgb1hXfq3pj4SAkdfSDJMx3W/qu2LKFOTfDywbrzGyHCNDdIkK9MNcM32TdM0GyuwOwVb+LtlAXjBk79xDRXJoK4xwOmxLMty27YsqXoF254IUf8XZDGoqBFReIgTWZXqMjKUvuZpdDipdwTwf59eGP2Pq+8YgztF6tqRtHHkjidRRtMc4P84/s0//9l+oQ+BbepEq06eBsxA9sWDm4gXNASNcLHui4+ke7tHX9dAFCfIfZzxKYRhf+lto65mbiuUjKXU3rAOe51kep6VlcXo1Fi2bWq2e5/ksWlZ5scM0L61A04MdV3QOEoAgGiqqqrLuFzNKTXviOgUrGc2UQEcb/vkbyzWtBd9j/p2MOMR0sZrtB0YCGm6j9tewYaR454DHCBDqKmy6LCPWqnlOdGUvq5oGp3sqttZwTWnv9QqE3VTOLEulakmd4ImUUz/YKb57mHnaBjqLD28XSjq4NHXdcN8P3a0sWYhzuWDm6hICBSaWgn6QU0CbLcb/8nWB6BRn94jhBAsi++7Ta97SV7OeLCgWR7pDx0yRSdpTmD8SqdkUcuybM+x3Nq2LMs0o4+7IbdXOLGKMcYYa3SJAVLX3veu4UFXM17yCsC2rO0T+7uo2/7CZWjbWgjBTU/qTUv/LUQNUPOiTN17rWh7BevmvskNgDeuI9TUZRLtC97xItGx0jdVQWcVPSMDrBzWWOkX0SI2VBBFiuShcPc4EWbdOCbe7nFLNBDZAURxrvQc/8ly7a4YS9EkX5sFzJcP7kgLEbJLUnVFhtbdbDebL7pU/IgwUpxyWAIriyw1tc66hyaM4mx2oVMa6kSFreGJTlId5XcYJ1kOAKCZpmXqlvPjU2wT07bNm2VMK/TkaRrGGFdVdX3z0VDtc1fH0DUszRkDUHXHRtFLUrefLrpPCC5ESZMH2PSad6CUC4CiLGLt4bPD2l7BRCqwIgP8t9mHrhlyoIEB1g5rP1X6JZEKNaM6kruGpWm4H1XzDeNYN53tJ4tAkQDL83NxdR3nmbhJxkoCAPq3Kf6lKm21OT+4P9naC/I9U5GhtTzH8zeP+7TrOvlbkw9MW2appeM2tzE0LDnzdhNdJ6ivSpsYcl9lWbKPoqFFhWnZJrGsOiaWs6GmaV8wwM1La6LHwMETLne80LE3DCA8YBBurGPo2pKnUTZgZXVVhMpWv+i/ysqc0kRrLR+aMA6zjAJkqaEqlaNvZejquizry4tjjQYGWDust7rUAViyD9lbzXLzZOmNiaErxrGmKxIoSLP+pUEGZZaXjBtI6Vs+6HxVdx0zO8QpJSAVuj0Au7aro6Ym/uzgOkdO5/ryj3Z6aMff1lt/s/HD3+9RgZ7bKh3HGCWGijqeEwxNTaNwf/J2I6Ip0LDEMRS5b3iWR4dwyK00TdNyHLMoyztTNy3TVM9k+PalNdHuwSc6GXC56Ug30zEdoCpSjWDoWibS7DA4pYQ4RLH9C9e1oKmto2bk4SSMKEBMkNLEjo5l6FpR0ugEoN+erjswgHJ+WAVRWg4A8D9ORiFbsvRWjGPfM5HUtm3bNnfeX5syZ4IrFlb6dqyGr1j6LpXp4ZC6eZQ7Y+LOJ89CTUXw6eCaBzu3wnmp+Z/s9NCOv+XECbbZ7/0+dFxoj2OMir0CorBVDE2bpdHh5O2WewVaUdjRwAA8Sw+HfQgApm2bxLKcH3nuWxYxbdM6474PLq1pWTNcbmAA/cmcUnPeapZZBGPoWiFyGgNUPM8dH9eKjn9/Pn9TamrKxMNZFB1CgD2Su8yNDCRD1wrGwnBi7A+m6yIA1TH088Paaahhf+JhrxjHD4GLpbauOT0geVMwJkrquZrSN+PgxNRATC5ZGLZ1dThWyT0ErlrVmqqOB0et5zqnugpHDviznR7a8beUIpzl7+/RkyPBbIxRAjXLDIyhaRmN5vW7KbRVSR1VV+S+4VVOk8M7BQDbNG3PsdI8zwvTsS3TGhhA0xWpbZl5fmkFR0V3TrZ3d985SkYZKx0AAOPrqdtydeUyF3kWSput3Ja/uwuTO98r/YmHk/0eYK/03KJ4ZICqpIdoWuDVOBllvkAE8OSZBp4fVm1puC4sY1jSLQ2yYhwHjz6RWh5GGlbkO7/ilHiPga700+DEg9JqsmBp+G1eGBQ8+nrFCVGHg9OepZrnkQpNBgBAlJac7/SaOz60429eeP5dz+l+97iTYD7GKFktLE8rVlgWURW5b2qR50mcA4BqmpZJTDvMMjv/ZlqWZZlWPim6pujPLq1vJ0V3QbLqkvY9zrKMAwCkyJ11W74iGhGJp6rcltT5cVG5EvfViYfjeA/A3irqJJqGZOjaqmJ5sp8WiC/mvDyfLRABPOwcQ61mh/XZ1dQqNbRXgNsaZM04dv0nR2opvOwVGTpdlWXZDR43Sp+PvS7fuxLJNcuts8Ig139yK6rbap+/5d2DrUp1nhG5qf4DVMfQUVOd7fTjmpYa2vFHWfSiayIjlvtI4PVq1uMisaV432gCSnnuizy1bN2yTDM/Kro0cU+XFn+aKboL6qoXpS3CKKFNLbJ9ehz7upj7E2KpErJGQBL/nCpXRrrmYbaw8HGB53NeHs8XiAB2D4GuMxoqMnQ6lmX5zieETbmTV5OizPYoeGvGse04z1L7N8uLVjWBVV0v2fbmK4Z/xgGUbyJR5KZsyVlhkKq73+rQsdW+oqHi2apU56Fcs3zSUsV8p+9mWuqKpM3esp30L1xrvm7ZzDg57trTw85R5bYqaLh/+xNb2TJNy3EsBt8ApMq2LdOyTFxPis4AfLQ2Qmuu6M4pi0FFrYgPh7gVjJ2uvuXcn73mKJb/VMieRF/KD1sxLNGkiedzXvqv5wtEAE7wZJupDZFpp2XWY8t/ckiqQzGYB5eTop5PgrdmHGPNtoMojUhHNPszvBDdkDXTfqDZGF0NM12RW+adFwZhjFXkW4wj15I0p8wU85PMi9SctFRan3b6bqallojtLMPU/9K3xLKswyyW6ni7R5/ILS9CDNV8WxXHMRTwXAf3NY32b5OvZ1mWZVkOIgAAumJZxLQsKz4qOo7QcGnt9/zrXNGd0wEyhNo6i/b7r2c1sSu5PwgTyyz+kr9ZNnl7SfYAK9x7se5TCtO0QJG/5DmHHypNWXCxQASANfvZTL8T291+xsV3kxDnG4lqdTIPLiZFnQRv1TiuBeeIEKL2uk4sOTIMHQghxjtjo+E2QCEXhUEAAN/+ek1aNfh0177GteJ9cpxQVSct5YbHnT7TUkvnX+xMWzdNw7Jt4695zFG3HP/Jkds8U0EU2SmioO82ronA8B3Si0g9TaE1LUu3LD5ai65pO9SyrHim6Oq67JVNrrTniu6c3riOUFuzJDwrEF/N/TlS3/d99f4bYJl7L9d9YoBpgX+DYJ8egf0THeKvFwtEAHVd1xuh65VqOvc/LGLYliWJqmomwZtrEH1zErw14xg457zUdV2XdEOPwDCI3hFCGJ8SM0e6KAwCAMjS379rG7l3P/ZvTJNcX9U0fNJSIv/pYtmi5KSllqmqY8OyLMswLcsKZ4wiI6QS55vSFoeeZ6Z+CozvHgLHUaF9cu0+04Ad7QvTMi3bSt84AIAiP1mmaZnmuaKzlhTdOb1QgpS24Vn0dF4Tu5z7M1SRP36T1TAXdTPU2C9w79W6T994XGBsDZq4ycjlAtEgr5wQTTcN84dhGppG9JQxLo7mwWlSFPtyErw14xiAlYxxmxBN0nUj6z3D0FtCCOe1OEchrk0uxsowe64bxorw/VvdjLktk5aq0ZWWWiYJisCyNMPULSvLZhmRYzSw05021dRTmoW084NH3yHA3S8uRD0lx3+yTWJZOKe/AADuCjGYgX+i6M5/rK4hpW05Oy8QX8v9KYu8yA+dDvsoy/MBNF/g3ut1n77xTxaIADhjjJm63hhGmnq6oRNC3hgT/Ch4LyJ273C2Dw9zwVszjgF4xRhXCCGKbuhhq+m6XhNCkjLPP4qjTbHStm3bHo5zem9oqTXKqeVsqG7ZVniW19c2Nc9+yLtnVVVnUPNut9sFT7YDVN3c/Yqj4pTcaFmOY2ZFmYUAGyPLBzPwzxXdRMc2NBdX33LuT1HQSOtSA8osiujQe2OBe6/XffrCP1kgAuCCMeYT0pqkZIVhEEIYY5yzk+DFX7efcfE9beaCt2YcA3A+KBWiGHrN2tIwCCIEOOc1B/AeA9fGfU3DDNppLuRE88KCGd3QUmuUlb6pm6plXTSgY0XBW8exWFVV9dSiB3Qv2O12/pPTh733GmaMpkf4ybIsy33JaM4x5CzLA8smpvWfUHSXdHH1Lef+sJiowAwNRJHsw3g4sSvuXVj37Kf+wQIRAOOcsZqQXrciJohp6BrjlSiLDwRvzTgGKJmoOCM6UQ1SsoYZhlHphDEmOB+NXtKLEPvQ5LG+/4PGdje01BrleWBZxHLMiybiLUiSpOzoPsr4KS6nG46/2+18rgT7v5NDGNLTxzCxTFpkHH/VgBd5kVq2E6n/fxTd+dW3kvsTIhCZjqEu6RS/t+VL7l1Y92zX/mCBCIAzLjgjumzwsix93SDGocwLXn0geGvGMUDFi4Ixl+itbu7LpvQNQyZ6yTljHMB0/SfH7jNNUqGipgarrtzsp6xrqTVqCmrYtmE6f+Vn0TS5r4UQvHyJwjg9TgBFCGtWsMsOSuC/hb/CQ3jKbq05/alWrP5kGVDkLG36vOTVR4ruz2kl96e96t9oPwYbfM69C+ue7dofLBABMMZKxl2i6EVRlsIwCOKcV5x9IHhrxjEA4xVjHAjpdJmxmgndAEJCxgRnQ8/6Z7sPe0yARwSa+mOM44aWWiVafIkt08ryMwaQDNNxiBY1IKJDPLVGHdKU8WGfKpWLMWRv+8MRI0oNoHIX+09bHcro14vai5DmHym6/2n1ojOeHgNXxbVIw/2/w43cn0saAAMhOHuJslZzdgno+Grdp7+/vcCBEAAXgjN2T7D1T1mWJTEG4eLsA8FbM44BOOeCcUYIGDljHSt1oyMt55zzsRNQ7N53he0A1eW6adqF2uJzuqGlVinPmWmZdpJl82koQ/zKuU/y2NRP2QZtU4v8u3TntS9xlYu6oSflsofSBDBOsFxf00PykaJbu+gUx9kGj76OBTcw/Dus5P7sdp6jKS3HWK7p/u0AcAQMlNc+0EfAwNrYGvthEatvXopcNFDNlOLtBR4ZgDHOGWdqV5UlL8tHQ2eMDX9zU/DWjOPhY5xxXZf0rCzrgt3rDSkZE5wzgCJ1N9k7eEx3IVLqpm2OXcRX6YaWWiWeZ45toPzcBlyJX7Eii8B+du+T/EcsoqycvflNpDpstydYLmyKZP+Rolu56PTdxjVd/8nFgmpDhHIp98e/u9+5htIWmMgiBHEAWAQMzh69uVlO9dPKby/wxACcc1Yy0hVFUZZl62x+MD5qgFuCdzSOC9ygmXE8aADOmKfJ5HfJGsaANCRjrGSMA1CXHhCUOzWo5KBu2vrURfzoBXSjau5HS+yGllql2C0Cy8jOB32vxa+yxLK3I2Okh9/7eOY6/sotbbudLZDuGY0+UnTLF90I2+juMxaHOrUAFnN/NG939+DbSptJjpxBMRQULwAGV4/0GQPcXuCRAThjXHD+3PwoOROsfE4GDSA+ELzJOK6+ao2YGcfDGznnnSpzxnjDWEFqbc95xTkHSC1NhuZxe1cc5N1dV0bq2IdlKjWqWPq3WjFRcfoWDYHQG1pqlaoiz57bHzSZhwHX4leaMWcM3MyNC0r1nXMGy9HXBj5SdIsX3RG2SX/je8scOscs5P44juPf3W/UKqk+yT+ssVP0AmBw9WheQXR7gScG4JwxxvfAyrLIiuIVmOCMMfhA8EbjuHjyrSb/fTKOB9bjnJeqUpYlq4qCOVXNGR8KSqq9DGSL1XifypWrIjR1nptKjVIDcrmLMxrKYgyE3tBS65RlxY7mOT9jgJX41e2sP3YJyzXjr7yh6K4vungO20imXI856Qu5P7rpOPbdvc5dtm1sMkrIAmBw9WieRXl7gUcG6BjjPA8zqBgTnL6GfcEEZww+ELzROAbvadv+biKYjGMA4JwxxoSqpIzzmjN2XzMuJsbLda8W+Xdlt2lf4iof5xnNSo2gtAGyw9TNL7yppRapFxIAz4s9y7LCPo0xWo1ffZD1twTLfaDo8quL7gy2adx/onzISV/I/VEQJo7T/TJ91PzK+FhAtQAYXD2aF5DcXuCRAYAVNCKdDF2cpYbE5b6KsoIL+EDwBuM42xnuJ15q7C80GscAwLgQjLF78cYYq1lZlvc/yrKckDtWZhE4o8VVhXSEL2/0o7+hpa5pqGZgoi6SsqK84PQ4xmgtfvVR1t8iLHdb0cVXF90ZbPP2O349DOn5C7k/bVNzLrLfjq6KKM/HUr4FwODq0VkF0c0FnhiAJsaQd5cdDlBlAHW2T2gNHwjem0h1ALxt26pqmuYvpR+MYwCoGOOCixhKzlnFyrJoBtthOLE8thx/srj2vw/Jh8V2N7TUNY3VDBmYIHf0kGpQjmOMVuNXq4HNiRZguQ8U3V6WLi66M9jm7i0JR6c9xFJVGo9bmR+mrrWcc5F/N765EIWvYTQq1gXA4DaGcFsTHxmgXy3tuil4v3JLA/mbyKOmTVkl3vuW0ej4QV4kZV8wzirO6U+1yjjnfFBl56Y4rs8dtTlO8jYBKOta6pqmagaADCBL952g4xijtfjVemBzomtYDj5SdGTjEP7T0p765qXIqwbgAraR66Eh6B4aJnnuJ15qP8eutVVdV5UajNdHOTa8WwAM1uuHPl4gAHxUGnZT8CjVVbiniQ5Rn4ZpEaWtmNAOVmSpCXJfhbQQo7EQHWdS3bK4znESkY9vXNdS17TePn0tfrUe2LxJNxWdfu6iO5t8AbaRAQDems5oBz1avwBL9gAYIc3a7ebXBywCBuv1Qx8ucKCJAeyHnetgqIvZdD/4SPAYA83QINd6Fh2idJa2mNOEQAZQ00PCtcFYOBziD1LJ4AonsaxRBaxrqf8MrcWv1gOby5DcRLcUnbLgtV/DNgAALA+aSY+W7yKLAAwVY4zPrg9YBAzW64c+XOBAIwNo291D4GogigNUs+mzHwpeiIGbuK/ScH+WtjqPd837MQPctLgucRJzPenrRCvMC8HDzkG4renh7X385pX41Xpg8wqSOwv03VJ07YLXfg3bjK+Z6dEDAwDr+vqARcBgvX7owwWOOz7u+24bPG0sKClUojvl/n8oeO0f9E26pHWL6wonOXZouT7MI60wr61vd49bDbciBDFO0FmLX60HNq8gOXvOALcUHVvw2q9hGwAA4MlMjw6pX9fXBywCBjfqhz5a4EDDBu92u13gP7lQvPCq65uXP6wsXCP7YecaGOoiPeXWHumGxXWFk4ytFJYO8/gLFplXDTxTCYJHC7c5FPGIj67Fr9YDm1eQ3Hm/vRuKzl3w2q9hm+Fvr/TocpbYAmBwo37oowWO2wcAYG12d7sg8J/kV95AX7PsGL10HnauKlVNEe/356k6Nw5Z3u4eAlMDketQGxcHdsPiusZJqhrWDnOiZeYNHgMbm37wiLrZfM61+NV6YPMKklOkj3sDAADAZsFrv4Zthr+90qPLWWILgMHVo4XuIzcJDb/S3t7d7bZR6zfQidxypkkmJNg9BLpU1amG4Ez33jpkw3KDpw0BHgHDRXYxPnPd4rrGSQoGa4d53Ogl5rW94HGroY0XaK+SpNpezgBm8av3Es/jV6uBTekKkmvHnVmXjJHsBRf9GrZZOZblLLEBMEByW/IJMLh6NN3vwc6zVLWqVCzX6WFq3nD9FAGMA1mCINt37X2bGe6GTj6Q4wXBkytV3MDA83ly5a1DRlgzNl+sPof8qc6oBmccsG5xXeMkSblwmOf8dMW8CQws/clC0lbdh92WFyY5i18V+V9P+Sx+tcYY0F9BcuP+rkvG8WcuuOiLsM2nx8DGakU7B0NND69/w1qW2B4aRgmSW8GmMTdXj+LhItje3QeuSniFicwNEMP0wsunRwZQFEVB+3fa1gxv8/Q4JkHVLScIHpUqU/vCNOcMcOuQ21qUWXm3+yfzNzwPQeRzBbFucZ2n5ch18r5fOszzjb5i3uEXYc36L/JL98q+Zd+Pg46m+FWeF/k8uWuNMRYguWw6yjXJOK5rwUVfgm0cL3jcaioPO18DEQL/G9ayxN4anpsaktt6GLq2X3g0JDKp3u7+ztcJZ7IjUygzZ7/0FEYGaNta5N9h57UvCc7iU5f8ICAqcXZGt2eGsalvHvLs33TTtIzyXfLKwqE5TPJ3ZIA1i+sqLafqlg7zfKOvmBdgzCbvtw2TdnZy6nw9OkK0KPIiz07xqzXGWIDkNA5wUzLm67p00ZdgG92wt58slUL3yYIMBv5eRnjZ31f9DxceAQy26/2dS3haf5J/Fulgu149hZEBWJFFYA7BGcaTQzIGH2wveHQ5/WE8GKbmw5kkXx3y2W/HmvVf5L2lPNzN5G+kdYtrOS3n6jDPf+vAvOYd6rOC0kpWAQaWLqn5pZWaMC15NZpGY/zqkGRllhDIp/jVGmMsQHKDbrwhGcd1LbjoS7DNMBAN/6NIzqM0zai5jfB+TIblOM79vc7T0m9tbbRdr57CyAA01s3NFJx5SaJDPJg1o/I17jQqB+Rckq8Oefb105Hxc/kbaT2VbDkt5+owz39r07bS9rKwihUZjUib4U4khyibulH919PHfv+evWONMQCGkRuXqQtXkrHAAM2Ci74E23Rd13UuXbt/AAAgAElEQVTtfetJWvA+7dUywntpLfxqYRzvO/1FTff/BgCSglTiuP2buZO6X5kYbderpxMDqGQenInoW3Z2yC/d3+3zpSRfHfLst6/I35EBViyulbQconTZ/DAvvMpFlzlLbQNDpXXtSxodDnF2O+nwv57+84wxplvpMnXhSjIW3pkvuOhLsE3b1CI/GA8g9WFSjLfvIsJ7ZS3kMUwNcUYSIfo3AOjbpuJc5C+Wq4oonyrLrp7CyACXwRlrZIDpkCneXknyLblckb+R1i2u5SCRtfGfNnJboL5pkWV7F7HjRZe5T2y3lobmNUV4CKcWdu52Y5pIharJizj+g2aHy6kLV5Kx8MliwWtfgm0MFYpYf81VqLJx4MEKwntlLegxTA1xRsrG6bB10wEAIWH0cCdRFcn94lOYGGAlOHNLkm/J5W35W7e4ltex0jh/omWX+Sz5V5NGzvV3wcaxsApVVVBTkxP4qGHEcurClWQsMMDQLfjca7+GbUb+xi2r+4Z3SDUMgBWE98paUACmhjgj7btBPAbPYdt4kj0T3aunIwOsBmduSfItuVyTv4FWLa6VdXzQOH/RZV5O/vXu7nf+xiQqVDxPNAXa7FbDiOsXTakLH5glAAAQ4muv/Rq2WeHvRYT3yloYxpAQZzP1z+diUKUroru0bAQ3gjO3JPmmXC7L30irFtfKOj5onL/oMi9fJtvg7n63cUwVqjwzUN+I7EbDCFh/0QdmCQAAsAWv/Rq2WeHvxQ5RV9bCVNkqbf4e/rOdSmWWRXdp2ehWcOaWJN+Sy9udVf/r6T/PLK61dXzQOH/RZV6+TLytf3e/80wVqjxW+1oUP9cbRtx60QdmycgB1y76NWyzwt8LoO9gjxhza+HIdywfNrKjxQBJLIvu0rLRreDMLUm+JZcfdVZdprV1fNA4f8llXrlMXG+7vb/fJlQin9VesMxebxhx80UfmCWrtATbLPL3AugLkMe6TqRWg/aliA+HZJ6Bw34DAHR8nK6xLLpLy0a3gjO3JPmWXK4ZlbftrbV1fNA4f8llXrlMDGvjbXcv+1Ky651IbdsC8NFyw4ibL1pQf/hht7V1ta4LouKa7v8b/CEt8vfC9QEAOROdMpxq8nrYn/UsZwkAVDwdjZhF0V3S2uhWcOaWJN+Qy1Wj8ra9tbaOD4pnlxDXlcvE1InjxNFbAjvVdZxIVQEeApedSu6Jf1arvvaiBfXn7x4CTye1yHVN5RFcs8RxTvV5dfAify8jvGenGtZnAPRmAwAsG/PYlkV3SWujW8GZW9USN+Ry1aj8yN5aacZ1GxZdcJnXLhNMDN36VWw2AFxomqbhEUcZS+6lRxX92/mSll+0oP48P3j0LaMuc81SMyiuWUIMc6ovq4P/uDj8pkIehq+l09jpZdFd0troRnDmZrXE+rpXjcqP7K2VddxOfF1ymdcuk2FiwzcJAHppnFY54CiCly+N40w4ykRrL1pQf7a9DR59vcnj5iv+QRZYwjRiWKgOXubvpd5/6wp5HO/b0x9jP9QV23VBa6MbwZmb1RLrcrlqVN62t1bX8UHi64LLvHaZyLIsy+MWtWzQWQOOIu2lz3DCUY4MsPKiBfVnOrYVPAGhjvDY0P3+giWQAkvVwYv8vdj774ZClmHg6skLXhbdJa2N1oMzt6sl1uVy3ahcadB13O3ldXyQ+LrgMq9dJn3f9yKa0t2yXNQrOMpEay9aUH8IE8fOQrJ56ktKeX3NEoqyWB28xN+Lvf9uKGQ2joChI2KwIrpLWhut1/nfrpZYl8t1o3K5Qdf8c0tBog8SXxcKq9Yuk7quawkX43mKMBpiHtc4yokBll+0oP5MFRjnL5haCg9z0V6zRNMuVgcv8Pdy77+bCnlACngSUVgX3SWtjdbr/G9VS9ySy1Wj0g/MpQZdE60FiT5IfF0orLrV2ZEbdn5oFcVEdZWN6dFXOMpEay9aUH+u590x+ALQNFLQdwVAU3PGxAvOTIWHWUYLBrBQHbzA34u9/z4oX4soAFQ0PcCNCrgFrY3W6/xvVEvALblcExvv7n7na0OLo7TB7l173r9tLUh0q3E+LBZWrXd2ZFlyx8FqFcXEP/NT66YLHGWitRctqD/8/7b3Jc2NK9l6ByDmkSAJiVLdW6WOsBfusH+AI/zje+Vp57afHa9fdN8aVZJIgsQ8k15gSgB5ktTtcDwv+lsoVFJJyuHMUyqWM1YlaZpFnzNDX+RFFJYXQdEAKN3BFPqmzv671r5WAcBFyWXAWZeqbfA+f9w9BGDxJcY2bSSe+3lZy0YXiSeAJYmoYdEBlMYqTJnEYXDUhK2S1IuFmthHIno1iaP0BED/RXTxN1ElVRaF2odx4NlSZt3BFPqmzv5jC2SwLACoM7VbNo11acsW8D5/vHYPgMWXGNvQIvEksCQRNSxKUsCssQpTJr6hyeI5M9b8pcjSOCUejRzHUTpgvwgRf2NVQgs8O+tlV/UqiOvzOaXaMAOZELP/2ALZsgAA6gBSwFmXtmwB7/PHa/cAWHyJsQ3tQEj8afh0lCSih0UHzBurMGVyVGXhnPqGzF+q1I/SYRTYJI7SAftFqPgjVQkt8Gw7zkN5sW2ADD7uzrFOtWFGZOJUibxg3CoAgGo3HF198STAWZe2bAHv88dr9wBYfImxDe1AbgFS+Dpg1liFK5PFuUhy2are/DQNve4N7VkcpQP2i3DxR6gSWuB5aimIVBtmRiYq41YB4LJrl72QZQlw1qUtW8D7/PHaPQAWX2JsQzsQAMaDF7di1liFKZMDfynB1OzHLDn8iIOwf0J5Eke5/otQ8UeoElrgGSaWQkm1YWZkIjButcyC5y56cQ6yAnDWpS27KQun9vnjtXsALL7E2AY5kHnQizZkFR+8SsGfhk/HNZ67i1a33Fb9PPbtTNM4ytVfhIo/UpXQAs8AY0shAZoNA1MyafiRfqu+BikPj6v61YNzdggAZ13asrv2a0qfP167xwbGNvQDoQS9aENWGRPGp6N3WajrntvKw8vAuKM4ynUg4m+sSmiB5waDpRADzYYBmJBJCni8bgd5qDzZH7Lk8AWyYA8469KW3REApc8f75ZgDc3A2YZ6ILSgF23IKjphfDZ6l7k4kttS8rLJOMps4sR/HKoYmklBmPgbqRJa4LlbRmcpHAHQIRsEmSSAx+teysR66myIPD4Czrq0ZTNmBKG1e8yhGTioB0ILetGGrGITxmfJNeqQ3R4jbht9h4ijzCZOEFUMlFFRA8aqBAk8AxCWQgiAD9kYyMQHPF73nJVab0N8TwNgse4cDAL40/DpiJORoRmzQS3r7cYW+LoIWsFMOxDqgxe0IavIhPF5co06ZHcANtKGiKPMJ04QVQwUcUCCVCVY4Jm0FGgdJTD6b2kolqGa4/G69KAPUi36cQacdf/gbkyRL4P922/9H2FPCaOCPjRjPqjF2TysZb7O9u1oCtqBUB+8oA1ZpU8YpyTXqEN2ByDcRsZRphMnvgFRxXBNHBCqBAs8k5YC6/gJMlFPjLmcI6l2BsBZ1926K5nPD4vLlACclW3qiiDwdVWm0TH0WgfZXtm6LkhcXaVRcDo0ltd8aAZQB7UsnfWjyddB92oz7UCoD17QhqzOv6b51OQadcjuFYzjKNOJE9+AqGKAsTiYY1AlaOCZsBSwARETMlkAay4nJtVmWG4eNgYfimdCZwsAAK67sW1TlgS+Los0ME9S85vW7mZp6aLE1WXqB5r4VgBQ5tjWQB3UYtiO8ytXffFbLqQdCOWhjvmQVeueNnhVoI/epQ7ZZVejTuIo04kTzRjztooBxuJgBkKVYIFn0lJgzHMhyYQD1lxOqlSjbVk1nYcNt6tCooZfAAB3e7dZ25YqCXxdptnBVBaLSwjg3N+5a1tXJK7OE/so8ZeXGihzbFP6lCFBVKyl81Promu0A9GEOo9+k/UPUHxLo7wSziVAUoKoN0NW86UouHABoE4Yp43epQ7ZZVSjzuMo+mTiBABRxQBjcUC9/1aVtIFnU5oFngdLAZ+ROyKTGthzOSmgbZnnBWUjpApZwi0A2K67dTe2ZSkLvi7TwPTExSUvclhv7u83S1OXuDoNDGVxqYsd0IdmzKcMNQqPI4pFaAfirNaO2SWI3pI0j0MPNMN2nMfqYlldLBSgAuGcR78p+iMU39KoqASVPnqXOmSXUY3axFFaAsgOAYCzNvuJE5soXAL5zNhEHIwxViVN4NmzRP5SkYFnICwF1ls5BJk0pIPP5aSAtuXL5VImfFmRPZ4CgONsNlt3szQVga/L1D9KfJ0Xxc8mfbdZ6iJfp74nnssi2QF9aMZ8ytB8SbQDmSeITK/RMZPk+tJZrVfWQCpJHn+hjJQBoA3ZZVWjNoOFu78V7AFsx7nPL7YNUJaCvY4BLsMzYxNxMMJElRz4S5mGqibylyrLicAzDJYCcw7mQCa9/3CzuqduOYuOasX7PvmwqQDgOPba3bru0SvOC9n4RebrosjCn2Av16u7+80pvoiOIV6KLLIA6EMz5lOG5muiHcg8QdSpp0ly3aLlEmcKRAKwVXJx1j0Auxp1Plh4Tn32ylB3de793B8n4mAAJSS/q/L4pMsif6nKLCLnaPWWAuPhSyDIRO2Ex81zOalbrlvDk+xmFgB0a71cu87Pg1+cF7Kz2Z6LPPYNAMOynfXm5yG6SM7dpggsSwegD81Q+DKPfhP1RyieL+ExyafcAfQDmSeIhmTDKLmu0HKJcwXyBZz1qllcbz7AtWrUOSbU1xkzXHwAKPKmqOlwHEWS5qoE4IhI+MFSYCY1BjKJrs7Tn0KibVmUVPsT/y3SCMUsAJiGYi3X+5e3Q35e6NlZXMWeYRoAiqJY5unw7F20QnyKrJOqAQDo4lwbO6u1rW/aqyg44Knu1/xA5gki4gfJ5LpOyyXSpMLcfACwBWo1KiMNOasSHIyZssiCL5xQhePdzFUJBtJSoL0y3oEgk95qnyx5Poa1hbOyF/MtC6IoSvyY/gUARVvaRnXy3l7D82J1kcynk3VUVABRVhXjR7D/WaylZaRpSvNmME0bXyv2wDBPEJHLI5LrIi2XSJMKcwEOa3ez1ObVqNTa++Fv06sEAQRRNj/y3yJNHpXD4zPqJxhZChRN2WJEJh2dTJecx/SxpY1fP2x5YWaYySAASJIka1EcebvXWj5LVhyrqiKJze1AWZbRSSuKQhRFUQSg8921Yg8sm4tnzABGyXWBlktEKgwmArz1ZstGcIeloIc1ILX3BOhVgnQ2uhlTSwEdXTQmk1Yszpbsa1Td0Pn1Yp4lP8JavOMbv54GAUCUJEny8zQNdsG9XRRFLjU+Ds/z/LkHz/M8D0C/bKzYowOWzZ0niAgPhUyu8zRSQSoMJgK882bFl9q8LITWm6XX3sPkr8+qBCdgvoROwdRSoOv2GZk0hzJfMl2CDH69EHK/JoNfT0Nnwdd1XVeF75RVVdViw2D9tfM9KQBgpU70q+jXhGRz5wmivjB/nFy/ULt6kJKLsQCne7PU2nsCSJXgBO99CX1qKdCtxBmZNNJpvmS6BEH9ehqEdnRQ6zY0aKOPVVVVnCiKKoiiKJZ1P5Rmftn4VTTAsrnzBBGhHsjkekXLJTIUCCHAqd4sNQ05AK0SnOC9L6HfZinMyCRo1jRbckgbUYr79TQIrcvIk7g0D7iWWZImquFUF83UtdckbriEdtlsXY48owm0BFE/j3+cXK9ouURGyQUhwKneLDUNSQCrEpwe3+94Cf066GRCWXJItQFRv566g3amqSAIgiCvJXGxWPBlVVUVQJLnke/GpX4R18s0DLIyB6BfNuMqAICW4W3ei54niAg3kEyup7RcIl5yQQpwqjdLTUMOQKsEJ7j6Ejr1CTT0y0xQlkw37VG/nvpbAcqiKApJUdRleZZMRZaVIM/zEiANT5oq3CnJRTTl12N88mMA+mUzql8AAMvm0hJEpBIlkusJLZeIlVyMBTjVm6WmIWH6t69WCV55CR15Am3y5eYo2XV2AO691Sw55oulKALHi6pONe1Rv54GAaAoyyxZ6tb6rF14Z2XpykuSlQXASVcV8ZIbBl+ne2/nhc1DIrTLxqtfGlCzuUBLEI28sSG5HtJyiWiv30iAU73ZJpol6Y9c/RpEnL4qookfOKoSxMB8CR17Am36ZQC4Xmdnu+7W1YufluPydZrKjwpq2qN+PQ0CQBZ55tJeJrWYX3h9vVoewzBNEgBPlYVz5psiX6dB4O32pxCAftl422WDeTZXWdRASxCRZg2RXD/plFwiVnIxFuBUb9ZZrVdW7xoIXaKLBFEliGL+Erq2ufRNN/Qn0GZfBrj2OBW8y7RH/XoaBAB/mUUnbXsWzeLCK/Zm8XaKwzAG8OTFuUhz2ax2r5l/3O92HgD9srGruLSmVc2Jlzz6TdYfeo4rdkBLEBESl0yux7RcIt7rRwpwqjeLJLpg8tfbbksURRRpDWVHfL4UBWF17mMuyBNo8y83f435ONW7THvUr2+upLHwCQKIg4OmCLBWk+LCK3r9sj8cTkEI4PHnkrOaRpr9S+DtdjkA/bJpV8Gfs+BZKsK8bLK5a5vCcXjGbNLvRssl4iUXpACnerNIomty/123JQrbdbeuUb5Yyw1fZ2PBjDyBNv8ywA2PU73DtMf9+jILP3PFqCJKADhpmipAFZuyyZ2Lo++/7b3DyQeAPeh9I030/eg1Z0G7bFrbpWE561Ud5HEEYKIch2XMpv1uNFJhlFwQApzqzSKJrg4T6puvruUjhmBGnkCjfBlYj1N1eIdpj/r1iiwrZh2MKhkEAE+VF1ClR1MRuHMVB7H3tjscmmozopGm2LcGB43vaG2XotwUsIoCgH6V4wjUFSW5TiMVRskFIcCp3iyS6Orud0p9BEZsxBDMyBNolC8D43GqHu8w7VG/nryRDgJAtFtAVcS6+cu62h3j7BTud7t9DTBppOkMThrf0doue+FRASgIx1F9nySiJddpQBUIKcCp3iyS6AKglnYMxgxAHHigcOdjmOZMwUx/Ao32ZQD8caoe7zDtUb+evBGCAMCDukj8p3v7MUsOr4EfnnZvDQFSG2mofEdpuxyEB4BI5zi67xMc5VuT63QFMhbgVG8WSXQB0Loty86YqSqAowKx1LRdsATzxG3nVc2wk5DyMlrTWYo8TjXgHaY96teTN0ISAHhlWurd9b3t/NAbuJ1Sg0blu3nb5SA82mzujOMQ3yf961/RG78FEwHeerOWQHqzSKILgNZt6WuQNuP9M4A//5n4U6hgRt32eQCi2MG8zo7wJtu9ME37EVC/nryRDo02CIX1cH3+98EXp9eg0fhu3nbp9cKjDR/POO6q7zMB9kw4ibkAb7xZzxL4Ou29WSTRBUDrtmySM+Hem8VeUcHMqrSlBCDcrd3U2c29yRaoaT8Hw68fbqSDQLk+aorpGubaYtcLj5lh2nIc5vsgF429cT/e/cx88PhzmUWaJ/B1ngWtN4skugBo3ZZ4Dg8VzO+rtGV5k91eMNN+DtSvJ2+kg4BdH4H11rVUEcrE379402/2mGkLUnhUVI5DfB/kotE37keg1Obt6zw5GZLA12UWBY03iyS6AKjdlihQwfy+StsbwnyoaT8H6tfTxDljQEQH1XEf1qoMeaxBHqETIpgVyxWV4+i+D3bRt71xT+NWispCEl0AQOu2BEDYABXM76u0vSHMh5r2c/R+vbqY+vVzMAZEdFitlutHU4UkgOTk1Flybaw5BTGV4+i+D3LRjDfufweQRFcDGjeM2CDuxAUec3lXpe0NYT7UtJ+j8+vVJrBD+vVzXO+eXdrL1XL5q8rFnz1RfaqyqM31ulvXkkUoQ3//MlMbE+RUjqP6PthFY2/cM5bB6AmlugYdaNwwYoNPaduYhQrm91Xa3hDmQ017Chq/3pAUgTtXaU749XMIV05Kss21Yznr5cPOP5/hCcrsJIcAAIrjPqwUGfJwD3l8pRYupHIc9WFe7KLn3WdmMFvGgufqwXRi9IRSXQMGRmzwSxnryhsAQzC/r9L2hjAfatrT4JVpZBiyKHDnqkgjwq+fQWCflLOyTXO1Xi7Xh9c3L/0oQ56o8BcAAFW3Vh8MBeITpFGUywtgaIejSuO4WY+RsqgpF61HAOC6etN9FvNt99myvISTZVTagqvSvm2S0RNKdQ3wV14Eh2CDe67wVfkNgCGY31dpe0OYDzXtqQixbyAEgJ3Unbu2bVOxNqvwdbc7PNoy5Kc2P7ZYCLLxBxlCSMIokWUBBu0wQ0LlOEOi5IjnbYYCtI6Smv2wHJevyyAA66FxlEbL0AyB67lz2iC5HFEozTWYv/JyaYlJN+yeDRyFS/W2SgAVzO+rtL0hzIen7P4+CJST6jWce982GAhh9Ha6qPZHDWI4dY9T1nVd3Tlfl0mUVrYiDtqBAirHUXPE6qLKo98E/YGr93l4THIQgeEojZaxsMWBO6cNkk9jCqW4Bvr0lZc7vSGmtWuLHRssHi3OV6DJDaCC+X2VtjeE+VimPSq4AECyTVVZCHxdl8mmvaX9XyYEMD6pDx0PLYfBAWdlawemIP9Sf+7DT1WZBXuBX8ZpmvNrldAONNA4jhoUcVbrpdFRhVQnSZ7sGI5STS5DWxPcOWmQ/JVNoQAA1uSVF0dviMm5v3PXkiCG0du+MKxP4BUte6KC+X2VtjeE+Vim/Uxw5b2sG4b/lFViUW6pUQHkSbk9Dy0d1x24LvG9kyCGSdLUyd65DhcexAV/ty6yYDHSDlRQOI4aFKFXDqCOUhr7utwtwyG5c9wgaZF7F2xNE0Surl3XFrnC9/b/AwBAHb/yohstMTW9RVpUcCvVLxW17mcsoIL5fZW2t4T5cNN+Jrj03ldrdHg3/Ien3JIAMO6eVZ56HnJW1trd3m1arjMUxaqDIMtT6LWDkryeVZFfBSPtcCuoQRF65QDqKBnK4pwdeTirIm8qBHc2e+8bJMm9D7Ov9AdSZixGr7wUTx0xjXuLdO0lDNsZC6hgfl+l7U1hPtS0nwou8ddO1nU6vBn+k9JuSYBJ9yzBQw3XLZ8PQXFeKEv3gwU/T9HJj0bagS8XDzqhHf79xhK5qvB3L+LWtUSuLvzdP8Mftxtbqgt/F24cWyrSYPdfkKAIvXIAdZTazj+tqOq1QHBnb7/kWfIjrEj7hZh9Va5JmVGPXnkZiKkRSms/voiWZhi+72dJ44Chgvlape3YHbotzIeY9ouJ4FqsOlm3nA7/GevwjgBG3bMLgodMXTGX6/1rw3XpRZS/7PbHMPSZ2sHdrmWuSlXIJXe7Vrg61eCfYbN5WKt1qoH8sFqpaXYAQIIi9MoBPO1G587ltEFy2Pto9hUpM4Cv0yz6vFhLXJL6pdMTk2HZznr98xBfxOXd03dvF5y6RiJMMF+ptJ24Q+8I883BjwVXAE+drGPq8IEAyO7ZM6nhFG1pm+Xp8PrWcJ3xpJ7Dt/0pZGqHjbs1ucqH1NdW6w8mV/uQAFgbd2vXPiSX1QfHTgOIAQmK0Gt1UEcJ4U7G3snZV2ON7qzWtr6ei3pFUSzTPzwfL0ouLSvvZTc4YIhgZlbaztwhVpiPPeIOAJbKuRVcgSGkh3CQdSwdTkoATMNJkiSrcRwf395q5SLbSaJqqnROQ6Z2sNfuA5d/PUqiYa9XH7jy60kFkBTLfai+HiVRNn5ZpU2tJTUoQq/VQR0lhDsZe8c1OibqG6EUHp5LR15FmiYW4aE3aemCmVFpS3GHWGE+9oPLjaxbyukP65PA13lWq4OsY9wSSQCohuu5LtwFWzvP81wSRVEUBKZ2kFR7Y3wVRVEQRMVa2c9K91KCUgiCwPM8Z5eNk0sNitBrdVBHCeFOFoWiGh0T9Z1Qik9aWZSiKIqigORWOjDcdoo7xArzsR9cZso6xi2RBIBqOILrglVZ13UtC4IgCAumdgAAfqhp50T6EBMAQIIi9Fod1FFCuJOxd1yjY6J+LJQWxCgbVD6/KyPHCvNdeXCZKevYt9QTAKrh5lzX/xhDO7wD1KAIvVYHL3Wmcydj77hGx0Q9RSi1FWS4fH5PRo4hL2R1HM6UhGnajSHrbrklgaHhEK67XJja4R2gBkXotTqoo4RwJ2PvuEbHRH1VVRUnCIK8FARRKOuBAFjpptszcri82Dj6YjTv7V6fVmwxZN0ttyQwNFzPdZKyksTFYrGo6rqu65qpHd4BalCEXquDOkoIdzL2jmt0TNQ3Qkl36otiqtpbEnfDWZjy+faMHC4vthtL5Ih5b9vClyYEwJB1t9ySwNBwHdcpxt1FMhRZlv08z4uqYmqHd4AaFKHX6qCOEsKdjL3jGh0T9UmeR/56XRsXYbXMwiAr8yzrfgAbQfrOo6DLiyao0gXp4KkJqozAkHW33JLA0HBFWWaJrZnrs9FwnZwkaVHkBVM7XAGZ5aAGRehN6aijhHAnY++4RsdEfSOU7pX0IhhqI5TSGgBsW6aPIEXLaPH6Wrq8aIMqzWxSeGqDKiMwZN0ttyQwNFwWeaZjL5Oz1HCdfQzDNE3TnKkdrlw+meekBkXoTemoo4RwJ2PvuEbHRH0nlEy+Tn80QskHANd1dJGcx9lNmkPLaEffyOvrby21QZUg+BJE2WMXVBmBIetuuSWBoeGCKIuO6v1ZMosLryzXi7dT3JbuMrQDHa24FRzHUpV+JB8tKEJvSkcdJYQ7GXtH94uKeoqqSgDA3W5sqe7TTcqD0L7EMqofXHJ12Y3nHn3jqcpSPwdmVWMbVAmfvezokkGVAQxZd8stCQwNFwcHTRVhrbVc99pwXQhM7UBHURRFvrbuTJA3xBhZWo8RtSkdbWFGuJOxd3S/qKhHCgjb/EYjn8V7+wAAIKsLjqwfFJ64qoyPHsCksHArllls/O1qcSXPXQC+SgXv0oMqDFl3yy0J+LbhqGqaAGXHdcHpbe95Jz8HpnagWwJlkQaheScVIFsnbf59ErSmdLSFGeFOxhk1YDsAABOASURBVN7R/WLEhBQQdvmN1+BLEN21+Y2Noy84dagfPH8SubIMZA/AtjSisFD6JBWZL/9tWly519QFITNa+HH1hJ4WKusYt0QSALZtOKry4lIlo/DEvglnMrRDH6Y1OI7juJYY4zAMD7y15M/ZW2iwbUVqUzrWwoxwJ2Pv6H4xYkIKCPv8xrOXuV1+Y7uxRK7q6wdjcyVzZX4AgI3rGNLwjY+GmmYawLS4cuFowiAzeuwcQMCQdYxbIgkA3Xa4W0BdxIbSEAAZzmRoh6qqKlEUpaXO6ZIoVk3ALgw8hU9smbukofQ5CVjj9+h9akgLM8KdjL1T3IzWssZrxbE5JpxSCML3s93nN1q/ra0fjG3jweDKEOJG00tyV1/rfDCsNIAEYOOQVY25vTR7mXETGLKOcUsjAkC37UFdxr4hK4s+PLFryIehHcosy0C3tkrN6StLi9I0LwGOqsgVkf+wquOXhViGe1Y9K71PDWlhpnMnY+/I7CtAiekqjnb/aeu3CWIYvb0tnrjafIDys6IAuO52o9TNNy6fMuMPZvrZEwG2G4sfqho5Tu1lxm1gyDrGLfUQmNv2yiw0DFlaTMOZDO2QZVF4WpbSsuZkew2+n2YpwEGEKuFW9ocskT9zdeRPh7KRQPrUkBZmKncy9o7MvgLAiOk9PVCt3xb9pkZB8fiBK+uN8U2RRQBrc7e1av83NQpkx0o5wf18Pp9bmdEXV9pc3cuM28CQdYxb6iHg2wbAw5kM7RCG4VHhH/Ws5iQL3rwg8GOA9KU+a50A/3FOAtZ7WQiYLcwTsPZOn33V/BhtWVMzXVngHnzrt/3w5Dz8xVrZz7GQZVleNhbDtv7y+TWH9S9OdlD8OMqKXma8wVkV+TuTkBm3gSHrulsy5sN/egjottnAtUNwUmW+TvQlfymC4PjmeYEPAGk4CPDkJQsb2Y6lU+/dtS1CGez/F/lHb34zi0mhyOwrHGMzvTZVofPgqWj8NrE0ATgRlsZzkLbyilMLUfxxeOK55enReDslSdLLjG/nSIvCNSkzbgNLzje39HRHWM67SUqSmb5jVSPh2kGRFlVsGWIzROz4tm/mCpMC/PTWFbTS06mOu92sFZhqwpvfzAIWhSJuBt5eMTbTVVPvPHgGqh+KCQDmWn3xTpSx7lr8fPA8P+xlBv+syrk9khm3gSnnvTIr6MN/OjRPxyI6jlmNhGmHvcDVeeyZD6t6/zM9hfu33QFgIsC7ZSDpVMvZPGwsCNlTGtlAKRTTJbP2iqz1x0fNR/nKMjsPvgNtWEuqAACck51/OHj+TGMF34PocGjT0Dx3AfgpiIo9lRk3pFeYsg5CYUUf/tNBAEYoanw96Q2xawDYcecyDh429ocsOTz/GAohKAJ8kk417PbIDd1aP7jc16Qnshl7vjWLsS1tUdeJH9uWZm+au9n/52bveDqWpkso7RWtP74gm4+yh3XvwQPM8xtjxMmX6LjfH+Y6tno7entyWA98MZ5gKjPoQZUxWLLu+vCfpiF7FIrqvze5njZ2vXH0BVdV4TGAtaMLXOu37v53+1PnlyqLxE7spD9OnZE1F+DTcpdPXQjEME3DfshOXq8JZ+ypNotxHUOoq8gIHMcQJneDg6ZLZu0V950/7m60sjfTn4zeg6fnN6bYv3q7Pc2p95+9HekLNUJ/LDPoQZUJGLLuuuUswFTHQV2n7VpG13Pfar5t2/ghQ9P4Mfdb97UxiJ0SN7Km5S52HwIxDEMzLX/ojZix5y/NYtyta0l16cv6xrGk4W7eNb2iwXrSXrH42O2r8eAbM32lDB48kt+YIn19o0c96iNlztFYZtCDKlMwS0+uWM4CgLsch6LqKvZOAGBbo2x3F7ueNX7M/VaKkfXR3ViDYVuGp91fZ+UuDz0p6bpimmWe5b1RMGFPY9Uuxt1ulDpTQX5YkXdD1Wr/YWOJUOf+/sVwl5bI1aW//z/9mtytQbZXZMt+X60H/xJpUf5IePA35zeS0f0TFgM9eUrIDHpQ5V24YjkLANuNtSBDUXXpy6cmdi0M1/NrJ11njR9zv5UidtwHdzVM3s99Bf46L3fpj1zTDEMrirLorI5p99Ov7WLau4H0svpARleoWm3zsJahTveQL7euLXP1SFts3K059IXBh2FfrQd//CbnT6QH/578Rgu2xdBhkBn0oMp/cm1RKvzjrnY3tlQXwe7ln5m/kAGhPRePCEU159JI1+56Fr10nTV+UPzWudhZbrbuMPMm0SGjlLv0Ry7Kmmbsi/6RT5DH3U/LbjHd3YiibJB3M9Zq7WxUe/1oQn2CPLHdh5XO1QFZXmOv3QcInqMiUhaZ+DTeF6cWohj//DDy4Nv8hsSf8+BafuNWi6E7oJZv6EEVd7tRpFRXoNq6a7XO9lAA4saK7tKx5EUlcHV5VgSBr6syjY6h10lsoT+XRsdt+3NppWtzPYLRS9dZ4wfFb52LHc1Ybd2OSbgTBAql3KU/co7j+LeMeAHCddR6YM/wvltMdzciz4/uZuy5LerEjwBs2/50KfksCm1z9WHJl188gmybfXGHkyEv9CfqvkoA0oNv8xsCf64iqc1v4H7bjRbDGPSgir15tCRfhaheP2zs2oc8AoqdHB4B3O1mudQWuczVGXRt4oF5kjrOFPpzeT5HWpQM59JK17fgSxDdEdIVJo0fI78VxUIQtYEAEo7jKOUu/ZGXefibmoVJPwXL2txtrZ3vF5Gy4KwP5GIIDHezFgjPLV9WkbHzQFJte7mPYt+yHXP5K3zj+dHzv82+Tp5o6Yx9DR78QYQq8VWBP1epuGjyGzS/rSGJskj9WysienRBFYG/VGkfVBEV65PklbpR6caDWz+nJ4XmxmpHANfdrpfWIjK4OhDaNvHsYCr9JFoB+nN5VuX6cTiXTro+e5lLStcJ0FjXDOXgC1Udn4zKXYYjDw6gKFnm9U+rdov5cZQ//QFdzHA3W9euBs+tLgIZPChS3zft0F9Gpr20rW+nOKdZYV8di7mv3oNPX+os1BWBP1eZyDf5jc5vc3RQxdZvq9oMehgdOHtmMTBjPU1QRdEE/lJlfbV4mWX5Q24oeqUb+t3XOIgzihsryMsTOO7d1t4IhzVXfR3axIm3ZAXoz8X4bn4an0sTuz7bI+k6ARrrGiOLPG5wVsJjQjiHbbkLceR7iFWxzIIdEUBpRP3LE2sx/d00WrL13Dot6Rvm0fwYLmPfMZb28XTyfTylwNpX58GnX79Ov1VmaQqGtVVqUFaGlmRZXtUVAEAYegqXWDJ/LvzGYqjqGlgyA9qgykmThWYy+yn0UgDI8jgOdMsKSkXXkyjK0gRgM3VjrQ/yCQxz5W6XvvlB+P7Jpk2iFa6fy9EGUrpOgMe6RjgpkA2WT3bak2M+m3IX4sj/G/uXoYvp76bRkseXSIuSx05LBpav2561DJylY2vfTuGRMWWLuS+qBw8AAGkWh0d7Ky1rkOw1HwRZnjUVh0dV5PKYtBii5AwsmQEAAHvKYwlRFATxVtdl0TD0MIziOALYPJhjN1bRAEBUNNt9fX5U385b6iRa4cZzGcWuJ0BjXQR2UMZEHCDw5vu6kZSuLKa5m1ZLfj/KxS+9lvQN3Tyavy6D2LCtk3/yA5/5t2b7uurBA0RBeFT4D0Zag6QLu0MYBFGSAbQWQ0BaDM0LabjMQBFFWRiuDNOJdV1+idI4ihtbfuTGBpAACIIgSJtKD/x7+iRa4dZzmceuB6CxrgG3vQHRHflqu7FF/lL6+3+i/r/5YiZ302nJ5+rjoCWPpuXrtmktfWcpvR2DI0sFTPd1mwcPvqlJfJXoSx6qLDgcDl4QBBcAgPSlmlgMuwSAJTP+resMwbNLGez/e/t5FEVRGJmGsjD1MIrjKI5bWz780bixy6fWli/LMtmLF9ibd6/USbTC7ecyjV2TSG4Lt15Fe+TO5mGt8BdGWJ9cDOVuqFoy8A3dPBof7dVy6Z+CQ+BfHbSY+PA+D/6oiHwVnwyJhyoLov1heGUi/faN9hO4zHC3G6cPnl2IaHscRWkYrg0j04x9GEZxHPe2fPRylBeDLZ9F3iKRfN+4y+mTaIV3nAuu+RqMw70kmtDvanvnWhIUwWH/Z+p/A2iP3FmtHy3+EgBerNEsBrsbqpb0DdP0DevkBBacjn50OvpXRhw3eI8H3/ptlsBDlWXhwdvvDux2KVxm2JtHp/97l2jIjUdRFMVxoJsLHaIoS6IoHmz55ciWPyl86UnpdoVNohWun8sNmq/BONxLogn9Ou793UaB7HC1idKwVs6v/OV7NquMmywGuxuqliyDk2GYR9N0t19Pgef70wduEbzHg99x5zL2FUPgocqKMNh7u3YPf3QtkT+Xwf7nWI/iMkPWlr+sehfxa9TL5SiKoiCIXZ3XwjiNoyhGfZwdd05EycUn0Qrsc6FIV9xvHYd7STShX91ab+8sCOSrFY+ipNiO4wfeSKBQFoPdDVVLgm+Y5sH0rae30zEI/eNI0OH7wjx4Gi6vZRoamiLwUJV5FJ72/XsXD2uZP+cHKMYEgMsMjuOEVRvt4itT6Q8jihoC1xbmc+hHcRIBZsu/nnNd+oUxiVZAzwWTrrjfOgr3kmhDv5KkmPd3cCjaADt+5IIoipLykvbRdWwx2N1QtSTUwdE0fd0OoiA4nfxwZOrg+8I8eDo8xB9arh9N/hxCMSmrwWVGXZXJ9z56Gg6phjJuCFzji0YDpIDZ8lER6U+sSbQCei6YdMX91lG4l0QX+pUkSVomZVmWV45ckWVJipKkz31ii+nv5pIF5N1QtSTAyfSd7Hw+w6XO4tNYAeD7wjz498Fa2h/583OeTPQOLjP4hSDwVBaJGgJ/CsMoSxLFKV/OmC1f7JqqG2wSrYCeCyZdmX5rSSf/JvQrSZIkSfsoahvf8COXJUmWvSCIO12BLaa9m4dVHbX9Js3dULUkTIyYsUWD7wvz4K8Zvf9uY4uLSxns/gkAQJSt5cqPj/MxEpjM4DhOeuxVQDqoAMOuGgK3DtFJ+ejxl2KP2/JNpyA2iVZAzwWTrrjfOg73kmhCv7IsSVIRR1mWXDlyUZZliMIs7ibaYYs5iFAlPNlv0twNVUuyge8L8+CvGb2bh7Wy6N23Mk9TURZFkVmITeJyuVR9vOxCqIAPjiHU5eV8DuL4YxUJdRbucVu+rliTaPHVYJoP91vH4V4STehXkRRFCaIsjprrwI+c4zjO85OofxIFW0z6Uk36TZq7mWnJ67kqfF+YB3/N6LXXj9biEkL7S9I0iSRJkhSAf3PvWpJQBBXx0Zv5xnlygl5fXMLh1cqta0mLpaZbr8H9qn6tYl1l2PJFwZpEixMApvlwv3Uc7iXRhH4FWVbkne+FcXLlyMs8/CwFxyCKriwG0mgz7jdpb3qkJcM4vq6z8X1huGb06ob1tLh8T5tNJHEQxveyLMsA7t39RhEyryA+zmWJr0JCBoL6+Ky73SgLbWmVUfiH5jXwBeA+Tp6zJtHiBIBpPtxvvRbureu6+FyGWdzOwMSPPDiALGXEU63YYpB+k7GWDNNk5HdyVBMO39cfXUscCgfKYH/8DgDXjV5R1vVt78tGSRZGa0VRJAB7c3dvC74aEx/nvvEOsmAUCu4+tzYP9kJybM/vXgOvAfdx4pA1iZYggMm5YJqv81sfVvXx9aZYV4ci9b8u6tOps+3wI99DLImlv+sbGbHFIP0mIy2ZJWHYGdZ1VebRMS78tCir8apxf9x9WMsDAeQHWf7e/YNp9J7P57PUDyCKgzgLW3tA0Vf396JXycRHY6ZN/uVfkIOUFPuTIJje4djXXgPgPk7EmkTbvxgyPxdE8zV+6wfX/pAlh/0r4bdeg6/CcVEnhy7biB/5PB2MLAaQsmdCSwZtFAgAmjsBMOpMVRRFHtm+uD/urB/NgQAiubNzrhm9dV3X9UAAaXiU80uQlQCiKKorszBD4qNy+5C5IkszuTj6nnfqaq8BAPVxAtaDUw0BpEl40oA/+wc/Tq/Exy+vZRpLneEVfh/81mvYQSot6uK095prxo/8PaCWPRNaMovbIABA8/igZrd6c5zYw/1x23F+GQjgTW6fl7hq9J7P5/O5H8oVnhTx7F2yg9+QRpWUJfmxvLkbELIs/Cxf8jA4HG5plq5ZD061z8efdBlCgPC0u9p4DeBdrKHxI3+7bYgCAPxl8qIUfuR/NwYtmURhnPRn27jErd6cKi7MH5dUez2wp1x3FdDXjN6xBPBkARLxUvp7gDJPg++LMMqIj7e3g0JwAFm+5LkX7NVbmqVZk6tbG+AdbbeAddf+DmBH/ndj0JJ+EEWDnCYbw8ubUoEAUKT+aZAAWdJd1Q1Gb30+dxIg/dvQThoFB/AXmZcRH71rHe8D9hDL4qXMg9NxIVyq8HjtRxmTq9833bnFeyY1/Otg0JLeyQ8GxfK7SNe3jN8GdVH40Y2K6lyXyZeK1sx1UiCTF3mYEx+v1VQR+K+sb1J9HHxy9e8igPdMavjXAaElPY8Ivv8u0vU1kAkCSA83/mQSeiBfjhR62UEeiosyLoiPJ9bQnNvA8HHQ9sHfRwDvmdTwrwJCS+498gJ+D+nuIRYHAihz5nwjAkcFIvGS7OdVB9+/U/7734/32PIdfh8B/H8PQkvuRmNGfg/p/s/fvYhMEy75iVLX+/8G77Pl/4F/4B/4B/4vBgwcMQIp19UAAAAASUVORK5CYII=";

    imgData.onload = function () {
      return imgData && cb(imgData);
    };
  }

  return imgData;
}

var scale$1 = 11;
var gamma = 1;
var metrics$1 = metrics,
    getAtlas$1 = getAtlas; // TODO: fix memory leack

var sanitizeTextCache = new Map();

var sanitizeText = function sanitizeText(input) {
  if (!sanitizeTextCache.has(input)) {
    sanitizeTextCache.set(input, input.replace(/\W/, ' '));
  }

  return sanitizeTextCache.get(input) || 'sanitizeText_ERR';
};

function drawGlyph(chr, pen, size, vertexElements, textureElements) {
  var metric = metrics$1.chars[chr];
  if (!metric) return;
  var scale = size / metrics$1.size;
  var factor = 1;
  var width = metric[0];
  var height = metric[1];
  var horiBearingX = metric[2];
  var horiBearingY = metric[3];
  var horiAdvance = metric[4];
  var posX = metric[5];
  var posY = metric[6];

  if (width > 0 && height > 0) {
    width += metrics$1.buffer * 2;
    height += metrics$1.buffer * 2; // Add a quad (= two triangles) per glyph.

    vertexElements.push(factor * (pen.x + (horiBearingX - metrics$1.buffer) * scale), factor * (pen.y - horiBearingY * scale), factor * (pen.x + (horiBearingX - metrics$1.buffer + width) * scale), factor * (pen.y - horiBearingY * scale), factor * (pen.x + (horiBearingX - metrics$1.buffer) * scale), factor * (pen.y + (height - horiBearingY) * scale), factor * (pen.x + (horiBearingX - metrics$1.buffer + width) * scale), factor * (pen.y - horiBearingY * scale), factor * (pen.x + (horiBearingX - metrics$1.buffer) * scale), factor * (pen.y + (height - horiBearingY) * scale), factor * (pen.x + (horiBearingX - metrics$1.buffer + width) * scale), factor * (pen.y + (height - horiBearingY) * scale));
    textureElements.push(posX, posY, posX + width, posY, posX, posY + height, posX + width, posY, posX, posY + height, posX + width, posY + height);
  } // pen.x += Math.ceil(horiAdvance * scale);


  pen.x = pen.x + horiAdvance * scale;
}

function _measureText(text, size) {
  var dimensions = {
    advance: 0
  };
  var scale = size / metrics$1.size;

  for (var i = 0; i < text.length; i++) {
    var horiAdvance = metrics$1.chars[text[i]][4];
    dimensions.advance += horiAdvance * scale;
  }

  return dimensions;
}

function loadShader$1(gl, type, source) {
  var shader = gl.createShader(type); // Send the source to the shader object

  gl.shaderSource(shader, source); // Compile the shader program

  gl.compileShader(shader); // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('An error occurred compiling the shaders: ' + (gl.getShaderInfoLog(shader) || ''));
  }

  return shader;
}

function initShaderProgram$1(gl, vsSource, fsSource) {
  var vertexShader = loadShader$1(gl, gl.VERTEX_SHADER, vsSource);
  var fragmentShader = loadShader$1(gl, gl.FRAGMENT_SHADER, fsSource); // Create the shader program

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram); // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('Unable to initialize the shader program: ' + (gl.getProgramInfoLog(shaderProgram) || ''));
  }

  return shaderProgram;
}

var vsSource$1 = "\nattribute vec2 a_pos;\nattribute vec2 a_texcoord;\n\nuniform mat4 u_matrix;\nuniform vec2 u_texsize;\n\nvarying vec2 v_texcoord;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos.xy, 0, 1);\n    v_texcoord = a_texcoord / u_texsize;\n}";
var fsSource$1 = "\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform vec4 u_color;\nuniform float u_buffer;\nuniform float u_gamma;\nuniform float u_debug;\n\nvarying vec2 v_texcoord;\n\nvoid main() {\n    float dist = texture2D(u_texture, v_texcoord).r;\n    if (u_debug > 0.0) {\n        gl_FragColor = vec4(dist, dist, dist, 1);\n    } else {\n        float alpha = smoothstep(u_buffer - u_gamma, u_buffer + u_gamma, dist);\n        gl_FragColor = vec4(u_color.rgb, alpha * u_color.a);\n    }\n}";
function init(gl, onReady, pixelRatio) {
  var canvas = gl.canvas;
  gl.getExtension('OES_standard_derivatives');
  var shaderProgram = initShaderProgram$1(gl, vsSource$1, fsSource$1); // Initialize shaders

  var programInfo = {
    program: shaderProgram,
    attribLocations: {
      a_pos: gl.getAttribLocation(shaderProgram, 'a_pos'),
      a_texcoord: gl.getAttribLocation(shaderProgram, 'a_texcoord')
    },
    uniformLocations: {
      u_matrix: gl.getUniformLocation(shaderProgram, 'u_matrix'),
      u_texture: gl.getUniformLocation(shaderProgram, 'u_texture'),
      u_texsize: gl.getUniformLocation(shaderProgram, 'u_texsize'),
      u_color: gl.getUniformLocation(shaderProgram, 'u_color'),
      u_buffer: gl.getUniformLocation(shaderProgram, 'u_buffer'),
      u_gamma: gl.getUniformLocation(shaderProgram, 'u_gamma'),
      u_debug: gl.getUniformLocation(shaderProgram, 'u_debug')
    }
  };
  console.log({
    programInfo: programInfo
  });
  var texture = gl.createTexture();

  function switchToProgram() {
    gl.useProgram(programInfo.program);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_pos);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_texcoord);
  }

  var pMatrix = create();
  ortho(pMatrix, 0, canvas.width / pixelRatio, canvas.height / pixelRatio, 0, 0, -1);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
  gl.enable(gl.BLEND);
  var vertexBuffer = gl.createBuffer();
  var textureBuffer = gl.createBuffer();
  var vertexBufferItems = 0;
  var mvMatrix = create();
  var mvpMatrix = create();

  function createText(toRender) {
    var size = scale$1;
    var vertexElements = [];
    var textureElements = [];
    var pen = {
      x: 0,
      y: 0
    };

    for (var labelIdx = 0; labelIdx < toRender.length; labelIdx++) {
      var str = toRender[labelIdx].label;

      var dimensions = _measureText(str, size);

      pen.x = toRender[labelIdx].x; // scale to screen space

      pen.y = toRender[labelIdx].y;

      for (var chIdx = 0; chIdx < str.length; chIdx++) {
        var chr = str[chIdx];
        drawGlyph(chr, pen, size, vertexElements, textureElements);
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexElements), gl.STATIC_DRAW);
    vertexBufferItems = vertexElements.length / 2;
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureElements), gl.STATIC_DRAW);
  }

  function draw(toRender) {
    switchToProgram();
    createText(toRender);
    identity(mvMatrix);
    multiply(mvpMatrix, pMatrix, mvMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.u_matrix, false, mvpMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.u_texture, 0); // gl.uniform1f(programInfo.uniformLocations.u_scale, 1.0);

    gl.uniform1f(programInfo.uniformLocations.u_debug, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.a_pos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.a_texcoord, 2, gl.FLOAT, false, 0, 0); // glow

    gl.uniform4fv(programInfo.uniformLocations.u_color, [0, 0, 0, 1]);
    gl.uniform1f(programInfo.uniformLocations.u_buffer, 192 / 256);
    gl.uniform1f(programInfo.uniformLocations.u_gamma, gamma * 1.4142 / scale$1);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBufferItems);
  }

  getAtlas$1(function (atlas) {
    switchToProgram(); // loaded atlas texture

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, //target
    0, //level
    gl.LUMINANCE, //internalformat
    gl.LUMINANCE, //format
    gl.UNSIGNED_BYTE, //type
    atlas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform2f(programInfo.uniformLocations.u_texsize, atlas.width, atlas.height); // ready

    onReady({
      render: function render(toRender) {
        toRender.forEach(function (item) {
          return item.label = sanitizeText(item.label);
        });
        draw(toRender);
      },
      measureText: function measureText(text) {
        return _measureText(sanitizeText(text), scale$1).advance;
      }
    });
  });
}

var CANVAS_DRAW_TEXT_MIN_PX = 35;
var CANVAS_TEXT_PADDING_PX = 2;
var WEBGL_TEXT_TOP_PADDING_PX = -2;
var WEBGL_TRUNCATE_BIAS = 20;
var toInt = Math.floor;

function truncateText(text, endSize) {
  return "".concat(text.slice(0, endSize), "\u2026").concat(text.slice(text.length - 1 - endSize));
}

var CanvasRendererImpl =
/*#__PURE__*/
function () {
  function CanvasRendererImpl(props) {
    var _this = this;

    _classCallCheck(this, CanvasRendererImpl);

    _defineProperty(this, "_canvas", null);

    _defineProperty(this, "_renderedShapes", []);

    _defineProperty(this, "_renderedZoom", 1);

    _defineProperty(this, "_renderedCenter", 1);

    _defineProperty(this, "_mouseX", 0);

    _defineProperty(this, "_mouseY", 0);

    _defineProperty(this, "_utils", new UtilsWithCache());

    _defineProperty(this, "_framecounter", 0);

    _defineProperty(this, "_frameSecond", Math.floor(performance.now() / 1000));

    _defineProperty(this, "_lastFrameFPS", 0);

    _defineProperty(this, "props", void 0);

    _defineProperty(this, "rAFLoop", function () {
      requestAnimationFrame(function () {
        _this._renderCanvasWithFramecount();

        _this.rAFLoop();
      });
    });

    _defineProperty(this, "_onCanvas", function (node) {
      _this._canvas = node;
    });

    _defineProperty(this, "_mouseDown", function (event) {
      _this.props.onStateChange({
        dragging: true,
        dragMoved: false
      });
    });

    _defineProperty(this, "_mouseMove", function (event) {
      var hovered = _this._getIntersectingMeasure(event);

      var _this$_getCanvasMouse = _this._getCanvasMousePos(event),
          canvasMouseX = _this$_getCanvasMouse.canvasMouseX,
          canvasMouseY = _this$_getCanvasMouse.canvasMouseY;

      _this._mouseX = canvasMouseX;
      _this._mouseY = canvasMouseY;
      var tooltip = _this.props.tooltip;

      if (tooltip instanceof HTMLDivElement) {
        var tooltipX = _this._mouseX + TOOLTIP_OFFSET;
        var tooltipY = _this._mouseY + TOOLTIP_OFFSET;
        tooltip.style.left = "".concat(tooltipX, "px");
        tooltip.style.top = "".concat(tooltipY, "px");

        if (hovered != null) {
          tooltip.textContent = "".concat(hovered.measure.duration.toFixed(1), "ms ").concat(hovered.measure.name);
          tooltip.hidden = false;
        } else {
          tooltip.hidden = true;
        }
      }

      if (_this.props.dragging) {
        var updated = _this.props.center - event.movementX / PX_PER_MS / _this.props.zoom;

        _this.props.onStateChange({
          center: updated,
          hovered: hovered,
          dragMoved: true
        });
      }
    });

    _defineProperty(this, "_mouseOut", function (event) {
      var tooltip = _this.props.tooltip;

      if (tooltip instanceof HTMLDivElement) {
        tooltip.hidden = true;
      }
    });

    _defineProperty(this, "_mouseUp", function (event) {
      _this.props.onStateChange({
        dragging: false,
        dragMoved: false,
        selection: !_this.props.dragMoved ? _this._getIntersectingMeasure(event) : _this.props.selection
      });
    });

    _defineProperty(this, "_endWheel", debounce(function () {
      _this.props.onStateChange({
        zooming: false
      });
    }, 100));

    _defineProperty(this, "_handleWheel", function (event) {
      event.preventDefault();
      event.stopPropagation(); // zoom centered on mouse

      var _this$_getCanvasMouse2 = _this._getCanvasMousePos(event),
          canvasMouseX = _this$_getCanvasMouse2.canvasMouseX;

      var mouseOffsetFromCenter = canvasMouseX - _this.props.viewportWidth / 2;
      var updatedZoom = _this.props.zoom * (1 + 0.005 * -event.deltaY);
      var updatedCenter = _this.props.center + // offset to time space before zoom
      mouseOffsetFromCenter / PX_PER_MS / _this.props.zoom - // offset to time space after zoom
      mouseOffsetFromCenter / PX_PER_MS / updatedZoom;

      if (_this._clampZoom(updatedZoom) !== _this.props.zoom) {
        _this.props.onStateChange({
          zooming: true,
          zoom: updatedZoom,
          center: updatedCenter
        });

        _this._endWheel();
      }
    });

    _defineProperty(this, "_getCanvasContext", memoize(function (canvas) {
      var ctx = canvas.getContext('2d', {
        alpha: false
      });

      {
        var dpr = _this._configureRetinaCanvas(canvas); // Scale all drawing operations by the dpr, so you
        // don't have to worry about the difference.


        ctx.scale(dpr, dpr);
      }

      return ctx;
    }));

    _defineProperty(this, "_fitTextMap", new WeakMap());

    _defineProperty(this, "_renderCanvasReq", function () {
      var rafID = null;
      return function () {
        if (rafID == null) {
          rafID = requestAnimationFrame(function () {
            rafID = null;

            _this._renderCanvasWithFramecount();
          });
        } else {
          console.log('skipping frame');
        }
      };
    }());

    _defineProperty(this, "_getMaxStackIndex", memoizeWeak(function (renderableTrace) {
      return renderableTrace.reduce(function (acc, item) {
        return Math.max(item.stackIndex, acc);
      }, 0);
    }));

    this.props = props;
  }

  _createClass(CanvasRendererImpl, [{
    key: "didMount",
    value: function didMount() {
      document.addEventListener('mouseup', this._mouseUp);
      var canvas = this._canvas;

      if (canvas instanceof HTMLCanvasElement) {
        canvas.addEventListener('wheel', this._handleWheel);
      }

      {
        this._renderCanvasWithFramecount();
      }
    }
  }, {
    key: "didUpdate",
    value: function didUpdate() {
      {
        this._renderCanvasWithFramecount();
      }
    }
  }, {
    key: "_clampZoom",
    // TODO: remove this duplication?
    value: function _clampZoom(updated) {
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, updated));
    }
  }, {
    key: "_getCanvasMousePos",
    value: function _getCanvasMousePos(event) {
      // const rect = event.currentTarget.getBoundingClientRect();
      var canvas = this._canvas;
      var rect = canvas instanceof HTMLCanvasElement ? canvas.getBoundingClientRect() : {
        left: 0,
        top: 0
      };
      var canvasMouseX = event.clientX - rect.left;
      var canvasMouseY = event.clientY - rect.top;
      return {
        canvasMouseX: canvasMouseX,
        canvasMouseY: canvasMouseY
      };
    }
  }, {
    key: "_getIntersectingMeasure",
    value: function _getIntersectingMeasure(event) {
      var _this$_getCanvasMouse3 = this._getCanvasMousePos(event),
          canvasMouseX = _this$_getCanvasMouse3.canvasMouseX,
          canvasMouseY = _this$_getCanvasMouse3.canvasMouseY;

      var intersecting = this._renderedShapes.find(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            _ref2$ = _ref2[0],
            x = _ref2$.x,
            y = _ref2$.y,
            width = _ref2$.width,
            height = _ref2$.height;

        return !(canvasMouseX < x || x + width < canvasMouseX || canvasMouseY < y || y + height < canvasMouseY);
      });

      if (intersecting) {
        return intersecting[1];
      }

      return null;
    }
  }, {
    key: "_configureRetinaCanvas",
    value: function _configureRetinaCanvas(canvas) {
      // hidpi canvas: https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      // Get the device pixel ratio, falling back to 1.
      var dpr = window.devicePixelRatio || 1; // Get the size of the canvas in CSS pixels.

      var rect = canvas.getBoundingClientRect(); // Give the canvas pixel dimensions of their CSS
      // size * the device pixel ratio.

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = "".concat(rect.width, "px");
      canvas.style.height = "".concat(rect.height, "px");
      return dpr;
    }
  }, {
    key: "_fitText",
    value: function _fitText(measureFn, label, textWidth) {
      // binary search for smallest
      var labelTrimmed = label;
      var l = 0;
      var r = label.length - 1;

      if (measureFn(labelTrimmed) > textWidth) {
        while (l < r) {
          var m = l + Math.floor((r - l) / 2);
          labelTrimmed = truncateText(label, m);

          if (measureFn(labelTrimmed) > textWidth) {
            r = m - 1;
          } else {
            l = m + 1;
          }
        } // this isn't quite right but close enough


        labelTrimmed = truncateText(label, r);
      }

      return labelTrimmed;
    }
  }, {
    key: "_fitTextCached",
    value: function _fitTextCached(measure, measureFn, label, textWidth) {
      var cached = this._fitTextMap.get(measure);

      if (cached != null && cached.textWidth === textWidth) {
        return cached.labelTrimmed;
      }

      var labelTrimmed = this._fitText(measureFn, label, textWidth);

      this._fitTextMap.set(measure, {
        textWidth: textWidth,
        labelTrimmed: labelTrimmed
      });

      return labelTrimmed;
    }
  }, {
    key: "_renderCanvasWithFramecount",
    value: function _renderCanvasWithFramecount() {
      var curSecond = Math.floor(performance.now() / 1000);

      if (curSecond !== this._frameSecond) {
        this._lastFrameFPS = this._framecounter;
        this._framecounter = 0;
        this._frameSecond = curSecond;
      } else {
        this._framecounter++;
      }

      this._renderCanvas();
    }
  }, {
    key: "__renderCanvasImpl",
    value: function __renderCanvasImpl(canvas) {// implement in subclass
    }
  }, {
    key: "_renderCanvas",
    value: function _renderCanvas() {
      performance.mark('_renderCanvas'); // console.time('_renderCanvas');

      var canvas = this._canvas;

      if (canvas instanceof HTMLCanvasElement) {
        this.__renderCanvasImpl(canvas);
      }

      performance.measure('_renderCanvas', '_renderCanvas'); // console.timeEnd('_renderCanvas');
    }
  }]);

  return CanvasRendererImpl;
}();
var Canvas2DRendererImpl =
/*#__PURE__*/
function (_CanvasRendererImpl) {
  _inherits(Canvas2DRendererImpl, _CanvasRendererImpl);

  function Canvas2DRendererImpl() {
    _classCallCheck(this, Canvas2DRendererImpl);

    return _possibleConstructorReturn(this, _getPrototypeOf(Canvas2DRendererImpl).apply(this, arguments));
  }

  _createClass(Canvas2DRendererImpl, [{
    key: "__renderCanvasImpl",
    value: function __renderCanvasImpl(canvas) {
      var ctx = this._getCanvasContext(canvas);

      {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      this._renderedShapes = [];
      var renderableTraceGroups = this.props.renderableTraceGroups;
      var groupOrder = this.props.groupOrder || renderableTraceGroups.keys();
      var startY = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = groupOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var group = _step.value;
          var groupTrace = renderableTraceGroups.get(group);
          if (!groupTrace) continue;
          performance.mark('_renderCanvasGroup ' + group);

          this._renderCanvasGroup(groupTrace, ctx, startY);

          performance.measure('_renderCanvasGroup ' + group, '_renderCanvasGroup ' + group);

          var maxStackIndex = this._getMaxStackIndex(groupTrace);

          startY += (maxStackIndex + 1) * (BAR_HEIGHT + BAR_Y_GUTTER);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._renderedZoom = this.props.zoom;
      this._renderedCenter = this.props.center;
      canvas.style.transform = '';
    }
  }, {
    key: "_renderCanvasGroup",
    value: function _renderCanvasGroup(renderableTrace, ctx, startY) {
      var first = renderableTrace[0];

      if (first == null) {
        return;
      }

      var currentGroup = first.measure.group;

      for (var index = 0; index < renderableTrace.length; index++) {
        var measure = renderableTrace[index];
        var layout = getLayout(this.props, measure, startY);
        var width = layout.width,
            height = layout.height,
            x = layout.x,
            y = layout.y,
            inView = layout.inView;

        if (!inView) {
          continue;
        }

        this._renderedShapes.push([layout, measure]);

        var hovered = measure === this.props.hovered;
        var selected = measure === this.props.selection;
        ctx.fillStyle = hovered || selected ? this._utils._getMeasureHoverColorRGB(measure.measure) : this._utils._getMeasureColorRGB(measure.measure);
        ctx.fillRect(toInt(x), toInt(y), toInt(width), toInt(height));
        // text is by far the most expensive part of rendering the trace


        if (width < CANVAS_DRAW_TEXT_MIN_PX) {
          continue;
        } // skip text rendering while zooming

        var textWidth = toInt(Math.max(width - CANVAS_TEXT_PADDING_PX, 0));
        ctx.font = '10px Lucida Grande';
        ctx.fillStyle = 'black';
        var label = measure.measure.name;
        var labelTrimmed = this.props.truncateLabels ? this._fitTextCached(measure, function (labelTrimmed) {
          return ctx.measureText(labelTrimmed).width;
        }, label, textWidth) : label;
        ctx.fillText(labelTrimmed, toInt(x + CANVAS_TEXT_PADDING_PX), toInt(y + BAR_HEIGHT / 2 + 4), textWidth);
      } // render selection highlight


      var selection = this.props.selection;

      if (selection != null && currentGroup === selection.measure.group) {
        var _layout = getLayout(this.props, selection, startY);

        var width = _layout.width,
            height = _layout.height,
            x = _layout.x,
            y = _layout.y,
            inView = _layout.inView;
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
      }
    }
  }]);

  return Canvas2DRendererImpl;
}(CanvasRendererImpl);
var CanvasWebGlRendererImpl =
/*#__PURE__*/
function (_CanvasRendererImpl2) {
  _inherits(CanvasWebGlRendererImpl, _CanvasRendererImpl2);

  function CanvasWebGlRendererImpl() {
    var _getPrototypeOf2;

    var _this2;

    _classCallCheck(this, CanvasWebGlRendererImpl);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this2 = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(CanvasWebGlRendererImpl)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "_getCanvasGLContext", memoize(function (canvas) {
      {
        _this2._configureRetinaCanvas(canvas);
      }

      var gl = canvas.getContext('webgl');

      if (!gl) {
        throw new Error('couldnt use webgl');
      }

      return gl;
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "_webglRender", null);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "_webglTextRenderInit", false);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "_webglTextRender", null);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "_webglTextMeasure", null);

    return _this2;
  }

  _createClass(CanvasWebGlRendererImpl, [{
    key: "_renderTextWebGL",
    value: function _renderTextWebGL() {
      var textRender = this._webglTextRender;
      var measureText = this._webglTextMeasure;

      if (textRender && measureText) {
        var renderableTrace = this.props.renderableTrace;
        this._renderedShapes = [];
        var textToRender = [];

        for (var index = 0; index < renderableTrace.length; index++) {
          var measure = renderableTrace[index];
          var layout = getLayout(this.props, measure, 0);
          var width = layout.width,
              height = layout.height,
              x = layout.x,
              y = layout.y,
              inView = layout.inView;

          if (!inView) {
            continue;
          }

          this._renderedShapes.push([layout, measure]); // skip text rendering for small measures
          // text is by far the most expensive part of rendering the trace


          if (width < CANVAS_DRAW_TEXT_MIN_PX) {
            continue;
          } // skip text rendering while zooming

          var _measureText = this._webglTextMeasure;

          if (!_measureText) {
            continue;
          }

          var textWidth = toInt(Math.max(width - CANVAS_TEXT_PADDING_PX, 0));
          var label = measure.measure.name;
          var labelTrimmed = this.props.truncateLabels // TODO: fix
          ? this._fitTextCached(measure, _measureText, label, textWidth - WEBGL_TRUNCATE_BIAS) : label;
          textToRender.push({
            label: labelTrimmed,
            x: x + CANVAS_TEXT_PADDING_PX,
            y: y + WEBGL_TEXT_TOP_PADDING_PX + BAR_HEIGHT / 2 + 4
          });
        }

        textRender(textToRender);
      }
    }
  }, {
    key: "_renderWebGL",
    value: function _renderWebGL(canvas) {
      var _this3 = this;

      if (!this._webglRender) {
        var gl = this._getCanvasGLContext(canvas);

        this._webglRender = (initWebGLRenderer)(gl, this.props);
      }

      this._webglRender(this.props);

      if (!this._webglTextRenderInit) {
        this._webglTextRenderInit = true;

        var _gl = this._getCanvasGLContext(canvas);

        init(_gl, function (_ref3) {
          var render = _ref3.render,
              measureText = _ref3.measureText;
          _this3._webglTextRender = render;
          _this3._webglTextMeasure = measureText;

          _this3._renderCanvas();
        }, window.devicePixelRatio);
      }

      this._renderTextWebGL();
    }
  }, {
    key: "__renderCanvasImpl",
    value: function __renderCanvasImpl(canvas) {
      this._renderWebGL(canvas);
    }
  }]);

  return CanvasWebGlRendererImpl;
}(CanvasRendererImpl);

var CANVAS_FRAMECOUNTER = false;

var CanvasRenderer =
/*#__PURE__*/
function (_React$Component) {
  _inherits(CanvasRenderer, _React$Component);

  function CanvasRenderer(props) {
    var _this;

    _classCallCheck(this, CanvasRenderer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CanvasRenderer).call(this, props));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "renderer", void 0);

    var RendererImpl = props.renderer == 'webgl' ? CanvasWebGlRendererImpl : Canvas2DRendererImpl;
    _this.renderer = new RendererImpl(props);
    return _this;
  }

  _createClass(CanvasRenderer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.renderer.didMount();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.renderer.props = this.props;
      this.renderer.didUpdate();
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", null, React.createElement("canvas", {
        ref: this.renderer._onCanvas,
        onMouseDown: this.renderer._mouseDown,
        onMouseMove: this.renderer._mouseMove,
        onMouseOut: this.renderer._mouseOut,
        width: this.props.viewportWidth,
        height: this.props.viewportHeight
      }), CANVAS_FRAMECOUNTER && React.createElement("div", {
        style: {
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: 64
        }
      }, this.renderer._lastFrameFPS, " fps"));
    }
  }]);

  return CanvasRenderer;
}(React.Component);

// const run = fn => requestAnimationFrame(fn);
var run = function run(fn) {
  return fn();
};

function loadValue(name, defaultVal) {
  var item = localStorage.getItem(name);

  if (item != null) {
    var parsed = parseFloat(item);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return defaultVal;
}

function storeValue(name, val) {
  localStorage.setItem(name, String(val));
}

var Trace =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Trace, _React$Component);

  function Trace(props) {
    var _this;

    _classCallCheck(this, Trace);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Trace).call(this, props));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_mouseX", 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_mouseY", 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_transformTrace", memoize(function (trace) {
      return calculateTraceLayout(trace);
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_transformTraceGroups", memoize(function (trace) {
      var groupedTraces = trace.reduce(function (groupsTraces, item) {
        var group = item.group;
        var groupTrace = groupsTraces.get(group) || [];
        groupTrace.push(item);
        groupsTraces.set(group, groupTrace);
        return groupsTraces;
      }, new Map());
      var groupedRenderableTraces = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = groupedTraces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              group = _step$value[0],
              _trace = _step$value[1];

          groupedRenderableTraces.set(group, calculateTraceLayout(_trace));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return groupedRenderableTraces;
    }));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleSelectionChange", function (selection) {
      _this.setState({
        selection: selection
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleKey", function (event) {
      var _this$_getExtents = _this._getExtents(),
          size = _this$_getExtents.size;

      switch (event.key) {
        case 'w':
          {
            var updated = _this.state.zoom * 2;
            run(function () {
              _this.setState({
                zoom: _this._clampZoom(updated)
              });
            });
            break;
          }

        case 'a':
          {
            var _updated = _this.state.center - 0.05 * size / _this.state.zoom;

            run(function () {
              _this.setState({
                center: _this._clampCenter(_updated)
              });
            });
            break;
          }

        case 's':
          {
            var _updated2 = _this.state.zoom / 2;

            run(function () {
              _this.setState({
                zoom: _this._clampZoom(_updated2)
              });
            });
            break;
          }

        case 'd':
          {
            var _updated3 = _this.state.center + 0.05 * size / _this.state.zoom;

            run(function () {
              _this.setState({
                center: _this._clampCenter(_updated3)
              });
            });
            break;
          }
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_tooltip", null);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_onTooltip", function (node) {
      _this._tooltip = node;
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_handleStateChange", function (changes) {
      _this.setState(function (prevState) {
        return _objectSpread({}, changes, {
          zoom: changes.zoom != null ? _this._clampZoom(changes.zoom) : prevState.zoom,
          center: changes.center != null ? _this._clampCenter(changes.center) : prevState.center
        });
      });
    });

    var _this$_getExtents2 = _this._getExtents(),
        startOffset = _this$_getExtents2.startOffset,
        _size = _this$_getExtents2.size;

    var defaultZoom = 1;
    var defaultCenter = startOffset + _this.props.viewportWidth / PX_PER_MS / 2;
    var zoom = loadValue('zoom', defaultZoom);
    _this.state = {
      dragging: false,
      dragMoved: false,
      selection: null,
      hovered: null,
      center: loadValue('center', defaultCenter),
      defaultCenter: defaultCenter,
      zoom: zoom,
      defaultZoom: defaultZoom,
      zooming: false
    };
    return _this;
  }

  _createClass(Trace, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      document.addEventListener('keypress', this._handleKey);

      window.onbeforeunload = function () {
        storeValue('center', _this2.state.center);
        storeValue('zoom', _this2.state.zoom);
      };
    }
  }, {
    key: "_clampCenter",
    value: function _clampCenter(updated) {
      var _this$_getExtents3 = this._getExtents(),
          startOffset = _this$_getExtents3.startOffset,
          endOffset = _this$_getExtents3.endOffset;

      return Math.max(startOffset, Math.min(endOffset, updated));
    }
  }, {
    key: "_clampZoom",
    value: function _clampZoom(updated) {
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, updated));
    }
  }, {
    key: "_getExtents",
    value: function _getExtents() {
      var renderableTrace = this._transformTrace(this.props.trace);

      var renderableTraceGroups = this._transformTraceGroups(this.props.trace);

      var startOffset = renderableTrace[0].measure.startTime;
      var last = renderableTrace[renderableTrace.length - 1];
      var endOffset = last.measure.startTime + last.measure.duration;
      return {
        startOffset: startOffset,
        endOffset: endOffset,
        size: endOffset - startOffset
      };
    }
  }, {
    key: "_renderTooltip",
    value: function _renderTooltip() {
      var tooltipX = this._mouseX + TOOLTIP_OFFSET;
      var tooltipY = this._mouseY + TOOLTIP_OFFSET;
      return React.createElement("div", {
        ref: this._onTooltip,
        style: {
          userSelect: 'none',
          position: 'absolute',
          left: tooltipX,
          top: tooltipY,
          backgroundColor: 'white',
          fontSize: 10,
          fontFamily: ' Lucida Grande',
          padding: '2px 4px',
          boxShadow: '3px 3px 5px rgba(0,0,0,0.4)'
        }
      }, this.state.hovered ? this.state.hovered.measure.name : '');
    }
  }, {
    key: "render",
    value: function render() {
      var renderableTrace = this._transformTrace(this.props.trace);

      var renderableTraceGroups = this._transformTraceGroups(this.props.trace);

      if (renderableTrace[0] == null) {
        return React.createElement("div", null, "empty trace");
      }

      var extents = this._getExtents();

      var startOffset = extents.startOffset,
          endOffset = extents.endOffset;
      var centerOffset = this.state.center;
      var renderer = this.props.renderer;
      var rendered = React.createElement("div", null, (this.props.renderer === 'dom') && React.createElement(Controls, {
        zoom: this.state.zoom,
        center: this.state.center,
        extents: this._getExtents(),
        onChange: this._handleStateChange
      }), React.createElement("div", {
        style: {
          cursor: this.state.dragging ? 'grabbing' : 'grab',
          position: 'relative'
        }
      }, renderer === 'canvas' || renderer === 'webgl' ? React.createElement(CanvasRenderer, _extends({
        renderableTrace: renderableTrace,
        renderableTraceGroups: renderableTraceGroups,
        groupOrder: this.props.groupOrder
      }, this.state, {
        extents: this._getExtents(),
        viewportWidth: this.props.viewportWidth,
        viewportHeight: this.props.viewportHeight,
        tooltip: this._tooltip,
        truncateLabels: this.props.truncateLabels,
        renderer: renderer,
        onStateChange: this._handleStateChange,
        onSelectionChange: this._handleSelectionChange
      })) : React.createElement(DOMRenderer, {
        renderableTrace: renderableTrace,
        zoom: this.state.zoom,
        center: this.state.center,
        extents: this._getExtents(),
        viewportWidth: this.props.viewportWidth,
        viewportHeight: this.props.viewportHeight,
        onSelectionChange: this._handleSelectionChange
      }), this._renderTooltip()), React.createElement("pre", null, this.state.selection ? JSON.stringify(this.state.selection.measure, null, 2) : null));
      return rendered;
    }
  }]);

  return Trace;
}(React.Component);

module.exports = Trace;
