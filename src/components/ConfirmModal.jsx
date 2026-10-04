import { useEffect, useState } from "react";

function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  busyLabel = "Working...",
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);

  // Close on Escape. The cleanup removes the listener when the modal closes.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, onCancel]);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={() => !busy && onCancel()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()} // clicks inside must not reach the overlay
      >
        <h2 id="modal-title" className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;