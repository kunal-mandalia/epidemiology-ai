import { useState } from 'react'
import type { CanonicalEvent, RawEvent } from '../types'

interface EventFeedProps {
  events: CanonicalEvent[]
  rawEvents: RawEvent[]
  selectedEventId: string | null
  onEventSelect: (eventId: string | null) => void
}

type ViewMode = 'canonical' | 'raw' | 'derivation'

export default function EventFeed({ events, rawEvents, selectedEventId, onEventSelect }: EventFeedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('canonical')

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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRawEvent = (rawEventId: string) => {
    return rawEvents.find(raw => raw.id === rawEventId)
  }

  const renderCanonicalView = (event: CanonicalEvent) => (
    <div>
      <div className="event-meta">
        <span className="event-time">{formatTime(event.timestamp)}</span>
        <span className="event-location">{event.location.name}</span>
        <span className="event-confidence">Confidence: {(event.confidence * 100).toFixed(0)}%</span>
      </div>
      <div className="event-description">{event.metadata.description}</div>
      <div className="event-signal">Signal: {event.signal_value.toFixed(2)}</div>
    </div>
  )

  const renderRawView = (event: CanonicalEvent) => {
    const rawEvent = getRawEvent(event.raw_event_ids[0])
    if (!rawEvent) return <div>Raw data not available</div>

    if (rawEvent.type === 'twitter') {
      const data = rawEvent.data as any
      return (
        <div>
          <div className="raw-twitter">
            <div className="tweet-text">{data.text}</div>
            <div className="tweet-metrics">
              👍 {data.public_metrics.like_count} | 
              🔄 {data.public_metrics.retweet_count} | 
              💬 {data.public_metrics.reply_count}
            </div>
          </div>
        </div>
      )
    }

    if (rawEvent.type === 'news') {
      const data = rawEvent.data as any
      return (
        <div>
          <div className="raw-news">
            <div className="news-headline">{data.headline}</div>
            <div className="news-source">{data.source_outlet}</div>
            <div className="news-excerpt">{data.article_text.substring(0, 200)}...</div>
          </div>
        </div>
      )
    }

    if (rawEvent.type === 'hospital') {
      const data = rawEvent.data as any
      return (
        <div>
          <div className="raw-hospital">
            <div className="hospital-complaint">{data.chief_complaint}</div>
            <div className="hospital-notes">{data.clinical_notes.substring(0, 150)}...</div>
            <div className="hospital-codes">Codes: {data.diagnosis_codes.join(', ')}</div>
          </div>
        </div>
      )
    }

    return <div>Unknown raw event type</div>
  }

  const renderDerivationView = (event: CanonicalEvent) => (
    <div>
      <div className="derivation-steps">
        <h4>AI Processing Steps:</h4>
        <ol>
          <li>Raw data ingestion from {event.source_type} source</li>
          <li>NLP extraction of key entities and sentiment</li>
          {event.event_type.includes('health') && <li>Health signal classification (GI symptoms detected)</li>}
          {event.location && <li>Geolocation inference: {event.location.name}</li>}
          <li>Confidence scoring: {(event.confidence * 100).toFixed(0)}%</li>
          <li>Signal strength calculation: {event.signal_value.toFixed(2)}</li>
        </ol>
      </div>
    </div>
  )

  return (
    <div className="event-feed">
      <div className="feed-header">
        <div className="view-toggle">
          <button 
            className={viewMode === 'canonical' ? 'active' : ''}
            onClick={() => setViewMode('canonical')}
          >
            Canonical
          </button>
          <button 
            className={viewMode === 'raw' ? 'active' : ''}
            onClick={() => setViewMode('raw')}
          >
            Raw Source
          </button>
          <button 
            className={viewMode === 'derivation' ? 'active' : ''}
            onClick={() => setViewMode('derivation')}
          >
            AI Derivation
          </button>
        </div>
      </div>

      <div className="events-list">
        {events.slice().reverse().map((event) => (
          <div
            key={event.id}
            className={`event-card ${selectedEventId === event.id ? 'selected' : ''}`}
            onClick={() => onEventSelect(selectedEventId === event.id ? null : event.id)}
          >
            <div 
              className="event-type-indicator" 
              style={{ backgroundColor: getEventTypeColor(event.event_type) }}
            />
            <div className="event-content">
              <div className="event-header">
                <span className="event-type">{event.event_type.replace('_', ' ').toUpperCase()}</span>
                <span className="event-source">{event.source_type}</span>
              </div>
              
              {viewMode === 'canonical' && renderCanonicalView(event)}
              {viewMode === 'raw' && renderRawView(event)}
              {viewMode === 'derivation' && renderDerivationView(event)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}