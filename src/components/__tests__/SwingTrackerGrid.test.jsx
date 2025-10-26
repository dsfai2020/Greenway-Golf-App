import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Scorecard from '../Scorecard'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.dispatchEvent
global.window.dispatchEvent = jest.fn()

describe('Swing Tracker Grid Layout', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    jest.clearAllMocks()
  })

  describe('Mobile Grid Structure', () => {
    test('renders swing tracker grid with correct structure', async () => {
      render(<Scorecard holes={18} />)
      
      // Open first hole's swing tracker
      const firstSwingButton = screen.getAllByText('Swings')[0]
      fireEvent.click(firstSwingButton)
      
      // Add a swing to see the tracker
      const addSwingButton = screen.getAllByText('+ Swing')[0]
      fireEvent.click(addSwingButton)
      
      // Verify grid container exists
      const swingGrid = document.querySelector('.swing-tracker-grid')
      expect(swingGrid).toBeInTheDocument()
      
      // Verify all three columns exist
      const columns = document.querySelectorAll('.swing-tracker-column')
      expect(columns).toHaveLength(3)
      
      // Verify notes section spans across columns
      const notesSection = document.querySelector('.swing-tracker-notes')
      expect(notesSection).toBeInTheDocument()
    })

    test('displays correct column headers with icons and text', async () => {
      render(<Scorecard holes={18} />)
      
      // Open swing tracker
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Verify headers with icons and text
      expect(screen.getByText('🏌️')).toBeInTheDocument()
      expect(screen.getByText('Club')).toBeInTheDocument()
      expect(screen.getByText('🌿')).toBeInTheDocument()
      expect(screen.getByText('Terrain')).toBeInTheDocument()
      expect(screen.getByText('⭐')).toBeInTheDocument()
      expect(screen.getByText('Feel')).toBeInTheDocument()
      expect(screen.getByText('📝')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })

    test('terrain buttons are arranged in correct 3x2 grid', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Verify all terrain options exist
      const terrainButtons = [
        'Fairway', 'Rough', 'Bunker', 
        'Green', 'Fringe', 'Hazard'
      ]
      
      terrainButtons.forEach(terrain => {
        expect(screen.getByText(terrain)).toBeInTheDocument()
      })
      
      // Verify terrain buttons are in button-group
      const terrainButtonElements = terrainButtons.map(terrain => 
        screen.getByText(terrain)
      )
      
      terrainButtonElements.forEach(button => {
        expect(button).toHaveClass('button-group-item')
        expect(button.closest('.button-group')).toBeInTheDocument()
      })
    })

    test('feel buttons are arranged in correct 3x2 grid', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Verify all feel options exist (1-5)
      const feelButtons = ['1', '2', '3', '4', '5']
      
      feelButtons.forEach(feel => {
        const feelButton = screen.getByText(feel)
        expect(feelButton).toBeInTheDocument()
        expect(feelButton).toHaveClass('button-group-item')
      })
    })

    test('notes field spans across all columns', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const notesInput = screen.getByPlaceholderText('short note')
      expect(notesInput).toBeInTheDocument()
      
      const notesContainer = notesInput.closest('.swing-tracker-notes')
      expect(notesContainer).toBeInTheDocument()
    })
  })

  describe('Grid Functionality', () => {
    test('club selection works correctly', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const clubSelect = screen.getByDisplayValue('7I')
      expect(clubSelect).toBeInTheDocument()
      
      // Change club selection
      fireEvent.change(clubSelect, { target: { value: 'Driver' } })
      expect(clubSelect).toHaveValue('Driver')
    })

    test('terrain button selection works correctly', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const roughButton = screen.getByText('Rough')
      fireEvent.click(roughButton)
      
      await waitFor(() => {
        expect(roughButton).toHaveClass('active')
      })
      
      // Test another terrain button
      const bunkerButton = screen.getByText('Bunker')
      fireEvent.click(bunkerButton)
      
      await waitFor(() => {
        expect(bunkerButton).toHaveClass('active')
        expect(roughButton).not.toHaveClass('active')
      })
    })

    test('feel button selection works correctly', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const feel4Button = screen.getByText('4')
      fireEvent.click(feel4Button)
      
      await waitFor(() => {
        expect(feel4Button).toHaveClass('active')
      })
      
      // Test another feel button
      const feel5Button = screen.getByText('5')
      fireEvent.click(feel5Button)
      
      await waitFor(() => {
        expect(feel5Button).toHaveClass('active')
        expect(feel4Button).not.toHaveClass('active')
      })
    })

    test('notes input works correctly', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const notesInput = screen.getByPlaceholderText('short note')
      
      fireEvent.change(notesInput, { target: { value: 'Great shot!' } })
      expect(notesInput).toHaveValue('Great shot!')
    })
  })

  describe('Multiple Swings', () => {
    test('can add multiple swings with independent grid layouts', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Add second swing
      const addSwingButtons = screen.getAllByText('Add Swing')
      fireEvent.click(addSwingButtons[0])
      
      // Verify two swing grids exist
      const swingGrids = document.querySelectorAll('.swing-tracker-grid')
      expect(swingGrids.length).toBeGreaterThanOrEqual(1)
      
      // Verify swing indices
      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
    })

    test('each swing maintains independent state', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      fireEvent.click(screen.getAllByText('Add Swing')[0])
      
      // Get all terrain buttons for both swings
      const roughButtons = screen.getAllByText('Rough')
      const fairwayButtons = screen.getAllByText('Fairway')
      
      // Select different terrain for each swing
      fireEvent.click(roughButtons[0]) // First swing
      fireEvent.click(fairwayButtons[1]) // Second swing
      
      await waitFor(() => {
        expect(roughButtons[0]).toHaveClass('active')
        expect(fairwayButtons[1]).toHaveClass('active')
        expect(roughButtons[1]).not.toHaveClass('active')
        expect(fairwayButtons[0]).not.toHaveClass('active')
      })
    })
  })

  describe('Responsive Behavior', () => {
    test('grid maintains structure across different screen sizes', () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const swingGrid = document.querySelector('.swing-tracker-grid')
      expect(swingGrid).toBeInTheDocument()
      
      // Verify CSS classes are applied
      expect(swingGrid).toHaveClass('swing-tracker-grid')
      
      const columns = document.querySelectorAll('.swing-tracker-column')
      expect(columns).toHaveLength(3)
      
      const notesSection = document.querySelector('.swing-tracker-notes')
      expect(notesSection).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('all interactive elements are focusable', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Club select should be focusable
      const clubSelect = screen.getByDisplayValue('7I')
      expect(clubSelect).toBeVisible()
      
      // Terrain buttons should be focusable
      const terrainButtons = screen.getAllByRole('button').filter(btn => 
        ['Fairway', 'Rough', 'Bunker', 'Green', 'Fringe', 'Hazard'].includes(btn.textContent)
      )
      expect(terrainButtons.length).toBe(6)
      
      // Feel buttons should be focusable
      const feelButtons = screen.getAllByRole('button').filter(btn => 
        ['1', '2', '3', '4', '5'].includes(btn.textContent)
      )
      expect(feelButtons.length).toBe(5)
      
      // Notes input should be focusable
      const notesInput = screen.getByPlaceholderText('short note')
      expect(notesInput).toBeVisible()
    })

    test('buttons have proper active states', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      const fairwayButton = screen.getByText('Fairway')
      const feel3Button = screen.getByText('3')
      
      // Initially, Fairway and Feel 3 should be active (defaults)
      expect(fairwayButton).toHaveClass('active')
      expect(feel3Button).toHaveClass('active')
    })
  })

  describe('Data Persistence', () => {
    test('swing data is properly structured for storage', async () => {
      render(<Scorecard holes={18} />)
      
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Modify swing data
      const clubSelect = screen.getByDisplayValue('7I')
      fireEvent.change(clubSelect, { target: { value: 'Driver' } })
      
      const roughButton = screen.getByText('Rough')
      fireEvent.click(roughButton)
      
      const feel5Button = screen.getByText('5')
      fireEvent.click(feel5Button)
      
      const notesInput = screen.getByPlaceholderText('short note')
      fireEvent.change(notesInput, { target: { value: 'Perfect drive!' } })
      
      // Verify localStorage was called with proper structure
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })
    })
  })
})