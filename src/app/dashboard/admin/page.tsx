"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [maintenanceOfficers, setMaintenanceOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (res.ok) {
        setAllRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await fetch("/api/users/maintenance");
      const data = await res.json();
      if (res.ok) {
        setMaintenanceOfficers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchRequests(), fetchOfficers()]).finally(() => setLoading(false));
  }, []);

  const handleAssign = async (requestId: string, maintenanceId: string) => {
    if (!maintenanceId) return;
    setAssigningId(requestId);
    
    try {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceId })
      });
      if (res.ok) {
        await fetchRequests(); // Refresh data
      } else {
        alert("Failed to assign request");
      }
    } catch (err) {
      alert("Error assigning request");
    } finally {
      setAssigningId(null);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "PENDING") return "var(--warning-color)";
    if (status === "RESOLVED") return "var(--success-color)";
    return "var(--accent-primary)"; // IN_PROGRESS
  };

  const total = allRequests.length;
  const pending = allRequests.filter(r => r.status === "PENDING").length;
  const resolved = allRequests.filter(r => r.status === "RESOLVED").length;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Admin Dashboard</h1>
        <p style={{ color: "var(--text-secondary)" }}>Manage all service requests and assignments</p>
      </div>

      <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
        <div className="glass-panel" style={{ flex: 1, padding: "24px" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Requests</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, margin: "8px 0 0 0" }}>{total}</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: "24px" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Pending</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--warning-color)", margin: "8px 0 0 0" }}>{pending}</p>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: "24px" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px" }}>Resolved</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--success-color)", margin: "8px 0 0 0" }}>{resolved}</p>
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>All Service Requests</h2>
        {loading ? (
          <p>Loading requests...</p>
        ) : allRequests.length === 0 ? (
          <div className="glass-panel" style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p>No maintenance requests have been submitted yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {allRequests.map((req) => (
              <div key={req.id} className="glass-panel" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "4px" }}>{req.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "8px" }}>{req.description}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>👤 {req.submitter.firstName} {req.submitter.lastName}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>📍 {req.location}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>🏷️ {req.category?.name || 'Uncategorized'}</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {req.status === "PENDING" && (
                    <select 
                      className="input-field" 
                      style={{ padding: "6px 12px", fontSize: "0.875rem", marginBottom: 0 }}
                      onChange={(e) => handleAssign(req.id, e.target.value)}
                      value=""
                      disabled={assigningId === req.id}
                    >
                      <option value="" disabled>{assigningId === req.id ? 'Assigning...' : 'Assign to...'}</option>
                      {maintenanceOfficers.map(officer => (
                        <option key={officer.id} value={officer.id}>
                          {officer.firstName} {officer.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                  {req.assignment && (
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      Assigned to: <strong style={{ color: "var(--text-primary)" }}>{req.assignment.maintenanceOfficer.firstName}</strong>
                    </div>
                  )}
                  <div style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${getStatusColor(req.status)}`, color: getStatusColor(req.status) }}>
                    {req.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
