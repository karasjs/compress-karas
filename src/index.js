/**
 * 参考lottie-compress，压缩包括
 *  数字精度压缩
 *  css属性名压缩
 *  移除默认属性
 *  图片压缩
 *
 */
import karas from 'karas';
import 'regenerator-runtime';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isEqual';
import get from 'lodash.get';

import * as innerCompressImage from './compressImage';

const { DOM, GEOM } = karas.style.reset;
const XOM = Object.assign({}, DOM, GEOM);
const { isNil, equalArr } = karas.util;
const { fullCssProperty, fullAnimate, fullAnimateOption } = karas.parser.abbr;

function equalAnimateValue(a, b) {
  let keyList = [];
  let keyHash = {};
  Object.keys(a).forEach(k => {
    if(k !== 'offset' && !keyHash.hasOwnProperty(k)) {
      keyList.push(k);
      keyHash[k] = true;
    }
  });
  for(let i = 0, len = keyList.length; i < len; i++) {
    let k = keyList[i];
    if(b.hasOwnProperty(k)) {
      let va = a[k];
      let vb = b[k];
      if(Array.isArray(va) && Array.isArray(vb)) {
        if(!equalArr(a, b)) {
          return false;
        }
      }
      else if(Array.isArray(va) || Array.isArray(vb)) {
        // 异常情况
        return false;
      }
      else if(va !== vb) {
        return false;
      }
    }
    else {
      return false;
    }
  }
  let res = true;
  Object.keys(b).forEach(k => {
    if(k !== 'offset' && !keyHash.hasOwnProperty(k)) {
      res = false;
    }
  });
  return res;
}

function isAnimateValueUnavailable(value) {
  return !value || value.length === 0 || value.length === 1 && Object.keys(value[0]).length === 0;
}

const numberPrecisionMapper = {
  offset: 2,
  duration: 0,
  delay: 0,
  endDelay: 0,
};

// 默认不压缩图片，处理缩写和重复属性
const defaultCompressOption = {
  image: false,
  abbr: true,
  duplicate: true,
  positionPrecision: 2
};

class KarasCompress {
  constructor(json, options) {
    let animationJson;
    if(typeof json === 'string') {
      try {
        animationJson = JSON.parse(json);
      } catch(error) {
        console.error(error);
      }
    }
    else if(typeof json === 'object') {
      animationJson = json;
    }
    this.animationJson = animationJson;
    if(!(this.animationJson && typeof this.animationJson === 'object')) {
      throw new Error('init compress error');
    }
    this.options = {
      quality: options && options.quality || 0.8,
      compressImage: options && options.compressImage,
      useCanvasCompress: options && options.useCanvasCompress,
      ...options,
    };
    // init library
    this.initLibrary();
  }

  async compress(option = defaultCompressOption) {
    if(!this.animationJson || typeof this.animationJson !== 'object' || !option) {
      return this.animationJson;
    }
    const {
      image: needCompressImage,
      abbr: needAbbr,
      duplicate: needDuplicate,
      positionPrecision = 2,
    } = option;
    const animationJson = cloneDeep(this.animationJson);
    this.setPositionPrecision(positionPrecision);
    let imagesPromise = [];
    if (needCompressImage) {
      this.traverseImage(animationJson.library, imagesPromise);
      this.traverseImage(animationJson.children, imagesPromise);
      await Promise.all(imagesPromise);
    }
    this.traverseJson(animationJson, needAbbr, needDuplicate);
    this.traverseJson(animationJson.library, needAbbr, needDuplicate);
    return animationJson;
  }

  initLibrary() {
    const library = this.animationJson.library;
    this.libraryIdMapper = {};
    this.libraryMapper = {};
    if (!library || library.length === 0) return;
    let compressedLibraryId = 0;
    library.forEach(item => {
      this.libraryIdMapper[item.id] = compressedLibraryId++;
      this.libraryMapper[item.id] = item;
    });
  }

