var mapboxAccessToken = 'pk.eyJ1IjoibmtuaWNrcmVobSIsImEiOiJjazg4bjNybnUwNDhkM2dwM2xidzRmbXBoIn0.s6c8wfcOfUN6jBr4UG4VPA';
var COLOR_NO_DATA = '#eee';
var geojson;
var map;
var topWidget;
var currentDate;
var currentDateLabel;
var currentPLZArea;
var currentAvgTemp;
var addReportForm;
var privacyInformation;
var imprint;
var year, month, day;
var selectedFeature;


document.addEventListener('DOMContentLoaded', function () {
  topWidget = document.querySelector('#topWidget');
  currentPLZArea = document.querySelector('#currentPLZArea');
  currentAvgTemp = document.querySelector('#currentAvgTemp');
  currentDateLabel = document.querySelector('#currentDate');
  addReportForm = document.querySelector(' #addReportForm');
  privacyInformation = document.querySelector(' #privacyInformation');
  imprint = document.querySelector(' #imprint');

  moment.locale('de');
  setCurrentDateToday();

  map = L.map('fewerMap').setView([51.352,10.062], 6);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'nknickrehm/ck875tglg0usa1jlp2h1ic4km',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxAccessToken
  }).addTo(map);

  fetch('/map.geojson')
    .then(data => data.json())
    .then((json) => {
      geojson = L.geoJson(json, { style, onEachFeature }).addTo(map);
      document.querySelector('#loading').classList.toggle('is-hidden');
    });

  window.setTimeout(selfDestroyNotifications, 5000);

  grecaptcha.ready(function() {
    grecaptcha.execute('6LekLOQUAAAAAF8ZgQtqSZLkObH5iOXHTU_UZO3H', {action: 'addReport'})
      .then(function(token) {
        document.querySelector('#grecaptcha').value = token;
      });
  });
});

function getColor(feature) {
  var properties = feature.properties;

  if (properties.hasOwnProperty('timeLine')) {
    const date = properties.timeLine.find(t => t.year === year && t.month === month && t.day === day);

    if (date) {
      return perc2color((date.avgTemp - 35) / 5 * 100);
    } else {
      return COLOR_NO_DATA;
    }
  } else {
    return COLOR_NO_DATA;
  }
}

function style(feature) {
  return {
    fillColor: getColor(feature),
    weight: .5,
    opacity: 1,
    color: 'white',
    dashArray: '1',
    fillOpacity: .5
  };
}

function highlightFeature(target) {
  var layer = target;

  layer.setStyle({
    weight: 1,
    color: '#666',
    dashArray: '',
    fillOpacity: .5
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(target) {
  geojson.resetStyle(target);
}

function zoomToFeature(target) {
  selectedFeature = target;
  geojson.resetStyle();
  highlightFeature(target);

  map.fitBounds(target.getBounds());

  currentPLZArea.innerHTML = target.feature.properties.plz + 'XX';

  if (target.feature.properties.hasOwnProperty('timeLine')) {
    const date = target.feature.properties.timeLine.find(t => t.year === year && t.month === month && t.day === day);

    if (date) {
      const numReports = date.reports.length;
      currentAvgTemp.innerHTML = `${date.avgTemp}°C (${numReports} Bericht${numReports > 1 ? 'e' : ''})`;
    } else {
      currentAvgTemp.innerHTML = '- (Keine Berichte)';
    }
  } else {
    currentAvgTemp.innerHTML = '- (Keine Berichte)';
  }
}

function onEachFeature(feature, layer) {
  //layer.bindPopup('PLZ: ' + feature.properties.plz + 'XX');
  layer.bindTooltip('PLZ: ' + feature.properties.plz + 'XX', { sticky: true });
  layer.on({
    mouseover: function (e) { highlightFeature(e.target) },
    mouseout: function (e) { resetHighlight(e.target) },
    click: function (e) {
      if (selectedFeature !== e.target)
        zoomToFeature(e.target);
      else
        selectedFeature = null;
    }
  });
}

function perc2color(perc) {
    const hue = Math.round(100 - perc);
    return ["hsl(", hue, ", 50%, 50%)"].join("");
}

function toggleReportForm() {
  addReportForm.classList.toggle('is-active');
  document.querySelector('html').classList.toggle('is-clipped');
}

function togglePrivacyModal() {
  privacyInformation.classList.toggle('is-active');
  document.querySelector('html').classList.toggle('is-clipped');
}

function toggleImprintModal() {
  imprint.classList.toggle('is-active');
  document.querySelector('html').classList.toggle('is-clipped');
}

function updateDateLabel() {
  currentDateLabel.innerHTML = moment(currentDate).format('LL');
}

function addToCurrentDate(i) {
  newDate = new Date();
  newDate.setDate(currentDate.getDate() + i);
  setCurrentDate(newDate);
}

function setCurrentDateToday() {
  setCurrentDate(new Date());
}

function setCurrentDate(newDate) {
  currentDate = newDate;
  year = currentDate.getFullYear();
  month = currentDate.getMonth();
  day = currentDate.getDate();
  if (selectedFeature) zoomToFeature(selectedFeature);
  else if (geojson) geojson.resetStyle();
  updateDateLabel();
}

function selfDestroyNotifications() {
  var notifications = Array.from(document.querySelectorAll('.notification'));
  notifications.forEach(function (notification) {
    notification.style.display = 'none';
  });
}
