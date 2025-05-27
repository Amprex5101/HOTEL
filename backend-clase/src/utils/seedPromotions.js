const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Promotion = require('../models/Promotion');
require('dotenv').config();

const generatePromotionCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitimos caracteres confusos como O, 0, 1, I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const seedPromotions = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');

    // Obtener todos los hoteles de la base de datos
    const hotels = await Hotel.find();
    
    if (hotels.length === 0) {
      console.log('No se encontraron hoteles en la base de datos. Ejecute primero seedHotels.js');
      await mongoose.disconnect();
      return;
    }

    // Limpiar promociones existentes (opcional)
    // await Promotion.deleteMany({});
    // console.log('Promociones existentes eliminadas');

    // Generar promociones diferentes para cada hotel
    const promotions = [];

    // Fechas base para las promociones
    const now = new Date();
    
    // 1. Promociones futuras (comienzan en 7 días)
    const futureStartDate = new Date(now);
    futureStartDate.setDate(now.getDate() + 7);
    
    const futureEndDate = new Date(futureStartDate);
    futureEndDate.setMonth(futureEndDate.getMonth() + 1);
    
    // 2. Promociones activas (comienzan hoy)
    const activeStartDate = new Date(now);
    
    const activeEndDate = new Date(activeStartDate);
    activeEndDate.setDate(activeEndDate.getDate() + 14);
    
    // 3. Promociones pasadas (terminaron hace 7 días)
    const pastStartDate = new Date(now);
    pastStartDate.setMonth(pastStartDate.getMonth() - 2);
    
    const pastEndDate = new Date(now);
    pastEndDate.setDate(pastEndDate.getDate() - 7);

    for (const hotel of hotels) {
      // 1. Promoción de temporada (futura)
      const seasonalPromotion = new Promotion({
        hotelId: hotel.id,
        name: 'Promoción de Temporada',
        description: `Ahorra un 15% en tu estancia en ${hotel.name} durante la próxima temporada.`,
        startDate: futureStartDate,
        endDate: futureEndDate,
        discountType: 'percentage',
        discountValue: 15,
        minimumStay: 2,
        applyToAllRooms: true,
        code: `TEMP-${generatePromotionCode()}`,
        image: 'https://source.unsplash.com/random/800x600/?vacation,season',
        isActive: true
      });
      
      // 2. Promoción de reserva anticipada (activa)
      const earlyBookingPromotion = new Promotion({
        hotelId: hotel.id,
        name: 'Reserva Anticipada',
        description: `Reserva con al menos 30 días de anticipación y obtén un 20% de descuento en ${hotel.name}.`,
        startDate: activeStartDate,
        endDate: activeEndDate,
        discountType: 'percentage',
        discountValue: 20,
        minimumStay: 3,
        applyToAllRooms: false,
        applicableRoomTypes: [2, 3, 4], // Solo aplica a habitaciones Superior, Suite y Suite Presidencial
        code: `EARLY-${generatePromotionCode()}`,
        image: 'https://source.unsplash.com/random/800x600/?calendar,planning',
        isActive: true
      });
      
      // 3. Promoción de último minuto (activa, con valor fijo)
      const lastMinutePromotion = new Promotion({
        hotelId: hotel.id,
        name: 'Oferta de Último Minuto',
        description: `¡Descuento fijo de $500 para reservas en los próximos 7 días en ${hotel.name}!`,
        startDate: activeStartDate,
        endDate: new Date(activeStartDate.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 días desde hoy
        discountType: 'fixed',
        discountValue: 500,
        minimumStay: 1,
        applyToAllRooms: true,
        code: `LAST-${generatePromotionCode()}`,
        image: 'https://source.unsplash.com/random/800x600/?clock,hurry',
        isActive: true
      });
      
      // 4. Promoción expirada (histórica)
      const expiredPromotion = new Promotion({
        hotelId: hotel.id,
        name: 'Oferta de Verano',
        description: `Oferta especial de verano con 25% de descuento en ${hotel.name}.`,
        startDate: pastStartDate,
        endDate: pastEndDate,
        discountType: 'percentage',
        discountValue: 25,
        minimumStay: 2,
        applyToAllRooms: true,
        code: `SUMMER-${generatePromotionCode()}`,
        image: 'https://source.unsplash.com/random/800x600/?summer,beach',
        isActive: false // La marcamos como inactiva
      });

      promotions.push(seasonalPromotion, earlyBookingPromotion, lastMinutePromotion, expiredPromotion);
    }

    // Verificar si ya existen promociones
    const existingPromotions = await Promotion.countDocuments();
    if (existingPromotions > 0) {
      console.log(`Ya existen ${existingPromotions} promociones en la base de datos.`);
      console.log('Si deseas reemplazarlas, descomenta la línea para eliminar promociones existentes.');
    } else {
      // Guardar todas las promociones en la base de datos
      await Promotion.insertMany(promotions);
      console.log(`¡Se han agregado ${promotions.length} promociones a la base de datos!`);
    }

    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB Atlas');

  } catch (error) {
    console.error('Error al generar promociones:', error);
    await mongoose.disconnect();
  }
};

// Ejecutar la función
seedPromotions();