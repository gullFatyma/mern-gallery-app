import { useState } from "react";

export default function UploadForm({ onUpload, busy, progress }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [expanded, setExpanded] = useState(false);

  const submit = () => {
    if (!file) return alert("Please choose an image first.");
    if (!title.trim()) return alert("Title is required.");
    if (title.length > 80) return alert("Title must be 80 characters or fewer.");
    if (description.length > 240) return alert("Description must be 240 characters or fewer.");
    onUpload(file, { title: title.trim(), description: description.trim(), tags });
    setFile(null);
    setTitle("");
    setDescription("");
    setTags("");
    setExpanded(false);
  };

  return (
    <div className="upload-bar">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={() => setExpanded(!expanded)} className="toggle-meta" type="button">
        {expanded ? "Less" : "Details"}
      </button>
      {expanded && (
        <>
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="meta-input"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={240}
            className="meta-input"
          />
          <input
            type="text"
            placeholder="Tags (comma separated, max 5)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="meta-input"
          />
        </>
      )}
      <button onClick={submit} disabled={busy}>
        {busy ? `Uploading ${progress}%` : "Upload"}
      </button>
      {busy && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
