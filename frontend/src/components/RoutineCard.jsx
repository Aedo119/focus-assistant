import { WEEKDAY_LABELS, formatTime, toDateOnlyString } from '../utils/date';

function RoutineCard({ routine, onToggleActive, onPauseToday, onResumeToday, onEdit, onDelete }) {
  const todayStr = toDateOnlyString(new Date());
  const isPausedToday = routine.pausedDates.some((d) => toDateOnlyString(d) === todayStr);
  const sortedTasks = [...routine.tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className={`routine-card ${!routine.active ? 'is-inactive' : ''}`}>
      <div className="routine-card-header">
        <div>
          <h3 className="routine-card-name">{routine.name}</h3>
          <div className="routine-card-days">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={label} className={`day-chip ${routine.days.includes(i) ? 'is-active' : ''}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <label className="routine-toggle">
          <input type="checkbox" checked={routine.active} onChange={() => onToggleActive(routine)} />
          <span>{routine.active ? 'Active' : 'Disabled'}</span>
        </label>
      </div>

      {sortedTasks.length > 0 && (
        <ul className="routine-task-list">
          {sortedTasks.map((t) => (
            <li key={t._id} className="routine-task-item">
              {t.time && <span className="routine-task-time">{formatTime(t.time)}</span>}
              <span className="routine-task-name">{t.title}</span>
              {t.duration && <span className="routine-task-duration">{t.duration} min</span>}
              {t.optional && <span className="routine-task-optional">optional</span>}
            </li>
          ))}
        </ul>
      )}

      {isPausedToday && <p className="routine-paused-note">Paused for today only. It will run as usual next time.</p>}

      <div className="routine-card-actions">
        {isPausedToday ? (
          <button type="button" className="button-link" onClick={() => onResumeToday(routine)}>
            Resume for today
          </button>
        ) : (
          <button type="button" className="button-link" onClick={() => onPauseToday(routine)}>
            Pause for today
          </button>
        )}
        <button type="button" className="button-link" onClick={() => onEdit(routine)}>
          Edit
        </button>
        <button type="button" className="button-link is-destructive" onClick={() => onDelete(routine)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default RoutineCard;