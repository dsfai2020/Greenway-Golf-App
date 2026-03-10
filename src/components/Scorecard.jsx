import React, { useEffect, useState } from 'react'
import CelebratoryModal from './CelebratoryModal'
import ScoreboardSummary from './ScoreboardSummary'
import GameHistoryModal from './GameHistoryModal'
import HoleDetailModal from './HoleDetailModal'

function makeInitial(h){
  return Array.from({length: h}, () => ({par: 4, swings: [], completed: false}))
}

const defaultSwing = () => ({ club: '7I', terrain: 'Fairway', satisfaction: 3, notes: '', distance: 150 })

const defaultClubs = ['Driver','3W','5W','3I','5I','7I','PW','SW','Putter']

const gameModeLabels = { freeForAll: 'Free for All', scramble: 'Scramble', '2v2Scramble': '2v2 Scramble' }

export function CustomRulesPanel({ pickupSettings, onUpdatePickupSettings }) {
  const [open, setOpen] = useState(true)
  const [gameMode, setGameMode] = useState(() => {
    try { return localStorage.getItem('golf-game-mode') || 'freeForAll' } catch(e) { return 'freeForAll' }
  })

  function handleSetMode(m) {
    setGameMode(m)
    try { localStorage.setItem('golf-game-mode', m) } catch(e) {}
  }

  const pickupLabel = pickupSettings.mode === 'addToPar'
    ? `Par + ${pickupSettings.addToPar}`
    : `Score + ${pickupSettings.addToScore}`

  return (
    <div className="custom-rules-panel">
      <button
        className={`custom-rules-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="custom-rules-icon">⚙️</span>
        <span className="custom-rules-title">Custom Rules</span>
        <span className="custom-rules-summary">{gameModeLabels[gameMode]} · Pickup: {pickupLabel}</span>
        <span className="custom-rules-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="custom-rules-body">
          <div className="custom-rule-row">
            <div className="custom-rule-label">
              <span className="rule-icon">🏌️</span>
              <div>
                <div className="rule-name">Game Mode</div>
                <div className="rule-desc">Format of play for this round</div>
              </div>
            </div>
            <div className="custom-rule-controls">
              <div className="pickup-mode-tabs">
                {Object.entries(gameModeLabels).map(([key, label]) => (
                  <button
                    key={key}
                    className={`pickup-mode-tab ${gameMode === key ? 'active' : ''}`}
                    onClick={() => handleSetMode(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="custom-rule-divider" />
          <div className="custom-rule-row">
            <div className="custom-rule-label">
              <span className="rule-icon">🚫</span>
              <div>
                <div className="rule-name">Pickup Rule</div>
                <div className="rule-desc">How your score is calculated when you pick up</div>
              </div>
            </div>
            <div className="custom-rule-controls">
              <div className="pickup-mode-tabs">
                <button
                  className={`pickup-mode-tab ${pickupSettings.mode === 'addToPar' ? 'active' : ''}`}
                  onClick={() => onUpdatePickupSettings({ mode: 'addToPar' })}
                >
                  + to Par
                </button>
                <button
                  className={`pickup-mode-tab ${pickupSettings.mode === 'addToScore' ? 'active' : ''}`}
                  onClick={() => onUpdatePickupSettings({ mode: 'addToScore' })}
                >
                  + to Score
                </button>
              </div>
              {pickupSettings.mode === 'addToPar' && (
                <div className="rule-options">
                  <span className="rule-options-label">Par +</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      className={`option-pill ${pickupSettings.addToPar === n ? 'active' : ''}`}
                      onClick={() => onUpdatePickupSettings({ addToPar: n })}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
              {pickupSettings.mode === 'addToScore' && (
                <div className="rule-options">
                  <span className="rule-options-label">Score +</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      className={`option-pill ${pickupSettings.addToScore === n ? 'active' : ''}`}
                      onClick={() => onUpdatePickupSettings({ addToScore: n })}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="custom-rule-divider" />

          <div className="custom-rule-row custom-rule-placeholder">
            <div className="custom-rule-label">
              <span className="rule-icon">💧</span>
              <div>
                <div className="rule-name">Drop Rule</div>
                <div className="rule-desc">Penalty strokes for a drop — coming soon</div>
              </div>
            </div>
            <div className="custom-rule-coming-soon">Coming Soon</div>
          </div>

          <div className="custom-rule-divider" />

          <div className="custom-rule-row custom-rule-placeholder">
            <div className="custom-rule-label">
              <span className="rule-icon">🤝</span>
              <div>
                <div className="rule-name">Gimme Rule</div>
                <div className="rule-desc">Max distance for automatic putts — coming soon</div>
              </div>
            </div>
            <div className="custom-rule-coming-soon">Coming Soon</div>
          </div>

        </div>
      )}
    </div>
  )
}

export default function Scorecard({ holes=18, pickupSettings, onUpdatePickupSettings }){
  const key = `golf-score-${holes}`
  const clubsKey = 'golf-clubs'
  const [rows, setRows] = useState(() => {
    try{
      const raw = localStorage.getItem(key)
      if(raw){
        const parsed = JSON.parse(raw)
        if(Array.isArray(parsed)){
          // normalize entries: convert old {strokes: N} -> swings array, ensure par and completed present
          const normalized = parsed.map(p => {
            const par = (p && typeof p.par === 'number') ? p.par : 4
            const completed = (p && typeof p.completed === 'boolean') ? p.completed : false
            if(p && Array.isArray(p.swings)) return {par, swings: p.swings, completed}
            if(p && typeof p.strokes === 'number') return {par, swings: Array.from({length: p.strokes}, ()=> defaultSwing()), completed}
            return {par, swings: [], completed}
          })
          return normalized
        }
      }
    }catch(e){}
    return makeInitial(holes)
  })

  const [activeHoleIdx, setActiveHoleIdx] = useState(null)
  const rowRefs = React.useRef({})
  const mobileRefs = React.useRef({})
  const [clubs, setClubs] = useState(()=>{
    try{
      const raw = localStorage.getItem(clubsKey)
      if(raw) return JSON.parse(raw)
    }catch(e){}
    return defaultClubs
  })

  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [showFront9, setShowFront9] = useState(true)
  const [showBack9, setShowBack9] = useState(true)

  // pickupSettings + onUpdatePickupSettings are passed in from Main.jsx

  // State for celebration modal
  const [celebrationModal, setCelebrationModal] = useState({
    isOpen: false,
    holeNumber: 0,
    strokes: 0,
    par: 0,
    result: null
  })

  // State for game history modal
  const [showGameHistory, setShowGameHistory] = useState(false)

  // keep bulkText in sync when opening the bulk editor
  useEffect(()=>{
    if(!bulkOpen) return
    // derive a simple comma-separated list of pars
    const vals = rows.map(r => Number(r.par || 4))
    setBulkText(vals.join(', '))
  },[bulkOpen, rows])

  useEffect(()=>{
    try{ localStorage.setItem(clubsKey, JSON.stringify(clubs)) }catch(e){}
  },[clubs])

  useEffect(()=>{
    try{ localStorage.setItem(pickupKey, JSON.stringify(pickupSettings)) }catch(e){}
  },[pickupSettings])

  // adjust rows length when holes changes but preserve existing data where possible
  useEffect(()=>{
    setRows(prev => {
      if(prev.length === holes) return prev
      const next = Array.from({length: holes}, (_,i) => prev[i] ? prev[i] : {par:4, swings: []})
      return next
    })
  },[holes])

  // persist
  useEffect(()=>{
    try{ 
      localStorage.setItem(key, JSON.stringify(rows))
      // notify other components (heatmap) that data changed
      try{ window.dispatchEvent(new CustomEvent('golf:updated', { detail: { key } })) }catch(e){}
    }catch(e){}
  },[rows,key])

  // Listen for hole selection events from the heatmap and open/scroll to that hole
  useEffect(()=>{
    function onSelect(e){
      try{
        const hole = (e && e.detail && typeof e.detail.hole === 'number') ? e.detail.hole : null
        if(hole == null) return
        setActiveHoleIdx(hole)
        // scroll table row into view as a visual cue
        setTimeout(()=>{
          const tr = rowRefs.current[hole]
          if(tr && typeof tr.scrollIntoView === 'function'){
            tr.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 50)
      }catch(err){ }
    }
    window.addEventListener('golf:select-hole', onSelect)
    return () => window.removeEventListener('golf:select-hole', onSelect)
  }, [])

  function updatePar(idx, value){
    setRows(r => r.map((row,i) => i===idx ? {...row, par: value} : row))
    if(bulkOpen){
      setBulkText(prev => {
        const parts = prev.split(/[^0-9]+/).filter(Boolean)
        // ensure length
        const next = Array.from({length: holes}, (_,i) => i===idx ? String(value) : (parts[i]|| String((rows[i] && rows[i].par) || 4)))
        return next.join(', ')
      })
    }
  }

  // Bulk par update: accepts comma/space/newline separated numbers and applies them to holes
  function applyBulkPars(){
    try{
      const parts = (bulkText||'').split(/[^0-9]+/).filter(Boolean).map(s=> Number(s))
      if(parts.length === 0) return
      const next = Array.from({length: holes}, (_,i) => ({...rows[i], par: (typeof parts[i] === 'number' && !isNaN(parts[i])) ? parts[i] : (rows[i] ? rows[i].par : 4)}))
      setRows(next)
      setBulkOpen(false)
    }catch(e){ }
  }

  function resetBulk(){
    setBulkText(Array.from({length: holes}, ()=> 4).join(', '))
  }

  function addSwing(idx){
    setRows(r => r.map((row,i) => i===idx ? {...row, swings: [...(row.swings || []), defaultSwing()]} : row))
  }

  function addClub(name){
    const trimmed = (name||'').trim()
    if(!trimmed) return
    setClubs(c => c.includes(trimmed) ? c : [...c, trimmed])
  }

  function removeClub(name){
    // allow removing defaults as requested
    setClubs(c => c.filter(x=> x!==name))
    // don't auto-change swings that reference removed club
  }

  function removeLastSwing(idx){
    setRows(r => r.map((row,i)=>{
      if(i!==idx) return row
      const swings = (row.swings || []).slice(0, -1)
      return {...row, swings}
    }))
  }

  function updateSwing(idx, sidx, field, value){
    setRows(r => r.map((row,i)=>{
      if(i!==idx) return row
      const swings = (row.swings || []).map((s,j)=> j===sidx ? {...s, [field]: value} : s)
      return {...row, swings}
    }))
  }

  function removeSwing(idx, sidx){
    setRows(r => r.map((row,i)=>{
      if(i!==idx) return row
      const swings = (row.swings || []).filter((_,j)=> j!==sidx)
      return {...row, swings}
    }))
  }

  function completeHole(idx) {
    const row = rows[idx]
    if (!row || row.swings.length === 0) return
    
    const strokes = row.swings.length
    const result = getResultLabel(strokes, row.par)
    
    // Mark hole as completed
    setRows(r => r.map((holeRow, i) => i === idx ? {...holeRow, completed: true} : holeRow))
    
    // Show simple celebration modal
    setCelebrationModal({
      isOpen: true,
      holeNumber: idx + 1,
      strokes: strokes,
      par: row.par,
      result: result
    })
  }

  function closeCelebrationModal() {
    console.log('Closing modal') // Debug log
    setCelebrationModal({
      isOpen: false,
      holeNumber: 0,
      strokes: 0,
      par: 0,
      result: null
    })
  }

  function loadGameData(gameData) {
    // Load the historic game data into current state
    setRows(gameData)
    // Close any open modals
    setOpen({})
    setShowGameHistory(false)
  }

  function reset(){
    setRows(makeInitial(holes))
  }

  function pickupHole(idx) {
    const row = rows[idx]
    if (!row) return
    const currentStrokes = row.swings.length
    let finalStrokes
    if (pickupSettings.mode === 'addToPar') {
      finalStrokes = row.par + pickupSettings.addToPar
    } else {
      // addToScore: add directly to current swing count
      finalStrokes = currentStrokes + pickupSettings.addToScore
    }
    // Pad swings to finalStrokes count, marking extras as pickup swings
    const existingSwings = row.swings || []
    const padded = [...existingSwings]
    while (padded.length < finalStrokes) {
      padded.push({ ...defaultSwing(), notes: 'Pickup', isPickup: true })
    }
    setRows(r => r.map((holeRow, i) =>
      i === idx ? { ...holeRow, swings: padded, completed: true, pickedUp: true } : holeRow
    ))
    const result = getResultLabel(finalStrokes, row.par)
    setCelebrationModal({ isOpen: true, holeNumber: idx + 1, strokes: finalStrokes, par: row.par, result })
  }

  function updatePickupSettings(patch) {
    onUpdatePickupSettings && onUpdatePickupSettings(patch)
  }

  function getResultLabel(strokes, par){
    const diff = strokes - par
    if(diff <= -3) return {label: 'Albatross', cls: 'albatross'}
    if(diff === -2) return {label: 'Eagle', cls: 'eagle'}
    if(diff === -1) return {label: 'Birdie', cls: 'birdie'}
    if(diff === 0) return {label: 'Par', cls: 'par'}
    if(diff === 1) return {label: 'Bogey', cls: 'bogey'}
    if(diff === 2) return {label: 'Double Bogey', cls: 'double'}
    if(diff === 3) return {label: 'Triple Bogey', cls: 'triple'}
    return {label: diff > 0 ? `+${diff}` : `${diff}`, cls: diff>0 ? 'other-pos' : 'other-neg'}
  }

  // Filter rows based on nine visibility
  const visibleRows = rows.map((row, idx) => ({row, idx})).filter(({row, idx}) => {
    if(holes !== 18) return true // Show all for 9-hole rounds
    const isFront9 = idx < 9
    const isBack9 = idx >= 9
    return (isFront9 && showFront9) || (isBack9 && showBack9)
  })

  const totalStrokes = visibleRows.reduce((s,{row}) => s + (row.swings ? row.swings.length : 0),0)
  const totalPar = visibleRows.reduce((s,{row}) => s + Number(row.par||0),0)

  return (
    <div className="scorecard">
      <ScoreboardSummary
        rows={rows}
        onHoleClick={setActiveHoleIdx}
      />

      <div className="bulk-par-editor" style={{marginBottom:12}}>
        <button className="small" onClick={()=> setBulkOpen(b=>!b)}>{bulkOpen ? 'Hide' : 'Bulk Edit Pars'}</button>
        {bulkOpen && (
          <div style={{marginTop:8,display:'flex',gap:8,alignItems:'flex-start'}}>
            <textarea value={bulkText} onChange={e=> setBulkText(e.target.value)} placeholder={`Enter ${holes} par values separated by commas or newlines`} style={{flex:1,minHeight:80,padding:8,borderRadius:6,border:'1px solid #ddd'}} />
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button onClick={applyBulkPars}>Apply</button>
              <button className="small mute" onClick={resetBulk}>Reset</button>
            </div>
          </div>
        )}
      </div>
      
      {holes === 18 && (
        <div className="nine-toggles" style={{marginBottom:12,display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:14,fontWeight:500}}>Show:</span>
          <button 
            className={`small ${showFront9 ? '' : 'mute'} ${!showFront9 ? 'nine-toggle-hidden' : ''}`}
            onClick={() => setShowFront9(!showFront9)}
          >
            Front 9
          </button>
          <button 
            className={`small ${showBack9 ? '' : 'mute'} ${!showBack9 ? 'nine-toggle-hidden' : ''}`}
            onClick={() => setShowBack9(!showBack9)}
          >
            Back 9
          </button>
        </div>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Hole</th>
            <th>Par</th>
            <th>Strokes</th>
            <th>Score</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(({row, idx}) => {
            const strokes = (row.swings || []).length
            const result = strokes > 0 ? getResultLabel(strokes, row.par) : null
            return (
              <tr key={idx} ref={el => rowRefs.current[idx] = el} className={strokes>row.par? 'over' : ''}>
                <td>{idx+1}</td>
                <td>
                  <input type="number" min="3" max="6" value={row.par} onChange={e=> updatePar(idx, Number(e.target.value))} />
                </td>
                <td>{strokes}</td>
                <td>{strokes > 0 ? strokes - row.par : 'â€“'}</td>
                <td>
                  {result ? <span className={`result ${result.cls}`}>{result.label}</span> : null}
                  {row.pickedUp && <span className="pickup-indicator" title="Picked up">🚫</span>}
                  {row.completed && !row.pickedUp && <span className="completed-indicator" title="Hole completed"> ✅</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{totalPar}</td>
            <td>{totalStrokes}</td>
            <td>{totalStrokes - totalPar}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Mobile-friendly card list (shown only on small screens via CSS) */}
      <div className="mobile-list">
        {visibleRows.map(({row, idx}) => {
          const strokes = (row.swings || []).length
          const result = strokes > 0 ? getResultLabel(strokes, row.par) : null
          return (
            <div className="mobile-hole" key={`m-${idx}`} ref={el => mobileRefs.current[idx] = el}>
              <div className="mobile-head">
                <div className="mobile-left">
                  <div className="hole-num">Hole {idx+1}</div>
                  <div className="hole-par">Par
                    <input type="number" min="3" max="6" value={row.par} onChange={e=> updatePar(idx, Number(e.target.value))} />
                  </div>
                </div>
                <div className="mobile-right">
                  <div className="hole-strokes">Strokes <div className="strokes-num">{strokes}</div></div>
                  <div className="hole-outcome">
                    {result ? <span className={`result ${result.cls}`}>{result.label}</span> : null}
                    {row.pickedUp && <span className="pickup-indicator" title="Picked up">🚫</span>}
                    {row.completed && !row.pickedUp && <span className="completed-indicator" title="Hole completed"> ✅</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hole detail modal â€” opened by clicking a hole in the scoreboard summary */}
      <HoleDetailModal
        isOpen={activeHoleIdx !== null}
        onClose={() => setActiveHoleIdx(null)}
        holeIdx={activeHoleIdx ?? 0}
        row={activeHoleIdx !== null ? rows[activeHoleIdx] : null}
        clubs={clubs}
        onAddSwing={addSwing}
        onRemoveSwing={removeSwing}
        onUpdateSwing={updateSwing}
        onRemoveLastSwing={removeLastSwing}
        onUpdatePar={updatePar}
        onCompleteHole={completeHole}
        onPickupHole={pickupHole}
        onAddClub={addClub}
        onRemoveClub={removeClub}
      />

      <div className="actions">
        <button onClick={reset}>Reset</button>
        <button onClick={() => setShowGameHistory(true)}>ðŸ“š Game History</button>
        <button onClick={()=> navigator.clipboard?.writeText(JSON.stringify(rows))}>Copy JSON</button>
      </div>

      <CelebratoryModal
        key={`modal-${celebrationModal.holeNumber}-${celebrationModal.isOpen}`}
        isOpen={celebrationModal.isOpen}
        onClose={closeCelebrationModal}
        holeNumber={celebrationModal.holeNumber}
        strokes={celebrationModal.strokes}
        par={celebrationModal.par}
        result={celebrationModal.result}
      />

      <GameHistoryModal
        isOpen={showGameHistory}
        onClose={() => setShowGameHistory(false)}
        currentGameData={rows}
        onLoadGame={loadGameData}
      />
    </div>
  )
}
