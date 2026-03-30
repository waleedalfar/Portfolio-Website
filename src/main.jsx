import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './index.css'
import Portfolio from './Portfolio.jsx'
import PomodoroStudyTimer from './PomodoroStudyTimer.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/study" element={<PomodoroStudyTimer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)