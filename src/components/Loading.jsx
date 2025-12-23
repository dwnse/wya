import './Loading.css'

function Loading({ text = 'Cargando...' }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">{text}</p>
        </div>
    )
}

export default Loading