  setPositionPrecision(value = 0) {
    ['width', 'height', 'left', 'top'].forEach(key => {
      numberPrecisionMapper[key] = value;
    });
  }
  traverseImage(children, promiseList) {
    if(!children || children.length === 0) {
      return;
    }
    children.forEach(item => {
      // 是否引用library
      const isRefLibrary = !!(item.libraryId !== undefined && item.init);
      let isImage = false;
      let width;
      let height;
      let src;
      if (isRefLibrary) {
        const library = this.libraryMapper[item.libraryId];
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
      if(isImage) {
        const props = isRefLibrary ? item.init : item.props;
        if (!props) return;
        const quality = this.options.quality;
        const compressImage = this.options.useCanvasCompress
          ? innerCompressImage
          : this.options.compressImage;
        async function asyncCompressImage() {
          let compressedSrc = src;
          if (compressImage) {
            compressedSrc = await compressImage({
              width,
              height,
              src,
              quality,
            });
          }
          props.src = compressedSrc;
        }
        promiseList.push(asyncCompressImage());
      }
      else if(item.children && item.children.length > 0) {
        this.traverseImage(item.children, promiseList);
      }
    });
  }

  traverseJson(json, needAbbr, needDuplicate) {
    if(!json) {
      return;
    }
    if (Array.isArray(json)) {
      json.forEach(item => {
        this.traverseJson(item, needAbbr, needDuplicate);
      });
      return;
    }
    let { id, libraryId, init, props, animate, children } = json;
    const isRefLibrary = libraryId !== undefined;
    if(animate) {
      animate.forEach((animateItem, index) => {
        let { value, options } = animateItem;
        Object.keys(options).forEach(item => {
          if(needAbbr) {
            let shortOptionName = this.compressAnimationOptionName(item);
            let fixedOptionValue = this.cutNumber(options[item], numberPrecisionMapper[item]);
            delete options[item];
            options[shortOptionName] = fixedOptionValue;
          }
        });
        Object.keys(animateItem).forEach(item => {
          if(needAbbr) {
            let shortName = this.compressAnimateName(item);
            if(shortName !== item) {
              animateItem[shortName] = animateItem[item];
              delete animateItem[item];
            }
          }
        });
        if(needDuplicate) {
          let len = value.length;
          // 去除重复帧，寻找和当前帧样式相同的帧，当跨度>=3时，删除中间的，当跨度2且总长2时保留1个
          if(len > 2) {
            for(let i = 0; i < value.length - 2; i++) {
              let start = value[i];
              if(equalAnimateValue(start, value[i + 1])) {
                if(equalAnimateValue(start, value[i + 2])) {
                  // 直接和最后相等
                  if(i + 3 === len) {
                    value.splice(i + 1, 1);
                    break;
                  }
                  else {
                    let lastEqualIndex = i + 2;
                    let j = lastEqualIndex + 1;
                    // 找到不相等的那个索引
                    for(; j < len; j++) {
                      if(!equalAnimateValue(start, value[j])) {
                        break;
                      }
                      lastEqualIndex = j;
                    }
                    value.splice(i + 1, lastEqualIndex - i - 1);
                  }
                  i += 2;
                }
                else {
                  i++;
                }
              }
            }
          }
          len = value.length;
          // 只有2个时重复可去除一个，多个时上面操作可能会变成只有2个情况
          if(len === 2) {
            if(equalAnimateValue(value[0], value[1])) {
              value.splice(1);
            }
          }
          len = value.length;
          // 去除首尾offset
          if(len) {
            delete value[0].offset;
            delete value[len - 1].offset;
          }
        }
        value && value.forEach(item => {
          if (needDuplicate) {
            this.removeDuplicatePropertyInFrame(item, isRefLibrary ? init.style : props.style, libraryId);
          }
          if(needAbbr) {
            this.compressBezier(item);
          }
          // 前面已经通过removeDuplicatePropertyInFrame移除了重复的属性，这里不需要处理
          this.compressCssObject(item, false, needAbbr);
        });
        // 经过处理之后animateItem的value是否只有一个空对象，如果是，则移除整个animateItem
        if (isAnimateValueUnavailable(value)) {
          animate[index] = null;
        }
        // 判断当前animate是否与上一个相同，如果相同，则移除
        if (isEqual(animate[index], animate[index - 1])) {
          animate[index] = null;
        }
      });
      const filterAnimate = animate.filter(item => !!item);
      if (filterAnimate.length === 0) {
        delete json.animate;
      } else {
        json.animate = filterAnimate;
      }
    }
    // id是library内才有的
    if (!isNil(id)) {
      json.id = this.libraryIdMapper[id];
    }
    // 引用library的item，只有init没有props
    if (init) {
      this.compressCssObject(init.style, needDuplicate, needAbbr, libraryId);
      this.removeDuplicatePropertyInLibrary(init, libraryId, 'points');
      this.removeDuplicatePropertyInLibrary(init, libraryId, 'controls');
      if(needAbbr) {
        if (init.points) init.points = this.cutNumber(init.points);
        if (init.controls) init.controls = this.cutNumber(init.controls);
      }
    }
    // 引用library，压缩引用ID
    if (libraryId) {
      json.libraryId = this.compressLibraryId(libraryId);
    }
    if(props) {
      // 压缩props
      this.compressCssObject(props.style, needDuplicate, needAbbr);
      if(needAbbr) {
        if (props.points) props.points = this.cutNumber(props.points);
        if (props.controls) props.controls = this.cutNumber(props.controls);
      }
    }
    if(children && Array.isArray(children)) {
      children.forEach(item => {
        this.traverseJson(item, needAbbr, needDuplicate);
      });
    }
  }

  compressCssObject(cssObj, canDeleteDefaultProperty = false, canAbbr = false, libraryId) {
    if(!cssObj) {
      return;
    }
    Object.keys(cssObj).forEach(propertyName => {
      if (isNil(cssObj[propertyName])) {
        // 删除空值
        delete cssObj[propertyName];
      } else if(canDeleteDefaultProperty) {
        // 检查默认值
        // 如果是引用library，则需要判断是否默认值出现在library中
        // 1.出现在library中且值不为默认值，不能删除
        // 2.出现在library中且值为默认值，可以删除
        const libraryItem = this.libraryMapper[libraryId];
        const libraryStyleCssProperties = libraryItem && libraryItem.props && libraryItem.props.style && libraryItem.props.style[propertyName];
        const matchDefault = this.checkDefaultProperty(propertyName, cssObj[propertyName]);
        const libraryMatchDefault = this.checkDefaultProperty(propertyName, libraryStyleCssProperties);
        const matchLibrary = isEqual(cssObj[propertyName], libraryStyleCssProperties);
        if (matchLibrary) {
          delete cssObj[propertyName];
        } else if (matchDefault && (!libraryId || libraryMatchDefault)) {
          delete cssObj[propertyName];
        }
      }
      if (canAbbr && !isNil(cssObj[propertyName])) {
        let shortPropertyName = this.compressCssPropertyName(propertyName);
        let fixedPropertyValue = this.cutNumber(cssObj[propertyName], numberPrecisionMapper[propertyName]);
        delete cssObj[propertyName];
        cssObj[shortPropertyName] = fixedPropertyValue;
      }
    });
  }

  // 移除每帧中属性
  // 1. 与style重复，则删除
  // 2. style没有，判断是否为默认属性值，如果是则删除
  removeDuplicatePropertyInFrame(frame, style, libraryId) {
    if (!frame) return;
    const libraryStyle = get(this.libraryMapper, `${libraryId}.props.style`);

    Object.keys(frame).forEach(propertyName => {
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
        if (this.checkDefaultProperty(propertyName, frame[propertyName])) {
          delete frame[propertyName];
        }
      }
    });
  }

