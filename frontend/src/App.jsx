import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './Dashboard';
import Routines from './Routines';
import './App.css';

function App() {
  const [view, setView] = useState('today');

  return (
    <div className="app-shell">
      <Sidebar view={view} onNavigate={setView} />
      <main className="app-content">{view === 'routines' ? <Routines /> : <Dashboard />}</main>
    </div>
  );
}

export default App;