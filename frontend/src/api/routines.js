const API_BASE = 'http://localhost:3001/api';

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore, keep default message
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getRoutines() {
  const res = await fetch(`${API_BASE}/routines`);
  return handle(res);
}

export async function createRoutine(data) {
  const res = await fetch(`${API_BASE}/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function updateRoutine(id, data) {
  const res = await fetch(`${API_BASE}/routines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function toggleRoutine(id) {
  const res = await fetch(`${API_BASE}/routines/${id}/toggle`, { method: 'PATCH' });
  return handle(res);
}

export async function deleteRoutine(id) {
  const res = await fetch(`${API_BASE}/routines/${id}`, { method: 'DELETE' });
  return handle(res);
}

export async function pauseRoutine(id, date) {
  const res = await fetch(`${API_BASE}/routines/${id}/pause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date }),
  });
  return handle(res);
}

export async function unpauseRoutine(id, date) {
  const res = await fetch(`${API_BASE}/routines/${id}/pause?date=${encodeURIComponent(date)}`, {
    method: 'DELETE',
  });
  return handle(res);
}

export async function setTaskOverride(routineId, data) {
  const res = await fetch(`${API_BASE}/routines/${routineId}/task-overrides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function removeTaskOverride(routineId, date, routineTaskId) {
  const res = await fetch(
    `${API_BASE}/routines/${routineId}/task-overrides?date=${encodeURIComponent(date)}&routineTaskId=${encodeURIComponent(routineTaskId)}`,
    { method: 'DELETE' }
  );
  return handle(res);
}

export async function generateToday(date) {
  const res = await fetch(`${API_BASE}/routines/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(date ? { date } : {}),
  });
  return handle(res);
}