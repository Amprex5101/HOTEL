const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  hotelId: {
    type: Number,
    required: true,
    ref: 'Hotel' // Referencia al modelo Hotel
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true
  },
  minimumStay: {
    type: Number,
    default: 1
  },
  applyToAllRooms: {
    type: Boolean,
    default: true
  },
  applicableRoomTypes: {
    type: [Number],
    default: [] // IDs de los tipos de habitación a los que aplica (si applyToAllRooms=false)
  },
  code: {
    type: String,
    unique: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Método para verificar si la promoción está activa
promotionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

// Método para calcular el precio con descuento
promotionSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  if (!this.isCurrentlyActive()) return originalPrice;
  
  if (this.discountType === 'percentage') {
    return originalPrice * (1 - this.discountValue / 100);
  } else {
    return Math.max(0, originalPrice - this.discountValue);
  }
};

// Verificar si el modelo ya existe
const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;