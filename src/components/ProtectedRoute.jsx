import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="protected-loading">
                <Loading text="Verificando sesión..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    return children
}

export default ProtectedRoute
