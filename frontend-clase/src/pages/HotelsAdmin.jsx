import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HotelsAdmin.css';

// Usar la variable de entorno para la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

function HotelsAdmin() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelsPerPage, setHotelsPerPage] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Verificar si el usuario tiene permisos para esta página
  const hasAdminAccess = user && ['admin', 'editor', 'moderator'].includes(user.role);

  // Función para cargar hoteles
  const fetchHotels = async () => {
    try {
      setLoading(true);
      // Llamar a la API para obtener los hoteles usando la variable de entorno
      const response = await fetch(`${API_BASE_URL}/hotels`);
      
      if (!response.ok) {
        throw new Error('Error al cargar hoteles');
      }
      
      const data = await response.json();
      setHotels(data);
      
      // También almacenamos en sessionStorage como respaldo
      sessionStorage.setItem('allHotels', JSON.stringify(data));
      
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar los hoteles. ' + error.message);
      
      // Como fallback, intentamos cargar desde sessionStorage
      const storedHotels = sessionStorage.getItem('allHotels');
      if (storedHotels) {
        setHotels(JSON.parse(storedHotels));
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar hoteles al montar el componente o cuando volvemos a la página
  useEffect(() => {
    fetchHotels();
    
    // Comprobamos si venimos de una edición y mostramos mensaje
    if (location.state?.hotelUpdated) {
      // Podríamos mostrar un mensaje de éxito aquí
      const timer = setTimeout(() => {
        // Limpiar el estado después de mostrar el mensaje
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state, navigate]);

  // Filtrado de hoteles por nombre o ubicación
  const filteredHotels = hotels.filter(hotel => 
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

  // Cambiar de página
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Función para cambiar cantidad de hoteles por página
  const handleHotelsPerPageChange = (e) => {
    setHotelsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Resetear a la primera página cuando cambia el tamaño
  };

  // Manejar selección de hoteles
  const handleHotelSelection = (hotelId) => {
    setSelectedHotels(prev => {
      if (prev.includes(hotelId)) {
        return prev.filter(id => id !== hotelId);
      } else {
        return [...prev, hotelId];
      }
    });
  };

  // Crear nuevo hotel
  const handleCreateHotel = () => {
    navigate('/crear-hotel');
  };

  // Editar hotel
  const handleEditHotel = (hotelId) => {
    navigate(`/hotels/edit/${hotelId}`);
  };

  // Confirmar eliminación de hoteles
  const handleDeleteHotels = () => {
    if (selectedHotels.length === 0) return;
    setShowDeleteConfirmation(true);
  };

  // Cancelar eliminación
  const cancelDeleteHotels = () => {
    setShowDeleteConfirmation(false);
  };

  // Ejecutar eliminación de hoteles
  const confirmDeleteHotels = async () => {
    try {
      setDeleteInProgress(true);
      
      // Para cada hotel seleccionado
      for (const hotelId of selectedHotels) {
        // Primero eliminar los detalles del hotel
        try {
          // Usar la variable de entorno
          await fetch(`${API_BASE_URL}/hotel-details/${hotelId}`, {
            method: 'DELETE',
          });
          console.log(`Detalles del hotel ${hotelId} eliminados correctamente`);
        } catch (detailError) {
          console.error(`Error al eliminar detalles del hotel ${hotelId}:`, detailError);
          // Continuar con la eliminación del hotel incluso si falla la eliminación de detalles
        }
        
        // Luego eliminar el hotel principal
        // Usar la variable de entorno
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Error al eliminar hotel ${hotelId}: ${response.statusText}`);
        }
      }
      
      // Actualizar la UI eliminando los hoteles seleccionados
      setHotels(hotels.filter(hotel => !selectedHotels.includes(hotel.id)));
      setSelectedHotels([]);
      
    } catch (error) {
      console.error('Error al eliminar hoteles:', error);
      setError('Error al eliminar hoteles: ' + error.message);
    } finally {
      setDeleteInProgress(false);
      setShowDeleteConfirmation(false);
      
      // Refrescar la lista de hoteles después de eliminar
      fetchHotels();
    }
  };

  // Ver detalles del hotel
  const handleViewDetails = (hotelId) => {
    navigate(`/ver-mas/${hotelId}`);
  };

  // Redireccionar si el usuario no tiene permisos
  if (!hasAdminAccess) {
    return (
      <div className="unauthorized-container">
        <h2>Acceso no autorizado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-container">Cargando hoteles...</div>;
  }

  return (
    <div className="hotels-admin-container">
      <h1>Gestión de Hoteles</h1>
      
      {/* Mensaje de actualización exitosa */}
      {location.state?.hotelUpdated && (
        <div className="success-message">
          Hotel actualizado correctamente
        </div>
      )}
      
      {/* Barra de acciones */}
      <div className="action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar hoteles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="action-buttons">
          <button className="btn-refresh" onClick={fetchHotels} title="Actualizar lista">
            🔄
          </button>
          <button className="btn-create" onClick={handleCreateHotel}>
            <span>+</span> Nuevo Hotel
          </button>
          
          {selectedHotels.length > 0 && (
            <button 
              className="btn-delete" 
              onClick={handleDeleteHotels}
            >
              Eliminar Seleccionados ({selectedHotels.length})
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Tabla de hoteles */}
      <div className="hotels-table-container">
        <table className="hotels-table">
          <thead>
            <tr>
              <th className="select-column">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedHotels(currentHotels.map(hotel => hotel.id));
                    } else {
                      setSelectedHotels([]);
                    }
                  }}
                  checked={selectedHotels.length === currentHotels.length && currentHotels.length > 0}
                />
              </th>
              <th className="image-column">Imagen</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Calificación</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentHotels.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">No se encontraron hoteles</td>
              </tr>
            ) : (
              currentHotels.map(hotel => (
                <tr key={hotel.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedHotels.includes(hotel.id)}
                      onChange={() => handleHotelSelection(hotel.id)}
                    />
                  </td>
                  <td className="image-cell">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="hotel-thumbnail"
                      onClick={() => handleViewDetails(hotel.id)}
                    />
                  </td>
                  <td className="name-cell">{hotel.name}</td>
                  <td>{hotel.location}</td>
                  <td className="rating-cell">
                    <span className="star-rating">
                      <span className="star">★</span> {hotel.rating}
                    </span>
                  </td>
                  <td className="price-cell">${hotel.price}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewDetails(hotel.id)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEditHotel(hotel.id)}
                      title="Editar hotel"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete-single" 
                      onClick={() => {
                        setSelectedHotels([hotel.id]);
                        handleDeleteHotels();
                      }}
                      title="Eliminar hotel"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {filteredHotels.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <div className="pagination-info">
              Mostrando {indexOfFirstHotel + 1}-{Math.min(indexOfLastHotel, filteredHotels.length)} de {filteredHotels.length} hoteles
            </div>
            <div className="per-page-selector">
              <label htmlFor="hotelsPerPage">Hoteles por página:</label>
              <select 
                id="hotelsPerPage" 
                value={hotelsPerPage} 
                onChange={handleHotelsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
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
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar {selectedHotels.length} {selectedHotels.length === 1 ? 'hotel' : 'hoteles'}?</p>
            <p className="warning">Esta acción no se puede deshacer.</p>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={cancelDeleteHotels}
                disabled={deleteInProgress}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={confirmDeleteHotels}
                disabled={deleteInProgress}
              >
                {deleteInProgress ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelsAdmin;