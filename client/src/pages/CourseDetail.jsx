import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/api.js";
import SessionForm from "../components/SessionForm.jsx";

export default function CourseDetail() {
  const { id } = useParams();
  const courseId = Number(id);

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);

  async function load() {
    setError("");
    const [c, s] = await Promise.all([api.getCourse(courseId), api.listSessions(courseId)]);
    setCourse(c);
    setSessions(Array.isArray(s) ? s : s.sessions || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message || "Failed to load course"));
  }, [courseId]);

  const totalMinutes = useMemo(
    () => sessions.reduce((sum, ss) => sum + (Number(ss.minutes) || 0), 0),
    [sessions]
  );

  async function handleCreateSession(payload) {
    await api.createSession(payload);
    await load();
  }

  async function handleUpdateSession(sessionId, payload) {
    await api.updateSession(sessionId, payload);
    setEditingSessionId(null);
    await load();
  }

  async function handleDeleteSession(sessionId) {
    const ok = confirm("Delete this session?");
    if (!ok) return;
    await api.deleteSession(sessionId);
    await load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link to="/courses">← Back</Link>
        <h2 style={{ margin: 0 }}>{course ? course.title : "Course"}</h2>
      </div>

      {error ? <div style={{ color: "crimson", marginTop: 10 }}>{error}</div> : null}

      <div style={{ marginTop: 12, border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 700 }}>Add study session</div>
        <div style={{ marginTop: 8 }}>
          <SessionForm
            courseId={courseId}
            submitLabel="Add session"
            onSubmit={handleCreateSession}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, opacity: 0.85 }}>
        Sessions: {sessions.length} • Total minutes: {totalMinutes}
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {sessions.map((ss) => (
          <div key={ss.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            {editingSessionId === ss.id ? (
              <SessionForm
                courseId={courseId}
                initial={{
                  date: ss.date?.slice?.(0, 10) || ss.date,
                  minutes: ss.minutes,
                  notes: ss.notes || ""
                }}
                submitLabel="Save"
                onSubmit={(payload) => handleUpdateSession(ss.id, payload)}
                onCancel={() => setEditingSessionId(null)}
              />
            ) : (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    {ss.date?.slice?.(0, 10) || ss.date} • {ss.minutes} min
                  </div>
                  {ss.notes ? <div style={{ marginTop: 4 }}>{ss.notes}</div> : null}
                </div>
                <button onClick={() => setEditingSessionId(ss.id)}>Edit</button>
                <button onClick={() => handleDeleteSession(ss.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}

        {sessions.length === 0 ? <div style={{ opacity: 0.8 }}>No study sessions yet.</div> : null}
      </div>
    </div>
  );
}
