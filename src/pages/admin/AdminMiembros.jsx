import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../../components/Icons'
import ImageUploader from '../../components/ImageUploader'
import Loading from '../../components/Loading'
import {
    obtenerTodosMiembros,
    crearMiembro,
    actualizarMiembro,
    eliminarMiembro,
    obtenerUsuariosParaMiembro
} from '../../services/adminService'
import { getLocalDateInputValue } from '../../utils/dateDefaults'
import './AdminCrud.css'

function AdminMiembros() {
    const [miembros, setMiembros] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)
    const [viewMode, setViewMode] = useState('cards')
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [usuarios, setUsuarios] = useState([])

    const [form, setForm] = useState({
        usuario_id: '',
        nombre_mostrar: '',
        minecraft_username: '',
        fecha_ingreso: '',
        estado_clan: 'activo',
        avatar_url: '',
        banner_url: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [data, userData] = await Promise.all([obtenerTodosMiembros(), obtenerUsuariosParaMiembro()])
            setMiembros(data || [])
            setUsuarios(userData || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }
    const miembrosFiltrados = useMemo(() => {
        return miembros.filter(m => {
            const matchBusqueda = m.nombre_mostrar?.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase())
            const matchEstado = filtroEstado === 'todos' || m.estado === filtroEstado
            return matchBusqueda && matchEstado
        })
    }, [miembros, busqueda, filtroEstado])

    function openModal(miembro = null) {
        if (miembro) {
            setEditando(miembro)
            setForm({
                usuario_id: miembro.usuario_id || '',
                nombre_mostrar: miembro.nombre_mostrar,
                minecraft_username: miembro.minecraft_username || '',
                fecha_ingreso: miembro.fecha_ingreso || '',
                estado_clan: miembro.estado_clan || 'activo',
                avatar_url: miembro.avatar_url || '',
                banner_url: miembro.banner_url || ''
            })
        } else {
            setEditando(null)
            setForm({
                usuario_id: '',
                nombre_mostrar: '',
                minecraft_username: '',
                fecha_ingreso: getLocalDateInputValue(),
                estado_clan: 'activo',
                avatar_url: '',
                banner_url: ''
            })
        }
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const datos = {
                ...form,
                nombre_mostrar: form.nombre_mostrar.trim(),
                nombre_usuario: form.nombre_mostrar.trim(),
                minecraft_username: form.minecraft_username.trim() || null,
                fecha_ingreso: form.fecha_ingreso || null
            }
            if (!editando && !datos.usuario_id) throw new Error('Debes vincular el miembro a un usuario Gmail existente')
            if (editando) {
                await actualizarMiembro(editando.id, datos)
            } else {
                await crearMiembro(datos)
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(id) {
        if (confirm('¿Estás seguro de eliminar este miembro?')) {
            try {
                await eliminarMiembro(id)
                loadData()
            } catch (error) {
                alert('Error: ' + error.message)
            }
        }
    }

    if (loading) return <Loading text="Cargando miembros..." />

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Miembros</h1>
                    <p>{miembrosFiltrados.length} de {miembros.length} registros</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Icon name="user" size={18} />
                    Nuevo Miembro
                </button>
            </div>

            {}
            <div className="crud-filters">
                <div className="filter-search">
                    <Icon name="user" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar miembro..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>
                <div className="view-toggle">
                    <button
                        className={viewMode === 'cards' ? 'active' : ''}
                        onClick={() => setViewMode('cards')}
                        title="Vista de tarjetas"
                    >
                        <Icon name="gallery" size={18} />
                    </button>
                    <button
                        className={viewMode === 'table' ? 'active' : ''}
                        onClick={() => setViewMode('table')}
                        title="Vista de tabla"
                    >
                        <Icon name="menu" size={18} />
                    </button>
                </div>
            </div>

            {}
            {viewMode === 'cards' && (
                <div className="crud-cards">
                    {miembrosFiltrados.map(m => (
                        <div key={m.id} className="crud-card">
                            <div className="card-image">
                                {m.avatar_url ? (
                                    <img src={m.avatar_url} alt={m.nombre_mostrar} />
                                ) : (
                                    <Icon name="user" size={48} />
                                )}
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">
                                    {m.nombre_mostrar}
                                    <span className={`status-badge status-${m.estado}`}>
                                        {m.estado}
                                    </span>
                                </h3>
                                <div className="card-meta">
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                        @{m.nombre_usuario}
                                    </span>
                                </div>
                                <div className="card-actions">
                                    <button className="btn-icon" onClick={() => openModal(m)} title="Editar">
                                        <Icon name="file" size={18} />
                                    </button>
                                    <button className="btn-icon btn-danger" onClick={() => handleDelete(m.id)} title="Eliminar">
                                        <Icon name="ban" size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {}
            {viewMode === 'table' && (
                <div className="crud-table-wrapper">
                    <table className="crud-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {miembrosFiltrados.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="cell-avatar">
                                            {m.avatar_url && <img src={m.avatar_url} alt="" />}
                                            <span>@{m.nombre_usuario}</span>
                                        </div>
                                    </td>
                                    <td>{m.nombre_mostrar}</td>
                                    <td>
                                        <span className={`status-badge status-${m.estado}`}>
                                            {m.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="cell-actions">
                                            <button className="btn-icon" onClick={() => openModal(m)}>
                                                <Icon name="file" size={16} />
                                            </button>
                                            <button className="btn-icon btn-danger" onClick={() => handleDelete(m.id)}>
                                                <Icon name="ban" size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {miembrosFiltrados.length === 0 && (
                <div className="empty-state">
                    <Icon name="user" size={48} />
                    <p>No se encontraron miembros</p>
                </div>
            )}

            {}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editando ? 'Editar Miembro' : 'Nuevo Miembro'}</h2>
                            <button onClick={() => setShowModal(false)}>
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Cuenta Gmail vinculada</label>
                                <select value={form.usuario_id} onChange={e => setForm({ ...form, usuario_id: e.target.value })} required={!editando} disabled={!!editando}>
                                    <option value="">Selecciona un usuario Gmail</option>
                                    {usuarios.map(usuario => <option key={usuario.id} value={usuario.id}>{usuario.nombre} - {usuario.email}</option>)}
                                </select>
                                {!editando && <small>Solo puedes vincular cuentas Gmail ya registradas. La contraseña se gestiona desde el registro de usuario.</small>}
                                {editando && <small>La cuenta vinculada no se puede cambiar desde la edición.</small>}
                            </div>
                            <div className="form-group">
                                <label>Nombre de usuario</label>
                                <input
                                    type="text"
                                    value={form.nombre_mostrar}
                                    onChange={e => setForm({ ...form, nombre_mostrar: e.target.value })}
                                    placeholder="Nombre Visible"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Minecraft username</label>
                                    <input
                                        type="text"
                                        value={form.minecraft_username}
                                        onChange={e => setForm({ ...form, minecraft_username: e.target.value })}
                                        placeholder="Steve"
                                        maxLength={50}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Fecha de ingreso</label>
                                <input type="date" value={form.fecha_ingreso} readOnly />
                            </div>

                            <ImageUploader
                                label="Imagen de perfil"
                                value={form.avatar_url}
                                onChange={(url) => setForm({ ...form, avatar_url: url })}
                                bucket="images"
                                folder="avatars"
                            />

                            <ImageUploader
                                label="Banner del miembro"
                                value={form.banner_url}
                                onChange={(url) => setForm({ ...form, banner_url: url })}
                                bucket="images"
                                folder="banners"
                            />

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editando ? 'Guardar Cambios' : 'Crear Miembro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminMiembros
