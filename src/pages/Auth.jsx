import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import LoginForm from "../components/Auth/LoginForm";
import SignupForm from "../components/Auth/SignupForm";
import {
  FiMoon,
  FiSun,
  FiShield,
  FiUsers,
  FiTrendingUp,
  FiCheck,
  FiStar,
  FiGlobe,
} from "react-icons/fi";

const AuthPage = () => {
  const [selectedTab, setSelectedTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const features = [
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 256-bit SSL encryption",
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work seamlessly with your team members",
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Get detailed insights and performance metrics",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      content:
        "This platform has transformed how we manage our campaigns. Highly recommended!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Email Specialist",
      content:
        "The analytics and automation features are outstanding. Great ROI!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex">
      {loading && <Loader />}

      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EmailPro</h1>
              <p className="text-blue-100 text-sm">
                Campaign Management Platform
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Welcome to the Future of Email Marketing
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Join thousands of businesses who trust our platform to deliver
                exceptional email campaigns with advanced analytics and
                automation.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">10K+</div>
            <div className="text-blue-100 text-sm">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">50M+</div>
            <div className="text-blue-100 text-sm">Emails Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">99.9%</div>
            <div className="text-blue-100 text-sm">Uptime</div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
        >
          {isDarkMode ? (
            <FiSun className="w-5 h-5 text-yellow-500" />
          ) : (
            <FiMoon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div className="w-full max-w-md">
          {/* Tab Navigation */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden mb-8">
            <div className="flex">
              <button
                onClick={() => setSelectedTab("login")}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                  selectedTab === "login"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setSelectedTab("signup")}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                  selectedTab === "signup"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="p-8">
              {selectedTab === "login" ? (
                <LoginForm
                  setLoading={setLoading}
                  setSelectedTab={setSelectedTab}
                />
              ) : (
                <SignupForm
                  setSelectedTab={setSelectedTab}
                  setLoading={setLoading}
                />
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <FiShield className="w-4 h-4 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiGlobe className="w-4 h-4 text-blue-500" />
                <span>Global CDN</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4 text-green-500" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Branding Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <img src="/favicon.png" alt="Logo" className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold">EmailPro</h1>
              <p className="text-blue-100 text-xs">
                Campaign Management Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Spacing */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default AuthPage;
