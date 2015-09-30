var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var webpackConfig = require('./webpack.dev.config');
var config = require('./config');
var host = config.development.host;
var port = config.development.devServerPort;

var server = new WebpackDevServer(webpack(webpackConfig), {
  contentBase: 'http://' + host + ':' + port,
  quiet: true,
  noInfo: true,
  inline: true,
  hot: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: { "Access-Control-Allow-Origin": "*" },
  historyApiFallback: true,
  stats: { colors: true }
});

server.listen(port, host, function(err) {
  if (err) {
    console.log(err);
  }

  console.log('Webpack dev server listening on %s:%s', host, port);
});
