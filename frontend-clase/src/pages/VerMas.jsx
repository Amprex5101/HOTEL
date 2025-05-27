import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerMas.css';

function VerMas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [hotelDetail, setHotelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        setHotel(hotelResponse.data);
        
        // Obtener detalles extendidos del hotel
        // Ahora buscamos por hotelId que es un número en tu base de datos
        const detailResponse = await axios.get(`http://localhost:3000/api/hotel-details?hotelId=${id}`);
        if (detailResponse.data) {
          setHotelDetail(detailResponse.data);
        }
      } catch (error) {
        console.error("Error fetching hotel data:", error);
        setError(error.message || 'Error al cargar datos del hotel');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [id]);

  // Funciones para la galería de imágenes
  const nextImage = () => {
    if (hotelDetail && hotelDetail.additionalImages && hotelDetail.additionalImages.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === hotelDetail.additionalImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (hotelDetail && hotelDetail.additionalImages && hotelDetail.additionalImages.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? hotelDetail.additionalImages.length - 1 : prevIndex - 1
      );
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información del hotel...</p>
      </div>
    );
  }

  // Si hay un error, mostrar un mensaje de error
  if (error) {
    return (
      <div className="error-container">
        <h2>Error al cargar hotel</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Volver al dashboard
        </button>
      </div>
    );
  }

  // Si no se encontró el hotel, mostrar un mensaje
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

  // Determinar qué imágenes mostrar (imagen principal + adicionales)
  const allImages = hotelDetail?.additionalImages ? 
    [hotel.image, ...hotelDetail.additionalImages] : 
    [hotel.image];
  
  const mainImage = allImages[currentImageIndex];

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

      <div className="hotel-gallery-container">
        <div className="main-gallery-image">
          <button 
            className="gallery-nav prev-button" 
            onClick={prevImage} 
            aria-label="Imagen anterior"
            disabled={allImages.length <= 1}
          >
            ‹
          </button>
          
          <img src={mainImage} alt={`${hotel.name} - Imagen ${currentImageIndex + 1}`} />
          
          <button 
            className="gallery-nav next-button" 
            onClick={nextImage} 
            aria-label="Imagen siguiente"
            disabled={allImages.length <= 1}
          >
            ›
          </button>
        </div>

        {allImages.length > 1 && (
          <div className="thumbnail-gallery">
            {allImages.map((image, index) => (
              <div 
                key={index} 
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => selectImage(index)}
              >
                <img src={image} alt={`${hotel.name} - Miniatura ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hotel-detail-content">
        <div className="hotel-info">
          <h2>Descripción</h2>
          {hotelDetail?.longDescription ? (
            <div className="hotel-description" dangerouslySetInnerHTML={{ __html: hotelDetail.longDescription }}></div>
          ) : hotelDetail?.description ? (
            <div className="hotel-description">{hotelDetail.description}</div>
          ) : (
            <p>
              Disfrute de una estancia inolvidable en nuestro exclusivo hotel ubicado en {hotel.location}. 
              Ofrecemos instalaciones de primera clase y un servicio personalizado para hacer de su 
              visita una experiencia única.
            </p>
          )}
          
          <h2>Servicios y amenidades</h2>
          <div className="amenities-list">
            {hotel.amenities && hotel.amenities.length > 0 ? (
              hotel.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  ✓ {amenity}
                </div>
              ))
            ) : (
              <p>No hay información disponible sobre amenidades.</p>
            )}
          </div>

          {hotelDetail?.amenityDetails && hotelDetail.amenityDetails.length > 0 && (
            <>
              <h2>Detalles de amenidades</h2>
              <div className="features-list">
                {hotelDetail.amenityDetails.map((amenity, index) => (
                  <div key={index} className="feature-item">
                    <h4>
                      {amenity.icon && <span className="amenity-icon">{amenity.icon}</span>}
                      {amenity.name}
                    </h4>
                    <p>{amenity.description}</p>
                    {amenity.image && (
                      <img 
                        src={amenity.image} 
                        alt={amenity.name} 
                        className="amenity-image" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          
          {hotelDetail?.policies && hotelDetail.policies.length > 0 && (
            <>
              <h2>Políticas del hotel</h2>
              <div className="policies-info">
                <ul>
                  {hotelDetail.policies.map((policy, index) => (
                    <li key={index}>{policy}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          
          {hotelDetail?.nearbyAttractions && hotelDetail.nearbyAttractions.length > 0 && (
            <>
              <h2>Lugares cercanos</h2>
              <div className="nearby-places">
                {hotelDetail.nearbyAttractions.map((place, index) => (
                  <div key={index} className="nearby-place-item">
                    <span className="place-name">{place}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="booking-sidebar">
          <div className="booking-card">
            <h2>Reservar ahora</h2>
            <div className="price-info">
              <span className="price">${hotel.price}</span>
              <span className="per-night">por noche</span>
            </div>
            <div className="checkin-info">
              <div className="checkin-time">
                <span>Check-in:</span>
                <strong>{hotelDetail?.checkIn || '15:00'}</strong>
              </div>
              <div className="checkout-time">
                <span>Check-out:</span>
                <strong>{hotelDetail?.checkOut || '12:00'}</strong>
              </div>
            </div>
            <button 
              className="reserve-button"
              onClick={() => {
                // Guardar información para la reserva
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
          
          {hotelDetail?.contactInfo && (
            <div className="contact-info-card">
              <h3>Información de contacto</h3>
              {hotelDetail.contactInfo.phone && (
                <p><strong>Teléfono:</strong> {hotelDetail.contactInfo.phone}</p>
              )}
              {hotelDetail.contactInfo.email && (
                <p><strong>Email:</strong> {hotelDetail.contactInfo.email}</p>
              )}
              {hotelDetail.contactInfo.website && (
                <p>
                  <strong>Sitio web:</strong>{' '}
                  <a href={hotelDetail.contactInfo.website} target="_blank" rel="noopener noreferrer">
                    {hotelDetail.contactInfo.website}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerMas;