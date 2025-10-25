import React from 'react'

const CelebratoryModal = ({ isOpen, onClose, holeNumber, strokes, par, result }) => {

  if (!isOpen) return null

  const diff = strokes - par
  let scoreMessage = 'GREAT JOB!'
  let scoreIcon = '⭐'
  
  if (diff <= -3) {
    scoreMessage = 'INCREDIBLE ALBATROSS!'
    scoreIcon = '🦅'
  } else if (diff === -2) {
    scoreMessage = 'AMAZING EAGLE!'
    scoreIcon = '🦅'
  } else if (diff === -1) {
    scoreMessage = 'GREAT BIRDIE!'
    scoreIcon = '🐦'
  } else if (diff === 0) {
    scoreMessage = 'SOLID PAR!'
    scoreIcon = '🎯'
  } else if (diff === 1) {
    scoreMessage = 'NICE BOGEY!'
    scoreIcon = '⚡'
  } else if (diff >= 2) {
    scoreMessage = 'KEEP GOING!'
    scoreIcon = '💪'
  }

  return (
    <div className="simple-modal-backdrop" onClick={onClose}>
      <div className="simple-celebration-modal" onClick={(e) => e.stopPropagation()}>
        {/* Simple CSS confetti */}
        <div className="confetti-container">
          <div className="confetti confetti-1">🎉</div>
          <div className="confetti confetti-2">🎊</div>
          <div className="confetti confetti-3">⭐</div>
          <div className="confetti confetti-4">🎈</div>
          <div className="confetti confetti-5">✨</div>
          <div className="confetti confetti-6">🎯</div>
        </div>
        
        <div className="simple-modal-content">
          <h2>🎉 HOLE {holeNumber} COMPLETE! 🎉</h2>
          
          <div className="simple-score-display">
            <div className="simple-score-icon">{scoreIcon}</div>
            <div className="simple-score-number">{strokes}</div>
            <div className="simple-score-label">STROKES</div>
          </div>

          <div className="simple-result-message">
            {result?.label || scoreMessage}
          </div>

          <div className="simple-score-info">
            <p>Par: {par} | Your Score: {strokes}</p>
            <p>Difference: {diff === 0 ? 'Even' : (diff > 0 ? `+${diff}` : `${diff}`)}</p>
          </div>

          <button className="simple-continue-button" onClick={onClose}>
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  )
}

export default CelebratoryModal