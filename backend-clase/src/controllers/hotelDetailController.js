const HotelDetail = require('../models/HotelDetail');
const Hotel = require('../models/Hotel');

const hotelDetailController = {
    
    // Crear nuevos detalles de hotel
    async createHotelDetail(req, res) {
        try {
            const { hotelId, description, longDescription, additionalImages, 
                   checkIn, checkOut, policies, amenityDetails, nearbyAttractions, contactInfo } = req.body;
            
            // Verificar si el hotel existe
            const hotel = await Hotel.findOne({ id: hotelId });
            if (!hotel) {
                return res.status(404).json({ message: "Hotel no encontrado" });
            }
            
            // Verificar si ya existen detalles para este hotel
            const existingDetail = await HotelDetail.findOne({ hotelId });
            if (existingDetail) {
                return res.status(400).json({ message: "Ya existen detalles para este hotel" });
            }
            
            // Crear nuevos detalles
            const newHotelDetail = new HotelDetail({
                hotelId,
                description,
                longDescription,
                additionalImages,
                checkIn,
                checkOut,
                policies,
                amenityDetails,
                nearbyAttractions,
                contactInfo
            });
            
            await newHotelDetail.save();
            res.status(201).json(newHotelDetail);
        } catch (error) {
            console.error("Error al crear detalles del hotel:", error);
            res.status(500).json({ message: "Error al crear detalles del hotel" });
        }
    },
    
    
    // Eliminar detalles de hotel
    async deleteHotelDetail(req, res) {
        try {
            const hotelDetail = await HotelDetail.findOneAndDelete({ hotelId: req.params.hotelId });
            
            if (!hotelDetail) {
                return res.status(404).json({ message: "Detalles del hotel no encontrados" });
            }
            
            res.status(200).json({ message: "Detalles del hotel eliminados correctamente" });
        } catch (error) {
            console.error("Error al eliminar detalles del hotel:", error);
            res.status(500).json({ message: "Error al eliminar detalles del hotel" });
        }
    },

    // GET /api/hotel-details
    async getHotelDetails(req, res) {
        try {
            const { hotelId } = req.query;
            
            if (!hotelId) {
                return res.status(400).json({ message: "Se requiere el ID del hotel" });
            }
            
            // Buscar los detalles del hotel por el hotelId numérico
            const hotelDetails = await HotelDetail.findOne({ hotelId: parseInt(hotelId) });
            
            if (!hotelDetails) {
                return res.status(404).json({ message: "No se encontraron detalles para este hotel" });
            }
            
            res.status(200).json(hotelDetails);
        } catch (error) {
            console.error("Error al obtener detalles del hotel:", error);
            res.status(500).json({ message: "Error al obtener detalles del hotel" });
        }
    }
};

module.exports = hotelDetailController;