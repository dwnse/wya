import { useState, useEffect, useMemo } from 'react'
import { Icon } from '../../components/Icons'
import Loading from '../../components/Loading'
import {
    obtenerTodosUsuarios,
    actualizarUsuario,
    obtenerRolesAdmin
} from '../../services/adminService'
import './AdminCrud.css'

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroRol, setFiltroRol] = useState('todos')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [usersData, rolesData] = await Promise.all([
                obtenerTodosUsuarios(),
                obtenerRolesAdmin()
            ])
            setUsuarios(usersData || [])
            setRoles(rolesData || [])
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter(u => {
            const matchBusqueda = u.nombre?.toLowerCase().includes(busqueda.toLowerCase())
            const matchRol = filtroRol === 'todos' || u.roles?.nombre === filtroRol

            return matchBusqueda && matchRol
        })
    }, [usuarios, busqueda, filtroRol])

    async function handleRoleChange(usuarioId, newRoleId) {
        if (!confirm('¿Estás seguro de cambiar el rol de este usuario?')) return

        try {
            const oldUsuarios = [...usuarios]
            setUsuarios(prev => prev.map(u => {
                if (u.id === usuarioId) {
                    const rolObj = roles.find(r => r.id === newRoleId)
                    return { ...u, rol_id: newRoleId, roles: rolObj }
                }
                return u
            }))

            await actualizarUsuario(usuarioId, { rol_id: newRoleId })
        } catch (error) {
            alert('Error al actualizar rol')
            loadData()
        }
    }

    if (loading) return <Loading text="Cargando usuarios..." />

    return (
        <div className="admin-crud">
            <div className="crud-header">
                <div>
                    <h1>Gestión de Usuarios</h1>
                    <p>{usuariosFiltrados.length} usuarios registrados</p>
                </div>
            </div>

            {}
            <div className="crud-filters">
                <div className="filter-search">
                    <Icon name="user" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                >
                    <option value="todos">Todos los roles</option>
                    {roles.map(rol => (
                        <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
                    ))}
                    <option value="sin_rol">Sin Rol</option>
                </select>
            </div>

            {}
            <div className="crud-table-wrapper">
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Info</th>
                            <th>Rol Asignado</th>
                            <th>Fecha Registro</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="cell-avatar">
                                        <div className="user-avatar-small" style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Icon name="user" size={16} />
                                            )}
                                        </div>
                                        <span>{u.nombre}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>ID: {u.id.substring(0, 8)}...</span>
                                </td>
                                <td>
                                    <select
                                        className="role-selector"
                                        value={u.rol_id || ''}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            background: '#1a1a1a',
                                            border: '1px solid #333',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">-- Sin Rol --</option>
                                        {roles.map(rol => (
                                            <option key={rol.id} value={rol.id}>
                                                {rol.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    {new Date(u.creado_en).toLocaleDateString()}
                                </td>
                                <td>
                                    <span className={`status-badge status-${u.estado}`}>
                                        {u.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {usuariosFiltrados.length === 0 && (
                <div className="empty-state">
                    <Icon name="user" size={48} />
                    <p>No se encontraron usuarios</p>
                </div>
            )}
        </div>
    )
}

export default AdminUsuarios
