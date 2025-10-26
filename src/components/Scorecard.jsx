import React, { useEffect, useState } from 'react'
import CelebratoryModal from './CelebratoryModal'
import ScoreboardSummary from './ScoreboardSummary'

function makeInitial(h){
  return Array.from({length: h}, () => ({par: 4, swings: [], completed: false}))
}

const defaultSwing = () => ({ club: '7I', terrain: 'Fairway', satisfaction: 3, notes: '' })

const defaultClubs = ['Driver','3W','5W','3I','5I','7I','PW','SW','Putter']

export default function Scorecard({holes=18}){
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

  const [open, setOpen] = useState(() => ({}))
  const rowRefs = React.useRef({})
  const mobileRefs = React.useRef({})
  const [clubs, setClubs] = useState(()=>{
    try{
      const raw = localStorage.getItem(clubsKey)
      if(raw) return JSON.parse(raw)
    }catch(e){}
    return defaultClubs
  })

  const [clubsOpen, setClubsOpen] = useState(false)
  const clubInputRefs = React.useRef({})
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [showFront9, setShowFront9] = useState(true)
  const [showBack9, setShowBack9] = useState(true)

  // State for celebration modal
  const [celebrationModal, setCelebrationModal] = useState({
    isOpen: false,
    holeNumber: 0,
    strokes: 0,
    par: 0,
    result: null
  })

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
        // open the hole in the UI
        setOpen(o => ({...o, [hole]: true}))
        // scroll into view for desktop table row if available, otherwise mobile card
        setTimeout(()=>{
          const tr = rowRefs.current[hole]
          if(tr && typeof tr.scrollIntoView === 'function'){
            tr.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
          }
          const mc = mobileRefs.current[hole]
          if(mc && typeof mc.scrollIntoView === 'function'){
            mc.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    setOpen(o => ({...o, [idx]: true}))
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

  function reset(){
    setRows(makeInitial(holes))
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(({row, idx}) => {
            const strokes = (row.swings || []).length
            const result = strokes > 0 ? getResultLabel(strokes, row.par) : null
            return (
              <React.Fragment key={idx}>
                <tr ref={el => rowRefs.current[idx] = el} className={strokes>row.par? 'over' : ''}>
                  <td>{idx+1}</td>
                  <td>
                    <input type="number" min="3" max="6" value={row.par} onChange={e=> updatePar(idx, Number(e.target.value))} />
                  </td>
                  <td>{strokes}</td>
                  <td>{strokes - row.par}</td>
                  <td>{result ? <span className={`result ${result.cls}`}>{result.label}</span> : null}</td>
                  <td>
                    <button className="small" onClick={()=> setOpen(o=> ({...o, [idx]: !o[idx]}))}>{open[idx] ? 'Hide' : 'Swings'}</button>
                    <button className="small mute" onClick={()=> addSwing(idx)}>+ Swing</button>
                    <button className="small danger" onClick={()=> removeLastSwing(idx)} disabled={strokes===0} title="Remove last swing">−</button>
                    {open[idx] && strokes > 0 && !row.completed && (
                      <button 
                        className="done-button" 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          completeHole(idx)
                        }} 
                        title="Complete hole"
                      >
                        Done ⛳
                      </button>
                    )}
                    {row.completed && (
                      <span className="completed-indicator" title="Hole completed">
                        ✅ Complete
                      </span>
                    )}
                  </td>
                </tr>

                {open[idx] && (
                  <tr className="swings-row">
                    <td colSpan={6}>
                      <div className={`collapse ${open[idx] ? 'open' : ''}`} aria-expanded={!!open[idx]}>
                        <div className="swings">
                          {row.swings && row.swings.length>0 ? (
                            row.swings.map((s, sidx) => (
                              <div className={`swing feel-${s.satisfaction}`} key={sidx}>
                                <div className="swing-index">#{sidx+1}</div>
                                <label>
                                  <span className="label-icon">🏌️</span>
                                  <span className="label-text">Club</span>
                                  <select value={s.club} onChange={e=> updateSwing(idx,sidx,'club',e.target.value)}>
                                    {clubs.map((cname,ci)=> <option key={ci} value={cname}>{cname}</option>)}
                                  </select>
                                </label>
                                <label>
                                  <span className="label-icon">🌿</span>
                                  <span className="label-text">Terrain</span>
                                  <div className="button-group">
                                    {['Fairway', 'Rough', 'Bunker', 'Green', 'Fringe', 'Hazard'].map(terrain => (
                                      <button
                                        key={terrain}
                                        type="button"
                                        className={`button-group-item ${s.terrain === terrain ? 'active' : ''}`}
                                        onClick={() => updateSwing(idx, sidx, 'terrain', terrain)}
                                      >
                                        {terrain}
                                      </button>
                                    ))}
                                  </div>
                                </label>
                                <label>
                                  <span className="label-icon">⭐</span>
                                  <span className="label-text">Feel</span>
                                  <div className="button-group">
                                    {[1, 2, 3, 4, 5].map(feel => (
                                      <button
                                        key={feel}
                                        type="button"
                                        className={`button-group-item ${s.satisfaction === feel ? 'active' : ''}`}
                                        onClick={() => updateSwing(idx, sidx, 'satisfaction', feel)}
                                      >
                                        {feel}
                                      </button>
                                    ))}
                                  </div>
                                </label>
                                <label className="notes">Notes
                                  <input value={s.notes||''} onChange={e=> updateSwing(idx,sidx,'notes',e.target.value)} placeholder="short note" />
                                </label>
                                <button className="small danger" onClick={()=> removeSwing(idx,sidx)}>Remove</button>
                              </div>
                            ))
                          ) : (
                            <div className="empty">No swings yet — add one.</div>
                          )}

                          <div className="swings-actions">
                            <button onClick={()=> addSwing(idx)}>Add Swing</button>
                            <button className="small" onClick={()=> setOpen(o=> ({...o, [idx]: false}))}>Done</button>
                            <button className="small mute" onClick={()=> setClubsOpen(s=>!s)}>{clubsOpen ? 'Hide Clubs' : 'Manage Clubs'}</button>
                          </div>

                          {clubsOpen && (
                            <div className="club-manager">
                              <div className="club-add">
                                <input placeholder="Custom club name" ref={el => clubInputRefs.current[idx] = el} />
                                <button type="button" onClick={() => {
                                  const el = clubInputRefs.current[idx]
                                  if(el) { addClub(el.value); el.value = '' }
                                }}>Add</button>
                              </div>
                              <div className="club-list">
                                {clubs.map((cname, ci) => (
                                  <div className="club-item" key={ci}>
                                    <div className="club-name">{cname}{defaultClubs.includes(cname) ? ' (default)' : ''}</div>
                                    <button type="button" className="small danger inline" onClick={()=> removeClub(cname)}>Remove</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
                  <div className="hole-outcome">{result ? <span className={`result ${result.cls}`}>{result.label}</span> : null}</div>
                </div>
              </div>
              <div className="mobile-actions">
                <button className="small" onClick={()=> setOpen(o=> ({...o, [idx]: !o[idx]}))}>{open[idx] ? 'Hide' : 'Swings'}</button>
                <button className="small mute" onClick={()=> addSwing(idx)}>+ Swing</button>
                <button className="small danger" onClick={()=> removeLastSwing(idx)} disabled={strokes===0}>−</button>
                {open[idx] && strokes > 0 && !row.completed && (
                  <button 
                    className="done-button" 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      completeHole(idx)
                    }} 
                    title="Complete hole"
                  >
                    Done ⛳
                  </button>
                )}
                {row.completed && (
                  <span className="completed-indicator" title="Hole completed">
                    ✅ Complete
                  </span>
                )}
              </div>

              {open[idx] && (
                <div className={`collapse open`}>
                  <div className="swings">
                    {(row.swings || []).length>0 ? (
              (row.swings || []).map((s,sidx) => (
              <div className={`swing feel-${s.satisfaction}`} key={`ms-${sidx}`}>
                          <div className="swing-index">#{sidx+1}</div>
                          <label>
                            <span className="label-icon">🏌️</span>
                            <span className="label-text">Club</span>
                            <select value={s.club} onChange={e=> updateSwing(idx,sidx,'club',e.target.value)}>
                              {clubs.map((cname,ci)=> <option key={ci} value={cname}>{cname}</option>)}
                            </select>
                          </label>
                          <label>
                            <span className="label-icon">🌿</span>
                            <span className="label-text">Terrain</span>
                            <div className="button-group">
                              {['Fairway', 'Rough', 'Bunker', 'Green', 'Fringe', 'Hazard'].map(terrain => (
                                <button
                                  key={terrain}
                                  type="button"
                                  className={`button-group-item ${s.terrain === terrain ? 'active' : ''}`}
                                  onClick={() => updateSwing(idx, sidx, 'terrain', terrain)}
                                >
                                  {terrain}
                                </button>
                              ))}
                            </div>
                          </label>
                          <label>
                            <span className="label-icon">⭐</span>
                            <span className="label-text">Feel</span>
                            <div className="button-group">
                              {[1, 2, 3, 4, 5].map(feel => (
                                <button
                                  key={feel}
                                  type="button"
                                  className={`button-group-item ${s.satisfaction === feel ? 'active' : ''}`}
                                  onClick={() => updateSwing(idx, sidx, 'satisfaction', feel)}
                                >
                                  {feel}
                                </button>
                              ))}
                            </div>
                        </label>
                          <label className="notes">Notes
                            <input value={s.notes||''} onChange={e=> updateSwing(idx,sidx,'notes',e.target.value)} placeholder="short note" />
                          </label>

                          <button className="small danger" onClick={()=> removeSwing(idx,sidx)}>Remove</button>
                        </div>
                      ))
                    ) : (
                      <div className="empty">No swings yet — add one.</div>
                    )}
                    <div className="swings-actions">
                      <button onClick={()=> addSwing(idx)}>Add Swing</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <ScoreboardSummary rows={rows} />
      
      <div className="actions">
        <button onClick={reset}>Reset</button>
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
    </div>
  )
}
