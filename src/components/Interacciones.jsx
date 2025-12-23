import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icons.jsx'
import { useUserAuth } from '../context/UserAuthContext'
import {
    obtenerReacciones,
    toggleReaccion,
    obtenerComentarios,
    crearComentario,
    eliminarComentarioPublico
} from '../services/supabaseService.js'
import './Interacciones.css'

const EMOJIS = ['🔥', '❤️', '😂', '👏', '💀']

// Componente de Reacciones
export function Reacciones({ tipoContenido, contenidoId, compact = false }) {
    const { user, isLoggedIn } = useUserAuth()
    const location = useLocation()
    const [conteo, setConteo] = useState({})
    const [misReacciones, setMisReacciones] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        cargarReacciones()
    }, [tipoContenido, contenidoId, user?.id])

    async function cargarReacciones() {
        try {
            const data = await obtenerReacciones(tipoContenido, contenidoId, user?.id)
            setConteo(data.conteo)
            setMisReacciones(data.misReacciones)
        } catch (error) {
            console.error('Error cargando reacciones:', error)
        }
    }

    async function handleToggle(emoji) {
        if (!isLoggedIn || loading) return
        setLoading(true)

        try {
            const result = await toggleReaccion(tipoContenido, contenidoId, emoji, user.id)

            // Actualizar estado local
            setConteo(prev => ({
                ...prev,
                [emoji]: Math.max(0, (prev[emoji] || 0) + (result.added ? 1 : -1))
            }))

            setMisReacciones(prev =>
                result.added
                    ? [...prev, emoji]
                    : prev.filter(e => e !== emoji)
            )
        } catch (error) {
            console.error('Error toggling reacción:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalReacciones = Object.values(conteo).reduce((a, b) => a + b, 0)

    if (compact && totalReacciones === 0 && !isLoggedIn) {
        return null
    }

    return (
        <div className={`reacciones ${compact ? 'compact' : ''}`}>
            {EMOJIS.map(emoji => {
                const count = conteo[emoji] || 0
                const isActive = misReacciones.includes(emoji)

                if (compact && count === 0 && !isLoggedIn) return null

                return (
                    <button
                        key={emoji}
                        className={`reaccion-btn ${isActive ? 'active' : ''} ${!isLoggedIn ? 'disabled' : ''}`}
                        onClick={() => isLoggedIn ? handleToggle(emoji) : null}
                        disabled={loading || !isLoggedIn}
                        title={!isLoggedIn ? 'Inicia sesión para reaccionar' : isActive ? 'Quitar reacción' : 'Reaccionar'}
                    >
                        <span className="emoji">{emoji}</span>
                        {count > 0 && <span className="count">{count}</span>}
                    </button>
                )
            })}

            {!isLoggedIn && (
                <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="login-prompt-btn"
                >
                    <Icon name="user" size={14} />
                    Iniciar sesión
                </Link>
            )}
        </div>
    )
}

// Componente de Comentarios
export function Comentarios({ tipoContenido, contenidoId }) {
    const { user, isLoggedIn } = useUserAuth()
    const location = useLocation()
    const [comentarios, setComentarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [mostrar, setMostrar] = useState(false)
    const [contenido, setContenido] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (mostrar) {
            cargarComentarios()
        }
    }, [mostrar, tipoContenido, contenidoId])

    async function cargarComentarios() {
        try {
            setLoading(true)
            const data = await obtenerComentarios(tipoContenido, contenidoId)
            setComentarios(data || [])
        } catch (error) {
            console.error('Error cargando comentarios:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!isLoggedIn) {
            setError('Debes iniciar sesión para comentar')
            return
        }
        if (!contenido.trim()) {
            setError('Escribe un comentario')
            return
        }
        if (contenido.length > 500) {
            setError('El comentario es muy largo (máx. 500 caracteres)')
            return
        }

        setEnviando(true)
        try {
            const nuevoComentario = await crearComentario(
                tipoContenido,
                contenidoId,
                user.nombre,
                contenido,
                user.id
            )
            setComentarios(prev => [nuevoComentario, ...prev])
            setContenido('')
        } catch (error) {
            setError('Error al enviar comentario')
            console.error(error)
        } finally {
            setEnviando(false)
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) return
        try {
            await eliminarComentarioPublico(id, user.id)
            setComentarios(prev => prev.filter(c => c.id !== id))
        } catch (error) {
            console.error('Error al eliminar:', error)
            setError('No se pudo eliminar el comentario')
        }
    }

    function formatFecha(fecha) {
        const date = new Date(fecha)
        const now = new Date()
        const diff = now - date
        const mins = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (mins < 1) return 'Ahora'
        if (mins < 60) return `Hace ${mins}m`
        if (hours < 24) return `Hace ${hours}h`
        if (days < 7) return `Hace ${days}d`
        return date.toLocaleDateString('es-ES')
    }

    return (
        <div className="comentarios-section">
            <button
                className="comentarios-toggle"
                onClick={() => setMostrar(!mostrar)}
            >
                <Icon name="file" size={16} />
                <span>{comentarios.length > 0 ? comentarios.length : ''} Comentarios</span>
                <Icon name="chevronRight" size={16} className={mostrar ? 'rotated' : ''} />
            </button>

            {mostrar && (
                <div className="comentarios-content">
                    {/* Formulario o Login Prompt */}
                    {isLoggedIn ? (
                        <form className="comentario-form" onSubmit={handleSubmit}>
                            <div className="form-user-info">
                                <div className="user-avatar">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.nombre} />
                                    ) : (
                                        <Icon name="user" size={18} />
                                    )}
                                </div>
                                <span className="user-name">{user.nombre}</span>
                            </div>
                            <textarea
                                placeholder="Escribe un comentario..."
                                value={contenido}
                                onChange={(e) => setContenido(e.target.value)}
                                maxLength={500}
                                rows={3}
                            />
                            <div className="form-footer">
                                <span className="char-count">{contenido.length}/500</span>
                                {error && <span className="form-error">{error}</span>}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={enviando || !contenido.trim()}
                                >
                                    {enviando ? 'Enviando...' : 'Comentar'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="login-prompt">
                            <Icon name="user" size={24} />
                            <p>Inicia sesión para comentar</p>
                            <Link
                                to="/login"
                                state={{ from: location.pathname }}
                                className="login-prompt-link"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    )}

                    {/* Lista de comentarios */}
                    <div className="comentarios-lista">
                        {loading && <p className="loading-text">Cargando...</p>}

                        {!loading && comentarios.length === 0 && (
                            <p className="empty-text">Sé el primero en comentar</p>
                        )}

                        {comentarios.map(comentario => {
                            const esPropio = user?.id === comentario.usuario_id
                            const esCEO = user?.rol === 'CEO'
                            const puedeEliminar = esPropio || esCEO

                            return (
                                <div key={comentario.id} className="comentario">
                                    <div className="comentario-header">
                                        <div className="comentario-info-top">
                                            <span className={`comentario-autor ${esPropio ? 'propio' : ''}`}>
                                                {comentario.autor}
                                                {comentario.usuarios?.roles?.nombre === 'CEO' && (
                                                    <span className="badge-ceo" title="CEO">👑</span>
                                                )}
                                            </span>
                                            <span className="comentario-fecha">
                                                {formatFecha(comentario.creado_en)}
                                            </span>
                                        </div>
                                        {puedeEliminar && (
                                            <button
                                                className="delete-comment-btn"
                                                onClick={() => handleDelete(comentario.id)}
                                                title="Eliminar comentario"
                                            >
                                                <Icon name="trash" size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="comentario-contenido">{comentario.contenido}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// Componente combinado
export function InteraccionesPanel({ tipoContenido, contenidoId }) {
    return (
        <div className="interacciones-panel">
            <Reacciones tipoContenido={tipoContenido} contenidoId={contenidoId} />
            <Comentarios tipoContenido={tipoContenido} contenidoId={contenidoId} />
        </div>
    )
}

export default InteraccionesPanel
