import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMiembros } from '../hooks/useSupabase'
import { useUserAuth } from '../context/UserAuthContext'
import { Icon } from './Icons.jsx'
import './Header.css'

function Header({ variant = 'default' }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()
    const { data: miembros } = useMiembros()
    const { user, isLoggedIn, logout } = useUserAuth()

    const toggleMenu = () => setMenuOpen(!menuOpen)
    const closeMenu = () => setMenuOpen(false)

    // Cerrar menú con Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    // Cerrar menú al cambiar de ruta
    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    const isActive = (path) => location.pathname === path

    const miembrosConYoutube = miembros?.filter(m =>
        m.enlaces_sociales_miembro?.some(e =>
            e.plataformas_sociales?.nombre === 'YouTube'
        )
    ) || []

    const navLinks = [
        { path: '/clips', icon: 'video', label: 'Clips' },
        { path: '/gallery', icon: 'gallery', label: 'Galería' },
        { path: '/carries', icon: 'star', label: 'Top Clan' },
        { path: '/vetados', icon: 'ban', label: 'Focus' },
    ]

    if (variant === 'home') {
        return (
            <>
                {!menuOpen && (
                    <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
                        <Icon name="menu" size={24} />
                    </button>
                )}

                {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

                <nav className={`sidebar ${menuOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="EXO" className="sidebar-logo" />
                        <div className="sidebar-brand-text">
                            <span className="sidebar-brand">EXO</span>
                        </div>
                        <button className="sidebar-close" onClick={closeMenu}>
                            <Icon name="close" size={20} />
                        </button>
                    </div>

                    {isLoggedIn && (
                        <div className="sidebar-user-top">
                            <div className="user-avatar-medium">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.nombre} />
                                ) : (
                                    <Icon name="user" size={20} />
                                )}
                            </div>
                            <div className="user-info-text">
                                <span className="user-name-display">{user.nombre}</span>
                                <span className="user-role-display">Miembro</span>
                            </div>
                        </div>
                    )}

                    <div className="sidebar-nav">
                        <Link to="/" onClick={closeMenu} className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                            <Icon name="home" size={20} />
                            <span>Inicio</span>
                        </Link>
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={closeMenu}
                                className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <Icon name={link.icon} size={20} />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* ... (omitir logica canales) ... */}
                    {miembrosConYoutube.length > 0 && (
                        <>
                            <div className="sidebar-divider" />
                            <div className="sidebar-section">
                                <span className="sidebar-label">Canales</span>
                                {miembrosConYoutube.map(miembro => {
                                    const youtube = miembro.enlaces_sociales_miembro?.find(
                                        e => e.plataformas_sociales?.nombre === 'YouTube'
                                    )
                                    return youtube ? (
                                        <a
                                            key={miembro.id}
                                            href={youtube.url_perfil}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="nav-item external"
                                        >
                                            <Icon name="youtube" size={20} />
                                            <span>{miembro.nombre_mostrar}</span>
                                            <Icon name="externalLink" size={14} className="external-icon" />
                                        </a>
                                    ) : null
                                })}
                            </div>
                        </>
                    )}

                    <div className="sidebar-footer">
                        <a
                            href="https://discord.gg/exo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="discord-btn"
                        >
                            <Icon name="discord" size={20} />
                            <span>Únete al Discord</span>
                        </a>

                        {isLoggedIn ? (
                            <button className="logout-btn-footer" onClick={logout}>
                                <Icon name="logout" size={18} />
                                <span>Cerrar sesión</span>
                            </button>
                        ) : (
                            <Link to="/login" onClick={closeMenu} className="login-btn">
                                <Icon name="user" size={20} />
                                <span>Iniciar sesión</span>
                            </Link>
                        )}
                    </div>
                </nav>
            </>
        )
    }

    return (
        <header className="header">
            <Link to="/" className="header-brand-link">
                <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="EXO" className="header-logo" />
                <span className="header-brand">EXO</span>
            </Link>

            <nav className="header-nav">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    <Icon name="home" size={18} />
                    <span>Inicio</span>
                </Link>
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                    >
                        <Icon name={link.icon} size={18} />
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <button className="mobile-toggle" onClick={toggleMenu} aria-label="Menu">
                <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
            </button>

            {/* Mobile Menu */}
            {menuOpen && <div className="mobile-overlay" onClick={closeMenu} />}
            <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <img src={`${import.meta.env.BASE_URL}images/logo123.jpg`} alt="EXO" className="mobile-nav-logo" />
                    <span>EXO</span>
                    <button className="mobile-nav-close" onClick={closeMenu}>
                        <Icon name="close" size={20} />
                    </button>
                </div>
                <div className="mobile-nav-links">
                    <Link to="/" onClick={closeMenu} className={isActive('/') ? 'active' : ''}>
                        <Icon name="home" size={20} />
                        Inicio
                    </Link>
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeMenu}
                            className={isActive(link.path) ? 'active' : ''}
                        >
                            <Icon name={link.icon} size={20} />
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    )
}

export default Header
