/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const util = require('util');
const fs = require('fs');
const JSON5 = require('json5');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const CopyPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { getIPAdress } = require('./scripts/util');
// const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = () => {
  /* const args = argv(process.argv.slice(2), {});
  const { mock } = args.options || {}; */
  const env = process.env.NODE_ENV || 'development';
  const isProd = env !== 'development';
  return {
    mode: env,
    entry: path.resolve(__dirname, 'src/main.js'),
    devtool: 'source-map',
    output: {
      pathinfo: false,
      path: path.resolve(__dirname, './bin'),
      filename: 'js/[name].[hash:6].js',
      chunkFilename: 'js/[name].[chunkhash:6].js',
    },
    optimization: {
      splitChunks: {
        chunks: 'initial',
        cacheGroups: {
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          default: {
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: !isProd,
      }),
      new webpack.ExtendedAPIPlugin(),
      new WebpackBar({ color: !isProd ? 'green' : '#03a9f4' }),
      new FriendlyErrorsPlugin(),
      // new ForkTsCheckerWebpackPlugin({
      //   eslint: {
      //     files: './src/**/*.{ts,tsx,js,jsx}',
      //   },
      // }),
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'public/bitgame'), to: 'bitgame' },
          { from: path.resolve(__dirname, 'public/library'), to: 'library' },
          { from: path.resolve(__dirname, 'public/favicon.ico'), to: 'favicon.ico' },
        ],
      }),
      // new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nb/),
      new HtmlWebpackPlugin({
        template: './public/index.ejs',
        filename: 'index.html',
        inject: false,
        minify: isProd
          ? {
              collapseWhitespace: true,
              preserveLineBreaks: true,
              removeComments: true,
              minifyCSS: true,
              minifyJS: false,
            }
          : false,
      }),
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.js|ts$/,
          use: [
            'babel-loader',
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
          include: [path.join(__dirname, 'src'), path.join(__dirname, 'test')],
        },
      ],
    },
    devServer: {
      hot: true,
      host: getIPAdress(),
      port: 7010,
      disableHostCheck: true,
      contentBase: './bin/',
      stats: 'errors-only',
      overlay: true,
      clientLogLevel: 'warning', // 控制台提示信息级别是 warning 以
      headers: { 'Access-Control-Allow-Origin': '*' },
      before: (app) => {
        app.post('/platform/game/domains', async (req, res) => {
          const r2 = await util.promisify(fs.readFile)(path.join(__dirname, `./scripts/mock/domains.json5`));
          const rep = JSON5.parse(r2.toString());
          Object.assign(rep.data.domains, {
            ws: `ws://${getIPAdress()}:7000`,
            cdn: `http://${getIPAdress()}:7010/`,
          });
          res.send(rep);
        });
      },
    },
    resolve: {
      extensions: ['.js', '.ts'],
      modules: [path.resolve('./src'), path.resolve('./node_modules')],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
};
