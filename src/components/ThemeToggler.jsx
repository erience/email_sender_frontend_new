"use client";

import { HiMoon, HiSun } from "react-icons/hi";
import { useEffect, useState } from "react";

const ThemeToggler = () => {
  const [currentTheme, setCurrentTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "light"
      : "light"
  );

  const themeChanger = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.remove(currentTheme);
    document.documentElement.classList.add(newTheme);
    setCurrentTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.add(currentTheme);
  }, [currentTheme]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className={`relative flex items-center w-14 h-7 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        currentTheme === "dark"
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500"
          : "bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-300"
      }`}
      onClick={themeChanger}
    >
      {/* Toggle Circle */}
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-lg transform transition-all duration-300 ${
          currentTheme === "dark" ? "translate-x-7" : "translate-x-0.5"
        }`}
      >
        {currentTheme === "dark" ? (
          <HiMoon className="w-3 h-3 text-indigo-600" />
        ) : (
          <HiSun className="w-3 h-3 text-orange-500" />
        )}
      </span>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <HiSun
          className={`w-3 h-3 transition-opacity duration-300 ${
            currentTheme === "dark" ? "opacity-50 text-white" : "opacity-0"
          }`}
        />
        <HiMoon
          className={`w-3 h-3 transition-opacity duration-300 ${
            currentTheme === "dark" ? "opacity-0" : "opacity-50 text-white"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggler;
