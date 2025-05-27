const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

// Rutas para reservas
router.get('/reservas', reservaController.getAllReservas);
router.post('/reservas', reservaController.createReserva);
router.get('/reservas/numero/:reservationNumber', reservaController.getReservaByNumber);
router.post('/reservas/cancel/:reservationNumber', reservaController.cancelReserva);

// Rutas para reservas por usuario
router.get('/usuarios/:userId/reservas', reservaController.getReservasByUser);

// Rutas para reservas por hotel
router.get('/hoteles/:hotelId/reservas', reservaController.getReservasByHotel);

module.exports = router;