const Hotel = require('../models/Hotel');

const hotelController = {
    // Obtener todos los hoteles
    async getAllHotels(req, res) {
        try {
            const hotels = await Hotel.find();
            res.status(200).json(hotels);
        } catch (error) {
            console.error("Error al obtener hoteles:", error);
            res.status(500).json({ message: "Error al obtener hoteles" });
        }
    },

    // Obtener un hotel por ID
    async getHotelById(req, res) {
        try {
            const hotel = await Hotel.findOne({ id: req.params.id });
            if (!hotel) {
                return res.status(404).json({ message: "Hotel no encontrado" });
            }
            res.status(200).json(hotel);
        } catch (error) {
            console.error("Error al obtener hotel:", error);
            res.status(500).json({ message: "Error al obtener hotel" });
        }
    },

    // Crear un nuevo hotel
    async createHotel(req, res) {
        try {
            const { id, name, location, rating, price, image, amenities } = req.body;
            
            // Verificar si el hotel ya existe
            const existingHotel = await Hotel.findOne({ id });
            if (existingHotel) {
                return res.status(400).json({ message: "El hotel con ese ID ya existe" });
            }
            
            // Crear nuevo hotel
            const newHotel = new Hotel({
                id,
                name,
                location,
                rating,
                price,
                image,
                amenities
            });
            
            await newHotel.save();
            res.status(201).json(newHotel);
        } catch (error) {
            console.error("Error al crear hotel:", error);
            res.status(500).json({ message: "Error al crear el hotel" });
        }
    },

    // Actualizar un hotel
    async updateHotel(req, res) {
        try {
            const { name, location, rating, price, image, amenities } = req.body;
            
            const updatedHotel = await Hotel.findOneAndUpdate(
                { id: req.params.id },
                {
                    name,
                    location,
                    rating,
                    price,
                    image,
                    amenities
                },
                { new: true }
            );
            
            if (!updatedHotel) {
                return res.status(404).json({ message: "Hotel no encontrado" });
            }
            
            res.status(200).json(updatedHotel);
        } catch (error) {
            console.error("Error al actualizar hotel:", error);
            res.status(500).json({ message: "Error al actualizar hotel" });
        }
    },

    // Eliminar un hotel y sus detalles asociados
    async deleteHotel(req, res) {
        try {
            // Primero, buscar el hotel para verificar que existe
            const hotel = await Hotel.findOne({ id: req.params.id });
            
            if (!hotel) {
                return res.status(404).json({ message: "Hotel no encontrado" });
            }
            
            // Eliminar los detalles del hotel
            const HotelDetail = require('../models/HotelDetail');
            await HotelDetail.findOneAndDelete({ hotelId: req.params.id });
            
            // Eliminar el hotel principal
            await Hotel.findOneAndDelete({ id: req.params.id });
            
            res.status(200).json({ 
                message: "Hotel y sus detalles eliminados correctamente" 
            });
            
        } catch (error) {
            console.error("Error al eliminar hotel:", error);
            res.status(500).json({ message: "Error al eliminar hotel" });
        }
    }
};

module.exports = hotelController;