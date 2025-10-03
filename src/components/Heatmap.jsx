import React, { useEffect, useState } from 'react'

function feelToClass(avg){
  if(avg == null) return 'no-data'
  if(avg <= 1.5) return 'feel-1'
  if(avg <= 2.5) return 'feel-2'
  if(avg <= 3.5) return 'feel-3'
  if(avg <= 4.5) return 'feel-4'
  return 'feel-5'
}


export default function Heatmap({holes=18, view='all'}){
  const [rows, setRows] = useState([])

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(`golf-score-${holes}`)
      if(raw){
        const parsed = JSON.parse(raw)
        // ensure length
        const normalized = Array.from({length: holes}, (_,i) => parsed[i] ? parsed[i] : {par:4, swings: []})
        setRows(normalized)
        return
      }
    }catch(e){ }
    setRows(Array.from({length: holes}, ()=> ({par:4, swings: []})))
  },[holes])

  useEffect(()=>{
    function onUpdated(e){
      try{
        const raw = localStorage.getItem(`golf-score-${holes}`)
        if(raw){
          const parsed = JSON.parse(raw)
          const normalized = Array.from({length: holes}, (_,i) => parsed[i] ? parsed[i] : {par:4, swings: []})
          setRows(normalized)
        }
      }catch(err){}
    }
    window.addEventListener('golf:updated', onUpdated)
    return ()=> window.removeEventListener('golf:updated', onUpdated)
  },[holes])

  // determine which holes to show based on view
  let start = 0, count = holes
  if(holes === 18){
    if(view === 'front'){ start = 0; count = 9 }
    else if(view === 'back'){ start = 9; count = 9 }
    else { start = 0; count = 18 }
  } else {
    // for 9-hole mode, treat front/all the same
    start = 0; count = holes
  }

  const indices = Array.from({length: count}, (_,k) => start + k)

  // count total swings in the current view
  const totalSwings = indices.reduce((acc, i) => {
    const r = rows[i]
    const swings = (r && Array.isArray(r.swings)) ? r.swings : []
    return acc + (swings.length || 0)
  }, 0)

  // if there are no swings in view, show an empty heatmap card (blank)
  if(totalSwings === 0){
    return (
      <div className="heatmap">
        <div className="heatmap-empty" aria-hidden />
      </div>
    )
  }

  return (
    <div className="heatmap">
      <div className={`heatmap-grid`}>
        {indices.map((i)=>{
          
          const r = rows[i]
          const swings = (r && Array.isArray(r.swings)) ? r.swings : []
          const shown = Array.isArray(swings) ? swings.slice(0,12) : []
          const avg = shown.length ? shown.reduce((s,x)=> s + (Number(x.satisfaction||3)),0)/shown.length : (swings.length ? swings.reduce((s,x)=> s + (Number(x.satisfaction||3)),0)/swings.length : null)
          const cls = feelToClass(avg)
          return (
            <div key={i} className={`heatcell ${cls}`} title={avg? `Avg feel ${avg.toFixed(2)}` : 'No swings'}>
              <div className="cell-inner">
                <div className="hole-number">{i+1}</div>
                {
                  // Only render the swing dots if there are actual swings
                  shown.length > 0 && (
                    <div className="cell-swings" aria-hidden>
                      {shown.map((s,slot)=>{
                        const sc = feelToClass(Number(s.satisfaction||3))
                        return <div key={slot} className={`swing-dot ${sc}`} title={`${s.club || ''} • ${s.terrain || ''} • feel ${s.satisfaction || 3}`}></div>
                      })}
                    </div>
                  )
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
