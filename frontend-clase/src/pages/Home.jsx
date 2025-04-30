import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleReserveClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className='home-container'>
      <h1>Reservación de Hoteles</h1>
      <h2>Conoce, reserva y disfruta</h2>
      <button 
        className="reserve-now-btn"
        onClick={handleReserveClick}
      >
        RESERVA YA
      </button>
    </div>
  )
}

export default Home;