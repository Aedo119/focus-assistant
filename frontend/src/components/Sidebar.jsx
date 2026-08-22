import { SunIcon, CheckSquareIcon, RepeatIcon, BarChartIcon, GearIcon } from './Icons';

const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: SunIcon, enabled: true },
  { id: 'tasks', label: 'Tasks', icon: CheckSquareIcon, enabled: false },
  { id: 'routines', label: 'Routines', icon: RepeatIcon, enabled: true },
  { id: 'progress', label: 'Progress', icon: BarChartIcon, enabled: false },
];

function Sidebar({ view, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <SunIcon width={18} height={18} />
        </div>
        <div>
          <div className="sidebar-brand-name">Focus</div>
          <div className="sidebar-brand-sub">Assistant</div>
        </div>
      </div>

      <div className="sidebar-menu-label">Menu</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon, enabled }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-nav-item ${view === id ? 'is-active' : ''} ${!enabled ? 'is-disabled' : ''}`}
            onClick={() => enabled && onNavigate(id)}
            disabled={!enabled}
            title={enabled ? undefined : 'Coming soon'}
          >
            <Icon />
            <span>{label}</span>
            {!enabled && <span className="sidebar-nav-soon">Soon</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-nav-item is-disabled" disabled title="Coming soon">
          <GearIcon />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;