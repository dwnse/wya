import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import './styles/Filters.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {import.meta.env.DEV ? (
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <App />
            </BrowserRouter>
        ) : (
            <HashRouter>
                <App />
            </HashRouter>
        )}
    </StrictMode>,
)
