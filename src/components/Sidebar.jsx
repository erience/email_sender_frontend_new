import React, { useState, useContext, createContext } from "react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as FiIcons from "react-icons/fi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Create Navigation Context
const NavigationContext = createContext();

// Navigation Provider Component
export const NavigationProvider = ({ children }) => {
  const [activeMenuItem, setActiveMenuItem] = useState(() => {
    // Initialize from localStorage or default to dashboard
    return localStorage.getItem("activeMenuItem") || "dashboard";
  });

  const setActiveItem = (itemId) => {
    setActiveMenuItem(itemId);
    localStorage.setItem("activeMenuItem", itemId);
  };

  return (
    <NavigationContext.Provider value={{ activeMenuItem, setActiveItem }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use navigation context
const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

const iconMap = {
  ...FaIcons,
  ...MdIcons,
  ...HiIcons,
  ...FiIcons,
};

export const menus = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "FaTachometerAlt",
    path: "/dashboard",
    // Optional: Define path patterns that should activate this menu item
    pathPatterns: ["/dashboard", "/"],
  },
  {
    id: "campaign",
    name: "Campaign",
    icon: "FaBullhorn",
    path: "/campaign",
    pathPatterns: ["/campaign", "/campaign/*"],
  },
  {
    id: "sms",
    name: "SMS",
    icon: "FiSend",
    path: "/sms",
    pathPatterns: ["/sms", "/sms/*"],
  },
  {
    id: "htmlConverter",
    name: "Docs to HTML",
    icon: "FaFileCode",
    path: "/html",
    pathPatterns: ["/html"],
  },
  {
    id: "smtpConfigs",
    name: "SMTP Config",
    icon: "FaServer",
    path: "/smtp-config",
    pathPatterns: ["/smtp-config"],
  },
];

const SidebarItem = ({ item, level = 0, isExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMenuItem, setActiveItem } = useNavigation();

  const IconComponent =
    item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;

  // Enhanced active state checking
  const isActive = (() => {
    // Primary check: use context state
    if (activeMenuItem === item.id) return true;

    // Fallback: check path patterns for initial load or direct URL access
    if (item.pathPatterns) {
      return item.pathPatterns.some((pattern) => {
        if (pattern.includes("*")) {
          const basePattern = pattern.replace("/*", "");
          return location.pathname.startsWith(basePattern);
        }
        return location.pathname === pattern;
      });
    }

    // Final fallback: exact path match
    return location.pathname === item.path;
  })();

  // Auto-sync context with URL on initial load
  React.useEffect(() => {
    if (item.pathPatterns) {
      const matchesPattern = item.pathPatterns.some((pattern) => {
        if (pattern.includes("*")) {
          const basePattern = pattern.replace("/*", "");
          return location.pathname.startsWith(basePattern);
        }
        return location.pathname === pattern;
      });

      if (matchesPattern && activeMenuItem !== item.id) {
        setActiveItem(item.id);
      }
    }
  }, [
    location.pathname,
    item.id,
    item.pathPatterns,
    activeMenuItem,
    setActiveItem,
  ]);

  // Handle navigation with state management
  const handleNavigation = (e) => {
    if (!isExpanded && hasChildren) {
      e.preventDefault();
      setShowSubmenu(!showSubmenu);
      return;
    }

    if (item.path) {
      // Set active item in context
      setActiveItem(item.id);

      // Navigate programmatically for better control
      e.preventDefault();
      navigate(item.path);
    }
  };

  // Handle click for items with children when sidebar is collapsed
  const handleItemClick = (e) => {
    if (!isExpanded && hasChildren) {
      e.preventDefault();
      setShowSubmenu(!showSubmenu);
    } else {
      handleNavigation(e);
    }
  };

  return (
    <li
      className="relative"
      onMouseEnter={() => {
        setIsHovered(true);
        if (!isExpanded && hasChildren) setShowSubmenu(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isExpanded) setShowSubmenu(false);
      }}
    >
      {item.path ? (
        <Link
          to={item.path}
          onClick={handleItemClick}
          className={`flex items-center rounded-xl transition-all duration-200 group relative ${
            isExpanded ? "px-4 py-3 mx-3 mb-2" : "p-3 mx-2 mb-2 justify-center"
          } ${
            isActive
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg dark:from-blue-600 dark:to-indigo-600 transform scale-105"
              : "text-gray-300 hover:bg-white/10 hover:text-white dark:text-gray-400 dark:hover:bg-white/5 hover:scale-105"
          }`}
        >
          <div
            className={`flex items-center justify-center ${
              isExpanded ? "w-6 h-6" : "w-5 h-5"
            }`}
          >
            {IconComponent && <IconComponent className="w-5 h-5" />}
          </div>

          {isExpanded && (
            <span className="ml-4 font-medium transition-all duration-200">
              {item.name}
            </span>
          )}

          {/* Enhanced active indicator for expanded */}
          {isActive && isExpanded && (
            <>
              <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-white/10 rounded-xl blur-sm -z-10"></div>
            </>
          )}

          {/* Enhanced active indicator for collapsed */}
          {isActive && !isExpanded && (
            <>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-l-full shadow-lg"></div>
              <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-sm -z-10"></div>
            </>
          )}

          {/* Tooltip for collapsed sidebar */}
          {!isExpanded && isHovered && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-xl border border-gray-600 dark:border-gray-500">
              {item.name}
              {isActive && (
                <span className="ml-2 text-xs bg-blue-500 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800 dark:border-r-gray-700"></div>
            </div>
          )}
        </Link>
      ) : (
        <div
          className={`flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
            isExpanded ? "px-4 py-3 mx-3 mb-2" : "p-3 mx-2 mb-2 justify-center"
          } ${
            showSubmenu
              ? "bg-white/10 text-white dark:bg-white/5 scale-105"
              : "text-gray-300 hover:bg-white/10 hover:text-white dark:text-gray-400 dark:hover:bg-white/5 hover:scale-105"
          }`}
          onClick={() => isExpanded && setShowSubmenu(!showSubmenu)}
        >
          <div
            className={`flex items-center justify-center ${
              isExpanded ? "w-6 h-6" : "w-5 h-5"
            }`}
          >
            {IconComponent && <IconComponent className="w-5 h-5" />}
          </div>

          {isExpanded && (
            <>
              <span className="ml-4 font-medium flex-1">{item.name}</span>
              {hasChildren && (
                <FiChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showSubmenu ? "rotate-90" : ""
                  }`}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Submenu */}
      {hasChildren && showSubmenu && (
        <ul
          className={`${
            isExpanded
              ? "ml-6 space-y-1"
              : "absolute left-full top-0 min-w-[220px] bg-gray-800/95 dark:bg-gray-700/95 backdrop-blur-sm shadow-2xl rounded-xl p-2 z-50 border border-gray-600 dark:border-gray-500"
          }`}
        >
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              isExpanded={isExpanded}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ isExpanded = true, onToggle, isMobile = false }) => {
  // Prevent sidebar auto-expansion on menu click
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile ? "fixed" : "relative"
        } left-0 top-0 h-full bg-gradient-to-b from-gray-800 via-gray-850 to-gray-900 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-all duration-300 ease-in-out z-50 shadow-2xl ${
          isExpanded ? "w-64" : "w-20"
        } ${isMobile && !isExpanded ? "-translate-x-full" : "translate-x-0"}`}
        onClick={handleMenuClick}
      >
        {/* Header */}
        <div
          className={`flex items-center border-b border-gray-700/50 dark:border-gray-600/50 ${
            isExpanded ? "justify-between p-4" : "justify-center py-4 px-2"
          }`}
        >
          {/* Logo Section */}
          <div
            className={`flex items-center ${
              isExpanded ? "space-x-3" : "justify-center"
            }`}
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg">
              <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            </div>
          </div>

          {/* Toggle Button for Expanded State */}
          {!isMobile && isExpanded && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-300 hover:text-white transition-all duration-200"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand Button for Collapsed State */}
        {!isMobile && !isExpanded && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-4 p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-300 hover:text-white transition-all duration-200 shadow-lg border-2 border-gray-600 dark:border-gray-500 z-10"
          >
            <FiChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Navigation */}
        <nav
          className={`flex-1 py-4 ${
            isExpanded ? "overflow-y-auto" : "overflow-visible"
          }`}
        >
          <ul className="space-y-1">
            {menus.map((menu) => (
              <SidebarItem key={menu.id} item={menu} isExpanded={isExpanded} />
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
