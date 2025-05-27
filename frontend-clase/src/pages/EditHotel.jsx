import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './EditHotel.css';

// Usar la variable de entorno para la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

function EditHotel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 0,
    price: 0,
    image: '',
    amenities: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estado para manejar las amenidades disponibles
  const [availableAmenities, setAvailableAmenities] = useState([
    'Wi-Fi', 'Piscina', 'Spa', 'Restaurante', 'Gimnasio', 
    'Vista al mar', 'Desayuno incluido', 'Centro de negocios',
    'Transporte al aeropuerto', 'Piscina infinita', 'Spa de lujo',
    'Actividades acuáticas', 'Todo incluido', 'Chimenea',
    'Vistas panorámicas', 'Desayuno gourmet', 'Senderismo',
    'Terraza en azotea', 'Bar de diseñador', 'Galería de arte',
    'Bicicletas gratuitas'
  ]);
  
  // Verificar si el usuario tiene permisos para esta página
  const hasAdminAccess = user && ['admin', 'editor', 'moderator'].includes(user.role);

  // Cargar los datos del hotel al montar el componente
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        // Usar la variable de entorno en lugar de la URL hardcodeada
        const response = await axios.get(`${API_BASE_URL}/hotels/${id}`);
        
        if (response.data) {
          setFormData({
            name: response.data.name || '',
            location: response.data.location || '',
            rating: response.data.rating || 0,
            price: response.data.price || 0,
            image: response.data.image || '',
            amenities: response.data.amenities || []
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del hotel:', error);
        setError(`Error al cargar los datos del hotel: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (hasAdminAccess) {
      fetchHotelData();
    }
  }, [id, hasAdminAccess]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'amenities') {
      // Manejar las amenidades como un array
      const amenity = value;
      
      if (checked) {
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, amenity]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          amenities: prev.amenities.filter(item => item !== amenity)
        }));
      }
    } else if (type === 'number') {
      // Convertir a número
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      // Para campos de texto normales
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name.trim() || !formData.location.trim() || formData.price <= 0) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Usar la variable de entorno en lugar de la URL hardcodeada
      await axios.put(`${API_BASE_URL}/hotels/${id}`, formData);
      
      setSuccessMessage('Hotel actualizado correctamente');
      
      // Redirigir después de mostrar el mensaje de éxito con un estado que indique la actualización
      setTimeout(() => {
        navigate('/hotels/admin', { 
          state: { hotelUpdated: true }
        });
      }, 2000);
    } catch (error) {
      console.error('Error al actualizar el hotel:', error);
      setError(`Error al actualizar el hotel: ${error.response?.data?.message || error.message}`);
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    navigate('/hotels/admin');
  };

  // Redireccionar si no tiene permisos
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
    return (
      <div className="edit-hotel-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información del hotel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-hotel-container">
      <div className="edit-hotel-header">
        <h1>Editar Hotel</h1>
        <p>Modifica la información del hotel seleccionado</p>
      </div>
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="edit-hotel-form-container">
        <form onSubmit={handleSubmit} className="edit-hotel-form">
          <div className="form-preview">
            <div className="hotel-image-preview">
              {formData.image ? (
                <img src={formData.image} alt={formData.name} />
              ) : (
                <div className="default-image">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
            <div className="hotel-preview-info">
              <h3>{formData.name}</h3>
              <span className="hotel-location">{formData.location}</span>
              <div className="hotel-rating">★ {formData.rating}</div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre del Hotel</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre del hotel"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Ubicación</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Ciudad, País"
            />
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
                required
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Precio por noche</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="100"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">URL de la imagen</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <small>Ingresa la URL de una imagen para el hotel</small>
          </div>
          
          <div className="form-group amenities-section">
            <label>Amenidades disponibles</label>
            <div className="amenities-grid">
              {availableAmenities.map(amenity => (
                <div key={amenity} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    name="amenities"
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleChange}
                  />
                  <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditHotel;