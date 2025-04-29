const mongoose = require('mongoose');

// Esquema mejorado con más campos
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'moderator', 'editor'], // Añadir 'editor' a la lista
        default: 'user'
    },
    avatar: {
        type: String,
        default: ''
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Verificar si el modelo ya existe
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;