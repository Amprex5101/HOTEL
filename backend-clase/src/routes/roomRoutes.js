const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');


// Rutas para habitaciones por hotel
router.get('/hotels/:hotelId/rooms', roomController.getRoomsByHotelId);
router.post('/hotels/:hotelId/check-availability', roomController.checkAvailability);

// Ruta para actualizar disponibilidad de una habitación específica
router.patch('/rooms/:roomId/availability', roomController.updateRoomAvailability);

module.exports = router;