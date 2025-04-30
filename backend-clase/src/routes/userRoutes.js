const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de usuarios
router.get('/users', userController.getAllUsers);

// La ruta específica debe ir antes que la ruta parametrizada
router.delete('/users/batch', userController.deleteBatchUsers);

// Rutas con parámetros
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Añadir esta ruta a las existentes:
router.post('/users', userController.createUser);

module.exports = router;