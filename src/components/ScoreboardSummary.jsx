import React from 'react'

const ScoreboardSummary = ({ rows }) => {
  // Calculate totals
  const totalPar = rows.reduce((sum, row) => sum + row.par, 0)
  const totalStrokes = rows.reduce((sum, row) => sum + row.swings.length, 0)
  const totalDiff = totalStrokes - totalPar
  const completedHoles = rows.filter(row => row.completed).length
  
  // Get result label for a hole
  const getResultLabel = (strokes, par) => {
    const diff = strokes - par
    if (diff <= -3) return { label: 'Albatross', class: 'albatross' }
    if (diff === -2) return { label: 'Eagle', class: 'eagle' }
    if (diff === -1) return { label: 'Birdie', class: 'birdie' }
    if (diff === 0) return { label: 'Par', class: 'par' }
    if (diff === 1) return { label: 'Bogey', class: 'bogey' }
    if (diff === 2) return { label: 'Double', class: 'double' }
    return { label: 'Triple+', class: 'triple' }
  }

  return (
    <div className="scoreboard-summary">
      <div className="scoreboard-header">
        <h3>📊 Round Summary</h3>
        <div className="summary-stats">
          <span className="stat">
            <strong>{completedHoles}</strong>/18 Holes
          </span>
          <span className="stat">
            Total: <strong>{totalStrokes}</strong>
          </span>
          <span className={`stat total-diff ${totalDiff === 0 ? 'even' : totalDiff < 0 ? 'under' : 'over'}`}>
            {totalDiff === 0 ? 'Even' : totalDiff > 0 ? `+${totalDiff}` : `${totalDiff}`}
          </span>
        </div>
      </div>
      
      <div className="holes-grid">
        {rows.map((row, index) => {
          const holeNumber = index + 1
          const strokes = row.swings.length
          const hasStrokes = strokes > 0
          const result = hasStrokes ? getResultLabel(strokes, row.par) : null
          
          return (
            <div 
              key={holeNumber} 
              className={`hole-summary ${row.completed ? 'completed' : ''} ${hasStrokes ? 'has-strokes' : 'empty'} ${result?.class || ''}`}
            >
              <div className="hole-number">{holeNumber}</div>
              <div className="hole-par">Par {row.par}</div>
              <div className="hole-score">
                {hasStrokes ? (
                  <>
                    <span className="strokes">{strokes}</span>
                    {row.completed && <span className="completed-check">✓</span>}
                  </>
                ) : (
                  <span className="no-score">-</span>
                )}
              </div>
              {result && (
                <div className="hole-result">{result.label}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Front 9 / Back 9 Summary */}
      <div className="nine-summary">
        <div className="nine-section">
          <h4>Front 9</h4>
          <div className="nine-stats">
            <span>Par: {rows.slice(0, 9).reduce((sum, row) => sum + row.par, 0)}</span>
            <span>Score: {rows.slice(0, 9).reduce((sum, row) => sum + row.swings.length, 0)}</span>
          </div>
        </div>
        <div className="nine-section">
          <h4>Back 9</h4>
          <div className="nine-stats">
            <span>Par: {rows.slice(9, 18).reduce((sum, row) => sum + row.par, 0)}</span>
            <span>Score: {rows.slice(9, 18).reduce((sum, row) => sum + row.swings.length, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreboardSummary