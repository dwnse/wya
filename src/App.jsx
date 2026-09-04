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
import MemberRequest from './pages/MemberRequest.jsx'
import Community from './pages/Community.jsx'
import Login from './pages/admin/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminMiembros from './pages/admin/AdminMiembros.jsx'
import AdminClips from './pages/admin/AdminClips.jsx'
import AdminCarries from './pages/admin/AdminCarries.jsx'
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminPuntos from './pages/admin/AdminPuntos.jsx'
import AdminEventos from './pages/admin/AdminEventos.jsx'
import AdminSolicitudes from './pages/admin/AdminSolicitudes.jsx'
import AdminCommunity from './pages/admin/AdminCommunity.jsx'

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
                    <Route path="/actividad" element={<Community />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/solicitar-membresia" element={<MemberRequest />} />
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
                        <Route path="solicitudes" element={<AdminSolicitudes />} />
                        <Route path="actividad" element={<AdminCommunity section="actividad" />} />
                        <Route path="desafios" element={<AdminCommunity section="desafios" />} />
                        <Route path="votos" element={<AdminCommunity section="votos" />} />
                        <Route path="discord" element={<AdminCommunity section="discord" />} />
                    </Route>
                </Routes>
            </UserAuthProvider>
        </AuthProvider>
    )
}

export default App
