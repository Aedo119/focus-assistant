import { WEEKDAY_LABELS, formatTime } from '../utils/date';

const PREVIEW_COUNT = 3;

function RoutineCard({ routine, onToggleActive, onEdit }) {
  const sortedTasks = [...routine.tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const preview = sortedTasks.slice(0, PREVIEW_COUNT);
  const extra = sortedTasks.length - preview.length;

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

        <label className="switch" title={routine.active ? 'Active' : 'Disabled'}>
          <input type="checkbox" checked={routine.active} onChange={() => onToggleActive(routine)} />
          <span className="switch-track">
            <span className="switch-thumb" />
          </span>
        </label>
      </div>

      {preview.length > 0 && (
        <ul className="routine-task-list">
          {preview.map((t) => (
            <li key={t._id} className="routine-task-item">
              {t.time && <span className="routine-task-time">{formatTime(t.time)}</span>}
              <span className="routine-task-name">{t.title}</span>
            </li>
          ))}
          {extra > 0 && <li className="routine-task-more">+{extra} more</li>}
        </ul>
      )}

      <button type="button" className="routine-edit-button" onClick={() => onEdit(routine)}>
        Edit routine
      </button>
    </div>
  );
}

export default RoutineCard;