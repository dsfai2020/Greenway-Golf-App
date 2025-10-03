import React, { useState } from 'react'
import Scorecard from '../components/Scorecard'
import Heatmap from '../components/Heatmap'

export default function Main(){
  const [holes, setHoles] = useState(18)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [heatView, setHeatView] = useState('all')

  return (
    <section className="main-page">
      {showHeatmap && <Heatmap holes={holes} view={heatView} />}
      <div className="controls">
        <label style={{marginRight:12}}>
          Holes:
          <select value={holes} onChange={e => setHoles(Number(e.target.value))}>
            <option value={9}>9</option>
            <option value={18}>18</option>
          </select>
        </label>
        <label style={{marginRight:12}}>
          Heatmap view:
          <select value={heatView} onChange={e => setHeatView(e.target.value)}>
            <option value={'all'}>All</option>
            <option value={'front'}>Front 9</option>
            <option value={'back'}>Back 9</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} /> Show heatmap
        </label>
      </div>
      <Scorecard holes={holes} />
    </section>
  )
}
