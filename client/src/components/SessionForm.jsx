import React, { useState } from "react";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SessionForm({
  courseId,
  initial = { date: todayISO(), minutes: 30, notes: "" },
  submitLabel,
  onSubmit,
  onCancel
}) {
  const [date, setDate] = useState(initial.date || todayISO());
  const [minutes, setMinutes] = useState(initial.minutes ?? 30);
  const [notes, setNotes] = useState(initial.notes || "");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const mins = Number(minutes);
    if (!date) {
      setError("Date is required.");
      return;
    }
    if (!Number.isFinite(mins) || mins <= 0) {
      setError("Minutes must be a number greater than 0.");
      return;
    }

    try {
      await onSubmit({
        course_id: courseId,
        date,
        minutes: mins,
        notes: notes.trim()
      });
      setNotes("");
      setMinutes(30);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Minutes
          <input
            type="number"
            value={minutes}
            min={1}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        Notes
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you study?"
        />
      </label>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit">{submitLabel}</button>
        {onCancel ? (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        {error ? <span style={{ color: "crimson" }}>{error}</span> : null}
      </div>
    </form>
  );
}
