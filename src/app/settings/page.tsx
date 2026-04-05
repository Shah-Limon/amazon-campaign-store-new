"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
    text: "",
    type: null,
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setMessage({ text: "", type: null });

    try {
      const res = await fetch("/api/settings/delete-db", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setShowConfirm(false);
      } else {
        setMessage({ text: data.error || "Failed to clear database", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: "An error occurred while deleting data", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>

      <div className="card">
        <h3 style={{ marginBottom: "1rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>⚠️</span> Danger Zone
        </h3>
        
        <div style={{ padding: "1.5rem", border: "1px solid #fecaca", borderRadius: "8px", backgroundColor: "#fff5f5" }}>
          <h4 style={{ color: "#991b1b", marginBottom: "0.5rem" }}>Delete Database Data</h4>
          <p style={{ color: "#7f1d1d", marginBottom: "1.5rem", fontSize: "0.95rem", opacity: 0.8 }}>
            Permanently remove all campaigns, download history, and associated records. This action is irreversible.
          </p>

          {message.text && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "6px",
                marginBottom: "1.5rem",
                backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
                color: message.type === "success" ? "#166534" : "#991b1b",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                fontSize: "0.9rem",
                fontWeight: "500"
              }}
            >
              {message.type === "success" ? "✅ " : "❌ "} {message.text}
            </div>
          )}

          {!showConfirm ? (
            <button
              className="btn"
              style={{ backgroundColor: "#ef4444", padding: "0.75rem 1.5rem" }}
              onClick={() => setShowConfirm(true)}
            >
              Clear All Data
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontWeight: "600", color: "#991b1b", fontSize: "0.9rem" }}>
                Are you absolutely sure you want to delete everything?
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  className="btn"
                  style={{ backgroundColor: "#ef4444", flex: 1 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Processing..." : "Yes, Delete Everything"}
                </button>
                <button
                  className="btn"
                  style={{ backgroundColor: "#64748b", flex: 1 }}
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
