require('../db');
const { Feature } = require('../models/feature');
const { features } = require('./plzData');

async function insert(features) {
  for (let i = 0; i < features.length; i++) {
    const feature = new Feature(features[i]);
    try {
      await feature.save();
    } catch (error) {
      console.error(error);
    }
  }
}

console.log('Start seeding the database. Please wait...');
insert(features)
  .then(() => { console.log('Success.'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
