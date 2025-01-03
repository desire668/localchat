import React, { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (localStorage.theme === 'dark') return 'dark';
    if (localStorage.theme === 'light') return 'light';
    return 'system';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function applyTheme(newTheme) {
      if (newTheme === 'dark' || (newTheme === 'system' && mediaQuery.matches)) {
        document.documentElement.classList.add('dark');
        localStorage.theme = newTheme === 'system' ? 'system' : 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = newTheme === 'system' ? 'system' : 'light';
      }
    }

    function handleChange() {
      if (theme === 'system') {
        applyTheme('system');
      }
    }

    mediaQuery.addEventListener('change', handleChange);
    applyTheme(theme);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const icons = {
    light: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    dark: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    system: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  };

  const nextTheme = {
    light: 'dark',
    dark: 'system',
    system: 'light'
  };

  return (
    <button
      onClick={() => setTheme(nextTheme[theme])}
      className="text-gray-400 hover:text-white transition-colors"
      title={`当前：${theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色' : '浅色'}`}
    >
      {icons[theme]}
    </button>
  );
} 