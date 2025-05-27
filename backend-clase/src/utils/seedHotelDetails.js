const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const HotelDetail = require('../models/HotelDetail');
require('dotenv').config();

// Función para generar descripciones y detalles aleatorios para los hoteles
const generateHotelDetails = async () => {
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
    
    // Limpiar detalles existentes (opcional)
    // await HotelDetail.deleteMany({});
    // console.log('Detalles de hoteles existentes eliminados');

    // Crear un array para almacenar todos los detalles de hoteles
    const hotelDetails = [];

    // Para cada hotel, crear detalles relacionados
    for (const hotel of hotels) {
      // Verificar si ya existen detalles para este hotel
      const existingDetail = await HotelDetail.findOne({ hotelId: hotel.id });
      if (existingDetail) {
        console.log(`Los detalles para el hotel ${hotel.name} ya existen. Omitiendo...`);
        continue;
      }

      // Generamos descripciones y detalles de amenidades basados en la información del hotel
      const amenityDetails = hotel.amenities.map(amenity => {
        const descriptions = {
          'Wi-Fi': 'Conexión Wi-Fi de alta velocidad disponible en todas las áreas del hotel para que siempre estés conectado.',
          'Piscina': 'Disfruta de nuestra espectacular piscina con áreas de descanso y servicio de bebidas.',
          'Spa': 'Centro de bienestar y relajación con tratamientos exclusivos para cuerpo y mente.',
          'Restaurante': 'Gastronomía de primera clase con platos locales e internacionales elaborados por chefs reconocidos.',
          'Gimnasio': 'Equipamiento de última generación abierto 24/7 para mantener tu rutina de ejercicios.',
          'Vista al mar': 'Impresionantes vistas al mar desde múltiples áreas del hotel para una experiencia inolvidable.',
          'Desayuno incluido': 'Desayuno buffet completo con opciones saludables, tradicionales e internacionales.',
          'Centro de negocios': 'Espacios equipados con la última tecnología para reuniones y presentaciones profesionales.',
          'Transporte al aeropuerto': 'Servicio de traslado cómodo y puntual desde y hacia el aeropuerto.',
          'Piscina infinita': 'Piscina de borde infinito con vistas panorámicas para una experiencia única.',
          'Spa de lujo': 'Tratamientos exclusivos en un ambiente de relajación total con terapeutas expertos.',
          'Actividades acuáticas': 'Amplia variedad de deportes y actividades acuáticas para toda la familia.',
          'Todo incluido': 'Experiencia sin preocupaciones con todas las comidas, bebidas y actividades incluidas en tu estancia.',
          'Chimenea': 'Acogedoras áreas comunes con chimeneas para disfrutar en días fríos.',
          'Vistas panorámicas': 'Impresionantes vistas panorámicas desde múltiples puntos del hotel.',
          'Desayuno gourmet': 'Experiencia culinaria matutina con productos frescos y preparaciones especiales.',
          'Senderismo': 'Rutas y excursiones guiadas por los alrededores para los amantes de la naturaleza.',
          'Terraza en azotea': 'Espacio exclusivo en la azotea con vistas urbanas y ambiente relajado.',
          'Bar de diseñador': 'Coctelería de autor en un ambiente sofisticado con música seleccionada.',
          'Galería de arte': 'Exposiciones rotativas de artistas locales e internacionales.',
          'Bicicletas gratuitas': 'Servicio de préstamo de bicicletas para explorar los alrededores de manera sostenible.'
        };
        
        const icons = {
          'Wi-Fi': 'wifi',
          'Piscina': 'pool',
          'Spa': 'spa',
          'Restaurante': 'restaurant',
          'Gimnasio': 'fitness_center',
          'Vista al mar': 'beach_access',
          'Desayuno incluido': 'breakfast_dining',
          'Centro de negocios': 'business_center',
          'Transporte al aeropuerto': 'airport_shuttle',
          'Piscina infinita': 'pool',
          'Spa de lujo': 'spa',
          'Actividades acuáticas': 'surfing',
          'Todo incluido': 'all_inclusive',
          'Chimenea': 'fireplace',
          'Vistas panorámicas': 'landscape',
          'Desayuno gourmet': 'breakfast_dining',
          'Senderismo': 'hiking',
          'Terraza en azotea': 'deck',
          'Bar de diseñador': 'local_bar',
          'Galería de arte': 'museum',
          'Bicicletas gratuitas': 'pedal_bike'
        };
        
        return {
          name: amenity,
          description: descriptions[amenity] || `Servicio de ${amenity} disponible para todos nuestros huéspedes.`,
          image: `https://source.unsplash.com/random/800x600/?${amenity.toLowerCase().replace(/\s+/g, '-')}`,
          icon: icons[amenity] || 'star'
        };
      });

      // Generamos descripciones basadas en el tipo de hotel
      let description = '';
      let longDescription = '';
      let policies = [];
      let nearbyAttractions = [];
      
      // Personalización según el nombre/tipo de hotel
      if (hotel.name.includes('Luxury')) {
        description = `${hotel.name} ofrece una experiencia de hospedaje de lujo inigualable con servicios premium y atención personalizada.`;
        longDescription = `Situado en el corazón de la ciudad, ${hotel.name} representa el estándar más alto de hospitalidad. Nuestras instalaciones de clase mundial, habitaciones exquisitamente decoradas y servicio impecable aseguran una estancia memorable. Desde el momento de su llegada, nuestro equipo atento está dedicado a satisfacer todas sus necesidades y superar sus expectativas.`;
        policies = ['Check-in a partir de las 15:00', 'Check-out hasta las 12:00', 'Se permiten mascotas con previo aviso', 'Política de cancelación: 24 horas antes de la llegada'];
        nearbyAttractions = ['Museo de Arte Contemporáneo', 'Teatro Nacional', 'Calle Comercial Principal', 'Parque Central'];
      } else if (hotel.name.includes('Boutique')) {
        description = `${hotel.name} es un acogedor hotel boutique que combina encanto, personalidad y servicio excepcional.`;
        longDescription = `${hotel.name} refleja el carácter único de la zona costera con un diseño elegante y contemporáneo. Cada una de nuestras habitaciones ha sido individualmente decorada para ofrecer una experiencia única y personal. Nuestro personal dedicado está comprometido a brindar un servicio personalizado que hará que su estancia sea inolvidable.`;
        policies = ['Check-in a partir de las 14:00', 'Check-out hasta las 11:00', 'No se permiten mascotas', 'Política de cancelación: 48 horas antes de la llegada'];
        nearbyAttractions = ['Playa Principal', 'Puerto Deportivo', 'Mercado de Artesanías', 'Restaurantes de Mariscos'];
      } else if (hotel.name.includes('Business')) {
        description = `${hotel.name} es la opción perfecta para viajeros de negocios, con comodidades pensadas para el profesional moderno.`;
        longDescription = `Ubicado estratégicamente en el distrito financiero, ${hotel.name} ofrece instalaciones de primera clase para el viajero de negocios exigente. Nuestras salas de reuniones equipadas con tecnología de punta, conectividad Wi-Fi de alta velocidad y servicios de apoyo empresarial garantizan el éxito de sus actividades profesionales durante su estancia.`;
        policies = ['Check-in a partir de las 14:00', 'Check-out hasta las 12:00', 'Se aceptan mascotas pequeñas', 'Política de cancelación: 24 horas antes de la llegada'];
        nearbyAttractions = ['Centro de Convenciones', 'Torres Corporativas', 'Centro Comercial Principal', 'Restaurantes de Negocios'];
      } else if (hotel.name.includes('Resort')) {
        description = `${hotel.name} ofrece una experiencia vacacional completa con amenidades de lujo y actividades para todos.`;
        longDescription = `Escape a un paraíso tropical en ${hotel.name}, donde el lujo se encuentra con la naturaleza. Nuestro resort de clase mundial ofrece habitaciones espaciosas con vistas impresionantes, múltiples opciones gastronómicas, actividades recreativas y un spa de clase mundial. Ya sea para unas vacaciones familiares, una escapada romántica o una reunión especial, nuestro resort es el destino ideal para crear recuerdos inolvidables.`;
        policies = ['Check-in a partir de las 15:00', 'Check-out hasta las 11:00', 'No se permiten mascotas', 'Política de cancelación: 72 horas antes de la llegada'];
        nearbyAttractions = ['Playa Privada', 'Campo de Golf', 'Reserva Natural', 'Deportes Acuáticos'];
      } else if (hotel.name.includes('Mountain')) {
        description = `${hotel.name} es un refugio de montaña que combina comodidad rústica con servicios de lujo.`;
        longDescription = `Anidado en las majestuosas montañas, ${hotel.name} ofrece un escape tranquilo de la vida urbana. Nuestro lodge combina elementos rústicos con comodidades modernas para crear un ambiente acogedor y lujoso. Disfrute de impresionantes vistas panorámicas, aire fresco de montaña, y una variedad de actividades al aire libre durante todo el año.`;
        policies = ['Check-in a partir de las 16:00', 'Check-out hasta las 11:00', 'Se permiten mascotas con cargo adicional', 'Política de cancelación: 48 horas antes de la llegada'];
        nearbyAttractions = ['Senderos de Montaña', 'Mirador Panorámico', 'Lago Alpine', 'Pueblo Histórico'];
      } else if (hotel.name.includes('Urban')) {
        description = `${hotel.name} es un hotel de diseño contemporáneo en el corazón del distrito cultural de la ciudad.`;
        longDescription = `${hotel.name} redefine la experiencia urbana de hospedaje con su arquitectura vanguardista y diseño interior que celebra el arte y la creatividad. Ubicado en el vibrante distrito cultural, nuestro hotel es un punto de partida ideal para explorar galerías, teatros y la escena gastronómica local. Cada espacio ha sido cuidadosamente diseñado para inspirar y deleitar a nuestros huéspedes.`;
        policies = ['Check-in a partir de las 15:00', 'Check-out hasta las 12:00', 'Se permiten mascotas pequeñas', 'Política de cancelación: 24 horas antes de la llegada'];
        nearbyAttractions = ['Galería de Arte Moderno', 'Distrito de Diseño', 'Tiendas Boutique', 'Cafés Artesanales'];
      } else {
        description = `${hotel.name} ofrece una experiencia de hospedaje excepcional con comodidades modernas y servicio atento.`;
        longDescription = `Disfrute de una estancia inolvidable en ${hotel.name}, donde la comodidad se encuentra con la elegancia. Nuestras instalaciones bien mantenidas, habitaciones espaciosas y personal amable están diseñados para hacer que su visita sea perfecta, ya sea por negocios o placer.`;
        policies = ['Check-in a partir de las 15:00', 'Check-out hasta las 12:00', 'Políticas de mascotas variables', 'Política de cancelación estándar'];
        nearbyAttractions = ['Atracciones Locales', 'Restaurantes Populares', 'Zonas Comerciales', 'Parques y Áreas Recreativas'];
      }

      // Crear un array de imágenes adicionales basadas en el tipo de hotel
      const additionalImages = [
        `https://source.unsplash.com/random/1200x800/?${hotel.name.toLowerCase().replace(/\s+/g, '-')},hotel,room`,
        `https://source.unsplash.com/random/1200x800/?${hotel.name.toLowerCase().replace(/\s+/g, '-')},hotel,lobby`,
        `https://source.unsplash.com/random/1200x800/?${hotel.name.toLowerCase().replace(/\s+/g, '-')},hotel,restaurant`,
        `https://source.unsplash.com/random/1200x800/?${hotel.name.toLowerCase().replace(/\s+/g, '-')},hotel,suite`
      ];

      // Crear el objeto de detalles del hotel
      const hotelDetail = new HotelDetail({
        hotelId: hotel.id,
        description,
        longDescription,
        additionalImages,
        checkIn: '15:00',
        checkOut: '12:00',
        policies,
        amenityDetails,
        nearbyAttractions,
        contactInfo: {
          phone: `+52 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          email: `info@${hotel.name.toLowerCase().replace(/\s+/g, '-')}.com`,
          website: `https://www.${hotel.name.toLowerCase().replace(/\s+/g, '-')}.com`
        }
      });

      hotelDetails.push(hotelDetail);
    }

    // Guardar todos los detalles de hoteles en la base de datos
    if (hotelDetails.length > 0) {
      await HotelDetail.insertMany(hotelDetails);
      console.log(`¡Se han agregado detalles para ${hotelDetails.length} hoteles a la base de datos!`);
    } else {
      console.log('No se agregaron nuevos detalles de hoteles.');
    }

    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB Atlas');

  } catch (error) {
    console.error('Error al generar detalles de hoteles:', error);
    await mongoose.disconnect();
  }
};

// Ejecutar la función
generateHotelDetails();