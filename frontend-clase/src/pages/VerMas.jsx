import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VerMas.css';

function VerMas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState({
    id: id,
    storageData: null,
    error: null
  });

  useEffect(() => {
    const fetchHotel = () => {
      setLoading(true);
      
      try {
        // Retrieve hotel data
        const allHotelsString = sessionStorage.getItem('allHotels');
        console.log("Raw data from sessionStorage:", allHotelsString);
        
        // Parse the data
        const allHotels = allHotelsString ? JSON.parse(allHotelsString) : [];
        console.log("Parsed hotels:", allHotels);
        
        // Update debug info
        setDebug(prev => ({
          ...prev,
          storageData: allHotels,
        }));
        
        // Find hotel by ID (ensure ID is converted to number for comparison)
        const hotelId = parseInt(id);
        console.log("Looking for hotel with ID:", hotelId);
        
        const foundHotel = allHotels.find(h => h.id === hotelId);
        console.log("Found hotel:", foundHotel);
        
        if (foundHotel) {
          setHotel(foundHotel);
        } else {
          console.error('Hotel no encontrado');
          setDebug(prev => ({
            ...prev,
            error: 'Hotel with ID ' + id + ' not found in data'
          }));
        }
      } catch (error) {
        console.error("Error fetching hotel data:", error);
        setDebug(prev => ({
          ...prev,
          error: error.message
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  // Display debugging information
  if (debug.error) {
    return (
      <div className="error-container">
        <h2>Error al cargar hotel</h2>
        <p>{debug.error}</p>
        <p>ID buscado: {debug.id}</p>
        <p>Datos en storage: {debug.storageData ? JSON.stringify(debug.storageData.map(h => ({id: h.id, name: h.name}))) : 'No hay datos'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Volver a la página principal
        </button>
      </div>
    );
  }

  // Si está cargando, mostrar un mensaje
  if (loading) {
    return <div className="loading">Cargando información del hotel...</div>;
  }

  // Si no se encontró el hotel, mostrar un mensaje
  if (!hotel) {
    return (
      <div className="error-container">
        <h2>Hotel no encontrado</h2>
        <p>Lo sentimos, no pudimos encontrar el hotel que estás buscando.</p>
        <button onClick={() => navigate('/')} className="back-button">
          Volver a la página principal
        </button>
      </div>
    );
  }

  return (
    <div className="hotel-detail-container">
      <div className="hotel-detail-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Volver
        </button>
        <h1>{hotel.name}</h1>
        <div className="hotel-location-rating">
          <span className="location">📍 {hotel.location}</span>
          <span className="rating">★ {hotel.rating}</span>
        </div>
      </div>

      <div className="hotel-main-image">
        <img src={hotel.image} alt={hotel.name} />
      </div>

      <div className="hotel-detail-content">
        <div className="hotel-info">
          <h2>Descripción</h2>
          <p>
            Disfrute de una estancia inolvidable en nuestro exclusivo hotel ubicado en {hotel.location}. 
            Ofrecemos instalaciones de primera clase y un servicio personalizado para hacer de su 
            visita una experiencia única.
          </p>
          
          <h2>Servicios y amenidades</h2>
          <div className="amenities-list">
            {hotel.amenities.map((amenity, index) => (
              <div key={index} className="amenity-item">
                ✓ {amenity}
              </div>
            ))}
          </div>
        </div>
        
        <div className="booking-sidebar">
          <div className="booking-card">
            <h2>Reservar ahora</h2>
            <div className="price-info">
              <span className="price">${hotel.price}</span>
              <span className="per-night">por noche</span>
            </div>
            <button 
              className="reserve-button"
              onClick={() => {
                // Llamar a la función de reserva
                const bookingInfo = {
                  hotelId: hotel.id,
                  checkIn: new Date().toISOString().split('T')[0],
                  checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  guests: 2,
                  rooms: 1
                };
                
                sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
                navigate(`/reserva/${hotel.id}`);
              }}
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerMas;