const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
require('dotenv').config();

const seedHotels = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');

    // Limpiar hoteles existentes (opcional - descomenta si quieres eliminar hoteles existentes)
    // await Hotel.deleteMany({});
    // console.log('Hoteles existentes eliminados');

    // Datos de hoteles desde Dashboard.jsx
    const hotelsData = [
      {
        id: 1,
        name: "Grand Hotel Luxury",
        location: "Centro Histórico, Ciudad",
        rating: 4.8,
        price: 2800,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        amenities: ["Wi-Fi", "Piscina", "Spa", "Restaurante", "Gimnasio"]
      },
      {
        id: 2,
        name: "Boutique Hotel Marina",
        location: "Zona Costera, Ciudad",
        rating: 4.6,
        price: 2200,
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        amenities: ["Wi-Fi", "Piscina", "Vista al mar", "Desayuno incluido"]
      },
      {
        id: 3,
        name: "Business Plaza Hotel",
        location: "Distrito Financiero, Ciudad",
        rating: 4.4,
        price: 1950,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        amenities: ["Wi-Fi", "Centro de negocios", "Restaurante", "Transporte al aeropuerto"]
      },
      {
        id: 4,
        name: "Resort & Spa Paradise",
        location: "Playa Hermosa, Ciudad",
        rating: 4.9,
        price: 3500,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1349&q=80",
        amenities: ["Wi-Fi", "Piscina infinita", "Spa de lujo", "Actividades acuáticas", "Todo incluido"]
      },
      {
        id: 5,
        name: "Mountain View Lodge",
        location: "Sierra Alta, Ciudad",
        rating: 4.7,
        price: 2600,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        amenities: ["Wi-Fi", "Chimenea", "Vistas panorámicas", "Desayuno gourmet", "Senderismo"]
      },
      {
        id: 6,
        name: "Urban Design Suites",
        location: "Zona Cultural, Ciudad",
        rating: 4.5,
        price: 2100,
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        amenities: ["Wi-Fi", "Terraza en azotea", "Bar de diseñador", "Galería de arte", "Bicicletas gratuitas"]
      }
    ];

    // Insertar los hoteles en la base de datos
    await Hotel.insertMany(hotelsData);
    console.log(`¡Se han agregado ${hotelsData.length} hoteles a la base de datos!`);

    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB Atlas');

  } catch (error) {
    console.error('Error al generar hoteles:', error);
  }
};

// Ejecutar la función
seedHotels();