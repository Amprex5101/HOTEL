import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Manejar cierre del menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Verificar si el usuario tiene permisos de administración
  const hasAdminAccess = user && ['admin', 'editor', 'moderator'].includes(user.role);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">HOTELES</Link>
      </div>
      
      <div className="navbar-links">
        {user ? (
          // Usuario autenticado
          <div className="user-menu">
            {/* Menú de administración solo para roles específicos */}
            {hasAdminAccess && (
              <div className="admin-dropdown" ref={menuRef}>
                <button 
                  className="admin-menu-button"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                >
                  Administración <span className={`dropdown-arrow ${adminMenuOpen ? 'open' : ''}`}>▼</span>
                </button>
                {adminMenuOpen && (
                  <div className="admin-dropdown-content">
                    <Link to="/users" onClick={() => setAdminMenuOpen(false)}>
                      Gestionar Usuarios
                    </Link>
                    <Link to="/hotels/admin" onClick={() => setAdminMenuOpen(false)}>
                      Gestionar Hoteles
                    </Link>
                    <Link to="/rooms/admin" onClick={() => setAdminMenuOpen(false)}>
                      Gestionar Habitaciones
                    </Link>
                    <Link to="/promotions/admin" onClick={() => setAdminMenuOpen(false)}>
                      Gestionar Promociones
                    </Link>
                  </div>
                )}
              </div>
            )}
            <span className="username">
              Hola, {user.username}
              {user.role && (
                <span className="user-role">({user.role})</span>
              )}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar sesión
            </button>
          </div>
        ) : (
          // Usuario no autenticado
          <>
            <Link to="/login" className="nav-link">Iniciar sesión</Link>
            <Link to="/register" className="nav-link">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar