import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiArrowLeft,
  FiSearch,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiClock,
  FiHelpCircle,
} from "react-icons/fi";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Auto redirect countdown
  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, autoRedirect]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const quickLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      name: "Campaigns",
      path: "/campaign",
      icon: <FiMapPin className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Error Display */}
        <div className="relative mb-12">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-[300px] font-black text-gray-400 dark:text-gray-600 select-none">
              404
            </div>
          </div>

          {/* Floating elements */}
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-full shadow-xl mb-8">
              <FiAlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
              404
            </h1>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Page Not Found
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Oops! The page you're looking for seems to have vanished into
                the digital void. Don't worry though, we'll help you find your
                way back.
              </p>
            </div>
          </div>
        </div>

        {/* Auto Redirect Section */}
        {autoRedirect && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Auto Redirect
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirecting to homepage in{" "}
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-bold text-sm">
                {countdown}
              </span>{" "}
              seconds
            </p>
            <button
              onClick={() => setAutoRedirect(false)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
            >
              Cancel auto redirect
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium group"
          >
            <FiArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link
            to="/"
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium group"
          >
            <FiHome className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Go to Homepage
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium group"
          >
            <FiRefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Page
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg">
              <FiMapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Navigation
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Or try one of these popular destinations:
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 shadow-sm hover:shadow-lg transform hover:-translate-y-1 group border border-gray-200 dark:border-gray-600"
              >
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow mb-3">
                  <div className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.icon}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Error Code: 404 | Page Not Found |
            <span className="ml-1 font-mono">{new Date().toISOString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
