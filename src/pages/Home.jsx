import React from 'react'
import Profile from '../components/Profile'

export default function Home(){
  return (
    <section className="home">
      <div className="hero">
        <h1>Welcome to Greenway</h1>
        <p>Track your rounds, strokes, and enjoy a modern golf-themed scorecard.</p>
      </div>
      <div className="cards">
        <div className="card">
          <h3>Quick Start</h3>
          <p>Go to Main to start a new 9 or 18 hole scorecard.</p>
        </div>
        <div className="card">
          <h3>About</h3>
          <p>Designed for simplicity and speed on the course.</p>
        </div>
        <Profile />
      </div>
    </section>
  )
}
