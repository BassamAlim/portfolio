import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NotFound from './NotFound'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><NotFound /></StrictMode>)
