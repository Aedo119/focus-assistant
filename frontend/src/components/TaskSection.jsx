import TaskCard from './TaskCard';

function TaskSection({ id, title, tasks, emptyMessage, onToggleComplete, onDelete, onEdit, tone }) {
  if (tasks.length === 0 && !emptyMessage) return null;

  return (
    <section className={`task-section ${tone ? `tone-${tone}` : ''}`}>
      <div className="task-section-header">
        <h2>{title}</h2>
        <span className="task-section-count">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="task-section-empty">{emptyMessage}</p>
      ) : (
        <div className="task-section-list">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              section={id}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TaskSection;