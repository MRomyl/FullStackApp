import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div style={{ borderBottom: "1px solid #ddd", padding: "12px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/dashboard" style={{ textDecoration: "none", fontWeight: 700 }}>
          StudyBuddy
        </Link>

        <div style={{ display: "flex", gap: 10 }}>
          {user ? (
            <>
              <Link to="/courses">Courses</Link>
            </>
          ) : null}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: 14, opacity: 0.8 }}>Hi, {user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
