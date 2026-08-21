import { useState } from 'react';
import { formatDeadline } from '../utils/date';

const PRIORITY_LABEL = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

function TaskCard({ task, section, onToggleComplete, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const isCompleted = task.status === 'COMPLETED';
  const isSkipped = task.status === 'SKIPPED';

  const submitEdit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(task.title);
      setIsEditing(false);
      return;
    }
    if (trimmed !== task.title) onEdit(task._id, { title: trimmed });
    setIsEditing(false);
  };

  return (
    <div className={`task-card ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}`}>
      <input
        type="checkbox"
        className="task-card-checkbox"
        checked={isCompleted}
        onChange={() => onToggleComplete(task)}
        aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
      />

      <div className="task-card-body">
        {isEditing ? (
          <form onSubmit={submitEdit} className="task-card-edit-form">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onBlur={submitEdit}
            />
          </form>
        ) : (
          <button
            type="button"
            className="task-card-title"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {task.title}
          </button>
        )}

        <div className="task-card-meta">
          {task.deadline && section !== 'today' && (
            <span className={`badge badge-deadline ${section === 'overdue' ? 'badge-overdue' : ''}`}>
              {formatDeadline(task.deadline)}
            </span>
          )}
          {task.estimatedDuration && (
            <span className="badge badge-duration">{task.estimatedDuration} min</span>
          )}
          {task.priority && task.priority !== 'MEDIUM' && (
            <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
          {isSkipped && <span className="badge badge-skipped">Skipped</span>}
        </div>
      </div>

      <div className="task-card-actions">
        <button type="button" className="icon-button" onClick={() => onDelete(task._id)} aria-label="Delete task">
          ✕
        </button>
      </div>
    </div>
  );
}

export default TaskCard;