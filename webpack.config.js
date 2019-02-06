const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const PATHS = {
  entryPoint: path.resolve(__dirname, './src/index.ts'),
  bundle: path.resolve(__dirname, './dist/bundle')
};

const dev = {
  mode: 'development',
  target: 'web',
  entry: {
    'evc': [PATHS.entryPoint]
  },
  output: {
    path: PATHS.bundle,
    filename: 'index.min.js',
    libraryTarget: 'umd',
    library: 'evc',
    umdNamedDefine: true,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 5,
          mangle: false
        },
        sourceMap: false
      })
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};

const prod = {
  mode: 'production',
  target: 'web',
  entry: {
    'evc': [PATHS.entryPoint]
  },
  output: {
    path: PATHS.bundle,
    filename: 'index.min.js',
    libraryTarget: 'umd',
    library: 'evc',
    umdNamedDefine: true,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: true,
          ecma: 5,
          mangle: true
        },
        sourceMap: false
      })
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};

module.exports = dev;
