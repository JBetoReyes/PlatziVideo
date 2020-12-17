import express from 'express';
import dotenv from 'dotenv';
import webpack from 'webpack';

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

app.get('*', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Platzi Video</title>
      <link href="assets/app.css" rel="stylesheet">
    </head>
    <body>
      hello world 
      <div id="app" ></div>
      <script src="assets/app.js" type="text/javascript"></script>
    </body>
  </html>
  `);
});

app.listen(port, '0.0.0.0', (err) => {
  if (err) console.log(err);
  else console.log(`Running app on port: ${port}`);
});
