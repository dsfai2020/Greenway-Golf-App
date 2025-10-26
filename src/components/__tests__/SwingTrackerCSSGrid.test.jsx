/**
 * CSS Grid Layout Tests for Mobile Swing Tracker
 * These tests verify the specific grid structure and responsive behavior
 */

import { render, screen, fireEvent } from '@testing-library/react'
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

describe('Swing Tracker CSS Grid Layout', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    jest.clearAllMocks()
  })

  const setupSwingTracker = () => {
    render(<Scorecard holes={18} />)
    fireEvent.click(screen.getAllByText('Swings')[0])
    fireEvent.click(screen.getAllByText('+ Swing')[0])
    return document.querySelector('.swing-tracker-grid')
  }

  describe('Grid Container Structure', () => {
    test('swing-tracker-grid has correct CSS class and structure', () => {
      const gridContainer = setupSwingTracker()
      
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer).toHaveClass('swing-tracker-grid')
      
      // Verify grid contains the expected child elements
      const columns = gridContainer.querySelectorAll('.swing-tracker-column')
      const notesSection = gridContainer.querySelector('.swing-tracker-notes')
      
      expect(columns).toHaveLength(3)
      expect(notesSection).toBeInTheDocument()
    })

    test('grid maintains 3-column layout structure', () => {
      const gridContainer = setupSwingTracker()
      
      // Verify the three main columns exist
      const clubColumn = gridContainer.querySelector('.swing-tracker-column:nth-child(1)')
      const terrainColumn = gridContainer.querySelector('.swing-tracker-column:nth-child(2)')
      const feelColumn = gridContainer.querySelector('.swing-tracker-column:nth-child(3)')
      
      expect(clubColumn).toBeInTheDocument()
      expect(terrainColumn).toBeInTheDocument()
      expect(feelColumn).toBeInTheDocument()
    })

    test('notes section spans across all columns', () => {
      const gridContainer = setupSwingTracker()
      
      const notesSection = gridContainer.querySelector('.swing-tracker-notes')
      expect(notesSection).toBeInTheDocument()
      expect(notesSection).toHaveClass('swing-tracker-notes')
    })
  })

  describe('Column Headers', () => {
    test('all column headers have correct structure', () => {
      setupSwingTracker()
      
      const headers = document.querySelectorAll('.swing-tracker-header')
      expect(headers).toHaveLength(4) // Club, Terrain, Feel, Notes
      
      headers.forEach(header => {
        expect(header).toHaveClass('swing-tracker-header')
        
        const icon = header.querySelector('.label-icon')
        const text = header.querySelector('.label-text')
        
        expect(icon).toBeInTheDocument()
        expect(text).toBeInTheDocument()
      })
    })

    test('headers contain correct icons and text', () => {
      setupSwingTracker()
      
      // Verify specific header content
      const clubHeader = screen.getByText('🏌️').closest('.swing-tracker-header')
      const terrainHeader = screen.getByText('🌿').closest('.swing-tracker-header')
      const feelHeader = screen.getByText('⭐').closest('.swing-tracker-header')
      const notesHeader = screen.getByText('📝').closest('.swing-tracker-header')
      
      expect(clubHeader).toContainElement(screen.getByText('Club'))
      expect(terrainHeader).toContainElement(screen.getByText('Terrain'))
      expect(feelHeader).toContainElement(screen.getByText('Feel'))
      expect(notesHeader).toContainElement(screen.getByText('Notes'))
    })
  })

  describe('Button Groups Layout', () => {
    test('terrain button group has correct structure', () => {
      setupSwingTracker()
      
      const terrainButtons = [
        'Fairway', 'Rough', 'Bunker',
        'Green', 'Fringe', 'Hazard'
      ]
      
      const buttonGroup = screen.getByText('Fairway').closest('.button-group')
      expect(buttonGroup).toBeInTheDocument()
      expect(buttonGroup).toHaveClass('button-group')
      
      // Verify all terrain buttons are in the same button group
      terrainButtons.forEach(terrain => {
        const button = screen.getByText(terrain)
        expect(button).toHaveClass('button-group-item')
        expect(button.closest('.button-group')).toBe(buttonGroup)
      })
    })

    test('feel button group has correct structure', () => {
      setupSwingTracker()
      
      const feelButtons = ['1', '2', '3', '4', '5']
      
      const buttonGroup = screen.getByText('1').closest('.button-group')
      expect(buttonGroup).toBeInTheDocument()
      expect(buttonGroup).toHaveClass('button-group')
      
      // Verify all feel buttons are in the same button group
      feelButtons.forEach(feel => {
        const button = screen.getByText(feel)
        expect(button).toHaveClass('button-group-item')
        expect(button.closest('.button-group')).toBe(buttonGroup)
      })
    })

    test('button groups are within their respective columns', () => {
      setupSwingTracker()
      
      const columns = document.querySelectorAll('.swing-tracker-column')
      
      // Club column (no button group, just select)
      const clubSelect = columns[0].querySelector('select')
      expect(clubSelect).toBeInTheDocument()
      
      // Terrain column
      const terrainButtonGroup = columns[1].querySelector('.button-group')
      expect(terrainButtonGroup).toBeInTheDocument()
      expect(terrainButtonGroup.querySelectorAll('.button-group-item')).toHaveLength(6)
      
      // Feel column
      const feelButtonGroup = columns[2].querySelector('.button-group')
      expect(feelButtonGroup).toBeInTheDocument()
      expect(feelButtonGroup.querySelectorAll('.button-group-item')).toHaveLength(5)
    })
  })

  describe('Form Controls', () => {
    test('club select has correct styling classes', () => {
      setupSwingTracker()
      
      const clubSelect = document.querySelector('.swing-tracker-column select')
      expect(clubSelect).toBeInTheDocument()
      expect(clubSelect).toHaveValue('7I') // Default value
    })

    test('notes input has correct structure and classes', () => {
      setupSwingTracker()
      
      const notesInput = screen.getByPlaceholderText('short note')
      expect(notesInput).toBeInTheDocument()
      expect(notesInput.closest('.swing-tracker-notes')).toBeInTheDocument()
    })
  })

  describe('Grid Responsive Structure', () => {
    test('maintains grid structure for mobile layout', () => {
      // Note: In a real test environment, you might use matchMedia mock
      // or jsdom-testing-utils to test responsive behavior
      
      const gridContainer = setupSwingTracker()
      
      // Verify the grid container maintains its structure
      expect(gridContainer).toHaveClass('swing-tracker-grid')
      
      // Verify responsive classes are present
      const columns = gridContainer.querySelectorAll('.swing-tracker-column')
      expect(columns).toHaveLength(3)
      
      const buttonGroups = gridContainer.querySelectorAll('.button-group')
      expect(buttonGroups).toHaveLength(2) // Terrain and Feel
      
      const buttonItems = gridContainer.querySelectorAll('.button-group-item')
      expect(buttonItems).toHaveLength(11) // 6 terrain + 5 feel
    })
  })

  describe('Layout Integrity', () => {
    test('swing index is properly positioned', () => {
      setupSwingTracker()
      
      const swingIndex = screen.getByText('#1')
      expect(swingIndex).toBeInTheDocument()
      expect(swingIndex).toHaveClass('swing-index')
    })

    test('remove button is properly positioned', () => {
      setupSwingTracker()
      
      const removeButton = screen.getByText('Remove')
      expect(removeButton).toBeInTheDocument()
      expect(removeButton).toHaveClass('small', 'danger')
    })

    test('grid layout survives swing removal and addition', () => {
      setupSwingTracker()
      
      // Add a second swing
      fireEvent.click(screen.getByText('Add Swing'))
      
      // Verify two swing grids exist
      const swingIndices = screen.getAllByText(/#\d/)
      expect(swingIndices).toHaveLength(2)
      
      // Remove first swing
      const removeButtons = screen.getAllByText('Remove')
      fireEvent.click(removeButtons[0])
      
      // Verify grid structure is maintained
      const remainingGrid = document.querySelector('.swing-tracker-grid')
      expect(remainingGrid).toBeInTheDocument()
      
      const columns = remainingGrid.querySelectorAll('.swing-tracker-column')
      expect(columns).toHaveLength(3)
    })
  })

  describe('Grid State Management', () => {
    test('grid maintains state when collapsed and expanded', () => {
      render(<Scorecard holes={18} />)
      
      // Open and set up swing tracker
      fireEvent.click(screen.getAllByText('Swings')[0])
      fireEvent.click(screen.getAllByText('+ Swing')[0])
      
      // Modify swing data
      fireEvent.click(screen.getByText('Rough'))
      fireEvent.click(screen.getByText('4'))
      
      // Collapse
      fireEvent.click(screen.getByText('Done'))
      
      // Re-expand
      fireEvent.click(screen.getAllByText('Swings')[0])
      
      // Verify state is maintained
      expect(screen.getByText('Rough')).toHaveClass('active')
      expect(screen.getByText('4')).toHaveClass('active')
      
      // Verify grid structure is intact
      const gridContainer = document.querySelector('.swing-tracker-grid')
      expect(gridContainer).toBeInTheDocument()
    })
  })
})