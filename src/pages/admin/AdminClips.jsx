import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../../components/Icons'
import Loading from '../../components/Loading'
import {
    obtenerTodosClips,
    crearClip,
    actualizarClip,
    eliminarClip
} from '../../services/adminService'
import { obtenerMiembros, obtenerCategoriasClips } from '../../services/supabaseService'
import './AdminCrud.css'

function AdminClips() {
    const [clips, setClips] = useState([])
    const [miembros, setMiembros] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)

    // Filtros
    const [busqueda, setBusqueda] = useState('')
    const [filtroMiembro, setFiltroMiembro] = useState('todos')
    const [filtroEstado, setFiltroEstado] = useState('todos')

    const [form, setForm] = useState({
        titulo: '',
        youtube_url: '',
        miembro_id: '',
        categoria_id: '',
        descripcion: '',
        destacado: false,
        estado: 'activo'
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [clipsData, miembrosData, categoriasData] = await Promise.all([
                obtenerTodosClips(),
                obtenerMiembros(),
                obtenerCategoriasClips()
            ])
            setClips(clipsData || [])
            setMiembros(miembrosData || [])
            setCategorias(categoriasData || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtrar
    const clipsFiltrados = useMemo(() => {
        return clips.filter(c => {
            const matchBusqueda = !busqueda || c.titulo?.toLowerCase().includes(busqueda.toLowerCase())
            const matchMiembro = filtroMiembro === 'todos' || c.miembro_id === filtroMiembro
            const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
            return matchBusqueda && matchMiembro && matchEstado
        })
    }, [clips, busqueda, filtroMiembro, filtroEstado])

    // Extraer thumbnail de YouTube
    function getYoutubeThumbnail(url) {
        const match = url?.match(/embed\/([a-zA-Z0-9_-]+)/)
        if (match) {
            return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
        }
        return null
    }

    function openModal(clip = null) {
        if (clip) {
            setEditando(clip)
            setForm({
                titulo: clip.titulo,
                youtube_url: clip.youtube_url,
                miembro_id: clip.miembro_id || '',
                categoria_id: clip.categoria_id || '',
                descripcion: clip.descripcion || '',
                destacado: clip.destacado,
                estado: clip.estado
            })
        } else {
            setEditando(null)
            setForm({
                titulo: '',
                youtube_url: '',
                miembro_id: '',
                categoria_id: '',
                descripcion: '',
                destacado: false,
                estado: 'activo'
            })
        }
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const datos = { ...form }
            if (!datos.miembro_id) delete datos.miembro_id
            if (!datos.categoria_id) delete datos.categoria_id

            if (editando) {
                await actualizarClip(editando.id, datos)
            } else {
                await crearClip(datos)
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(id) {
        if (confirm('¿Eliminar este clip?')) {
            try {
                await eliminarClip(id)
                loadData()
            } catch (error) {
                alert('Error: ' + error.message)
            }
        }
    }

    if (loading) return <Loading text="Cargando clips..." />

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Clips</h1>
                    <p>{clipsFiltrados.length} de {clips.length} clips</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Icon name="video" size={18} />
                    Nuevo Clip
                </button>
            </div>

            {/* Filtros */}
            <div className="crud-filters">
                <div className="filter-search">
                    <Icon name="video" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar clip..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filtroMiembro}
                    onChange={(e) => setFiltroMiembro(e.target.value)}
                >
                    <option value="todos">Todos los miembros</option>
                    {miembros.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre_mostrar}</option>
                    ))}
                </select>
                <select
                    className="filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="todos">Todos</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>
            </div>

            {/* Grid */}
            <div className="crud-cards">
                {clipsFiltrados.map(clip => (
                    <div key={clip.id} className="crud-card">
                        <div className="card-image" style={{ position: 'relative' }}>
                            {getYoutubeThumbnail(clip.youtube_url) ? (
                                <img src={getYoutubeThumbnail(clip.youtube_url)} alt={clip.titulo} />
                            ) : (
                                <Icon name="video" size={48} />
                            )}
                            {clip.destacado && (
                                <span style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    background: 'var(--color-accent-gold)',
                                    borderRadius: '50%',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1a1a1a'
                                }}>
                                    <Icon name="star" size={14} />
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            <h3 className="card-title">{clip.titulo}</h3>
                            <div className="card-meta">
                                <span className={`status-badge status-${clip.estado}`}>
                                    {clip.estado}
                                </span>
                                {clip.miembros && (
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        {clip.miembros.nombre_mostrar}
                                    </span>
                                )}
                            </div>
                            <div className="card-actions">
                                <button className="btn-icon" onClick={() => openModal(clip)}>
                                    <Icon name="file" size={18} />
                                </button>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(clip.id)}>
                                    <Icon name="ban" size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {clipsFiltrados.length === 0 && (
                <div className="empty-state">
                    <Icon name="video" size={48} />
                    <p>No hay clips</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editando ? 'Editar Clip' : 'Nuevo Clip'}</h2>
                            <button onClick={() => setShowModal(false)}>
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                                    placeholder="Título del clip"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL de YouTube (embed)</label>
                                <input
                                    type="url"
                                    value={form.youtube_url}
                                    onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                    required
                                />
                                <small style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                                    Usa el formato embed: youtube.com/embed/VIDEO_ID
                                </small>
                            </div>

                            {form.youtube_url && getYoutubeThumbnail(form.youtube_url) && (
                                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                    <img
                                        src={getYoutubeThumbnail(form.youtube_url)}
                                        alt="Preview"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Miembro</label>
                                    <select
                                        value={form.miembro_id}
                                        onChange={e => setForm({ ...form, miembro_id: e.target.value })}
                                    >
                                        <option value="">Sin asignar</option>
                                        {miembros.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre_mostrar}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select
                                        value={form.categoria_id}
                                        onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                                    >
                                        <option value="">Sin categoría</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                    placeholder="Descripción del clip..."
                                    rows={2}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={form.destacado}
                                            onChange={e => setForm({ ...form, destacado: e.target.checked })}
                                        />
                                        Destacado
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        value={form.estado}
                                        onChange={e => setForm({ ...form, estado: e.target.value })}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editando ? 'Guardar' : 'Crear Clip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminClips
