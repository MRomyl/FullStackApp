import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthProvider";

function fmtMinutes(mins) {
  const m = Number(mins || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setError("");
        const [c, s] = await Promise.all([api.listCourses(), api.listSessions()]);
        if (!alive) return;
        setCourses(c || []);
        setSessions(s || []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load dashboard.");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalMinutes = (sessions || []).reduce((sum, x) => sum + (Number(x.minutes) || 0), 0);

    const todayISO = new Date().toISOString().slice(0, 10);
    const todayMinutes = (sessions || [])
      .filter((x) => x.date === todayISO)
      .reduce((sum, x) => sum + (Number(x.minutes) || 0), 0);

    const recent = [...(sessions || [])]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.id || 0) - (a.id || 0)))
      .slice(0, 5);

    return {
      totalMinutes,
      todayMinutes,
      courseCount: (courses || []).length,
      sessionCount: (sessions || []).length,
      recent
    };
  }, [courses, sessions]);

  return (
    <div className="container" style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <h1 style={{ marginBottom: 0 }}>Dashboard</h1>
        <div className="muted">
          Welcome back{user?.username ? `, ${user.username}` : ""}. Keep it simple: one course, one session,
          one win.
        </div>
      </div>

      {error && <div className="card"><div className="error">{error}</div></div>}

      {/* Top stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12
        }}
      >
        <div className="card">
          <div className="muted" style={{ fontSize: 12 }}>Today</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{fmtMinutes(stats.todayMinutes)}</div>
          <div className="muted" style={{ fontSize: 13 }}>studied</div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: 12 }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{fmtMinutes(stats.totalMinutes)}</div>
          <div className="muted" style={{ fontSize: 13 }}>all time</div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: 12 }}>Courses</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.courseCount}</div>
          <div className="muted" style={{ fontSize: 13 }}>tracked</div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: 12 }}>Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.sessionCount}</div>
          <div className="muted" style={{ fontSize: 13 }}>logged</div>
        </div>
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 12
        }}
      >
        {/* Recent sessions */}
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 style={{ margin: 0 }}>Recent sessions</h2>
            <span className="muted" style={{ fontSize: 13 }}>last 5</span>
            <div style={{ marginLeft: "auto" }}>
              <Link to="/courses" className="muted" style={{ fontSize: 13 }}>
                View courses →
              </Link>
            </div>
          </div>

          {stats.recent.length === 0 ? (
            <div className="muted">
              No sessions yet. Create a course, then log your first study session.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {stats.recent.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                    display: "grid",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 700 }}>{s.date}</div>
                    <span className="muted">•</span>
                    <div className="muted">{fmtMinutes(s.minutes)}</div>
                  </div>
                  {s.notes ? (
                    <div style={{ fontSize: 14 }}>{s.notes}</div>
                  ) : (
                    <div className="muted" style={{ fontSize: 14 }}>No notes</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Quick actions</h2>

          <div className="muted" style={{ fontSize: 14 }}>
            Keep the momentum. Add a course if you don’t have one, then log a session.
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <Link to="/courses">
              <button style={{ width: "100%" }}>Go to Courses</button>
            </Link>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 12,
                background: "rgba(255,255,255,0.02)"
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Tip</div>
              <div className="muted" style={{ fontSize: 14 }}>
                Log short sessions. 20 minutes counts — consistency beats intensity.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}
      >
        <div>
          <div style={{ fontWeight: 800 }}>Next step</div>
          <div className="muted" style={{ fontSize: 14 }}>
            Add one course you’re studying this week and log one session.
          </div>
        </div>
        <Link to="/courses">
          <button>Start</button>
        </Link>
      </div>

      {/* Mobile responsiveness */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .container > div[style*="grid-template-columns: 1.2fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
