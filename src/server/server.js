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

dotenv.config();

const { ENV: env, PORT: port } = process.env;
const app = express();

if (env === 'development') {
  console.log('Development config');
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
}

const setResponse = (html, preloadedState) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Platzi Video</title>
        <link href="assets/app.css" rel="stylesheet">
      </head>
      <body>
        hello world 
        <div id="app" >${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g,'\\u003c')}
        </script>
        <script src="assets/app.js" type="text/javascript"></script>
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

  res.send(setResponse(html, preloadedState));
};

app.get('*', (req, res) => {
  renderApp(req, res);
});

app.listen(port, '0.0.0.0', (err) => {
  if (err) console.log(err);
  else console.log(`Running app on port: ${port}`);
});
