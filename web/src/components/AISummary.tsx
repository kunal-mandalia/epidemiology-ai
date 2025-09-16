import { useState, useEffect } from 'react'
import type { CanonicalEvent, AIAnalysisEntry } from '../types'
import aiAnalysisData from '../data/ai-analysis.json'

interface AISummaryProps {
  events: CanonicalEvent[]
  currentDate: Date
  showAIDerivation: boolean
}

export default function AISummary({ events, currentDate, showAIDerivation }: AISummaryProps) {
  const [showSources, setShowSources] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [mlModelState, setMlModelState] = useState<'loading' | 'processing' | 'complete'>('loading')
  const [predictionsText, setPredictionsText] = useState('')

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

  // Streaming effect for observations
  useEffect(() => {
    if (!currentAnalysis?.observations) {
      setStreamedText('')
      setIsStreaming(false)
      return
    }

    const text = currentAnalysis.observations
    setStreamedText('')
    setIsStreaming(true)

    let index = 0
    const interval = setInterval(() => {
      setStreamedText(text.slice(0, index))
      index++

      if (index > text.length) {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 20) // Adjust speed as needed

    return () => clearInterval(interval)
  }, [currentAnalysis?.observations])

  // ML Model loading simulation for predictions
  useEffect(() => {
    if (!currentAnalysis?.predictions) {
      setMlModelState('loading')
      setPredictionsText('')
      return
    }

    const predictions = currentAnalysis.predictions
    setMlModelState('loading')
    setPredictionsText('')

    // Simulate model loading
    const loadingTimer = setTimeout(() => {
      setMlModelState('processing')
    }, 1500)

    // Simulate processing and return result
    const processingTimer = setTimeout(() => {
      setMlModelState('complete')
      setPredictionsText(predictions)
    }, 3500)

    return () => {
      clearTimeout(loadingTimer)
      clearTimeout(processingTimer)
    }
  }, [currentAnalysis?.predictions])

  const getObservationsDerivationSteps = () => [
    'Event data aggregation and temporal sequencing',
    'Large Language Model (LLM) processing of structured event metadata',
    'Natural language synthesis of key patterns and trends',
    'Multi-source correlation analysis for comprehensive situational awareness'
  ]

  const getPredictionsDerivationSteps = () => [
    'Pre-trained epidemiological ML model inference on current event vectors',
    'Custom scientific model trained on historical outbreak progression data',
    'Probabilistic forecasting using Monte Carlo simulation methods',
    'Ensemble prediction aggregation with confidence interval estimation'
  ]

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
          <div className="derivation-steps compact">
            <small className="slick-title">Current Observations</small>
            <p className="summary-text">
              {streamedText}
              {isStreaming && <span className="streaming-cursor">|</span>}
            </p>
          </div>

          <div className="derivation-steps compact">
            <small className="slick-title">AI Predictions</small>
            <p className="summary-text">
              {mlModelState === 'loading' && (
                <span className="ml-loading">
                  <span className="loading-spinner"></span>
                  Loading epidemiological ML model...
                </span>
              )}
              {mlModelState === 'processing' && (
                <span className="ml-processing">
                  <span className="processing-spinner"></span>
                  Processing outbreak progression vectors...
                </span>
              )}
              {mlModelState === 'complete' && predictionsText}
            </p>
          </div>
        </div>

        {showAIDerivation && (
          <div className="summary-grid">
            <div className="derivation-steps">
              <small className="slick-title">Current Observations AI Derivation:</small>
              <ol>
                {getObservationsDerivationSteps().map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="derivation-steps">
              <small className="slick-title">AI Predictions Derivation:</small>
              <ol>
                {getPredictionsDerivationSteps().map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <div className="summary-footer">
          <span className="data-sources" onClick={() => setShowSources(!showSources)}>
            Analysis generated from {events.length} events • Sources: {Object.entries(eventsBySource).map(([source, count]) => `${source}(${count})`).join(', ')}
          </span>
        </div>
      </div>
    </div>
  )
}