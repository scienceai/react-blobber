var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  stats: { colors: true },
}).listen(3000, (err) => {
  if (err) return console.error(err);
  console.log('🚧   server listening on http://localhost:3000.  🚧');
});
