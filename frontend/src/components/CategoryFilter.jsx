import './CategoryFilter.css'

export default function CategoryFilter({
  categories,
  selectedId,
  onSelect,
  onClear,
}) {
  return (
    <div className="cat-filter">
      <div className="cat-filter-title">Filter by Category</div>
      <ul className="cat-filter-list">
        {categories.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={`cat-filter-item ${selectedId === c.id ? 'active' : ''}`}
              onClick={() => onSelect(c.id === selectedId ? null : c.id)}
            >
              <span className="cat-check">{selectedId === c.id ? '✓' : ''}</span>
              {c.name}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="cat-clear" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  )
}