  // 移除props与library中相同的属性
  removeDuplicatePropertyInLibrary(props, libraryId, key) {
    const libraryProps = get(this.libraryMapper, `${libraryId}.props`);
    if (!key || !props[key] || !libraryProps[key]) return;
    if (isEqual(props[key], libraryProps[key])) {
      delete props[key];
    }
  }

  checkDefaultProperty(k, v) {
    return XOM[k] === v;
  }

  compressCssPropertyName(propertyName) {
    const matches = propertyName.match(/^var-(.*)/);
    if (matches && matches[1]) {
      return `var-${fullCssProperty[matches[1]] || matches[1]}`;
    }
    return fullCssProperty[propertyName] || propertyName;
  }

  compressAnimateName(itemName) {
    return fullAnimate[itemName] || itemName;
  }

  compressAnimationOptionName(optionName) {
    const matches = optionName.match(/^var-(.*)/);
    if (matches && matches[1]) {
      return `var-${fullAnimateOption[matches[1]] || matches[1]}`;
    }
    return fullAnimateOption[optionName] || optionName;
  }

  cutNumber(propertyValue, n) {
    if(Array.isArray(propertyValue) && propertyValue.length > 0) {
      // 数组继续递归
      return propertyValue.map(v => this.cutNumber(v, n));
    }
    else if(typeof propertyValue !== 'number') {
      // 如果不是数字则立即返回原值
      return propertyValue;
    }
    return Number(propertyValue.toFixed(n >= 0 ? n : 4)) || 0;
  }

  compressBezier(item) {
    if (!item || !item.easing) return;
    const matches = item.easing.match(/\((.*)\)/);
    if (matches && matches[1]) {
      const controls = matches[1].split(',');
      const fixedControls = controls.map(item => this.cutNumber(item, 3));
      item.easing = `(${fixedControls.join(',')})`;
    }
  }

  compressLibraryId(libraryId) {
    return this.libraryIdMapper[libraryId] >= 0 ? this.libraryIdMapper[libraryId] : libraryId;
  }
}

export default KarasCompress;





