import { useRef, useEffect, useState } from 'react'
import type { CanonicalEvent } from '../types'
import worldMapSvg from '../assets/world-map.svg'

interface MapViewProps {
  events: CanonicalEvent[]
  selectedEventId: string | null
  onEventSelect: (eventId: string | null) => void
}

export default function MapView({ events, selectedEventId, onEventSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string>('')
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })


  useEffect(() => {
    fetch(worldMapSvg)
      .then(response => response.text())
      .then(text => setSvgContent(text))
      .catch(error => console.error('Error loading SVG:', error))
  }, [])

  useEffect(() => {
    if (!svgContent || !containerRef.current) return

    const container = containerRef.current
    container.innerHTML = svgContent

    const svgElement = container.querySelector('svg')
    if (!svgElement) return

    // Use full world map viewBox initially
    // Original viewBox: "82.992 45.607 2528.5721 1238.9154"
    const baseViewBox = "82.992 45.607 2528.5721 1238.9154"
    svgElement.setAttribute('viewBox', baseViewBox)
    svgElement.setAttribute('class', 'map-svg')
    
    // Add pan and zoom container
    const mapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    mapGroup.setAttribute('class', 'map-transform-group')

    // Add dark blue background rectangle to the transform group
    const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    backgroundRect.setAttribute('x', '82.992')
    backgroundRect.setAttribute('y', '45.607')
    backgroundRect.setAttribute('width', '2528.5721')
    backgroundRect.setAttribute('height', '1238.9154')
    // backgroundRect.setAttribute('fill', 'white')
    mapGroup.appendChild(backgroundRect)

    // Move all existing content into the transform group
    while (svgElement.firstChild) {
      mapGroup.appendChild(svgElement.firstChild)
    }

    // Style all land areas with brown fill color
    const allShapes = mapGroup.querySelectorAll('path, polygon, circle, ellipse, rect')

    allShapes.forEach(shape => {
      // Skip the background rectangle we added
      if (shape === backgroundRect) return

      // Force all shapes to be brown (land areas)
      shape.setAttribute('fill', '#8B4513')
      shape.style.fill = '#8B4513'
    })

    // Add comprehensive CSS to override any existing styles
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = `
      .map-transform-group * {
        fill: #8B4513 !important;
      }
      .map-transform-group rect[fill="#2563eb"] {
        fill: #2563eb !important;
      }
    `
    mapGroup.appendChild(style)

    svgElement.appendChild(mapGroup)

    // Apply current transform
    updateTransform(mapGroup, transform)

    // Add event listeners for pan and zoom
    const cleanup = setupPanZoom(svgElement, mapGroup)

    // Add event markers
    addEventMarkers(mapGroup)

    // Cleanup on unmount
    return cleanup
  }, [svgContent])

  // Update markers when events, selection, or transform changes
  useEffect(() => {
    if (!containerRef.current) return
    const mapGroup = containerRef.current.querySelector('.map-transform-group') as SVGGElement
    if (mapGroup) {
      addEventMarkers(mapGroup)
    }
  }, [events, selectedEventId, transform])

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      weather: '#FF6B6B',
      flood: '#4ECDC4', 
      vector_signal: '#45B7D1',
      social_media_health_signal: '#96CEB4',
      hospital_admission: '#FFEAA7',
      mortality: '#DDA0DD',
      policy_action: '#FDA085'
    }
    return colors[type] || '#ccc'
  }

  // Convert lat/lon to SVG coordinates for world map
  const latLonToSvg = (lat: number, lon: number) => {
    // World map bounds from original viewBox: "82.992 45.607 2528.5721 1238.9154"
    // These represent the geographic bounds of the world map
    const worldMinLat = -60, worldMaxLat = 85  // Approximate world latitude bounds
    const worldMinLon = -180, worldMaxLon = 180 // World longitude bounds
    const viewBoxX = 82.992, viewBoxY = 45.607, viewBoxWidth = 2528.5721, viewBoxHeight = 1238.9154
    
    const x = viewBoxX + ((lon - worldMinLon) / (worldMaxLon - worldMinLon)) * viewBoxWidth
    const y = viewBoxY + viewBoxHeight - ((lat - worldMinLat) / (worldMaxLat - worldMinLat)) * viewBoxHeight
    
    return { x, y }
  }

  const setupPanZoom = (svgElement: SVGElement, mapGroup: SVGGElement) => {
    let currentTransform = { ...transform }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = svgElement.getBoundingClientRect()
      
      // Get mouse position relative to the SVG container
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.min(Math.max(currentTransform.scale * scaleFactor, 0.5), 20)
      
      // Calculate new position to zoom toward mouse cursor
      const scaleChange = newScale / currentTransform.scale
      const newX = mouseX - (mouseX - currentTransform.x) * scaleChange
      const newY = mouseY - (mouseY - currentTransform.y) * scaleChange
      
      currentTransform = { x: newX, y: newY, scale: newScale }
      setTransform(currentTransform)
      updateTransform(mapGroup, currentTransform)
    }

    let isDraggingLocal = false
    let dragStartLocal = { x: 0, y: 0 }

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element
      // Don't start dragging if clicking on a marker
      if (target.closest('.event-marker-group')) return
      
      isDraggingLocal = true
      const panSensitivity = 2.0
      dragStartLocal = { x: e.clientX - (currentTransform.x / panSensitivity), y: e.clientY - (currentTransform.y / panSensitivity) }
      svgElement.style.cursor = 'grabbing'
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingLocal) return

      const panSensitivity = 2.0
      const newX = (e.clientX - dragStartLocal.x) * panSensitivity
      const newY = (e.clientY - dragStartLocal.y) * panSensitivity

      currentTransform = { ...currentTransform, x: newX, y: newY }
      setTransform(currentTransform)
      updateTransform(mapGroup, currentTransform)
    }

    const handleMouseUp = () => {
      isDraggingLocal = false
      svgElement.style.cursor = 'grab'
    }

    svgElement.addEventListener('wheel', handleWheel, { passive: false })
    svgElement.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    svgElement.style.cursor = 'grab'

    // Cleanup function
    return () => {
      svgElement.removeEventListener('wheel', handleWheel)
      svgElement.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }

  const updateTransform = (element: SVGGElement, transform: { x: number; y: number; scale: number }) => {
    element.setAttribute('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`)
  }

  const addEventMarkers = (mapGroup: SVGGElement) => {
    // Remove existing markers
    const existingMarkers = mapGroup.querySelectorAll('.event-marker-group')
    existingMarkers.forEach(marker => marker.remove())

    events.forEach((event) => {
      const { x, y } = latLonToSvg(event.location.lat, event.location.lon)
      const baseRadius = 8 + (event.signal_value * 12)
      // Scale radius inversely with zoom level to maintain consistent visual size
      const radius = baseRadius / transform.scale
      const opacity = 0.6 + (event.confidence * 0.4)
      
      const markerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      markerGroup.setAttribute('class', 'event-marker-group')
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x.toString())
      circle.setAttribute('cy', y.toString())
      circle.setAttribute('r', radius.toString())
      circle.setAttribute('fill', getEventTypeColor(event.event_type))
      circle.setAttribute('opacity', opacity.toString())
      circle.setAttribute('stroke', selectedEventId === event.id ? '#000' : '#fff')
      // Scale stroke width inversely with zoom level
      circle.setAttribute('stroke-width', ((selectedEventId === event.id ? 2 : 1) / transform.scale).toString())
      circle.style.cursor = 'pointer'

      // Add pulsing animation to the latest event
      const isLatestEvent = events.length > 0 && event === events.reduce((latest, current) =>
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      )

      if (isLatestEvent) {
        const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
        animateElement.setAttribute('attributeName', 'r')
        animateElement.setAttribute('values', `${radius};${radius * 1.3};${radius}`)
        animateElement.setAttribute('dur', '2s')
        animateElement.setAttribute('repeatCount', 'indefinite')
        circle.appendChild(animateElement)
      }
      
      circle.addEventListener('click', (e) => {
        e.stopPropagation()
        onEventSelect(selectedEventId === event.id ? null : event.id)
      })
      
      markerGroup.appendChild(circle)
      
      if (selectedEventId === event.id) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', (x + radius + 5).toString())
        text.setAttribute('y', (y - radius).toString())
        // Scale font size inversely with zoom level
        text.setAttribute('font-size', (40 / transform.scale).toString())
        text.setAttribute('fill', '#333')
        text.style.pointerEvents = 'none'
        text.textContent = event.location.name
        markerGroup.appendChild(text)
      }
      
      mapGroup.appendChild(markerGroup)
    })
  }

  const resetZoom = () => {
    const newTransform = { x: 0, y: 0, scale: 1 }
    setTransform(newTransform)
    const container = containerRef.current
    if (container) {
      const mapGroup = container.querySelector('.map-transform-group') as SVGGElement
      if (mapGroup) {
        updateTransform(mapGroup, newTransform)
      }
    }
  }

  const zoomIn = () => {
    const container = containerRef.current
    if (container) {
      const mapGroup = container.querySelector('.map-transform-group') as SVGGElement
      if (mapGroup) {
        const rect = container.getBoundingClientRect()
        // Zoom toward center of visible area
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const scaleFactor = 1.2
        const newScale = Math.min(transform.scale * scaleFactor, 20)

        // Calculate new position to zoom toward center of current view
        const scaleChange = newScale / transform.scale
        const newX = transform.x + (centerX - transform.x) * (1 - scaleChange)
        const newY = transform.y + (centerY - transform.y) * (1 - scaleChange)

        const newTransform = { x: newX, y: newY, scale: newScale }
        setTransform(newTransform)
        updateTransform(mapGroup, newTransform)
      }
    }
  }

  const zoomOut = () => {
    const container = containerRef.current
    if (container) {
      const mapGroup = container.querySelector('.map-transform-group') as SVGGElement
      if (mapGroup) {
        const rect = container.getBoundingClientRect()
        // Zoom toward center of visible area
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const scaleFactor = 0.8
        const newScale = Math.max(transform.scale * scaleFactor, 0.5)

        // Calculate new position to zoom toward center of current view
        const scaleChange = newScale / transform.scale
        const newX = transform.x + (centerX - transform.x) * (1 - scaleChange)
        const newY = transform.y + (centerY - transform.y) * (1 - scaleChange)

        const newTransform = { x: newX, y: newY, scale: newScale }
        setTransform(newTransform)
        updateTransform(mapGroup, newTransform)
      }
    }
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <div className="map-title-controls">
          <h3>Geographic Distribution</h3>
          <div className="map-controls">
            <button onClick={zoomIn} className="map-control-btn" title="Zoom In">+</button>
            <button onClick={zoomOut} className="map-control-btn" title="Zoom Out">−</button>
            <button onClick={resetZoom} className="map-control-btn" title="Reset Zoom">⌂</button>
          </div>
        </div>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#FF6B6B'}}></div>
            <span>Weather</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#4ECDC4'}}></div>
            <span>Flood</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#96CEB4'}}></div>
            <span>Health Signal</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#FFEAA7'}}></div>
            <span>Hospital</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#DDA0DD'}}></div>
            <span>Mortality</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#FDA085'}}></div>
            <span>Policy</span>
          </div>
        </div>
      </div>

      <div className="map-container">
        <div ref={containerRef} className="world-map-container">
          {!svgContent && <div className="loading">Loading map...</div>}
        </div>
      </div>
      
      <div className="map-info">
        <p>Drag to pan • Scroll to zoom • Click markers for details</p>
        <p>Showing {events.length} events • Zoom: {Math.round(transform.scale * 100)}% • Philippines: ~15°N, 120°E</p>
      </div>
    </div>
  )
}