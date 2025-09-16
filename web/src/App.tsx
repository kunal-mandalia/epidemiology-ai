import { useState, useEffect } from 'react'
import './App.css'
import type { CanonicalEvent, RawEvent } from './types'
import AISummary from './components/AISummary'
import Timeline from './components/Timeline'
import EventFeed from './components/EventFeed'
import MapView from './components/MapView'
import canonicalEventsData from './data/canonical-events.json'
import rawEventsData from './data/raw-events.json'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-01T06:00:00.000Z'))
  const [canonicalEvents] = useState<CanonicalEvent[]>(canonicalEventsData as CanonicalEvent[])
  const [rawEvents] = useState<RawEvent[]>(rawEventsData as RawEvent[])
  const [filteredEvents, setFilteredEvents] = useState<CanonicalEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showAIDerivation, setShowAIDerivation] = useState(false)

  useEffect(() => {
    const filtered = canonicalEvents.filter(event => 
      new Date(event.timestamp) <= currentDate
    )
    setFilteredEvents(filtered)
  }, [currentDate, canonicalEvents])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Epidemiology AI</h1>
          <p className="subtitle">SE Asia Typhoon Event Analysis</p>
        </div>
        <div className="app-header-right">
          <button
            className={`ai-derivation-toggle ${showAIDerivation ? 'active' : ''}`}
            onClick={() => setShowAIDerivation(!showAIDerivation)}
            title="Show how AI is used to derive events, summarise observations, and make predictions"
          >
            <span className="info-icon">i</span> AI Derivation
          </button>
          <span>•</span>
          <span>{filteredEvents.length} Events</span>
          <span>•</span>
          <span>Demo Environment</span>
        </div>
      </header>
      
      <div className="app-content">
        <div className="left-panel">
          <Timeline
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            startDate={new Date('2025-07-01T06:00:00.000Z')}
            endDate={new Date('2025-07-08T09:00:00.000Z')}
          />
          <EventFeed
            events={filteredEvents}
            rawEvents={rawEvents}
            selectedEventId={selectedEventId}
            onEventSelect={setSelectedEventId}
            showAIDerivation={showAIDerivation}
          />
        </div>

        <div className="right-panel">
          <AISummary events={filteredEvents} currentDate={currentDate} showAIDerivation={showAIDerivation} />
          <MapView
            events={filteredEvents}
            selectedEventId={selectedEventId}
            onEventSelect={setSelectedEventId}
          />
        </div>
      </div>
    </div>
  )
}

export default App
