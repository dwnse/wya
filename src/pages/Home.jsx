import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { Icon } from '../components/Icons.jsx'
import './Home.css'

function Home() {
    return (
        <div className="home">
            <Header variant="home" />

            <div className="hero">
                <div className="hero-glow"></div>

                <div className="hero-logo">
                    <img
                        src={`${import.meta.env.BASE_URL}images/logo123.jpg`}
                        alt="Lou Logo"
                    />
                </div>

                <h1 className="hero-title">LOU</h1>

                <p className="hero-subtitle">ÚNETE AL CLAN</p>

                <a
                    href="https://discord.gg/uNcEMnEg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-button"
                >
                    <Icon name="discord" size={22} />
                    <span>Unirse al Discord</span>
                </a>
            </div>

            <Footer />
        </div>
    )
}

export default Home
