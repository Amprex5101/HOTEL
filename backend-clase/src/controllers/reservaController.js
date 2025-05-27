const Reserva = require('../models/Reserva');
const Room = require('../models/Room');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

const reservaController = {
  // Crear una nueva reserva
  async createReserva(req, res) {
    try {
      const {
        hotelId,
        hotelName,
        roomType,
        roomNumber,
        checkIn,
        checkOut,
        nights,
        cliente,
        guests,
        extraServices,
        specialRequests,
        totalPrice,
        paymentMethod,
        reservationNumber,
        status,
        paymentStatus
      } = req.body;
      
      // Verificar si el hotel existe
      const hotel = await Hotel.findOne({ id: hotelId });
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel no encontrado' });
      }
      
      // Ya no necesitamos verificar User, pues usaremos username directamente
      // Solo verifica si se proporcionó la información básica del cliente
      if (!cliente || !cliente.firstName || !cliente.email) {
        return res.status(400).json({ message: 'Información del cliente incompleta' });
      }
      
      // Verificar disponibilidad de la habitación
      const room = await Room.findOne({ 
        hotelId, 
        typeId: roomType.id,
        'availability.rooms.roomNumber': roomNumber
      });
      
      if (!room) {
        return res.status(404).json({ message: "Habitación no disponible" });
      }
      
      // Crear nueva reserva (con username en lugar de userId)
      const newReserva = new Reserva({
        hotelId,
        hotelName,
        roomType,
        roomNumber,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights,
        cliente: {
          username: cliente.username || 'guest',  // Usar username en lugar de userId
          firstName: cliente.firstName,
          lastName: cliente.lastName,
          email: cliente.email,
          phone: cliente.phone
        },
        guests,
        extraServices: extraServices || [],
        specialRequests,
        totalPrice,
        paymentMethod,
        reservationNumber,
        status: status || 'confirmed',
        paymentStatus: paymentStatus || 'paid'
      });
      
      // Guardar la reserva
      await newReserva.save();
      
      // Actualizar disponibilidad de la habitación
      const roomIndex = room.availability.rooms.findIndex(r => r.roomNumber === roomNumber);
      if (roomIndex !== -1) {
        room.availability.rooms[roomIndex].isReserved = true;
        room.availability.rooms[roomIndex].isAvailable = false;
        room.availability.rooms[roomIndex].reservedUntil = new Date(checkOut);
        room.availability.available -= 1;
        
        await room.save();
      }
      
      res.status(201).json({
        message: "Reserva creada exitosamente",
        reserva: newReserva
      });
    } catch (error) {
      console.error("Error al crear reserva:", error);
      res.status(500).json({ message: "Error al crear la reserva", error: error.message });
    }
  },
  
  // Obtener todas las reservas
  async getAllReservas(req, res) {
    try {
      const reservas = await Reserva.find();
      res.status(200).json(reservas);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
      res.status(500).json({ message: "Error al obtener reservas" });
    }
  },
  
  // Obtener reservas por usuario
  async getReservasByUser(req, res) {
    try {
      const userId = req.params.userId;
      const reservas = await Reserva.find({ 'cliente.userId': userId });
      res.status(200).json(reservas);
    } catch (error) {
      console.error("Error al obtener reservas del usuario:", error);
      res.status(500).json({ message: "Error al obtener reservas del usuario" });
    }
  },
  
  // Obtener reservas por hotel
  async getReservasByHotel(req, res) {
    try {
      const hotelId = req.params.hotelId;
      const reservas = await Reserva.find({ hotelId });
      res.status(200).json(reservas);
    } catch (error) {
      console.error("Error al obtener reservas del hotel:", error);
      res.status(500).json({ message: "Error al obtener reservas del hotel" });
    }
  },
  
  // Obtener una reserva por número de reserva
  async getReservaByNumber(req, res) {
    try {
      const reservationNumber = req.params.reservationNumber;
      const reserva = await Reserva.findOne({ reservationNumber });
      
      if (!reserva) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }
      
      res.status(200).json(reserva);
    } catch (error) {
      console.error("Error al obtener reserva:", error);
      res.status(500).json({ message: "Error al obtener reserva" });
    }
  },
  
  
  // Cancelar una reserva
  async cancelReserva(req, res) {
    try {
      const reservationNumber = req.params.reservationNumber;
      
      const reserva = await Reserva.findOne({ reservationNumber });
      
      if (!reserva) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }
      
      // Solo permitir cancelación si no está ya cancelada o completada
      if (reserva.status === 'cancelled' || reserva.status === 'completed') {
        return res.status(400).json({ 
          message: `La reserva no puede ser cancelada porque ya está ${reserva.status}` 
        });
      }
      
      // Actualizar estado de la reserva
      reserva.status = 'cancelled';
      await reserva.save();
      
      // Liberar la habitación
      const room = await Room.findOne({
        hotelId: reserva.hotelId,
        typeId: reserva.roomType.id,
        'availability.rooms.roomNumber': reserva.roomNumber
      });
      
      if (room) {
        const roomIndex = room.availability.rooms.findIndex(r => r.roomNumber === reserva.roomNumber);
        if (roomIndex !== -1) {
          room.availability.rooms[roomIndex].isReserved = false;
          room.availability.rooms[roomIndex].isAvailable = true;
          room.availability.rooms[roomIndex].reservedUntil = null;
          room.availability.available += 1;
          
          await room.save();
        }
      }
      
      res.status(200).json({
        message: "Reserva cancelada exitosamente",
        reserva
      });
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      res.status(500).json({ message: "Error al cancelar reserva" });
    }
  }
};

module.exports = reservaController;