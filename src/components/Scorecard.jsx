import React, { useEffect, useState } from 'react'

function makeInitial(h){
  return Array.from({length: h}, () => ({par: 4, swings: []}))
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
          // normalize entries: convert old {strokes: N} -> swings array, ensure par present
          const normalized = parsed.map(p => {
            const par = (p && typeof p.par === 'number') ? p.par : 4
            if(p && Array.isArray(p.swings)) return {par, swings: p.swings}
            if(p && typeof p.strokes === 'number') return {par, swings: Array.from({length: p.strokes}, ()=> defaultSwing())}
            return {par, swings: []}
          })
          return normalized
        }
      }
    }catch(e){}
    return makeInitial(holes)
  })

  const [open, setOpen] = useState(() => ({}))
  const [clubs, setClubs] = useState(()=>{
    try{
      const raw = localStorage.getItem(clubsKey)
      if(raw) return JSON.parse(raw)
    }catch(e){}
    return defaultClubs
  })

  const [clubsOpen, setClubsOpen] = useState(false)
  const clubInputRefs = React.useRef({})

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

  function updatePar(idx, value){
    setRows(r => r.map((row,i) => i===idx ? {...row, par: value} : row))
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

  function reset(){
    setRows(makeInitial(holes))
  }

  const totalStrokes = rows.reduce((s,row) => s + (row.swings ? row.swings.length : 0),0)
  const totalPar = rows.reduce((s,row) => s + Number(row.par||0),0)

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

  return (
    <div className="scorecard">
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
          {rows.map((row, idx) => {
            const strokes = (row.swings || []).length
            const result = strokes > 0 ? getResultLabel(strokes, row.par) : null
            return (
              <React.Fragment key={idx}>
                <tr className={strokes>row.par? 'over' : ''}>
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
                                <label>Club
                                  <select value={s.club} onChange={e=> updateSwing(idx,sidx,'club',e.target.value)}>
                                    {clubs.map((cname,ci)=> <option key={ci} value={cname}>{cname}</option>)}
                                  </select>
                                </label>
                                <label>Terrain
                                  <select value={s.terrain} onChange={e=> updateSwing(idx,sidx,'terrain',e.target.value)}>
                                    <option>Fairway</option>
                                    <option>Rough</option>
                                    <option>Bunker</option>
                                    <option>Green</option>
                                    <option>Fringe</option>
                                    <option>Hazard</option>
                                  </select>
                                </label>
                                <label>Feel
                                  <select value={s.satisfaction} onChange={e=> updateSwing(idx,sidx,'satisfaction',Number(e.target.value))}>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                  </select>
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
        {rows.map((row, idx) => {
          const strokes = (row.swings || []).length
          const result = strokes > 0 ? getResultLabel(strokes, row.par) : null
          return (
            <div className="mobile-hole" key={`m-${idx}`}>
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
              </div>

              {open[idx] && (
                <div className={`collapse open`}>
                  <div className="swings">
                    {(row.swings || []).length>0 ? (
              (row.swings || []).map((s,sidx) => (
            <div className={`swing feel-${s.satisfaction}`} key={`ms-${sidx}`}>
                          <div className="swing-index">#{sidx+1}</div>
                          <label>Club
                            <select value={s.club} onChange={e=> updateSwing(idx,sidx,'club',e.target.value)}>
                              {clubs.map((cname,ci)=> <option key={ci} value={cname}>{cname}</option>)}
                            </select>
                          </label>
                          <label>Terrain
                            <select value={s.terrain} onChange={e=> updateSwing(idx,sidx,'terrain',e.target.value)}>
                              <option>Fairway</option>
                              <option>Rough</option>
                              <option>Bunker</option>
                              <option>Green</option>
                              <option>Fringe</option>
                              <option>Hazard</option>
                            </select>
                          </label>
                          <label>Feel
                            <select value={s.satisfaction} onChange={e=> updateSwing(idx,sidx,'satisfaction',Number(e.target.value))}>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                              <option value={5}>5</option>
                            </select>
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
      <div className="actions">
        <button onClick={reset}>Reset</button>
        <button onClick={()=> navigator.clipboard?.writeText(JSON.stringify(rows))}>Copy JSON</button>
      </div>
    </div>
  )
}
