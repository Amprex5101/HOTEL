import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Estado original de todos los hoteles (como base de datos)
  const [allHotels, setAllHotels] = useState([
    {
      id: 1,
      name: "Grand Hotel Luxury",
      location: "Centro Histórico, Ciudad",
      rating: 4.8,
      price: 2800,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      amenities: ["Wi-Fi", "Piscina", "Spa", "Restaurante", "Gimnasio"]
    },
    {
      id: 2,
      name: "Boutique Hotel Marina",
      location: "Zona Costera, Ciudad",
      rating: 4.6,
      price: 2200,
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      amenities: ["Wi-Fi", "Piscina", "Vista al mar", "Desayuno incluido"]
    },
    {
      id: 3,
      name: "Business Plaza Hotel",
      location: "Distrito Financiero, Ciudad",
      rating: 4.4,
      price: 1950,
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      amenities: ["Wi-Fi", "Centro de negocios", "Restaurante", "Transporte al aeropuerto"]
    },
    {
      id: 4,
      name: "Resort & Spa Paradise",
      location: "Playa Hermosa, Ciudad",
      rating: 4.9,
      price: 3500,
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1349&q=80",
      amenities: ["Wi-Fi", "Piscina infinita", "Spa de lujo", "Actividades acuáticas", "Todo incluido"]
    },
    // Nuevos hoteles
    {
      id: 5,
      name: "Mountain View Lodge",
      location: "Sierra Alta, Ciudad",
      rating: 4.7,
      price: 2600,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      amenities: ["Wi-Fi", "Chimenea", "Vistas panorámicas", "Desayuno gourmet", "Senderismo"]
    },
    {
      id: 6,
      name: "Urban Design Suites",
      location: "Zona Cultural, Ciudad",
      rating: 4.5,
      price: 2100,
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      amenities: ["Wi-Fi", "Terraza en azotea", "Bar de diseñador", "Galería de arte", "Bicicletas gratuitas"]
    }
  ]);

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializar hoteles al cargar
  useEffect(() => {
    setHotels(allHotels);
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
  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Simulamos una búsqueda con un pequeño retraso
    setTimeout(() => {
      const filteredResults = allHotels.filter(hotel => {
        // Filtrar por destino (si se especificó)
        if (searchParams.destination && 
            !hotel.location.toLowerCase().includes(searchParams.destination.toLowerCase())) {
          return false;
        }
        return true;
      });
      
      setHotels(filteredResults);
      setLoading(false);
      
      if (filteredResults.length === 0) {
        setMessage('No se encontraron hoteles con los criterios especificados.');
      }
    }, 800); // Simular tiempo de búsqueda
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    setLoading(true);
    
    setTimeout(() => {
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
            hotel.amenities.includes(amenity)
          );
          if (!hasAllAmenities) {
            return false;
          }
        }
        
        // Si pasa todos los filtros
        return true;
      });
      
      setHotels(filteredResults);
      setLoading(false);
      
      if (filteredResults.length === 0) {
        setMessage('No se encontraron hoteles con los filtros aplicados.');
      } else {
        setMessage('');
      }
    }, 500);
  };

  // Función para reservar hotel
  const handleBooking = (hotelId) => {
    // Aquí podrías guardar la información de búsqueda en sessionStorage o en un estado global
    const bookingInfo = {
      hotelId,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests,
      rooms: searchParams.rooms
    };
    
    // Guardar en sessionStorage para usar en la página de reserva
    sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
    
    // Navegar a la página de reserva con el ID del hotel
    navigate(`/reserva/${hotelId}`);
  };

  const handleViewMore = (hotelId) => {
    // Store all hotels data in sessionStorage so VerMas can access it
    sessionStorage.setItem('allHotels', JSON.stringify(allHotels));
    
    // Navigate to the VerMas page with the hotel ID
    navigate(`/ver-mas/${hotelId}`);
  };

  return (
    <div className="dashboard-container">
    
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
            <div className="loading-message">Buscando los mejores hoteles para ti...</div>
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
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="amenity-tag">{amenity}</span>
                      ))}
                      {hotel.amenities.length > 3 && (
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