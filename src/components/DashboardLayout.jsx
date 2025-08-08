import { useState, useEffect } from "react";
import AdminHeader from "./Header";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    // Initialize from localStorage or default to true
    const savedState = localStorage.getItem("sidebarExpanded");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [isMobile, setIsMobile] = useState(false);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(sidebarExpanded));
  }, [sidebarExpanded]);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // On mobile, always collapse sidebar but don't save this state
      if (mobile && sidebarExpanded) {
        setSidebarExpanded(false);
      } else if (!mobile) {
        // On desktop, restore saved state
        const savedState = localStorage.getItem("sidebarExpanded");
        if (savedState !== null) {
          setSidebarExpanded(JSON.parse(savedState));
        }
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Toggle sidebar and save state (only for desktop)
  const toggleSidebar = () => {
    if (!isMobile) {
      const newState = !sidebarExpanded;
      setSidebarExpanded(newState);
      localStorage.setItem("sidebarExpanded", JSON.stringify(newState));
    } else {
      // For mobile, just toggle without saving
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <AdminHeader onSidebarToggle={toggleSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="p-6">
            <div className="max-w-full mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
