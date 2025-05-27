const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
require('dotenv').config();

const seedRooms = async () => {
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

    // Limpiar habitaciones existentes (opcional)
    // await Room.deleteMany({});
    // console.log('Habitaciones existentes eliminadas');

    // Datos base de los tipos de habitaciones desde Reserva.jsx
    const baseRoomTypes = [
      { id: 1, name: 'Estándar', price: 0, available: 5 },
      { id: 2, name: 'Superior', price: 500, available: 3 },
      { id: 3, name: 'Suite', price: 1200, available: 2 },
      { id: 4, name: 'Suite Presidencial', price: 2500, available: 1 }
    ];

    // Datos de los servicios extra desde Reserva.jsx
    const baseExtraServices = [
      { id: 'laundry', name: 'Servicio de Lavandería', price: 250 },
      { id: 'minibar', name: 'Frigobar Premium', price: 350 },
      { id: 'roomService', name: 'Servicio al Cuarto 24h', price: 200 },
      { id: 'spa', name: 'Acceso al Spa', price: 500 },
      { id: 'breakfast', name: 'Desayuno Buffet', price: 180 }
    ];

    // Servicios incluidos por tipo de habitación
    const includedServices = {
      1: [
        { name: 'Wi-Fi', description: 'Internet de alta velocidad', icon: 'wifi' },
        { name: 'TV', description: 'Televisión por cable', icon: 'tv' },
        { name: 'Baño privado', description: 'Con amenidades básicas', icon: 'bathtub' }
      ],
      2: [
        { name: 'Wi-Fi', description: 'Internet de alta velocidad', icon: 'wifi' },
        { name: 'TV', description: 'Televisión por cable con canales premium', icon: 'tv' },
        { name: 'Baño privado', description: 'Con amenidades de lujo', icon: 'bathtub' },
        { name: 'Minibar básico', description: 'Con bebidas no alcohólicas', icon: 'kitchen' }
      ],
      3: [
        { name: 'Wi-Fi', description: 'Internet de alta velocidad', icon: 'wifi' },
        { name: 'TV', description: 'Smart TV con servicios de streaming', icon: 'tv' },
        { name: 'Baño de lujo', description: 'Con tina y amenidades premium', icon: 'spa' },
        { name: 'Minibar completo', description: 'Con selección de bebidas y snacks', icon: 'liquor' },
        { name: 'Área de estar', description: 'Sala independiente', icon: 'weekend' }
      ],
      4: [
        { name: 'Wi-Fi', description: 'Internet de alta velocidad', icon: 'wifi' },
        { name: 'TV', description: 'Smart TVs en dormitorio y sala', icon: 'tv' },
        { name: 'Baño de lujo', description: 'Con jacuzzi y amenidades premium', icon: 'hot_tub' },
        { name: 'Minibar premium', description: 'Con selección exclusiva de bebidas y snacks', icon: 'liquor' },
        { name: 'Sala y comedor', description: 'Áreas separadas', icon: 'chair' },
        { name: 'Servicio de mayordomo', description: '24 horas', icon: 'room_service' },
        { name: 'Área de trabajo', description: 'Escritorio con ergonomía', icon: 'computer' }
      ]
    };

    // Descripciones por tipo de habitación
    const roomDescriptions = {
      1: 'Habitación confortable con todas las comodidades básicas para una estancia agradable.',
      2: 'Habitación espaciosa con vistas privilegiadas y amenidades mejoradas para mayor confort.',
      3: 'Suite elegante con sala de estar separada, ideal para estancias prolongadas o viajes especiales.',
      4: 'Nuestra habitación más exclusiva y lujosa, con múltiples ambientes y servicio personalizado.'
    };

    // Metros cuadrados por tipo
    const squareMeters = {
      1: 25,
      2: 35,
      3: 55,
      4: 85
    };

    // Capacidad por tipo
    const capacity = {
      1: 2,
      2: 2,
      3: 3,
      4: 4
    };

    // Camas por tipo
    const beds = {
      1: '1 cama queen size o 2 camas individuales',
      2: '1 cama king size o 2 camas queen size',
      3: '1 cama king size y 1 sofá cama',
      4: '1 cama king size en dormitorio principal, 2 camas queen size en dormitorio secundario'
    };

    // Array para almacenar todas las habitaciones
    const roomsToInsert = [];

    // Para cada hotel, crear habitaciones
    for (const hotel of hotels) {
      // Para cada tipo de habitación
      for (const baseType of baseRoomTypes) {
        // Verificar si ya existe este tipo para este hotel
        const existingRoom = await Room.findOne({ 
          hotelId: hotel.id,
          typeId: baseType.id
        });

        if (existingRoom) {
          console.log(`El tipo de habitación ${baseType.name} ya existe para el hotel ${hotel.name}. Omitiendo...`);
          continue;
        }

        // Generar números de habitación basados en el tipo
        const roomNumbers = [];
        for (let i = 1; i <= baseType.available; i++) {
          let roomNumber;
          switch (baseType.id) {
            case 1:
              roomNumber = `10${i}`; // 101, 102, etc.
              break;
            case 2:
              roomNumber = `20${i}`; // 201, 202, etc.
              break;
            case 3:
              roomNumber = `30${i}`; // 301, 302, etc.
              break;
            case 4:
              roomNumber = `40${i}`; // 401, 402, etc.
              break;
            default:
              roomNumber = `${baseType.id}0${i}`;
          }
          roomNumbers.push({
            roomNumber,
            isAvailable: true,
            isReserved: false,
            reservedUntil: null
          });
        }

        // Crear objeto de habitación
        const room = new Room({
          hotelId: hotel.id,
          typeId: baseType.id,
          name: baseType.name,
          description: roomDescriptions[baseType.id],
          basePrice: hotel.price + baseType.price, // Precio base del hotel + suplemento por tipo
          capacity: capacity[baseType.id],
          beds: beds[baseType.id],
          squareMeters: squareMeters[baseType.id],
          mainImage: `https://source.unsplash.com/random/800x600/?hotel,room,${baseType.name.toLowerCase().replace(/\s+/g, '-')}`,
          images: [
            `https://source.unsplash.com/random/800x600/?hotel,bedroom,${baseType.name.toLowerCase().replace(/\s+/g, '-')}`,
            `https://source.unsplash.com/random/800x600/?hotel,bathroom,luxury`,
            `https://source.unsplash.com/random/800x600/?hotel,view,${hotel.name.toLowerCase().replace(/\s+/g, '-')}`
          ],
          services: includedServices[baseType.id] || [],
          extraServices: baseExtraServices,
          availability: {
            total: baseType.available,
            available: baseType.available,
            rooms: roomNumbers
          }
        });

        roomsToInsert.push(room);
      }
    }

    // Insertar todas las habitaciones en la base de datos
    if (roomsToInsert.length > 0) {
      await Room.insertMany(roomsToInsert);
      console.log(`¡Se han agregado ${roomsToInsert.length} tipos de habitaciones a la base de datos!`);
    } else {
      console.log('No se añadieron nuevas habitaciones.');
    }

    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB Atlas');

  } catch (error) {
    console.error('Error al generar habitaciones:', error);
    await mongoose.disconnect();
  }
};

// Ejecutar la función
seedRooms();