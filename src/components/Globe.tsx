'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { Country } from '@/hooks/useData'

interface GlobeProps {
  countries: Country[]
  selectedId: string | null
  onSelect: (country: Country | null) => void
}

const NUMERIC_MAP: Record<number, true> = {}

export default function Globe({ countries, selectedId, onSelect }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    world: null as any,
    rotation: [15, -20, 0] as [number, number, number],
    dragging: false,
    lastPos: [0, 0] as [number, number],
    hovered: null as Country | null,
    animId: 0,
    countries: [] as Country[],
    selectedId: null as string | null,
  })

  const visitedSet = useRef<Map<number, Country>>(new Map())

  useEffect(() => {
    visitedSet.current = new Map(countries.map(c => [c.numeric_id, c]))
    stateRef.current.countries = countries
  }, [countries])

  useEffect(() => {
    stateRef.current.selectedId = selectedId
  }, [selectedId])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !stateRef.current.world) return

    const { rotation, hovered, selectedId } = stateRef.current
    const W = canvas.width
    const H = canvas.height
    const scale = Math.min(W, H) * 0.44

    const projection = d3.geoOrthographic()
      .scale(scale)
      .translate([W / 2, H / 2])
      .rotate(rotation)
      .clipAngle(90)

    const path = d3.geoPath(projection, ctx)
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    // Ocean
    ctx.beginPath()
    path({ type: 'Sphere' } as any)
    const oceanGrad = ctx.createRadialGradient(W * 0.4, H * 0.35, 0, W / 2, H / 2, scale)
    oceanGrad.addColorStop(0, isDark ? '#1a2f3a' : '#c8dff0')
    oceanGrad.addColorStop(1, isDark ? '#0a1520' : '#8ab8d8')
    ctx.fillStyle = oceanGrad
    ctx.fill()

    // Graticule
    ctx.beginPath()
    path(d3.geoGraticule()())
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Countries
    const features = stateRef.current.world.features
    features.forEach((f: any) => {
      const numId = parseInt(f.id)
      const visited = visitedSet.current.get(numId)
      const isSelected = visited && visited.id === selectedId
      const isHovered = visited && hovered && visited.id === hovered.id

      ctx.beginPath()
      path(f)

      if (isSelected) {
        ctx.fillStyle = isDark ? '#e8b86d' : '#c8913a'
      } else if (isHovered) {
        ctx.fillStyle = isDark ? '#d4a55a' : '#d4a020'
      } else if (visited) {
        ctx.fillStyle = isDark ? '#b8914e' : '#9e7a30'
      } else {
        ctx.fillStyle = isDark ? '#2a3530' : '#d4cfc4'
      }
      ctx.fill()

      ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 0.4
      ctx.stroke()
    })

    // Globe border
    ctx.beginPath()
    path({ type: 'Sphere' } as any)
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Atmosphere glow
    ctx.beginPath()
    path({ type: 'Sphere' } as any)
    const atmo = ctx.createRadialGradient(W * 0.38, H * 0.32, scale * 0.9, W / 2, H / 2, scale * 1.05)
    atmo.addColorStop(0, 'rgba(0,0,0,0)')
    atmo.addColorStop(1, isDark ? 'rgba(232,184,109,0.08)' : 'rgba(180,140,60,0.12)')
    ctx.fillStyle = atmo
    ctx.fill()
  }, [])

  const getCountryAtPoint = useCallback((x: number, y: number): Country | null => {
    const canvas = canvasRef.current
    if (!canvas || !stateRef.current.world) return null

    const scale = Math.min(canvas.width, canvas.height) * 0.44
    const projection = d3.geoOrthographic()
      .scale(scale)
      .translate([canvas.width / 2, canvas.height / 2])
      .rotate(stateRef.current.rotation)
      .clipAngle(90)

    const coords = projection.invert?.([x, y])
    if (!coords) return null

    for (const f of stateRef.current.world.features) {
      if (d3.geoContains(f, coords)) {
        const numId = parseInt(f.id)
        return visitedSet.current.get(numId) || null
      }
    }
    return null
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then((world: Topology) => {
        if (cancelled) return
        const geo = feature(world, (world.objects as any).countries)
        stateRef.current.world = geo
        draw()
      })
    return () => { cancelled = true }
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const size = Math.min(canvas.parentElement?.clientWidth || 500, 500)
      canvas.width = size
      canvas.height = size
      draw()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    resize()

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (canvas.width / rect.width)
      const y = (e.clientY - rect.top) * (canvas.height / rect.height)

      if (stateRef.current.dragging) {
        const dx = e.clientX - stateRef.current.lastPos[0]
        const dy = e.clientY - stateRef.current.lastPos[1]
        stateRef.current.rotation[0] += dx * 0.35
        stateRef.current.rotation[1] = Math.max(-85, Math.min(85, stateRef.current.rotation[1] - dy * 0.35))
        stateRef.current.lastPos = [e.clientX, e.clientY]
        draw()
        return
      }

      const found = getCountryAtPoint(x, y)
      if (found?.id !== stateRef.current.hovered?.id) {
        stateRef.current.hovered = found
        canvas.style.cursor = found ? 'pointer' : 'grab'
        draw()
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      stateRef.current.dragging = true
      stateRef.current.lastPos = [e.clientX, e.clientY]
      canvas.style.cursor = 'grabbing'
    }

    const onMouseUp = () => {
      stateRef.current.dragging = false
      canvas.style.cursor = 'grab'
    }

    const onClick = (e: MouseEvent) => {
      if (Math.abs(e.clientX - stateRef.current.lastPos[0]) > 4) return
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (canvas.width / rect.width)
      const y = (e.clientY - rect.top) * (canvas.height / rect.height)
      const found = getCountryAtPoint(x, y)
      onSelect(found)
    }

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      stateRef.current.dragging = true
      stateRef.current.lastPos = [t.clientX, t.clientY]
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - stateRef.current.lastPos[0]
      const dy = t.clientY - stateRef.current.lastPos[1]
      stateRef.current.rotation[0] += dx * 0.35
      stateRef.current.rotation[1] = Math.max(-85, Math.min(85, stateRef.current.rotation[1] - dy * 0.35))
      stateRef.current.lastPos = [t.clientX, t.clientY]
      draw()
    }

    const onTouchEnd = () => { stateRef.current.dragging = false }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [draw, getCountryAtPoint, onSelect])

  // Redraw when selection changes
  useEffect(() => { draw() }, [selectedId, draw])

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: '50%', cursor: 'grab', display: 'block', width: '100%', height: 'auto' }}
      aria-label="Interactive globe showing visited countries"
    />
  )
}
