const { model, Schema } = require('mongoose');

const featureSchema = Schema({
  type: String,
  geometry: {},
  properties: {
    plz: String,
    qkm: Number,
    einwohner: String,
    timeLine: [{
      year: Number,
      month: Number,
      day: Number,
      avgTemp: Number,
      reports: [{
        timeStamp: {
          type: Date,
          required: true
        },
        temp: {
          type: Number,
          required: true
        },
        age: {
          type: Number,
          required: true
        }
      }]
    }]
  }
});

featureSchema.pre('save', function () {
  const { properties } = this;
  for (let i = 0; i < properties.timeLine.length; i++) {
    let sum = 0;
    for (let j = 0; j < properties.timeLine[i].reports.length; j++) {
      sum += properties.timeLine[i].reports[j].temp;
    }
    properties.timeLine[i].avgTemp = sum / properties.timeLine[i].reports.length;
  }
});

const Feature = model('feature', featureSchema);

module.exports = { Feature };
