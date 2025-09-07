import { useState } from 'react'
import type { CanonicalEvent } from '../types'

interface AISummaryProps {
  events: CanonicalEvent[]
  currentDate: Date
}

export default function AISummary({ events, currentDate }: AISummaryProps) {
  const [showEventsByType, setShowEventsByType] = useState(false)
  const [showEventsBySource, setShowEventsBySource] = useState(false)

  const eventsByType = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const eventsBySource = events.reduce((acc, event) => {
    acc[event.source_type] = (acc[event.source_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="ai-summary">
      <h2>AI Summary & Predictions</h2>
      
      <div className="summary-section">
        <h3>Current Status</h3>
        <p><strong>Total Events Detected:</strong> {events.length}</p>
        <p><strong>Analysis Date:</strong> {currentDate.toLocaleDateString()}</p>
      </div>

      <div className="summary-section">
        <h3 onClick={() => setShowEventsByType(!showEventsByType)} className="collapsible-header">
          Events by Type <span className={`expand-icon ${showEventsByType ? 'expanded' : ''}`}>▼</span>
        </h3>
        {showEventsByType && (
          <ul>
            <li>Social Media Health Signals: {eventsByType.social_media_health_signal || 0}</li>
            <li>Hospital Admissions: {eventsByType.hospital_admission || 0}</li>
            <li>Vector Signals: {eventsByType.vector_signal || 0}</li>
            <li>Flood Events: {eventsByType.flood || 0}</li>
            <li>Weather Events: {eventsByType.weather || 0}</li>
            <li>Mortality: {eventsByType.mortality || 0}</li>
            <li>Policy Actions: {eventsByType.policy_action || 0}</li>
          </ul>
        )}
      </div>

      <div className="summary-section">
        <h3 onClick={() => setShowEventsBySource(!showEventsBySource)} className="collapsible-header">
          Data Sources <span className={`expand-icon ${showEventsBySource ? 'expanded' : ''}`}>▼</span>
        </h3>
        {showEventsBySource && (
          <ul>
            <li>News: {eventsBySource.news || 0}</li>
            <li>Social Media: {eventsBySource.twitter || 0}</li>
            <li>Hospital: {eventsBySource.hospital || 0}</li>
            <li>Government: {eventsBySource.government || 0}</li>
          </ul>
        )}
      </div>

      <div className="summary-section">
        <h3>Early Warning Signals</h3>
        {events.some(e => e.event_type === 'social_media_health_signal') && (
          <div className="warning">⚠️ GI symptoms increasing in social media reports</div>
        )}
        {events.some(e => e.event_type === 'mortality') && (
          <div className="alert">🚨 Mortality event detected - immediate intervention needed</div>
        )}
        {events.some(e => e.event_type === 'policy_action') && (
          <div className="info">ℹ️ Policy response measures deployed</div>
        )}
      </div>
    </div>
  )
}