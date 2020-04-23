'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var karas = _interopDefault(require('karas'));
require('regenerator-runtime');
var cloneDeep = _interopDefault(require('lodash.clonedeep'));
var isEqual = _interopDefault(require('lodash.isEqual'));
var get = _interopDefault(require('lodash.get'));

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function compressImage(imageConfig) {
  return new Promise(function (resolve) {
    var width = imageConfig.width,
        height = imageConfig.height,
        quality = imageConfig.quality,
        src = imageConfig.src;
    var image = new Image();

    image.onload = function () {
      resolve({
        image: image,
        width: width,
        height: height,
        mimeType: base64MimeType(src),
        quality: quality
      });
    };

    if (window.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(window.navigator.userAgent)) {
      // Fix the `The operation is insecure` error (#57)
      image.crossOrigin = 'anonymous';
    }

    image.src = src;
  }).then(drawCanvas);
}

function drawCanvas(config) {
  return new Promise(function (resolve) {
    var image = config.image,
        width = config.width,
        height = config.height,
        mimeType = config.mimeType,
        quality = config.quality;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, width, height);
    context.save();
    context.drawImage(image, 0, 0, width, height);
    context.restore();

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        var reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onloadend = function () {
          resolve(reader.result);
        };
      }, mimeType, quality);
    }
  });
}

function base64MimeType(encoded) {
  var result = null;

  if (typeof encoded !== 'string') {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
}

var innerCompressImage = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': compressImage
});

var LEVEL_ENUM = {
  NONE: 0,
  ABBR: 1,
  DUPLICATE: 2,
  ALL: 3
};
var level = {
  LEVEL_ENUM: LEVEL_ENUM
};

var XOM = karas.reset.XOM;
var isNil = karas.util.isNil;
var _karas$abbr = karas.abbr,
    fullCssProperty = _karas$abbr.fullCssProperty,
    fullAnimate = _karas$abbr.fullAnimate,
    fullAnimateOption = _karas$abbr.fullAnimateOption;
var LEVEL_ENUM$1 = level.LEVEL_ENUM;

function equalArr(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (var i = 0, len = a.length; i < len; i++) {
    var ai = a[i];
    var bi = b[i];
    var isArrayA = Array.isArray(ai);
    var isArrayB = Array.isArray(bi);

    if (isArrayA && isArrayB) {
      if (!equalArr(ai, bi)) {
        return false;
      }
    } else if (isArrayA || isArrayB) {
      return false;
    }

    if (ai !== bi) {
      return false;
    }
  }

  return true;
}

function equalAnimateValue(a, b) {
  var keyList = [];
  var keyHash = {};
  Object.keys(a).forEach(function (k) {
    if (k !== 'offset' && !keyHash.hasOwnProperty(k)) {
      keyList.push(k);
      keyHash[k] = true;
    }
  });

  for (var i = 0, len = keyList.length; i < len; i++) {
    var k = keyList[i];

    if (b.hasOwnProperty(k)) {
      var va = a[k];
      var vb = b[k];

      if (Array.isArray(va) && Array.isArray(vb)) {
        if (!equalArr(a, b)) {
          return false;
        }
      } else if (Array.isArray(va) || Array.isArray(vb)) {
        // 异常情况
        return false;
      } else if (va !== vb) {
        return false;
      }
    } else {
      return false;
    }
  }

  var res = true;
  Object.keys(b).forEach(function (k) {
    if (k !== 'offset' && !keyHash.hasOwnProperty(k)) {
      res = false;
    }
  });
  return res;
}

function isAnimateValueUnavailable(value) {
  return !value || value.length === 0 || value.length === 1 && Object.keys(value[0]).length === 0;
}

var numberPrecisionMapper = {
  offset: 2,
  duration: 0,
  delay: 0,
  endDelay: 0
};

