const KarasCompress = require('../index');
const abbr = require('./fixture/abbr');
const abbrMin = require('./fixture/abbr.min');
const duplicate = require('./fixture/duplicate');
const duplicateMin = require('./fixture/duplicate.min');
const fixedNumber = require('./fixture/fixedNumber');
const full = require('./fixture/full');
const fullMin = require('./fixture/full.min');
const img = require('./fixture/img');
const vars = require('./fixture/vars');
const varsMin = require('./fixture/vars.min');
const animation = require('./fixture/animation');
const emptyAnimation = require('./fixture/emptyAnimation');
const duplicateAnimate = require('./fixture/duplicateAnimate.json');
const ref = require('./fixture/ref.json');

const assert = require('assert');

describe('test', () => {
  it('test on empty', () => {
    assert.throws(() => new KarasCompress(), Error, 'init compress error');
  });
  it('test on jsonString', async () => {
    const compressor = new KarasCompress('{"tagName":"$rect","props":{"style":{"position":"absolute","left":0,"top":0,"width":100,"height":100,"strokeWidth":0,"fill":"#F00"}}}');
    assert.equal(!!compressor, true);
  });
  it('test on none', async () => {
    const compressor = new KarasCompress(full);
    const result = await compressor.compress(null);
    assert.notStrictEqual(compressor.animationData, full);
    assert.deepEqual(result, full);
  });
  it('test on abbr', async () => {
    const compressor = new KarasCompress(abbr);
    const result = await compressor.compress({ abbr: true });
    assert.deepEqual(result, abbrMin);
  });
  it('test on duplicate', async () => {
    const compressor = new KarasCompress(duplicate);
    const result = await compressor.compress({ duplicate: true });
    assert.deepEqual(result, duplicateMin);
  });
  it('test on image compress', async () => {
    const compressor = new KarasCompress(img, {
      compressImage: item => Promise.resolve(`${item.src}_compressed_${item.width}_${item.height}_${item.quality}`),
      quality: 0.7,
    });
    const result = await compressor.compress({ image: true });
    assert.deepEqual(result.children[0].props.src, 'xxoo1_compressed_40_30_0.7');
    assert.deepEqual(result.children[1].children[0].props.src, 'xxoo2_compressed_100_80_0.7');
  });
  it('test on vars', async () => {
    const compressor = new KarasCompress(vars);
    const result = await compressor.compress({ abbr: true });
    assert.deepEqual(result, varsMin);
  });
  it('test on fixedNumber', async () => {
    const compressor = new KarasCompress(fixedNumber);
    const result = await compressor.compress({
      image: true,
      abbr: true,
      duplicate: true,
      positionPrecision: 1,
    });
    const {
      animate,
      props: {
        points,
        controls,
      },
    } = result.children[0];
    assert.deepEqual(result.props.style, {
      w: 110.1,
      h: 81,
    });
    assert.deepEqual(points[0], [0.9152,0.1021]);
    assert.deepEqual(controls[0], [0.9152,0.1021,0.9122,0.0987]);
    assert.deepEqual(animate[0].v[1].os, 0.21);
    assert.deepEqual(animate[0].o.dt, 6000);
  });
  it('test on animation', async () => {
    const compressor = new KarasCompress(animation);
    const result = await compressor.compress();
    assert.deepEqual(result.animate[0].v, [
      { w: 120 },
      { w: 120, os: 0.3 },
      { w: 100 },
    ]);
    assert.deepEqual(result.children[0].animate[0].v, [
      { h: 120 },
      { h: 120, os: 0.3 },
      { h: 100, os: 0.4 },
      { h: 100, os: 0.5 },
      { h: 100 },
    ]);
    assert.deepEqual(result.children[0].animate[1].v, [
      { h: 120 },
    ]);
    assert.deepEqual(result.children[0].animate[2].v, [
      { h: 130 },
    ]);
    assert.deepEqual(result.children[0].animate[3].v, [
      { h: 140 },
    ]);
  });
  it('test on emptyAnimation', async () => {
    const compressor = new KarasCompress(emptyAnimation);
    const result = await compressor.compress();
    assert.equal(!!result.animate, false);
    assert.deepEqual(result.children[0].animate, [{
      v: [{ w: 120 }],
      o: { dt: 6000 },
    }]);
  });
  it('test on duplicate animate', async () => {
    const compressor = new KarasCompress(duplicateAnimate);
    const result = await compressor.compress();
    assert.deepEqual(result.animate.length, 1);
  });
  it('test on library', async () => {
    const compressor = new KarasCompress(ref, {
      compressImage: item => Promise.resolve(`${item.src}_compressed_${item.width}_${item.height}_${item.quality}`),
      quality: 0.7,
    });
    const result = await compressor.compress({
      image: true,
      abbr: true,
      duplicate: true,
      positionPrecision: 2,
    });
    assert.deepEqual(result.library, [{
      id: 0,
      tagName: 'div',
      props: {
        style: { c: '#FF0000' }
      }
    }, {
      id: 1,
      tagName: 'img',
      props: {
        src: 'xxoo1_compressed_100_80_0.7',
        style: {
          w: 100,
          h: 80,
        },
      }
    }, {
      id: 2,
      tagName: '$polygon',
      props: {
        points: [
          [0.9152,0.1021],
          [0.9122,0.0987],
        ],
        controls: [
          [0.9152,0.1021,0.9122,0.0987],
          [0.7988,-0.0288,0.618,-0.0333],
        ],
      },
    }]);
    assert.deepEqual(result.children, [{
      libraryId: 0,
      init: { style: { bc: '#0000FF' } }
    }, {
      libraryId: 1,
      init: {
        src: 'xxoo2_compressed_auto_30_0.7',
        style: {
          h: 30,
          w: 'auto'
        },
      },
      animate: [{
        v: [{}, {
          w: 120
        }],
        o: { dt: 167 },
      }]
    }, {
      libraryId: 2,
      init: {
        points: [
          [1.9152,1.1021],
          [1.9122,1.0987],
        ]
      },
    }]);
  });
  it('test on full', async () => {
    const compressor = new KarasCompress(full);
    const result = await compressor.compress({
      image: true,
      abbr: true,
      duplicate: true,
      positionPrecision: 2,
    });
    assert.deepEqual(result, fullMin);
  });
});
