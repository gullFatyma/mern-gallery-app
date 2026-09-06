# MERN Gallery - Feature Upgrade

A full-stack MERN gallery with upload, gallery grid, full-screen viewer/slider, delete, plus an
extension layer that adds image metadata, in-place metadata editing, favorites & discovery,
and reliable loading/error/empty UX states.

Images are uploaded to the backend and saved on the local disk (`server/uploads`). Express
serves that folder publicly, and MongoDB stores only the resulting image URL plus metadata
(never the image Buffer, binary, or base64).

## Features

### Base (provided & verified working)
- Upload an image with `multipart/form-data`
- Responsive gallery grid
- Full-screen image viewer with Previous / Next slider (wrap-around + Arrow keys / Escape)
- Delete an image from MongoDB and local disk

### Extension (added)
1. **Image metadata on upload** - title (required), description (optional), and up to five tags.
   Tags are normalized (trimmed, lowercased, empties removed). Cards and the viewer display them.
2. **Edit metadata without re-uploading** - an edit button on each card opens a modal pre-filled
   with the image's metadata; `PATCH /api/images/:id` saves changes. The image file and
   `imageUrl` are unchanged. Editing is also available inside the viewer.
3. **Favorites & discovery** - a persistent heart toggle on each card and in the viewer
   (`PATCH /api/images/:id/favorite`, `{ "isFavorite": true }`). Search across title, description
   and tags; an All / Favorites filter; and a Recent / Oldest sort. All backed by GET query
   parameters (the backend filters and sorts - the list is never hard-coded in React).
4. **Reliable UX states** - initial loading spinner, upload progress bar (with duplicate
   submissions disabled), visible API error with a Retry action, a distinct empty-gallery state,
   and a separate no-search-results state with a "Clear filters" action. Icon-only buttons have
   accessible labels and images have useful alt text.

## Setup

Requirements: Node.js, MongoDB running locally (default `mongodb://127.0.0.1:27017/gallery`).

### Backend
```bash
cd server
npm install
copy .env.example .env    # Windows / or: cp .env.example .env
# edit .env: set MONGO_URI (and BASE_URL if needed)
npm run dev               # http://localhost:5000
```

### Frontend
```bash
cd client
npm install
copy .env.example .env    # optional; VITE_API_URL defaults to http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## API

| Method | Endpoint | Request | Result |
|--------|----------|---------|--------|
| POST | `/api/images` | `multipart/form-data`: `image`, `title`, `description`, `tags` | `201` created document with metadata |
| GET | `/api/images` | query: `search`, `favorite=true`, `sort=recent\|oldest` | `200` filtered + sorted documents |
| PATCH | `/api/images/:id` | JSON: `{ title, description, tags }` | `200` updated metadata; `imageUrl` unchanged |
| PATCH | `/api/images/:id/favorite` | JSON: `{ "isFavorite": true\|false }` | `200` updated favorite state |
| DELETE | `/api/images/:id` | — | `200` after removing record + local file |

Validation: title is required (1–80 chars); description max 240 chars; tags up to five
normalized (trimmed, lowercased) entries. Invalid metadata returns `400`; a missing id returns
`404`. Search input is escaped before building the RegExp.

## Document shape

```js
{
  imageUrl: String,      // public URL for server/uploads/<filename>
  title: String,         // required, 1-80 chars
  description: String,   // optional, max 240 chars
  tags: [String],        // optional, up to 5 normalized tags
  isFavorite: Boolean,   // default false
  createdAt: Date
}
```

Older documents with no metadata render safe defaults: "Untitled" / empty description / empty
tags / false favorite.

## API examples

```bash
# list all images
curl http://localhost:5000/api/images

# mark a favorite
curl -X PATCH http://localhost:5000/api/images/<id>/favorite -H "Content-Type: application/json" \
  -d '{"isFavorite": true}'

# update metadata (image file / URL untouched)
curl -X PATCH http://localhost:5000/api/images/<id> -H "Content-Type: application/json" \
  -d '{"title":"New title","description":"Updated","tags":["nature","travel"]}'

# search + filter + sort
curl "http://localhost:5000/api/images?search=mountain&favorite=true&sort=recent"
```

## Screenshots

The following screenshots demonstrate the upgraded features. They are located in
`client/screenshots/`.

### Gallery grid with metadata and favorite toggle
The responsive gallery displays each image along with its title, description, and tags, plus the
favorite (heart) button, edit (pencil) button, and delete button on every card.

![Gallery grid](client/screenshots/gallery.png)

### Edit details modal
Clicking the pencil icon on a card opens a modal pre-filled with the image's metadata. Saving
calls `PATCH /api/images/:id` so the metadata changes without re-uploading the file.

![Edit details modal](client/screenshots/edit.png)

### Favorites
Clicking the heart marks an image as a favorite. The set of favorites is shown by switching to the
Favorites filter, and the state is persisted in MongoDB so it survives a refresh.

![Favorites](client/screenshots/favourite.png)

### Delete confirmation
Clicking Delete opens a confirmation dialog in the middle of the screen instead of the browser's
default popup. Confirming removes the record and the local file.

![Delete confirmation](client/screenshots/delete.png)

### Search
Typing in the search box filters across title, description, and tags via the
`GET /api/images?search=` query parameter.

![Search](client/screenshots/search.png)

### Sort / discovery controls
The Recent / Oldest sort control and the All / Favorites filter use the `sort` and `favorite`
query parameters so the backend performs the filtering and sorting.

![Sort and filter controls](client/screenshots/sort.png)

## Project structure

```
server/
  server.js            Express app + static /uploads
  models/Image.js      Mongoose schema (imageUrl + metadata + favorite)
  routes/imageRoutes.js  POST/GET/PATCH/PATCH favorite/DELETE
  middleware/upload.js Multer disk storage (safe unique filenames)
client/
  src/App.jsx          State, data loading, filters, handlers
  src/api.js           Axios helpers for every endpoint
  src/components/
    UploadForm.jsx     Upload + metadata fields + progress
    Gallery.jsx        Grid, favorite, delete, edit modal, states
    Viewer.jsx         Full-screen viewer + inline edit
```

## Storage rules

- Multer saves files in `server/uploads` with safe, unique names.
- Express exposes that folder via `/uploads`.
- MongoDB stores only the URL string plus metadata — never the image binary.
- `node_modules`, `.env`, and uploaded images are excluded via `.gitignore`.
