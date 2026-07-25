"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalEvidenceUrl = evidenceUrl;

      // Upload file if selected
      if (evidenceFile) {
        const formData = new FormData();
        formData.append("file", evidenceFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalEvidenceUrl = uploadData.url;
        } else {
          alert("Failed to upload evidence file");
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, categoryId, evidenceUrl: finalEvidenceUrl })
      });
      if (res.ok) {
        setShowForm(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setCategoryId("");
        setEvidenceUrl("");
        setEvidenceFile(null);
        fetchRequests(); // Refresh list
      } else {
        alert("Failed to submit request.");
      }
    } catch (err) {
      alert("Error submitting request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "PENDING") return "var(--warning-color)";
    if (status === "RESOLVED") return "var(--success-color)";
    return "var(--accent-primary)"; // IN_PROGRESS
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Track and submit your maintenance requests</p>
        </div>
        <button className="btn-primary" style={{ width: "auto" }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Request"}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: "32px", marginBottom: "32px" }}>
          <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>Submit Service Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Title</label>
              <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Broken AC in Room 104" />
            </div>
            
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Describe the issue in detail..."></textarea>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Location</label>
                <input type="text" className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Hostel A, Room 104" />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Category</label>
                <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={{ appearance: "none", cursor: "pointer" }}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Upload Evidence Image (Optional)</label>
              <input 
                type="file" 
                className="input-field" 
                accept="image/*"
                onChange={(e) => e.target.files && setEvidenceFile(e.target.files[0])} 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: "16px" }}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>Your Recent Requests</h2>
        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="glass-panel" style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p>You haven't submitted any maintenance requests yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {requests.map((req) => (
              <div key={req.id} className="glass-panel" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "4px" }}>{req.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "8px" }}>{req.description}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>📍 {req.location}</span>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}>🏷️ {req.category.name}</span>
                  </div>
                </div>
                <div style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${getStatusColor(req.status)}`, color: getStatusColor(req.status) }}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
