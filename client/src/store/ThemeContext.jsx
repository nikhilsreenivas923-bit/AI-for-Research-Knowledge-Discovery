import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext({
  mode: 'dark',
  resolvedMode: 'dark',
  color: 'blue',
  radius: 'md',
  setMode: () => null,
  setColor: () => null,
  setRadius: () => null,
  toggleMode: () => null,
});

export const THEME_PALETTES = {
  blue: {
    id: 'blue',
    name: 'Sapphire Blue',
    colorHex: '#3b82f6',
    bgClass: 'bg-blue-500',
    light: {
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
      ring: '221.2 83.2% 53.3%',
      glow: 'rgba(37, 99, 235, 0.3)',
    },
    dark: {
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 47.4% 11.2%',
      ring: '217.2 91.2% 59.8%',
      glow: 'rgba(59, 130, 246, 0.4)',
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    colorHex: '#10b981',
    bgClass: 'bg-emerald-500',
    light: {
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '355.7 100% 97.3%',
      ring: '142.1 76.2% 36.3%',
      glow: 'rgba(16, 185, 129, 0.35)',
    },
    dark: {
      primary: '142.1 70.6% 45.3%',
      primaryForeground: '144.9 80.4% 10%',
      ring: '142.1 70.6% 45.3%',
      glow: 'rgba(16, 185, 129, 0.45)',
    }
  },
  violet: {
    id: 'violet',
    name: 'Royal Violet',
    colorHex: '#8b5cf6',
    bgClass: 'bg-violet-500',
    light: {
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '210 40% 98%',
      ring: '262.1 83.3% 57.8%',
      glow: 'rgba(124, 58, 237, 0.35)',
    },
    dark: {
      primary: '263.4 70% 65%',
      primaryForeground: '210 40% 98%',
      ring: '263.4 70% 65%',
      glow: 'rgba(139, 92, 246, 0.45)',
    }
  },
  rose: {
    id: 'rose',
    name: 'Crimson Rose',
    colorHex: '#f43f5e',
    bgClass: 'bg-rose-500',
    light: {
      primary: '346.8 77.2% 49.8%',
      primaryForeground: '355.7 100% 97.3%',
      ring: '346.8 77.2% 49.8%',
      glow: 'rgba(225, 29, 72, 0.35)',
    },
    dark: {
      primary: '346.8 77.2% 59.8%',
      primaryForeground: '355.7 100% 97.3%',
      ring: '346.8 77.2% 59.8%',
      glow: 'rgba(244, 63, 94, 0.45)',
    }
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    colorHex: '#f97316',
    bgClass: 'bg-orange-500',
    light: {
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
      ring: '24.6 95% 53.1%',
      glow: 'rgba(234, 88, 12, 0.35)',
    },
    dark: {
      primary: '20.5 90.2% 48.2%',
      primaryForeground: '60 9.1% 97.8%',
      ring: '20.5 90.2% 48.2%',
      glow: 'rgba(249, 115, 22, 0.45)',
    }
  },
  amber: {
    id: 'amber',
    name: 'Topaz Amber',
    colorHex: '#f59e0b',
    bgClass: 'bg-amber-500',
    light: {
      primary: '37.7 92.1% 50.2%',
      primaryForeground: '48 96% 89%',
      ring: '37.7 92.1% 50.2%',
      glow: 'rgba(217, 119, 6, 0.35)',
    },
    dark: {
      primary: '43 96% 56%',
      primaryForeground: '222.2 47.4% 11.2%',
      ring: '43 96% 56%',
      glow: 'rgba(245, 158, 11, 0.45)',
    }
  },
  cyan: {
    id: 'cyan',
    name: 'Arctic Cyan',
    colorHex: '#06b6d4',
    bgClass: 'bg-cyan-500',
    light: {
      primary: '188.7 94.5% 42.7%',
      primaryForeground: '210 40% 98%',
      ring: '188.7 94.5% 42.7%',
      glow: 'rgba(8, 145, 178, 0.35)',
    },
    dark: {
      primary: '188.7 94.5% 52.7%',
      primaryForeground: '222.2 47.4% 11.2%',
      ring: '188.7 94.5% 52.7%',
      glow: 'rgba(34, 211, 238, 0.45)',
    }
  }
};

export const COLOR_PALETTES = Object.values(THEME_PALETTES);

export const RADIUS_OPTIONS = [
  { id: 'sm', label: 'Compact (8px)', value: '0.5rem' },
  { id: 'md', label: 'Standard (12px)', value: '0.75rem' },
  { id: 'lg', label: 'Spacious (16px)', value: '1rem' },
];

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try {
      return localStorage.getItem('rm_theme_mode') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [color, setColorState] = useState(() => {
    try {
      return localStorage.getItem('rm_theme_color') || 'blue';
    } catch {
      return 'blue';
    }
  });

  const [radius, setRadiusState] = useState(() => {
    try {
      return localStorage.getItem('rm_theme_radius') || 'md';
    } catch {
      return 'md';
    }
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedMode = useMemo(() => {
    if (mode === 'system') {
      return systemDark ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemDark]);

  // Synchronize DOM attributes and CSS variables immediately
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Light/Dark Mode Class
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // 2. Attach data-theme and data-color attributes for CSS selectors
    root.setAttribute('data-theme', color);
    root.setAttribute('data-color', color);
    root.setAttribute('data-radius', radius);

    // 3. Inject CSS variables directly on root.style for guaranteed instant overrides
    const palette = THEME_PALETTES[color] || THEME_PALETTES.blue;
    const vars = resolvedMode === 'dark' ? palette.dark : palette.light;

    root.style.setProperty('--primary', vars.primary);
    root.style.setProperty('--primary-foreground', vars.primaryForeground);
    root.style.setProperty('--ring', vars.ring);
    root.style.setProperty('--glow-color', vars.glow);

    // 4. Radius variable
    const radiusMap = { sm: '0.5rem', md: '0.75rem', lg: '1rem' };
    root.style.setProperty('--radius', radiusMap[radius] || '0.75rem');
  }, [resolvedMode, color, radius]);

  const setMode = (newMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('rm_theme_mode', newMode);
    } catch (e) {
      console.warn('Failed to save theme mode to localStorage:', e);
    }
  };

  const setColor = (newColor) => {
    setColorState(newColor);
    try {
      localStorage.setItem('rm_theme_color', newColor);
    } catch (e) {
      console.warn('Failed to save theme color to localStorage:', e);
    }
  };

  const setRadius = (newRadius) => {
    setRadiusState(newRadius);
    try {
      localStorage.setItem('rm_theme_radius', newRadius);
    } catch (e) {
      console.warn('Failed to save theme radius to localStorage:', e);
    }
  };

  const toggleMode = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const value = {
    mode,
    resolvedMode,
    color,
    radius,
    setMode,
    setColor,
    setRadius,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
