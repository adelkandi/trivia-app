import { useEffect, useState } from 'react'
import './App.css'

const API_CATEGORIES = 'https://opentdb.com/api_category.php'
const API_QUESTIONS = 'https://opentdb.com/api.php'
const STORAGE_KEY = 'trivia_history_v1'

function decodeHTML(html) {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

function shuffle(array) {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
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
  const [selectedCat, setSelectedCat] = useState('')
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answerState, setAnswerState] = useState(null)
  const [history, setHistory] = useLocalHistory()
  const [view, setView] = useState('start') // start | quiz | result | history

  useEffect(() => {
    fetch(API_CATEGORIES)
      .then((r) => r.json())
      .then((data) => setCategories(data.trivia_categories || []))
      .catch(() => setCategories([]))
  }, [])

  async function startQuiz() {
    if (!selectedCat) return setError('Please select a category')
    setLoading(true)
    setError('')
    try {
      const url = `${API_QUESTIONS}?amount=10&category=${selectedCat}&type=multiple`
      const res = await fetch(url)
      const data = await res.json()
      const qs = (data.results || []).map((q) => {
        const choices = shuffle([q.correct_answer, ...q.incorrect_answers])
        return {
          question: decodeHTML(q.question),
          correct: decodeHTML(q.correct_answer),
          choices: choices.map((c) => decodeHTML(c)),
          category: q.category,
        }
      })
      setQuestions(qs)
      setIndex(0)
      setScore(0)
      setAnswerState(null)
      setView('quiz')
    } catch (e) {
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  function selectAnswer(choice) {
    if (answerState) return
    const q = questions[index]
    const correct = choice === q.correct
    setAnswerState({ choice, correct })
    if (correct) setScore((s) => s + 1)
  }

  function nextQuestion() {
    const next = index + 1
    setAnswerState(null)
    if (next >= questions.length) {
      // finish
      const result = {
        date: new Date().toISOString(),
        category: questions[0]?.category || 'Unknown',
        score,
        total: questions.length,
      }
      setHistory([result, ...history])
      setView('result')
    } else {
      setIndex(next)
    }
  }

  function resetToStart() {
    setQuestions([])
    setIndex(0)
    setScore(0)
    setAnswerState(null)
    setView('start')
    setSelectedCat('')
    setError('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trivia Quiz</h1>
        <nav>
          <button className={view === 'start' ? 'active' : ''} onClick={() => setView('start')}>Start</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>History</button>
        </nav>
      </header>

      <main className="container">
        {view === 'start' && (
          <section className="card">
            <h2>Select Category</h2>
            <div className="controls">
              <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                <option value="">-- Choose a category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button onClick={startQuiz} disabled={loading}>{loading ? 'Loading…' : 'Start Quiz'}</button>
            </div>
            {error && <p className="error">{error}</p>}
            <p className="hint">10 questions will be fetched from Open Trivia DB.</p>
          </section>
        )}

        {view === 'quiz' && questions.length > 0 && (
          <section className="card quiz">
            <div className="meta">
              <div>Category: <strong>{questions[index].category}</strong></div>
              <div>Question {index + 1} / {questions.length}</div>
              <div>Score: {score}</div>
            </div>

            <h3 className="question">{questions[index].question}</h3>

            <ul className="choices">
              {questions[index].choices.map((c) => {
                const chosen = answerState?.choice === c
                const isCorrect = c === questions[index].correct
                let className = ''
                if (answerState) {
                  if (isCorrect) className = 'correct'
                  else if (chosen && !isCorrect) className = 'incorrect'
                }
                return (
                  <li key={c}>
                    <button className={className} onClick={() => selectAnswer(c)} disabled={!!answerState}>{c}</button>
                  </li>
                )
              })}
            </ul>

            {answerState && (
              <div className="feedback">
                {answerState.correct ? <span className="ok">Correct!</span> : <span className="bad">Incorrect</span>}
                <button onClick={nextQuestion}>{index + 1 === questions.length ? 'See Results' : 'Next'}</button>
              </div>
            )}
          </section>
        )}

        {view === 'result' && (
          <section className="card result">
            <h2>Quiz Results</h2>
            <p>Category: <strong>{questions[0]?.category}</strong></p>
            <p>Score: <strong>{score} / {questions.length}</strong></p>
            <p>Date: <strong>{new Date().toLocaleString()}</strong></p>
            <div className="result-actions">
              <button onClick={resetToStart}>Take Another Quiz</button>
              <button onClick={() => setView('history')}>View History</button>
            </div>
          </section>
        )}

        {view === 'history' && (
          <section className="card history">
            <h2>Past Quizzes</h2>
            {history.length === 0 ? (
              <p>No quiz history yet.</p>
            ) : (
              <ul>
                {history.map((h, i) => (
                  <li key={h.date + i} className="history-item">
                    <div className="hist-left">
                      <div className="hist-cat">{h.category}</div>
                      <div className="hist-date">{new Date(h.date).toLocaleString()}</div>
                    </div>
                    <div className="hist-score">{h.score} / {h.total}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="history-actions">
              <button onClick={() => { setHistory([]) }}>Clear History</button>
              <button onClick={() => setView('start')}>Back</button>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <small>Questions from Open Trivia DB — no API key required.</small>
      </footer>
    </div>
  )
}
