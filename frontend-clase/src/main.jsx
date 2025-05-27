import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from './Layout.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'  // Importar el nuevo componente
import Editar from './pages/Editar.jsx'
import Crear from './pages/Crear.jsx'
import VerMas from './pages/VerMas.jsx'
import Reserva from './pages/Reserva.jsx'
import HotelsAdmin from './pages/HotelsAdmin.jsx'
import EditHotel from './pages/EditHotel.jsx'
import CrearHotel from './pages/CrearHotel.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Rutas públicas */}
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            
            {/* Rutas para usuarios autenticados */}
            <Route element={<ProtectedRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/ver-mas/:id' element={<VerMas />} />
              <Route path='/reserva/:id' element={<Reserva />} />
              
              {/* Rutas exclusivas de administración (admin, editor, moderator) */}
              <Route element={<AdminRoute />}>
                <Route path='/users' element={<Users />} /> 
                <Route path="/editar/:id" element={<Editar />} />
                <Route path="/crear" element={<Crear />} />
                <Route path="/hotels/admin" element={<HotelsAdmin />} />
                <Route path="/hotels/edit/:id" element={<EditHotel />} />
                <Route path="/crear-hotel" element={<CrearHotel />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
