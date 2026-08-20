import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const task = await res.json();
      setTasks([task, ...tasks]);
      setNewTaskTitle('');
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch(`${API_BASE}/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditingTitle(task.title);
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle }),
      });
      const updated = await res.json();
      setTasks(tasks.map((t) => (t._id === id ? updated : t)));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Executive Assistant</h1>
        <p>Stage 1 – Basic Tasks</p>
      </header>

      <div className="task-form">
        <form onSubmit={createTask}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Add one above!</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task._id} className={task.status === 'COMPLETED' ? 'completed' : ''}>
              {editingId === task._id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(task._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="task-row">
                  {/* Changed: replaced emoji span with a standard checkbox input */}
                  <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={() => toggleComplete(task)}
                    className="task-checkbox"
                    aria-label={`Mark "${task.title}" as ${task.status === 'COMPLETED' ? 'pending' : 'completed'}`}
                  />
                  <span className="task-title">{task.title}</span>
                  <span className="task-status">{task.status}</span>
                  <div className="task-actions">
                    <button onClick={() => startEdit(task)}>Edit</button>
                    <button onClick={() => deleteTask(task._id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;