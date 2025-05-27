const express = require('express');
const router = express.Router();
const hotelDetailController = require('../controllers/hotelDetailController');

// Rutas para detalles de hoteles
router.get('/hotel-details', hotelDetailController.getHotelDetails);
router.post('/hotel-details', hotelDetailController.createHotelDetail);
router.delete('/hotel-details/:hotelId', hotelDetailController.deleteHotelDetail);

module.exports = router;