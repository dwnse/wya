import { useState, useMemo } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Icon } from '../components/Icons.jsx'
import { InteraccionesPanel } from '../components/Interacciones.jsx'
import { useClipsAgrupados } from '../hooks/useSupabase.js'
import './Clips.css'

// Convierte URLs de YouTube a formato embed
function getYouTubeEmbedUrl(url) {
    if (!url) return null

    // Si ya es embed URL, devolverla
    if (url.includes('youtube.com/embed/')) {
        return url
    }

    let videoId = null

    // Formatos soportados:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/shorts/VIDEO_ID

    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search)
        videoId = urlParams.get('v')
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]
    } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0]
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
    }

    return url
}

function Clips() {
    const { data: clipsAgrupados, loading, error, refetch } = useClipsAgrupados()
    const [busqueda, setBusqueda] = useState('')
    const [filtroMiembro, setFiltroMiembro] = useState('todos')

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
                    <p className="page-subtitle">Los mejores momentos del clan EXO</p>
                </div>

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

                {!loading && !error && clipsFiltrados?.map((grupo, index) => (
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
                                const embedUrl = getYouTubeEmbedUrl(clip.youtube_url)
                                return (
                                    <div key={clip.id} className="clip-card">
                                        <div className="clip-video">
                                            {embedUrl ? (
                                                <iframe
                                                    src={embedUrl}
                                                    title={clip.titulo}
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                ></iframe>
                                            ) : (
                                                <div className="clip-placeholder">
                                                    <Icon name="video" size={48} />
                                                    <p>Video no disponible</p>
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
            </main>

            <Footer />
        </div>
    )
}

export default Clips
