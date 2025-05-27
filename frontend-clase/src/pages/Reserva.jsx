import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import axios from 'axios';
import './Reserva.css';

function Reserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [hotelDetail, setHotelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Estados para el formulario de pago
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    errors: {}
  });
  
  // Tipos de habitación disponibles
  const [roomTypes, setRoomTypes] = useState([
    { id: 1, name: 'Estándar', price: 0, available: 5 },
    { id: 2, name: 'Superior', price: 500, available: 3 },
    { id: 3, name: 'Suite', price: 1200, available: 2 },
    { id: 4, name: 'Suite Presidencial', price: 2500, available: 1 }
  ]);
  
  // Servicios extras disponibles
  const extraServices = [
    { id: 'laundry', name: 'Servicio de Lavandería', price: 250 },
    { id: 'minibar', name: 'Frigobar Premium', price: 350 },
    { id: 'roomService', name: 'Servicio al Cuarto 24h', price: 200 },
    { id: 'spa', name: 'Acceso al Spa', price: 500 },
    { id: 'breakfast', name: 'Desayuno Buffet', price: 180 }
  ];
  
  // Estado para la reserva
  const [booking, setBooking] = useState({
    roomType: 1,
    checkIn: '',
    checkOut: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    extraServices: [],
    specialRequests: '',
    totalPrice: 0,
    reservationNumber: '',
    roomNumber: ''
  });

  // Añade al inicio de tu componente Reserva un estado para almacenar las habitaciones disponibles
  const [availableRooms, setAvailableRooms] = useState({});
  
  // Cargar datos del hotel desde la API
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener información básica del hotel
        const hotelResponse = await axios.get(`http://localhost:3000/api/hotels/${id}`);
        if (!hotelResponse.data) {
          throw new Error('Hotel no encontrado');
        }
        
        const hotelData = hotelResponse.data;
        setHotel(hotelData);
        
        // Inicializar el precio base con el precio del hotel
        setBooking(prev => ({
          ...prev,
          totalPrice: hotelData.price
        }));
        
        // Obtener detalles extendidos del hotel
        const detailResponse = await axios.get(`http://localhost:3000/api/hotel-details?hotelId=${id}`);
        if (detailResponse.data) {
          setHotelDetail(detailResponse.data);
          
          // Rellenar las fechas del formulario si hay información de booking en sessionStorage
          const bookingInfo = JSON.parse(sessionStorage.getItem('bookingInfo') || '{}');
          if (bookingInfo.hotelId === parseInt(id) && bookingInfo.checkIn && bookingInfo.checkOut) {
            setBooking(prev => ({
              ...prev,
              checkIn: bookingInfo.checkIn || '',
              checkOut: bookingInfo.checkOut || '',
              guests: bookingInfo.guests || 2
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del hotel:', error);
        setError('Error al cargar información del hotel: ' + (error.message || 'Inténtelo de nuevo más tarde'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotelData();
  }, [id]);
  
  // Calcular duración de la estancia
  const calculateNights = () => {
    if (!booking.checkIn || !booking.checkOut) return 0;
    
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return nights > 0 ? nights : 0;
  };
  
  // Calcular precio total
  useEffect(() => {
    if (!hotel) return;
    
    const nights = calculateNights();
    const selectedRoom = roomTypes.find(room => room.id === parseInt(booking.roomType));
    const roomPrice = selectedRoom ? hotel.price + selectedRoom.price : hotel.price;
    
    // Calcular costo de los extras
    const extrasCost = booking.extraServices.reduce((total, service) => {
      const extraService = extraServices.find(s => s.id === service);
      return total + (extraService ? extraService.price : 0);
    }, 0);
    
    // Precio total: (precio base de habitación × noches) + extras
    const total = (roomPrice * nights) + extrasCost;
    
    setBooking(prev => ({
      ...prev,
      totalPrice: nights > 0 ? total : roomPrice
    }));
  }, [hotel, booking.roomType, booking.checkIn, booking.checkOut, booking.extraServices]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'extraServices') {
      const serviceId = value;
      setBooking(prev => {
        if (checked) {
          return { ...prev, extraServices: [...prev.extraServices, serviceId] };
        } else {
          return { ...prev, extraServices: prev.extraServices.filter(id => id !== serviceId) };
        }
      });
    } else {
      setBooking(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Generar número aleatorio para la reserva
  const generateReservationNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RES-${random}${timestamp}`;
  };

  // Función para generar un número de habitación según el tipo
  const getRoomNumber = (roomTypeId) => {
    const typeId = parseInt(roomTypeId);
    const availableForType = availableRooms[typeId] || [];
    
    // Si tenemos habitaciones disponibles en la base de datos, elegimos una al azar
    if (availableForType.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableForType.length);
      return availableForType[randomIndex];
    }
    
    // Si no hay habitaciones disponibles en la base de datos, usamos el método original
    switch (typeId) {
      case 1: // Estándar
        return `10${Math.floor(Math.random() * 10) + 1}`; // 101-110
      case 2: // Superior
        return `20${Math.floor(Math.random() * 10) + 1}`; // 201-210
      case 3: // Suite
        return `30${Math.floor(Math.random() * 5) + 1}`; // 301-305
      case 4: // Suite Presidencial
        return `40${Math.floor(Math.random() * 2) + 1}`; // 401-402
      default:
        return '101';
    }
  };

  // Modificar el handleSubmit para validar la disponibilidad real

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Fetch available rooms first if we have dates
  if (hotel && booking.checkIn && booking.checkOut) {
    try {
      const response = await axios.post(`http://localhost:3000/api/hotels/${id}/check-availability`, {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests
      });
      
      // Process room availability data
      const roomsByType = {};
      response.data.forEach(room => {
        if (!roomsByType[room.typeId]) {
          roomsByType[room.typeId] = [];
        }
        
        const availableRoomNumbers = room.availability.rooms
          .filter(r => r.isAvailable && !r.isReserved)
          .map(r => r.roomNumber);
        
        roomsByType[room.typeId] = availableRoomNumbers;
      });
      
      setAvailableRooms(roomsByType);
      
      // Update room types with actual availability
      const updatedRoomTypes = roomTypes.map(roomType => ({
        ...roomType,
        available: roomsByType[roomType.id]?.length || 0
      }));
      
      setRoomTypes(updatedRoomTypes);
    } catch (error) {
      console.error('Error al obtener habitaciones disponibles:', error);
    }
  }
  
  // Continue with the existing submit logic
  // Verificar que el tipo de habitación seleccionado tenga disponibilidad
  const selectedRoomType = roomTypes.find(room => room.id === parseInt(booking.roomType));
  if (selectedRoomType && selectedRoomType.available <= 0) {
    alert('Lo sentimos, no hay habitaciones disponibles del tipo seleccionado para las fechas indicadas.');
    return;
  }
  
  // Si hay habitaciones disponibles, obtener un número de habitación disponible
  const roomNumber = getRoomNumber(booking.roomType);
  
  setBooking(prev => ({
    ...prev,
    roomNumber: roomNumber
  }));
  
  // Mostrar formulario de pago
  setShowPaymentForm(true);
};

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    // Formateos especiales para ciertos campos
    if (name === 'cardNumber') {
      // Eliminar espacios y caracteres no numéricos
      const cleaned = value.replace(/\D/g, '');
      // Añadir espacios cada 4 dígitos
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      setCardData(prev => ({
        ...prev,
        [name]: formatted,
        errors: {
          ...prev.errors,
          [name]: ''
        }
      }));
    } 
    else if (name === 'expiryDate') {
      // Solo permitir formato MM/YY
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length > 2) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      }
      
      setCardData(prev => ({
        ...prev,
        [name]: formatted,
        errors: {
          ...prev.errors,
          [name]: ''
        }
      }));
    }
    else if (name === 'cvv') {
      // Solo permitir números para el CVV
      const formatted = value.replace(/\D/g, '');
      
      setCardData(prev => ({
        ...prev,
        [name]: formatted,
        errors: {
          ...prev.errors,
          [name]: ''
        }
      }));
    }
    else {
      setCardData(prev => ({
        ...prev,
        [name]: value,
        errors: {
          ...prev.errors,
          [name]: ''
        }
      }));
    }
  };

  // Función para validar la tarjeta
  const validateCard = () => {
    const errors = {};
    
    if (!cardData.cardNumber.trim())
      errors.cardNumber = 'El número de tarjeta es obligatorio';
    else if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, '')))
      errors.cardNumber = 'Número de tarjeta inválido (debe tener 16 dígitos)';
    
    if (!cardData.cardName.trim())
      errors.cardName = 'El nombre del titular es obligatorio';
    
    if (!cardData.expiryDate.trim())
      errors.expiryDate = 'La fecha de vencimiento es obligatoria';
    else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate))
      errors.expiryDate = 'Formato inválido (MM/YY)';
    
    if (!cardData.cvv.trim())
      errors.cvv = 'El CVV es obligatorio';
    else if (!/^\d{3,4}$/.test(cardData.cvv))
      errors.cvv = 'CVV inválido';
    
    return errors;
  };

  // Función para procesar el pago
