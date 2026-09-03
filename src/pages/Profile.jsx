import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { Icon } from '../components/Icons.jsx'
import MinecraftProfileCard from '../components/MinecraftProfileCard.jsx'
import { useUserAuth } from '../context/UserAuthContext.jsx'
import { useActividadMiembro, useClips, useMiembrosTier, usePuntosPorCategoria, useProgresoMiembro } from '../hooks/useSupabase.js'
import './PlatformPages.css'

function Profile() {
    const { id } = useParams()
    const { user, isLoggedIn } = useUserAuth()
    const { data: miembros, loading: loadingMember } = useMiembrosTier()
    const member = useMemo(() => id
        ? miembros?.find(item => item.miembro_id === id)
        : miembros?.find(item => item.usuario_id === user?.id), [id, miembros, user?.id])
    const memberId = member?.miembro_id
    const { data: progress, loading: loadingProgress } = useProgresoMiembro(memberId)
    const { data: categories } = usePuntosPorCategoria(memberId)
    const { data: activity } = useActividadMiembro(memberId)
    const { data: clips } = useClips()
    const memberClips = clips?.filter(clip => clip.miembro_id === memberId || clip.miembros?.id === memberId).slice(0, 3) || []
    if (!id && !isLoggedIn) {
        return <div className="platform-page"><Header /><main className="platform-main"><div className="page-heading"><div><span className="section-kicker">Identidad / Progreso</span><h1>Tu perfil</h1><p>Inicia sesión para consultar tu recorrido dentro de RYO.</p></div></div><Link className="discord-cta" to="/login"><Icon name="user" size={18} /> Iniciar sesión</Link></main></div>
    }

    if (loadingMember || (memberId && loadingProgress)) {
        return <div className="platform-page"><Header /><main className="platform-main"><div className="empty-state">Cargando perfil...</div></main></div>
    }

    if (!member) {
        return <div className="platform-page"><Header /><main className="platform-main"><div className="empty-state"><Icon name="user" size={30} /><p>Este jugador todavía no tiene un perfil competitivo.</p></div>{!id && isLoggedIn && <Link className="discord-cta" to="/solicitar-membresia"><Icon name="file" size={18} /> Solicitar membresía</Link>}</main></div>
    }

    const currentPoints = progress?.puntos_totales ?? member.puntos_totales ?? 0
    const progressValue = progress?.siguiente_tier_puntos
        ? Math.min(100, Math.round((currentPoints / progress.siguiente_tier_puntos) * 100))
        : 100

    return <div className="platform-page"><Header /><main className="platform-main profile-main">
        <section className="profile-hero">
            <div className="profile-avatar-large">{member.avatar_url ? <img src={member.avatar_url} alt="" /> : <Icon name="user" size={34} />}</div>
            <div className="profile-identity"><span className="section-kicker">Miembro RYO</span><h1>{member.nombre_mostrar}</h1><p>{member.minecraft_username || member.nombre_usuario}</p></div>
            <div className="tier-badge"><span>{member.tier_nombre || 'Tier I'}</span><small>Rango actual</small></div>
        </section>
        <MinecraftProfileCard username={member.minecraft_username} />
        <section className="profile-progress"><div className="profile-progress-head"><span>Progreso competitivo</span><strong>{currentPoints.toLocaleString('es-ES')} pts</strong></div><div className="progress-track"><span style={{ width: `${progressValue}%` }} /></div><div className="profile-progress-foot"><span>{progress?.siguiente_tier_nombre ? `Siguiente: ${progress.siguiente_tier_nombre}` : 'Rango máximo alcanzado'}</span><strong>{progress?.puntos_para_siguiente_tier ? `${progress.puntos_para_siguiente_tier} puntos restantes` : '100%'}</strong></div></section>
        <div className="profile-grid"><section className="profile-panel"><div className="panel-title"><span>Especialidades</span><Icon name="target" size={17} /></div>{categories?.length ? <div className="category-list">{categories.map(category => <div className="category-line" key={category.categoria_id}><span><i style={{ background: category.categoria_color || '#f05a47' }} />{category.categoria_nombre}</span><strong>{category.puntos}</strong></div>)}</div> : <div className="panel-empty">Aún no cuentas con actividad en categorías.</div>}</section><section className="profile-panel"><div className="panel-title"><span>Actividad reciente</span><Icon name="calendar" size={17} /></div>{activity?.length ? <div className="activity-list">{activity.map(item => <div className="activity-line" key={item.id}><span className="activity-dot" /><div><strong>{item.titulo}</strong><small>{item.descripcion}</small></div></div>)}</div> : <div className="panel-empty">Aún no cuentas con actividad.</div>}</section></div>
        <section className="profile-panel clips-panel"><div className="panel-title"><span>Clips publicados</span><Link to="/clips">Ver todos <Icon name="chevronRight" size={14} /></Link></div>{memberClips.length ? <div className="profile-clips">{memberClips.map(clip => <a href={clip.youtube_url} target="_blank" rel="noreferrer" key={clip.id}><span>{clip.titulo}</span><Icon name="externalLink" size={14} /></a>)}</div> : <div className="panel-empty">Aún no has publicado clips.</div>}</section>
    </main></div>
}

export default Profile
