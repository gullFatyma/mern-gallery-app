import { useState } from "react";
import { updateImage } from "../api";

export default function Gallery({ images, onOpen, onDelete, onToggleFavorite, onUpdate, loading, error, onRetry, hasFilters, onClearFilters }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editError, setEditError] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  if (loading) {
    return (
      <div className="status-message">
        <div className="spinner" role="status" aria-label="Loading" />
        <p>Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-message error">
        <p>Failed to load images: {error}</p>
        <button onClick={onRetry} aria-label="Retry loading images">Retry</button>
      </div>
    );
  }

  if (!images.length && hasFilters) {
    return (
      <div className="empty-state">
        <p>No results match your search or filters.</p>
        <button onClick={onClearFilters} className="clear-filters-btn">Clear filters</button>
      </div>
    );
  }

  if (!images.length) {
    return <p className="empty">No images yet. Upload your first one.</p>;
  }

  const startEdit = (img) => {
    setEditingId(img._id);
    setEditTitle(img.title || "");
    setEditDesc(img.description || "");
    setEditTags((img.tags || []).join(", "));
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      setEditError("Title is required");
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      const updated = await updateImage(id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        tags: editTags,
      });
      onUpdate(updated);
      cancelEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || err.message);
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <>
      <div className="grid">
        {images.map((img, i) => (
          <div className="card" key={img._id}>
            <img
              src={img.imageUrl}
              alt={img.title || "Uploaded image"}
              onClick={() => onOpen(i)}
              onKeyDown={(e) => { if (e.key === "Enter") onOpen(i); }}
              tabIndex={0}
              role="button"
              aria-label={`View ${img.title || "image"}`}
            />
            <button
              className={`fav-btn ${img.isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(img._id)}
              aria-label={img.isFavorite ? `Remove ${img.title || "image"} from favorites` : `Add ${img.title || "image"} to favorites`}
            >
              {img.isFavorite ? "\u2665" : "\u2661"}
            </button>
            <button
              className="edit-card-btn"
              onClick={() => startEdit(img)}
              aria-label={`Edit details for ${img.title || "image"}`}
            >
              &#9998;
            </button>
            <button
              className="delete"
              onClick={() => onDelete(img._id)}
              aria-label={`Delete ${img.title || "image"}`}
            >
              Delete
            </button>
            <div className="card-meta">
              <h3 className="card-title">{img.title || "Untitled"}</h3>
              {img.description && <p className="card-desc">{img.description}</p>}
              {img.tags && img.tags.length > 0 && (
                <div className="card-tags">
                  {img.tags.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Details</h2>
            {editError && <p className="edit-error">{editError}</p>}
            <div className="edit-form">
              <label>
                Title *
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={80}
                  aria-label="Title"
                  autoFocus
                />
              </label>
              <label>
                Description
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  maxLength={240}
                  aria-label="Description"
                />
              </label>
              <label>
                Tags (comma separated, max 5)
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  aria-label="Tags"
                />
              </label>
              <div className="edit-actions">
                <button onClick={() => saveEdit(editingId)} className="save-btn" disabled={editBusy}>
                  {editBusy ? "Saving..." : "Save"}
                </button>
                <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
