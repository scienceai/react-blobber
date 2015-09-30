var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src', 'client.js'),
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js?$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader!cssnext-loader' },
      { test: /\.(jpe?g|png|gif|svg)$/, loader: 'file' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({__CLIENT__: true, __SERVER__: false}),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  progress: true
};
