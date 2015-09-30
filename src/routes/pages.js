import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { RoutingContext, match } from 'react-router';
import createLocation from 'history/lib/createLocation';

import routes from '../routes';

const router = express.Router({ caseSensitive: true });

let webpackStats;

if (process.env.NODE_ENV === 'production') {
  webpackStats = require('../../webpack-stats.json');
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}


function generateMarkup(res, renderProps) {
  return  '<!DOCTYPE html>\n' + ReactDOMServer.renderToString(
    <html>
      <head>
        <title>Dispatcher</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="csrf-token" content={res.locals.token} />
        <link rel="shortcut icon" href="/images/sa_logo.png" />
        {webpackStats.css.map((css, i) => <link href={css} ref={i} rel="stylesheet" type="text/css" />)}
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{
          __html: ReactDOMServer.renderToString(
            <RoutingContext {...renderProps} />
          )
        }}/>
        <script src={webpackStats.script[0]} />
      </body>
    </html>
  );
}

router.use((req, res) => {
  if (process.env.NODE_ENV === 'development') {
    webpackStats = require('../../webpack-stats.json');
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    delete require.cache[require.resolve('../../webpack-stats.json')];
  }

  const location = createLocation(req.url);

  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    } else if (err) {
      res.send(500, err.message);
    } else if (renderProps == null) {
      res.send(404, 'Not found');
    } else {

      res.send(generateMarkup(res, renderProps));

    }
  });
});

export default router;
