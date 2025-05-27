import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';

function AccessDenied() {
  const navigate = useNavigate();
  
  return (
    <div className="access-denied-container">
      <h2>Acceso Denegado</h2>
      <p>Lo sentimos, no tienes permisos para acceder a esta sección.</p>
      <p>Esta área está reservada para administradores, editores y moderadores.</p>
      <button 
        className="back-button"
        onClick={() => navigate('/dashboard')}
      >
        Volver al Dashboard
      </button>
    </div>
  );
}

export default AccessDenied;