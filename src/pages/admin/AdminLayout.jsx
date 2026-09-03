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
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])
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

    const menuGroups = [
        {
            label: 'Resumen',
            items: [{ path: '/admin', icon: 'home', label: 'Dashboard' }]
        },
        {
            label: 'Comunidad',
            items: [
                { path: '/admin/solicitudes', icon: 'file', label: 'Solicitudes' },
                { path: '/admin/miembros', icon: 'user', label: 'Miembros' },
                { path: '/admin/usuarios', icon: 'user', label: 'Usuarios' }
            ]
        },
        {
            label: 'Contenido',
            items: [
                { path: '/admin/puntos', icon: 'target', label: 'Puntos' },
                { path: '/admin/eventos', icon: 'calendar', label: 'Eventos' },
                { path: '/admin/clips', icon: 'video', label: 'Clips' },
                { path: '/admin/carries', icon: 'star', label: 'Top Clan' }
            ]
        }
    ]

    return (
        <div className="admin-layout">
            {}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="sidebar-brand">
                        <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="Ryo" className="brand-logo" />
                        <div className="brand-text">
                            <span>Ryo</span>
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

                {}
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
                    {menuGroups.map(group => <div className="menu-group" key={group.label}><span className="menu-group-label">{group.label}</span>{group.items.map(item => <Link key={item.path} to={item.path} className={`menu-item ${isActive(item.path) ? 'active' : ''}`}><Icon name={item.icon} size={20} /><span>{item.label}</span></Link>)}</div>)}
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

            {}
            <main className="admin-main">
                {}
                <header className="mobile-header">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Icon name="menu" size={22} />
                    </button>
                    <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="Ryo" className="mobile-logo" />
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
