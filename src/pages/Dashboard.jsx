import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiMail,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiEye,
  FiArrowRight,
  FiArrowUp,
  FiArrowDown,
  FiBarChart,
  FiSend,
  FiAlertCircle,
  FiSmartphone,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiMousePointer,
  FiAlertTriangle,
  FiSettings,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";
import { FaBullhorn, FaServer, FaFileCode, FaPause } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { getDashboardStats } from "../services/campaignServices";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentCampaigns: [],
    chartData: [],
    recentActivity: [],
    loading: true,
  });
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");

  const fetchDashboardData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      const response = await getDashboardStats(timeRange);

      if (response.data.success) {
        setDashboardData({
          stats: response.data.data.stats,
          recentCampaigns: response.data.data.recentCampaigns,
          chartData: response.data.data.chartData,
          recentActivity: response.data.data.recentActivity,
          loading: false,
        });
        toast.success("Dashboard data refreshed");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon,
    color,
    subtitle,
    trend,
  }) => (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {title}
            </p>
            {trend && (
              <div
                className={`p-1 rounded-lg ${
                  trend === "up"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {trend === "up" ? (
                  <FiTrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <FiArrowDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                )}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`p-4 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-200`}
        >
          {icon}
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-4 flex items-center">
          {changeType === "positive" ? (
            <FiArrowUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <FiArrowDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm font-semibold ${
              changeType === "positive"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {Math.abs(change).toFixed(1)}% from previous period
          </span>
        </div>
      )}
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200 shadow-lg`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      sending:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      paused:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      scheduled:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      waiting:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusIcon = (status) => {
    const icons = {
      sending: <FiActivity className="w-4 h-4" />,
      completed: <FiCheckCircle className="w-4 h-4" />,
      paused: <FaPause className="w-4 h-4" />,
      scheduled: <FiClock className="w-4 h-4" />,
      failed: <FiXCircle className="w-4 h-4" />,
      waiting: <FiClock className="w-4 h-4" />,
    };
    return icons[status] || icons.scheduled;
  };

  const getActivityIcon = (type) => {
    const icons = {
      delivered: (
        <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      ),
      unique_opened: (
        <FiEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      ),
      click: (
        <FiMousePointer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      ),
      bounce: (
        <FiAlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      ),
      sent: <FiSend className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    };
    return (
      icons[type] || (
        <FiActivity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      )
    );
  };

  const getActivityColor = (type) => {
    const colors = {
      delivered:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      unique_opened:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      click:
        "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
      bounce: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      sent: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    };
    return (
      colors[type] ||
      "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
    );
  };

  // Prepare pie chart data for email performance
  const emailPerformanceData = [
    {
      name: "Delivered",
      value: dashboardData.stats.deliveryRate || 0,
      color: "#10B981",
    },
    {
      name: "Opened",
      value: dashboardData.stats.openRate || 0,
      color: "#3B82F6",
    },
    {
      name: "Clicked",
      value: dashboardData.stats.clickRate || 0,
      color: "#8B5CF6",
    },
    {
      name: "Bounced",
      value: dashboardData.stats.bounceRate || 0,
      color: "#EF4444",
    },
  ];

  // Prepare SMS performance data
  const smsPerformanceData = [
    {
      name: "Sent",
      value: dashboardData.stats.totalSmsSent || 0,
      color: "#10B981",
    },
    {
      name: "Failed",
      value: dashboardData.stats.failedSms || 0,
      color: "#EF4444",
    },
    {
      name: "Pending",
      value:
        (dashboardData.stats.totalSms || 0) -
        (dashboardData.stats.totalSmsSent || 0) -
        (dashboardData.stats.failedSms || 0),
      color: "#F59E0B",
    },
  ];

  if (dashboardData.loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Campaign Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Monitor your email and SMS campaigns performance in real-time
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border !border-gray-300 dark:!border-gray-600 rounded-xl !bg-white dark:!bg-gray-800 !text-gray-700 dark:!text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={fetchDashboardData}
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Email Campaigns"
            value={dashboardData.stats.totalEmailCampaign || 0}
            change={dashboardData.stats.changes?.totalEmails}
            changeType={
              dashboardData.stats.changes?.totalEmails >= 0
                ? "positive"
                : "negative"
            }
            icon={<FiMail className="w-7 h-7 text-blue-600" />}
            color="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50"
            subtitle={`${
              dashboardData.stats.activeCampaigns || 0
            } active campaigns`}
            trend="up"
          />
          <StatCard
            title="SMS Campaigns"
            value={dashboardData.stats.totalSmsCampaign || 0}
            change={dashboardData.stats.totalSmsChange}
            changeType={
              dashboardData.stats.totalSmsChange >= 0 ? "positive" : "negative"
            }
            icon={<FiSmartphone className="w-7 h-7 text-green-600" />}
            color="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50"
            subtitle={`${
              dashboardData.stats.totalSms?.toLocaleString() || 0
            } total SMS`}
          />
          <StatCard
            title="Emails Sent"
            value={dashboardData.stats.totalEmailsSent || 0}
            change={dashboardData.stats.changes?.totalEmails}
            changeType={
              dashboardData.stats.changes?.totalEmails >= 0
                ? "positive"
                : "negative"
            }
            icon={<FiSend className="w-7 h-7 text-purple-600" />}
            color="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50"
            subtitle={`${
              dashboardData.stats.deliveryRate?.toFixed(1) || 0
            }% delivery rate`}
          />
          <StatCard
            title="SMS Sent"
            value={dashboardData.stats.totalSmsSent || 0}
            change={dashboardData.stats.totalSendSmsChange}
            changeType={
              dashboardData.stats.totalSendSmsChange >= 0
                ? "positive"
                : "negative"
            }
            icon={<FiTarget className="w-7 h-7 text-orange-600" />}
            color="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50"
            subtitle={`${
              dashboardData.stats.smsDeliveryRate?.toFixed(1) || 0
            }% delivery rate`}
          />
        </div>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Open Rate"
            value={`${dashboardData.stats.openRate?.toFixed(1) || 0}%`}
            change={dashboardData.stats.changes?.openRate}
            changeType={
              dashboardData.stats.changes?.openRate >= 0
                ? "positive"
                : "negative"
            }
            icon={<FiEye className="w-7 h-7 text-indigo-600" />}
            color="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50"
          />
          <StatCard
            title="Click Rate"
            value={`${dashboardData.stats.clickRate?.toFixed(1) || 0}%`}
            icon={<FiMousePointer className="w-7 h-7 text-emerald-600" />}
            color="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50"
          />
          <StatCard
            title="Bounce Rate"
            value={`${dashboardData.stats.bounceRate?.toFixed(1) || 0}%`}
            icon={<FiAlertTriangle className="w-7 h-7 text-red-600" />}
            color="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50"
          />
          <StatCard
            title="Failed SMS"
            value={dashboardData.stats.failedSms || 0}
            change={dashboardData.stats.failedSmsChange}
            changeType={
              dashboardData.stats.failedSmsChange <= 0 ? "positive" : "negative"
            }
            icon={<FiXCircle className="w-7 h-7 text-pink-600" />}
            color="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                  <FiBarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Campaign Performance Over Time
                </h3>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    className="dark:stroke-gray-600"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    className="dark:stroke-gray-300"
                  />
                  <YAxis stroke="#6B7280" className="dark:stroke-gray-300" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    name="Emails Sent"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    name="Delivered"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    name="Opened"
                    stackId="3"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicked"
                    name="Clicked"
                    stackId="4"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="smsSent"
                    name="SMS Sent"
                    stackId="5"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl">
                <FiActivity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dashboardData.recentActivity?.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      {activity.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.email}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Performance Pie Chart */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl">
                <FiPieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Email Performance Breakdown
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emailPerformanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {emailPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SMS Performance Chart */}
          {/* Enhanced SMS Performance Chart */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded-xl">
                <FiSmartphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                SMS Campaign Status
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={smsPerformanceData} barCategoryGap="20%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    className="dark:stroke-gray-700"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    className="dark:stroke-gray-300"
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6B7280"
                    className="dark:stroke-gray-300"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.97)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                    cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                    labelStyle={{
                      color: "#1f2937",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#374151",
                      padding: "2px 0",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill={(entry, index) => {
                      const colors = ["#4ade80", "#f87171", "#facc15"]; // Green, Red, Yellow
                      return colors[index] || "#6b7280";
                    }}
                  >
                    {smsPerformanceData.map((entry, index) => {
                      const colors = ["#4ade80", "#f87171", "#facc15"]; // Green, Red, Yellow
                      return (
                        <Cell key={`cell-${index}`} fill={colors[index]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sent
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Failed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl">
              <FiSettings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="New Email Campaign"
              description="Create and launch email campaign"
              icon={<FaBullhorn className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              onClick={() => navigate("/campaign")}
            />
            <QuickActionCard
              title="SMTP Configuration"
              description="Manage email server settings"
              icon={<FaServer className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-green-500 to-green-600"
              onClick={() => navigate("/smtp-config")}
            />
            <QuickActionCard
              title="SMS Campaign"
              description="Send bulk SMS messages"
              icon={<FiSend className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              onClick={() => navigate("/sms")}
            />
            <QuickActionCard
              title="HTML Converter"
              description="Convert documents to HTML"
              icon={<FaFileCode className="w-6 h-6 text-white" />}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              onClick={() => navigate("/html")}
            />
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-xl">
                  <FiCalendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Campaigns
                </h3>
              </div>
              <button
                onClick={() => navigate("/campaigns")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                <tr>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Campaign Name
                  </th>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Progress
                  </th>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Sent/Total
                  </th>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Created
                  </th>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Scheduled
                  </th>
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.recentCampaigns?.length > 0 ? (
                  dashboardData.recentCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1 capitalize">
                            {campaign.status}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${campaign.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {campaign.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {campaign.sent?.toLocaleString()}/
                        {campaign.total?.toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {new Date(
                                campaign.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(
                                campaign.createdAt
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {new Date(
                                campaign.scheduledAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(
                                campaign.scheduledAt
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                          onClick={() =>
                            navigate(`/sub-campaign-info/${campaign.id}`)
                          }
                        >
                          <span>View Details</span>
                          <FiArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <FiCalendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No campaigns found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
