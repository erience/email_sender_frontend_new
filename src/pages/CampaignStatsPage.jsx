import React, { useEffect, useState } from "react";
import { getCampaignStats } from "../services/campaignServices";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/DashboardLayout";
import {
  FaArrowLeft,
  FaEnvelope,
  FaUsers,
  FaChartLine,
  FaEye,
  FaMousePointer,
  FaExclamationTriangle,
  FaUserMinus,
  FaCalendarAlt,
  FaFileAlt,
  FaDatabase,
  FaTrophy,
  FaThumbsDown,
  FaDownload,
} from "react-icons/fa";
import {
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiBarChart,
  FiPieChart,
  FiRefreshCw,
  FiUsers,
  FiFileText,
  FiDatabase,
  FiTarget,
  FiAward,
  FiAlertTriangle,
  FiInfo,
  FiDownload,
  FiShare2,
  FiCalendar,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

const CampaignStatsPage = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStats();
  }, [campaignId]);

  const fetchStats = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await getCampaignStats(campaignId);
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      toast.error(
        error?.response?.data?.message || "Failed to load campaign statistics"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats(true);
  };

  const exportData = () => {
    // Mock export functionality
    toast.success("Export feature coming soon!");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Analytics
            </h3>
            <p className="text-gray-600">
              Gathering campaign performance data...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!stats) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200/60">
            <div className="text-center">
              <div className="p-4 bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FiXCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Data Available
              </h2>
              <p className="text-gray-600 mb-6">
                Unable to load campaign statistics. Please try again.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => fetchStats()}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
  ];

  // Prepare chart data
  const performanceData = stats.timeBasedStats.map((day) => ({
    date: new Date(day.date).toLocaleDateString(),
    delivered: day.stats.delivered || 0,
    opened: day.stats.unique_opened || 0,
    clicked: day.stats.click || 0,
    bounced: (day.stats.hard_bounce || 0) + (day.stats.soft_bounce || 0),
  }));

  const eventPieData = Object.entries(stats.eventStats).map(
    ([event, count]) => ({
      name: event.replace("_", " ").toUpperCase(),
      value: count,
    })
  );

  const subCampaignChartData = stats.subCampaignPerformance.map((sub) => ({
    name:
      sub.subCampaign.name?.substring(0, 15) + "..." ||
      `Sub-Campaign ${sub.subCampaign.id}`,
    deliveryRate: sub.metrics.deliveryRate,
    openRate: sub.metrics.openRate,
    clickRate: sub.metrics.clickRate,
    bounceRate: sub.metrics.bounceRate,
  }));

  const MetricCard = ({
    title,
    value,
    icon,
    color,
    trend,
    subtitle,
    prefix = "",
    suffix = "",
  }) => (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {prefix}
            {value}
            {suffix}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl shadow-lg">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          {trend > 0 ? (
            <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm font-medium ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <FiBarChart className="w-4 h-4" />,
    },
    {
      id: "performance",
      label: "Performance",
      icon: <FiTrendingUp className="w-4 h-4" />,
    },
    {
      id: "sub-campaigns",
      label: "Sub-Campaigns",
      icon: <FiActivity className="w-4 h-4" />,
    },
    { id: "events", label: "Events", icon: <FiPieChart className="w-4 h-4" /> },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 group"
            >
              <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Campaign
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              Analytics Dashboard
            </span>
          </nav>

          {/* Header */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                  <FaChartLine className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.campaign.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {stats.campaign.description ||
                      "Campaign Analytics Dashboard"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Export
                </button>

                <button
                  onClick={() => toast.success("Share feature coming soon!")}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiShare2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white m-1 rounded-xl shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 m-1 rounded-xl"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Emails Sent"
                  value={stats.campaignMetrics.totalEmailsSent.toLocaleString()}
                  icon={
                    <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  }
                  color="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                  subtitle={`${stats.emailStats.total.toLocaleString()} in database`}
                />
                <MetricCard
                  title="Delivery Rate"
                  value={stats.campaignMetrics.overallDeliveryRate}
                  suffix="%"
                  icon={
                    <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  }
                  color="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                  subtitle={`${stats.campaignMetrics.totalDelivered.toLocaleString()} delivered`}
                />
                <MetricCard
                  title="Open Rate"
                  value={stats.campaignMetrics.overallOpenRate}
                  suffix="%"
                  icon={
                    <FaEye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  }
                  color="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                  subtitle={`${stats.campaignMetrics.totalUniqueOpened.toLocaleString()} unique opens`}
                />
                <MetricCard
                  title="Click Rate"
                  value={stats.campaignMetrics.overallClickRate}
                  suffix="%"
                  icon={
                    <FaMousePointer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  }
                  color="from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
                  subtitle={`${stats.campaignMetrics.totalClicked.toLocaleString()} clicks`}
                />
              </div>

              {/* Email Quality Metrics */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/50 rounded-xl">
                      <FiTarget className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Email Quality Metrics
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Analysis of email list quality and segmentation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <MetricCard
                      title="Valid Emails"
                      value={stats.emailStats.valid.toLocaleString()}
                      icon={
                        <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      }
                      color="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                    />
                    <MetricCard
                      title="Invalid Emails"
                      value={stats.emailStats.invalid.toLocaleString()}
                      icon={
                        <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      }
                      color="from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
                    />
                    <MetricCard
                      title="Blocked Emails"
                      value={stats.emailStats.blocked.toLocaleString()}
                      icon={
                        <FaExclamationTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      }
                      color="from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                    />
                    <MetricCard
                      title="Duplicates"
                      value={stats.emailStats.duplicate.toLocaleString()}
                      icon={
                        <FiActivity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      }
                      color="from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
                    />
                    <MetricCard
                      title="Deleted"
                      value={stats.emailStats.deleted.toLocaleString()}
                      icon={
                        <FiXCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      }
                      color="from-gray-50 to-slate-50 dark:from-gray-700/20 dark:to-slate-700/20"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Resources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Templates Section */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <FiFileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Templates
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.templates.length} templates
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {stats.templates.slice(0, 3).map((template) => (
                        <div
                          key={template.id}
                          className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-xl border border-gray-200/60 dark:border-gray-600/60"
                        >
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {template.templateName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.subjects?.length || 0} subject lines
                          </p>
                        </div>
                      ))}
                      {stats.templates.length > 3 && (
                        <div className="text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            +{stats.templates.length - 3} more templates
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Lists Section */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <FiDatabase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Email Lists
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.uploads.length} uploads
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {stats.uploads.slice(0, 3).map((upload) => (
                        <div
                          key={upload.id}
                          className="p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700/50 dark:to-green-900/20 rounded-xl border border-gray-200/60 dark:border-gray-600/60"
                        >
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {upload.uploadName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {upload.totalRows?.toLocaleString() || 0} contacts
                          </p>
                        </div>
                      ))}
                      {stats.uploads.length > 3 && (
                        <div className="text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            +{stats.uploads.length - 3} more lists
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-Campaigns Section */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                        <FiUsers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Sub-Campaigns
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.subCampaigns.length} sub-campaigns
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {Object.entries(
                        stats.subCampaigns.reduce((acc, sc) => {
                          acc[sc.status] = (acc[sc.status] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700/50 dark:to-purple-900/20 rounded-xl border border-gray-200/60 dark:border-gray-600/60"
                        >
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {status}
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-8">
              {/* Performance Over Time Chart */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <FiTrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Performance Over Time
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Last 30 days activity trends
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="delivered"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.6}
                          name="Delivered"
                        />
                        <Area
                          type="monotone"
                          dataKey="opened"
                          stackId="2"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.6}
                          name="Opened"
                        />
                        <Area
                          type="monotone"
                          dataKey="clicked"
                          stackId="3"
                          stroke="#F59E0B"
                          fill="#F59E0B"
                          fillOpacity={0.6}
                          name="Clicked"
                        />
                        <Area
                          type="monotone"
                          dataKey="bounced"
                          stackId="4"
                          stroke="#EF4444"
                          fill="#EF4444"
                          fillOpacity={0.6}
                          name="Bounced"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <FiAward className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Key Performance Indicators
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Critical metrics for campaign success evaluation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <MetricCard
                      title="Bounce Rate"
                      value={stats.campaignMetrics.overallBounceRate}
                      suffix="%"
                      icon={
                        <FaThumbsDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      }
                      color="from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
                      subtitle={`${stats.campaignMetrics.totalBounced.toLocaleString()} bounced`}
                    />
                    <MetricCard
                      title="Unsubscribe Rate"
                      value={stats.campaignMetrics.overallUnsubscribeRate}
                      suffix="%"
                      icon={
                        <FaUserMinus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      }
                      color="from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
                      subtitle={`${stats.campaignMetrics.totalUnsubscribed.toLocaleString()} unsubscribed`}
                    />
                    <MetricCard
                      title="Engagement Score"
                      value={Math.round(
                        (stats.campaignMetrics.overallOpenRate +
                          stats.campaignMetrics.overallClickRate) /
                          2
                      )}
                      suffix="%"
                      icon={
                        <FaTrophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      }
                      color="from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                      subtitle="Open + Click Rate"
                    />
                    <MetricCard
                      title="Total Opens"
                      value={stats.campaignMetrics.totalOpened.toLocaleString()}
                      icon={
                        <FaEye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      }
                      color="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                      subtitle="All opens"
                    />
                    <MetricCard
                      title="Total Clicks"
                      value={stats.campaignMetrics.totalClicked.toLocaleString()}
                      icon={
                        <FaMousePointer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      }
                      color="from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
                      subtitle="All clicks"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Campaigns Tab */}
          {activeTab === "sub-campaigns" && (
            <div className="space-y-8">
              {/* Sub-Campaign Performance Chart */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <FiActivity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Sub-Campaign Performance Comparison
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Compare delivery, open, and click rates across
                        sub-campaigns
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subCampaignChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="deliveryRate"
                          fill="#3B82F6"
                          name="Delivery Rate %"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="openRate"
                          fill="#10B981"
                          name="Open Rate %"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="clickRate"
                          fill="#F59E0B"
                          name="Click Rate %"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sub-Campaign Detailed Table */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-gray-500 to-purple-600 rounded-xl shadow-lg">
                      <FiUsers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Detailed Sub-Campaign Performance
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Comprehensive metrics for each sub-campaign
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Sub-Campaign
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Emails Sent
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Delivery Rate
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Open Rate
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Click Rate
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Bounce Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y !divide-gray-200 dark:!divide-gray-700">
                      {stats.subCampaignPerformance.map((sub, index) => (
                        <tr
                          key={sub.subCampaign.id}
                          className={`${
                            index % 2 === 0
                              ? "!bg-white dark:!bg-gray-800"
                              : "!bg-gray-50/50 dark:!bg-gray-700/50"
                          } hover:!bg-blue-50/50 dark:hover:!bg-blue-900/20 transition-all duration-200`}
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {sub.subCampaign.name ||
                                  `Sub-Campaign ${sub.subCampaign.id}`}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <FiCalendar className="w-3 h-3 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    sub.subCampaign.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                sub.subCampaign.status === "sent"
                                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                                  : sub.subCampaign.status === "sending"
                                  ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                                  : sub.subCampaign.status === "failed"
                                  ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                                  : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {sub.subCampaign.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                            {sub.metrics.emailsSent.toLocaleString()}
                          </td>
                          <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                            {sub.metrics.deliveryRate}%
                          </td>
                          <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                            {sub.metrics.openRate}%
                          </td>
                          <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                            {sub.metrics.clickRate}%
                          </td>
                          <td className="p-4 text-gray-900 dark:text-gray-100 font-medium">
                            {sub.metrics.bounceRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Distribution Pie Chart */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <FiPieChart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Event Distribution
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Visual breakdown of all campaign events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={eventPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {eventPieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #E5E7EB",
                              borderRadius: "12px",
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Event Summary */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-gray-500 to-indigo-600 rounded-xl shadow-lg">
                        <FiActivity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Event Summary
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Detailed breakdown of all events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {Object.entries(stats.eventStats).map(
                        ([event, count]) => (
                          <div
                            key={event}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-700/50 dark:to-indigo-900/20 rounded-xl border border-gray-200/60 dark:border-gray-600/60 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{
                                  backgroundColor:
                                    COLORS[
                                      Object.keys(stats.eventStats).indexOf(
                                        event
                                      ) % COLORS.length
                                    ],
                                }}
                              ></div>
                              <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {event
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CampaignStatsPage;
