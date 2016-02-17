var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var babelrcObj = JSON.parse(fs.readFileSync('./.babelrc'));
babelrcObj.plugins = [];
babelrcObj.plugins.push(['react-transform', {
  transforms: [
    {
      transform: 'react-transform-hmr',
      imports: ['react'],
      locals: ['module']
    }
  ]
}]);

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    './dev-client.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'react-blobber.js',
    publicPath: '/js/'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel?' + JSON.stringify(babelrcObj), exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
    ]
  },
  postcss: function () {
    return [
      require('postcss-cssnext')(),
    ];
  },
  progress: true,
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
};
