import React from 'react'

interface TimerProps {
  seconds: number
}

export const Timer: React.FC<TimerProps> = ({ seconds }) => {
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="ml-4 text-cyan-400 font-mono">
      {formatTime(seconds)}
    </div>
  )
}

