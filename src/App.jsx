import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home.jsx'
import Clips from './pages/Clips.jsx'
import Gallery from './pages/Gallery.jsx'
import Carries from './pages/Carries.jsx'
import Vetados from './pages/Vetados.jsx'
import UserAuth from './pages/UserAuth.jsx'
import TierList from './pages/TierList.jsx'
import Events from './pages/Events.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/admin/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminMiembros from './pages/admin/AdminMiembros.jsx'
import AdminClips from './pages/admin/AdminClips.jsx'
import AdminCarries from './pages/admin/AdminCarries.jsx'
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminPuntos from './pages/admin/AdminPuntos.jsx'
import AdminEventos from './pages/admin/AdminEventos.jsx'

function App() {
    return (
        <AuthProvider>
            <UserAuthProvider>
                <Routes>
                    {}
                    <Route path="/" element={<Home />} />
                    <Route path="/clips" element={<Clips />} />
                    <Route path="/tier-list" element={<TierList />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/carries" element={<Carries />} />
                    <Route path="/vetados" element={<Vetados />} />
                    <Route path="/login" element={<UserAuth />} />

                    {}
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
                        <Route path="puntos" element={<AdminPuntos />} />
                        <Route path="eventos" element={<AdminEventos />} />
                        <Route path="clips" element={<AdminClips />} />
                        <Route path="carries" element={<AdminCarries />} />
                        <Route path="usuarios" element={<AdminUsuarios />} />
                    </Route>
                </Routes>
            </UserAuthProvider>
        </AuthProvider>
    )
}

export default App
