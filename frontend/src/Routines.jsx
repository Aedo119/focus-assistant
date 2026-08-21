import { useEffect, useState } from 'react';
import RoutineCard from './components/RoutineCard';
import RoutineForm from './components/RoutineForm';
import * as routinesApi from './api/routines';
import { toDateOnlyString } from './utils/date';
import './Routines.css';

function Routines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | 'create' | routine object being edited

  const load = async () => {
    try {
      const data = await routinesApi.getRoutines();
      setRoutines(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load routines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await routinesApi.getRoutines();
        if (cancelled) return;
        setRoutines(data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load routines');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (data) => {
    try {
      if (formMode && formMode !== 'create') {
        await routinesApi.updateRoutine(formMode._id, data);
      } else {
        await routinesApi.createRoutine(data);
      }
      setFormMode(null);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to save routine');
    }
  };

  const handleToggleActive = async (routine) => {
    setRoutines((prev) => prev.map((r) => (r._id === routine._id ? { ...r, active: !r.active } : r)));
    try {
      await routinesApi.toggleRoutine(routine._id);
    } catch (err) {
      setError(err.message || 'Failed to update routine');
      load();
    }
  };

  const handlePauseToday = async (routine) => {
    const today = toDateOnlyString(new Date());
    try {
      await routinesApi.pauseRoutine(routine._id, today);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to pause routine');
    }
  };

  const handleResumeToday = async (routine) => {
    const today = toDateOnlyString(new Date());
    try {
      await routinesApi.unpauseRoutine(routine._id, today);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to resume routine');
    }
  };

  const handleDelete = async (routine) => {
    if (!window.confirm(`Delete "${routine.name}"? This can't be undone.`)) return;
    const previous = routines;
    setRoutines((prev) => prev.filter((r) => r._id !== routine._id));
    try {
      await routinesApi.deleteRoutine(routine._id);
    } catch (err) {
      setError(err.message || 'Failed to delete routine');
      setRoutines(previous);
    }
  };

  return (
    <div className="dashboard routines-page">
      <header className="dashboard-header">
        <div>
          <h1>Routines</h1>
          <p className="dashboard-date">Reusable plans for your recurring days.</p>
        </div>
        {!formMode && (
          <button type="button" className="button-primary" onClick={() => setFormMode('create')}>
            New routine
          </button>
        )}
      </header>

      {error && (
        <div className="dashboard-error">
          {error}
          <button type="button" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {formMode && (
        <RoutineForm
          initialRoutine={formMode !== 'create' ? formMode : null}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {loading ? (
        <p className="dashboard-loading">Loading your routines...</p>
      ) : routines.length === 0 && !formMode ? (
        <p className="task-section-empty">
          No routines yet. A routine is a reusable set of tasks for the days that repeat — mornings, a
          weekday plan, laundry day. Add one when you're ready.
        </p>
      ) : (
        <div className="routine-list">
          {routines.map((routine) => (
            <RoutineCard
              key={routine._id}
              routine={routine}
              onToggleActive={handleToggleActive}
              onPauseToday={handlePauseToday}
              onResumeToday={handleResumeToday}
              onEdit={setFormMode}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Routines;