import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useUserAuth } from '../context/UserAuthContext'
import { Icon } from '../components/Icons.jsx'
import './UserAuth.css'

function UserAuth() {
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [nombre, setNombre] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { login, register } = useUserAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from || '/'

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    // Min 8 chars, 1 letter, 1 number
    const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            // Validación Email General
            if (!email.trim() || !EMAIL_REGEX.test(email)) {
                throw new Error('Por favor ingresa un email válido: ejemplo@correo.com')
            }

            if (mode === 'login') {
                if (!password) throw new Error('Ingresa tu contraseña')

                await login(email, password)
                navigate(from, { replace: true })
            } else {
                // Validaciones de Registro
                if (!nombre.trim() || nombre.length < 3) {
                    throw new Error('El nombre debe tener al menos 3 caracteres')
                }

                if (!PASSWORD_REGEX.test(password)) {
                    throw new Error('La contraseña debe tener al menos 8 caracteres, incluir una letra y un número.')
                }

                if (password !== confirmPassword) {
                    throw new Error('Las contraseñas no coinciden')
                }

                await register(email, password, nombre)
                setSuccess('¡Registro exitoso! Por favor revisa tu correo para verificar la cuenta.')
                // No redirigir automáticamente para que lean el mensaje
            }
        } catch (err) {
            setError(err.message || 'Error de autenticación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="user-auth-page">
            <div className="auth-background">
                <div className="auth-gradient"></div>
            </div>

            <div className="auth-container">
                <Link to="/" className="auth-logo">
                    <img src="/images/logo123.jpg" alt="EXO" />
                    <span>EXO</span>
                </Link>

                <div className="auth-card">
                    <div className="auth-tabs">
                        <button
                            className={mode === 'login' ? 'active' : ''}
                            onClick={() => { setMode('login'); setError(''); }}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            className={mode === 'register' ? 'active' : ''}
                            onClick={() => { setMode('register'); setError(''); }}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {mode === 'register' && (
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Tu nombre de usuario"
                                    required
                                    maxLength={50}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === 'register' ? "Min. 8 caracteres" : "••••••••"}
                                required
                                minLength={6}
                            />
                        </div>

                        {mode === 'register' && (
                            <div className="form-group">
                                <label>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite tu contraseña"
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">
                                <Icon name="warning" size={16} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="auth-success">
                                <Icon name="star" size={16} />
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <p className="auth-note">
                        {mode === 'login'
                            ? '¿No tienes cuenta? Regístrate para comentar y reaccionar.'
                            : 'Al registrarte podrás comentar y reaccionar en clips y galería.'}
                    </p>
                </div>

                <Link to="/" className="back-link">
                    <Icon name="chevronRight" size={16} className="rotated" />
                    Volver al inicio
                </Link>
            </div>
        </div>
    )
}

export default UserAuth
