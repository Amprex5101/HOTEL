const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const generateRandomDate = () => {
  // Generar una fecha aleatoria en los últimos 30 días
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateUsers = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');

    // Limpiar usuarios existentes (opcional - descomenta si quieres eliminar usuarios existentes)
    // await User.deleteMany({});
    // console.log('Usuarios existentes eliminados');

    // Contraseña común encriptada
    const hashedPassword = await bcrypt.hash('123123', 10);

    // Array para almacenar todos los usuarios
    const users = [];

    // Crear 100 usuarios
    for (let i = 1; i <= 100; i++) {
      const username = `usuario${i}`;
      const name = `Usuario de Prueba ${i}`;
      const email = `correoprueba${i}@gmail.com`;

      // Asignar roles diferentes para tener variedad
      let role;
      if (i === 1) {
        role = 'admin'; // El primero será admin
      } else if (i % 20 === 0) {
        role = 'moderator'; // Cada 20 usuarios será moderador
      } else if (i % 10 === 0) {
        role = 'editor'; // Cada 10 usuarios será editor
      } else {
        role = 'user'; // El resto serán usuarios normales
      }

      // Crear usuario
      const user = new User({
        username,
        password: hashedPassword,
        name,
        email,
        role,
        avatar: '', // Sin avatar por defecto
        lastLogin: generateRandomDate()
      });

      users.push(user);
    }

    // Guardar todos los usuarios en la base de datos
    await User.insertMany(users);
    console.log(`¡Se han agregado 100 usuarios de prueba a la base de datos!`);

    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB Atlas');

  } catch (error) {
    console.error('Error al generar usuarios de prueba:', error);
  }
};

// Ejecutar la función
generateUsers();