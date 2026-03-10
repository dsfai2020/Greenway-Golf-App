import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Colours
const C = {
  parchment:  0xf2dfa0,
  ink:        0x3e2206,
  inkFaint:   0xb89a60,
  green:      0x2d6a4f,
  greenLight: 0x74c69d,
  red:        0xae2012,
  grey:       0x9b8860,
  white:      0xffffff,
}

/** Winding (snake) positions across the canvas */
function buildPositions(n, W, H) {
  const cols  = n <= 9 ? 3 : 6
  const rows  = Math.ceil(n / cols)
  const padX  = W * 0.11
  const padY  = H * 0.14
  const useW  = W - padX * 2
  const useH  = H - padY * 2

  return Array.from({ length: n }, (_, i) => {
    const row         = Math.floor(i / cols)
    const col         = i % cols
    const rowCols     = Math.min(cols, n - row * cols)
    const cNorm       = rowCols === 1 ? 0.5
      : (row % 2 === 0 ? col : rowCols - 1 - col) / (rowCols - 1)
    const rNorm       = rows === 1 ? 0.5 : row / (rows - 1)
    const jx          = Math.sin(i * 14.3 + 1.1) * useW * 0.022
    const jy          = Math.cos(i * 9.7 + 0.5)  * useH * 0.022
    return {
      x: (cNorm - 0.5) * useW + jx - padX * 0 /* center already */,
      y: (0.5 - rNorm) * useH + jy,
    }
  })
}

/** Canvas-texture sprite for a hole number label */
function makeLabel(num, color = '#fff') {
  const size = 64
  const c    = document.createElement('canvas')
  c.width = c.height = size
  const ctx  = c.getContext('2d')
  ctx.font         = `bold ${size * 0.44}px Arial, sans-serif`
  ctx.fillStyle    = color
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(num), size / 2, size / 2)
  return new THREE.CanvasTexture(c)
}

/** Title canvas texture */
function makeTitleTexture(W) {
  const c   = document.createElement('canvas')
  c.width   = Math.round(W * 0.7)
  c.height  = 36
  const ctx = c.getContext('2d')
  ctx.font         = `italic bold ${18}px Georgia, serif`
  ctx.fillStyle    = 'rgba(62,34,6,0.55)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⛳ The Course', c.width / 2, 18)
  return new THREE.CanvasTexture(c)
}

