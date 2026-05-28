import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from '@/context/AuthContext'
import { InquiryProvider } from '@/context/InquiryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <InquiryProvider>
        <App />
      </InquiryProvider>
    </AuthProvider>
  </StrictMode>,
)
