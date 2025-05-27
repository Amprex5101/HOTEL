const mongoose = require('mongoose');

// Esquema para amenidades detalladas
const amenityDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    }
});

// Esquema para detalles de hotel
const hotelDetailSchema = new mongoose.Schema({
    hotelId: {
        type: Number,
        required: true,
        unique: true,
        ref: 'Hotel' // Referencia al modelo Hotel usando el campo id
    },
    description: {
        type: String,
        required: true
    },
    longDescription: {
        type: String,
        default: ''
    },
    additionalImages: {
        type: [String],
        default: []
    },
    checkIn: {
        type: String,
        default: '15:00'
    },
    checkOut: {
        type: String,
        default: '12:00'
    },
    policies: {
        type: [String],
        default: []
    },
    amenityDetails: {
        type: [amenityDetailSchema],
        default: []
    },
    nearbyAttractions: {
        type: [String],
        default: []
    },
    contactInfo: {
        phone: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// Verificar si el modelo ya existe
const HotelDetail = mongoose.models.HotelDetail || mongoose.model('HotelDetail', hotelDetailSchema);

module.exports = HotelDetail;