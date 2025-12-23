import { Icon } from './Icons.jsx'
import './ErrorMessage.css'

function ErrorMessage({ message, onRetry }) {
    return (
        <div className="error-container">
            <Icon name="warning" size={48} />
            <p className="error-text">{message || 'Ha ocurrido un error'}</p>
            {onRetry && (
                <button className="error-retry" onClick={onRetry}>
                    Reintentar
                </button>
            )}
        </div>
    )
}

export default ErrorMessage
