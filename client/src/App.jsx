import { useEffect, useState, useCallback } from "react";
import { getImages, deleteImage, uploadImage, toggleFavorite } from "./api";
import UploadForm from "./components/UploadForm";
import Gallery from "./components/Gallery";
import Viewer from "./components/Viewer";

export default function App() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [theme, setTheme] = useState(
  localStorage.getItem("theme") || "dark"
    );

    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }, [theme]);

  const [search, setSearch] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [sort, setSort] = useState("recent");

  const hasFilters = search !== "" || favoriteFilter;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (favoriteFilter) params.favorite = "true";
      if (sort) params.sort = sort;
      const data = await getImages(params);
      setImages(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, favoriteFilter, sort]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file, metadata) => {
    setBusy(true);
    setProgress(0);
    try {
      await uploadImage(file, metadata, setProgress);
      await load();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteImage(id);
      setCurrent(null);
      setImages((prev) => prev.filter((img) => img._id !== id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
      setDeleteTarget(null);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const image = images.find((img) => img._id === id);
      if (!image) return;
      const updated = await toggleFavorite(id, !image.isFavorite);
      setImages((prev) => prev.map((img) => (img._id === id ? updated : img)));
    } catch (err) {
      alert("Failed to update favorite: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateImage = (updated) => {
    setImages((prev) => prev.map((img) => (img._id === updated._id ? updated : img)));
  };

  const clearFilters = () => {
    setSearch("");
    setFavoriteFilter(false);
    setSort("recent");
  };

  const requestDelete = (id) => setDeleteTarget(id);

  const cancelDelete = () => setDeleteTarget(null);

  return (
    <div className="app">
     <header>
  <h1>MERN Gallery</h1>
  <div className="theme-toggle">
    <span>{images.length} images</span>
    <button
      className="switch"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    />
  </div>
</header>
      <UploadForm onUpload={handleUpload} busy={busy} progress={progress} />

      <div className="controls">
        <input
          type="search"
          placeholder="Search by title, description, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          aria-label="Search images"
        />
        <button
          className={`filter-btn ${favoriteFilter ? "active" : ""}`}
          onClick={() => setFavoriteFilter(!favoriteFilter)}
          aria-pressed={favoriteFilter}
          aria-label={favoriteFilter ? "Show all photos" : "Show favorites only"}
        >
          {favoriteFilter ? "\u2665 Favorites" : "\u2661 All"}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="sort-select"
          aria-label="Sort images"
        >
          <option value="recent">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <Gallery
        images={images}
        onOpen={setCurrent}
        onDelete={requestDelete}
        onToggleFavorite={handleToggleFavorite}
        onUpdate={handleUpdateImage}
        loading={loading}
        error={error}
        onRetry={load}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />

      {current !== null && (
        <Viewer
          images={images}
          index={current}
          onClose={() => setCurrent(null)}
          onChange={setCurrent}
          onDelete={requestDelete}
          onToggleFavorite={handleToggleFavorite}
          onUpdate={handleUpdateImage}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
            <h2 id="confirm-title">Delete image?</h2>
            <p className="confirm-text">This will permanently remove the image and its file. This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="danger-btn" onClick={() => handleDelete(deleteTarget)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
