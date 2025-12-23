import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home.jsx'
import Clips from './pages/Clips.jsx'
import Gallery from './pages/Gallery.jsx'
import Carries from './pages/Carries.jsx'
import Vetados from './pages/Vetados.jsx'
import UserAuth from './pages/UserAuth.jsx'

// Admin pages
import Login from './pages/admin/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminMiembros from './pages/admin/AdminMiembros.jsx'
import AdminClips from './pages/admin/AdminClips.jsx'
import AdminGaleria from './pages/admin/AdminGaleria.jsx'
import AdminCarries from './pages/admin/AdminCarries.jsx'
import AdminVetados from './pages/admin/AdminVetados.jsx'
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminConfig from './pages/admin/AdminConfig.jsx'

function App() {
    return (
        <AuthProvider>
            <UserAuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/clips" element={<Clips />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/carries" element={<Carries />} />
                    <Route path="/vetados" element={<Vetados />} />
                    <Route path="/login" element={<UserAuth />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="miembros" element={<AdminMiembros />} />
                        <Route path="clips" element={<AdminClips />} />
                        <Route path="galeria" element={<AdminGaleria />} />
                        <Route path="carries" element={<AdminCarries />} />
                        <Route path="vetados" element={<AdminVetados />} />
                        <Route path="usuarios" element={<AdminUsuarios />} />
                        <Route path="config" element={<AdminConfig />} />
                    </Route>
                </Routes>
            </UserAuthProvider>
        </AuthProvider>
    )
}

export default App
