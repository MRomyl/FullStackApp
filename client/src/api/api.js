async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {})
    },
    credentials: "include", // IMPORTANT: send/receive session cookie
    body: body ? JSON.stringify(body) : undefined
  });

  // Try to parse JSON; if none, return null
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // AUTH
  me: () => request("/api/auth/me"),
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  logout: () => request("/api/auth/logout", { method: "POST" }),

  // COURSES
  listCourses: () => request("/api/courses"),
  createCourse: (payload) => request("/api/courses", { method: "POST", body: payload }),
  getCourse: (id) => request(`/api/courses/${id}`),
  updateCourse: (id, payload) => request(`/api/courses/${id}`, { method: "PATCH", body: payload }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: "DELETE" }),

  // SESSIONS
  listSessions: (courseId) =>
    request(courseId ? `/api/sessions?course_id=${encodeURIComponent(courseId)}` : "/api/sessions"),
  createSession: (payload) => request("/api/sessions", { method: "POST", body: payload }),
  updateSession: (id, payload) => request(`/api/sessions/${id}`, { method: "PATCH", body: payload }),
  deleteSession: (id) => request(`/api/sessions/${id}`, { method: "DELETE" })
};
