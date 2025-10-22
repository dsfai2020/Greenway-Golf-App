import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Profile(){
  const { current, register, signIn, signOut, editProfile, saveRound, loadRounds } = useAuth()
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [rounds, setRounds] = useState({})

  useEffect(()=>{
    if(current){
      setEmail(current.email)
      setName(current.name)
      const rs = loadRounds(current.email)
      setRounds(rs || {})
    } else {
      setEmail('')
      setName('')
      setRounds({})
    }
  },[current])

  async function handleRegister(){
    try{
      const u = register({ email, name, password })
      setMessage('Account created and signed in')
    }catch(e){ setMessage(e.message) }
  }

  async function handleSignIn(){
    try{
      const u = signIn({ email, password })
      setMessage('Signed in')
    }catch(e){ setMessage(e.message) }
  }

  function handleSignOut(){ signOut(); setMessage('Signed out') }

  async function handleSaveRound(){
    if(!current) return setMessage('Sign in first')
    const id = `round_${Date.now()}`
    // For now save an empty placeholder; Main/Scorecard can call saveRound with full data
    const data = { id, createdAt: Date.now(), holes: 18, savedBy: current.email }
    saveRound(current.email, id, data)
    setRounds(loadRounds(current.email))
    setMessage('Saved round')
  }

  async function handleLoadRound(id){
    const rs = loadRounds(current.email)
    const r = rs[id]
    if(!r) return setMessage('Round not found')
    // In a fuller app we'd load this into the scorecard; for now just show a message
    setMessage(`Loaded round ${id}`)
  }

  async function handleEditProfile(){
    try{
      editProfile({ email: current.email, name, password: password || undefined })
      setMessage('Profile updated')
    }catch(e){ setMessage(e.message) }
  }

  if(current){
    return (
      <div className="card profile-card">
        <h3>Profile</h3>
        <div>Signed in as <strong>{current.name}</strong></div>
        <div style={{marginTop:8}}>
          <label style={{display:'block'}}>Name <input value={name} onChange={e=> setName(e.target.value)} /></label>
          <label style={{display:'block'}}>New password <input type="password" value={password} onChange={e=> setPassword(e.target.value)} /></label>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button onClick={handleEditProfile}>Save Profile</button>
            <button onClick={handleSignOut} className="small mute">Sign Out</button>
          </div>

          <div style={{marginTop:12}}>
            <h4>Saved rounds</h4>
            {Object.keys(rounds).length === 0 ? (
              <div className="empty">No saved rounds</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {Object.keys(rounds).map(id => (
                  <div key={id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>{id}</div>
                    <div>
                      <button className="small" onClick={()=> handleLoadRound(id)}>Load</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{marginTop:8}}>
              <button onClick={handleSaveRound}>Save current round</button>
            </div>
          </div>

          {message && <div style={{marginTop:8,color:'#666'}}>{message}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="card profile-card">
      <h3>Account</h3>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <button className={`small ${mode==='sign-in' ? '' : 'mute'}`} onClick={()=> setMode('sign-in')}>Sign in</button>
        <button className={`small ${mode==='register' ? '' : 'mute'}`} onClick={()=> setMode('register')}>Register</button>
      </div>

      {mode === 'register' && (
        <label style={{display:'block',marginBottom:6}}>
          Name
          <input value={name} onChange={e=> setName(e.target.value)} placeholder="Your name" />
        </label>
      )}

      <label style={{display:'block',marginBottom:6}}>
        Email
        <input value={email} onChange={e=> setEmail(e.target.value)} placeholder="you@example.com" />
      </label>

      <label style={{display:'block',marginBottom:6}}>
        Password
        <input type="password" value={password} onChange={e=> setPassword(e.target.value)} />
      </label>

      <div style={{display:'flex',gap:8,marginTop:8}}>
        {mode === 'register' ? (
          <button onClick={handleRegister}>Create account</button>
        ) : (
          <button onClick={handleSignIn}>Sign in</button>
        )}
      </div>
      {message && <div style={{marginTop:8,color:'#666'}}>{message}</div>}
      <div style={{marginTop:8,fontSize:12,color:'#888'}}>Accounts and rounds are stored locally on this device only.</div>
    </div>
  )
}
