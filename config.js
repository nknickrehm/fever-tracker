require('dotenv').config();

const mandatoryParameters = ['MONGO_HOST','MONGO_PORT','MONGO_DB','MAPBOX_API_KEY','GRECAPTCHA_SITE_KEY','GRECAPTCHA_SECRET_KEY'];
const optionalParameters = ['MONGO_USER','MONGO_PASSWORD'];

const config = {};

mandatoryParameters.forEach((p) => {
  if (!process.env.hasOwnProperty(p)) {
    console.error('Missing mandatory configuration', p);
    process.exit(1);
  }
  config[p] = process.env[p];
});

optionalParameters.forEach((p) => {
  if (!process.env.hasOwnProperty(p)) {
    config[p] = undefined;
  }
  config[p] = process.env[p];
});

module.exports = config;
