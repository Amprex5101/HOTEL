const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Rutas de hoteles
router.get('/hotels', hotelController.getAllHotels);
router.get('/hotels/:id', hotelController.getHotelById);
router.post('/hotels', hotelController.createHotel);
router.put('/hotels/:id', hotelController.updateHotel);
router.delete('/hotels/:id', hotelController.deleteHotel);

module.exports = router;