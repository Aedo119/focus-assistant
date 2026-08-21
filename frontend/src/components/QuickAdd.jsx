import { useState } from 'react';

function QuickAdd({ onAdd }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDeadline, setShowDeadline] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    await onAdd({
      title: trimmed,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    });

    setTitle('');
    setDeadline('');
    setShowDeadline(false);
  };

  return (
    <form className="quick-add" onSubmit={submit}>
      <input
        type="text"
        placeholder="What do you need to do?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="quick-add-input"
      />

      {showDeadline ? (
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="quick-add-date"
        />
      ) : (
        <button type="button" className="quick-add-date-toggle" onClick={() => setShowDeadline(true)}>
           Due date
        </button>
      )}

      <button type="submit" className="quick-add-submit">
        Add
      </button>
    </form>
  );
}

export default QuickAdd;