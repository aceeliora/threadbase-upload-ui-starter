import { useState, useRef } from "react";
import apiClient from "../services/apiClient.js";

// ─────────────────────────────────────────────────────────────────────────────
// TODO Task 1: Drag-and-drop
//   - add onDragOver / onDragLeave / onDrop handlers to the drop zone
//   - call e.preventDefault() in onDragOver AND onDrop
//   - read the dropped file from e.dataTransfer.files[0]
//   - toggle an `isDragging` state to apply the "dragging" class
//
// TODO Task 2: Client-side validation
//   - before uploading, check file.type is an allowed image type
//   - and file.size <= 5 * 1024 * 1024 (5MB)
//   - show an error and stop if invalid
//
// TODO Task 3: Local preview
//   - const url = URL.createObjectURL(file); use it as <img src>
//   - revoke it with URL.revokeObjectURL in a useEffect cleanup
//
// TODO Task 4: Axios upload with progress
//   - build FormData, append the file under the name "avatar"
//   - apiClient.post("/api/upload", formData, { onUploadProgress: ... })
//   - percent = Math.round((event.loaded * 100) / event.total)
//   - DO NOT set a Content-Type header
// ─────────────────────────────────────────────────────────────────────────────

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function AvatarUploader() {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  // Stub upload - replace with FormData + Axios onUploadProgress (Task 4).
  async function upload() {
    if (!file) return;
    console.log("TODO: upload", file.name);
  }

  return (
    <div>
      <div className="drop-zone" onClick={() => inputRef.current.click()}>
        <p>Drag an image here, or click to choose</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <button onClick={upload} disabled={!file}>Upload</button>
    </div>
  );
}
