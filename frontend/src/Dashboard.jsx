import { useCallback, useEffect, useMemo, useState } from 'react';
import QuickAdd from './components/QuickAdd';
import TaskSection from './components/TaskSection';
import * as tasksApi from './api/tasks';
import { isOverdue, isToday, isUpcoming, formatClock, formatFullDate } from './utils/date';
import './Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(clock);
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await tasksApi.getTasks();
        if (cancelled) return;
        setTasks(data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load tasks');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (data) => {
    try {
      const task = await tasksApi.createTask(data);
      setTasks((prev) => [task, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    // Optimistic update so the UI feels instant.
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    try {
      const updated = await tasksApi.updateTask(task._id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message || 'Failed to update task');
      loadTasks();
    }
  };

  const handleEdit = async (id, data) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...data } : t)));
    try {
      const updated = await tasksApi.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message || 'Failed to update task');
      loadTasks();
    }
  };

  const handleDelete = async (id) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await tasksApi.deleteTask(id);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      setTasks(previous);
    }
  };

  const buckets = useMemo(() => {
    const active = tasks.filter((t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED');
    const completed = tasks.filter((t) => t.status === 'COMPLETED');

    const overdue = active.filter((t) => t.deadline && isOverdue(t.deadline));
    const today = active.filter((t) => !t.deadline || isToday(t.deadline));
    const upcoming = active.filter((t) => t.deadline && isUpcoming(t.deadline));

    return { today, upcoming, completed, overdue };
  }, [tasks]);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{greeting} 👋</h1>
          <p className="dashboard-date">{formatFullDate(now)}</p>
        </div>
        <div className="dashboard-clock">{formatClock(now)}</div>
      </header>

      <QuickAdd onAdd={handleAdd} />

      {error && (
        <div className="dashboard-error">
          {error}
          <button type="button" onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className="dashboard-loading">Loading your day...</p>
      ) : (
        <div className="dashboard-sections">
          {buckets.overdue.length > 0 && (
            <TaskSection
              id="overdue"
              title="Needs attention"
              tone="overdue"
              tasks={buckets.overdue}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}

          <TaskSection
            id="today"
            title="Today"
            tasks={buckets.today}
            emptyMessage="Nothing planned for today. Add something above, or enjoy the space."
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />

          <TaskSection
            id="upcoming"
            title="Upcoming"
            tasks={buckets.upcoming}
            emptyMessage="Nothing scheduled ahead yet."
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />

          <TaskSection
            id="completed"
            title="Completed"
            tasks={buckets.completed}
            emptyMessage="Nothing completed yet — that's alright."
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;