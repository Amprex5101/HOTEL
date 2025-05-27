import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Crear.css';

// Usar la variable de entorno para la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

function Crear() {
  const navigate = useNavigate();
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'user',
    avatar: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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
    
    // Validar que las contraseñas coinciden
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Enviar datos al servidor usando la variable de entorno
      await axios.post(`${API_BASE_URL}/users`, {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar
      });
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Usuario creado correctamente');
      
      // Redireccionar después de un tiempo
      setTimeout(() => {
        navigate('/users');
      }, 2000);
      
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setError(err.response?.data?.message || 'Error al crear el usuario');
      setLoading(false);
    }
  };
  
  // Cancelar creación
  const handleCancel = () => {
    navigate('/users');
  };
  
  return (
    <div className="create-container">
      <div className="create-header">
        <h1>Crear Nuevo Usuario</h1>
        <p>Completa el formulario para crear un nuevo usuario</p>
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
      
      <div className="create-form-container">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Nombre de usuario *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingrese nombre de usuario"
                required
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingrese contraseña"
                required
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme contraseña"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Rol del usuario</label>
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
          </div>
          
          {formData.avatar && (
            <div className="avatar-preview-container">
              <p>Vista previa del avatar:</p>
              <div className="avatar-preview">
                <img src={formData.avatar} alt="Avatar" />
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
              {loading ? 'Creando usuario...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Crear;