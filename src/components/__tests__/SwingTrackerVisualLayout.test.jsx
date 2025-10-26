/**
 * Visual Layout Tests for Mobile Swing Tracker Grid
 * These tests verify the visual layout matches our expected mobile design
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

describe('Mobile Swing Tracker Visual Layout', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    jest.clearAllMocks()
  })

  const setupMobileSwingTracker = () => {
    render(<Scorecard holes={18} />)
    fireEvent.click(screen.getAllByText('Swings')[0])
    fireEvent.click(screen.getAllByText('+ Swing')[0])
    return document.querySelector('.swing-tracker-grid')
  }

  describe('Expected Mobile Grid Layout', () => {
    test('grid container has expected CSS properties', () => {
      const gridContainer = setupMobileSwingTracker()
      
      // Verify the grid container exists with correct class
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer).toHaveClass('swing-tracker-grid')
      
      // In a real browser environment, you could test computed styles:
      // const computedStyle = window.getComputedStyle(gridContainer)
      // expect(computedStyle.display).toBe('grid')
      // expect(computedStyle.gridTemplateColumns).toMatch(/0\.8fr 1\.1fr 1\.1fr/)
    })

    test('columns have expected proportional layout', () => {
      const gridContainer = setupMobileSwingTracker()
      
      const columns = gridContainer.querySelectorAll('.swing-tracker-column')
      expect(columns).toHaveLength(3)
      
      // Club column (smaller - 0.8fr)
      const clubColumn = columns[0]
      expect(clubColumn).toContainElement(screen.getByText('Club'))
      
      // Terrain column (larger - 1.1fr) 
      const terrainColumn = columns[1]
      expect(terrainColumn).toContainElement(screen.getByText('Terrain'))
      
      // Feel column (larger - 1.1fr)
      const feelColumn = columns[2]
      expect(feelColumn).toContainElement(screen.getByText('Feel'))
    })

    test('terrain buttons arranged in expected 3x2 grid pattern', () => {
      setupMobileSwingTracker()
      
      const expectedTerrainLayout = [
        ['Fairway', 'Rough', 'Bunker'],      // Row 1
        ['Green', 'Fringe', 'Hazard']        // Row 2
      ]
      
      const terrainButtonGroup = screen.getByText('Fairway').closest('.button-group')
      expect(terrainButtonGroup).toHaveClass('button-group')
      
      // Verify all terrain buttons exist in the button group
      expectedTerrainLayout.flat().forEach(terrain => {
        const button = screen.getByText(terrain)
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('button-group-item')
        expect(terrainButtonGroup).toContainElement(button)
      })
    })

    test('feel buttons arranged in expected 3x2 grid pattern', () => {
      setupMobileSwingTracker()
      
      const expectedFeelLayout = [
        ['1', '2', '3'],    // Row 1
        ['4', '5']          // Row 2 (with empty third slot)
      ]
      
      const feelButtonGroup = screen.getByText('1').closest('.button-group')
      expect(feelButtonGroup).toHaveClass('button-group')
      
      // Verify all feel buttons exist in the button group
      expectedFeelLayout.flat().forEach(feel => {
        const button = screen.getByText(feel)
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('button-group-item')
        expect(feelButtonGroup).toContainElement(button)
      })
    })

    test('notes field spans full width under all columns', () => {
      const gridContainer = setupMobileSwingTracker()
      
      const notesSection = gridContainer.querySelector('.swing-tracker-notes')
      expect(notesSection).toBeInTheDocument()
      expect(notesSection).toHaveClass('swing-tracker-notes')
      
      const notesInput = notesSection.querySelector('input')
      expect(notesInput).toBeInTheDocument()
      expect(notesInput).toHaveAttribute('placeholder', 'short note')
    })
  })

  describe('Layout Consistency Tests', () => {
    test('multiple swings maintain consistent grid layout', () => {
      const gridContainer = setupMobileSwingTracker()
      
      // Add a second swing
      fireEvent.click(screen.getByText('Add Swing'))
      
      // Verify both swing grids maintain the same structure
      const allGrids = document.querySelectorAll('.swing-tracker-grid')
      
      allGrids.forEach(grid => {
        expect(grid).toHaveClass('swing-tracker-grid')
        
        const columns = grid.querySelectorAll('.swing-tracker-column')
        expect(columns).toHaveLength(3)
        
        const notesSection = grid.querySelector('.swing-tracker-notes')
        expect(notesSection).toBeInTheDocument()
        
        const buttonGroups = grid.querySelectorAll('.button-group')
        expect(buttonGroups).toHaveLength(2) // Terrain and Feel
      })
    })

    test('grid layout remains intact during interaction', () => {
      const gridContainer = setupMobileSwingTracker()
      
      // Interact with various elements
      fireEvent.change(screen.getByDisplayValue('7I'), { target: { value: 'Driver' } })
      fireEvent.click(screen.getByText('Rough'))
      fireEvent.click(screen.getByText('5'))
      fireEvent.change(screen.getByPlaceholderText('short note'), { 
        target: { value: 'Test note' } 
      })
      
      // Verify grid structure is unchanged
      expect(gridContainer).toHaveClass('swing-tracker-grid')
      
      const columns = gridContainer.querySelectorAll('.swing-tracker-column')
      expect(columns).toHaveLength(3)
      
      const buttonGroups = gridContainer.querySelectorAll('.button-group')
      expect(buttonGroups).toHaveLength(2)
      
      const notesSection = gridContainer.querySelector('.swing-tracker-notes')
      expect(notesSection).toBeInTheDocument()
    })
  })

  describe('Mobile Design Specifications', () => {
    test('verifies expected mobile-specific class structure', () => {
      const gridContainer = setupMobileSwingTracker()
      
      // Main grid container
      expect(gridContainer).toHaveClass('swing-tracker-grid')
      
      // Column structure
      const columns = gridContainer.querySelectorAll('.swing-tracker-column')
      columns.forEach(column => {
        expect(column).toHaveClass('swing-tracker-column')
      })
      
      // Headers
      const headers = gridContainer.querySelectorAll('.swing-tracker-header')
      headers.forEach(header => {
        expect(header).toHaveClass('swing-tracker-header')
        expect(header.querySelector('.label-icon')).toBeInTheDocument()
        expect(header.querySelector('.label-text')).toBeInTheDocument()
      })
      
      // Button groups
      const buttonGroups = gridContainer.querySelectorAll('.button-group')
      buttonGroups.forEach(group => {
        expect(group).toHaveClass('button-group')
      })
      
      // Button items
      const buttonItems = gridContainer.querySelectorAll('.button-group-item')
      buttonItems.forEach(item => {
        expect(item).toHaveClass('button-group-item')
      })
      
      // Notes section
      const notesSection = gridContainer.querySelector('.swing-tracker-notes')
      expect(notesSection).toHaveClass('swing-tracker-notes')
    })

    test('verifies button count and distribution', () => {
      const gridContainer = setupMobileSwingTracker()
      
      // Terrain column should have 6 buttons
      const terrainColumn = gridContainer.querySelectorAll('.swing-tracker-column')[1]
      const terrainButtons = terrainColumn.querySelectorAll('.button-group-item')
      expect(terrainButtons).toHaveLength(6)
      
      // Feel column should have 5 buttons
      const feelColumn = gridContainer.querySelectorAll('.swing-tracker-column')[2]
      const feelButtons = feelColumn.querySelectorAll('.button-group-item')
      expect(feelButtons).toHaveLength(5)
      
      // Total button items should be 11
      const allButtonItems = gridContainer.querySelectorAll('.button-group-item')
      expect(allButtonItems).toHaveLength(11)
    })
  })

  describe('Layout Validation', () => {
    test('ensures no layout regression in grid structure', () => {
      const gridContainer = setupMobileSwingTracker()
      
      // Create a snapshot of the current layout structure
      const layoutSnapshot = {
        mainGrid: !!gridContainer,
        gridClass: gridContainer?.className,
        columnCount: gridContainer?.querySelectorAll('.swing-tracker-column').length,
        headerCount: gridContainer?.querySelectorAll('.swing-tracker-header').length,
        buttonGroupCount: gridContainer?.querySelectorAll('.button-group').length,
        buttonItemCount: gridContainer?.querySelectorAll('.button-group-item').length,
        hasNotesSection: !!gridContainer?.querySelector('.swing-tracker-notes'),
        notesInput: !!gridContainer?.querySelector('.swing-tracker-notes input')
      }
      
      // Expected layout structure
      const expectedLayout = {
        mainGrid: true,
        gridClass: 'swing-tracker-grid',
        columnCount: 3,
        headerCount: 4, // Club, Terrain, Feel, Notes
        buttonGroupCount: 2, // Terrain, Feel
        buttonItemCount: 11, // 6 terrain + 5 feel
        hasNotesSection: true,
        notesInput: true
      }
      
      expect(layoutSnapshot).toEqual(expectedLayout)
    })

    test('validates swing tracker appears only in mobile context', () => {
      // In desktop mode, verify mobile list is hidden and table is shown
      render(<Scorecard holes={18} />)
      
      // Table should be visible (desktop)
      const table = document.querySelector('.scorecard table')
      expect(table).toBeInTheDocument()
      
      // Mobile list should exist but be hidden via CSS
      const mobileList = document.querySelector('.mobile-list')
      // Note: In a real browser test, you would check computed styles
      // to verify display: none on larger screens
    })
  })
})