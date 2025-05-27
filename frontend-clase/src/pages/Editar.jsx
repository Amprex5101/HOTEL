import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Editar.css';

// Usar la variable de entorno para la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

function Editar() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'user',
    avatar: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Obtener datos del usuario al cargar la página
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        
        // Llenar el formulario con los datos del usuario
        setFormData({
          username: response.data.username || '',
          name: response.data.name || '',
          email: response.data.email || '',
          role: response.data.role || 'user',
          avatar: response.data.avatar || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el usuario:', err);
        setError('No se pudo cargar la información del usuario.');
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Enviar datos actualizados al servidor usando la variable de entorno
      await axios.put(`${API_BASE_URL}/users/${id}`, formData);
      
      setSuccessMessage('Usuario actualizado correctamente');
      
      // Mostrar mensaje de éxito por un tiempo antes de redirigir
      setTimeout(() => {
        navigate('/users');
      }, 2000);
      
    } catch (err) {
      console.error('Error al actualizar el usuario:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al actualizar la información.');
      setSaving(false);
    }
  };
  
  // Cancelar edición
  const handleCancel = () => {
    navigate('/users');
  };
  
  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="edit-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar mensaje de error si lo hay
  if (error) {
    return (
      <div className="edit-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/users')}>Volver a la lista de usuarios</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="edit-container">
      <div className="edit-header">
        <h1>Editar Usuario</h1>
        <p>Modifica la información del usuario seleccionado</p>
      </div>
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="edit-form-container">
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-preview">
            <div className="avatar-preview">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar del usuario" />
              ) : (
                <div className="default-avatar">
                  {formData.name.charAt(0) || formData.username.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-preview-info">
              <h3>{formData.name || formData.username}</h3>
              <span className={`role-badge ${formData.role}`}>{formData.role}</span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled // El nombre de usuario no debería cambiar
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese nombre completo"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese correo electrónico"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Usuario</option>
              <option value="moderator">Moderador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar">URL de Avatar (opcional)</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="URL de imagen para avatar"
            />
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

export default Editar;