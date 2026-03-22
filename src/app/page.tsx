"use client";
import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, downloaded: 0 });
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    fetch("/api/stats").then(res => res.json()).then(data => setStats(data));
    fetch("/api/history").then(res => res.json()).then(data => setHistory(data));
  }, []);

  const chartData = {
    labels: ['Pending', 'Downloaded'],
    datasets: [{
      data: [stats.pending, stats.downloaded],
      backgroundColor: ['#fcd34d', '#34d399'],
      borderWidth: 1,
    }]
  };

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: 'none' }}>
          <h3 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Total Campaigns</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0284c7' }}>{stats.total}</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}>
          <h3 style={{ color: '#b45309', marginBottom: '0.5rem' }}>Pending Campaigns</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#d97706' }}>{stats.pending}</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: 'none' }}>
          <h3 style={{ color: '#15803d', marginBottom: '0.5rem' }}>Downloaded IDs</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#16a34a' }}>{stats.downloaded}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Campaign Status Distribution</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Download History</h3>
          {history.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {history.map((h: any, i) => (
                <li key={i} style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: '0.9rem' }}>{new Date(h.downloadDate).toLocaleString()}</span>
                  <span className="badge badge-downloaded">Exported {h.count} IDs</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b' }}>No downloads recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
