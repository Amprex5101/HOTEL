import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';

function AdminRoute() {
  const { user, isAuthenticated } = useAuth();
  
  // Verificar si el usuario tiene permisos de administración
  const hasAdminAccess = user && ['admin', 'editor', 'moderator'].includes(user.role);
  

  
  // Si está autenticado pero no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasAdminAccess) {
    return <AccessDenied />;
  }
  
  // Si está autenticado y tiene permisos, mostrar la ruta
  return <Outlet />;
}

export default AdminRoute;