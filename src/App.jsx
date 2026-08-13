import { useEffect, useState } from 'react'
import './App.css'
import QuestionCard from './components/QuestionCard'
import QuizHistory from './components/QuizHistory'
import QuizResult from './components/QuizResult'
import StartScreen from './components/StartScreen'

const API_CATEGORIES = 'https://opentdb.com/api_category.php'
const API_QUESTIONS = 'https://opentdb.com/api.php'
const STORAGE_KEY = 'trivia_history_v1'

function decodeHTML(html) {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function useLocalHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {}
  }, [history])
  return [history, setHistory]
}

export default function App() {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answerState, setAnswerState] = useState(null)
  const [history, setHistory] = useLocalHistory()
  const [latestResult, setLatestResult] = useState(null)
  const [view, setView] = useState('start') // start | quiz | result | history

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(API_CATEGORIES)
        if (!response.ok) throw new Error('Failed to load categories')
        const data = await response.json()
        setCategories(data.trivia_categories || [])
      } catch {
        setCategories([])
        setError('Could not load categories. Please refresh and try again.')
      }
    }

    loadCategories()
  }, [])

  async function startQuiz() {
    if (!selectedCategoryId) {
      setError('Please select a category before starting.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = `${API_QUESTIONS}?amount=10&category=${selectedCategoryId}&type=multiple`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Question fetch failed')

      const data = await response.json()
      if (data.response_code !== 0) throw new Error('API returned no quiz questions')

      const qs = (data.results || []).map((q) => {
        const decodedCorrect = decodeHTML(q.correct_answer)
        const choices = shuffle([
          decodedCorrect,
          ...q.incorrect_answers.map((answer) => decodeHTML(answer)),
        ])

        return {
          question: decodeHTML(q.question),
          correctAnswer: decodedCorrect,
          choices,
          category: q.category,
        }
      })

      if (qs.length !== 10) throw new Error('Expected 10 questions from API')

      setQuestions(qs)
      setCurrentQuestionIndex(0)
      setScore(0)
      setAnswerState(null)
      setLatestResult(null)
      setView('quiz')
    } catch {
      setError('Failed to load questions. Please try another category.')
    } finally {
      setLoading(false)
    }
  }

  function selectAnswer(choice) {
    if (answerState) return

    const question = questions[currentQuestionIndex]
    const correct = choice === question.correctAnswer

    setAnswerState({ choice, correct })
    if (correct) setScore((s) => s + 1)
  }

  function nextQuestion() {
    const nextIndex = currentQuestionIndex + 1
    const finalScore = answerState?.correct ? score + 1 : score

    setAnswerState(null)

    if (nextIndex >= questions.length) {
      const result = {
        completedAt: new Date().toISOString(),
        category: questions[0]?.category || 'Unknown',
        score: finalScore,
        total: questions.length,
      }

      setHistory([result, ...history])
      setLatestResult(result)
      setView('result')
    } else {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  function restartQuiz() {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswerState(null)
    setView('start')
    setSelectedCategoryId('')
    setError('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trivia Sprint</h1>
        <nav className="app-nav">
          <button
            type="button"
            className={view === 'start' ? 'btn btn-nav active' : 'btn btn-nav'}
            onClick={() => setView('start')}
          >
            Start
          </button>
          <button
            type="button"
            className={view === 'history' ? 'btn btn-nav active' : 'btn btn-nav'}
            onClick={() => setView('history')}
          >
            History
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'start' ? (
          <StartScreen
            categories={categories}
            selectedCategory={selectedCategoryId}
            loading={loading}
            error={error}
            onCategoryChange={setSelectedCategoryId}
            onStart={startQuiz}
          />
        ) : null}

        {view === 'quiz' && questions.length > 0 ? (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            score={score}
            answerState={answerState}
            onAnswer={selectAnswer}
            onNext={nextQuestion}
          />
        ) : null}

        {view === 'result' ? (
          <QuizResult
            result={latestResult}
            onRestart={restartQuiz}
            onViewHistory={() => setView('history')}
          />
        ) : null}

        {view === 'history' ? (
          <QuizHistory
            history={history}
            onBack={() => setView('start')}
            onClear={() => setHistory([])}
          />
        ) : null}
      </main>

      <footer className="footer">
        <small>Questions sourced from Open Trivia Database.</small>
      </footer>
    </div>
  )
}
