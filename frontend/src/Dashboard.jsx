import { useMemo, useState, useEffect } from 'react';
import QuickAdd from './components/QuickAdd';
import TaskSection from './components/TaskSection';
import TimelineItem from './components/TimelineItem';
import AttentionCard from './components/AttentionCard';
import * as tasksApi from './api/tasks';
import * as routinesApi from './api/routines';
import { isOverdue, isToday, isUpcoming, formatClock, formatFullDate } from './utils/date';
import './Dashboard.css';

function shiftTime(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, (m || 0) + minutes, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isTaskCurrent(task, now) {
  if (!task.time || task.status === 'COMPLETED') return false;
  const [h, m] = task.time.split(':').map(Number);
  if (Number.isNaN(h)) return false;
  const start = new Date(now);
  start.setHours(h, m || 0, 0, 0);
  const durationMs = (task.estimatedDuration || 30) * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);
  return now >= start && now <= end;
}

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Turn any active routines scheduled for today into real tasks
        // before loading the list. Safe to call every time — it's
        // idempotent on the backend.
        await routinesApi.generateToday().catch(() => {
          // Routine generation failing shouldn't block the rest of the
          // dashboard from loading — the user's own tasks still matter.
        });

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

  const reload = async () => {
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    }
  };

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
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    try {
      const updated = await tasksApi.updateTask(task._id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message || 'Failed to update task');
      reload();
    }
  };

  const handleSnooze = async (task) => {
    try {
      let updated;
      if (task.time) {
        const newTime = shiftTime(task.time, 10);
        const newDeadline = new Date(task.deadline);
        const [h, m] = newTime.split(':').map(Number);
        newDeadline.setHours(h, m, 0, 0);
        updated = await tasksApi.updateTask(task._id, { time: newTime, deadline: newDeadline.toISOString() });
      } else {
        const newDeadline = new Date(task.deadline || Date.now());
        newDeadline.setDate(newDeadline.getDate() + 1);
        updated = await tasksApi.updateTask(task._id, { deadline: newDeadline.toISOString() });
      }
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message || 'Failed to reschedule task');
    }
  };

  const handleEdit = async (id, data) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...data } : t)));
    try {
      const updated = await tasksApi.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message || 'Failed to update task');
      reload();
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
    const today = tasks
      .filter((t) => t.status !== 'CANCELLED' && (!t.deadline || isToday(t.deadline)))
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });
    const upcoming = active.filter((t) => t.deadline && isUpcoming(t.deadline));

    return { today, upcoming, completed, overdue };
  }, [tasks]);

  const attentionTask = useMemo(() => {
    if (buckets.overdue.length > 0) return buckets.overdue[0];
    return buckets.today.find((t) => isTaskCurrent(t, now)) || null;
  }, [buckets, now]);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  return (
    <div className="today-page">
      <header className="today-header">
        <div>
          <h1>{greeting}</h1>
          <p className="today-date">{formatFullDate(now)}</p>
          <p className="today-subtitle">Here is what is happening today.</p>
        </div>
        <div className="today-clock">{formatClock(now)}</div>
      </header>

      {error && (
        <div className="dashboard-error">
          {error}
          <button type="button" onClick={reload}>
            Retry
          </button>
        </div>
      )}

      <div className="today-layout">
        <div className="today-main">
          <p className="timeline-label">Today</p>

          {loading ? (
            <p className="dashboard-loading">Loading your day...</p>
          ) : buckets.today.length === 0 ? (
            <p className="task-section-empty">
              Nothing planned for today. Add something below, or enjoy the space.
            </p>
          ) : (
            <div className="timeline">
              {buckets.today.map((task, i) => (
                <TimelineItem
                  key={task._id}
                  task={task}
                  isCurrent={isTaskCurrent(task, now)}
                  isLast={i === buckets.today.length - 1}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="today-side">
          <AttentionCard task={attentionTask} onDone={handleToggleComplete} onSnooze={handleSnooze} />
        </div>
      </div>

      {!loading && (buckets.upcoming.length > 0 || buckets.completed.length > 0) && (
        <div className="dashboard-sections">
          <TaskSection
            id="upcoming"
            title="Upcoming"
            tasks={buckets.upcoming}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <TaskSection
            id="completed"
            title="Completed"
            tasks={buckets.completed}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      )}

      <div className="today-quickadd">
        <QuickAdd onAdd={handleAdd} />
      </div>
    </div>
  );
}

export default Dashboard;