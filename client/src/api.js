import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getImages = (params = {}) =>
  axios.get(`${API}/images`, { params }).then((r) => r.data);

export const deleteImage = (id) =>
  axios.delete(`${API}/images/${id}`).then((r) => r.data);

export const uploadImage = (file, metadata, onProgress) => {
  const form = new FormData();
  form.append("image", file);
  if (metadata.title) form.append("title", metadata.title);
  if (metadata.description) form.append("description", metadata.description);
  if (metadata.tags) form.append("tags", metadata.tags);

  return axios
    .post(`${API}/images`, form, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    })
    .then((r) => r.data);
};

export const updateImage = (id, metadata) => {
  const body = {};
  if (metadata.title !== undefined) body.title = metadata.title;
  if (metadata.description !== undefined) body.description = metadata.description;
  if (metadata.tags !== undefined) body.tags = metadata.tags;
  return axios.patch(`${API}/images/${id}`, body).then((r) => r.data);
};

export const toggleFavorite = (id, isFavorite) =>
  axios.patch(`${API}/images/${id}/favorite`, { isFavorite }).then((r) => r.data);
