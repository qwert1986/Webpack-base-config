const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TreserWebpackPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

const optimization = () => {
  const config = {
    splitChunks: {
      cacheGroups: {
        // bootstrapjs: {
        //   test: /[\\/]node_modules[\\/](<vendor_name>)/,
        //   name: 'bootstrap', // chunk's name
        //   chunks: 'initial',
        //   enforce: true,
        // },
      }
    },
  }
  
  if (!isDev) {
    config.minimizer = [
      new OptimizeCSSWebpackPlugin(),
      new TreserWebpackPlugin()
    ]
    config.minimize = true
  }

  return config
}

const filename = ext => {
  const filename = isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`
  let filepath = `${ext}/${filename}`
  return filepath
}

const cssLoaders = extra => {
  const loader = [
    {
      loader: MiniCSSExtractPlugin.loader,
    }, 
    {
      loader: 'css-loader',
      options: {
        url: false
      }
    }
  ] 

  if (extra)
    loader.push(extra)

  return loader
}

console.log('is dev=', isDev)
console.log('__dirname=', path.resolve(__dirname))

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: {
      app: './js/app.js', 
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: filename('js'),
    },
    resolve: {
      extensions: ['.js', '.json'],
      // alias: {
      //   '@': path.resolve(__dirname, 'src')
      // }
    },
    devServer: {
      port: 8080,
      hot: isDev,
      watchFiles: ['src/**/*', 'dist/**/*'],
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      }
    },
    devtool: isDev ? 'source-map' : 'eval-source-map',
    plugins: [
        new ESLintPlugin({}),
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
              collapseWhitespace: !isDev
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'src', 'images'),
              to: path.resolve(__dirname, 'dist', 'images')
            },
            {
              from: path.resolve(__dirname, 'src', 'fonts'),
              to: path.resolve(__dirname, 'dist', 'fonts')
            }
          ]
        }), 
        new MiniCSSExtractPlugin({
          filename: filename('css'),
        })
    ],
    optimization: optimization(),
    module: {
        rules: [
            { 
              test: /\.css$/, 
              use: cssLoaders()
            },
            {
              test: /\.(gif|jpeg|png)$/,
              use: ['file-loader']
            },
            { 
              test: /\.less$/, 
              use: cssLoaders('less-loader')
            },
            { 
              test: /\.s[ac]ss$/, 
              use: cssLoaders('sass-loader')
            },
            {
              test: /\.xml$/,
              use: ['xml-loader']
            },
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              use: ['babel-loader']
            }
        ],
      },
};