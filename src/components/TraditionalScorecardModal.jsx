import React, { useState } from 'react'
import { useSession } from '../contexts/SessionContext'

export default function TraditionalScorecardModal({ isOpen, onClose, holes }) {
  const { session } = useSession()
  const players = (session && session.players) || []
  const storageKey = `golf-trad-${holes}`

  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {} } catch(e) { return {} }
  })

  function handleScore(playerId, holeIdx, val) {
    const num = val === '' ? '' : parseInt(val, 10)
    setScores(prev => {
      const playerScores = [...(prev[playerId] || Array(holes).fill(''))]
      playerScores[holeIdx] = (val === '' || isNaN(num)) ? '' : num
      const next = { ...prev, [playerId]: playerScores }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch(e) {}
      return next
    })
  }

  function getTotal(playerId) {
    const arr = scores[playerId] || []
    return arr.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
  }

  function handleClear() {
    setScores({})
    try { localStorage.removeItem(storageKey) } catch(e) {}
  }

  if (!isOpen) return null

  const holeNumbers = Array.from({ length: holes }, (_, i) => i + 1)

  return (
    <div className="simple-modal-backdrop" onClick={onClose}>
      <div className="trad-scorecard-modal" onClick={e => e.stopPropagation()}>
        <div className="trad-scorecard-header">
          <span className="trad-scorecard-title">📋 Scorecard</span>
          <button className="hole-detail-close trad-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {players.length === 0 ? (
          <div className="trad-no-players">
            Add players in the Players section to track scores here.
          </div>
        ) : (
          <div className="trad-scorecard-body">
            <div className="trad-scorecard-table-wrap">
              <table className="trad-scorecard-table">
                <thead>
                  <tr>
                    <th className="trad-hole-col">Hole</th>
                    {players.map(p => (
                      <th key={p.id} className="trad-player-col">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holeNumbers.map((h, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'trad-row-even' : ''}>
                      <td className="trad-hole-num">{h}</td>
                      {players.map(p => (
                        <td key={p.id} className="trad-score-cell">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            className="trad-score-input"
                            value={
                              scores[p.id] && scores[p.id][i] !== undefined && scores[p.id][i] !== ''
                                ? scores[p.id][i]
                                : ''
                            }
                            onChange={e => handleScore(p.id, i, e.target.value)}
                            placeholder="—"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="trad-total-row">
                    <td className="trad-hole-num trad-total-label">Total</td>
                    {players.map(p => (
                      <td key={p.id} className="trad-total-val">
                        {getTotal(p.id) || '—'}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            <button className="trad-clear-btn" onClick={handleClear}>Clear All Scores</button>
          </div>
        )}
      </div>
    </div>
  )
}
