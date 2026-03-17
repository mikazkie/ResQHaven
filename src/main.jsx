import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import 'leaflet/dist/leaflet.css'
import "bootstrap-icons/font/bootstrap-icons.css"

import { AuthProvider } from '../src/authentication/AuthContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
        <App /> 
    </AuthProvider>
  </StrictMode>,
)
