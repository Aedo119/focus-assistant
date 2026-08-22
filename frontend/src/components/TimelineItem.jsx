function TimelineItem({ task, isCurrent, isLast, onToggleComplete }) {
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div className={`timeline-row ${isLast ? 'is-last' : ''}`}>
      <div className="timeline-time">{task.time ? formatTimeShort(task.time) : ''}</div>

      <div className="timeline-track">
        <button
          type="button"
          className={`timeline-dot ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''}`}
          onClick={() => onToggleComplete(task)}
          aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
        />
        {!isLast && <div className="timeline-line" />}
      </div>

      <div className={`timeline-content ${isCurrent ? 'is-current' : ''}`}>
        <div className="timeline-content-row">
          <span className={`timeline-title ${isCompleted ? 'is-completed' : ''}`}>{task.title}</span>
          {isCurrent && <span className="timeline-now-badge">Now</span>}
        </div>
        {task.estimatedDuration && !isCompleted && (
          <p className="timeline-subtitle">{task.estimatedDuration} minutes</p>
        )}
      </div>
    </div>
  );
}

function formatTimeShort(time) {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d
    .toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
    .replace(/^24/, '00');
}

export default TimelineItem;