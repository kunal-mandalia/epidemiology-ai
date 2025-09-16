interface TimelineProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  startDate: Date
  endDate: Date
}

export default function Timeline({ currentDate, onDateChange, startDate, endDate }: TimelineProps) {
  const totalMs = endDate.getTime() - startDate.getTime()
  const currentMs = currentDate.getTime() - startDate.getTime()
  const percentage = Math.max(0, Math.min(100, (currentMs / totalMs) * 100))

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const newMs = startDate.getTime() + (totalMs * value / 100)
    onDateChange(new Date(newMs))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="timeline">
      <div className="timeline-slider">
        <div className="timeline-labels">
          <span>{formatDate(startDate)}</span>
          <span className="current-date">{formatDate(currentDate)}</span>
          <span>{formatDate(endDate)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={handleSliderChange}
          className="slider"
        />
      </div>
    </div>
  )
}