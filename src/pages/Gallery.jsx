import { useState, useMemo } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Icon } from '../components/Icons.jsx'
import { Reacciones } from '../components/Interacciones.jsx'
import { useGaleriaAgrupada } from '../hooks/useSupabase.js'
import './Gallery.css'

function Gallery() {
    const { data: galeriaAgrupada, loading, error, refetch } = useGaleriaAgrupada()
    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('todos')
    const [lightbox, setLightbox] = useState({ open: false, image: null })

    // Lista de categorías
    const categorias = useMemo(() => {
        if (!galeriaAgrupada) return []
        return galeriaAgrupada
            .filter(g => g.categoria)
            .map(g => ({ slug: g.categoria.slug, nombre: g.categoria.nombre }))
    }, [galeriaAgrupada])

    // Filtrar
    const galeriaFiltrada = useMemo(() => {
        if (!galeriaAgrupada) return []

        return galeriaAgrupada
            .map(grupo => ({
                ...grupo,
                imagenes: grupo.imagenes.filter(img => {
                    const matchBusqueda = !busqueda ||
                        img.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                        img.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
                    return matchBusqueda
                })
            }))
            .filter(grupo => {
                const matchCategoria = filtroCategoria === 'todos' || grupo.categoria?.slug === filtroCategoria
                return matchCategoria && grupo.imagenes.length > 0
            })
    }, [galeriaAgrupada, busqueda, filtroCategoria])

    const totalImagenes = galeriaFiltrada.reduce((acc, g) => acc + g.imagenes.length, 0)

    // Todas las imágenes filtradas para navegación del lightbox
    const todasLasImagenes = useMemo(() => {
        return galeriaFiltrada.flatMap(g => g.imagenes)
    }, [galeriaFiltrada])

    const currentIndex = todasLasImagenes.findIndex(img => img.id === lightbox.image?.id)

    const openLightbox = (image) => {
        setLightbox({ open: true, image })
        document.body.style.overflow = 'hidden'
    }

    const closeLightbox = () => {
        setLightbox({ open: false, image: null })
        document.body.style.overflow = ''
    }

    const nextImage = () => {
        if (currentIndex < todasLasImagenes.length - 1) {
            setLightbox({ open: true, image: todasLasImagenes[currentIndex + 1] })
        }
    }

    const prevImage = () => {
        if (currentIndex > 0) {
            setLightbox({ open: true, image: todasLasImagenes[currentIndex - 1] })
        }
    }

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!lightbox.open) return
        if (e.key === 'Escape') closeLightbox()
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
    }

    return (
        <div className="gallery-page" onKeyDown={handleKeyDown} tabIndex={0}>
            <Header />

            <main className="gallery-content">
                <div className="page-header">
                    <h1>
                        <Icon name="gallery" size={36} />
                        Galería
                    </h1>
                    <p className="page-subtitle">Momentos inolvidables del clan EXO</p>
                </div>

                {/* Filtros */}
                <div className="filters-bar">
                    <div className="filter-search">
                        <Icon name="gallery" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar imágenes..."
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
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                        <option value="todos">Todas las categorías</option>
                        {categorias.map(c => (
                            <option key={c.slug} value={c.slug}>{c.nombre}</option>
                        ))}
                    </select>
                    <span className="filter-count">{totalImagenes} imágenes</span>
                </div>

                {loading && <Loading text="Cargando galería..." />}

                {error && <ErrorMessage message={error} onRetry={refetch} />}

                {!loading && !error && galeriaFiltrada?.length === 0 && (
                    <div className="empty-state">
                        <Icon name="gallery" size={48} />
                        <p>No se encontraron imágenes</p>
                        {(busqueda || filtroCategoria !== 'todos') && (
                            <button
                                className="btn-clear-filters"
                                onClick={() => { setBusqueda(''); setFiltroCategoria('todos'); }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && galeriaFiltrada?.map((grupo, index) => (
                    <section
                        key={grupo.categoria?.slug || index}
                        id={grupo.categoria?.slug}
                        className="gallery-section animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="section-header">
                            <h2>{grupo.categoria?.nombre || 'Galería'}</h2>
                            <span className="section-count">{grupo.imagenes.length} imágenes</span>
                        </div>

                        <div className="images-grid">
                            {grupo.imagenes.map(img => (
                                <div
                                    key={img.id}
                                    className="image-card"
                                    onClick={() => openLightbox(img)}
                                >
                                    <img
                                        src={img.imagen_url}
                                        alt={img.titulo || 'Imagen'}
                                        loading="lazy"
                                    />
                                    {img.titulo && (
                                        <div className="image-overlay">
                                            <span>{img.titulo}</span>
                                        </div>
                                    )}
                                    {img.destacado && (
                                        <span className="featured-badge">
                                            <Icon name="star" size={16} />
                                        </span>
                                    )}
                                    <div className="zoom-icon">
                                        <Icon name="gallery" size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Lightbox */}
            {lightbox.open && lightbox.image && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>
                        <Icon name="close" size={28} />
                    </button>

                    {currentIndex > 0 && (
                        <button
                            className="lightbox-nav lightbox-prev"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        >
                            <Icon name="chevronRight" size={32} />
                        </button>
                    )}

                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={lightbox.image.imagen_url}
                            alt={lightbox.image.titulo || 'Imagen'}
                        />
                        <div className="lightbox-info">
                            {lightbox.image.titulo && <h3>{lightbox.image.titulo}</h3>}
                            {lightbox.image.descripcion && <p>{lightbox.image.descripcion}</p>}
                            <Reacciones
                                tipoContenido="imagen"
                                contenidoId={lightbox.image.id}
                            />
                        </div>
                    </div>

                    {currentIndex < todasLasImagenes.length - 1 && (
                        <button
                            className="lightbox-nav lightbox-next"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        >
                            <Icon name="chevronRight" size={32} />
                        </button>
                    )}

                    <div className="lightbox-counter">
                        {currentIndex + 1} / {todasLasImagenes.length}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default Gallery
