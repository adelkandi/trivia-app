function formatDate(value) {
  return new Date(value).toLocaleString()
}

export default function QuizResult({ result, onRestart, onViewHistory }) {
  if (!result) return null

  return (
    <section className="panel panel-result">
      <h2>Quiz Complete</h2>
      <p className="result-score">
        Final Score: <strong>{result.score} / {result.total}</strong>
      </p>
      <p>
        Category: <strong>{result.category}</strong>
      </p>
      <p>
        Completed: <strong>{formatDate(result.completedAt)}</strong>
      </p>

      <div className="actions-row">
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          Play Again
        </button>
        <button type="button" className="btn btn-secondary" onClick={onViewHistory}>
          View History
        </button>
      </div>
    </section>
  )
}
