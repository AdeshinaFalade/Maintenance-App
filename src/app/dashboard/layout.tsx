"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="auth-container">Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <nav className="glass-panel" style={{ 
        margin: "16px", 
        padding: "16px 24px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "white" }}>
          Miva Maintenance
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {session?.user?.name || (session?.user as any)?.firstName} 
            <span style={{ 
              background: "rgba(59, 130, 246, 0.2)", 
              color: "var(--accent-primary)", 
              padding: "4px 8px", 
              borderRadius: "12px", 
              marginLeft: "8px",
              fontSize: "0.75rem",
              fontWeight: 600
            }}>
              {(session?.user as any)?.role}
            </span>
          </span>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              padding: "6px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--error-color)"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "0 16px 24px 16px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
