const {rollup} = require('rollup');
const resolve = require('rollup-plugin-node-resolve');

const commonjs = require('rollup-plugin-commonjs');

const babel = require('rollup-plugin-babel');
const fs = require('fs');

const babelConfig = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));

babelConfig.plugins.push('@babel/plugin-proposal-object-rest-spread');

rollup({
  input: './src/SelfContained.js',
  plugins: [
    require('rollup-plugin-replace')({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    babel(babelConfig),
    resolve(),
    commonjs(),
  ],
})
  .then(bundle => {
    return bundle.write({
      file: 'Flamegraph-lib.js',
      format: 'umd',
      name: 'Flamegraph',
    });
  })
  .then(() => {
    console.log('done');
    process.exit(0);
  });
