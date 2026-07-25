"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function MaintenanceDashboard() {
  const { data: session } = useSession();
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (res.ok) {
        setAssignedJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchJobs(); // Refresh the job list to see updated status
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "PENDING") return "var(--warning-color)";
    if (status === "RESOLVED") return "var(--success-color)";
    return "var(--accent-primary)"; // IN_PROGRESS
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Maintenance Dashboard</h1>
        <p style={{ color: "var(--text-secondary)" }}>View and update your assigned service requests</p>
      </div>

      <div>
        <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>My Assigned Jobs</h2>
        {loading ? (
          <p>Loading jobs...</p>
        ) : assignedJobs.length === 0 ? (
          <div className="glass-panel" style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p>You have no assigned maintenance jobs currently.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {assignedJobs.map((req) => (
              <div key={req.id} className="glass-panel" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "4px" }}>{req.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "8px" }}>{req.description}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>👤 {req.submitter.firstName} {req.submitter.lastName}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>📍 {req.location}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>🏷️ {req.category.name}</span>
                  </div>
                  {req.evidenceUrl && (
                    <div style={{ marginTop: "12px" }}>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Evidence Image:</p>
                      <img src={req.evidenceUrl} alt="Evidence" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                  <select 
                    value={req.status}
                    onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                    style={{ 
                      padding: "6px 12px", 
                      borderRadius: "20px", 
                      fontSize: "0.75rem", 
                      fontWeight: 700, 
                      border: `1px solid ${getStatusColor(req.status)}`, 
                      color: getStatusColor(req.status),
                      background: "transparent",
                      cursor: "pointer",
                      outline: "none",
                      appearance: "none"
                    }}
                  >
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Update Status</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
