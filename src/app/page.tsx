import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center"
    }} className="animate-fade-in">
      
      <div className="glass-panel" style={{
        maxWidth: "600px",
        padding: "48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px"
      }}>
        
        <div style={{
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)"
        }}>
          🔧
        </div>

        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "16px" }}>
            Miva Maintenance
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            The official portal for submitting, tracking, and resolving service requests across the university campus.
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px", width: "100%" }}>
          <Link href="/login" style={{ flex: 1, textDecoration: "none" }}>
            <button className="btn-primary" style={{ width: "100%", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
              Sign In
            </button>
          </Link>
          <Link href="/register" style={{ flex: 1, textDecoration: "none" }}>
            <button className="btn-primary" style={{ width: "100%" }}>
              Get Started
            </button>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
