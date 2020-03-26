# Fever Tracker
This project sets up a heat map to track the daily average body temperature in different regions of Germany.

The map visualizes the average reported body temperature for 3-digit zip code areas. You can navigate between days to detect the spreading of fever related viruses and report your own body temperature and age to participate in this crowd sourcing project.

A demo is operated on [fieber-tracker.de](https://fieber-tracker.de). Please note that the whole user interface is currently only available in German.

![Screenshot displaying the body temperature heatmap for Luebeck, Germany](https://raw.githubusercontent.com/nknickrehm/fever-tracker/master/public/images/screenshot.png)
## Dependencies
- [Node.js](https://nodejs.org/en/) LTS is required to run this application.
- [MongoDB](https://www.mongodb.com/de) is used as a database system. Currently the application assumes that the database is operated on the same host without any login credentials. 
- [Mapbox](https://www.mapbox.com) is used to render the map. You need your own API token.
- [Google reCAPTCHA](https://developers.google.com/recaptcha) v3 is used for SPAM protection. You need to bring your own keys. 

## Setup
- Copy `.env.example` to `.env` and set at least the mandatory parameters
- Run `npm install`
- Run `npm run seed:db`
- Run `npm start`
- In your web browser visit `http://localhost:3000`
