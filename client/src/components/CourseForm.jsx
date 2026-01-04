import React, { useState } from "react";

export default function CourseForm({ initial = { title: "" }, submitLabel, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial.title || "");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }

    try {
      await onSubmit({ title: trimmed });
      setTitle("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course title (e.g., Biology)"
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit">{submitLabel}</button>
      {onCancel ? (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      ) : null}
      {error ? <div style={{ color: "crimson", marginLeft: 8 }}>{error}</div> : null}
    </form>
  );
}
