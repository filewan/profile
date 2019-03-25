const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const config = require('./config');
const profile = require('./routes/profile');
const document = require('./routes/document');
// const service = require('./routes/service');
const initializeDb = require('./db');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
// app.use(cors());
app.use(function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      next();
    });

initializeDb((db) => { // eslint-disable-line no-unused-vars
  app.use('/profile', profile);
  app.use('/document', document);
  // app.use(bodyParser.urlencoded({ extended: false }));
  app.get('/', (req, res) => {
    res.json({
      jsonapi: {
        name: process.env.npm_package_name,
        purpose: process.env.npm_package_description,
        version: process.env.npm_package_version,
        meta: {
          copyright: 'Copyright 2019 filewan.com',
          authors: [],
        },
      },
    });
  });

  app.listen(config.get('app:port'), config.get('app:host'), () => {
    console.log(`Server listening on port ${config.get('app:port')}.`);
  });
});

module.exports = app;
