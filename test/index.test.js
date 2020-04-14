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
    const result = await compressor.compress(KarasCompress.LEVEL.NONE);
    assert.notStrictEqual(compressor.animationData, full);
    assert.deepEqual(result, full);
  });
  it('test on abbr', async () => {
    const compressor = new KarasCompress(abbr);
    const result = await compressor.compress(KarasCompress.LEVEL.ABBR);
    assert.deepEqual(result, abbrMin);
  });
  it('test on duplicate', async () => {
    const compressor = new KarasCompress(duplicate);
    const result = await compressor.compress(KarasCompress.LEVEL.DUPLICATE);
    assert.deepEqual(result, duplicateMin);
  });
  it('test on image compress', async () => {
    const compressor = new KarasCompress(img, {
      compressImage: item => Promise.resolve(`${item.src}_compressed_${item.width}_${item.height}_${item.quality}`),
      quality: 0.7,
    });
    const result = await compressor.compress(KarasCompress.LEVEL.ALL);
    assert.deepEqual(result.children[0].props.src, 'xxoo1_compressed_40_30_0.7');
    assert.deepEqual(result.children[1].children[0].props.src, 'xxoo2_compressed_100_80_0.7');
  });
  it('test on vars', async () => {
    const compressor = new KarasCompress(vars);
    const result = await compressor.compress(KarasCompress.LEVEL.ABBR);
    assert.deepEqual(result, varsMin);
  });
  it('test on fixedNumber', async () => {
    const compressor = new KarasCompress(fixedNumber);
    const result = await compressor.compress(KarasCompress.LEVEL.ALL, 1);
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
  it('test on full', async () => {
    const compressor = new KarasCompress(full);
    const result = await compressor.compress(KarasCompress.LEVEL.ALL, 2);
    assert.deepEqual(result, fullMin);
  });
});
