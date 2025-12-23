import { useState, useEffect } from 'react'
import { Icon } from '../../components/Icons'
import Loading from '../../components/Loading'
import {
    obtenerCategoriasGaleriaAdmin,
    crearCategoriaGaleria,
    actualizarCategoriaGaleria,
    eliminarCategoriaGaleria,
    obtenerCategoriasClipsAdmin,
    crearCategoriaClips,
    actualizarCategoriaClips,
    eliminarCategoriaClips,
    obtenerTiposVetadoAdmin,
    crearTipoVetado,
    actualizarTipoVetado,
    eliminarTipoVetado,
    obtenerRolesAdmin,
    crearRol,
    actualizarRol,
    eliminarRol
} from '../../services/adminService'
import './AdminCrud.css'
import './AdminConfig.css'

function AdminConfig() {
    const [activeTab, setActiveTab] = useState('galeria')
    const [loading, setLoading] = useState(true)

    // Data
    const [categoriasGaleria, setCategoriasGaleria] = useState([])
    const [categoriasClips, setCategoriasClips] = useState([])
    const [tiposVetado, setTiposVetado] = useState([])
    const [roles, setRoles] = useState([])

    // Modal
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('')
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState({})

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [galeria, clips, tipos, rolesData] = await Promise.all([
                obtenerCategoriasGaleriaAdmin(),
                obtenerCategoriasClipsAdmin(),
                obtenerTiposVetadoAdmin(),
                obtenerRolesAdmin()
            ])
            setCategoriasGaleria(galeria || [])
            setCategoriasClips(clips || [])
            setTiposVetado(tipos || [])
            setRoles(rolesData || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    function openModal(type, item = null) {
        setModalType(type)
        setEditando(item)

        if (type === 'galeria' || type === 'clips') {
            setForm(item ? {
                nombre: item.nombre,
                slug: item.slug,
                descripcion: item.descripcion || '',
                orden: item.orden || 0
            } : {
                nombre: '',
                slug: '',
                descripcion: '',
                orden: 0
            })
        } else if (type === 'tipos') {
            setForm(item ? {
                nombre: item.nombre,
                descripcion: item.descripcion || '',
                icono: item.icono || '',
                nivel_peligro: item.nivel_peligro || 1
            } : {
                nombre: '',
                descripcion: '',
                icono: '',
                nivel_peligro: 1
            })
        } else if (type === 'roles') {
            setForm(item ? {
                nombre: item.nombre,
                color: item.color || '#dc2626',
                descripcion: item.descripcion || ''
            } : {
                nombre: '',
                color: '#dc2626',
                descripcion: ''
            })
        }

        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (modalType === 'galeria') {
                if (editando) {
                    await actualizarCategoriaGaleria(editando.id, form)
                } else {
                    await crearCategoriaGaleria(form)
                }
            } else if (modalType === 'clips') {
                if (editando) {
                    await actualizarCategoriaClips(editando.id, form)
                } else {
                    await crearCategoriaClips(form)
                }
            } else if (modalType === 'tipos') {
                if (editando) {
                    await actualizarTipoVetado(editando.id, form)
                } else {
                    await crearTipoVetado(form)
                }
            } else if (modalType === 'roles') {
                if (editando) {
                    await actualizarRol(editando.id, form)
                } else {
                    await crearRol(form)
                }
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(type, id) {
        if (!confirm('¿Eliminar este elemento?')) return

        try {
            if (type === 'galeria') await eliminarCategoriaGaleria(id)
            else if (type === 'clips') await eliminarCategoriaClips(id)
            else if (type === 'tipos') await eliminarTipoVetado(id)
            else if (type === 'roles') await eliminarRol(id)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    // Generar slug automático
    function generateSlug(name) {
        return name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    if (loading) return <Loading text="Cargando configuración..." />

    const tabs = [
        { id: 'galeria', label: 'Categorías Galería', icon: 'gallery' },
        { id: 'clips', label: 'Categorías Clips', icon: 'video' },
        { id: 'tipos', label: 'Tipos Vetado', icon: 'ban' },
        { id: 'roles', label: 'Roles', icon: 'user' }
    ]

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Configuración</h1>
                    <p>Administra categorías, tipos y roles</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="config-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`config-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <Icon name={tab.icon} size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Categorías Galería */}
            {activeTab === 'galeria' && (
                <div className="config-section">
                    <div className="section-header">
                        <h2>Categorías de Galería</h2>
                        <button className="btn-primary" onClick={() => openModal('galeria')}>
                            <Icon name="gallery" size={16} />
                            Nueva Categoría
                        </button>
                    </div>
                    <div className="config-list">
                        {categoriasGaleria.map(cat => (
                            <div key={cat.id} className="config-item">
                                <div className="item-info">
                                    <strong>{cat.nombre}</strong>
                                    <span className="item-slug">/{cat.slug}</span>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => openModal('galeria', cat)}>
                                        <Icon name="file" size={16} />
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete('galeria', cat.id)}>
                                        <Icon name="ban" size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {categoriasGaleria.length === 0 && (
                            <p className="empty-text">No hay categorías</p>
                        )}
                    </div>
                </div>
            )}

            {/* Categorías Clips */}
            {activeTab === 'clips' && (
                <div className="config-section">
                    <div className="section-header">
                        <h2>Categorías de Clips</h2>
                        <button className="btn-primary" onClick={() => openModal('clips')}>
                            <Icon name="video" size={16} />
                            Nueva Categoría
                        </button>
                    </div>
                    <div className="config-list">
                        {categoriasClips.map(cat => (
                            <div key={cat.id} className="config-item">
                                <div className="item-info">
                                    <strong>{cat.nombre}</strong>
                                    <span className="item-slug">/{cat.slug}</span>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => openModal('clips', cat)}>
                                        <Icon name="file" size={16} />
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete('clips', cat.id)}>
                                        <Icon name="ban" size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {categoriasClips.length === 0 && (
                            <p className="empty-text">No hay categorías</p>
                        )}
                    </div>
                </div>
            )}

            {/* Tipos Vetado */}
            {activeTab === 'tipos' && (
                <div className="config-section">
                    <div className="section-header">
                        <h2>Tipos de Vetado</h2>
                        <button className="btn-primary" onClick={() => openModal('tipos')}>
                            <Icon name="ban" size={16} />
                            Nuevo Tipo
                        </button>
                    </div>
                    <div className="config-list">
                        {tiposVetado.map(tipo => (
                            <div key={tipo.id} className="config-item">
                                <div className="item-info">
                                    <span className="item-icon">{tipo.icono}</span>
                                    <strong>{tipo.nombre}</strong>
                                    <span className="danger-level" style={{
                                        background: `hsl(${(5 - tipo.nivel_peligro) * 25}, 70%, 45%)`
                                    }}>
                                        Nivel {tipo.nivel_peligro}
                                    </span>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => openModal('tipos', tipo)}>
                                        <Icon name="file" size={16} />
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete('tipos', tipo.id)}>
                                        <Icon name="ban" size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {tiposVetado.length === 0 && (
                            <p className="empty-text">No hay tipos</p>
                        )}
                    </div>
                </div>
            )}

            {/* Roles */}
            {activeTab === 'roles' && (
                <div className="config-section">
                    <div className="section-header">
                        <h2>Roles de Miembros</h2>
                        <button className="btn-primary" onClick={() => openModal('roles')}>
                            <Icon name="user" size={16} />
                            Nuevo Rol
                        </button>
                    </div>
                    <div className="config-list">
                        {roles.map(rol => (
                            <div key={rol.id} className="config-item">
                                <div className="item-info">
                                    <span
                                        className="role-color"
                                        style={{ background: rol.color }}
                                    />
                                    <strong>{rol.nombre}</strong>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => openModal('roles', rol)}>
                                        <Icon name="file" size={16} />
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete('roles', rol.id)}>
                                        <Icon name="ban" size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {roles.length === 0 && (
                            <p className="empty-text">No hay roles</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {editando ? 'Editar' : 'Nuevo'}{' '}
                                {modalType === 'galeria' && 'Categoría Galería'}
                                {modalType === 'clips' && 'Categoría Clips'}
                                {modalType === 'tipos' && 'Tipo Vetado'}
                                {modalType === 'roles' && 'Rol'}
                            </h2>
                            <button onClick={() => setShowModal(false)}>
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {/* Categorías (galería/clips) */}
                            {(modalType === 'galeria' || modalType === 'clips') && (
                                <>
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            value={form.nombre}
                                            onChange={e => setForm({
                                                ...form,
                                                nombre: e.target.value,
                                                slug: generateSlug(e.target.value)
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug (URL)</label>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={e => setForm({ ...form, slug: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Orden</label>
                                        <input
                                            type="number"
                                            value={form.orden}
                                            onChange={e => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>
                                        <textarea
                                            value={form.descripcion}
                                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Tipos Vetado */}
                            {modalType === 'tipos' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nombre</label>
                                            <input
                                                type="text"
                                                value={form.nombre}
                                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                                placeholder="Traidor, Scammer..."
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Icono (emoji)</label>
                                            <input
                                                type="text"
                                                value={form.icono}
                                                onChange={e => setForm({ ...form, icono: e.target.value })}
                                                placeholder="⚠️"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Nivel de Peligro (1-5)</label>
                                        <select
                                            value={form.nivel_peligro}
                                            onChange={e => setForm({ ...form, nivel_peligro: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>1 - Bajo</option>
                                            <option value={2}>2 - Moderado</option>
                                            <option value={3}>3 - Medio</option>
                                            <option value={4}>4 - Alto</option>
                                            <option value={5}>5 - Máximo</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>
                                        <textarea
                                            value={form.descripcion}
                                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Roles */}
                            {modalType === 'roles' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nombre</label>
                                            <input
                                                type="text"
                                                value={form.nombre}
                                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                                placeholder="Líder, Pro..."
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Color</label>
                                            <input
                                                type="color"
                                                value={form.color}
                                                onChange={e => setForm({ ...form, color: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>
                                        <textarea
                                            value={form.descripcion}
                                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editando ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminConfig
