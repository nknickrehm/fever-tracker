var express = require('express');
var router = express.Router();
const { Feature } = require('../models/feature');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/map.geojson', async function(req, res, next) {
  let features = await Feature.find({},  { '_id': 0, '__v': 0 });
  const geoJson = { type: 'FeatureCollection', features };
  return res.json(geoJson);
});

router.get('/neue-messung', function(req, res, next) {
  res.redirect('/');
});

router.post('/neue-messung', async function(req, res, next) {
  let { plz, temp, age } = req.body;
  if (!plz || !temp) return res.redirect('/#fehlendeDaten');

  temp.replace(',', '.');
  age = Number.parseInt(age);
  temp = Number.parseFloat(temp);

  if (Number.isNaN(age) || Number.isNaN(temp)) return res.redirect('/#fehlendeDaten');

  let validatedTemp = Number.parseFloat(temp);
  if (Number.isNaN(validatedTemp)) return res.redirect('/#falscheTemperatur');
  if (validatedTemp < 36 || validatedTemp > 42) return res.redirect('/#falscheTemperatur');

  let feature;

  try {
    feature = await Feature.findOne({ 'properties.plz': plz });
  } catch (error) {
    return next(error);
  }

  if (!feature) return res.redirect('/#falschePLZ');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const { properties } = feature;

  const date = properties.timeLine.find(t => t.year === year && t.month === month && t.day === day);

  if (date) {
    date.reports.push({timeStamp: now, temp, age});
  } else {
    properties.timeLine.push({
      year,
      month,
      day,
      reports: [{
        timeStamp: now,
        temp,
        age
      }]
    });
  }

  try {
    await feature.save();
  } catch (error) {
    console.error(error);
    return res.redirect('/#fehlendeDaten');
  }

  res.redirect('/#erfolgreich');
});

module.exports = router;