const processPayment = () => {
  const errors = validateCard();
  
  if (Object.keys(errors).length > 0) {
    setCardData(prev => ({
      ...prev,
      errors
    }));
    return;
  }
  
  // Iniciar animación de procesamiento
  setIsProcessingPayment(true);
  
  // Simulamos un tiempo de procesamiento
  setTimeout(() => {
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    
    // Generamos el número de reserva
    const reservationNumber = generateReservationNumber();
    const roomNumber = getRoomNumber(booking.roomType);
    
    setBooking(prev => ({
      ...prev,
      reservationNumber: reservationNumber,
      roomNumber: roomNumber
    }));
    
    // Mostramos la confirmación final después de un breve momento
    setTimeout(async () => {
      setShowPaymentForm(false);
      
      // Intentar guardar la reserva antes de mostrar confirmación
      const saveSuccess = await saveReservationToDatabase(reservationNumber);
      
      if (saveSuccess) {
        console.log('✅ Reserva registrada en el servidor correctamente');
      } else {
        console.log('⚠️ La reserva se guardó localmente debido a un problema con el servidor');
        // Aquí podrías mostrar una alerta al usuario de que la reserva se guardó localmente
      }
      
      // Mostrar confirmación de todos modos (éxito o fallo), ya que el pago fue aceptado
      setShowConfirmation(true);
      
    }, 1500);
  }, 3000);
};

  // Función para guardar la reserva en la base de datos
