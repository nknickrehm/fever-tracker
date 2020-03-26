const mongoose = require('mongoose');
const config = require('./config');

let urlCredentials = '';

if (config.MONGO_USER) {
  urlCredentials += config.MONGO_USER + ':';

  if (config.MONGO_PASSWORD) {
    urlCredentials += config.MONGO_PASSWORD;
  }

  urlCredentials += '@';
}

const urlMongo = `mongodb://${ urlCredentials }${ config.MONGO_HOST }:${ config.MONGO_PORT }/${ config.MONGO_DB }`;

mongoose.connect(urlMongo, { useNewUrlParser: true, useUnifiedTopology: true });
