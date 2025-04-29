import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'
import ErrorForm from '../components/ErrorForm'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    password: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar que las contraseñas coinciden
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Crear el nombre completo combinando nombre y apellido
      const fullName = `${formData.nombre} ${formData.apellido}`.trim();
      
      // Llamar al servicio de registro con todos los datos necesarios
      await register(
        formData.usuario,      // username
        formData.password,     // password
        fullName,              // name
        formData.email        // email
      );
      
      // Redirigir al dashboard después del registro exitoso
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className='container-register'>
      <div className='register-card'>
        <div className='register-header'>
          <h1>Crear Cuenta</h1>
          <p>Regístrate para comenzar</p>
        </div>
        
        {(error || authError) && <ErrorForm message={error || authError} />}
        
        <form className='form-register' onSubmit={handleSubmit}>
          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor="nombre">Nombre</label>
              <input 
                type="text" 
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder='Tu nombre'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor="apellido">Apellido</label>
              <input 
                type="text" 
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder='Tu apellido'
                required
              />
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='tu@email.com'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="usuario">Nombre de Usuario</label>
            <input 
              type="text" 
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder='Elige un nombre de usuario'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder='Crea una contraseña segura'
              required
              minLength={6}
            />
          </div>

          <div className='form-group'>
            <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              placeholder='Confirma tu contraseña'
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className='btn-register'
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className='register-footer'>
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register