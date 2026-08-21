import { useState } from 'react';
import { WEEKDAY_LABELS } from '../utils/date';

let localRowId = 0;
function newRow(task) {
  return {
    key: 'row-' + localRowId++,
    title: task?.title || '',
    time: task?.time || '',
    duration: task?.duration ?? '',
    optional: task?.optional || false,
  };
}

function RoutineForm({ initialRoutine, onSave, onCancel }) {
  const [name, setName] = useState(initialRoutine?.name || '');
  const [days, setDays] = useState(initialRoutine?.days || []);
  const [rows, setRows] = useState(
    initialRoutine?.tasks?.length ? initialRoutine.tasks.map(newRow) : [newRow()]
  );
  const [error, setError] = useState(null);

  const toggleDay = (day) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const updateRow = (key, patch) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRow = (key) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);

  const submit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Give this routine a name.');
      return;
    }
    if (days.length === 0) {
      setError('Pick at least one day.');
      return;
    }

    const tasks = rows
      .map((r) => ({
        title: r.title.trim(),
        time: r.time || null,
        duration: r.duration === '' ? null : Number(r.duration),
        optional: r.optional,
      }))
      .filter((t) => t.title);

    if (tasks.length === 0) {
      setError('Add at least one task to the routine.');
      return;
    }

    onSave({ name: trimmedName, days, tasks });
  };

  return (
    <form className="routine-form" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="routine-name">Name</label>
        <input
          id="routine-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tuesday Routine"
        />
      </div>

      <div className="form-field">
        <label>Days</label>
        <div className="day-picker">
          {WEEKDAY_LABELS.map((label, i) => (
            <button
              type="button"
              key={label}
              className={`day-toggle ${days.includes(i) ? 'is-selected' : ''}`}
              onClick={() => toggleDay(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>Tasks</label>
        <div className="routine-task-rows">
          {rows.map((row) => (
            <div className="routine-task-row" key={row.key}>
              <input
                type="text"
                placeholder="Task title"
                value={row.title}
                onChange={(e) => updateRow(row.key, { title: e.target.value })}
                className="routine-task-title-input"
              />
              <input
                type="time"
                value={row.time}
                onChange={(e) => updateRow(row.key, { time: e.target.value })}
                className="routine-task-time-input"
              />
              <input
                type="number"
                min="0"
                placeholder="min"
                value={row.duration}
                onChange={(e) => updateRow(row.key, { duration: e.target.value })}
                className="routine-task-duration-input"
              />
              <button
                type="button"
                className="routine-task-remove"
                onClick={() => removeRow(row.key)}
                aria-label="Remove task"
                disabled={rows.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="routine-task-add" onClick={addRow}>
          + Add task
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button-primary">
          Save routine
        </button>
      </div>
    </form>
  );
}

export default RoutineForm;