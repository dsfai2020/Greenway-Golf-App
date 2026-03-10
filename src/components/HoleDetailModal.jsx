import React, { useState, useRef, useEffect } from 'react'

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
  onUpdatePar, onCompleteHole, onPickupHole,
  onAddClub, onRemoveClub
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [clubsOpen, setClubsOpen] = useState(false)
  const clubInputRef = useRef(null)

  // Reset to first tab whenever a different hole is opened
  useEffect(() => {
    setActiveTab(0)
    setClubsOpen(false)
  }, [holeIdx])

  if (!isOpen || !row) return null

  const strokes = row.swings.length
  const result = strokes > 0 ? getResultLabel(strokes, row.par) : null
  // Keep activeTab in bounds — e.g. after a swing is removed
  const safeTab = Math.min(activeTab, Math.max(0, strokes - 1))
  const currentSwing = row.swings[safeTab]

  function handleAddSwing() {
    onAddSwing(holeIdx)
    setActiveTab(strokes) // strokes is current length = index of the new swing
  }

  function handleRemoveSwing() {
    onRemoveSwing(holeIdx, safeTab)
    setActiveTab(Math.max(0, safeTab - 1))
  }

  function handlePickup() {
    onPickupHole && onPickupHole(holeIdx)
    onClose()
  }

  function handleDrop() {
    onAddSwing(holeIdx)
    setActiveTab(strokes)
  }

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

        {/* Swing tab bar */}
        <div className="swing-tab-bar">
          {row.swings.map((_, i) => (
            <button
              key={i}
              className={`swing-tab ${safeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {i + 1}
            </button>
          ))}
          <button className="swing-tab swing-tab-add" onClick={handleAddSwing} title="Add swing">
            + Swing
          </button>
        </div>

        <div className="hole-detail-body">
          {strokes === 0 ? (
            <div className="empty">No swings yet — tap "+ Swing" to start.</div>
          ) : (
            <div className={`swing feel-${currentSwing.satisfaction}${safeTab === strokes - 1 && !row.completed ? ' is-latest' : ''}`}>
              <div className="swing-tracker-grid">
                <label className="swing-tracker-column">
                  <span className="swing-tracker-header">
                    <span className="label-icon">🏌️</span>
                    <span className="label-text">Club</span>
                  </span>
                  <select value={currentSwing.club} onChange={e => onUpdateSwing(holeIdx, safeTab, 'club', e.target.value)}>
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
                        className={`button-group-item ${currentSwing.terrain === terrain ? 'active' : ''}`}
                        onClick={() => onUpdateSwing(holeIdx, safeTab, 'terrain', terrain)}
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
                        className={`button-group-item ${currentSwing.satisfaction === feel ? 'active' : ''}`}
                        onClick={() => onUpdateSwing(holeIdx, safeTab, 'satisfaction', feel)}
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
                    value={currentSwing.notes || ''}
                    onChange={e => onUpdateSwing(holeIdx, safeTab, 'notes', e.target.value)}
                    placeholder="short note"
                  />
                </label>
                <label className="swing-tracker-distance">
                  <span className="swing-tracker-header">
                    <span className="label-icon">📏</span>
                    <span className="label-text">Distance</span>
                    <span className="distance-value">{currentSwing.distance || 150} yds</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    value={currentSwing.distance || 150}
                    onChange={e => onUpdateSwing(holeIdx, safeTab, 'distance', Number(e.target.value))}
                    className="distance-slider"
                  />
                </label>
              </div>
              <button className="small danger" onClick={handleRemoveSwing}>Remove Swing</button>
            </div>
          )}

          <div className="swings-actions">
            {strokes > 0 && !row.completed && (
              <button className="done-button" onClick={handleComplete}>Done ⛳</button>
            )}
            <button className="small mute" onClick={() => setClubsOpen(o => !o)}>
              {clubsOpen ? 'Hide Clubs' : 'Manage Clubs'}
            </button>
          </div>

          {!row.completed && (
            <div className="pickup-action-row">
              <button className="pickup-button" onClick={handlePickup} title="Pick up — auto-score this hole per your pickup rule">
                🚫 Pick Up
              </button>
              <button className="drop-button" onClick={handleDrop} title="Take a drop — add a penalty stroke">
                🗿 Take a Drop
              </button>
            </div>
          )}

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
