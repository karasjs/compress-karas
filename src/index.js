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
import { cloneDeep } from 'lodash';

import * as innerCompressImage from './compressImage';
import level from './level';

const { XOM } = karas.reset;
const { fullCssProperty, fullAnimate, fullAnimateOption } = karas.abbr;
const { LEVEL_ENUM } = level;

function equalArr(a, b) {
  if(a.length !== b.length) {
    return false;
  }
  for(let i = 0, len = a.length; i < len; i++) {
    let ai = a[i];
    let bi = b[i];
    let isArrayA = Array.isArray(ai);
    let isArrayB = Array.isArray(bi);
    if(isArrayA && isArrayB) {
      if(!equalArr(ai, bi)) {
        return false;
      }
    }
    else if(isArrayA || isArrayB) {
      return false;
    }
    if(ai !== bi) {
      return false;
    }
  }
  return true;
}

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

const numberPrecisionMapper = {
  offset: 2,
  duration: 0,
  delay: 0,
  endDelay: 0,
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
      animationJson = cloneDeep(json);
    }
    this.animationJson = animationJson;
    if(!(this.animationJson && typeof this.animationJson === 'object')) {
      throw new Error('init compress error');
    }
    this.options = {
      quality: options && options.quality || 0.8,
      compressImage: options && options.compressImage || innerCompressImage,
      ...options,
    };
  }

  async compress(level, positionPrecision) {
    if(!this.animationJson || typeof this.animationJson !== 'object' || level === LEVEL_ENUM.NONE) {
      return this.animationJson;
    }
    this.setPositionPrecision(positionPrecision);
    let imagesPromise = [];
    this.traverseImage(this.animationJson.children, imagesPromise);
    await Promise.all(imagesPromise);
    this.traverseJson(this.animationJson, level);
    return this.animationJson;
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
      if(item.tagName === 'img' && item.props.src) {
        const quality = this.options.quality;
        const compressImage = this.options.compressImage;
        async function asyncCompressImage(item) {
          item.props.src = await compressImage({
            width: item.props.style.width,
            height: item.props.style.height,
            src: item.props.src,
            quality,
          });
        }

        promiseList.push(asyncCompressImage(item));
      }
      else if(item.children && item.children.length > 0) {
        this.traverseImage(item.children, promiseList);
      }
    });
  }

  traverseJson(item, level) {
    if(!item) {
      return;
    }
    let { props, animate, children } = item;
    if(animate) {
      animate.forEach(animateItem => {
        let { value, options } = animateItem;
        Object.keys(options).forEach(item => {
          if(level === LEVEL_ENUM.ABBR || level === LEVEL_ENUM.ALL) {
            let shortOptionName = this.compressAnimationOptionName(item);
            let fixedOptionValue = this.cutNumber(options[item], numberPrecisionMapper[item]);
            delete options[item];
            options[shortOptionName] = fixedOptionValue;
          }
        });
        Object.keys(animateItem).forEach(item => {
          if(level === LEVEL_ENUM.ABBR || level === LEVEL_ENUM.ALL) {
            let shortName = this.compressAnimateName(item);
            if(shortName !== item) {
              animateItem[shortName] = animateItem[item];
              delete animateItem[item];
            }
          }
        });
        if(level === LEVEL_ENUM.DUPLICATE || level === LEVEL_ENUM.ALL) {
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
                    let j = i + 3;
                    // 找到不相等的那个索引
                    for(; j < len; j++) {
                      if(!equalAnimateValue(start, value[j])) {
                        break;
                      }
                    }
                    // 找到最后都相等没跳出j会等于len
                    if(j === len) {
                      j--;
                    }
                    value.splice(i + 1, j - i - 1);
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
          if (level === LEVEL_ENUM.DUPLICATE || level === LEVEL_ENUM.ALL) {
            this.removeDuplicatePropertyInFrame(item, props.style);
          }
          if(level === LEVEL_ENUM.ABBR || level === LEVEL_ENUM.ALL) {
            this.compressBezier(item);
            this.compressCssObject(item, false, true);
          }
        });
      });
    }
    if(props) {
      // 压缩props
      const canDeleteDefaultProperty = level === LEVEL_ENUM.DUPLICATE || level === LEVEL_ENUM.ALL;
      const canAbbr = level === LEVEL_ENUM.ABBR || level === LEVEL_ENUM.ALL;
      this.compressCssObject(props.style, canDeleteDefaultProperty, canAbbr);
      if(level === LEVEL_ENUM.ABBR || level === LEVEL_ENUM.ALL) {
        if (props.points) props.points = this.cutNumber(props.points);
        if (props.controls) props.controls = this.cutNumber(props.controls);
      }
    }
    if(children) {
      children.forEach(item => {
        this.traverseJson(item, level);
      });
    }
  }

  compressCssObject(cssObj, canDeleteDefaultProperty = false, canAbbr = false) {
    if(!cssObj) {
      return;
    }
    Object.keys(cssObj).forEach(propertyName => {
      if (karas.util.isNil(cssObj[propertyName])) {
        // 删除空值
        delete cssObj[propertyName];
      } else if(canDeleteDefaultProperty && this.checkDefaultProperty(propertyName, cssObj[propertyName])) {
        // 检查默认值
        delete cssObj[propertyName];
      } else if (canAbbr) {
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
  removeDuplicatePropertyInFrame(frame, style) {
    if (!frame) return;
    Object.keys(frame).forEach(propertyName => {
      if (style && !karas.util.isNil(style[propertyName])) {
        // style重复
        if (frame[propertyName] === style[propertyName]) {
          delete frame[propertyName];
        }
      } else {
        // 判断是否为默认属性值
        if (this.checkDefaultProperty(propertyName, frame[propertyName])) {
          delete frame[propertyName];
        }
      }
    });
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
}

KarasCompress.LEVEL = LEVEL_ENUM;
export default KarasCompress;




