# Mobile Swing Tracker Grid Layout Specification

## Overview
This document defines the mobile swing tracker grid layout for the golf scorecard application. The layout is specifically designed for mobile devices and provides an optimal user experience for tracking golf swings.

## Design Requirements

### Grid Structure
- **Main Container**: `.swing-tracker-grid`
- **Layout**: CSS Grid with 3 columns and 4 rows
- **Column Proportions**: 
  - Club: 0.8fr (smaller, more compact)
  - Terrain: 1.1fr (larger for button grid)
  - Feel: 1.1fr (larger for button grid)

### Responsive Breakpoints
```css
/* Desktop/Tablet (default) */
grid-template-columns: 0.8fr 1.1fr 1.1fr;

/* Mobile (≤700px) */
grid-template-columns: 0.7fr 1.15fr 1.15fr;

/* Compact Mobile (≤430px) */
grid-template-columns: 0.6fr 1.2fr 1.2fr;
```

### Row Structure
1. **Row 1**: Column headers (Club | Terrain | Feel)
2. **Row 2**: Controls (Select | Buttons Row 1 | Buttons Row 1)
3. **Row 3**: Continuation (Empty | Buttons Row 2 | Buttons Row 2)
4. **Row 4**: Notes field (spans all 3 columns)

## Component Structure

### HTML/JSX Structure
```jsx
<div className="swing-tracker-grid">
  {/* Club Column */}
  <label className="swing-tracker-column">
    <span className="swing-tracker-header">
      <span className="label-icon">🏌️</span>
      <span className="label-text">Club</span>
    </span>
    <select>...</select>
  </label>

  {/* Terrain Column */}
  <label className="swing-tracker-column">
    <span className="swing-tracker-header">
      <span className="label-icon">🌿</span>
      <span className="label-text">Terrain</span>
    </span>
    <div className="button-group">
      {/* 6 terrain buttons in 3x2 grid */}
    </div>
  </label>

  {/* Feel Column */}
  <label className="swing-tracker-column">
    <span className="swing-tracker-header">
      <span className="label-icon">⭐</span>
      <span className="label-text">Feel</span>
    </span>
    <div className="button-group">
      {/* 5 feel buttons in 3x2 grid */}
    </div>
  </label>

  {/* Notes Row - Spans all columns */}
  <label className="swing-tracker-notes">
    <span className="swing-tracker-header">
      <span className="label-icon">📝</span>
      <span className="label-text">Notes</span>
    </span>
    <input type="text" placeholder="short note" />
  </label>
</div>
```

### CSS Classes Reference

#### Main Container
- `.swing-tracker-grid` - Main CSS grid container

#### Columns
- `.swing-tracker-column` - Individual column container
- `.swing-tracker-notes` - Notes section that spans all columns

#### Headers
- `.swing-tracker-header` - Header container for each section
- `.label-icon` - Emoji icon for each section
- `.label-text` - Text label for each section

#### Button Groups
- `.button-group` - Container for terrain/feel buttons (CSS grid)
- `.button-group-item` - Individual button within a group

## Button Layout Specifications

### Terrain Buttons (6 total)
Arranged in 3x2 CSS grid:
```
Row 1: [Fairway] [Rough] [Bunker]
Row 2: [Green]   [Fringe] [Hazard]
```

### Feel Buttons (5 total)
Arranged in 3x2 CSS grid:
```
Row 1: [1] [2] [3]
Row 2: [4] [5] [empty]
```

## CSS Implementation

### Main Grid
```css
.swing-tracker-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.1fr 1.1fr;
  grid-template-rows: auto auto auto auto;
  gap: 12px;
  align-items: start;
}
```

### Button Groups
```css
.swing-tracker-column .button-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 4px;
}
```

### Notes Section
```css
.swing-tracker-notes {
  grid-column: 1 / -1; /* Span all three columns */
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

## Responsive Behavior

### Mobile Optimization (≤700px)
- Reduced gaps and padding
- Smaller font sizes
- Adjusted column proportions for better button visibility

### Compact Mobile (≤430px)
- Minimal padding and gaps
- Smallest font sizes
- Maximum space allocation to button columns

## Testing Requirements

### Layout Tests
1. Verify 3-column grid structure
2. Confirm notes section spans all columns
3. Validate button arrangement in 3x2 subgrids
4. Test responsive breakpoint behavior

### Functionality Tests
1. Club selection works correctly
2. Terrain button selection (single choice)
3. Feel button selection (single choice)
4. Notes input functionality
5. Multiple swing independence

### Visual Regression Tests
1. Grid proportions maintained
2. Button layout consistency
3. Header alignment
4. Notes field full-width spanning

## Maintenance Guidelines

### When Adding New Features
- Ensure new elements fit within the established grid structure
- Maintain responsive breakpoint behavior
- Update tests to cover new functionality

### When Modifying Layout
- Run all layout tests before deployment
- Verify responsive behavior across breakpoints
- Check visual consistency across different devices

### CSS Modifications
- Always test on actual mobile devices
- Maintain proportional relationships between columns
- Preserve button grid arrangements

## Browser Support
- Modern mobile browsers (iOS Safari, Chrome Mobile, Firefox Mobile)
- CSS Grid support required
- Touch interaction optimized

## Performance Considerations
- Grid layout is optimized for rendering performance
- Button interactions are debounced
- Responsive breakpoints minimize layout thrashing

## Accessibility
- All interactive elements are keyboard accessible
- Proper ARIA labels on form controls
- Touch targets meet minimum size requirements (44px+)
- High contrast support for button states