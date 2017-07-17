var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var globals = {
	api: "staging.priorityclient.com/profiles/v1",
	stripe: "mykey"
}

module.exports = {
  entry: './src/assets/js/index.js',
  output: {
    filename: 'assets/js/index.js',
    path: path.resolve(__dirname, 'www')
  },
  resolve: {
    alias: {
      'globals': 'globals',
    }
  },
  plugins: [
		new webpack.optimize.UglifyJsPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "./src/complete.html"),
			filename: 'complete.html',
			minify: {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				html5: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true,
				useShortDoctype: true
			}
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "./src/index.html"),
			minify: {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				html5: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true,
				useShortDoctype: true
			}
		}),
    new webpack.ProvidePlugin({
      globals: "globals",
    })
  ],
};
