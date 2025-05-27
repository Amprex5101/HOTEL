const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// Rutas para promociones
router.get('/promotions', promotionController.getAllPromotions);
router.get('/promotions/active', promotionController.getActivePromotions);
router.get('/promotions/:id', promotionController.getPromotionById);
router.post('/promotions', promotionController.createPromotion);
router.put('/promotions/:id', promotionController.updatePromotion);
router.delete('/promotions/:id', promotionController.deletePromotion);

// Rutas para promociones por hotel
router.get('/hotels/:hotelId/promotions', promotionController.getPromotionsByHotelId);
router.get('/hotels/:hotelId/promotions/active', promotionController.getActivePromotionsByHotelId);

// Verificar código de promoción
router.post('/promotions/verify-code', promotionController.verifyPromotionCode);

module.exports = router;