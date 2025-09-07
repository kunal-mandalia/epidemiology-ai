import { useRef } from 'react'
import type { CanonicalEvent } from '../types'

interface MapViewProps {
  events: CanonicalEvent[]
  selectedEventId: string | null
  onEventSelect: (eventId: string | null) => void
}

export default function MapView({ events, selectedEventId, onEventSelect }: MapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)

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

  // Convert lat/lon to SVG coordinates for Philippines region
  const latLonToSvg = (lat: number, lon: number) => {
    // Focus on Philippines region: roughly 14-16°N, 119-121°E
    const minLat = 14, maxLat = 16
    const minLon = 119, maxLon = 121
    const width = 800, height = 400
    
    const x = ((lon - minLon) / (maxLon - minLon)) * width
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height
    
    return { x, y }
  }

  const renderMarkers = () => {
    return events.map((event) => {
      const { x, y } = latLonToSvg(event.location.lat, event.location.lon)
      const radius = 4 + (event.signal_value * 8) // Size based on signal strength
      const opacity = 0.6 + (event.confidence * 0.4) // Opacity based on confidence
      
      return (
        <g key={event.id}>
          <circle
            cx={x}
            cy={y}
            r={radius}
            fill={getEventTypeColor(event.event_type)}
            opacity={opacity}
            stroke={selectedEventId === event.id ? '#000' : '#fff'}
            strokeWidth={selectedEventId === event.id ? 2 : 1}
            style={{ cursor: 'pointer' }}
            onClick={() => onEventSelect(selectedEventId === event.id ? null : event.id)}
          />
          {selectedEventId === event.id && (
            <text
              x={x + radius + 5}
              y={y - radius}
              fontSize="12"
              fill="#333"
              style={{ pointerEvents: 'none' }}
            >
              {event.location.name}
            </text>
          )}
        </g>
      )
    })
  }

  return (
    <div className="map-view">
      <h3>Geographic Distribution</h3>
      
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

      <div className="map-container">
        <svg
          ref={svgRef}
          width="800"
          height="400"
          viewBox="0 0 800 400"
          className="map-svg"
        >
          {/* Simplified Philippines coastline */}
          <rect x="0" y="0" width="800" height="400" fill="#e6f3ff" />
          
          {/* Zambales coastline (approximate) */}
          <path
            d="M 100 150 Q 200 120 300 140 L 350 180 Q 300 200 250 190 Q 150 180 100 150 Z"
            fill="#f0e68c"
            stroke="#8b7355"
            strokeWidth="1"
          />
          
          {/* Olongapo area */}
          <path
            d="M 450 250 Q 550 230 600 250 L 620 280 Q 580 300 520 290 Q 470 280 450 250 Z"
            fill="#deb887"
            stroke="#8b7355"
            strokeWidth="1"
          />
          
          {/* Labels */}
          <text x="200" y="170" fontSize="14" fill="#333" textAnchor="middle">Zambales</text>
          <text x="535" y="270" fontSize="14" fill="#333" textAnchor="middle">Olongapo</text>
          
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ddd" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Event markers */}
          {renderMarkers()}
        </svg>
      </div>
      
      <div className="map-info">
        <p>Click markers for details • Size = signal strength • Opacity = confidence</p>
        <p>Showing {events.length} events</p>
      </div>
    </div>
  )
}