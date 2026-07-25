"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [maintenanceOfficers, setMaintenanceOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  
  // New state for User Management
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'USERS'>('REQUESTS');
  const [users, setUsers] = useState<any[]>([]);

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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchRequests(), fetchOfficers(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        await fetchUsers();
        await fetchOfficers(); // Refresh officers list in case a role changed to MAINTENANCE
      } else {
        alert("Failed to update role");
      }
    } catch (err) {
      alert("Error updating role");
    }
  };

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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
        <button 
          onClick={() => setActiveTab('REQUESTS')}
          style={{ 
            background: "none", border: "none", color: activeTab === 'REQUESTS' ? "var(--accent-primary)" : "var(--text-secondary)",
            padding: "8px 16px", fontSize: "1rem", fontWeight: 600, cursor: "pointer",
            borderBottom: activeTab === 'REQUESTS' ? "2px solid var(--accent-primary)" : "2px solid transparent"
          }}
        >
          Service Requests
        </button>
        <button 
          onClick={() => setActiveTab('USERS')}
          style={{ 
            background: "none", border: "none", color: activeTab === 'USERS' ? "var(--accent-primary)" : "var(--text-secondary)",
            padding: "8px 16px", fontSize: "1rem", fontWeight: 600, cursor: "pointer",
            borderBottom: activeTab === 'USERS' ? "2px solid var(--accent-primary)" : "2px solid transparent"
          }}
        >
          Manage Users
        </button>
      </div>

      <div>
        {activeTab === 'REQUESTS' ? (
          <>
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
                  
                  {req.statusUpdates && req.statusUpdates.length > 0 && (
                    <div style={{ marginTop: "16px", marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "8px" }}>Audit Trail</h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {req.statusUpdates.map((update: any) => (
                          <li key={update.id} style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <span style={{ color: "var(--accent-primary)", whiteSpace: "nowrap" }}>[{new Date(update.updatedAt).toLocaleString()}]</span>
                            <span>
                              <strong style={{ color: "var(--text-primary)" }}>{update.updater.firstName} {update.updater.lastName}</strong> updated status to <strong style={{ color: getStatusColor(update.status) }}>{update.status}</strong>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>User Management</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {users.map((user) => (
                  <div key={user.id} className="glass-panel" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "4px" }}>{user.firstName} {user.lastName}</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "8px" }}>{user.email}</p>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="input-field"
                        style={{ padding: "6px 12px", fontSize: "0.875rem", marginBottom: 0, width: "auto" }}
                        disabled={session?.user?.email === user.email} // Prevent admin from changing their own role
                      >
                        <option value="STUDENT">Student</option>
                        <option value="STAFF">Staff</option>
                        <option value="MAINTENANCE">Maintenance Officer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
