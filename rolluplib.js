const {rollup} = require('rollup');
const resolve = require('rollup-plugin-node-resolve');

const commonjs = require('rollup-plugin-commonjs');

const babel = require('rollup-plugin-babel');
const fs = require('fs');

const babelConfig = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));

babelConfig.plugins.push('@babel/plugin-proposal-object-rest-spread');
babelConfig.presets.push('@babel/preset-env');
const pkg = JSON.parse(fs.readFileSync('./package.json'));
const external = Object.keys(pkg.dependencies || {});

rollup({
  input: './src/Trace.js',
  external,
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
      file: 'trace-lib.js',
      format: 'cjs',
      name: 'trace',
    });
  })
  .then(() => {
    console.log('done');
    process.exit(0);
  });
