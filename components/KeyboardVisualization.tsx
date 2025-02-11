import React from 'react'

interface KeyboardVisualizationProps {
  lastTypedKey: string
}

export const KeyboardVisualization: React.FC<KeyboardVisualizationProps> = ({ lastTypedKey }) => {
  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ]

  return (
    <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex mb-2">
          {row.map((key) => (
            <div
              key={key}
              className={`w-10 h-10 flex items-center justify-center m-1 rounded-lg text-lg font-bold ${
                key === lastTypedKey.toLowerCase()
                  ? 'bg-cyan-500 text-gray-900'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
      <div className="w-64 h-10 flex items-center justify-center m-1 rounded-lg text-lg font-bold bg-gray-700 text-gray-300">
        Space
      </div>
    </div>
  )
}

