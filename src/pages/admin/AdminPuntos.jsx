import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icons.jsx'
import Loading from '../../components/Loading.jsx'
import { asignarPuntosMiembro, obtenerCategoriasPuntosAdmin, obtenerTodosMiembros } from '../../services/adminService.js'
import './AdminPuntos.css'

function AdminPuntos() {
    const [miembros, setMiembros] = useState([])
    const [categorias, setCategorias] = useState([])
    const [form, setForm] = useState({ miembro_id: '', categoria_id: '', cantidad: '', motivo: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState(null)

    useEffect(() => {
        Promise.all([obtenerTodosMiembros(), obtenerCategoriasPuntosAdmin()])
            .then(([members, categories]) => {
                setMiembros(members || [])
                setCategorias(categories || [])
                setForm(current => ({ ...current, miembro_id: members?.[0]?.id || '', categoria_id: categories?.[0]?.id || '' }))
            })
            .catch(error => setFeedback({ type: 'error', text: error.message }))
            .finally(() => setLoading(false))
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()
        setFeedback(null)
        if (!form.miembro_id || !form.categoria_id || !form.cantidad || !form.motivo.trim()) {
            setFeedback({ type: 'error', text: 'Completa miembro, categoría, cantidad y motivo.' })
            return
        }
        setSaving(true)
        try {
            const result = await asignarPuntosMiembro(form)
            setFeedback({ type: 'success', text: `Movimiento aplicado: ${result?.cantidad_aplicada ?? form.cantidad} puntos. Total: ${result?.puntos_totales ?? 'actualizado'}.` })
            setForm(current => ({ ...current, cantidad: '', motivo: '' }))
        } catch (error) {
            setFeedback({ type: 'error', text: error.message || 'No se pudo aplicar el movimiento.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Loading text="Cargando sistema de puntos..." />

    return <div className="admin-puntos"><div className="admin-puntos-heading"><div><span className="admin-kicker">Progresión / Control</span><h1>Gestión de puntos</h1><p>Cada movimiento se registra en el historial y recalcula el tier automáticamente.</p></div><span className="admin-index">04</span></div><div className="points-layout"><form className="points-form" onSubmit={handleSubmit}><div className="points-form-title"><Icon name="target" size={20} /><span>Nuevo movimiento</span></div><label>Miembro<select value={form.miembro_id} onChange={event => setForm({ ...form, miembro_id: event.target.value })}><option value="">Selecciona un miembro</option>{miembros.map(member => <option value={member.id} key={member.id}>{member.nombre_mostrar} · {member.puntos_totales || 0} pts</option>)}</select></label><label>Categoría<select value={form.categoria_id} onChange={event => setForm({ ...form, categoria_id: event.target.value })}><option value="">Selecciona una categoría</option>{categorias.map(category => <option value={category.id} key={category.id}>{category.nombre}</option>)}</select></label><label>Cantidad <span className="field-hint">usa negativo para restar</span><input type="number" value={form.cantidad} onChange={event => setForm({ ...form, cantidad: event.target.value })} placeholder="100" /></label><label>Motivo<textarea value={form.motivo} onChange={event => setForm({ ...form, motivo: event.target.value })} placeholder="Ganador del torneo semanal" maxLength={300} /></label>{feedback && <div className={`points-feedback ${feedback.type}`}><Icon name={feedback.type === 'success' ? 'star' : 'warning'} size={17} />{feedback.text}</div>}<button className="points-submit" type="submit" disabled={saving}>{saving ? 'Aplicando...' : 'Aplicar movimiento'}<Icon name="chevronRight" size={17} /></button></form><aside className="points-guide"><span className="admin-kicker">Reglas del sistema</span><h2>La progresión se calcula sola.</h2><div className="guide-row"><span>+100 PvP</span><small>Suma a la categoría</small></div><div className="guide-row"><span>-50 PvP</span><small>Resta sin bajar de cero</small></div><div className="guide-row"><span>Historial</span><small>Movimiento inmutable</small></div><div className="guide-row"><span>Tier</span><small>Se recalcula por total</small></div></aside></div></div>
}

export default AdminPuntos
