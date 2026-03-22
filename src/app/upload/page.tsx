"use client";
import { useState } from "react";
import Papa from "papaparse";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, processed: 0 });

  const chunkArray = (array: any[], size: number) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");
    setProgress(0);
    setStats({ total: 0, processed: 0 });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rawData = results.data as any[];
          const totalRows = rawData.length;
          setStats(prev => ({ ...prev, total: totalRows }));

          // Map CSV columns to database schema
          const mappedData = rawData.map(row => {
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
          let processed = 0;

          for (const chunk of chunks) {
            try {
              const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaigns: chunk }),
              });

              if (!res.ok) {
                const errData = await res.json();
                setMessage(`Error: ${errData.error || "Batch upload failed"}`);
                setUploading(false);
                return;
              }

              processed += chunk.length;
              setStats(prev => ({ ...prev, processed }));
              setProgress(Math.round((processed / mappedData.length) * 100));
            } catch (err) {
              setMessage("Lost connection to server during upload.");
              setUploading(false);
              return;
            }
          }

          setMessage(`Successfully imported ${mappedData.length} campaigns!`);
          setUploading(false);
          setFile(null);
        },
        error: (error: any) => {
          setMessage(`CSV Parsing Error: ${error.message}`);
          setUploading(false);
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Upload Campaigns Data</h1>
      <div className="card">
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Upload a CSV file containing Amazon Campaign data. Large files are safely uploaded in background chunks to avoid timeouts.
        </p>
        <form onSubmit={handleUpload}>
          <div style={{ padding: '3rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', background: '#f8fafc', transition: 'all 0.3s ease' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ padding: '10px', fontSize: '1rem', cursor: 'pointer' }}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                <span>Processing Upload... ({stats.processed} / {stats.total})</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
          )}

          <button type="submit" className="btn" disabled={!file || uploading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', position: 'relative', overflow: 'hidden' }}>
            {uploading ? "Processing Batch Data..." : "Start Secure Upload"}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '2rem', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid', borderColor: message.includes('Error') || message.includes('Failed') ? '#ef4444' : '#10b981', background: message.includes('Error') || message.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') || message.includes('Failed') ? '#991b1b' : '#065f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <span style={{ fontWeight: 600 }}>{message.includes('Error') ? 'Notice:' : 'Success!'}</span>
               <span>{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
