"use client";
import { useEffect, useState } from "react";

export default function DownloadPage() {
  const [amount, setAmount] = useState(100);
  const [pendingCount, setPendingCount] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/stats").then(res => res.json()).then(data => {
      setPendingCount(data.pending || 0);
    });
  }, []);

  const handleDownload = async () => {
    if (amount <= 0) return;
    
    setDownloading(true);
    setMessage("");

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: amount })
      });
      const data = await res.json();
      
      if (res.ok) {
        const blob = new Blob([data.content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `campaigns_export_${data.count}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage(`Successfully downloaded ${data.count} Campaign IDs!`);
        setPendingCount(prev => prev - data.count);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">Download Campaign IDs</h1>
      
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: '#ffedd5', color: '#ea580c', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{pendingCount}</span>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Available</span>
          </div>
          <p style={{ color: '#64748b' }}>
            Specify how many <strong>Pending</strong> campaign IDs you want to download. Their status will instantly be logged as <strong>Downloaded</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#334155' }}>
              Amount to Download
            </label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              min={1}
              style={{ width: '100%', padding: '0.8rem 1rem', fontSize: '1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s' }}
              disabled={pendingCount === 0 || downloading}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[100, 500, 1000, 5000].map(val => (
              <button 
                key={val}
                type="button"
                onClick={() => setAmount(Math.min(val, pendingCount))}
                disabled={pendingCount === 0 || val > pendingCount}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '4px', cursor: pendingCount === 0 || val > pendingCount ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#475569', opacity: pendingCount === 0 || val > pendingCount ? 0.5 : 1 }}
              >
                {val}
              </button>
            ))}
          </div>

          <button 
            onClick={handleDownload}
            className="btn"
            disabled={amount <= 0 || downloading || pendingCount === 0 || isNaN(amount)}
            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', marginTop: '1rem' }}
          >
            {downloading ? "Processing Request..." : `Download ${amount > 0 && !isNaN(amount) ? amount : ''} IDs (.txt)`}
          </button>
        </div>

        {message && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '6px', textAlign: 'center', background: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#b91c1c' : '#15803d' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
