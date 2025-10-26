import React, { useState, useEffect } from 'react'
import ScoreboardSummary from './ScoreboardSummary'

const GameHistoryModal = ({ isOpen, onClose, currentGameData, onLoadGame }) => {
  const [savedGames, setSavedGames] = useState([])
  const [selectedGameIndex, setSelectedGameIndex] = useState(null)
  const [saveGameName, setSaveGameName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'view'

  useEffect(() => {
    if (isOpen) {
      loadSavedGames()
    }
  }, [isOpen])

  const loadSavedGames = () => {
    try {
      const saved = localStorage.getItem('golf-saved-games')
      if (saved) {
        setSavedGames(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved games:', error)
    }
  }

  const saveCurrentGame = () => {
    if (!saveGameName.trim()) return

    const newGame = {
      id: Date.now(),
      name: saveGameName.trim(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: [...currentGameData],
      totalStrokes: currentGameData.reduce((sum, row) => sum + row.swings.length, 0),
      totalPar: currentGameData.reduce((sum, row) => sum + row.par, 0),
      completedHoles: currentGameData.filter(row => row.completed).length
    }

    let updatedGames = [...savedGames, newGame]
    
    // Keep only the 5 most recent games
    if (updatedGames.length > 5) {
      updatedGames = updatedGames.slice(-5)
    }

    setSavedGames(updatedGames)
    localStorage.setItem('golf-saved-games', JSON.stringify(updatedGames))
    
    setSaveGameName('')
    setShowSaveForm(false)
  }

  const deleteGame = (gameId) => {
    const updatedGames = savedGames.filter(game => game.id !== gameId)
    setSavedGames(updatedGames)
    localStorage.setItem('golf-saved-games', JSON.stringify(updatedGames))
    
    if (selectedGameIndex !== null && savedGames[selectedGameIndex]?.id === gameId) {
      setSelectedGameIndex(null)
      setViewMode('list')
    }
  }

  const viewGame = (index) => {
    setSelectedGameIndex(index)
    setViewMode('view')
  }

  const loadGameToCurrent = (gameData) => {
    onLoadGame(gameData)
    onClose()
  }

  const backToList = () => {
    setSelectedGameIndex(null)
    setViewMode('list')
  }

  const selectedGame = selectedGameIndex !== null ? savedGames[selectedGameIndex] : null

  if (!isOpen) return null

  return (
    <div className="game-history-backdrop" onClick={onClose}>
      <div className="game-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏌️ Game History</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Save Current Game Section */}
            <div className="save-section">
              <h3>💾 Save Current Game</h3>
              {!showSaveForm ? (
                <button 
                  className="save-game-button"
                  onClick={() => setShowSaveForm(true)}
                >
                  Save Current Game
                </button>
              ) : (
                <div className="save-form">
                  <input
                    type="text"
                    placeholder="Enter game name..."
                    value={saveGameName}
                    onChange={(e) => setSaveGameName(e.target.value)}
                    maxLength={30}
                  />
                  <div className="save-form-actions">
                    <button onClick={saveCurrentGame} disabled={!saveGameName.trim()}>
                      Save
                    </button>
                    <button onClick={() => {setShowSaveForm(false); setSaveGameName('')}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Games List */}
            <div className="saved-games-section">
              <h3>📚 Saved Games ({savedGames.length}/5)</h3>
              {savedGames.length === 0 ? (
                <div className="no-games">
                  <p>No saved games yet. Save your current game to get started!</p>
                </div>
              ) : (
                <div className="games-list">
                  {savedGames.map((game, index) => (
                    <div key={game.id} className="game-item">
                      <div className="game-info">
                        <div className="game-name">{game.name}</div>
                        <div className="game-meta">
                          {game.date} at {game.time}
                        </div>
                        <div className="game-stats">
                          {game.completedHoles}/18 holes • {game.totalStrokes} strokes • {game.totalStrokes - game.totalPar > 0 ? `+${game.totalStrokes - game.totalPar}` : game.totalStrokes - game.totalPar}
                        </div>
                      </div>
                      <div className="game-actions">
                        <button 
                          className="view-button"
                          onClick={() => viewGame(index)}
                        >
                          View
                        </button>
                        <button 
                          className="load-button"
                          onClick={() => loadGameToCurrent(game.data)}
                        >
                          Load
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => deleteGame(game.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Game View Mode */
          <div className="game-view">
            <div className="game-view-header">
              <button className="back-button" onClick={backToList}>
                ← Back to List
              </button>
              <h3>{selectedGame.name}</h3>
              <button 
                className="load-current-button"
                onClick={() => loadGameToCurrent(selectedGame.data)}
              >
                Load to Current Game
              </button>
            </div>
            
            <div className="game-view-meta">
              <span>{selectedGame.date} at {selectedGame.time}</span>
            </div>

            <ScoreboardSummary rows={selectedGame.data} />
            
            <div className="game-view-actions">
              <button 
                className="return-current-button"
                onClick={onClose}
              >
                Return to Current Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameHistoryModal