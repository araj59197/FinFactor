const express = require('express');
const router = express.Router();
const aqiController = require('../controllers/aqiController');
const { validateCitySearch, validateCoordinateSearch } = require('../middleware/validator');


router.get('/search', validateCitySearch, aqiController.searchCity);


router.get('/coordinates', validateCoordinateSearch, aqiController.searchByCoordinates);

router.get('/cache-stats', aqiController.getCacheStats);

module.exports = router;
