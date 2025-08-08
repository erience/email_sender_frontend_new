import React, { useState, useRef, useEffect } from "react";
import ThemeToggler from "./ThemeToggler";
import { FiLogOut, FiChevronDown, FiMenu } from "react-icons/fi";
import { signout } from "../services/authServices";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ onSidebarToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signout();
      navigate("/auth");
    } catch (error) {
      navigate("/auth");
    }
    setDropdownOpen(false);
  };

  return (
    <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <FiMenu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggler />

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200/60 dark:border-gray-600/60 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="relative">
                <img
                  src="/favicon.png"
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-600 rounded-full"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {userInfo && <>{userInfo.name}</>}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userInfo && <>{userInfo.role}</>}
                </p>
              </div>
              <FiChevronDown
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {/* User Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 border-b border-gray-200/60 dark:border-gray-600/60">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/favicon.png"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-500 shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {userInfo && <>{userInfo.name}</>}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {userInfo && <>{userInfo.email}</>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                  >
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 group-hover:bg-red-200 dark:group-hover:bg-red-900/70 transition-colors">
                      <FiLogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
