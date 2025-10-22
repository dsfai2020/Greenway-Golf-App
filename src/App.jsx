import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import About from './pages/About'
import Main from './pages/Main'
import { AuthProvider } from './contexts/AuthContext'
import { SessionProvider } from './contexts/SessionContext'

export default function App(){
  return (
    <AuthProvider>
      <SessionProvider>
        <div className="app-root">
          <Header />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/main" element={<Main />} />
            </Routes>
          </main>
        </div>
      </SessionProvider>
    </AuthProvider>
  )
}
