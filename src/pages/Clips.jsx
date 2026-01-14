import { useState, useMemo } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Icon } from '../components/Icons.jsx'
import { InteraccionesPanel } from '../components/Interacciones.jsx'
import { useClipsAgrupados, useMisClips } from '../hooks/useSupabase.js'
import { useUserAuth } from '../context/UserAuthContext'
import { crearClip } from '../services/supabaseService'
import './Clips.css'

// Detecta y transforma URLs de video (YouTube, Medal, Discord, mp4)
function getVideoData(url) {
    if (!url) return null

    // 1. YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = null
        if (url.includes('youtube.com/embed/')) return { type: 'iframe', src: url }
        if (url.includes('youtube.com/watch')) videoId = new URLSearchParams(new URL(url).search).get('v')
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0]
        else if (url.includes('youtube.com/shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0]

        if (videoId) return { type: 'iframe', src: `https://www.youtube.com/embed/${videoId}` }
    }

    // 2. Medal.tv
    // Formato típico: https://medal.tv/games/cod-mw2/clips/1A2B3C4D/vp5X6Y7Z
    // Embed: https://medal.tv/clip/1A2B3C4D/vp5X6Y7Z?autoplay=0&muted=0&loop=0
    if (url.includes('medal.tv')) {
        // Intento simple de convertir URL de clip a embed
        // Extraemos IDs clave o usamos la ruta /clip/ si es posible
        // Pero Medal ofrece un iframe específico. Una forma robusta es reemplazar '/clips/' por '/clip/' y limpiar query params

        let src = url
        if (url.includes('/clips/')) {
            src = url.replace('/clips/', '/clip/')
        }
        // Asegurar parámetros básicos
        const symbol = src.includes('?') ? '&' : '?'
        return { type: 'iframe', src: `${src}${symbol}autoplay=0&muted=0&loop=0&controls=1` }
    }

    // 3. Archivos directos (Discord, mp4, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || url.includes('cdn.discordapp.com')) {
        return { type: 'video', src: url }
    }

    return null
}

