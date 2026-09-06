import { useEffect, useState } from "react";
import { updateImage } from "../api";

export default function Viewer({ images, index, onClose, onChange, onDelete, onToggleFavorite, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [editError, setEditError] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  const prev = () => onChange((index - 1 + images.length) % images.length);
  const next = () => onChange((index + 1) % images.length);

  const image = images[index];

  useEffect(() => {
    if (image) {
      setTitle(image.title || "");
      setDescription(image.description || "");
      setTags((image.tags || []).join(", "));
      setEditing(false);
      setEditError(null);
    }
  }, [image]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!image) return null;

  const saveEdit = async () => {
    if (!title.trim()) {
      setEditError("Title is required");
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      const updated = await updateImage(image._id, { title: title.trim(), description: description.trim(), tags });
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message);
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-label="Image viewer">
      <div className="viewer" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close viewer">X</button>
        <button className="nav left" onClick={prev} aria-label="Previous image">&#8249;</button>
        <img src={image.imageUrl} alt={image.title || "Uploaded image"} />
        <button className="nav right" onClick={next} aria-label="Next image">&#8250;</button>

        <div className="viewer-meta">
          {editing ? (
            <div className="edit-form">
              {editError && <p className="edit-error">{editError}</p>}
              <input type="text" placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} aria-label="Title" autoFocus />
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={240} aria-label="Description" />
              <input type="text" placeholder="Tags (comma separated, max 5)" value={tags} onChange={(e) => setTags(e.target.value)} aria-label="Tags" />
              <div className="edit-actions">
                <button onClick={saveEdit} className="save-btn" disabled={editBusy}>
                  {editBusy ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3>{image.title || "Untitled"}</h3>
              {image.description && <p>{image.description}</p>}
              {image.tags && image.tags.length > 0 && (
                <div className="viewer-tags">
                  {image.tags.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="viewer-footer">
          <span>Image {index + 1} of {images.length}</span>
          <div className="viewer-actions">
            <button
              className={`fav-btn ${image.isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(image._id)}
              aria-label={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {image.isFavorite ? "\u2665 Favorited" : "\u2661 Favorite"}
            </button>
            {!editing && <button className="edit-btn" onClick={() => setEditing(true)} aria-label="Edit image details">Edit</button>}
            <button className="delete" onClick={() => onDelete(image._id)} aria-label="Delete image">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
