const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');

const PATHS = {
  entryPoint: path.resolve(__dirname, './src/index.ts'),
  bundle: path.resolve(__dirname, './dist/bundle')
};

const prod = {
  mode: 'production',
  performance: {
    hints: false,
    maxEntrypointSize: 812000,
    maxAssetSize: 812000
  },
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
          mangle: true,
          output: {
            comments: false,
          },
        },
        sourceMap: false,
      }),
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
      },
      {
        loader: 'url-loader?limit=100000',
        test: /\.(png|woff|woff2|eot|ttf|svg)$/
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      template: './index.html',
      filename: './index.html',
    }),
    new WebpackAutoInject({
      SHORT: 'epic-video-comparator',
      SILENT: false,
      PACKAGE_JSON_PATH: './package.json',
      PACKAGE_JSON_INDENT: 2,
      components: {
        AutoIncreaseVersion: false,
      },
      componentsOptions: {
        InjectAsComment: {
          tag: 'Version: {version} - {date}',
          dateFormat: 'dddd, mmmm dS, yyyy, HH:MM:ss',
          multiLineCommentType: true,
        },
      }
    })
  ]
};

module.exports = prod;
