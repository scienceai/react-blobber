var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var config = require('./config');
var assetsPath = path.resolve(__dirname, 'static/dist');
var host = config.development.host;
var port = config.development.devServerPort;

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-dev-server/client?http://' + host + ':' + port,
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, 'src', 'client.js')
  ],
  output: {
    path: assetsPath,
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: 'http://' + host + ':' + port + '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({ __CLIENT__: true, __SERVER__: false }),
    new webpack.DefinePlugin({ __DEVTOOLS__: !!(process.argv[2] && process.argv[2].match(/devtools/)) }),

    function() {
      this.plugin('done', notifyStats);
    },

    function() {
      this.plugin('done', writeStats);
    }
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  progress: true,
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader!cssnext-loader' },
      { test: /\.(jpe?g|png|gif|svg)$/, loader: 'file' }
    ]
  },
  cssnext: {
    browsers: 'last 2 versions'
  }
};


function notifyError(error) {
  // BELLs when something goes wrong!
  console.log("\x07" + error);
}

function notifyWarning(warning) {
  console.log(warning);
}

function notifyStats(stats) {
  var json = stats.toJson();
  if (json.errors.length > 0) {
    json.errors.forEach(notifyError);
  } else if (json.warnings.length > 0) {
    json.warnings.forEach(notifyWarning);
  } else {
    console.log(stats.toString({
      chunks: false,
      colors: true
    }));
  }
}

var filepath = path.resolve(__dirname, 'webpack-stats.json');

function writeStats(stats) {
  var publicPath = this.options.output.publicPath;
  var json = stats.toJson();

  // get chunks by name and extensions
  function getChunks(name, ext) {
    ext = ext || 'js';
    var chunk = json.assetsByChunkName[name];

    // a chunk could be a string or an array, so make sure it is an array
    if (!(Array.isArray(chunk))) {
      chunk = [chunk];
    }

    return chunk
      // filter by extension
      .filter(function (chunkName) {
        return path.extname(chunkName) === '.' + ext;
      })
      .map(function (chunkName) {
        return publicPath + chunkName;
      });
  }

  var script = getChunks('main', 'js');
  var css = getChunks('main', 'css');

  var content = {
    script: script,
    css: css
  };

  fs.writeFileSync(filepath, JSON.stringify(content));
}
