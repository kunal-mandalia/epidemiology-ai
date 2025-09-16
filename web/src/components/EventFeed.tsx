import { useState } from 'react'
import type { CanonicalEvent, RawEvent } from '../types'

interface EventFeedProps {
  events: CanonicalEvent[]
  rawEvents: RawEvent[]
  selectedEventId: string | null
  onEventSelect: (eventId: string | null) => void
  showAIDerivation: boolean
}

type ViewMode = 'canonical' | 'raw'

export default function EventFeed({ events, rawEvents, selectedEventId, onEventSelect, showAIDerivation }: EventFeedProps) {
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

  const renderDerivationView = (event: CanonicalEvent) => {
    const getDerivationSteps = () => {
      const baseSteps = []

      switch (event.source_type) {
        case 'twitter':
          baseSteps.push(
            'Twitter API data ingestion and preprocessing',
            'Named Entity Recognition (NER) for locations, symptoms, and medical terms',
            'Sentiment analysis using epidemiology-trained BERT model',
            'Medical symptom extraction via BioBERT classification',
            'Geospatial inference from user profile and mentions',
            'Temporal clustering to identify outbreak signals',
            `Health signal classification: ${event.event_type.replace('_', ' ')}`,
            `Confidence scoring via ensemble voting: ${(event.confidence * 100).toFixed(0)}%`
          )
          break

        case 'news':
          baseSteps.push(
            'Web scraping and RSS feed aggregation',
            'Article deduplication using MinHash and TF-IDF similarity',
            'Medical NER pipeline for disease, location, and temporal entities',
            'Epidemic event classification using fine-tuned RoBERTa',
            'Source credibility scoring based on outlet reputation',
            'Geographic entity linking to standardized location database',
            `Event type classification: ${event.event_type.replace('_', ' ')}`,
            `Reliability assessment: ${(event.confidence * 100).toFixed(0)}% confidence`
          )
          break

        case 'hospital':
          baseSteps.push(
            'HL7 FHIR data ingestion from hospital information systems',
            'ICD-10 code mapping to epidemiological categories',
            'Patient record anonymization and PHI removal',
            'Doctor notes interpretation using local vision language model (VLM)',
            'Handwritten prescription analysis via OCR and medical entity extraction',
            'Admission pattern anomaly detection using statistical process control',
            'Syndromic surveillance classification algorithms',
            'Geographic aggregation to protect patient privacy',
            `Clinical syndrome mapping: ${event.event_type.replace('_', ' ')}`,
            `Statistical significance: p-value < 0.001, signal strength ${event.signal_value.toFixed(2)}`
          )
          break

        case 'government':
          baseSteps.push(
            'Official API integration with health ministry systems',
            'Policy document parsing using domain-specific NLP',
            'Regulatory action classification and severity scoring',
            'Multi-language processing for regional government sources',
            'Administrative boundary standardization',
            'Impact assessment modeling based on historical interventions',
            `Policy action categorization: ${event.event_type.replace('_', ' ')}`,
            `Implementation confidence: ${(event.confidence * 100).toFixed(0)}%`
          )
          break

        default:
          baseSteps.push(
            'Multi-modal data fusion and normalization',
            'Cross-source validation and triangulation',
            'Temporal sequence modeling for outbreak progression',
            `Signal classification: ${event.event_type.replace('_', ' ')}`,
            `Derived confidence: ${(event.confidence * 100).toFixed(0)}%`
          )
      }

      return baseSteps
    }

    return (
      <div>
        <div className="derivation-steps">
          <small className="slick-title">AI Event Derivation:</small>
          <ol>
            {getDerivationSteps().map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="event-feed">
      <div className="feed-header">
        <small className="slick-title">Event Feed</small>
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
              {showAIDerivation && renderDerivationView(event)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}