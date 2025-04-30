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
import Editar from './pages/Editar.jsx'
import Crear from './pages/Crear.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path='/dashboard' element={<Dashboard />} /> 
              <Route path='/users' element={<Users />} /> 
              <Route path="/editar/:id" element={<Editar />} />
              <Route path="/crear" element={<Crear />} />
              {/* Puedes agregar más rutas protegidas aquí */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
