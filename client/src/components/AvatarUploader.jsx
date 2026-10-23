import { useEffect, useRef, useState } from "react";
import apiClient from "../services/apiClient.js";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validate(file) {
  if (!ALLOWED.includes(file.type)) {
    return "Only image files are allowed (JPEG, PNG, WebP, GIF).";
  }

  if (file.size > MAX_SIZE) {
    return "File is too large. Choose an image that is 5 MB or smaller.";
  }

  return null;
}

export default function AvatarUploader() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!preview) return undefined;

    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function selectFile(candidate) {
    setError("");
    setUploadedUrl("");
    setProgress(0);

    if (!candidate) return;

    const validationError = validate(candidate);
    if (validationError) {
      setFile(null);
      setPreview(null);
      setError(validationError);
      return;
    }

    setFile(candidate);
    setPreview(URL.createObjectURL(candidate));
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  function handleFileChange(event) {
    selectFile(event.target.files?.[0]);
    // Allow the same file to be selected again after an error or replacement.
    event.target.value = "";
  }

  function handleDropZoneKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  async function upload() {
    if (!file || isUploading) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setError("");
    setUploadedUrl("");
    setProgress(0);
    setIsUploading(true);

    try {
      const response = await apiClient.post("/api/upload", formData, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(Math.min(100, Math.max(0, percent)));
        },
      });

      setProgress(100);
      setUploadedUrl(response.data?.url || "");
    } catch (uploadError) {
      setError(
        uploadError.response?.data?.error ||
          uploadError.response?.data?.message ||
          uploadError.message ||
          "The upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const dropZoneClass = isDragging ? "drop-zone dragging" : "drop-zone";

  return (
    <div>
      <div
        className={dropZoneClass}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleDropZoneKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Choose an avatar image or drop one here"
      >
        <p>{isDragging ? "Drop to upload" : "Drag an image here, or click to choose"}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          hidden
          onChange={handleFileChange}
        />
      </div>

      {file && <p>{file.name}</p>}
      {preview && <img src={preview} alt="Selected avatar preview" className="preview" />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {progress > 0 && (
        <>
          <div
            className="bar"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="fill" style={{ width: `${progress}%` }} />
          </div>
          <p aria-live="polite">
            {isUploading ? `Uploading: ${progress}%` : `Upload progress: ${progress}%`}
          </p>
        </>
      )}

      {uploadedUrl && (
        <p role="status">
          Upload complete: <a href={`${apiClient.defaults.baseURL || ""}${uploadedUrl}`}>{uploadedUrl}</a>
        </p>
      )}

      <button onClick={upload} disabled={!file || isUploading}>
        {isUploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
}
