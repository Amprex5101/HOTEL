import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './CrearHotel.css';

function CrearHotel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 5,
    price: 0,
    image: '',
    amenities: []
  });
  
  const [allAmenities, setAllAmenities] = useState([
    'Wi-Fi', 'Piscina', 'Spa', 'Restaurante', 'Gimnasio', 
    'Vista al mar', 'Desayuno incluido', 'Centro de negocios',
    'Transporte al aeropuerto', 'Piscina infinita', 'Spa de lujo',
    'Actividades acuáticas', 'Todo incluido', 'Chimenea',
    'Vistas panorámicas', 'Desayuno gourmet', 'Senderismo',
    'Terraza en azotea', 'Bar de diseñador', 'Galería de arte',
    'Bicicletas gratuitas'
  ]);
  
    // Añade esto al estado detailsData
  const [detailsData, setDetailsData] = useState({
    hotelId: '',
    description: '',
    longDescription: '',
    checkIn: '15:00',
    checkOut: '12:00',
    additionalImages: [],
    policies: [],
    nearbyAttractions: [],
    amenityDetails: [] // Aquí guardaremos los detalles de cada amenidad
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Verificar si el usuario tiene permisos para esta página
  const hasAdminAccess = user && ['admin', 'editor', 'moderator'].includes(user.role);
  
  useEffect(() => {
    // Si el usuario no tiene acceso, redirigir
    if (!hasAdminAccess) {
      navigate('/login');
    }
    
    // Obtener el último ID de hotel para incrementarlo
    const fetchLastHotelId = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/hotels');
        if (response.data && response.data.length > 0) {
          // Encontrar el ID más alto
          const maxId = Math.max(...response.data.map(hotel => hotel.id));
          // Preparar para el siguiente ID
          setDetailsData(prev => ({
            ...prev,
            hotelId: maxId + 1
          }));
        } else {
          // Si no hay hoteles, comenzar desde 1
          setDetailsData(prev => ({
            ...prev,
            hotelId: 1
          }));
        }
      } catch (error) {
        console.error("Error al obtener hoteles:", error);
        setError("No se pudo obtener la información de hoteles");
      }
    };
    
    if (hasAdminAccess) {
      fetchLastHotelId();
    }
  }, [hasAdminAccess, navigate]);
  
  // Manejar cambios en el formulario principal
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Manejar cambios en los detalles
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetailsData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Actualiza la función existente handleAmenityChange
  const handleAmenityChange = (amenity) => {
    setFormData(prev => {
      const isSelected = prev.amenities.includes(amenity);
      const updatedAmenities = isSelected
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      
      // Si se está desseleccionando, eliminar los detalles
      if (isSelected) {
        setDetailsData(prevDetails => ({
          ...prevDetails,
          amenityDetails: prevDetails.amenityDetails.filter(detail => detail.name !== amenity)
        }));
      }
      
      return {
        ...prev,
        amenities: updatedAmenities
      };
    });
  };
  
  // Reemplaza handleMultipleInput con esta versión
  const handleMultipleInput = (e, field) => {
    const { value } = e.target;
    const items = value.split(/\r?\n/);
    
    setDetailsData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  // Reemplaza handleAdditionalImages con esta versión
  const handleAdditionalImages = (e) => {
    const { value } = e.target;
    const urls = value.split(/\r?\n/);
    
    setDetailsData(prev => ({
      ...prev,
      additionalImages: urls
    }));
  };

  // Añade esta función para manejar los cambios en detalles de amenidades
  const handleAmenityDetailChange = (amenity, field, value) => {
    setDetailsData(prev => {
      // Buscar si ya existe un detalle para esta amenidad
      const existingIndex = prev.amenityDetails.findIndex(detail => detail.name === amenity);
      
      if (existingIndex >= 0) {
        // Si existe, actualizar el campo correspondiente
        const updatedDetails = [...prev.amenityDetails];
        updatedDetails[existingIndex] = {
          ...updatedDetails[existingIndex],
          [field]: value
        };
        
        return {
          ...prev,
          amenityDetails: updatedDetails
        };
      } else {
        // Si no existe, crear un nuevo objeto de detalle
        const newDetail = {
          name: amenity,
          description: field === 'description' ? value : '',
          image: field === 'image' ? value : ''
        };
        
        return {
          ...prev,
          amenityDetails: [...prev.amenityDetails, newDetail]
        };
      }
    });
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Verificar campos obligatorios
      if (!formData.name || !formData.location || !formData.image) {
        throw new Error("Por favor complete los campos obligatorios: nombre, ubicación e imagen");
      }
      
      // Crear el objeto de hotel con un ID único
      const hotelData = {
        ...formData,
        id: detailsData.hotelId // Usar el ID que obtuvimos previamente
      };
      
      // Primero guardar el hotel básico
      const hotelResponse = await axios.post('http://localhost:3000/api/hotels', hotelData);
      
      if (hotelResponse.status === 201) {
        // Luego guardar los detalles del hotel
        const hotelDetailResponse = await axios.post('http://localhost:3000/api/hotel-details', {
          ...detailsData,
          hotelId: detailsData.hotelId
        });
        
        if (hotelDetailResponse.status === 201) {
          setSuccessMessage("Hotel creado exitosamente");
          
          // Limpiar el formulario después de guardar
          setFormData({
            name: '',
            location: '',
            rating: 5,
            price: 0,
            image: '',
            amenities: []
          });
          
          // Esperar un momento y redirigir
          setTimeout(() => {
            navigate('/hotels/admin');
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error al crear hotel:", error);
      setError(error.message || "Error al crear el hotel");
    } finally {
      setLoading(false);
    }
  };
  
  // Cancelar creación
  const handleCancel = () => {
    navigate('/admin/hotels');
  };
  
  if (!hasAdminAccess) {
    return (
      <div className="unauthorized-container">
        <h2>Acceso no autorizado</h2>
        <p>No tienes permisos para ver esta página.</p>
        <button onClick={() => navigate('/login')}>Iniciar Sesión</button>
      </div>
    );
  }
  
  // Paginación de amenidades
  const [currentPage, setCurrentPage] = useState(1);
  const [amenitiesPerPage, setAmenitiesPerPage] = useState(10);
  
  const indexOfLastAmenity = currentPage * amenitiesPerPage;
  const indexOfFirstAmenity = indexOfLastAmenity - amenitiesPerPage;
  const currentAmenities = allAmenities.slice(indexOfFirstAmenity, indexOfLastAmenity);
  const totalPages = Math.ceil(allAmenities.length / amenitiesPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const handleAmenitiesPerPageChange = (e) => {
    setAmenitiesPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Resetear a la primera página
  };
  
  return (
    <div className="crear-hotel-container">
      <div className="crear-hotel-header">
        <h1>Crear Nuevo Hotel</h1>
        <p>Complete todos los campos para añadir un nuevo hotel al sistema</p>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="crear-hotel-form-container">
        <form onSubmit={handleSubmit} className="crear-hotel-form">
          <div className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre del Hotel *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del hotel"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Ubicación *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ciudad, País"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rating">Calificación</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Precio por noche ($MXN) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="image">URL de imagen principal *</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
              />
            </div>
            
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" />
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h2>Amenidades</h2>
            <p>Seleccione todas las amenidades que ofrece el hotel</p>
            
            <div className="pagination-controls">
              <div className="pagination-info">
                Mostrando {indexOfFirstAmenity + 1}-{Math.min(indexOfLastAmenity, allAmenities.length)} de {allAmenities.length} amenidades
              </div>
              <div className="per-page-selector">
                <label htmlFor="amenitiesPerPage">Amenidades por página:</label>
                <select 
                  id="amenitiesPerPage" 
                  value={amenitiesPerPage} 
                  onChange={handleAmenitiesPerPageChange}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <div className="amenities-grid">
              {currentAmenities.map(amenity => (
                <div className="amenity-checkbox" key={amenity}>
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                </div>
              ))}
            </div>
            
            <div className="pagination">
              <button 
                className="pagination-button" 
                disabled={currentPage === 1}
                onClick={() => paginate(1)}
              >
                &laquo;
              </button>
              <button 
                className="pagination-button" 
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                &lt;
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calcular qué números de página mostrar
                  let pageNum;
                  if (totalPages <= 5) {
                    // Si hay 5 o menos páginas, mostrar todas
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Si estamos en las primeras páginas
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Si estamos en las últimas páginas
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Si estamos en el medio
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className="pagination-button" 
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                &gt;
              </button>
              <button 
                className="pagination-button" 
                disabled={currentPage === totalPages}
                onClick={() => paginate(totalPages)}
              >
                &raquo;
              </button>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Detalles del Hotel</h2>
            
            <div className="form-group">
              <label htmlFor="description">Descripción Corta</label>
              <textarea
                id="description"
                name="description"
                value={detailsData.description}
                onChange={handleDetailsChange}
                placeholder="Una breve descripción del hotel"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="longDescription">Descripción Detallada</label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={detailsData.longDescription}
                onChange={handleDetailsChange}
                placeholder="Descripción completa del hotel con detalles de servicios e instalaciones"
                rows="5"
              ></textarea>
              <small>Puede incluir etiquetas HTML básicas para dar formato</small>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkIn">Hora de Check-in</label>
                <input
                  type="text"
                  id="checkIn"
                  name="checkIn"
                  value={detailsData.checkIn}
                  onChange={handleDetailsChange}
                  placeholder="15:00"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="checkOut">Hora de Check-out</label>
                <input
                  type="text"
                  id="checkOut"
                  name="checkOut"
                  value={detailsData.checkOut}
                  onChange={handleDetailsChange}
                  placeholder="12:00"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalImages">Imágenes Adicionales (URLs)</label>
              <textarea
                id="additionalImages"
                value={detailsData.additionalImages.join('\n')}
                onChange={(e) => handleAdditionalImages(e)}
                placeholder="Añade una URL por línea"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="policies">Políticas del Hotel</label>
              <textarea
                id="policies"
                value={detailsData.policies.join('\n')}
                onChange={(e) => handleMultipleInput(e, 'policies')}
                placeholder="Escriba cada política en una línea separada"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="nearbyAttractions">Atracciones Cercanas</label>
              <textarea
                id="nearbyAttractions"
                value={detailsData.nearbyAttractions.join('\n')}
                onChange={(e) => handleMultipleInput(e, 'nearbyAttractions')}
                placeholder="Escriba cada atracción en una línea separada"
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Detalles de amenidades seleccionadas */}
          {formData.amenities.length > 0 && (
            <div className="amenity-details-section">
              <h3>Detalles de amenidades seleccionadas</h3>
              <p>Complete la información para cada amenidad seleccionada</p>
              
              <div className="amenity-details-container">
                {formData.amenities.map(amenity => {
                  // Buscar si ya existe un detalle para esta amenidad
                  const existingDetail = detailsData.amenityDetails.find(detail => detail.name === amenity);
                  
                  return (
                    <div key={amenity} className="amenity-detail-item">
                      <h4>{amenity}</h4>
                      <div className="form-group">
                        <label htmlFor={`amenity-desc-${amenity}`}>Descripción</label>
                        <textarea
                          id={`amenity-desc-${amenity}`}
                          value={existingDetail?.description || ''}
                          onChange={(e) => handleAmenityDetailChange(amenity, 'description', e.target.value)}
                          placeholder={`Describe los detalles del servicio de ${amenity}...`}
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`amenity-img-${amenity}`}>URL de imagen</label>
                        <input
                          type="url"
                          id={`amenity-img-${amenity}`}
                          value={existingDetail?.image || ''}
                          onChange={(e) => handleAmenityDetailChange(amenity, 'image', e.target.value)}
                          placeholder={`https://example.com/images/${amenity.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                        />
                        {existingDetail?.image && (
                          <div className="amenity-image-preview">
                            <img src={existingDetail.image} alt={`Vista previa de ${amenity}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearHotel;