import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await api.login({ username, password });
      setUser(u);
      nav("/");
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="formShell">
      <div className="formCard">
        <div className="formHeader">
          <h1>Login</h1>
          <div className="muted">Welcome back. Keep the streak going.</div>
        </div>

        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

        <form className="formGrid" onSubmit={onSubmit}>
          <div style={{ display: "grid", gap: 6 }}>
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              required
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
        </form>

        <div className="smallLinkRow">
          <span className="muted">No account?</span>
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
