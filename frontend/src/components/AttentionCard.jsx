import { formatTime } from '../utils/date';

function AttentionCard({ task, onDone, onSnooze }) {
  if (!task) return null;

  const snoozeLabel = task.time ? 'Snooze 10 min' : 'Push to tomorrow';

  return (
    <div className="attention-card">
      <span className="attention-eyebrow">Needs your attention</span>

      <p className="attention-title">{task.title}</p>

      <p className="attention-body">
        {task.time
          ? `Planned for ${formatTime(task.time)}. Check in when you're ready.`
          : 'This was due before today.'}
      </p>

      <div className="attention-actions">
        <button type="button" className="attention-button-primary" onClick={() => onDone(task)}>
          Done
        </button>
        <button type="button" className="attention-button-secondary" onClick={() => onSnooze(task)}>
          {snoozeLabel}
        </button>
      </div>
    </div>
  );
}

export default AttentionCard;