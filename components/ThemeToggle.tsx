
import React from 'react';

interface Props {
  isDark: boolean;
  toggle: () => void;
}

const ThemeToggle: React.FC<Props> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
      aria-label="切换主题"
    >
      {isDark ? (
        <i className="fa-solid fa-sun text-yellow-500"></i>
      ) : (
        <i className="fa-solid fa-moon text-indigo-600"></i>
      )}
    </button>
  );
};

export default ThemeToggle;
