import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Header(){
  const [open, setOpen] = useState(false)
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
      </nav>
    </header>
  )
}