export default function TreasureMapView({ holes = 18 }) {
  const mountRef = useRef(null)
  const [rows, setRows] = useState(() => {
    try {
      const raw = localStorage.getItem(`golf-score-${holes}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        return Array.from({ length: holes }, (_, i) => parsed[i] || { par: 4, swings: [], completed: false })
      }
    } catch (e) {}
    return Array.from({ length: holes }, () => ({ par: 4, swings: [], completed: false }))
  })

  useEffect(() => {
    function onUpdated() {
      try {
        const raw = localStorage.getItem(`golf-score-${holes}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          setRows(Array.from({ length: holes }, (_, i) => parsed[i] || { par: 4, swings: [], completed: false }))
        }
      } catch (e) {}
    }
    window.addEventListener('golf:updated', onUpdated)
    return () => window.removeEventListener('golf:updated', onUpdated)
  }, [holes])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W  = el.clientWidth  || 600
    const H  = el.clientHeight || 380
    const n  = rows.length

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    /* ── scene / camera ── */
    const scene  = new THREE.Scene()
    scene.background = new THREE.Color(C.parchment)
    const cam    = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100)
    cam.position.z = 10

    /* ── parchment grain overlay ── */
    const noiseCanvas = document.createElement('canvas')
    noiseCanvas.width = noiseCanvas.height = 256
    const nc = noiseCanvas.getContext('2d')
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const v = Math.random() * 20
        nc.fillStyle = `rgba(80,40,0,${v / 255 * 0.07})`
        nc.fillRect(x, y, 1, 1)
      }
    }
    const noiseTex   = new THREE.CanvasTexture(noiseCanvas)
    const noisePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: noiseTex, transparent: true, opacity: 0.35, depthWrite: false })
    )
    noisePlane.position.z = 0.1
    scene.add(noisePlane)

    /* ── decorative double border ── */
    ;[8, 16].forEach((offset, idx) => {
      const pts = [
        [-W / 2 + offset,  H / 2 - offset, 0],
        [ W / 2 - offset,  H / 2 - offset, 0],
        [ W / 2 - offset, -H / 2 + offset, 0],
        [-W / 2 + offset, -H / 2 + offset, 0],
        [-W / 2 + offset,  H / 2 - offset, 0],
      ].map(p => new THREE.Vector3(...p))
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: C.ink,
        transparent: true,
        opacity: idx === 0 ? 0.55 : 0.25,
      })))
    })

    /* ── title ── */
    const titleTex  = makeTitleTexture(W)
    const titleMat  = new THREE.SpriteMaterial({ map: titleTex, transparent: true })
    const title     = new THREE.Sprite(titleMat)
    title.scale.set(W * 0.66, 36, 1)
    title.position.set(0, H / 2 - 26, 0.5)
    scene.add(title)

    /* ── hole positions ── */
    const positions = buildPositions(n, W * 0.88, H * 0.78)

    /* ── dashed connector lines ── */
    for (let i = 0; i < n - 1; i++) {
      const { x: x1, y: y1 } = positions[i]
      const { x: x2, y: y2 } = positions[i + 1]
      const played = rows[i].swings.length > 0

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y1, 0.2),
        new THREE.Vector3(x2, y2, 0.2),
      ])
      const mat = new THREE.LineDashedMaterial({
        color:       played ? C.ink : C.inkFaint,
        dashSize:    played ? 8     : 6,
        gapSize:     played ? 5     : 7,
        transparent: true,
        opacity:     played ? 0.75  : 0.35,
      })
      const line = new THREE.Line(geo, mat)
      line.computeLineDistances()
      scene.add(line)
    }

    /* ── hole objects ── */
    positions.forEach(({ x, y }, i) => {
      const hole      = rows[i]
      const played    = hole.swings.length > 0
      const completed = hole.completed
      const diff      = played ? hole.swings.length - hole.par : null
      const R         = played ? 18 : 14

      // score-based palette helpers
      const scoreColor = () => {
        if (completed) return C.green
        if (!played)   return C.grey
        if (diff < 0)  return C.green
        if (diff === 0) return 0x1a6bb5
        return C.red
      }

      // shadow
      const shadowGeo = new THREE.CircleGeometry(R + 4, 32)
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
      const shadow    = new THREE.Mesh(shadowGeo, shadowMat)
      shadow.position.set(x + 3, y - 3, 0.25)
      scene.add(shadow)

      // circle fill — green when completed, score-tinted when played, grey when empty
      const circleMat = new THREE.MeshBasicMaterial({ color: scoreColor() })
      const circle    = new THREE.Mesh(new THREE.CircleGeometry(R, 32), circleMat)
      circle.position.set(x, y, 0.5)
      scene.add(circle)

      // rim ring — white for completed/played so it pops, ink for unplayed
      const rimColor = played ? C.white : C.ink
      const rimGeo  = new THREE.RingGeometry(R, R + 3, 32)
      const rimMat  = new THREE.MeshBasicMaterial({ color: rimColor, side: THREE.DoubleSide })
      const rim     = new THREE.Mesh(rimGeo, rimMat)
      rim.position.set(x, y, 0.6)
      scene.add(rim)

      // flag pole
      const poleH   = 28
      const pole    = new THREE.Mesh(
        new THREE.BoxGeometry(2, poleH, 1),
        new THREE.MeshBasicMaterial({ color: C.ink })
      )
      pole.position.set(x + R, y + R + poleH / 2, 0.7)
      scene.add(pole)

      // pennant triangle — matches hole colour
      const flagColor   = completed ? C.greenLight : played ? scoreColor() : C.grey
      const topY        = y + R + poleH
      const baseY       = y + R + poleH * 0.45
      const flagVerts   = new Float32Array([
        x + R,      topY,         0.8,
        x + R,      baseY,        0.8,
        x + R + 16, (topY + baseY) / 2, 0.8,
      ])
      const flagGeo = new THREE.BufferGeometry()
      flagGeo.setAttribute('position', new THREE.BufferAttribute(flagVerts, 3))
      scene.add(new THREE.Mesh(flagGeo, new THREE.MeshBasicMaterial({ color: flagColor, side: THREE.DoubleSide })))

      // number label sprite
      const numTex  = makeLabel(i + 1)
      const numMat  = new THREE.SpriteMaterial({ map: numTex, transparent: true })
      const numSpr  = new THREE.Sprite(numMat)
      numSpr.scale.set(R * 1.85, R * 1.85, 1)
      numSpr.position.set(x, y, 1)
      scene.add(numSpr)

      // strokes badge — bigger, with white rim, score-based colour
      if (played) {
        const badgeR     = 13
        const badgeColor = diff < 0 ? C.green : diff === 0 ? 0x1a6bb5 : C.red

        // white halo behind badge for contrast
        const haloMesh = new THREE.Mesh(
          new THREE.CircleGeometry(badgeR + 3, 24),
          new THREE.MeshBasicMaterial({ color: C.white })
        )
        haloMesh.position.set(x - R + 1, y + R - 1, 0.72)
        scene.add(haloMesh)

        // coloured badge circle
        const badge = new THREE.Mesh(
          new THREE.CircleGeometry(badgeR, 24),
          new THREE.MeshBasicMaterial({ color: badgeColor })
        )
        badge.position.set(x - R + 1, y + R - 1, 0.8)
        scene.add(badge)

        // stroke count label — larger sprite
        const badgeTex = makeLabel(hole.swings.length, '#fff')
        const badgeSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true }))
        badgeSpr.scale.set(badgeR * 2, badgeR * 2, 1)
        badgeSpr.position.set(x - R + 1, y + R - 1, 1.2)
        scene.add(badgeSpr)
      }
    })

    /* ── single render ── */
    renderer.render(scene, cam)

    return () => {
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [rows])

  return (
    <div
      ref={mountRef}
      className="treasure-map-container"
      style={{ width: '100%', height: 400 }}
    />
  )
}
