import { useEffect, useState } from "react";
import { getComments, addComment, deleteComment } from "../api/commentApi";
import { LIMITS } from "../validation/limits";
import ConfirmModal from "./ConfirmModal";

function CommentsPanel({ taskId, onCountChange }) {
  const [comments, setComments] = useState(null); // null = still loading
  const [loadError, setLoadError] = useState(null);
  const [content, setContent] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Comments are fetched only when the panel opens (lazy loading, frontend edition)
  useEffect(() => {
    let ignore = false;
    getComments(taskId)
      .then((list) => {
        if (!ignore) setComments(list);
      })
      .catch((err) => {
        if (!ignore) setLoadError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [taskId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const trimmed = content.trim();
    if (!trimmed) {
      setFieldError("Comment cannot be empty");
      return;
    }
    if (trimmed.length > LIMITS.comment) {
      setFieldError(`Comment must be at most ${LIMITS.comment} characters`);
      return;
    }

    setFieldError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      const saved = await addComment(taskId, trimmed);
      setComments((prev) => [...(prev ?? []), saved]);
      onCountChange(1);
      setContent("");
    } catch (err) {
      if (err.fieldErrors?.content) {
        setFieldError(err.fieldErrors.content);
      } else {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    const comment = pendingDelete;
    try {
      await deleteComment(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      onCountChange(-1);
      setFormError(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="comments">
      {loadError && <p className="error">Error: {loadError}</p>}
      {!loadError && comments === null && <p className="task-meta">Loading comments...</p>}
      {comments !== null && comments.length === 0 && (
        <p className="task-meta">No comments yet.</p>
      )}

      {comments?.map((c) => (
        <div key={c.id} className="comment">
          <div className="comment-head">
            <span>
              <strong>{c.authorName}</strong> · {new Date(c.createdAt).toLocaleString()}
            </span>
            <button className="btn btn-sm btn-danger" onClick={() => setPendingDelete(c)}>
              Delete
            </button>
          </div>
          {/* rendered as text: React escapes it, so pasted HTML shows literally */}
          <p className="comment-body">{c.content}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor={`comment-${taskId}`} className="visually-hidden">
          Add a comment
        </label>
        <textarea
          id={`comment-${taskId}`}
          className={fieldError ? "textarea input-invalid" : "textarea"}
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setFieldError(null);
          }}
          aria-invalid={Boolean(fieldError)}
          disabled={submitting || comments === null}
        />
        <div className="comment-form-footer">
          <span className={content.length > LIMITS.comment ? "field-error" : "task-meta"}>
            {content.length}/{LIMITS.comment}
          </span>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting || comments === null}
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </div>
        {fieldError && (
          <span className="field-error" role="alert">
            {fieldError}
          </span>
        )}
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
      </form>

      {pendingDelete && (
        <ConfirmModal
          title="Delete comment?"
          message="This comment will be permanently deleted."
          confirmLabel="Delete"
          busyLabel="Deleting..."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

export default CommentsPanel;