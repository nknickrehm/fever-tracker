const express = require('express');
const axios = require('axios');

const config = require('../config');
const { Feature } = require('../models/feature');

const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { GRECAPTCHA_SITE_KEY: config.GRECAPTCHA_SITE_KEY, MAPBOX_API_KEY: config.MAPBOX_API_KEY });
});

/**
 * GET the GeoJSON data for the zip code areas
 */
router.get('/map.geojson', async function(req, res, next) {
  let features = await Feature.find({},  { '_id': 0, '__v': 0 });
  const geoJson = { type: 'FeatureCollection', features };
  return res.json(geoJson);
});

/**
 * GET requests on the add report url will be redirected to the front page
 */
router.get('/neue-messung', function(req, res, next) {
  res.redirect('/');
});

/**
 * POST request to add reports
 */
router.post('/neue-messung', async function(req, res, next) {
  // Check if all mandatory fields are included in the POST request
  let { plz, temp, age, grecaptcha } = req.body;
  if (!plz || !temp || !grecaptcha) return res.redirect('/#fehlendeDaten');

  // SPAM protection
  const grecaptchaResult = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.GRECAPTCHA_SECRET_KEY}&response=${grecaptcha}`);
  if (!grecaptchaResult.data.success) return res.redirect('/#fehlendeDaten');

  age = Number.parseInt(age);
  // Just German things
  temp.replace(',', '.');
  temp = Number.parseFloat(temp);

  // Validate if age and temperature are Numbers
  if (Number.isNaN(age) || Number.isNaN(temp)) return res.redirect('/#fehlendeDaten');

  // Check if temp is in a valid range
  let validatedTemp = Number.parseFloat(temp);
  if (Number.isNaN(validatedTemp)) return res.redirect('/#falscheTemperatur');
  if (validatedTemp < 35 || validatedTemp > 42) return res.redirect('/#falscheTemperatur');

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

  if (temp < 38)
    res.redirect('/#erfolgreich');
  else
    res.redirect('/#gute-besserung');
});

module.exports = router;
