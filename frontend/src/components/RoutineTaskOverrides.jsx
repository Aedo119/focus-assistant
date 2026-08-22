import { useState } from 'react';
import { toDateOnlyString, formatTime } from '../utils/date';

function findOverrideFor(routine, routineTaskId, dateStr) {
  return routine.taskOverrides?.find(
    (o) => o.routineTaskId === routineTaskId && toDateOnlyString(o.date) === dateStr
  );
}

function describeOverride(override) {
  if (override.action === 'SKIP') return 'Skipped today';
  if (override.action === 'MOVE') return `Moved to ${formatTime(override.newTime)} today`;
  if (override.action === 'REPLACE') return `Replaced with "${override.newTitle}" today`;
  return null;
}

function TaskOverrideRow({ routine, task, date, onSetOverride, onRemoveOverride }) {
  const [openAction, setOpenAction] = useState(null); // null | 'move' | 'replace'
  const [moveTime, setMoveTime] = useState(task.time || '');
  const [replaceTitle, setReplaceTitle] = useState('');

  const override = findOverrideFor(routine, task._id, date);

  const closeInline = () => {
    setOpenAction(null);
    setMoveTime(task.time || '');
    setReplaceTitle('');
  };

  const submitMove = (e) => {
    e.preventDefault();
    if (!moveTime) return;
    onSetOverride({ date, routineTaskId: task._id, action: 'MOVE', newTime: moveTime });
    closeInline();
  };

  const submitReplace = (e) => {
    e.preventDefault();
    const trimmed = replaceTitle.trim();
    if (!trimmed) return;
    onSetOverride({ date, routineTaskId: task._id, action: 'REPLACE', newTitle: trimmed });
    closeInline();
  };

  return (
    <div className="task-override-row">
      <div className="task-override-label">
        {task.time && <span className="task-override-time">{formatTime(task.time)}</span>}
        <span>{task.title}</span>
      </div>

      {override ? (
        <div className="task-override-active">
          <span>{describeOverride(override)}</span>
          <button type="button" className="button-link" onClick={() => onRemoveOverride(task._id)}>
            Undo
          </button>
        </div>
      ) : openAction === 'move' ? (
        <form className="task-override-inline" onSubmit={submitMove}>
          <input type="time" value={moveTime} onChange={(e) => setMoveTime(e.target.value)} autoFocus />
          <button type="submit" className="button-link">
            Save
          </button>
          <button type="button" className="button-link" onClick={closeInline}>
            Cancel
          </button>
        </form>
      ) : openAction === 'replace' ? (
        <form className="task-override-inline" onSubmit={submitReplace}>
          <input
            type="text"
            placeholder="Replacement title"
            value={replaceTitle}
            onChange={(e) => setReplaceTitle(e.target.value)}
            autoFocus
          />
          <button type="submit" className="button-link">
            Save
          </button>
          <button type="button" className="button-link" onClick={closeInline}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="task-override-actions">
          <button
            type="button"
            className="button-link"
            onClick={() => onSetOverride({ date, routineTaskId: task._id, action: 'SKIP' })}
          >
            Skip today
          </button>
          <button type="button" className="button-link" onClick={() => setOpenAction('move')}>
            Move today
          </button>
          <button type="button" className="button-link" onClick={() => setOpenAction('replace')}>
            Replace today
          </button>
        </div>
      )}
    </div>
  );
}

function RoutineTaskOverrides({ routine, onSetOverride, onRemoveOverride }) {
  const today = toDateOnlyString(new Date());
  const sortedTasks = [...routine.tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (sortedTasks.length === 0) return null;

  return (
    <div className="task-override-list">
      <p className="task-override-heading">Today only, without changing the routine</p>
      {sortedTasks.map((task) => (
        <TaskOverrideRow
          key={task._id}
          routine={routine}
          task={task}
          date={today}
          onSetOverride={onSetOverride}
          onRemoveOverride={(routineTaskId) => onRemoveOverride(routineTaskId, today)}
        />
      ))}
    </div>
  );
}

export default RoutineTaskOverrides;