// ----------------------------------------------------------------------

import { DB, sequelize } from './database';
import { logError, logInfo } from './utils/logger';

// Run this first to provide the required config to other library imports
if (process.env.NODE_ENV === 'production') {
  const dotenv = require('dotenv');
  logInfo('Loading dotenv variables');
  dotenv.config();
}
// ----------------------------------------------------------------------

const express = require('express');
const clientRoutes = require('./routes/v1');

const app = express();

const port: number = parseInt(
  process.env.PORT || process.env.STARTPORT || '3000'
);

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

//Introduction message
app.get('/', function (_, res) {
  res.send('Node server is up.');
});

app.use('/api/v1', clientRoutes);

DB.sequelize
  .authenticate()
  .then(async () => {
    logInfo(`Database connected successfully!`);
    app.listen(port, function () {
      logInfo(`App is listening on port ${port} !`);
    });

    if (process.env.NODE_ENV === 'development') {
      logInfo('Sequelize synchronizing models started.');
      await sequelize.sync({ alter: true });
      logInfo('All models were synchronized successfully.');
    }
  })
  .catch((error) => {
    logError('Unable to connect to the database:' + error);
  });

module.exports = app;
