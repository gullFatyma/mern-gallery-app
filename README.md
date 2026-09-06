# 🖼️ MERN Gallery

> A full-stack MERN image gallery with powerful metadata management, favorites, search, discovery, and a polished user experience.

**MERN Gallery** is a full-stack image management application built with **MongoDB, Express, React, and Node.js**.

The application supports image uploads, metadata editing, favorites, search, sorting, full-screen viewing, and reliable loading/error states — while keeping image files separate from database records.

Images are stored locally in `server/uploads`, while MongoDB stores only the generated image URL and metadata. **No image Buffer, binary data, or base64 is stored in the database.**

---

## ✨ Features

### 📤 Upload & Metadata

Upload images together with meaningful metadata:

- Required image title
- Optional description
- Up to **5 tags**
- Automatic tag normalization
  - Trimmed
  - Lowercased
  - Empty values removed
- Upload progress indicator
- Duplicate submissions prevented during upload

---

### 🖼️ Gallery Experience

A responsive gallery interface designed for quick image discovery and management.

Each image card provides:

- Image preview
- Title
- Description
- Tags
- Favorite toggle
- Edit action
- Delete action

---

### 🔎 Search & Discovery

Find images quickly using backend-powered search and filtering.

**Search across:**
- Title
- Description
- Tags

**Filter by:**
- All images
- Favorites

**Sort by:**
- Recent
- Oldest

All discovery operations are handled through API query parameters rather than hard-coded frontend lists.

```text
GET /api/images?search=mountain&favorite=true&sort=recent
