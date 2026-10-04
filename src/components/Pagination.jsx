function Pagination({ page, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) {
    return (
      <p className="task-meta">
        {totalItems} {totalItems === 1 ? "task" : "tasks"}
      </p>
    );
  }

  return (
    <div className="pagination">
      <button className="btn" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
        ← Prev
      </button>
      <span>
        Page {page + 1} of {totalPages} · {totalItems} tasks
      </span>
      <button
        className="btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;