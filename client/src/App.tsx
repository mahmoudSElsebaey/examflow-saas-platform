import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Future routes: /login, /register, /app/* will be added in later phases */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
