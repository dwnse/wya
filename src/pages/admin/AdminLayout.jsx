import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../../components/Icons'
import './AdminLayout.css'

function AdminLayout() {
    const { admin, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Cerrar sidebar al cambiar de ruta en móvil
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])

    // Cerrar sidebar con Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin'
        }
        return location.pathname.startsWith(path)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/admin/login')
    }

    const menuItems = [
        { path: '/admin', icon: 'home', label: 'Dashboard' },
        { path: '/admin/miembros', icon: 'user', label: 'Miembros' },
        { path: '/admin/clips', icon: 'video', label: 'Clips' },
        { path: '/admin/galeria', icon: 'gallery', label: 'Galería' },
        { path: '/admin/carries', icon: 'star', label: 'Top Clan' },
        { path: '/admin/vetados', icon: 'ban', label: 'Vetados' },
        { path: '/admin/usuarios', icon: 'user', label: 'Usuarios' },
        { path: '/admin/config', icon: 'settings', label: 'Configuración' },
    ]

    return (
        <div className="admin-layout">
            {/* Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="sidebar-brand">
                        <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="Lou" className="brand-logo" />
                        <div className="brand-text">
                            <span>Lou</span>
                            <small>Admin Panel</small>
                        </div>
                    </div>

                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Icon name="close" size={20} />
                    </button>
                </div>

                {/* Admin Profile Section (Top) */}
                <div className="admin-profile-top">
                    <div className="admin-avatar-medium">
                        {admin?.avatar_url ? (
                            <img src={admin.avatar_url} alt={admin.nombre} />
                        ) : (
                            admin?.nombre?.charAt(0)?.toUpperCase() || <Icon name="user" size={20} />
                        )}
                    </div>
                    <div className="admin-info-text">
                        <span className="admin-name-display">{admin?.nombre}</span>
                        <span className="admin-role-display">Nivel {admin?.nivel_acceso}</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <Icon name={item.icon} size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <a href="/" target="_blank" className="back-app-btn">
                        <Icon name="externalLink" size={18} />
                        <span>Ir a la App</span>
                    </a>

                    <button onClick={handleLogout} className="logout-btn-footer">
                        <Icon name="logout" size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Icon name="menu" size={22} />
                    </button>
                    <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="Lou" className="mobile-logo" />
                    <span className="mobile-title">Admin</span>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default AdminLayout
