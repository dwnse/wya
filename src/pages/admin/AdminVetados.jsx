import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../../components/Icons'
import ImageUploader from '../../components/ImageUploader'
import Loading from '../../components/Loading'
import {
    obtenerTodosVetados,
    crearVetado,
    actualizarVetado,
    eliminarVetado
} from '../../services/adminService'
import { obtenerTiposVetado } from '../../services/supabaseService'
import './AdminCrud.css'

function AdminVetados() {
    const [vetados, setVetados] = useState([])
    const [tipos, setTipos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)

    // Filtros
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('todos')

    const [form, setForm] = useState({
        nombre: '',
        alias: '',
        imagen_url: '',
        tipo_id: '',
        razon: '',
        evidencia_url: '',
        notas: '',
        fecha_incidente: '',
        estado: 'activo'
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [vetadosData, tiposData] = await Promise.all([
                obtenerTodosVetados(),
                obtenerTiposVetado()
            ])
            setVetados(vetadosData || [])
            setTipos(tiposData || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtrar
    const vetadosFiltrados = useMemo(() => {
        return vetados.filter(v => {
            const matchBusqueda = !busqueda ||
                v.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                v.alias?.toLowerCase().includes(busqueda.toLowerCase())
            const matchTipo = filtroTipo === 'todos' || v.tipo_id === filtroTipo
            return matchBusqueda && matchTipo
        })
    }, [vetados, busqueda, filtroTipo])

    function openModal(vetado = null) {
        if (vetado) {
            setEditando(vetado)
            setForm({
                nombre: vetado.nombre,
                alias: vetado.alias || '',
                imagen_url: vetado.imagen_url || '',
                tipo_id: vetado.tipo_id || '',
                razon: vetado.razon,
                evidencia_url: vetado.evidencia_url || '',
                notas: vetado.notas || '',
                fecha_incidente: vetado.fecha_incidente || '',
                estado: vetado.estado
            })
        } else {
            setEditando(null)
            setForm({
                nombre: '',
                alias: '',
                imagen_url: '',
                tipo_id: '',
                razon: '',
                evidencia_url: '',
                notas: '',
                fecha_incidente: '',
                estado: 'activo'
            })
        }
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const datos = { ...form }
            if (!datos.tipo_id) delete datos.tipo_id
            if (!datos.fecha_incidente) delete datos.fecha_incidente

            if (editando) {
                await actualizarVetado(editando.id, datos)
            } else {
                await crearVetado(datos)
            }
            setShowModal(false)
            loadData()
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(id) {
        if (confirm('¿Eliminar este vetado?')) {
            try {
                await eliminarVetado(id)
                loadData()
            } catch (error) {
                alert('Error: ' + error.message)
            }
        }
    }

    // Colores por nivel de peligro
    function getDangerColor(nivel) {
        const colores = {
            5: '#dc2626',
            4: '#ea580c',
            3: '#d97706',
            2: '#ca8a04',
            1: '#65a30d'
        }
        return colores[nivel] || '#666'
    }

    if (loading) return <Loading text="Cargando..." />

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Vetados</h1>
                    <p>{vetadosFiltrados.length} registros</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Icon name="ban" size={18} />
                    Nuevo Vetado
                </button>
            </div>

            {/* Filtros */}
            <div className="crud-filters">
                <div className="filter-search">
                    <Icon name="ban" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar vetado..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                >
                    <option value="todos">Todos los tipos</option>
                    {tipos.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
            </div>

            {/* Lista */}
            <div className="crud-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {vetadosFiltrados.map(vetado => (
                    <div
                        key={vetado.id}
                        className="crud-card"
                        style={{ borderLeft: `4px solid ${getDangerColor(vetado.tipos_vetado?.nivel_peligro)}` }}
                    >
                        <div className="card-body" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: 'var(--color-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {vetado.imagen_url ? (
                                        <img src={vetado.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Icon name="user" size={24} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 className="card-title" style={{ marginBottom: 4 }}>
                                        {vetado.nombre}
                                    </h3>
                                    {vetado.alias && (
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                                            aka "{vetado.alias}"
                                        </p>
                                    )}
                                    <div className="card-meta">
                                        {vetado.tipos_vetado && (
                                            <span style={{
                                                background: getDangerColor(vetado.tipos_vetado.nivel_peligro),
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 600
                                            }}>
                                                {vetado.tipos_vetado.nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p style={{
                                marginTop: 16,
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.5
                            }}>
                                {vetado.razon}
                            </p>
                            <div className="card-actions" style={{ marginTop: 16, paddingTop: 16 }}>
                                <button className="btn-icon" onClick={() => openModal(vetado)}>
                                    <Icon name="file" size={18} />
                                </button>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(vetado.id)}>
                                    <Icon name="ban" size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {vetadosFiltrados.length === 0 && (
                <div className="empty-state">
                    <Icon name="ban" size={48} />
                    <p>No hay vetados</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editando ? 'Editar Vetado' : 'Nuevo Vetado'}</h2>
                            <button onClick={() => setShowModal(false)}>
                                <Icon name="close" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={form.nombre}
                                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Alias</label>
                                    <input
                                        type="text"
                                        value={form.alias}
                                        onChange={e => setForm({ ...form, alias: e.target.value })}
                                        placeholder="Apodo conocido"
                                    />
                                </div>
                            </div>

                            <ImageUploader
                                label="Foto (opcional)"
                                value={form.imagen_url}
                                onChange={(url) => setForm({ ...form, imagen_url: url })}
                                bucket="images"
                                folder="vetados"
                            />

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select
                                        value={form.tipo_id}
                                        onChange={e => setForm({ ...form, tipo_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        {tipos.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Fecha del incidente</label>
                                    <input
                                        type="date"
                                        value={form.fecha_incidente}
                                        onChange={e => setForm({ ...form, fecha_incidente: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Razón</label>
                                <textarea
                                    value={form.razon}
                                    onChange={e => setForm({ ...form, razon: e.target.value })}
                                    placeholder="Motivo del veto..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Evidencia URL</label>
                                <input
                                    type="url"
                                    value={form.evidencia_url}
                                    onChange={e => setForm({ ...form, evidencia_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Notas internas</label>
                                <textarea
                                    value={form.notas}
                                    onChange={e => setForm({ ...form, notas: e.target.value })}
                                    placeholder="Notas adicionales (solo admin)..."
                                    rows={2}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editando ? 'Guardar' : 'Crear Vetado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminVetados
