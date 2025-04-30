const User = require('../models/User');
const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt instalado

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
    },

    // Eliminar un usuario por ID
    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ message: "Usuario eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ message: "Error al eliminar usuario" });
        }
    },

    // Eliminar múltiples usuarios en lote
    async deleteBatchUsers(req, res) {
        try {
            const { userIds } = req.body;
            
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: "Se requiere una lista de IDs de usuarios para eliminar" });
            }

            // Eliminar múltiples usuarios por IDs
            const result = await User.deleteMany({ _id: { $in: userIds } });
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "No se encontraron usuarios para eliminar" });
            }

            res.status(200).json({ 
                message: "Usuarios eliminados correctamente", 
                count: result.deletedCount 
            });
        } catch (error) {
            console.error("Error al eliminar usuarios en lote:", error);
            res.status(500).json({ message: "Error al eliminar usuarios" });
        }
    },

    // Actualizar usuario por ID
    async updateUser(req, res) {
        try {
            const { name, email, role, avatar } = req.body;
            
            // Buscar y actualizar el usuario
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id, 
                { 
                    name,
                    email,
                    role,
                    avatar,
                    // No actualizamos el username ni la contraseña aquí
                },
                { new: true, runValidators: true }
            ).select('-password');
            
            if (!updatedUser) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(500).json({ message: "Error al actualizar usuario" });
        }
    },

    // Crear un nuevo usuario
    async createUser(req, res) {
        try {
            const { username, password, name, email, role, avatar } = req.body;
            
            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
            }
            
            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Crear nuevo usuario
            const newUser = new User({
                username,
                password: hashedPassword,
                name: name || '',
                email: email || '',
                role: role || 'user',
                avatar: avatar || ''
            });
            
            await newUser.save();
            
            // Enviar respuesta excluyendo la contraseña
            const userResponse = newUser.toObject();
            delete userResponse.password;
            
            res.status(201).json(userResponse);
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ message: "Error al crear el usuario" });
        }
    }
};

module.exports = userController;