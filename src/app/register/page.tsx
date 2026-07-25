"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Automatically log them in after registration
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        router.push("/login"); // If auto-login fails, send to login
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the Miva Maintenance Platform</p>
        </div>

        <form onSubmit={handleRegister}>
          {error && <div style={{ color: "var(--error-color)", marginBottom: "16px", fontSize: "0.875rem", textAlign: "center" }}>{error}</div>}
          
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">First Name</label>
              <input 
                type="text" 
                name="firstName"
                className="input-field" 
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                className="input-field" 
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              placeholder="student@miva.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="input-field" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Account Type</label>
            <select 
              name="role" 
              className="input-field" 
              value={formData.role} 
              onChange={handleChange}
              style={{ appearance: "none", cursor: "pointer" }}
            >
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "16px" }}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
