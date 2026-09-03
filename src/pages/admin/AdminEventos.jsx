import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icons.jsx'
import Loading from '../../components/Loading.jsx'
import { actualizarEvento, crearEvento, eliminarEvento, obtenerEventosAdmin } from '../../services/adminService.js'
import './AdminEventos.css'

const emptyEvent = { titulo: '', slug: '', descripcion: '', tipo: 'PvP', fecha_inicio: '', fecha_fin: '', ubicacion: '', estado: 'borrador' }

function AdminEventos() {
    const [events, setEvents] = useState([])
    const [form, setForm] = useState(emptyEvent)
    const [editing, setEditing] = useState(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function loadEvents() {
        try { setEvents(await obtenerEventosAdmin() || []) } catch (err) { setError(err.message) } finally { setLoading(false) }
    }
    useEffect(() => { loadEvents() }, [])

    function startEvent(event = null) {
        setEditing(event)
        setForm(event ? { ...event, fecha_inicio: event.fecha_inicio?.slice(0, 16), fecha_fin: event.fecha_fin?.slice(0, 16) || '' } : emptyEvent)
        setOpen(true)
        setError('')
    }

    async function saveEvent(event) {
        event.preventDefault()
        setSaving(true); setError('')
        try {
            const payload = { ...form, slug: form.slug.trim() || form.titulo.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), fecha_fin: form.fecha_fin || null }
            if (editing) await actualizarEvento(editing.id, payload)
            else await crearEvento(payload)
            setOpen(false); await loadEvents()
        } catch (err) { setError(err.message) } finally { setSaving(false) }
    }

    async function cancelEvent(id) {
        if (!window.confirm('¿Cancelar este evento?')) return
        try { await eliminarEvento(id); await loadEvents() } catch (err) { setError(err.message) }
    }

    if (loading) return <Loading text="Cargando eventos..." />
    return <div className="admin-eventos"><div className="crud-header"><div><span className="admin-kicker">Comunidad / Agenda</span><h1>Eventos</h1><p>Organiza desafíos y actividades del clan.</p></div><button className="btn-primary" onClick={() => startEvent()}><Icon name="calendar" size={18} /> Nuevo evento</button></div><div className="events-admin-list">{events.length ? events.map(event => <article className="event-admin-row" key={event.id}><div className="event-date"><strong>{new Date(event.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</strong><span>{new Date(event.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span></div><div className="event-admin-info"><span className={`event-status ${event.estado}`}>{event.estado}</span><h2>{event.titulo}</h2><p>{event.tipo || 'Evento'}{event.ubicacion ? ` · ${event.ubicacion}` : ''}</p></div><div className="event-admin-actions"><button className="btn-icon" onClick={() => startEvent(event)} title="Editar evento"><Icon name="file" size={17} /></button>{event.estado !== 'cancelado' && <button className="btn-icon btn-danger" onClick={() => cancelEvent(event.id)} title="Cancelar evento"><Icon name="close" size={17} /></button>}</div></article>) : <div className="empty-state">No hay eventos creados.</div>}</div>{open && <div className="modal-overlay" onClick={() => setOpen(false)}><form className="modal" onClick={event => event.stopPropagation()} onSubmit={saveEvent}><div className="modal-header"><h2>{editing ? 'Editar evento' : 'Nuevo evento'}</h2><button type="button" onClick={() => setOpen(false)}><Icon name="close" size={20} /></button></div><div className="modal-form"><div className="form-group"><label>Título</label><input value={form.titulo} onChange={event => setForm({ ...form, titulo: event.target.value })} required maxLength={150} /></div><div className="form-row"><div className="form-group"><label>Tipo</label><input value={form.tipo} onChange={event => setForm({ ...form, tipo: event.target.value })} /></div><div className="form-group"><label>Estado</label><select value={form.estado} onChange={event => setForm({ ...form, estado: event.target.value })}><option value="borrador">Borrador</option><option value="publicado">Publicado</option><option value="finalizado">Finalizado</option><option value="cancelado">Cancelado</option></select></div></div><div className="form-row"><div className="form-group"><label>Inicio</label><input type="datetime-local" value={form.fecha_inicio} onChange={event => setForm({ ...form, fecha_inicio: event.target.value })} required /></div><div className="form-group"><label>Fin (opcional)</label><input type="datetime-local" value={form.fecha_fin} onChange={event => setForm({ ...form, fecha_fin: event.target.value })} /></div></div><div className="form-group"><label>Ubicación o servidor</label><input value={form.ubicacion} onChange={event => setForm({ ...form, ubicacion: event.target.value })} /></div><div className="form-group"><label>Descripción</label><textarea value={form.descripcion} onChange={event => setForm({ ...form, descripcion: event.target.value })} rows={4} /></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar evento'}</button></div></div></form></div>}</div>
}

export default AdminEventos
