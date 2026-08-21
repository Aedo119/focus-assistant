import { useState } from 'react';
import Dashboard from './Dashboard';
import Routines from './Routines';
import './App.css';

function App() {
  const [view, setView] = useState('today');

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <button
          type="button"
          className={`app-nav-item ${view === 'today' ? 'is-active' : ''}`}
          onClick={() => setView('today')}
        >
          Today
        </button>
        <button
          type="button"
          className={`app-nav-item ${view === 'routines' ? 'is-active' : ''}`}
          onClick={() => setView('routines')}
        >
          Routines
        </button>
      </nav>

      {view === 'today' ? <Dashboard /> : <Routines />}
    </div>
  );
}

export default App;