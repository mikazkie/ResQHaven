import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "react-datepicker/dist/react-datepicker.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import 'leaflet/dist/leaflet.css'
import "bootstrap-icons/font/bootstrap-icons.css"

import { AuthProvider } from '../src/authentication/AuthContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'

if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))
      } catch (error) {
        console.log('Service worker cleanup failed', error)
      }
    })
  }

  if ('caches' in window) {
    window.addEventListener('load', async () => {
      try {
        const cacheKeys = await window.caches.keys()
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
      } catch (error) {
        console.log('Cache cleanup failed', error)
      }
    })
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
        <App /> 
    </AuthProvider>
  </StrictMode>,
)