function Clips() {
    const { user } = useUserAuth()
    const { data: clipsAgrupados, loading, error, refetch } = useClipsAgrupados()
    const { data: misClips, loading: loadingMisClips, refetch: refetchMisClips } = useMisClips(user?.id)

    const [activeTab, setActiveTab] = useState('todos') // 'todos' | 'mis-clips'
    const [busqueda, setBusqueda] = useState('')
    const [filtroMiembro, setFiltroMiembro] = useState('todos')

    // Modal Upload State
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadForm, setUploadForm] = useState({ youtube_url: '', titulo: '', descripcion: '' })
    const [uploadStatus, setUploadStatus] = useState('idle') // idle, loading, success, error

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!user || !uploadForm.youtube_url || !uploadForm.titulo) return

        try {
            setUploadStatus('loading')
            await crearClip({
                ...uploadForm,
                usuario_id: user.id
            })
            setUploadStatus('success')
            setUploadForm({ youtube_url: '', titulo: '', descripcion: '' })
            setTimeout(() => {
                setShowUploadModal(false)
                setUploadStatus('idle')
                refetchMisClips()
            }, 2000)
        } catch (err) {
            console.error(err)
            setUploadStatus('error')
        }
    }

    // Lista de miembros para el filtro
    const miembros = useMemo(() => {
        if (!clipsAgrupados) return []
        return clipsAgrupados
            .filter(g => g.miembro)
            .map(g => ({ id: g.miembro.id, nombre: g.miembro.nombre_mostrar }))
    }, [clipsAgrupados])

    // Filtrar clips
    const clipsFiltrados = useMemo(() => {
        if (!clipsAgrupados) return []

        return clipsAgrupados
            .map(grupo => ({
                ...grupo,
                clips: grupo.clips.filter(clip => {
                    const matchBusqueda = !busqueda ||
                        clip.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                        clip.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
                    return matchBusqueda
                })
            }))
            .filter(grupo => {
                const matchMiembro = filtroMiembro === 'todos' || grupo.miembro?.id === filtroMiembro
                return matchMiembro && grupo.clips.length > 0
            })
    }, [clipsAgrupados, busqueda, filtroMiembro])

    const totalClips = clipsFiltrados.reduce((acc, g) => acc + g.clips.length, 0)

    return (
        <div className="clips-page">
            <Header />

            <main className="clips-content">
                <div className="page-header">
                    <h1>
                        <Icon name="video" size={36} />
                        Clips
                    </h1>
                    <p className="page-subtitle">Los mejores momentos del clan Lou</p>

                    {user && (
                        <div className="header-actions">
                            <button
                                className="btn-primary"
                                onClick={() => setShowUploadModal(true)}
                            >
                                <Icon name="plus" size={18} />
                                Subir Clip
                            </button>
                        </div>
                    )}
                </div>

                {user && (
                    <div className="tabs-container">
                        <button
                            className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('todos')}
                        >
                            Todos los Clips
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'mis-clips' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mis-clips')}
                        >
                            Mis Clips
                        </button>
                    </div>
                )}

                {/* Filtros */}
                <div className="filters-bar">
                    <div className="filter-search">
                        <Icon name="video" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar clips..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button className="clear-search" onClick={() => setBusqueda('')}>
                                <Icon name="close" size={16} />
                            </button>
                        )}
                    </div>
                    <select
                        className="filter-select"
                        value={filtroMiembro}
                        onChange={(e) => setFiltroMiembro(e.target.value)}
                    >
                        <option value="todos">Todos los miembros</option>
                        {miembros.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                    <span className="filter-count">{totalClips} clips</span>
                </div>

                {loading && <Loading text="Cargando clips..." />}

                {error && <ErrorMessage message={error} onRetry={refetch} />}

                {!loading && !error && clipsFiltrados?.length === 0 && (
                    <div className="empty-state">
                        <Icon name="video" size={48} />
                        <p>No se encontraron clips</p>
                        {(busqueda || filtroMiembro !== 'todos') && (
                            <button
                                className="btn-clear-filters"
                                onClick={() => { setBusqueda(''); setFiltroMiembro('todos'); }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && activeTab === 'todos' && clipsFiltrados?.map((grupo, index) => (
                    <section
                        key={grupo.miembro?.id || index}
                        className="clips-section animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="section-header">
                            {grupo.miembro?.avatar_url && (
                                <img
                                    src={grupo.miembro.avatar_url}
                                    alt={grupo.miembro.nombre_mostrar}
                                    className="section-avatar"
                                />
                            )}
                            <h2>{grupo.miembro?.nombre_mostrar || 'Clips'}</h2>
                            <span className="section-count">{grupo.clips.length} clips</span>
                        </div>

                        <div className="clips-grid">
                            {grupo.clips.map(clip => {
                                const videoData = getVideoData(clip.youtube_url)
                                return (
                                    <div key={clip.id} className="clip-card">
                                        <div className="clip-video">
                                            {videoData?.type === 'iframe' && (
                                                <iframe
                                                    src={videoData.src}
                                                    title={clip.titulo}
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                ></iframe>
                                            )}
                                            {videoData?.type === 'video' && (
                                                <video
                                                    src={videoData.src}
                                                    controls
                                                    preload="metadata"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                ></video>
                                            )}
                                            {!videoData && (
                                                <div className="clip-placeholder">
                                                    <Icon name="video" size={48} />
                                                    <p>Formato no compatible</p>
                                                    <a href={clip.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                                        Ver enlace original
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="clip-info">
                                            <h3>{clip.titulo}</h3>
                                            {clip.descripcion && (
                                                <p>{clip.descripcion}</p>
                                            )}
                                            {clip.destacado && (
                                                <span className="badge badge-gold">
                                                    <Icon name="star" size={12} />
                                                    Destacado
                                                </span>
                                            )}
                                            <InteraccionesPanel
                                                tipoContenido="clip"
                                                contenidoId={clip.id}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                ))}

                {/* Vista Mis Clips */}
                {activeTab === 'mis-clips' && (
                    <div className="my-clips-view animate-fade-in">
                        {loadingMisClips && <Loading text="Cargando tus clips..." />}
                        {!loadingMisClips && misClips?.length === 0 && (
                            <div className="empty-state">
                                <Icon name="video" size={48} />
                                <p>No has subido ningún clip aún</p>
                                <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                                    Subir mi primer clip
                                </button>
                            </div>
                        )}

                        <div className="clips-grid">
                            {!loadingMisClips && misClips?.map(clip => {
                                const videoData = getVideoData(clip.youtube_url)
                                return (
                                    <div key={clip.id} className="clip-card">
                                        <div className="clip-status-badge" data-status={clip.estado}>
                                            {clip.estado === 'pendiente' ? '⏳ Pendiente' :
                                                clip.estado === 'aprobado' ? '✅ Aprobado' :
                                                    clip.estado === 'rechazado' ? '❌ Rechazado' : clip.estado}
                                        </div>
                                        <div className="clip-video">
                                            {videoData?.type === 'iframe' && (
                                                <iframe
                                                    src={videoData.src}
                                                    title={clip.titulo}
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                ></iframe>
                                            )}
                                            {videoData?.type === 'video' && (
                                                <video src={videoData.src} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                                            )}
                                        </div>
                                        <div className="clip-info">
                                            <h3>{clip.titulo}</h3>
                                            <p className="clip-date">Subido el {new Date(clip.creado_en).toLocaleDateString()}</p>
                                            {clip.estado === 'rechazado' && <p className="text-red text-sm">Este clip no fue aprobado.</p>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Modal de Subida */}
                {showUploadModal && (
                    <div className="modal-overlay">
                        <div className="modal-content upload-modal">
                            <div className="modal-header">
                                <h2>Subir Nuevo Clip</h2>
                                <button className="btn-close" onClick={() => setShowUploadModal(false)}>
                                    <Icon name="close" size={20} />
                                </button>
                            </div>

                            {uploadStatus === 'success' ? (
                                <div className="upload-success">
                                    <Icon name="check" size={48} className="text-green" />
                                    <p>¡Clip enviado correctamente!</p>
                                    <p className="text-sm">Tu clip está en revisión y aparecerá pronto.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleUpload}>
                                    <div className="form-group">
                                        <label>Título del Clip</label>
                                        <input
                                            type="text"
                                            required
                                            value={uploadForm.titulo}
                                            onChange={e => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                                            placeholder="Ej: Jugada épica en..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Enlace del Video</label>
                                        <input
                                            type="url"
                                            required
                                            value={uploadForm.youtube_url}
                                            onChange={e => setUploadForm({ ...uploadForm, youtube_url: e.target.value })}
                                            placeholder="YouTube, Medal, Discord, etc."
                                        />
                                        <small>Soporta: YouTube, Medal.tv, archivos directos (.mp4)</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción (Opcional)</label>
                                        <textarea
                                            value={uploadForm.descripcion}
                                            onChange={e => setUploadForm({ ...uploadForm, descripcion: e.target.value })}
                                            placeholder="Cuenta un poco sobre qué pasó..."
                                        />
                                    </div>
                                    {uploadStatus === 'error' && <p className="error-text">Ocurrió un error al subir el clip.</p>}
                                    <button type="submit" className="btn-primary" disabled={uploadStatus === 'loading'}>
                                        {uploadStatus === 'loading' ? 'Enviando...' : 'Enviar Clip'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div >
    )
}

export default Clips
