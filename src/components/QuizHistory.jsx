function formatDate(value) {
  return new Date(value).toLocaleString()
}

export default function QuizHistory({ history, onBack, onClear }) {
  return (
    <section className="panel panel-history">
      <h2>Quiz History</h2>

      {history.length === 0 ? (
        <p className="panel-intro">No quiz history yet. Complete a quiz to see it here.</p>
      ) : (
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={`${entry.completedAt}-${index}`} className="history-item">
              <div>
                <p className="history-category">{entry.category}</p>
                <p className="history-date">{formatDate(entry.completedAt)}</p>
              </div>
              <p className="history-score">
                {entry.score} / {entry.total}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="actions-row">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onClear}
          disabled={history.length === 0}
        >
          Clear History
        </button>
      </div>
    </section>
  )
}
