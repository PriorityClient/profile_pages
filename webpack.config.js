var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  entry:  path.resolve(__dirname, './src/index.js'),
  output: {
    filename: 'index.js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      'globals':  path.resolve(__dirname, './src/globals.js')
    }
  },
  plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "./src/complete.html"),
			filename: 'complete.html',
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "./src/index.html"),
		}),
    new webpack.ProvidePlugin({
      globals: "globals",
    })
  ],
};
