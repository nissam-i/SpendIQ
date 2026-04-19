// Theme definitions
const THEMES = {
  light: {
    bg: '#f9fafb',
    surface: '#ffffff',
    sidebar: '#1e2a4a',
    sidebarText: '#e2e8f0',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    cardShadow: '0 1px 3px rgba(0,0,0,0.12)'
  },
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    sidebar: '#0f172a',
    sidebarText: '#cbd5e1',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    cardShadow: '0 1px 3px rgba(0,0,0,0.4)'
  }
};

const ACCENT_COLORS = {
  blue:   { primary: '#1a56db', light: '#eff6ff', hover: '#1e40af' },
  purple: { primary: '#7e3af2', light: '#f5f3ff', hover: '#6d28d9' },
  green:  { primary: '#057a55', light: '#f0fdf4', hover: '#065f46' },
  red:    { primary: '#e02424', light: '#fef2f2', hover: '#b91c1c' },
  orange: { primary: '#d97706', light: '#fffbeb', hover: '#b45309' },
  midnight: { primary: '#334155', light: '#f8fafc', hover: '#1e293b' }
};

// Apply theme using CSS custom properties on :root
function applyTheme(mode, accent) {
  const safeMode = mode || 'light';
  const safeAccent = accent || 'blue';
  
  const theme = THEMES[safeMode] || THEMES.light;
  const accentColors = ACCENT_COLORS[safeAccent] || ACCENT_COLORS.blue;
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  root.style.setProperty('--color-primary', accentColors.primary);
  root.style.setProperty('--color-primary-light', accentColors.light);
  root.style.setProperty('--color-primary-hover', accentColors.hover);
  
  // Apply dark class for Tailwind dark mode optionally
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
