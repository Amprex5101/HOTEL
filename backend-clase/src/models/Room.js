const mongoose = require('mongoose');

// Esquema para la disponibilidad de habitaciones específicas
const roomAvailabilitySchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isReserved: {
    type: Boolean, 
    default: false
  },
  reservedUntil: {
    type: Date,
    default: null
  }
});

// Esquema para los servicios incluidos en una habitación
const roomServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
});

// Esquema principal para las habitaciones
const roomSchema = new mongoose.Schema({
  hotelId: {
    type: Number,
    required: true,
    ref: 'Hotel' // Referencia al modelo Hotel
  },
  typeId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: 2
  },
  beds: {
    type: String,
    default: '1 cama king size'
  },
  squareMeters: {
    type: Number,
    default: 0
  },
  mainImage: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  services: {
    type: [roomServiceSchema],
    default: []
  },
  extraServices: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  }],
  availability: {
    total: {
      type: Number,
      required: true
    },
    available: {
      type: Number,
      default: function() {
        return this.total;
      }
    },
    rooms: {
      type: [roomAvailabilitySchema],
      default: []
    }
  }
}, {
  timestamps: true
});

// Método para verificar disponibilidad
roomSchema.methods.checkAvailability = function(checkIn, checkOut) {
  // Aquí se implementaría la lógica para verificar si hay habitaciones
  // disponibles en el rango de fechas especificado
  return this.availability.available > 0;
};

// Verificar si el modelo ya existe
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

module.exports = Room;