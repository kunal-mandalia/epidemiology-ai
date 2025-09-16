import { useState } from 'react'
import type { CanonicalEvent, AIAnalysisEntry } from '../types'
import aiAnalysisData from '../data/ai-analysis.json'

interface AISummaryProps {
  events: CanonicalEvent[]
  currentDate: Date
}

export default function AISummary({ events, currentDate }: AISummaryProps) {
  const [showSources, setShowSources] = useState(false)

  const eventsBySource = events.reduce((acc, event) => {
    acc[event.source_type] = (acc[event.source_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get the most recent AI analysis for the current date
  const getCurrentAnalysis = (): AIAnalysisEntry | null => {
    const analysisEntries = aiAnalysisData as AIAnalysisEntry[]

    // Find all analyses up to the current date
    const availableAnalyses = analysisEntries.filter(analysis => {
      const analysisDate = new Date(analysis.date)
      return analysisDate <= currentDate
    })

    // Return the most recent analysis
    if (availableAnalyses.length === 0) return null

    return availableAnalyses[availableAnalyses.length - 1]
  }

  const currentAnalysis = getCurrentAnalysis()

  if (!currentAnalysis) {
    return (
      <div className="ai-summary">
        <div className="summary-header">
          <h2>AI Analysis</h2>
          <div className="summary-stats">
            <span><strong>0</strong> events</span>
            <span>{currentDate.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="summary-content">
          <div className="summary-grid">
            <div className="summary-card">
              <p className="summary-text">Pre-event monitoring phase. AI analysis will begin when data becomes available.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-summary">
      <div className="summary-content">
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Current Observations</h4>
            <p className="summary-text">{currentAnalysis.observations}</p>
          </div>

          <div className="summary-card">
            <h4>AI Predictions</h4>
            <p className="summary-text">{currentAnalysis.predictions}</p>
          </div>
        </div>

        <div className="summary-footer">
          <span className="data-sources" onClick={() => setShowSources(!showSources)}>
            Analysis generated from {events.length} events • Sources: {Object.entries(eventsBySource).map(([source, count]) => `${source}(${count})`).join(', ')}
          </span>
        </div>
      </div>
    </div>
  )
}