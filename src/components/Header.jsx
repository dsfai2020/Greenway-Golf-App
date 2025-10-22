import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

export default function Header(){
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(()=>{
    try{ const raw = localStorage.getItem('golf-session'); return raw ? JSON.parse(raw) : null }catch(e){ return null }
  })

  useEffect(()=>{
    function onAuth(e){ setUser(e && e.detail ? e.detail.user : null) }
    window.addEventListener('golf:auth-changed', onAuth)
    return ()=> window.removeEventListener('golf:auth-changed', onAuth)
  },[])
  return (
    <header className="site-header">
      <div className="brand">
        <div className="logo">⛳</div>
        <div className="title">Greenway</div>
      </div>
      <button className="menu-button" aria-label="Toggle menu" onClick={()=> setOpen(v=>!v)}>{open ? '✕' : '☰'}</button>
      <nav className={`nav ${open ? 'open' : ''}`} onClick={()=> setOpen(false)}>
        <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/main" className={({isActive}) => isActive ? 'active' : ''}>Main</NavLink>
        <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>About</NavLink>
        {user ? (
          <span style={{marginLeft:12,display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:'var(--green)'}}>Hi, {user.name}</span>
            <button className="small mute" onClick={()=> { localStorage.removeItem('golf-session'); window.dispatchEvent(new CustomEvent('golf:auth-changed', { detail: { user: null } })) }}>Sign out</button>
          </span>
        ) : null}
      </nav>
    </header>
  )
}
