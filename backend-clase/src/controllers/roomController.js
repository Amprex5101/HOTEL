const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

const roomController = {
  
  // Obtener habitaciones por ID de hotel
  async getRoomsByHotelId(req, res) {
    try {
      const hotelId = req.params.hotelId;
      const rooms = await Room.find({ hotelId });
      
      if (rooms.length === 0) {
        return res.status(404).json({ message: "No se encontraron habitaciones para este hotel" });
      }
      
      res.status(200).json(rooms);
    } catch (error) {
      console.error("Error al obtener habitaciones del hotel:", error);
      res.status(500).json({ message: "Error al obtener habitaciones del hotel" });
    }
  },



  // Actualizar disponibilidad de una habitación específica
  async updateRoomAvailability(req, res) {
    try {
      const { roomId } = req.params;
      const { roomNumber, isAvailable, isReserved, reservedUntil } = req.body;
      
      const room = await Room.findById(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Habitación no encontrada" });
      }
      
      // Encontrar el índice de la habitación específica
      const roomIndex = room.availability.rooms.findIndex(r => r.roomNumber === roomNumber);
      
      if (roomIndex === -1) {
        return res.status(404).json({ message: "Número de habitación no encontrado" });
      }
      
      // Actualizar estado de disponibilidad
      room.availability.rooms[roomIndex].isAvailable = isAvailable;
      room.availability.rooms[roomIndex].isReserved = isReserved;
      room.availability.rooms[roomIndex].reservedUntil = reservedUntil;
      
      // Recalcular el número de habitaciones disponibles
      const availableRooms = room.availability.rooms.filter(r => r.isAvailable && !r.isReserved).length;
      room.availability.available = availableRooms;
      
      await room.save();
      
      res.status(200).json(room);
    } catch (error) {
      console.error("Error al actualizar disponibilidad de la habitación:", error);
      res.status(500).json({ message: "Error al actualizar disponibilidad de la habitación" });
    }
  },

  // Verificar disponibilidad de habitaciones para un hotel en un rango de fechas
  async checkAvailability(req, res) {
    try {
      const { hotelId } = req.params;
      const { checkIn, checkOut, guests } = req.body;
      
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Las fechas de check-in y check-out son obligatorias" });
      }
      
      // Buscar todas las habitaciones del hotel
      const rooms = await Room.find({ hotelId });
      
      if (rooms.length === 0) {
        return res.status(404).json({ message: "No se encontraron habitaciones para este hotel" });
      }
      
      // Filtrar habitaciones con capacidad suficiente para los huéspedes
      const availableRooms = rooms.filter(room => {
        // Verificar capacidad
        if (guests && room.capacity < guests) return false;
        
        // Verificar si hay habitaciones disponibles
        return room.availability.available > 0;
      });
      
      res.status(200).json(availableRooms);
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error);
      res.status(500).json({ message: "Error al verificar disponibilidad" });
    }
  }
};

module.exports = roomController;