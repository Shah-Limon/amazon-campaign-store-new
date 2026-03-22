"use client";
import { useEffect, useState } from "react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [page, status, search]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns?page=${page}&limit=10&status=${status}&search=${search}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Campaign Records</h1>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search by Campaign Name or ID..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flexGrow: 1, padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
          <select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="downloaded">Downloaded</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem' }}>Campaign ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Brand</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading campaigns...</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No campaigns found.</td></tr>
              ) : campaigns.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: 500, color: '#334155' }}>
                    {c.campaignId.substring(0, 16)}...
                  </td>
                  <td style={{ padding: '1rem' }}>{c.campaignName}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{c.brandName || "N/A"}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${c.status}`}>{c.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }} onClick={() => alert(`Full ID: ${c.campaignId}`)}>View ID</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <div>Showing page {page} of {totalPages} ({total} total records)</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ padding: '0.4rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                style={{ padding: '0.4rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
