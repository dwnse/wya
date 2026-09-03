import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icons'
import Loading from '../../components/Loading'
import {
    aprobarSolicitudMiembro,
    obtenerSolicitudesMiembro,
    rechazarSolicitudMiembro
} from '../../services/adminService'
import './AdminSolicitudes.css'

function AdminSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)
    const [procesando, setProcesando] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        cargarSolicitudes()
    }, [])

    async function cargarSolicitudes() {
        try {
            setLoading(true)
            setError('')
            setSolicitudes(await obtenerSolicitudesMiembro())
        } catch (requestError) {
            setError(requestError.message || 'No se pudieron cargar las solicitudes')
        } finally {
            setLoading(false)
        }
    }

    async function aprobar(id) {
        try {
            setProcesando(id)
            await aprobarSolicitudMiembro(id)
            setSolicitudes(current => current.map(item => item.id === id
                ? { ...item, estado: 'aprobada' }
                : item))
        } catch (requestError) {
            setError(requestError.message || 'No se pudo aprobar la solicitud')
        } finally {
            setProcesando(null)
        }
    }

    async function rechazar(id) {
        const motivo = window.prompt('Motivo del rechazo (opcional):')
        if (motivo === null) return
        try {
            setProcesando(id)
            await rechazarSolicitudMiembro(id, motivo)
            setSolicitudes(current => current.map(item => item.id === id
                ? { ...item, estado: 'rechazada', motivo_rechazo: motivo }
                : item))
        } catch (requestError) {
            setError(requestError.message || 'No se pudo rechazar la solicitud')
        } finally {
            setProcesando(null)
        }
    }

    if (loading) return <Loading text="Cargando solicitudes..." />

    return (
        <div className="admin-requests">
            <div className="crud-header">
                <div>
                    <h1>Solicitudes de membresía</h1>
                    <p>{solicitudes.filter(item => item.estado === 'pendiente').length} pendientes de revisión</p>
                </div>
                <button className="btn-secondary" onClick={cargarSolicitudes}>
                    <Icon name="refresh" size={17} />
                    Actualizar
                </button>
            </div>

            {error && <div className="request-admin-error">{error}</div>}

            {solicitudes.length === 0 ? (
                <div className="empty-state"><Icon name="file" size={40} /><p>No hay solicitudes todavía.</p></div>
            ) : (
                <div className="request-list">
                    {solicitudes.map(solicitud => {
                        const usuario = solicitud.usuarios || {}
                        const pendiente = solicitud.estado === 'pendiente'
                        return (
                            <article className="request-card" key={solicitud.id}>
                                <div className="request-card-head">
                                    <div className="request-user">
                                        <div className="request-avatar">
                                            {usuario.avatar_url ? <img src={usuario.avatar_url} alt="" /> : <Icon name="user" size={20} />}
                                        </div>
                                        <div>
                                            <strong>{usuario.nombre || 'Usuario'}</strong>
                                            <span>{usuario.email || 'Sin email'}</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge status-${solicitud.estado}`}>{solicitud.estado}</span>
                                </div>
                                <p className="request-date">Enviada el {new Date(solicitud.creado_en).toLocaleString('es-ES')}</p>
                                <div className="request-fields"><span><strong>Nombre:</strong> {solicitud.nombre_mostrar || solicitud.nombre_usuario}</span><span><strong>Minecraft:</strong> {solicitud.minecraft_username || 'No indicado'}</span><span><strong>Ingreso:</strong> {solicitud.fecha_ingreso || 'No indicada'}</span></div><p className="request-reason">{solicitud.razon}</p>
                                {solicitud.motivo_rechazo && <p className="request-rejection">Motivo: {solicitud.motivo_rechazo}</p>}
                                {pendiente && <div className="request-actions"><button className="btn-approve" onClick={() => aprobar(solicitud.id)} disabled={procesando === solicitud.id}><Icon name="check" size={17} /> Aceptar</button><button className="btn-reject" onClick={() => rechazar(solicitud.id)} disabled={procesando === solicitud.id}><Icon name="close" size={17} /> Rechazar</button></div>}
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AdminSolicitudes
