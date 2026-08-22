// Small, consistent line icons for the sidebar. Deliberately not pulling in
// an icon library for a handful of static glyphs — keeps the dependency
// list lean per the project's "don't add tech that isn't necessary" rule.

const common = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function SunIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

export function CheckSquareIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 12.2l2.6 2.6 5.4-5.6" />
    </svg>
  );
}

export function RepeatIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 7.5h11.5a3.5 3.5 0 013.5 3.5v1" />
      <path d="M8 4l-4 3.5L8 11" />
      <path d="M20 16.5H8.5A3.5 3.5 0 015 13v-1" />
      <path d="M16 20l4-3.5L16 13" />
    </svg>
  );
}

export function BarChartIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

export function GearIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 000-3l1.1-1.7-1.7-1.7-1.7 1.1a1.7 1.7 0 00-3 0l-.2-2H11l-.2 2a1.7 1.7 0 00-3 0l-1.7-1.1-1.7 1.7 1.1 1.7a1.7 1.7 0 000 3l-1.1 1.7 1.7 1.7 1.7-1.1a1.7 1.7 0 003 0l.2 2h2l.2-2a1.7 1.7 0 003 0l1.7 1.1 1.7-1.7z" />
    </svg>
  );
}