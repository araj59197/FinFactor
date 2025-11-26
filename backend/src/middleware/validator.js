function validateCitySearch(req, res, next) {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'City parameter is required',
        });
    }

    if (typeof city !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'City must be a string',
        });
    }

    if (city.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'City name cannot be empty',
        });
    }

    if (city.length > 100) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'City name is too long',
        });
    }

    next();
}

function validateCoordinateSearch(req, res, next) {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Both latitude and longitude are required',
        });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Latitude and longitude must be valid numbers',
        });
    }

    if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Latitude must be between -90 and 90',
        });
    }

    if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Longitude must be between -180 and 180',
        });
    }

    next();
}

module.exports = {
    validateCitySearch,
    validateCoordinateSearch,
};
