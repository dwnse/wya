import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icons'
import {
    obtenerTodosCarries,
    obtenerSolicitudesMiembro
} from '../../services/adminService'
import { obtenerEstadisticasClan } from '../../services/supabaseService'
import './Dashboard.css'

function Dashboard() {
    const [stats, setStats] = useState({
        miembros: 0,
        clips: 0,
        carries: 0,
        solicitudes: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        try {
            const [summary, carries, solicitudes] = await Promise.all([
                obtenerEstadisticasClan(),
                obtenerTodosCarries(),
                obtenerSolicitudesMiembro()
            ])

            setStats({
                miembros: summary?.miembros_activos || 0,
                clips: summary?.clips_publicados || 0,
                carries: carries?.length || 0,
                solicitudes: solicitudes?.filter(item => item.estado === 'pendiente').length || 0
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const cards = [
        { label: 'Miembros', value: stats.miembros, icon: 'user', color: '#3b82f6' },
        { label: 'Clips', value: stats.clips, icon: 'video', color: '#ef4444' },
        { label: 'Top Clan', value: stats.carries, icon: 'star', color: '#f59e0b' },
        { label: 'Solicitudes pendientes', value: stats.solicitudes, icon: 'file', color: '#a855f7' },
    ]

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Bienvenido al panel de administración de Ryo</p>
            </div>

            <div className="stats-grid">
                {cards.map(card => (
                    <div key={card.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>
                            <Icon name={card.icon} size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {loading ? '-' : card.value}
                            </span>
                            <span className="stat-label">{card.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="quick-actions">
                <h2>Acciones Rápidas</h2>
                <div className="actions-grid">
                    <a href="/admin/miembros" className="action-card">
                        <Icon name="user" size={24} />
                        <span>Agregar Miembro</span>
                    </a>
                    <a href="/admin/clips" className="action-card">
                        <Icon name="video" size={24} />
                        <span>Subir Clip</span>
                    </a>
                    <a href="/admin/puntos" className="action-card">
                        <Icon name="target" size={24} />
                        <span>Asignar Puntos</span>
                    </a>
                    <a href={`${import.meta.env.BASE_URL}#/admin/solicitudes`} className="action-card">
                        <Icon name="file" size={24} />
                        <span>Revisar Solicitudes</span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