var KarasCompress = /*#__PURE__*/function () {
  function KarasCompress(json, options) {
    _classCallCheck(this, KarasCompress);

    var animationJson;

    if (typeof json === 'string') {
      try {
        animationJson = JSON.parse(json);
      } catch (error) {
        console.error(error);
      }
    } else if (_typeof(json) === 'object') {
      animationJson = json;
    }

    this.animationJson = animationJson;

    if (!(this.animationJson && _typeof(this.animationJson) === 'object')) {
      throw new Error('init compress error');
    }

    this.options = _objectSpread2({
      quality: options && options.quality || 0.8,
      compressImage: options && options.compressImage,
      useCanvasCompress: options && options.useCanvasCompress
    }, options); // init library

    this.initLibrary();
  }

  _createClass(KarasCompress, [{
    key: "compress",
    value: function () {
      var _compress = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(level, positionPrecision) {
        var animationJson, imagesPromise;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(!this.animationJson || _typeof(this.animationJson) !== 'object' || level === LEVEL_ENUM$1.NONE)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this.animationJson);

              case 2:
                animationJson = cloneDeep(this.animationJson);
                this.setPositionPrecision(positionPrecision);
                imagesPromise = [];
                this.traverseImage(animationJson.library, imagesPromise);
                this.traverseImage(animationJson.children, imagesPromise);
                _context.next = 9;
                return Promise.all(imagesPromise);

              case 9:
                this.traverseJson(animationJson, level);
                this.traverseJson(animationJson.library, level);
                return _context.abrupt("return", animationJson);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function compress(_x, _x2) {
        return _compress.apply(this, arguments);
      }

      return compress;
    }()
  }, {
    key: "initLibrary",
    value: function initLibrary() {
      var _this = this;

      var library = this.animationJson.library;
      this.libraryIdMapper = {};
      this.libraryMapper = {};
      if (!library || library.length === 0) return;
      var compressedLibraryId = 0;
      library.forEach(function (item) {
        _this.libraryIdMapper[item.id] = compressedLibraryId++;
        _this.libraryMapper[item.id] = item;
      });
    }
  }, {
    key: "setPositionPrecision",
    value: function setPositionPrecision() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      ['width', 'height', 'left', 'top'].forEach(function (key) {
        numberPrecisionMapper[key] = value;
      });
    }
  }, {
    key: "traverseImage",
    value: function traverseImage(children, promiseList) {
      var _this2 = this;

      if (!children || children.length === 0) {
        return;
      }

      children.forEach(function (item) {
        // 是否引用library
        var isRefLibrary = !!(item.libraryId && item.init);
        var isImage = false;
        var width;
        var height;
        var src;

        if (isRefLibrary) {
          var library = _this2.libraryMapper[item.libraryId];
          width = get(item, 'init.style.width') || get(library, 'props.style.width');
          height = get(item, 'init.style.height') || get(library, 'props.style.height');
          src = get(item, 'init.src');
          isImage = library && library.tagName === 'img' && !!src;
        } else {
          width = get(item, 'props.style.width');
          height = get(item, 'props.style.height');
          src = get(item, 'props.src');
          isImage = item.tagName === 'img' && !!src;
        }

        if (isImage) {
          var asyncCompressImage = /*#__PURE__*/function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
              var compressedSrc;
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      compressedSrc = src;

                      if (!compressImage) {
                        _context2.next = 5;
                        break;
                      }

                      _context2.next = 4;
                      return compressImage({
                        width: width,
                        height: height,
                        src: src,
                        quality: quality
                      });

                    case 4:
                      compressedSrc = _context2.sent;

                    case 5:
                      props.src = compressedSrc;

                    case 6:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            }));

            return function asyncCompressImage() {
              return _ref.apply(this, arguments);
            };
          }();

          var props = isRefLibrary ? item.init : item.props;
          if (!props) return;
          var quality = _this2.options.quality;
          var compressImage = _this2.options.useCanvasCompress ? innerCompressImage : _this2.options.compressImage;
          promiseList.push(asyncCompressImage());
        } else if (item.children && item.children.length > 0) {
          _this2.traverseImage(item.children, promiseList);
        }
      });
    }
  }, {
    key: "traverseJson",
    value: function traverseJson(json, level) {
      var _this3 = this;

      if (!json) {
        return;
      }

      if (Array.isArray(json)) {
        json.forEach(function (item) {
          _this3.traverseJson(item, level);
        });
        return;
      }

      var id = json.id,
          libraryId = json.libraryId,
          init = json.init,
          props = json.props,
          animate = json.animate,
          children = json.children;
      var isRefLibrary = !!libraryId;

      if (animate) {
        animate.forEach(function (animateItem, index) {
          var value = animateItem.value,
              options = animateItem.options;
          Object.keys(options).forEach(function (item) {
            if (level === LEVEL_ENUM$1.ABBR || level === LEVEL_ENUM$1.ALL) {
              var shortOptionName = _this3.compressAnimationOptionName(item);

              var fixedOptionValue = _this3.cutNumber(options[item], numberPrecisionMapper[item]);

              delete options[item];
              options[shortOptionName] = fixedOptionValue;
            }
          });
          Object.keys(animateItem).forEach(function (item) {
            if (level === LEVEL_ENUM$1.ABBR || level === LEVEL_ENUM$1.ALL) {
              var shortName = _this3.compressAnimateName(item);

              if (shortName !== item) {
                animateItem[shortName] = animateItem[item];
                delete animateItem[item];
              }
            }
          });

          if (level === LEVEL_ENUM$1.DUPLICATE || level === LEVEL_ENUM$1.ALL) {
            var len = value.length; // 去除重复帧，寻找和当前帧样式相同的帧，当跨度>=3时，删除中间的，当跨度2且总长2时保留1个

            if (len > 2) {
              for (var i = 0; i < value.length - 2; i++) {
                var start = value[i];

                if (equalAnimateValue(start, value[i + 1])) {
                  if (equalAnimateValue(start, value[i + 2])) {
                    // 直接和最后相等
                    if (i + 3 === len) {
                      value.splice(i + 1, 1);
                      break;
                    } else {
                      var lastEqualIndex = i + 2;
                      var j = lastEqualIndex + 1; // 找到不相等的那个索引

                      for (; j < len; j++) {
                        if (!equalAnimateValue(start, value[j])) {
                          break;
                        }

                        lastEqualIndex = j;
                      }

                      value.splice(i + 1, lastEqualIndex - i - 1);
                    }

                    i += 2;
                  } else {
                    i++;
                  }
                }
              }
            }

            len = value.length; // 只有2个时重复可去除一个，多个时上面操作可能会变成只有2个情况

            if (len === 2) {
              if (equalAnimateValue(value[0], value[1])) {
                value.splice(1);
              }
            }

            len = value.length; // 去除首尾offset

            if (len) {
              delete value[0].offset;
              delete value[len - 1].offset;
            }
          }

          value && value.forEach(function (item) {
            if (level === LEVEL_ENUM$1.DUPLICATE || level === LEVEL_ENUM$1.ALL) {
              _this3.removeDuplicatePropertyInFrame(item, isRefLibrary ? init.style : props.style, libraryId);
            }

            if (level === LEVEL_ENUM$1.ABBR || level === LEVEL_ENUM$1.ALL) {
              _this3.compressBezier(item);

              _this3.compressCssObject(item, false, true);
            }
          }); // 经过处理之后animateItem的value是否只有一个空对象，如果是，则移除整个animateItem

          if (isAnimateValueUnavailable(value)) {
            animate[index] = null;
          } // 判断当前animate是否与上一个相同，如果相同，则移除


          if (isEqual(animate[index], animate[index - 1])) {
            animate[index] = null;
          }
        });
        var filterAnimate = animate.filter(function (item) {
          return !!item;
        });

        if (filterAnimate.length === 0) {
          delete json.animate;
        } else {
          json.animate = filterAnimate;
        }
      } // id是library内才有的


      if (!isNil(id)) {
        json.id = this.libraryIdMapper[id];
      } // 引用library的item，只有init没有props


      if (init) {
        var canDeleteDefaultProperty = level === LEVEL_ENUM$1.DUPLICATE || level === LEVEL_ENUM$1.ALL;
        var canAbbr = level === LEVEL_ENUM$1.ABBR || level === LEVEL_ENUM$1.ALL;
        this.compressCssObject(init.style, canDeleteDefaultProperty, canAbbr, libraryId);
        this.removeDuplicatePropertyInLibrary(init, libraryId, 'points');
        this.removeDuplicatePropertyInLibrary(init, libraryId, 'controls');

        if (canAbbr) {
          if (init.points) init.points = this.cutNumber(init.points);
          if (init.controls) init.controls = this.cutNumber(init.controls);
        }
      } // 引用library，压缩引用ID


      if (libraryId) {
        json.libraryId = this.compressLibraryId(libraryId);
      }

      if (props) {
        // 压缩props
        var _canDeleteDefaultProperty = level === LEVEL_ENUM$1.DUPLICATE || level === LEVEL_ENUM$1.ALL;

        var _canAbbr = level === LEVEL_ENUM$1.ABBR || level === LEVEL_ENUM$1.ALL;

        this.compressCssObject(props.style, _canDeleteDefaultProperty, _canAbbr);

        if (_canAbbr) {
          if (props.points) props.points = this.cutNumber(props.points);
          if (props.controls) props.controls = this.cutNumber(props.controls);
        }
      }

      if (children && Array.isArray(children)) {
        children.forEach(function (item) {
          _this3.traverseJson(item, level);
        });
      }
    }
  }, {
    key: "compressCssObject",
    value: function compressCssObject(cssObj) {
      var _this4 = this;

      var canDeleteDefaultProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var canAbbr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var libraryId = arguments.length > 3 ? arguments[3] : undefined;

      if (!cssObj) {
        return;
      }

      Object.keys(cssObj).forEach(function (propertyName) {
        if (isNil(cssObj[propertyName])) {
          // 删除空值
          delete cssObj[propertyName];
        } else if (canDeleteDefaultProperty) {
          // 检查默认值
          // 如果是引用library，则需要判断是否默认值出现在library中
          // 1.出现在library中且值不为默认值，不能删除
          // 2.出现在library中且值为默认值，可以删除
          var libraryItem = _this4.libraryMapper[libraryId];
          var libraryStyleCssProperties = libraryItem && libraryItem.props && libraryItem.props.style && libraryItem.props.style[propertyName];

          var matchDefault = _this4.checkDefaultProperty(propertyName, cssObj[propertyName]);

          var libraryMatchDefault = _this4.checkDefaultProperty(propertyName, libraryStyleCssProperties);

          var matchLibrary = isEqual(cssObj[propertyName], libraryStyleCssProperties);

          if (matchLibrary) {
            delete cssObj[propertyName];
          } else if (matchDefault && (!libraryId || libraryMatchDefault)) {
            delete cssObj[propertyName];
          }
        }

        if (canAbbr && !isNil(cssObj[propertyName])) {
          var shortPropertyName = _this4.compressCssPropertyName(propertyName);

          var fixedPropertyValue = _this4.cutNumber(cssObj[propertyName], numberPrecisionMapper[propertyName]);

          delete cssObj[propertyName];
          cssObj[shortPropertyName] = fixedPropertyValue;
        }
      });
    } // 移除每帧中属性
    // 1. 与style重复，则删除
    // 2. style没有，判断是否为默认属性值，如果是则删除

  }, {
    key: "removeDuplicatePropertyInFrame",
    value: function removeDuplicatePropertyInFrame(frame, style, libraryId) {
      var _this5 = this;

      if (!frame) return;
      var libraryStyle = get(this.libraryMapper, "".concat(libraryId, ".props.style"));
      console.log(frame, libraryStyle, style);
      Object.keys(frame).forEach(function (propertyName) {
        if (style && !isNil(style[propertyName])) {
          // style重复
          if (isEqual(frame[propertyName], style[propertyName])) {
            delete frame[propertyName];
          }
        } else if (libraryStyle && !isNil(libraryStyle[propertyName])) {
          // 与library重复
          if (isEqual(frame[propertyName], libraryStyle[propertyName])) {
            delete libraryStyle[propertyName];
          }
        } else {
          // 判断是否为默认属性值
          if (_this5.checkDefaultProperty(propertyName, frame[propertyName])) {
            delete frame[propertyName];
          }
        }
      });
    } // 移除props与library中相同的属性

  }, {
    key: "removeDuplicatePropertyInLibrary",
    value: function removeDuplicatePropertyInLibrary(props, libraryId, key) {
      var libraryProps = get(this.libraryMapper, "".concat(libraryId, ".props"));
      if (!key || !props[key] || !libraryProps[key]) return;

      if (isEqual(props[key], libraryProps[key])) {
        delete props[key];
      }
    }
  }, {
    key: "checkDefaultProperty",
    value: function checkDefaultProperty(k, v) {
      return XOM[k] === v;
    }
  }, {
    key: "compressCssPropertyName",
    value: function compressCssPropertyName(propertyName) {
      var matches = propertyName.match(/^var-(.*)/);

      if (matches && matches[1]) {
        return "var-".concat(fullCssProperty[matches[1]] || matches[1]);
      }

      return fullCssProperty[propertyName] || propertyName;
    }
  }, {
    key: "compressAnimateName",
    value: function compressAnimateName(itemName) {
      return fullAnimate[itemName] || itemName;
    }
  }, {
    key: "compressAnimationOptionName",
    value: function compressAnimationOptionName(optionName) {
      var matches = optionName.match(/^var-(.*)/);

      if (matches && matches[1]) {
        return "var-".concat(fullAnimateOption[matches[1]] || matches[1]);
      }

      return fullAnimateOption[optionName] || optionName;
    }
  }, {
    key: "cutNumber",
    value: function cutNumber(propertyValue, n) {
      var _this6 = this;

      if (Array.isArray(propertyValue) && propertyValue.length > 0) {
        // 数组继续递归
        return propertyValue.map(function (v) {
          return _this6.cutNumber(v, n);
        });
      } else if (typeof propertyValue !== 'number') {
        // 如果不是数字则立即返回原值
        return propertyValue;
      }

      return Number(propertyValue.toFixed(n >= 0 ? n : 4)) || 0;
    }
  }, {
    key: "compressBezier",
    value: function compressBezier(item) {
      var _this7 = this;

      if (!item || !item.easing) return;
      var matches = item.easing.match(/\((.*)\)/);

      if (matches && matches[1]) {
        var controls = matches[1].split(',');
        var fixedControls = controls.map(function (item) {
          return _this7.cutNumber(item, 3);
        });
        item.easing = "(".concat(fixedControls.join(','), ")");
      }
    }
  }, {
    key: "compressLibraryId",
    value: function compressLibraryId(libraryId) {
      return this.libraryIdMapper[libraryId] >= 0 ? this.libraryIdMapper[libraryId] : libraryId;
    }
  }]);

  return KarasCompress;
}();

KarasCompress.LEVEL = LEVEL_ENUM$1;

module.exports = KarasCompress;
//# sourceMappingURL=index.js.map
