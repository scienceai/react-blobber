require('es6-promise').polyfill();
require('isomorphic-fetch');

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import csrf from 'csurf';
import express from 'express';
import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import util from 'util';

import config from '../config';
import pageRoutes from './routes/pages';

const { port, host } = config[process.env.NODE_ENV || 'development'];

const app = express();

app.enable('case sensitive routing');

app.set('ROOT_COUCH', util.format(
  '%s//%s:%d/',
  config.couchProtocol || process.env.COUCH_PROTOCOL || 'http:',
  config.couchHost || process.env.COUCH_HOST || '127.0.0.1',
  config.couchPort || process.env.COUCH_PORT || 5984
));
app.set('ROOT_COUCH_DISPATCHER', util.format(
  '%s%s/',
  app.get('ROOT_COUCH'),
  config.couchDbNameDispatcher || process.env.COUCH_DB_NAME_DISPATCHER || 'dispatcher'
));

app.use(serveStatic(path.join(__dirname, '..', 'static')));
app.use(cookieParser());
app.use(cookieSession({ keys: ['rockefeller', 'french'] }));
app.use(csrf());
app.use((req, res, next) => {
  res.locals.token = req.csrfToken();
  next();
});
app.use(bodyParser.json());

app.use('/', pageRoutes);

app.use((req, res) => {
  res.status(404).end('NOT FOUND');
});

const server = http.createServer(app);

server.listen(port, host, err => {
  if (err) {
    console.error(err);
  }

  console.log('server listening on %s:%s', host, port);
});
