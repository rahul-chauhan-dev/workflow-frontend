import { useState } from "react";
import TextField from "./TextField";
import { LIMITS } from "../validation/limits";

function validate({ name, description }) {
  const errors = {};
  if (!name.trim()) {
    errors.name = "Name is required";
  } else if (name.trim().length > LIMITS.projectName) {
    errors.name = `Name must be at most ${LIMITS.projectName} characters`;
  }
  if (description.length > LIMITS.projectDescription) {
    errors.description = `Description must be at most ${LIMITS.projectDescription} characters`;
  }
  return errors;
}

function ProjectForm({ initialProject, onSubmit, onCancel }) {
  const isEditing = Boolean(initialProject);

  const [name, setName] = useState(initialProject?.name ?? "");
  const [description, setDescription] = useState(initialProject?.description ?? "");
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

    const clientErrors = validate({ name, description });
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) return; // do not even call the server

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description });
      if (!isEditing) {
        setName("");
        setDescription("");
      }
    } catch (err) {
      const fieldErrors = err.fieldErrors ?? {};
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) {
        setFormError(err.message); // not tied to a field: network, 404, 500...
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <h2>{isEditing ? "Edit project" : "New project"}</h2>
      <div className="form-row">
        <TextField
          id="project-name"
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError("name");
          }}
          error={errors.name}
          disabled={submitting}
        />
        <TextField
          id="project-description"
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

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Update Project" : "Add Project"}
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

export default ProjectForm;