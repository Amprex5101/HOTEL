import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// Usar la variable de entorno para la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const navigate = useNavigate();
  
  // Estado para los hoteles obtenidos de la API
  const [allHotels, setAllHotels] = useState([]);
  
  // Estado para los hoteles filtrados que se mostrarán
  const [hotels, setHotels] = useState([]);
  
  // Estado para parámetros de búsqueda
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });

  // Estado para filtros
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    amenities: [],
    rating: 0
  });

  // Estado para mensajes y carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Cargar hoteles al inicializar el componente
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Hacer la petición al backend para obtener todos los hoteles usando la variable de entorno
        const response = await axios.get(`${API_BASE_URL}/hotels`);
        
        // Actualizar estados con los datos recibidos
        setAllHotels(response.data);
        setHotels(response.data);
        
        // Configurar filtro de precio máximo basado en los hoteles disponibles
        if (response.data.length > 0) {
          const maxPrice = Math.max(...response.data.map(hotel => hotel.price));
          setFilters(prev => ({
            ...prev,
            priceRange: [0, maxPrice]
          }));
        }
        
      } catch (err) {
        console.error("Error al obtener hoteles:", err);
        setError("No se pudieron cargar los hoteles. Por favor intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Manejar cambios en el formulario de búsqueda
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters(prev => {
        if (checked) {
          return {
            ...prev,
            amenities: [...prev.amenities, name]
          };
        } else {
          return {
            ...prev,
            amenities: prev.amenities.filter(item => item !== name)
          };
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  // Función principal de búsqueda
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Preparar los parámetros de búsqueda para la consulta
      const params = new URLSearchParams();
      if (searchParams.destination) {
        params.append('location', searchParams.destination);
      }
      if (searchParams.checkIn) {
        params.append('checkIn', searchParams.checkIn);
      }
      if (searchParams.checkOut) {
        params.append('checkOut', searchParams.checkOut);
      }
      params.append('guests', searchParams.guests);
      
      // Hacer la petición al backend para buscar hoteles según criterios usando la variable de entorno
      const response = await axios.get(`${API_BASE_URL}/hotels/search?${params.toString()}`);
      
      setHotels(response.data);
      
      if (response.data.length === 0) {
        setMessage('No se encontraron hoteles con los criterios especificados.');
      }
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      setMessage("Ocurrió un error al buscar hoteles. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Filtrar los hoteles localmente basado en los filtros seleccionados
      const filteredResults = allHotels.filter(hotel => {
        // Filtrar por precio
        if (hotel.price < filters.priceRange[0] || hotel.price > filters.priceRange[1]) {
          return false;
        }
        
        // Filtrar por calificación
        if (filters.rating > 0 && hotel.rating < filters.rating) {
          return false;
        }
        
        // Filtrar por amenidades
        if (filters.amenities.length > 0) {
          // Verificar que el hotel tenga TODAS las amenidades seleccionadas
          const hasAllAmenities = filters.amenities.every(amenity => 
            hotel.amenities?.includes(amenity)
          );
          if (!hasAllAmenities) {
            return false;
          }
        }
        
        // Si pasa todos los filtros
        return true;
      });
      
      setHotels(filteredResults);
      
      if (filteredResults.length === 0) {
        setMessage('No se encontraron hoteles con los filtros aplicados.');
      }
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
      setMessage("Ocurrió un error al aplicar los filtros. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para reservar hotel
  const handleBooking = (hotelId) => {
    // Guardar información de búsqueda en sessionStorage para la página de reserva
    const bookingInfo = {
      hotelId,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests,
      rooms: searchParams.rooms
    };
    
    sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
    
    // Navegar a la página de reserva con el ID del hotel
    navigate(`/reserva/${hotelId}`);
  };

  const handleViewMore = (hotelId) => {
    // Usar el API para obtener los detalles específicos del hotel
    navigate(`/ver-mas/${hotelId}`);
  };

  return (
    <div className="dashboard-container">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}
    
      <div className="search-section">
        <h1>Encuentra el hotel ideal para tu próxima estancia</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input">
            <label htmlFor="destination">Destino</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={searchParams.destination}
              onChange={handleSearchChange}
              placeholder="¿A dónde vas?"
            />
          </div>
          
          <div className="search-dates">
            <div className="search-input">
              <label htmlFor="checkIn">Entrada</label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={searchParams.checkIn}
                onChange={handleSearchChange}
                required
              />
            </div>
            
            <div className="search-input">
              <label htmlFor="checkOut">Salida</label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={searchParams.checkOut}
                onChange={handleSearchChange}
                required
              />
            </div>
          </div>
          
          <div className="search-guests">
            <div className="search-input">
              <label htmlFor="guests">Huéspedes</label>
              <select
                id="guests"
                name="guests"
                value={searchParams.guests}
                onChange={handleSearchChange}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
                ))}
              </select>
            </div>
            
            <div className="search-input">
              <label htmlFor="rooms">Habitaciones</label>
              <select
                id="rooms"
                name="rooms"
                value={searchParams.rooms}
                onChange={handleSearchChange}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'habitación' : 'habitaciones'}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar hoteles'}
          </button>
        </form>
      </div>

      <div className="dashboard-content">
        {/* Sidebar con filtros */}
        <aside className="filters-sidebar">
          <h3>Filtros</h3>
          
          <div className="filter-section">
            <h4>Rango de precio</h4>
            <div className="price-range">
              <span>$0</span>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100"
                value={filters.priceRange[1]}
                name="priceRange"
                onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
              />
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Calificación mínima</h4>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`star ${star <= filters.rating ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, rating: star})}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Servicios</h4>
            <div className="amenities-list">
              {['Wi-Fi', 'Piscina', 'Spa', 'Gimnasio', 'Desayuno incluido', 'Estacionamiento'].map((amenity) => (
                <label key={amenity} className="amenity-option">
                  <input
                    type="checkbox"
                    name={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onChange={handleFilterChange}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
          
          <button 
            className="apply-filters" 
            onClick={applyFilters} 
            disabled={loading}
          >
            {loading ? 'Aplicando...' : 'Aplicar filtros'}
          </button>
        </aside>

        {/* Listado de hoteles */}
        <div className="hotels-container">
          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Buscando los mejores hoteles para ti...</p>
            </div>
          ) : message ? (
            <div className="no-results">{message}</div>
          ) : (
            <div className="hotels-grid">
              {hotels.map(hotel => (
                <div 
                  className="hotel-card" 
                  key={hotel.id} 
                  onClick={() => handleViewMore(hotel.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="hotel-image">
                    <img src={hotel.image} alt={hotel.name} />
                    <span className="hotel-rating">
                      <i className="star">★</i> {hotel.rating}
                    </span>
                  </div>
                  <div className="hotel-details">
                    <h3>{hotel.name}</h3>
                    <p className="hotel-location">{hotel.location}</p>
                    <div className="hotel-amenities">
                      {hotel.amenities?.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="amenity-tag">{amenity}</span>
                      ))}
                      {hotel.amenities?.length > 3 && (
                        <span className="amenity-tag more">+{hotel.amenities.length - 3} más</span>
                      )}
                    </div>
                    <div className="hotel-booking">
                      <div className="hotel-price">
                        <span className="price">${hotel.price}</span>
                        <span className="price-night">por noche</span>
                      </div>
                      <button 
                        className="book-now"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when button is clicked
                          handleBooking(hotel.id);
                        }}
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;