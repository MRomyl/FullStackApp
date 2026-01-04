import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        const [c, s] = await Promise.all([api.listCourses(), api.listSessions()]);
        if (!alive) return;
        setCourses(Array.isArray(c) ? c : c.courses || []);
        setSessions(Array.isArray(s) ? s : s.sessions || []);
      } catch (err) {
        if (!alive) return;
        setError(err.message || "Failed to load dashboard");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalMinutes = useMemo(
    () => sessions.reduce((sum, ss) => sum + (Number(ss.minutes) || 0), 0),
    [sessions]
  );

  return (
    <div>
      <h2>Dashboard</h2>

      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 700 }}>Quick Stats</div>
          <div>Courses: {courses.length}</div>
          <div>Study Sessions: {sessions.length}</div>
          <div>Total Minutes: {totalMinutes}</div>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 700 }}>Next</div>
          <div style={{ marginTop: 8 }}>
            <Link to="/courses">Go manage your courses →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
