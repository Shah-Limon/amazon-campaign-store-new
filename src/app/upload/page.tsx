"use client";
import { useState } from "react";
import Papa from "papaparse";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, processed: 0, filesCount: 0, currentFileIndex: 0 });

  const chunkArray = (array: any[], size: number) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setMessage("");
    setProgress(0);
    setStats({ total: 0, processed: 0, filesCount: files.length, currentFileIndex: 0 });

    let grandTotalRows = 0;
    let grandProcessedRows = 0;

    // First, quickly count all rows to get an accurate progress bar
    const fileDataPromises = files.map(file => {
      return new Promise<{ name: string, data: any[] }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvText = event.target?.result as string;
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve({ name: file.name, data: results.data as any[] })
          });
        };
        reader.readAsText(file);
      });
    });

    const allFilesData = await Promise.all(fileDataPromises);
    grandTotalRows = allFilesData.reduce((acc, f) => acc + f.data.length, 0);
    setStats(prev => ({ ...prev, total: grandTotalRows }));

    if (grandTotalRows === 0) {
      setMessage("Error: No data found in selected files.");
      setUploading(false);
      return;
    }

    for (let i = 0; i < allFilesData.length; i++) {
      const fileEntry = allFilesData[i];
      setStats(prev => ({ ...prev, currentFileIndex: i + 1 }));

      // Map CSV columns to database schema
      const mappedData = fileEntry.data.map(row => {
        const campaignId = row["Campaign Id"] || row["campaignId"];
        if (!campaignId) return null;
        return {
          campaignId,
          campaignName: row["Campaign Name"] || row["campaignName"] || "Unknown",
          brandName: row["Brand Name"] || row["brandName"] || "",
          startDate: row["Campaign Start Date"] ? new Date(row["Campaign Start Date"]) : undefined,
          endDate: row["Campaign End Date"] ? new Date(row["Campaign End Date"]) : undefined,
          commissionRate: row["Commission Rate"] || row["commissionRate"] || "",
          status: "pending"
        };
      }).filter(Boolean);

      const chunks = chunkArray(mappedData, 500);

      for (const chunk of chunks) {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campaigns: chunk }),
          });

          if (!res.ok) {
            const errData = await res.json();
            setMessage(`Error in ${fileEntry.name}: ${errData.error || "Batch upload failed"}`);
            setUploading(false);
            return;
          }

          grandProcessedRows += chunk.length;
          setStats(prev => ({ ...prev, processed: grandProcessedRows }));
          setProgress(Math.round((grandProcessedRows / grandTotalRows) * 100));
        } catch (err) {
          setMessage(`Lost connection to server while uploading ${fileEntry.name}.`);
          setUploading(false);
          return;
        }
      }
    }

    setMessage(`Successfully imported ${grandProcessedRows} campaigns from ${files.length} files!`);
    setUploading(false);
    setFiles([]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Upload Campaigns Data</h1>
      <div className="card">
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Select one or more CSV files. They will be processed one by one and uploaded in background batches.
        </p>
        <form onSubmit={handleUpload}>
          <div style={{ padding: '3rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', marginBottom: '1rem', background: '#f8fafc', transition: 'all 0.3s ease' }}>
            <input 
              type="file" 
              accept=".csv" 
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              style={{ padding: '10px', fontSize: '1rem', cursor: 'pointer' }}
              disabled={uploading}
            />
          </div>
          
          {files.length > 0 && !uploading && (
            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
               Selected: {files.length} file(s)
            </div>
          )}

          {uploading && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                <span>File {stats.currentFileIndex} of {stats.filesCount} ({stats.processed} / {stats.total} total rows)</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
          )}

          <button type="submit" className="btn" disabled={files.length === 0 || uploading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {uploading ? "Processing Files..." : `Upload ${files.length} File${files.length === 1 ? '' : 's'}`}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '2rem', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid', borderColor: message.includes('Error') || message.includes('Failed') ? '#ef4444' : '#10b981', background: message.includes('Error') || message.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') || message.includes('Failed') ? '#991b1b' : '#065f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <span style={{ fontWeight: 600 }}>{message.includes('Error') ? 'Notice:' : 'Finished!'}</span>
               <span>{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
