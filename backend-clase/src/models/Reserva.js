const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  // Información del hotel
  hotelId: {
    type: Number,
    required: true,
    ref: 'Hotel'
  },
  hotelName: {
    type: String,
    required: true
  },
  
  // Información de la habitación
  roomType: {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  roomNumber: {
    type: String,
    required: true
  },
  
  // Información de fechas
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  
  // Información del huésped
  cliente: {
    username: {  // Cambiado de userId a username
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  
  // Detalles de la reserva
  guests: {
    type: Number,
    required: true,
    min: 1
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
    }
  }],
  specialRequests: {
    type: String,
    default: ''
  },
  
  // Información de pago
  totalPrice: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Identificadores únicos
  reservationNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Estado de la reserva
  status: {
    type: String,
    required: true,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  
  // Promociones aplicadas
  promoCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Método para calcular el precio total
reservaSchema.methods.calculateTotal = function() {
  // Precio base por noche * número de noches
  let total = this.roomType.price * this.nights;
  
  // Añadir servicios extra
  if (this.extraServices && this.extraServices.length > 0) {
    this.extraServices.forEach(service => {
      total += service.price;
    });
  }
  
  // Aplicar descuento si existe
  if (this.discount > 0) {
    total = total - (total * (this.discount / 100));
  }
  
  return total;
};

// Verificar si el modelo ya existe
const Reserva = mongoose.models.Reserva || mongoose.model('Reserva', reservaSchema);

module.exports = Reserva;