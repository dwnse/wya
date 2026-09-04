import { Link, useLocation } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'
import { Icon } from './Icons.jsx'
import './Header.css'

const navLinks = [
    { path: '/', icon: 'home', label: 'Inicio' },
    { path: '/tier-list', icon: 'trophy', label: 'Tier List' },
    { path: '/clips', icon: 'video', label: 'Clips' },
    { path: '/carries', icon: 'user', label: 'Clan' },
    { path: '/events', icon: 'calendar', label: 'Eventos' }
    , { path: '/actividad', icon: 'file', label: 'Actividad' }
]

function Header() {
    const location = useLocation()
    const { user, isLoggedIn, logout } = useUserAuth()

    const isActive = (path) => path === '/'
        ? location.pathname === path
        : location.pathname.startsWith(path)

    return (
        <>
            <header className="site-header">
            <Link to="/" className="site-brand" aria-label="Ryo, inicio">
                <span className="site-brand-mark"><Icon name="skull" size={22} /></span>
                <span className="site-brand-name">RYO</span>
            </Link>

            <nav className="site-nav" aria-label="Navegación principal">
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`site-nav-link ${isActive(link.path) ? 'active' : ''}`}
                        aria-label={link.label}
                        aria-current={isActive(link.path) ? 'page' : undefined}
                    >
                        <Icon name={link.icon} size={19} />
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="site-actions">
                {isLoggedIn ? (
                    <Link to="/profile" className="profile-link" aria-label="Abrir perfil">
                        <span className="profile-avatar">
                            {user?.avatar_url
                                ? <img src={user.avatar_url} alt="" />
                                : <Icon name="user" size={17} />}
                        </span>
                        <span className="profile-name">{user?.nombre || 'Perfil'}</span>
                    </Link>
                ) : (
                    <Link to="/login" className="login-link" aria-label="Iniciar sesión">
                        <Icon name="user" size={18} />
                        <span>Entrar</span>
                    </Link>
                )}
                {isLoggedIn && (
                    <button className="icon-action" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
                        <Icon name="logout" size={18} />
                    </button>
                )}
            </div>

            </header>

        <nav className="mobile-nav" aria-label="Navegación móvil">
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                        aria-label={link.label}
                        aria-current={isActive(link.path) ? 'page' : undefined}
                    >
                        <Icon name={link.icon} size={20} />
                        <span>{link.label}</span>
                    </Link>
                ))}
                <Link to={isLoggedIn ? '/profile' : '/login'} className="mobile-nav-link" aria-label="Perfil">
                    <Icon name="user" size={20} />
                    <span>Perfil</span>
                </Link>
            </nav>
        </>
    )
}

export default Header
