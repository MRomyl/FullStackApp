import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import CourseForm from "../components/CourseForm.jsx";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setError("");
    const data = await api.listCourses();
    const list = Array.isArray(data) ? data : data.courses || [];
    setCourses(list);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message || "Failed to load courses"));
  }, []);

  async function handleCreate(payload) {
    await api.createCourse(payload);
    await load();
  }

  async function handleUpdate(id, payload) {
    await api.updateCourse(id, payload);
    setEditingId(null);
    await load();
  }

  async function handleDelete(id) {
    const ok = confirm("Delete this course? (This should also delete its sessions on the backend.)");
    if (!ok) return;
    await api.deleteCourse(id);
    await load();
  }

  return (
    <div>
      <h2>Courses</h2>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Add a course</div>
        <CourseForm submitLabel="Add" onSubmit={handleCreate} />
      </div>

      {error ? <div style={{ color: "crimson", marginTop: 10 }}>{error}</div> : null}

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {courses.map((c) => (
          <div
            key={c.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 8,
              display: "flex",
              gap: 10,
              alignItems: "center"
            }}
          >
            <div style={{ flex: 1 }}>
              {editingId === c.id ? (
                <CourseForm
                  initial={{ title: c.title }}
                  submitLabel="Save"
                  onSubmit={(payload) => handleUpdate(c.id, payload)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <Link to={`/courses/${c.id}`}>Open →</Link>
                </>
              )}
            </div>

            {editingId !== c.id ? (
              <>
                <button onClick={() => setEditingId(c.id)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </>
            ) : null}
          </div>
        ))}

        {courses.length === 0 ? <div style={{ opacity: 0.8 }}>No courses yet.</div> : null}
      </div>
    </div>
  );
}
