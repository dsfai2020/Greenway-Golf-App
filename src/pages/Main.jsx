import React, { useState } from 'react'
import Scorecard from '../components/Scorecard'
import Heatmap from '../components/Heatmap'
import { useAuth } from '../contexts/AuthContext'
import { useSession } from '../contexts/SessionContext'

function SessionSetup({ holes }){
  const { current, users } = useAuth()
  const { session, createSession, addPlayer, removePlayer, exportSession } = useSession()
  const [emailToAdd, setEmailToAdd] = useState('')

  function handleCreate(){ createSession({ name: 'Round', holes }) }
  function handleAdd(){
    if(!emailToAdd) return
    const u = users[emailToAdd]
    if(!u) return alert('No user with that email')
    addPlayer({ id: emailToAdd, name: u.name, email: emailToAdd })
    setEmailToAdd('')
  }

  return (
    <div className="card" style={{marginBottom:12}}>
      <h3>Session Setup</h3>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button onClick={handleCreate}>New Session</button>
        <div style={{flex:1}}>
          <input placeholder="user email to add" value={emailToAdd} onChange={e=> setEmailToAdd(e.target.value)} />
        </div>
        <button className="small" onClick={handleAdd}>Add</button>
      </div>
      <div style={{marginTop:8}}>
        <strong>Players:</strong>
        <div style={{display:'flex',gap:8,marginTop:6,flexWrap:'wrap'}}>
          {session.players && session.players.length>0 ? session.players.map(p => (
            <div key={p.id} style={{padding:6,background:'#fff',borderRadius:6,boxShadow:'0 6px 12px rgba(0,0,0,0.06)'}}>
              {p.name}
            </div>
          )) : <div className="empty">No players added</div>}
      </div>
      </div>
    </div>
  )
}

export default function Main(){
  const [holes, setHoles] = useState(18)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [heatView, setHeatView] = useState('all')

  return (
    <section className="main-page">
      {showHeatmap && <Heatmap holes={holes} view={heatView} />}
      <div className="controls">
        <label style={{marginRight:12}}>
          Holes:
          <select value={holes} onChange={e => setHoles(Number(e.target.value))}>
            <option value={9}>9</option>
            <option value={18}>18</option>
          </select>
        </label>
        <label style={{marginRight:12}}>
          Heatmap view:
          <select value={heatView} onChange={e => setHeatView(e.target.value)}>
            <option value={'all'}>All</option>
            <option value={'front'}>Front 9</option>
            <option value={'back'}>Back 9</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} /> Show heatmap
        </label>
      </div>
      <SessionSetup holes={holes} />
      <Scorecard holes={holes} />
    </section>
  )
}
