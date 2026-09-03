import Header from '../components/Header.jsx'
import { Icon } from '../components/Icons.jsx'
import './PlatformPages.css'

function Events() {
    return <div className="platform-page"><Header /><main className="platform-main"><div className="page-heading"><div><span className="section-kicker">Comunidad / Agenda</span><h1>Eventos</h1><p>Próximos desafíos del clan.</p></div><span className="heading-mark">02</span></div><div className="empty-state"><Icon name="calendar" size={30} /><p>Los próximos eventos aparecerán aquí.</p></div></main></div>
}

export default Events
