import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../../components/Icons'
import ImageUploader from '../../components/ImageUploader'
import Loading from '../../components/Loading'
import {
    obtenerTodosCarries,
    crearCarry,
    actualizarCarry,
    eliminarCarry
} from '../../services/adminService'
import { obtenerMiembros } from '../../services/supabaseService'
import './AdminCrud.css'

function AdminCarries() {
    const [carries, setCarries] = useState([])
    const [miembros, setMiembros] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)
    const [busqueda, setBusqueda] = useState('')
    const [filtroDestacado, setFiltroDestacado] = useState('todos')

    const [form, setForm] = useState({
        miembro_id: '',
        titulo: '',
        especialidad: '',
        logros: '',
        orden: 0,
        destacado: false,
        estado: 'activo'
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [carriesData, miembrosData] = await Promise.all([
                obtenerTodosCarries(),
                obtenerMiembros()
            ])
            setCarries(carriesData || [])
            setMiembros(miembrosData || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }
    const carriesFiltrados = useMemo(() => {
        return carries.filter(c => {
            const matchBusqueda = !busqueda ||
                c.miembros?.nombre_mostrar?.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.titulo?.toLowerCase().includes(busqueda.toLowerCase())
            const matchDestacado = filtroDestacado === 'todos' ||
                (filtroDestacado === 'destacado' && c.destacado) ||
                (filtroDestacado === 'normal' && !c.destacado)
            return matchBusqueda && matchDestacado
        })
    }, [carries, busqueda, filtroDestacado])

    function openModal(carry = null) {
        if (carry) {
            setEditando(carry)
            setForm({
                miembro_id: carry.miembro_id,
                titulo: carry.titulo || '',
                especialidad: carry.especialidad || '',
                logros: carry.logros || '',
                orden: carry.orden || 0,
                destacado: carry.destacado,
                estado: carry.estado
            })
        } else {
            setEditando(null)
            setForm({
                miembro_id: '',
                titulo: '',
                especialidad: '',
                logros: '',
                orden: 0,
                destacado: false,
                estado: 'activo'
            })
        }
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.miembro_id) {
            alert('Selecciona un miembro')
            return
        }
        try {
            if (editando) {
                await actualizarCarry(editando.id, form)
            } else {
                await crearCarry(form)
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(id) {
        if (confirm('¿Eliminar este carry?')) {
            try {
                await eliminarCarry(id)
                loadData()
            } catch (error) {
                alert('Error: ' + error.message)
            }
        }
    }

    if (loading) return <Loading text="Cargando..." />

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Top Clan</h1>
                    <p>{carriesFiltrados.length} carries registrados</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Icon name="star" size={18} />
                    Nuevo Carry
                </button>
            </div>

            {}
            <div className="crud-filters">
                <div className="filter-search">
                    <Icon name="star" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar carry..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filtroDestacado}
                    onChange={(e) => setFiltroDestacado(e.target.value)}
                >
                    <option value="todos">Todos</option>
                    <option value="destacado">Destacados</option>
                    <option value="normal">Normales</option>
                </select>
            </div>

            {}
            <div className="crud-cards">
                {carriesFiltrados.map(carry => (
                    <div key={carry.id} className="crud-card">
                        <div className="card-image">
                            {carry.miembros?.avatar_url ? (
                                <img src={carry.miembros.avatar_url} alt={carry.miembros.nombre_mostrar} />
                            ) : (
                                <Icon name="user" size={48} />
                            )}
                            {carry.destacado && (
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
                                    <Icon name="crown" size={14} />
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            <h3 className="card-title">
                                {carry.miembros?.nombre_mostrar}
                            </h3>
                            <div className="card-meta">
                                {carry.titulo && (
                                    <span style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 600
                                    }}>
                                        {carry.titulo}
                                    </span>
                                )}
                                {carry.especialidad && (
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        {carry.especialidad}
                                    </span>
                                )}
                            </div>
                            <div className="card-actions">
                                <button className="btn-icon" onClick={() => openModal(carry)}>
                                    <Icon name="file" size={18} />
                                </button>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(carry.id)}>
                                    <Icon name="ban" size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {carriesFiltrados.length === 0 && (
                <div className="empty-state">
                    <Icon name="star" size={48} />
                    <p>No hay carries</p>
                </div>
            )}

            {}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editando ? 'Editar Carry' : 'Nuevo Carry'}</h2>
                            <button onClick={() => setShowModal(false)}>
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Miembro</label>
                                <select
                                    value={form.miembro_id}
                                    onChange={e => setForm({ ...form, miembro_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar miembro</option>
                                    {miembros.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre_mostrar}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Título</label>
                                    <input
                                        type="text"
                                        value={form.titulo}
                                        onChange={e => setForm({ ...form, titulo: e.target.value })}
                                        placeholder="Pro Player, Master..."
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
                            </div>

                            <div className="form-group">
                                <label>Especialidad</label>
                                <input
                                    type="text"
                                    value={form.especialidad}
                                    onChange={e => setForm({ ...form, especialidad: e.target.value })}
                                    placeholder="Ranked, Torneos, Casual..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Logros</label>
                                <textarea
                                    value={form.logros}
                                    onChange={e => setForm({ ...form, logros: e.target.value })}
                                    placeholder="Logros y reconocimientos..."
                                    rows={3}
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
                                        Destacado (Corona)
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
                                    {editando ? 'Guardar' : 'Crear Carry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCarries
