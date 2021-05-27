/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const util = require('util');
const fs = require('fs');
const JSON5 = require('json5');
const argv = require('node-argv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const CopyPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const { CheckerPlugin } = require('awesome-typescript-loader')
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = () => {
  /* const args = argv(process.argv.slice(2), {});
  const { mock } = args.options || {}; */
  const env = process.env.NODE_ENV || 'development';
  const isProd = env !== 'development';
  return {
    mode: env,
    entry: path.resolve(__dirname, 'src/Main.ts'),
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
      new ForkTsCheckerWebpackPlugin({
        eslint: {
          files: './src/**/*.{ts,tsx,js,jsx}', // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
        },
      }),
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
      isProd
        ? new SentryWebpackPlugin({
            authToken: '2eba955d2d284e55a4830893f4da61345dfaf6a12a3e4591b811bb6c0d97cf77',
            org: 'zjq-15',
            project: 'game',
            include: path.resolve(__dirname, './bin/js'),
            // ignore: ['node_modules',  'scripts', 'webpack.config.js'],
          })
        : null,
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.js|ts$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                // disable type checker - we will use it in fork plugin
                transpileOnly: true,
                useTranspileModule: true,
                forceIsolatedModules: true,
                useCache: true,
                cacheDirectory: 'scripts/.temp/awcache',
                useBabel: true,
                reportFiles: ['src/**/*.{js,ts}'],
                babelCore: '@babel/core',
              },
            },
          ],
          include: [path.join(__dirname, 'src'), path.join(__dirname, 'test')],
        },
      ],
    },
    devServer: {
      hot: true,
      host: '0.0.0.0',
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
          res.send(JSON5.parse(r2.toString()));
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
