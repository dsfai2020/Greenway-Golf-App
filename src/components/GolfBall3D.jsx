import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/** Draw a flat-topped hexagon path centred at (cx, cy) with circumradius r */
function hexPath(ctx, cx, cy, r) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6   // flat-top orientation
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
}

/** Canvas bump-map with hexagonal dimples in a hex-packed grid */
function createDimpleTexture(size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  // White = raised land between dimples
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  const cols    = 38                    // dimples per row — ~350 total like a real ball
  const spacing = size / cols           // centre-to-centre distance
  // For a flat-top hex in a hex grid the circumradius that packs tightly
  // is spacing/√3 * 0.92 (thin ridge visible between each hex)
  const r = (spacing / Math.sqrt(3)) * 0.90

  // Row height for a flat-top hex grid = spacing * √3/2
  const rowH = spacing * Math.sqrt(3) / 2

  const numRows = Math.ceil(size / rowH) + 2

  for (let row = 0; row < numRows; row++) {
    const yc   = (row - 0.5) * rowH
    const xOff = (row % 2) * spacing * 0.5   // offset every other row
    for (let col = 0; col < cols + 2; col++) {
      const xc = col * spacing + xOff - spacing * 0.5

      // Paint the concave gradient inside the hex shape
      const grad = ctx.createRadialGradient(xc, yc, 0, xc, yc, r)
      grad.addColorStop(0,    '#000000')   // deep centre
      grad.addColorStop(0.50, '#111111')
      grad.addColorStop(0.72, '#555555')
      grad.addColorStop(0.88, '#bbbbbb')
      grad.addColorStop(1,    '#ffffff')   // sharp ridge edge back to white

      ctx.save()
      hexPath(ctx, xc, yc, r)
      ctx.clip()
      hexPath(ctx, xc, yc, r)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }
  }
  return new THREE.CanvasTexture(canvas)
}

/** Subtle enviroment gradient reflected in the ball */
function createEnvTexture() {
  const c = document.createElement('canvas')
  c.width = 64; c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0,   '#d0e8f0')
  g.addColorStop(0.5, '#ffffff')
  g.addColorStop(1,   '#84c47a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

export default function GolfBall3D({ size = 300 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = size, H = size

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    /* ── scene ── */
    const scene = new THREE.Scene()
    scene.background = null // transparent

    /* ── camera ── */
    const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    cam.position.set(0, 0.25, 3.6)

    /* ── lighting ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))

    const key = new THREE.DirectionalLight(0xfff5e8, 1.8)
    key.position.set(4, 6, 4)
    key.castShadow = true
    scene.add(key)

    const fill = new THREE.DirectionalLight(0x99c0ff, 0.35)
    fill.position.set(-4, -2, 2)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffffff, 0.4)
    rim.position.set(0, -5, -3)
    scene.add(rim)

    /* ── golf ball ── */
    const bumpTex = createDimpleTexture(1024)
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping

    const envTex = createEnvTexture()

    const ballGeo = new THREE.SphereGeometry(1, 256, 256)
    const ballMat = new THREE.MeshStandardMaterial({
      color:       0xf8f8f5,
      roughness:   0.65,
      metalness:   0.0,
      bumpMap:     bumpTex,
      bumpScale:   0.32,
      displacementMap:   bumpTex,
      displacementScale: -0.042,   // push dimples inward
      displacementBias:   0.022,
      envMap:      envTex,
      envMapIntensity: 0.25,
    })
    const ball = new THREE.Mesh(ballGeo, ballMat)
    ball.castShadow    = true
    ball.receiveShadow = false
    scene.add(ball)

    /* ── subtle ground shadow disc ── */
    const shadowGeo = new THREE.CircleGeometry(1.1, 48)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.18, side: THREE.FrontSide
    })
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat)
    shadowDisc.rotation.x = -Math.PI / 2
    shadowDisc.position.set(0.12, -1.12, 0)
    scene.add(shadowDisc)

    /* ── interaction state ── */
    let isDragging = false
    let prev       = { x: 0, y: 0 }
    let vel        = { x: 0, y: 0 }

    const canvas = renderer.domElement

    function startDrag(x, y) {
      isDragging = true
      prev = { x, y }
      vel  = { x: 0, y: 0 }
      canvas.style.cursor = 'grabbing'
    }
    function moveDrag(x, y) {
      if (!isDragging) return
      const dx = x - prev.x
      const dy = y - prev.y
      vel = { x: dy * 0.012, y: dx * 0.012 }
      ball.rotation.x += vel.x
      ball.rotation.y += vel.y
      prev = { x, y }
    }
    function endDrag() {
      isDragging = false
      canvas.style.cursor = 'grab'
    }

    canvas.addEventListener('mousedown',  e => startDrag(e.clientX, e.clientY))
    window.addEventListener('mousemove',  e => moveDrag(e.clientX, e.clientY))
    window.addEventListener('mouseup',    endDrag)

    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0]
      startDrag(t.clientX, t.clientY)
    }, { passive: true })
    canvas.addEventListener('touchmove', e => {
      e.preventDefault()
      const t = e.touches[0]
      moveDrag(t.clientX, t.clientY)
    }, { passive: false })
    canvas.addEventListener('touchend', endDrag)

    /* ── animation loop ── */
    let raf
    function tick() {
      raf = requestAnimationFrame(tick)
      if (!isDragging) {
        vel.x *= 0.92
        vel.y *= 0.92
        ball.rotation.x += vel.x
        ball.rotation.y += vel.y
        // idle auto-spin when nearly still
        if (Math.abs(vel.x) < 0.0003 && Math.abs(vel.y) < 0.0003) {
          ball.rotation.y += 0.004
          ball.rotation.x += 0.0008
        }
      }
      renderer.render(scene, cam)
    }
    tick()

    /* ── cleanup ── */
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousedown', startDrag)
      window.removeEventListener('mousemove', moveDrag)
      window.removeEventListener('mouseup', endDrag)
      canvas.removeEventListener('touchstart', startDrag)
      canvas.removeEventListener('touchmove', moveDrag)
      canvas.removeEventListener('touchend', endDrag)
      renderer.dispose()
      bumpTex.dispose()
      envTex.dispose()
      if (el.contains(canvas)) el.removeChild(canvas)
    }
  }, [size])

  return (
    <div
      ref={mountRef}
      className="golf-ball-3d"
      style={{ width: size, height: size, cursor: 'grab', display: 'inline-block' }}
    />
  )
}
