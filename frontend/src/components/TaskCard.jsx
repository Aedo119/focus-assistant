import { useState } from 'react';
import { formatDeadline } from '../utils/date';

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

  // One quiet line of metadata instead of a row of colored pills.
  const metaParts = [];
  if (task.deadline && section !== 'today') metaParts.push(formatDeadline(task.deadline));
  if (task.estimatedDuration) metaParts.push(`${task.estimatedDuration} min`);
  if (task.priority === 'HIGH') metaParts.push('High priority');
  if (isSkipped) metaParts.push('Skipped');

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

        {metaParts.length > 0 && (
          <p className={`task-card-meta ${section === 'overdue' ? 'is-attention' : ''}`}>
            {metaParts.join('  ·  ')}
          </p>
        )}
      </div>

      <button type="button" className="task-card-delete" onClick={() => onDelete(task._id)} aria-label="Delete task">
        Delete
      </button>
    </div>
  );
}

export default TaskCard;