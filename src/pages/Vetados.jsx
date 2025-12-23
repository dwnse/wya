import { useState, useMemo } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Icon } from '../components/Icons.jsx'
import { useVetados, useTiposVetado } from '../hooks/useSupabase.js'
import './Vetados.css'

function Vetados() {
    const { data: vetados, loading, error, refetch } = useVetados()
    const { data: tipos } = useTiposVetado()
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('todos')

    const getDangerColor = (nivel) => {
        const colores = {
            5: 'var(--color-danger-5)',
            4: 'var(--color-danger-4)',
            3: 'var(--color-danger-3)',
            2: 'var(--color-danger-2)',
            1: 'var(--color-danger-1)'
        }
        return colores[nivel] || 'var(--color-text-muted)'
    }

    // Filtrar
    const vetadosFiltrados = useMemo(() => {
        if (!vetados) return []

        return vetados.filter(vetado => {
            const matchBusqueda = !busqueda ||
                vetado.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                vetado.alias?.toLowerCase().includes(busqueda.toLowerCase()) ||
                vetado.razon?.toLowerCase().includes(busqueda.toLowerCase())
            const matchTipo = filtroTipo === 'todos' || vetado.tipo_id === filtroTipo
            return matchBusqueda && matchTipo
        })
    }, [vetados, busqueda, filtroTipo])

    return (
        <div className="vetados-page">
            <Header />

            <main className="vetados-content">
                <div className="page-header">
                    <h1>
                        <Icon name="ban" size={36} />
                        Focus
                    </h1>
                    <p className="page-subtitle">Focus perma para:</p>
                </div>

                <div className="warning-banner">
                    <Icon name="warning" size={20} />
                    <span>Retrasados.</span>
                </div>

                {/* Filtros */}
                <div className="filters-bar">
                    <div className="filter-search">
                        <Icon name="ban" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar vetado..."
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
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="todos">Todos los tipos</option>
                        {tipos?.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                    </select>
                    <span className="filter-count">{vetadosFiltrados.length} vetados</span>
                </div>

                {loading && <Loading text="Cargando lista..." />}

                {error && <ErrorMessage message={error} onRetry={refetch} />}

                {!loading && !error && vetadosFiltrados?.length === 0 && (
                    <div className="empty-state">
                        <Icon name="ban" size={48} />
                        <p>No se encontraron vetados</p>
                        {(busqueda || filtroTipo !== 'todos') && (
                            <button
                                className="btn-clear-filters"
                                onClick={() => { setBusqueda(''); setFiltroTipo('todos'); }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                <div className="vetados-list">
                    {!loading && !error && vetadosFiltrados?.map((vetado, index) => (
                        <div
                            key={vetado.id}
                            className="vetado-card animate-fade-in"
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                '--danger-color': getDangerColor(vetado.tipos_vetado?.nivel_peligro)
                            }}
                        >
                            <div className="vetado-header">
                                <div className="vetado-avatar">
                                    {vetado.imagen_url ? (
                                        <img src={vetado.imagen_url} alt={vetado.nombre} />
                                    ) : (
                                        <Icon name="user" size={28} />
                                    )}
                                </div>

                                <div className="vetado-identity">
                                    <h3>{vetado.nombre}</h3>
                                    {vetado.alias && (
                                        <p className="vetado-alias">aka "{vetado.alias}"</p>
                                    )}
                                </div>

                                <div className="danger-badge" style={{ background: getDangerColor(vetado.tipos_vetado?.nivel_peligro) }}>
                                    {vetado.tipos_vetado?.nombre}
                                </div>
                            </div>

                            <div className="vetado-body">
                                <div className="vetado-reason">
                                    <strong>Razón:</strong>
                                    <p>{vetado.razon}</p>
                                </div>

                                <div className="vetado-meta">
                                    {vetado.fecha_incidente && (
                                        <span className="meta-item">
                                            <Icon name="calendar" size={14} />
                                            {new Date(vetado.fecha_incidente).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    )}

                                    {vetado.evidencia_url && (
                                        <a
                                            href={vetado.evidencia_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="evidence-link"
                                        >
                                            <Icon name="file" size={14} />
                                            Ver evidencia
                                        </a>
                                    )}
                                </div>

                                {vetado.miembros?.nombre_mostrar && (
                                    <p className="reported-by">
                                        Reportado por: {vetado.miembros.nombre_mostrar}
                                    </p>
                                )}
                            </div>

                            <div className="danger-indicator">
                                {[...Array(vetado.tipos_vetado?.nivel_peligro || 1)].map((_, i) => (
                                    <Icon key={i} name="warning" size={12} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default Vetados
