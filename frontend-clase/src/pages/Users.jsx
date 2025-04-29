import { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Obtener TODOS los usuarios de la base de datos
        const response = await axios.get('http://localhost:3000/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setLoading(false);
        console.error('Error al cargar usuarios:', err);
      }
    };

    fetchUsers();
  }, []);

  // Filtrado de usuarios por nombre
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Cambiar de página
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Cambiar cantidad de usuarios por página
  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Resetear a la primera página cuando cambia el tamaño
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="error-message">
          <h3>¡Ups! Algo salió mal</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Intentar de nuevo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Lista de Usuarios</h1>
        <p>Todos los usuarios registrados en el sistema</p>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar usuario..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <h3>No hay usuarios que coincidan con la búsqueda</h3>
          {searchTerm && <button onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>}
        </div>
      ) : (
        <>
          <div className="pagination-controls">
            <div className="pagination-info">
              Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="per-page-selector">
              <label htmlFor="usersPerPage">Usuarios por página:</label>
              <select 
                id="usersPerPage" 
                value={usersPerPage} 
                onChange={handleUsersPerPageChange}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="users-list">
            <div className="users-list-header">
              <div className="user-avatar-header">Avatar</div>
              <div className="user-name-header">Nombre</div>
              <div className="user-username-header">Usuario</div>
              <div className="user-email-header">Correo</div>
              <div className="user-role-header">Rol</div>
              <div className="user-status-header">Estado</div>
              <div className="user-login-header">Último acceso</div>
            </div>
            
            {currentUsers.map((user) => (
              <div className="user-list-item" key={user.id || user._id}>
                <div className="user-avatar-cell">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`Avatar de ${user.name || user.username}`} />
                  ) : (
                    <div className="default-avatar">
                      {(user.name?.charAt(0) || user.username?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-name-cell">{user.name || 'Sin nombre'}</div>
                <div className="user-username-cell">{user.username || 'Sin usuario'}</div>
                <div className="user-email-cell">{user.email || 'Sin correo'}</div>
                <div className="user-role-cell">
                  <span className={`role-badge ${user.role?.toLowerCase() || 'user'}`}>
                    {user.role || 'Usuario'}
                  </span>
                </div>
                <div className="user-status-cell">
                  <span className="status-indicator online"></span>
                  Activo
                </div>
                <div className="user-login-cell">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                </div>
              </div>
            ))}
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
        </>
      )}
    </div>
  );
}

export default Users;