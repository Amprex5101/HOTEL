import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const token = authService.getToken();

  if (loading) {
    return <div>Cargando...</div>; // O puedes usar un componente de carga
  }

  if (!user || !token) {
    // Redirigir al login si no hay usuario autenticado
    return <Navigate to="/login" replace />;
  }

  // Renderizar las rutas hijas usando Outlet
  return <Outlet />;
}

export default ProtectedRoute