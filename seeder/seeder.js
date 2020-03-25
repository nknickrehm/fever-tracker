const mongoose = require('mongoose');
const { features } = require('./plzData');
const { Feature } = require('../models/feature');

mongoose.connect(`mongodb://127.0.0.1/fewermap`);

async function insert(features) {
  for (let i=0; i < features.length; i++) {
    const feature = new Feature(features[i]);
    try {
      await feature.save();
    } catch (error) {
      console.error(error);
    }
  }
  process.exit(0);
}

insert(features);
