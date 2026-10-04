import { useState } from "react";
import TextField from "./TextField";
import { LIMITS } from "../validation/limits";

function validate({ title, description }) {
  const errors = {};
  if (!title.trim()) {
    errors.title = "Title is required";
  } else if (title.trim().length > LIMITS.taskTitle) {
    errors.title = `Title must be at most ${LIMITS.taskTitle} characters`;
  }
  if (description.length > LIMITS.taskDescription) {
    errors.description = `Description must be at most ${LIMITS.taskDescription} characters`;
  }
  return errors;
}

function TaskForm({ initialTask, onSubmit, onCancel }) {
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [priority, setPriority] = useState(initialTask?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const clientErrors = validate({ title, description });
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      // an empty date string would fail to parse on the server, so send null
      await onSubmit({
        title: title.trim(),
        description,
        priority,
        dueDate: dueDate || null,
      });
      if (!isEditing) {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate("");
      }
    } catch (err) {
      const fieldErrors = err.fieldErrors ?? {};
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <h2>{isEditing ? "Edit task" : "New task"}</h2>
      <div className="form-row">
        <TextField
          id="task-title"
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
          error={errors.title}
          disabled={submitting}
        />
        <TextField
          id="task-description"
          label="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          error={errors.description}
          disabled={submitting}
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            className="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={submitting}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <TextField
          id="task-due"
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
          disabled={submitting}
        />
      </div>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Update Task" : "Add Task"}
        </button>
        {isEditing && (
          <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;