import { useState, useEffect, useMemo } from 'react'
import { obtenerTodosClipsAdmin, actualizarEstadoClip } from '../../services/supabaseService'
import Loading from '../../components/Loading'
import ErrorMessage from '../../components/ErrorMessage'
import { Icon } from '../../components/Icons'
import './AdminClips.css'

// Helper para video data (reutilizado de Clips.jsx)
function getVideoData(url) {
    if (!url) return null
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = null
        if (url.includes('youtube.com/embed/')) return { type: 'iframe', src: url }
        if (url.includes('youtube.com/watch')) videoId = new URLSearchParams(new URL(url).search).get('v')
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0]
        else if (url.includes('youtube.com/shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0]
        if (videoId) return { type: 'iframe', src: `https://www.youtube.com/embed/${videoId}` }
    }
    if (url.includes('medal.tv')) {
        let src = url
        if (url.includes('/clips/')) src = url.replace('/clips/', '/clip/')
        const symbol = src.includes('?') ? '&' : '?'
        return { type: 'iframe', src: `${src}${symbol}autoplay=0&muted=0&loop=0&controls=1` }
    }
    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || url.includes('cdn.discordapp.com')) {
        return { type: 'video', src: url }
    }
    return null
}

function AdminClips() {
    const [allClips, setAllClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [filterStatus, setFilterStatus] = useState('pendiente') // 'pendiente' | 'aprobado' | 'rechazado' | 'todos'

    useEffect(() => {
        cargarClips()
    }, [])

    async function cargarClips() {
        try {
            setLoading(true)
            console.log('Cargando todos los clips...')
            const data = await obtenerTodosClipsAdmin()
            console.log('Clips recibidos:', data)
            setAllClips(data || [])
        } catch (err) {
            console.error('Error cargando clips:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleEstado(id, nuevoEstado) {
        try {
            setActionLoading(id)
            await actualizarEstadoClip(id, nuevoEstado)
            // Actualizar localmente
            setAllClips(prev => prev.map(c =>
                c.id === id ? { ...c, estado: nuevoEstado } : c
            ))
        } catch (err) {
            console.error(err)
            alert('Error al actualizar estado: ' + err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredClips = useMemo(() => {
        if (filterStatus === 'todos') return allClips;
        return allClips.filter(c => c.estado === filterStatus);
    }, [allClips, filterStatus]);

    if (loading) return <Loading text="Cargando clips..." />
    if (error) return <ErrorMessage message={error} onRetry={cargarClips} />

    return (
        <div className="admin-clips-page">
            <header className="page-header">
                <h1>Gestión de Clips</h1>
                <p>Revisa y aprueba los clips subidos por la comunidad</p>
            </header>

            <div className="admin-filters">
                <button
                    className={`filter-btn ${filterStatus === 'pendiente' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pendiente')}
                >
                    Pendientes
                    <span className="badge-count">{allClips.filter(c => c.estado === 'pendiente').length}</span>
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'aprobado' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('aprobado')}
                >
                    Aprobados
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'rechazado' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('rechazado')}
                >
                    Rechazados
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'todos' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('todos')}
                >
                    Todos
                </button>
            </div>

            {filteredClips.length === 0 ? (
                <div className="empty-admin-state">
                    <Icon name="video" size={48} />
                    <h3>No hay clips en esta categoría</h3>
                    <p>Cambia el filtro para ver otros clips.</p>
                </div>
            ) : (
                <div className="admin-clips-grid">
                    {filteredClips.map(clip => {
                        const videoData = getVideoData(clip.youtube_url)
                        const usuario = clip.usuarios || {}

                        return (
                            <div key={clip.id} className="admin-clip-card" data-status={clip.estado}>
                                <div className="clip-header">
                                    <div className="user-info">
                                        <div className="avatar">
                                            {usuario.avatar_url ? (
                                                <img src={usuario.avatar_url} alt={usuario.nombre} />
                                            ) : (
                                                <span>{usuario.nombre?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="username">{usuario.nombre}</span>
                                            <span className="date">{new Date(clip.creado_en).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className={`status-badge status-${clip.estado}`}>
                                        {clip.estado}
                                    </div>
                                </div>

                                <div className="clip-preview">
                                    {videoData?.type === 'iframe' && (
                                        <iframe src={videoData.src} title="Preview" allowFullScreen></iframe>
                                    )}
                                    {videoData?.type === 'video' && (
                                        <video src={videoData.src} controls></video>
                                    )}
                                    {!videoData && (
                                        <div className="no-preview">
                                            <p>Video no previsualizable</p>
                                            <a href={clip.youtube_url} target="_blank" rel="noopener noreferrer">Ver Enlace</a>
                                        </div>
                                    )}
                                </div>

                                <div className="clip-details">
                                    <h4>{clip.titulo}</h4>
                                    {clip.descripcion && <p>{clip.descripcion}</p>}
                                    <div className="clip-url-raw">
                                        <small>{clip.youtube_url}</small>
                                    </div>
                                </div>

                                <div className="clip-actions">
                                    {clip.estado !== 'rechazado' && (
                                        <button
                                            className="btn-reject"
                                            onClick={() => handleEstado(clip.id, 'rechazado')}
                                            disabled={actionLoading === clip.id}
                                        >
                                            <Icon name="close" size={18} />
                                            Rechazar
                                        </button>
                                    )}
                                    {clip.estado !== 'aprobado' && (
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleEstado(clip.id, 'aprobado')}
                                            disabled={actionLoading === clip.id}
                                        >
                                            <Icon name="check" size={18} />
                                            Aprobar
                                        </button>
                                    )}
                                    {clip.estado !== 'pendiente' && (
                                        <button
                                            className="btn-pending"
                                            onClick={() => handleEstado(clip.id, 'pendiente')}
                                            disabled={actionLoading === clip.id}
                                        >
                                            <Icon name="clock" size={18} />
                                            Pendiente
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AdminClips
