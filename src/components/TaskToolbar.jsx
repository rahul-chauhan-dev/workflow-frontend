const SORT_OPTIONS = [
  { value: "id,desc", label: "Newest first" },
  { value: "id,asc", label: "Oldest first" },
  { value: "dueDate,asc", label: "Due date (earliest)" },
  { value: "dueDate,desc", label: "Due date (latest)" },
  { value: "title,asc", label: "Title A–Z" },
];

function TaskToolbar({
  filters,
  searchText,
  view,
  hasFilters,
  onSearchChange,
  onFilterChange,
  onViewChange,
  onClear,
}) {
  const isBoard = view === "board";

  return (
    <div className="toolbar">
      <input
        className="input"
        type="search"
        placeholder="Search tasks..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {!isBoard && (
        <select
          className="select"
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>
      )}

      <select
        className="select"
        value={filters.priority}
        onChange={(e) => onFilterChange("priority", e.target.value)}
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      {!isBoard && (
        <select
          className="select"
          value={filters.sort}
          onChange={(e) => onFilterChange("sort", e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button className="btn" onClick={onClear}>
          Clear
        </button>
      )}

      <div className="view-toggle">
        <button
          className={!isBoard ? "btn btn-primary" : "btn"}
          onClick={() => onViewChange("list")}
        >
          List
        </button>
        <button
          className={isBoard ? "btn btn-primary" : "btn"}
          onClick={() => onViewChange("board")}
        >
          Board
        </button>
      </div>
    </div>
  );
}

export default TaskToolbar;