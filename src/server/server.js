import express from 'express';
import dotenv from 'dotenv';
import webpack from 'webpack';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { StaticRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import serverRoutes from '../frontend/routes/serverRoutes.js';
import reducer from '../frontend/reducers';
import initialState from '../frontend/initialState.js';
import { resolve } from 'path';
import helmet from 'helmet';
import getManifest  from './getManifest.js';

dotenv.config();

const { ENV: env, PORT: port } = process.env;
const app = express();

if (env === 'development') {
  const webpackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const { publicPath } = webpackConfig;
  const serverConfig = {
    publicPath,
    serverSideRender: true
  };

  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use((req, res, next) => {
    if (!req.hashManifest) req.hashManifest = getManifest();
    next()
  });
  app.use(express.static(resolve(__dirname, 'public')));
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.disable('x-powered-by');
}

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest['main.css'] : 'assets/app.css';
  const mainJS = manifest ? manifest['main.js'] : 'assets/app.js';
  const vendors = manifest ? manifest['vendors.js'] : 'assets/vendor.js';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Platzi Video</title>
        <link href=${mainStyles} rel="stylesheet">
      </head>
      <body>
        hello world 
        <div id="app" >${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g,'\\u003c')}
        </script>
        <script src=${mainJS} type="text/javascript"></script>
        <script src=${vendors} type="text/javascript"></script>
      </body>
    </html>
  `;
};

const renderApp = (req, res) => {
  const store = createStore(reducer, initialState);
  const preloadedState = store.getState();
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes)}
      </StaticRouter>
    </Provider>
  );

  res.send(setResponse(html, preloadedState, req.hashManifest));
};

app.get('*', (req, res) => {
  renderApp(req, res);
});

app.listen(port, '0.0.0.0', (err) => {
  if (err) console.log(err);
  else console.log(`Running app on port: ${port}`);
});
