export default function StartScreen({
  categories,
  selectedCategory,
  loading,
  error,
  onCategoryChange,
  onStart,
}) {
  return (
    <section className="panel panel-start">
      <h2>Pick Your Arena</h2>
      <p className="panel-intro">
        Choose a category and test yourself with 10 rapid-fire trivia questions.
      </p>

      <div className="controls-row">
        <label htmlFor="category-select">Category</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          disabled={loading}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="actions-row">
        <button type="button" className="btn btn-primary" onClick={onStart} disabled={loading}>
          {loading ? 'Loading Questions...' : 'Start Quiz'}
        </button>
      </div>

      {error ? <p className="status status-error">{error}</p> : null}
    </section>
  )
}