const saveReservationToDatabase = async (reservationNumber) => {
  // Preparar datos de reserva - definir la variable temprano para que esté disponible en todo el ámbito
  let reservaData;
  
  try {
    // Obtener el tipo de habitación seleccionado
    const selectedRoom = roomTypes.find(room => room.id === parseInt(booking.roomType));
    
    // Preparar los servicios extras en el formato que espera el backend
    const formattedExtraServices = booking.extraServices.map(serviceId => {
      const service = extraServices.find(s => s.id === serviceId);
      return {
        id: service.id,
        name: service.name,
        price: service.price
      };
    });
    
    // Obtener username del localStorage o usar un valor predeterminado
    const username = localStorage.getItem('username') || booking.firstName || "guest";
    
    // Crear el objeto de reserva para enviar al backend
    reservaData = {
      hotelId: parseInt(id),
      hotelName: hotel.name,
      roomType: {
        id: selectedRoom.id,
        name: selectedRoom.name,
        price: selectedRoom.price
      },
      roomNumber: booking.roomNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: calculateNights(),
      cliente: {
        username: username,
        firstName: booking.firstName || "Huésped",
        lastName: booking.lastName || "Anónimo",
        email: booking.email || "guest@example.com",
        phone: booking.phone || "0000000000"
      },
      guests: parseInt(booking.guests) || 1,
      extraServices: formattedExtraServices,
      specialRequests: booking.specialRequests || "",
      totalPrice: booking.totalPrice,
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      status: 'confirmed',
      reservationNumber: reservationNumber
    };
    
    console.log('Enviando datos de reserva:', reservaData);
    
    // Enviar los datos al endpoint correcto de la API
    const response = await axios.post('http://localhost:3000/api/reservas', reservaData);
    
    console.log('Reserva guardada exitosamente:', response.data);
    
    // Después de guardar la reserva exitosamente, actualizar la disponibilidad de la habitación
if (response.data && response.data.reserva) {
  try {
    // Usar el id del componente en lugar de hotelId
    const roomResponse = await axios.get(`http://localhost:3000/api/hotels/${id}/rooms`);
    const rooms = roomResponse.data;
    const selectedRoomType = rooms.find(room => room.typeId === parseInt(booking.roomType));
    
    if (selectedRoomType) {
      // Actualiza la disponibilidad de la habitación específica
      await axios.patch(`http://localhost:3000/api/rooms/${selectedRoomType._id}/availability`, {
        roomNumber: reservaData.roomNumber,
        isAvailable: false,
        isReserved: true,
        reservedUntil: booking.checkOut
      });
      
      console.log('Estado de la habitación actualizado correctamente');
    }
  } catch (availabilityError) {
    console.error('Error al actualizar disponibilidad de la habitación:', availabilityError);
  }
}
    
    return true;
    
  } catch (error) {
    console.error('Error al guardar la reserva:', error);
    
    if (error.response) {
      console.error('Datos de la respuesta de error:', error.response.data);
      console.error('Estado del error:', error.response.status);
      
      // Si el error es "Habitación no disponible", intentemos con otro número de habitación
      if (error.response.data.message === 'Habitación no disponible' && reservaData) {
        try {
          // Generar un nuevo número de habitación
          const newRoomNumber = getRoomNumber(booking.roomType);
          console.log(`Intentando con otra habitación: ${newRoomNumber}`);
          
          // Actualizar la reserva con el nuevo número de habitación
          reservaData.roomNumber = newRoomNumber;
          
          // Intentar nuevamente con el nuevo número de habitación
          const retryResponse = await axios.post('http://localhost:3000/api/reservas', reservaData);
          console.log('Reserva guardada exitosamente con nueva habitación:', retryResponse.data);
          return true;
        } catch (retryError) {
          console.error('Error en segundo intento:', retryError);
        }
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error al configurar la petición:', error.message);
    }
    
    // Guardar localmente como respaldo si la API falla
    if (reservaData) {
      try {
        const localReservations = JSON.parse(localStorage.getItem('localReservations') || '[]');
        const reservationWithTimestamp = {
          ...reservaData,
          createdAt: new Date().toISOString()
        };
        localReservations.push(reservationWithTimestamp);
        localStorage.setItem('localReservations', JSON.stringify(localReservations));
        console.log('Reserva guardada localmente como respaldo');
      } catch (localStorageError) {
        console.error('Error al guardar en localStorage:', localStorageError);
      }
    } else {
      console.error('No se pudo guardar localmente: datos de reserva no definidos');
    }
    
    return false;
  }
};

  // Generar PDF con los detalles de la reserva
  const generatePDF = () => {
    const doc = new jsPDF();
    const selectedRoom = roomTypes.find(room => room.id === parseInt(booking.roomType));
    
    // Estilo del documento
    doc.setFontSize(22);
    doc.setTextColor(63, 81, 181);
    doc.text("Confirmación de Reserva", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Logo y header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 25, 180, 10, "F");
    doc.setFontSize(10);
    doc.text("RESERVACIÓN #" + booking.reservationNumber, 105, 31, { align: "center" });
    
    // Detalles del hotel
    doc.setFontSize(16);
    doc.text(hotel.name, 20, 45);
    doc.setFontSize(11);
    doc.text(hotel.location, 20, 52);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);
    
    // Detalles de la reserva
    doc.setFontSize(12);
    doc.text("Detalles de Reserva", 20, 68);
    
    doc.setFontSize(10);
    doc.text("Huésped:", 20, 78);
    doc.text(booking.firstName + " " + booking.lastName, 60, 78);
    
    doc.text("Correo electrónico:", 20, 85);
    doc.text(booking.email, 60, 85);
    
    doc.text("Teléfono:", 20, 92);
    doc.text(booking.phone, 60, 92);
    
    doc.text("Check-in:", 20, 102);
    doc.text(booking.checkIn, 60, 102);
    
    doc.text("Check-out:", 120, 102);
    doc.text(booking.checkOut, 160, 102);
    
    doc.text("Duración:", 20, 109);
    doc.text(calculateNights() + " noches", 60, 109);
    
    doc.text("Huéspedes:", 120, 109);
    doc.text(booking.guests + "", 160, 109);
    
    doc.text("Tipo de habitación:", 20, 116);
    doc.text(selectedRoom.name, 60, 116);
    
    // Usar booking.roomNumber en lugar de generar uno nuevo
    doc.text("Número de habitación:", 120, 116);
    doc.text(booking.roomNumber, 170, 116);
    
    // Línea separadora
    doc.line(20, 123, 190, 123);
    
    // Servicios adicionales
    if (booking.extraServices.length > 0) {
      doc.text("Servicios adicionales:", 20, 133);
      let y = 140;
      
      booking.extraServices.forEach(serviceId => {
        const service = extraServices.find(s => s.id === serviceId);
        doc.text("• " + service.name, 25, y);
        doc.text("$" + service.price, 150, y);
        y += 7;
      });
      
      // Línea separadora
      doc.line(20, y + 3, 190, y + 3);
      y += 13;
      
      // Resumen de precio - AJUSTADO PARA EVITAR SOBREPOSICIÓN
      doc.text("Precio base:", 100, y); // Movido a la izquierda
      doc.text("$" + (hotel.price * calculateNights()), 180, y, { align: "right" }); // Movido más a la derecha
      
      if (selectedRoom.price > 0) {
        y += 7;
        doc.text("Suplemento habitación:", 100, y); // Movido a la izquierda
        doc.text("$" + (selectedRoom.price * calculateNights()), 180, y, { align: "right" }); // Movido más a la derecha
      }
      
      y += 7;
      doc.text("Servicios adicionales:", 100, y); // Movido a la izquierda
      
      const extrasCost = booking.extraServices.reduce((total, service) => {
        const extraService = extraServices.find(s => s.id === service);
        return total + (extraService ? extraService.price : 0);
      }, 0);
      
      doc.text("$" + extrasCost, 180, y, { align: "right" }); // Movido más a la derecha
      
      // Total
      y += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("TOTAL:", 100, y); // Movido a la izquierda
      doc.text("$" + booking.totalPrice, 180, y, { align: "right" }); // Movido más a la derecha
      
    } else {
      let y = 133;
      
      // Resumen de precio - AJUSTADO PARA EVITAR SOBREPOSICIÓN
      doc.text("Precio base:", 100, y); // Movido a la izquierda
      doc.text("$" + (hotel.price * calculateNights()), 180, y, { align: "right" }); // Movido más a la derecha
      
      if (selectedRoom.price > 0) {
        y += 7;
        doc.text("Suplemento habitación:", 100, y); // Movido a la izquierda
        doc.text("$" + (selectedRoom.price * calculateNights()), 180, y, { align: "right" }); // Movido más a la derecha
      }
      
      // Total
      y += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("TOTAL:", 100, y); // Movido a la izquierda
      doc.text("$" + booking.totalPrice, 180, y, { align: "right" }); // Movido más a la derecha
    }
    
    // Condiciones
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text("Esta reserva está sujeta a los términos y condiciones del hotel. Puede cancelar sin costo hasta 48 horas antes de la llegada.", 105, 270, { align: "center" });
    
    doc.save("reserva-" + booking.reservationNumber + ".pdf");
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando detalles de reserva...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Volver al dashboard
        </button>
      </div>
    );
  }
  
  if (!hotel) {
    return (
      <div className="error-container">
        <h2>Hotel no encontrado</h2>
        <p>Lo sentimos, no pudimos encontrar el hotel que estás buscando.</p>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Volver al dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="booking-container">
      {/* Formulario de Pago con Tarjeta */}
      {showPaymentForm && (
        <div className="confirmation-overlay">
          <div className="payment-modal">
            <div className="payment-header">
              <h2>Pago de Reserva</h2>
            </div>
            
            <div className="payment-content">
              {paymentSuccess ? (
                <div className="payment-success">
                  <div className="success-icon">✓</div>
                  <h3>¡Pago Aprobado!</h3>
                  <p>Su reserva está siendo confirmada...</p>
                </div>
              ) : isProcessingPayment ? (
                <div className="payment-processing">
                  <div className="loader"></div>
                  <p>Procesando pago, por favor espere...</p>
                </div>
              ) : (
                <>
                  <div className="reservation-summary">
                    <h3>{hotel.name}</h3>
                    <div className="summary-key-details">
                      <div>
                        <strong>Check-in:</strong> {booking.checkIn}
                      </div>
                      <div>
                        <strong>Check-out:</strong> {booking.checkOut}
                      </div>
                      <div>
                        <strong>Habitación:</strong> {roomTypes.find(r => r.id === parseInt(booking.roomType))?.name}
                      </div>
                    </div>
                    <div className="payment-amount">
                      <span>Monto total:</span>
                      <span className="amount">${booking.totalPrice}</span>
                    </div>
                  </div>
                  
                  <form className="payment-form" onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
                    <div className="payment-card">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Número de Tarjeta</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={cardData.cardNumber}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {cardData.errors.cardNumber && <span className="error">{cardData.errors.cardNumber}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cardName">Nombre del Titular</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={cardData.cardName}
                          onChange={handleCardChange}
                          placeholder="Como aparece en la tarjeta"
                        />
                        {cardData.errors.cardName && <span className="error">{cardData.errors.cardName}</span>}
                      </div>
                      
                      <div className="card-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Fecha de Vencimiento</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={cardData.expiryDate}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {cardData.errors.expiryDate && <span className="error">{cardData.errors.expiryDate}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength="4"
                          />
                          {cardData.errors.cvv && <span className="error">{cardData.errors.cvv}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="payment-actions">
                      <button type="button" className="cancel-payment" onClick={() => setShowPaymentForm(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="process-payment">
                        Pagar ${booking.totalPrice}
                      </button>
                    </div>
                    
                    <div className="payment-secure-note">
                      <div className="secure-icon">🔒</div>
                      <p>Todos los datos son enviados de forma segura y encriptada</p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Ventana de confirmación */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h2>¡Reserva Confirmada!</h2>
              <span className="reservation-number">#{booking.reservationNumber}</span>
            </div>
            
            <div className="confirmation-content">
              <div className="confirmation-hotel">
                <img src={hotel.image} alt={hotel.name} className="hotel-thumbnail" />
                <div>
                  <h3>{hotel.name}</h3>
                  <p>{hotel.location}</p>
                </div>
              </div>
              
              <div className="confirmation-details">
                <div className="confirmation-row">
                  <div className="confirmation-column">
                    <h4>Detalles de la Estancia</h4>
                    <p><strong>Check-in:</strong> {booking.checkIn}</p>
                    <p><strong>Check-out:</strong> {booking.checkOut}</p>
                    <p><strong>Duración:</strong> {calculateNights()} noches</p>
                    <p><strong>Huéspedes:</strong> {booking.guests}</p>
                    <p><strong>Habitación:</strong> {roomTypes.find(r => r.id === parseInt(booking.roomType))?.name}</p>
                    <p><strong>Número:</strong> {booking.roomNumber}</p>
                  </div>
                  
                  <div className="confirmation-column">
                    <h4>Datos del Huésped</h4>
                    <p><strong>Nombre:</strong> {booking.firstName} {booking.lastName}</p>
                    <p><strong>Email:</strong> {booking.email}</p>
                    <p><strong>Teléfono:</strong> {booking.phone}</p>
                  </div>
                </div>
                
                {booking.extraServices.length > 0 && (
                  <div className="confirmation-services">
                    <h4>Servicios Adicionales</h4>
                    <ul>
                      {booking.extraServices.map(serviceId => {
                        const service = extraServices.find(s => s.id === serviceId);
                        return <li key={serviceId}>{service?.name}</li>;
                      })}
                    </ul>
                  </div>
                )}
                
                <div className="confirmation-price">
                  <h4>Precio Total</h4>
                  <span className="price">${booking.totalPrice}</span>
                </div>
                
                {booking.specialRequests && (
                  <div className="confirmation-requests">
                    <h4>Peticiones Especiales</h4>
                    <p>{booking.specialRequests}</p>
                  </div>
                )}
              </div>
              
              <div className="confirmation-actions">
                <button className="download-button" onClick={generatePDF}>
                  Descargar PDF
                </button>
                <button className="close-button" onClick={() => navigate('/')}>
                  Volver al inicio
                </button>
              </div>
              
              <p className="confirmation-note">
                Hemos enviado un correo de confirmación a {booking.email} con todos los detalles de su reserva.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="booking-header">
        <button className="back-button" onClick={() => navigate(`/ver-mas/${id}`)}>
          ← Volver al hotel
        </button>
        <h1>Reserva en {hotel.name}</h1>
        <p className="hotel-location">{hotel.location}</p>
      </div>
      
      <div className="booking-content">
        <div className="booking-form-container">
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Detalles de la estancia</h2>
              
              <div className="form-row dates">
                <div className="form-group">
                  <label htmlFor="checkIn">Fecha de llegada</label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={booking.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="checkOut">Fecha de salida</label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={booking.checkOut}
                    onChange={handleChange}
                    min={booking.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guests">Número de huéspedes</label>
                  <select
                    id="guests"
                    name="guests"
                    value={booking.guests}
                    onChange={handleChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="roomType">Tipo de habitación</label>
                  <select
                    id="roomType"
                    name="roomType"
                    value={booking.roomType}
                    onChange={handleChange}
                    required
                  >
                    {roomTypes.map(room => (
                      <option 
                        key={room.id} 
                        value={room.id}
                        disabled={room.available < 1}
                      >
                        {room.name} (+${room.price}) - {room.available} disponibles
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section guest-info-section">
              <h2>Información del huésped</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={booking.firstName}
                    onChange={handleChange}
                    placeholder="Ingrese su nombre"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Apellidos</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={booking.lastName}
                    onChange={handleChange}
                    placeholder="Ingrese sus apellidos"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={booking.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={booking.phone}
                    onChange={handleChange}
                    placeholder="Número de contacto"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Servicios adicionales</h2>
              <p className="service-subtitle">Seleccione los servicios que desea agregar a su estancia</p>
              
              <div className="extra-services">
                {extraServices.map(service => (
                  <div className="service-option" key={service.id}>
                    <input
                      type="checkbox"
                      id={service.id}
                      name="extraServices"
                      value={service.id}
                      checked={booking.extraServices.includes(service.id)}
                      onChange={handleChange}
                    />
                    <label htmlFor={service.id}>
                      <span className="service-name">{service.name}</span>
                      <span className="service-price">+${service.price}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="specialRequests">Peticiones especiales (opcional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={booking.specialRequests}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Indíquenos si tiene alguna petición especial para su estancia"
                ></textarea>
              </div>
            </div>
          </form>
        </div>
        
        <div className="booking-summary">
          <div className="summary-card">
            <h2>Resumen de reserva</h2>
            
            <div className="hotel-summary-info">
              <img src={hotel.image} alt={hotel.name} className="hotel-thumbnail" />
              <div>
                <h3>{hotel.name}</h3>
                <p>{hotel.location}</p>
                <div className="hotel-rating">
                  <i className="star">★</i> {hotel.rating}
                </div>
              </div>
            </div>
            
            <div className="summary-details">
              <div className="summary-item">
                <span>Check-in</span>
                <span>{booking.checkIn || "No seleccionado"}</span>
              </div>
              
              <div className="summary-item">
                <span>Check-out</span>
                <span>{booking.checkOut || "No seleccionado"}</span>
              </div>
              
              <div className="summary-item">
                <span>Duración</span>
                <span>{calculateNights()} noches</span>
              </div>
              
              <div className="summary-item">
                <span>Huéspedes</span>
                <span>{booking.guests}</span>
              </div>
              
              <div className="summary-item">
                <span>Habitación</span>
                <span>
                  {roomTypes.find(room => room.id === parseInt(booking.roomType))?.name || "Estándar"}
                </span>
              </div>
            </div>
            
            <div className="price-breakdown">
              <h3>Desglose del precio</h3>
              
              <div className="price-item">
                <span>Precio base ({calculateNights()} noches)</span>
                <span>${hotel.price * calculateNights() || hotel.price}</span>
              </div>
              
              {parseInt(booking.roomType) !== 1 && (
                <div className="price-item">
                  <span>Suplemento por tipo de habitación</span>
                  <span>+${roomTypes.find(room => room.id === parseInt(booking.roomType))?.price * calculateNights() || 0}</span>
                </div>
              )}
              
              {booking.extraServices.length > 0 && (
                <>
                  <div className="price-item">
                    <span>Servicios adicionales:</span>
                    <span></span>
                  </div>
                  
                  {booking.extraServices.map(serviceId => {
                    const service = extraServices.find(s => s.id === serviceId);
                    return (
                      <div className="price-item sub-item" key={serviceId}>
                        <span>{service?.name}</span>
                        <span>+${service?.price}</span>
                      </div>
                    );
                  })}
                </>
              )}
              
              <div className="price-total">
                <span>Total</span>
                <span>${booking.totalPrice}</span>
              </div>
            </div>
            
            {/* Mostrar horarios de check-in y check-out si están disponibles en hotelDetail */}
            {hotelDetail && (hotelDetail.checkIn || hotelDetail.checkOut) && (
              <div className="hotel-policy-info">
                <h3>Horarios del hotel</h3>
                <div className="checkin-checkout-times">
                  <div className="time-item">
                    <span>Check-in:</span>
                    <strong>{hotelDetail.checkIn || '15:00'}</strong>
                  </div>
                  <div className="time-item">
                    <span>Check-out:</span>
                    <strong>{hotelDetail.checkOut || '12:00'}</strong>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              className="confirm-booking-button" 
              onClick={handleSubmit} 
              disabled={!booking.checkIn || !booking.checkOut || calculateNights() <= 0}
            >
              Confirmar reserva
            </button>
            
            <p className="booking-note">
              No se realizará ningún cargo hasta que confirme la reserva.
              Puede cancelar sin costo hasta 48 horas antes de la llegada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Añade esta función para obtener las habitaciones disponibles del hotel por tipo
const fetchAvailableRooms = async (hotelId, checkIn, checkOut) => {
  try {
    const response = await axios.post(`http://localhost:3000/api/hotels/${hotelId}/check-availability`, {
      checkIn,
      checkOut,
      guests: booking.guests
    });
    
    // Organizar las habitaciones por tipo (typeId)
    const roomsByType = {};
    response.data.forEach(room => {
      if (!roomsByType[room.typeId]) {
        roomsByType[room.typeId] = [];
      }
      
      // Filtra solo las habitaciones que están disponibles
      const availableRoomNumbers = room.availability.rooms
        .filter(r => r.isAvailable && !r.isReserved)
        .map(r => r.roomNumber);
      
      roomsByType[room.typeId] = availableRoomNumbers;
    });
    
    console.log('Habitaciones disponibles por tipo:', roomsByType);
    setAvailableRooms(roomsByType);
    
    // Actualizar los tipos de habitación con la disponibilidad real
    const updatedRoomTypes = roomTypes.map(roomType => ({
      ...roomType,
      available: roomsByType[roomType.id]?.length || 0
    }));
    
    setRoomTypes(updatedRoomTypes);
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error);
  }
};

export default Reserva;