import { useEffect, useState } from 'react'
import { obtenerActividadFeed, obtenerDesafiosAdmin, crearActividad, crearDesafio, notificarDiscord } from '../../services/supabaseService.js'
import { obtenerTodosMiembros } from '../../services/adminService.js'
import { getLocalDateTimeInputValue } from '../../utils/dateDefaults.js'
import { Icon } from '../../components/Icons.jsx'
import Loading from '../../components/Loading.jsx'
import './AdminCrud.css'

function AdminCommunity({ section }) {
    const [activity, setActivity] = useState([])
    const [challenges, setChallenges] = useState([])
    const [members, setMembers] = useState([])
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [activityForm, setActivityForm] = useState({ miembro_id: '', tipo: 'anuncio', titulo: '', descripcion: '' })
    const [discordForm, setDiscordForm] = useState({ title: '', description: '' })
    const [challengeForm, setChallengeForm] = useState({ titulo: '', descripcion: '', objetivo_tipo: 'clips', objetivo_cantidad: 1, recompensa_puntos: 50, inicia_en: getLocalDateTimeInputValue(), termina_en: getLocalDateTimeInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), estado: 'activo' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([obtenerActividadFeed(), obtenerDesafiosAdmin(), obtenerTodosMiembros()])
            .then(([feed, activeChallenges, allMembers]) => { setActivity(feed || []); setChallenges(activeChallenges || []); setMembers(allMembers || []) })
            .finally(() => setLoading(false))
    }, [])

    async function saveActivity(event) {
        event.preventDefault(); setSaving(true); setMessage('')
        try {
            await crearActividad({ ...activityForm, miembro_id: activityForm.miembro_id || null })
            setActivityForm({ miembro_id: '', tipo: 'anuncio', titulo: '', descripcion: '' })
            setMessage('Actividad publicada')
            setActivity((current) => [{ ...activityForm, id: crypto.randomUUID(), creado_en: new Date().toISOString() }, ...current])
        } catch (error) { setMessage(error.message || 'No se pudo publicar la actividad') } finally { setSaving(false) }
    }

    async function saveChallenge(event) {
        event.preventDefault(); setSaving(true); setMessage('')
        try {
            const created = await crearDesafio({ ...challengeForm, objetivo_cantidad: Number(challengeForm.objetivo_cantidad), recompensa_puntos: Number(challengeForm.recompensa_puntos), inicia_en: new Date(challengeForm.inicia_en).toISOString(), termina_en: new Date(challengeForm.termina_en).toISOString() })
            setChallenges((current) => [created, ...current])
            setMessage('Desafío creado')
        } catch (error) { setMessage(error.message || 'No se pudo crear el desafío') } finally { setSaving(false) }
    }

    async function sendDiscord(event) {
        event.preventDefault(); setSaving(true); setMessage('')
        try {
            await notificarDiscord({ title: discordForm.title, description: discordForm.description, color: 0x5865F2 })
            setDiscordForm({ title: '', description: '' })
            setMessage('Anuncio enviado a Discord')
        } catch (error) { setMessage(error.message || 'No se pudo enviar el anuncio') } finally { setSaving(false) }
    }

    if (loading) return <Loading text="Cargando comunidad..." />

    const titles = { actividad: 'Actividad comunitaria', desafios: 'Desafíos', votos: 'Votos de Tier', discord: 'Anuncios de Discord' }
    return <div className="admin-crud"><div className="crud-header"><div><span className="admin-kicker">Comunidad / Control</span><h1>{titles[section]}</h1><p>{section === 'discord' ? 'Los anuncios se envían automáticamente desde clips, eventos y Top Clan.' : 'Gestiona las funciones comunitarias.'}</p></div><Icon name={section === 'votos' ? 'trophy' : section === 'desafios' ? 'target' : 'calendar'} size={28} /></div>{message && <div className="request-admin-error">{message}</div>}{section === 'discord' ? <form className="points-form" onSubmit={sendDiscord}><div className="points-form-title"><Icon name="externalLink" size={20} /><span>Nuevo anuncio</span></div><label>Título<input value={discordForm.title} onChange={event => setDiscordForm({ ...discordForm, title: event.target.value })} required maxLength={256} /></label><label>Mensaje<textarea value={discordForm.description} onChange={event => setDiscordForm({ ...discordForm, description: event.target.value })} maxLength={4000} /></label><button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Enviando...' : 'Enviar a Discord'}</button></form> : section === 'desafios' ? <><form className="points-form" onSubmit={saveChallenge}><div className="points-form-title"><Icon name="target" size={20} /><span>Nuevo desafío</span></div><label>Título<input value={challengeForm.titulo} onChange={event => setChallengeForm({ ...challengeForm, titulo: event.target.value })} required maxLength={150} /></label><label>Descripción<textarea value={challengeForm.descripcion} onChange={event => setChallengeForm({ ...challengeForm, descripcion: event.target.value })} required /></label><label>Objetivo<select value={challengeForm.objetivo_tipo} onChange={event => setChallengeForm({ ...challengeForm, objetivo_tipo: event.target.value })}><option value="clips">Clips publicados</option><option value="eventos">Eventos</option><option value="puntos">Puntos</option><option value="actividad">Actividad</option></select></label><label>Cantidad<input type="number" min="1" value={challengeForm.objetivo_cantidad} onChange={event => setChallengeForm({ ...challengeForm, objetivo_cantidad: event.target.value })} required /></label><label>Recompensa en puntos<input type="number" min="0" value={challengeForm.recompensa_puntos} onChange={event => setChallengeForm({ ...challengeForm, recompensa_puntos: event.target.value })} required /></label><label>Inicia<input type="datetime-local" value={challengeForm.inicia_en} onChange={event => setChallengeForm({ ...challengeForm, inicia_en: event.target.value })} required /></label><label>Termina<input type="datetime-local" value={challengeForm.termina_en} onChange={event => setChallengeForm({ ...challengeForm, termina_en: event.target.value })} required /></label><button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear desafío'}</button></form><div className="crud-cards">{challenges.map(challenge => <article className="crud-card" key={challenge.id}><div className="card-body"><h3 className="card-title">{challenge.titulo}</h3><p>{challenge.descripcion}</p><span>{challenge.recompensa_puntos} puntos · {challenge.estado}</span></div></article>)}</div></> : section === 'actividad' ? <><form className="points-form" onSubmit={saveActivity}><div className="points-form-title"><Icon name="calendar" size={20} /><span>Nueva actividad</span></div><label>Título<input value={activityForm.titulo} onChange={event => setActivityForm({ ...activityForm, titulo: event.target.value })} required maxLength={180} /></label><label>Descripción<textarea value={activityForm.descripcion} onChange={event => setActivityForm({ ...activityForm, descripcion: event.target.value })} /></label><label>Miembro relacionado<select value={activityForm.miembro_id} onChange={event => setActivityForm({ ...activityForm, miembro_id: event.target.value })}><option value="">Actividad general</option>{members.map(member => <option value={member.id} key={member.id}>{member.nombre_mostrar}</option>)}</select></label><button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Publicando...' : 'Publicar actividad'}</button></form><div className="activity-list">{activity.map(item => <article className="activity-line" key={item.id}><span className="activity-dot" /><div><strong>{item.titulo}</strong><small>{item.descripcion || 'Actividad registrada'} · {new Date(item.creado_en).toLocaleString('es-ES')}</small></div></article>)}</div></> : <div className="empty-state"><Icon name="trophy" size={34} /><p>Los votos se revisan desde los perfiles públicos.</p></div>}</div>
}

export default AdminCommunity