import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthProvider";

export default function Register() {
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
      const u = await api.register({ username, password });
      setUser(u);
      nav("/");
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="formShell">
      <div className="formCard">
        <div className="formHeader">
          <h1>Create account</h1>
          <div className="muted">Takes 10 seconds. Track your courses instantly.</div>
        </div>

        {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

        <form className="formGrid" onSubmit={onSubmit}>
          <div style={{ display: "grid", gap: 6 }}>
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="egon"
              autoComplete="username"
              required
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <button disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        </form>

        <div className="smallLinkRow">
          <span className="muted">Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
