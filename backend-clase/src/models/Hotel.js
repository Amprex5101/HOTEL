const mongoose = require('mongoose');

// Esquema para hoteles
const hotelSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    amenities: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Verificar si el modelo ya existe
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;