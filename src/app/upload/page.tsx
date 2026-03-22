"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully imported ${data.count} new campaigns!`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to upload the file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Upload Campaigns Data</h1>
      <div className="card">
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Upload a CSV file containing Amazon Campaign data. The system will parse and save it to the database with a "pending" status. Existing campaigns are smartly ignored.
        </p>
        <form onSubmit={handleUpload}>
          <div style={{ padding: '3rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem', background: '#f8fafc' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ padding: '10px', fontSize: '1rem', cursor: 'pointer' }}
              disabled={uploading}
            />
          </div>
          <button type="submit" className="btn" disabled={!file || uploading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {uploading ? "Uploading & Processing..." : "Upload CSV Data"}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '6px', background: message.includes('Error') || message.includes('Failed') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') || message.includes('Failed') ? '#b91c1c' : '#15803d' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
