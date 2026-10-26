const maptilerClient = require('@maptiler/client');
const { ExpressError } = require('../utils');

// Turns a place name into a GeoJSON Point using MapTiler
module.exports = async function geocode(location) {
    maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
    let result;
    try {
        result = await maptilerClient.geocoding.forward(location, { limit: 1 });
    } catch (e) {
        throw new ExpressError('Could not look up that location. Check MAPTILER_API_KEY on the server.', 502);
    }
    if (!result || !result.features || !result.features.length) {
        throw new ExpressError('Could not find that location on the map. Try a more specific place name.', 400);
    }
    return result.features[0].geometry;
};
