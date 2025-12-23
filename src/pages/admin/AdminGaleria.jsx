import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../../components/Icons'
import ImageUploader from '../../components/ImageUploader'
import Loading from '../../components/Loading'
import {
    obtenerTodasImagenes,
    crearImagen,
    actualizarImagen,
    eliminarImagen
} from '../../services/adminService'
import { obtenerCategoriasGaleria } from '../../services/supabaseService'
import './AdminCrud.css'

function AdminGaleria() {
    const [imagenes, setImagenes] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)

    // Filtros
    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('todos')
    const [filtroEstado, setFiltroEstado] = useState('todos')

    const [form, setForm] = useState({
        titulo: '',
        imagen_url: '',
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
            const [imagenesData, categoriasData] = await Promise.all([
                obtenerTodasImagenes(),
                obtenerCategoriasGaleria()
            ])
            setImagenes(imagenesData || [])
            setCategorias(categoriasData || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtrar
    const imagenesFiltradas = useMemo(() => {
        return imagenes.filter(i => {
            const matchBusqueda = !busqueda || i.titulo?.toLowerCase().includes(busqueda.toLowerCase())
            const matchCategoria = filtroCategoria === 'todos' || i.categoria_id === filtroCategoria
            const matchEstado = filtroEstado === 'todos' || i.estado === filtroEstado
            return matchBusqueda && matchCategoria && matchEstado
        })
    }, [imagenes, busqueda, filtroCategoria, filtroEstado])

    function openModal(imagen = null) {
        if (imagen) {
            setEditando(imagen)
            setForm({
                titulo: imagen.titulo || '',
                imagen_url: imagen.imagen_url,
                categoria_id: imagen.categoria_id || '',
                descripcion: imagen.descripcion || '',
                destacado: imagen.destacado,
                estado: imagen.estado
            })
        } else {
            setEditando(null)
            setForm({
                titulo: '',
                imagen_url: '',
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
        if (!form.imagen_url) {
            alert('Por favor sube una imagen')
            return
        }
        try {
            const datos = { ...form }
            if (!datos.categoria_id) delete datos.categoria_id

            if (editando) {
                await actualizarImagen(editando.id, datos)
            } else {
                await crearImagen(datos)
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(id) {
        if (confirm('¿Eliminar esta imagen?')) {
            try {
                await eliminarImagen(id)
                loadData()
            } catch (error) {
                alert('Error: ' + error.message)
            }
        }
    }

    if (loading) return <Loading text="Cargando galería..." />

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Galería</h1>
                    <p>{imagenesFiltradas.length} de {imagenes.length} imágenes</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Icon name="gallery" size={18} />
                    Nueva Imagen
                </button>
            </div>

            {/* Filtros */}
            <div className="crud-filters">
                <div className="filter-search">
                    <Icon name="gallery" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar imagen..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                    <option value="todos">Todas las categorías</option>
                    {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
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

            {/* Grid de imágenes */}
            <div className="crud-cards">
                {imagenesFiltradas.map(img => (
                    <div key={img.id} className="crud-card">
                        <div className="card-image">
                            <img src={img.imagen_url} alt={img.titulo} />
                            {img.destacado && (
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
                            <h3 className="card-title">
                                {img.titulo || 'Sin título'}
                            </h3>
                            <div className="card-meta">
                                <span className={`status-badge status-${img.estado}`}>
                                    {img.estado}
                                </span>
                                {img.categorias_galeria && (
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {img.categorias_galeria.nombre}
                                    </span>
                                )}
                            </div>
                            <div className="card-actions">
                                <button className="btn-icon" onClick={() => openModal(img)}>
                                    <Icon name="file" size={18} />
                                </button>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(img.id)}>
                                    <Icon name="ban" size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {imagenesFiltradas.length === 0 && (
                <div className="empty-state">
                    <Icon name="gallery" size={48} />
                    <p>No hay imágenes</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editando ? 'Editar Imagen' : 'Nueva Imagen'}</h2>
                            <button onClick={() => setShowModal(false)}>
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <ImageUploader
                                label="Imagen"
                                value={form.imagen_url}
                                onChange={(url) => setForm({ ...form, imagen_url: url })}
                                bucket="images"
                                folder="gallery"
                            />

                            <div className="form-group">
                                <label>Título (opcional)</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                                    placeholder="Título de la imagen"
                                />
                            </div>

                            <div className="form-row">
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

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                    placeholder="Descripción de la imagen..."
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.destacado}
                                        onChange={e => setForm({ ...form, destacado: e.target.checked })}
                                    />
                                    Marcar como destacado
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editando ? 'Guardar' : 'Subir Imagen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminGaleria
