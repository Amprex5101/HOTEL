const User = require('../models/User');

const userController = {
    // Obtener todos los usuarios
    async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password'); // Excluir la contraseña por seguridad
            res.status(200).json(users);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ message: "Error al obtener usuarios" });
        }
    },

    // Obtener un solo usuario por ID
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ message: "Error al obtener usuario" });
        }
    }
};

module.exports = userController;