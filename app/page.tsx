'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Play, RotateCcw, BarChart2, HelpCircle, X } from 'lucide-react'
import { generateWords } from '../utils/words'
import { KeyboardVisualization } from '../components/KeyboardVisualization'
import { Timer } from '../components/Timer'

export default function ModernTerminal() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>(['Welcome to TypeMaster Pro', "Type 'help' for the list of available commands."])
  const [prompt] = useState('typemaster@pro:~$ ')
  const [typingTest, setTypingTest] = useState({
    active: false,
    words: [] as string[],
    currentWordIndex: 0,
    startTime: 0,
    endTime: 0,
    errors: 0,
    typedWords: [] as { word: string; correct: boolean }[],
    stats: [] as Array<{ wpm: number; accuracy: number }>,
  })
  const [lastTypedKey, setLastTypedKey] = useState('')
  const [timer, setTimer] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    historyRef.current?.scrollTo(0, historyRef.current.scrollHeight)
  }, [history])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (typingTest.active) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [typingTest.active])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (typingTest.active) {
      checkWord(e.target.value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setLastTypedKey(e.key)
    if (e.key === 'Enter') {
      const newCommand = input.trim().toLowerCase()
      setHistory(prev => [...prev, `${prompt}${input}`])
      
      switch(newCommand) {
        case 'help':
          showHelp()
          break
        case 'clear':
          setHistory([])
          break
        case 'start':
          startTypingTest()
          break
        case 'reset':
          resetTypingTest()
          break
        case 'stats':
          showStats()
          break
        case 'y':
          if (!typingTest.active && typingTest.endTime > 0) {
            startTypingTest()
          }
          break
        case 'n':
          if (!typingTest.active && typingTest.endTime > 0) {
            setHistory(prev => [...prev, 'Typing test ended. Type "start" to begin a new test.'])
          }
          break
        default:
          if (newCommand && !typingTest.active) {
            setHistory(prev => [...prev, `Command not found: ${newCommand}`])
          }
      }
      
      setInput('')
    }
  }

  const showHelp = () => {
    setHistory(prev => [...prev, 
      '🚀 Available Commands:',
      'help   - Show this help message',
      'start  - Start a new typing test',
      'reset  - Reset the current typing test',
      'stats  - View your typing statistics',
      'clear  - Clear the terminal'
    ])
  }

  const startTypingTest = () => {
    const words = generateWords(50)
    setTypingTest(prev => ({
      ...prev,
      active: true,
      words,
      currentWordIndex: 0,
      startTime: Date.now(),
      endTime: 0,
      errors: 0,
      typedWords: [],
    }))
    setTimer(0)
    setHistory(prev => [
      ...prev,
      '🏁 Starting the typing test...',
      'Type the following text:',
      words.join(' '),
      'Press Enter when you are done.'
    ])
  }

  const resetTypingTest = () => {
    setTypingTest(prev => ({
      ...prev,
      active: false,
      words: [],
      currentWordIndex: 0,
      startTime: 0,
      endTime: 0,
      errors: 0,
      typedWords: [],
    }))
    setTimer(0)
    setHistory(prev => [...prev, '🔄 Typing test reset.'])
  }

  const showStats = () => {
    if (typingTest.stats.length === 0) {
      setHistory(prev => [...prev, '📊 No typing tests completed yet.'])
      return
    }

    const avgWpm = (typingTest.stats.reduce((acc, stat) => acc + stat.wpm, 0) / typingTest.stats.length).toFixed(2)
    const avgAccuracy = (typingTest.stats.reduce((acc, stat) => acc + stat.accuracy, 0) / typingTest.stats.length).toFixed(2)
    
    setHistory(prev => [
      ...prev,
      '📊 Typing Test Statistics',
      `Tests completed: ${typingTest.stats.length}`,
      `Average WPM: ${avgWpm}`,
      `Average Accuracy: ${avgAccuracy}%`,
      'Recent tests:',
      ...typingTest.stats.slice(-5).map((stat, i) => 
        `Test ${typingTest.stats.length - 4 + i}: ${stat.wpm.toFixed(2)} WPM, ${stat.accuracy.toFixed(2)}% accuracy`
      )
    ])
  }

  const checkWord = (typed: string) => {
    const currentWord = typingTest.words[typingTest.currentWordIndex]
    if (typed.endsWith(' ') || typed.endsWith('\n')) {
      const typedWord = typed.trim()
      const isCorrect = typedWord === currentWord
      setTypingTest(prev => ({
        ...prev,
        typedWords: [...prev.typedWords, { word: typedWord, correct: isCorrect }],
        currentWordIndex: prev.currentWordIndex + 1,
        errors: isCorrect ? prev.errors : prev.errors + 1,
      }))
      if (typingTest.currentWordIndex === typingTest.words.length - 1) {
        endTypingTest()
      }
      setInput('')
    }
  }

  const endTypingTest = () => {
    const endTime = Date.now()
    const duration = (endTime - typingTest.startTime) / 1000 / 60 // in minutes
    const wordsTyped = typingTest.words.length
    const wpm = wordsTyped / duration
    const accuracy = ((wordsTyped - typingTest.errors) / wordsTyped) * 100

    const newStats = { wpm, accuracy }
    
    setTypingTest(prev => ({
      ...prev,
      active: false,
      endTime,
      stats: [...prev.stats, newStats]
    }))

    setHistory(prev => [
      ...prev,
      `✅ Typing test completed. WPM: ${wpm.toFixed(2)}, Accuracy: ${accuracy.toFixed(2)}%`,
      "Do you want to continue? Type 'y' for another test or 'n' to stop."
    ])
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-cyan-400">TypeMaster Pro</h1>
        <div className="flex space-x-2">
          <button onClick={startTypingTest} className="p-2 text-green-400 bg-gray-800 rounded hover:bg-gray-700" aria-label="Start Typing Test">
            <Play size={20} />
          </button>
          <button onClick={resetTypingTest} className="p-2 text-yellow-400 bg-gray-800 rounded hover:bg-gray-700" aria-label="Reset Typing Test">
            <RotateCcw size={20} />
          </button>
          <button onClick={showStats} className="p-2 text-blue-400 bg-gray-800 rounded hover:bg-gray-700" aria-label="Show Statistics">
            <BarChart2 size={20} />
          </button>
          <button onClick={showHelp} className="p-2 text-cyan-400 bg-gray-800 rounded hover:bg-gray-700" aria-label="Show Help">
            <HelpCircle size={20} />
          </button>
          <button onClick={() => setHistory([])} className="p-2 text-red-400 bg-gray-800 rounded hover:bg-gray-700" aria-label="Clear Terminal">
            <X size={20} />
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden bg-gray-800 rounded-lg shadow-lg">
        <div ref={historyRef} className="h-full p-4 overflow-y-auto font-mono text-sm">
          {history.map((line, i) => (
            <div key={i} className="mb-1">
              {line}
            </div>
          ))}
          {typingTest.active && (
            <div className="mt-4">
              {typingTest.words.map((word, index) => {
                const typedWord = typingTest.typedWords[index]
                let className = ''
                if (typedWord) {
                  className = typedWord.correct ? 'text-green-400' : 'text-red-400'
                } else if (index === typingTest.currentWordIndex) {
                  className = 'underline'
                }
                return (
                  <span key={index} className={`mr-2 ${className}`}>
                    {word}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <footer className="mt-4">
        <div className="flex items-center px-4 py-2 mb-4 bg-gray-800 rounded-lg">
          <Terminal size={20} className="mr-2 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none"
            placeholder="Type a command..."
            aria-label="Terminal input"
          />
          {typingTest.active && <Timer seconds={timer} />}
        </div>
        <KeyboardVisualization lastTypedKey={lastTypedKey} />
      </footer>
    </div>
  )
}

