export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  score,
  answerState,
  onAnswer,
  onNext,
}) {
  return (
    <section className="panel panel-quiz">
      <div className="quiz-meta">
        <span>{question.category}</span>
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span>Score: {score}</span>
      </div>

      <h2 className="question-text">{question.question}</h2>

      <ul className="answer-list">
        {question.choices.map((choice) => {
          const selected = answerState?.choice === choice
          const isCorrect = choice === question.correctAnswer

          let buttonClass = 'btn btn-answer'
          if (answerState) {
            if (isCorrect) buttonClass += ' answer-correct'
            if (!isCorrect && selected) buttonClass += ' answer-incorrect'
          }

          return (
            <li key={choice}>
              <button
                type="button"
                className={buttonClass}
                disabled={Boolean(answerState)}
                onClick={() => onAnswer(choice)}
              >
                {choice}
              </button>
            </li>
          )
        })}
      </ul>

      {answerState ? (
        <div className="feedback-row">
          <p className={answerState.correct ? 'status status-good' : 'status status-error'}>
            {answerState.correct ? 'Correct answer!' : 'Incorrect answer!'}
          </p>
          <button type="button" className="btn btn-primary" onClick={onNext}>
            {currentIndex + 1 === totalQuestions ? 'See Results' : 'Next Question'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
