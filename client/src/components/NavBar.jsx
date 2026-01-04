import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        background: "#000"
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20
        }}
      >
        <Link style={{ fontWeight: 800, fontSize: 18 }} to="/">
          StudyBuddy
        </Link>

        {user && (
          <>
            <Link to="/courses">Courses</Link>
          </>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          {user ? (
            <>
              <span className="muted">{user.username}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
