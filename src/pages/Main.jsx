import React, { useState, useEffect } from 'react'
import Scorecard from '../components/Scorecard'
import { CustomRulesPanel } from '../components/Scorecard'
import Heatmap from '../components/Heatmap'
import TreasureMapView from '../components/TreasureMapView'
import TraditionalScorecardModal from '../components/TraditionalScorecardModal'
import { useSession } from '../contexts/SessionContext'

function SessionSetup({ holes }){
  const { session, createSession, addPlayer, removePlayer } = useSession()
  const [nameInput, setNameInput] = useState('')

  function handleAdd(){
    const trimmed = nameInput.trim()
    if (!trimmed) return
    const id = `player_${trimmed.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
    addPlayer({ id, name: trimmed })
    setNameInput('')
  }

  function handleKeyDown(e){
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="session-setup-panel">
      <div className="session-setup-header">
        <span className="session-setup-title">👥 Players</span>
      </div>
      <div className="session-setup-body">
        <div className="session-add-row">
          <input
            className="session-name-input"
            placeholder="Player name…"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="session-add-btn" onClick={handleAdd}>+ Add</button>
        </div>
        <div className="session-players-list">
          {session.players && session.players.length > 0 ? session.players.map(p => (
            <div key={p.id} className="session-player-chip">
              <span className="session-player-name">{p.name}</span>
              <button className="session-player-remove" onClick={() => removePlayer(p.id)} title="Remove">✕</button>
            </div>
          )) : <div className="session-empty">No players yet</div>}
        </div>
      </div>
    </div>
  )
}

export default function Main(){
  const [holes, setHoles] = useState(18)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatView, setHeatView] = useState('all')
  const [showTradScorecard, setShowTradScorecard] = useState(false)

  const pickupKey = 'golf-pickup-rule'
  const [pickupSettings, setPickupSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(pickupKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.mode === 'multiplier') parsed.mode = 'addToPar'
        return parsed
      }
    } catch(e) {}
    return { mode: 'addToPar', addToPar: 3, addToScore: 3 }
  })

  useEffect(() => {
    try { localStorage.setItem(pickupKey, JSON.stringify(pickupSettings)) } catch(e) {}
  }, [pickupSettings])

  function updatePickupSettings(patch) {
    setPickupSettings(s => ({ ...s, ...patch }))
  }

  return (
    <section className="main-page">
      <SessionSetup holes={holes} />
      <CustomRulesPanel pickupSettings={pickupSettings} onUpdatePickupSettings={updatePickupSettings} />
      <TreasureMapView holes={holes} />
      <div className="controls">
        <label style={{marginRight:12}}>
          Holes:
          <select value={holes} onChange={e => setHoles(Number(e.target.value))}>
            <option value={9}>9</option>
            <option value={18}>18</option>
          </select>
        </label>
      </div>
      <Scorecard
        holes={holes}
        pickupSettings={pickupSettings}
        onUpdatePickupSettings={updatePickupSettings}
      />

      {/* Heatmap — hidden by default, toggled at the bottom */}
      <div className="heatmap-section">
        <button
          className={`heatmap-toggle-btn ${showHeatmap ? 'open' : ''}`}
          onClick={() => setShowHeatmap(o => !o)}
        >
          🌡️ Heatmap {showHeatmap ? '▲' : '▼'}
        </button>
        {showHeatmap && (
          <div className="heatmap-body">
            <label className="heatmap-view-select">
              View:
              <select value={heatView} onChange={e => setHeatView(e.target.value)}>
                <option value={'all'}>All</option>
                <option value={'front'}>Front 9</option>
                <option value={'back'}>Back 9</option>
              </select>
            </label>
            <Heatmap holes={holes} view={heatView} />
          </div>
        )}
      </div>

      <TraditionalScorecardModal
        isOpen={showTradScorecard}
        onClose={() => setShowTradScorecard(false)}
        holes={holes}
      />

      <footer className="app-footer">
        <button className="footer-btn" onClick={() => setShowTradScorecard(true)}>
          📋 Scorecard
        </button>
      </footer>
    </section>
  )
}
