import React, { useState, useRef } from 'react'

const defaultClubs = ['Driver','3W','5W','3I','5I','7I','PW','SW','Putter']

function getResultLabel(strokes, par) {
  const diff = strokes - par
  if (diff <= -3) return { label: 'Albatross', cls: 'albatross' }
  if (diff === -2) return { label: 'Eagle', cls: 'eagle' }
  if (diff === -1) return { label: 'Birdie', cls: 'birdie' }
  if (diff === 0) return { label: 'Par', cls: 'par' }
  if (diff === 1) return { label: 'Bogey', cls: 'bogey' }
  if (diff === 2) return { label: 'Double Bogey', cls: 'double' }
  if (diff === 3) return { label: 'Triple Bogey', cls: 'triple' }
  return { label: diff > 0 ? `+${diff}` : `${diff}`, cls: diff > 0 ? 'other-pos' : 'other-neg' }
}

export default function HoleDetailModal({
  isOpen, onClose,
  holeIdx, row, clubs,
  onAddSwing, onRemoveSwing, onUpdateSwing, onRemoveLastSwing,
  onUpdatePar, onCompleteHole,
  onAddClub, onRemoveClub
}) {
  const [clubsOpen, setClubsOpen] = useState(false)
  const clubInputRef = useRef(null)

  if (!isOpen || !row) return null

  const strokes = row.swings.length
  const result = strokes > 0 ? getResultLabel(strokes, row.par) : null

  function handleComplete() {
    onCompleteHole(holeIdx)
    onClose()
  }

  return (
    <div className="simple-modal-backdrop" onClick={onClose}>
      <div className="hole-detail-modal" onClick={e => e.stopPropagation()}>

        <div className="hole-detail-header">
          <div className="hole-detail-title">
            <span className="hole-detail-number">Hole {holeIdx + 1}</span>
            <label className="hole-detail-par-label">
              Par
              <input
                type="number" min="3" max="6"
                value={row.par}
                onChange={e => onUpdatePar(holeIdx, Number(e.target.value))}
              />
            </label>
          </div>
          <div className="hole-detail-score-display">
            <span className="hole-detail-strokes">{strokes}</span>
            <span className="hole-detail-strokes-label">strokes</span>
            {result && <span className={`result ${result.cls}`}>{result.label}</span>}
            {row.completed && <span className="completed-indicator" title="Hole completed">✅</span>}
          </div>
          <button className="hole-detail-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="hole-detail-body">
          {row.swings.length === 0 ? (
            <div className="empty">No swings yet — add one below.</div>
          ) : (
            row.swings.map((s, sidx) => (
              <div className={`swing feel-${s.satisfaction}`} key={sidx}>
                <div className="swing-index">#{sidx + 1}</div>
                <div className="swing-tracker-grid">
                  <label className="swing-tracker-column">
                    <span className="swing-tracker-header">
                      <span className="label-icon">🏌️</span>
                      <span className="label-text">Club</span>
                    </span>
                    <select value={s.club} onChange={e => onUpdateSwing(holeIdx, sidx, 'club', e.target.value)}>
                      {clubs.map((cname, ci) => <option key={ci} value={cname}>{cname}</option>)}
                    </select>
                  </label>
                  <label className="swing-tracker-column">
                    <span className="swing-tracker-header">
                      <span className="label-icon">🌿</span>
                      <span className="label-text">Terrain</span>
                    </span>
                    <div className="button-group">
                      {['Fairway', 'Rough', 'Bunker', 'Green', 'Fringe', 'Hazard'].map(terrain => (
                        <button
                          key={terrain}
                          type="button"
                          className={`button-group-item ${s.terrain === terrain ? 'active' : ''}`}
                          onClick={() => onUpdateSwing(holeIdx, sidx, 'terrain', terrain)}
                        >
                          {terrain}
                        </button>
                      ))}
                    </div>
                  </label>
                  <label className="swing-tracker-column">
                    <span className="swing-tracker-header">
                      <span className="label-icon">⭐</span>
                      <span className="label-text">Feel</span>
                    </span>
                    <div className="button-group">
                      {[1, 2, 3, 4, 5].map(feel => (
                        <button
                          key={feel}
                          type="button"
                          className={`button-group-item ${s.satisfaction === feel ? 'active' : ''}`}
                          onClick={() => onUpdateSwing(holeIdx, sidx, 'satisfaction', feel)}
                        >
                          {feel}
                        </button>
                      ))}
                    </div>
                  </label>
                  <label className="swing-tracker-notes">
                    <span className="swing-tracker-header">
                      <span className="label-icon">📝</span>
                      <span className="label-text">Notes</span>
                    </span>
                    <input
                      value={s.notes || ''}
                      onChange={e => onUpdateSwing(holeIdx, sidx, 'notes', e.target.value)}
                      placeholder="short note"
                    />
                  </label>
                  <label className="swing-tracker-distance">
                    <span className="swing-tracker-header">
                      <span className="label-icon">📏</span>
                      <span className="label-text">Distance</span>
                      <span className="distance-value">{s.distance || 150} yds</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="400"
                      value={s.distance || 150}
                      onChange={e => onUpdateSwing(holeIdx, sidx, 'distance', Number(e.target.value))}
                      className="distance-slider"
                    />
                  </label>
                </div>
                <button className="small danger" onClick={() => onRemoveSwing(holeIdx, sidx)}>Remove</button>
              </div>
            ))
          )}

          <div className="swings-actions">
            <button onClick={() => onAddSwing(holeIdx)}>Add Swing</button>
            {strokes > 0 && (
              <button className="small mute" onClick={() => onRemoveLastSwing(holeIdx)}>Remove Last</button>
            )}
            {strokes > 0 && !row.completed && (
              <button className="done-button" onClick={handleComplete}>Done ⛳</button>
            )}
            <button className="small mute" onClick={() => setClubsOpen(o => !o)}>
              {clubsOpen ? 'Hide Clubs' : 'Manage Clubs'}
            </button>
          </div>

          {clubsOpen && (
            <div className="club-manager">
              <div className="club-add">
                <input placeholder="Custom club name" ref={clubInputRef} />
                <button type="button" onClick={() => {
                  if (clubInputRef.current) { onAddClub(clubInputRef.current.value); clubInputRef.current.value = '' }
                }}>Add</button>
              </div>
              <div className="club-list">
                {clubs.map((cname, ci) => (
                  <div className="club-item" key={ci}>
                    <div className="club-name">{cname}{defaultClubs.includes(cname) ? ' (default)' : ''}</div>
                    <button type="button" className="small danger inline" onClick={() => onRemoveClub(cname)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
