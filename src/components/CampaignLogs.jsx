import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import useWebSocket from "../hooks/useWebSocket";
import { getHistoricalLogs } from "../services/mailEventService";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiWifi,
  FiAlertTriangle,
  FiClock,
  FiMail,
  FiZap,
  FiFileText,
  FiFilter,
  FiX,
  FiSearch,
  FiInfo,
  FiActivity,
  FiBarChart,
  FiTrendingUp,
  FiDatabase,
  FiEye,
  FiDownload,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";

const WS_URL = import.meta.env.VITE_WS_KEY;

const CampaignLogs = ({ channel, channelId, token }) => {
  // Real-time logs state with pagination
  const [realtimeLogs, setRealtimeLogs] = useState([]);
  const [realtimeStats, setRealtimeStats] = useState({});
  const [realtimePagination, setRealtimePagination] = useState({
    currentPage: 1,
    logsPerPage: 10,
  });

  // Historical logs state
  const [historicalLogs, setHistoricalLogs] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  // Filters for historical logs
  const [filters, setFilters] = useState({
    event: "",
    email: "",
    dateFrom: "",
    dateTo: "",
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const realtimeContainerRef = useRef(null);

  const {
    connectionState,
    lastMessage,
    error: wsError,
    subscribe,
    unsubscribe,
    reconnect,
  } = useWebSocket(WS_URL, token);

  // WebSocket subscription
  useEffect(() => {
    if (!channel || !channelId || connectionState !== "OPEN") return;

    const campaignId = channel === "campaign" ? channelId : null;
    const subCampaignId = channel === "subCampaign" ? channelId : null;

    subscribe(channel, campaignId, subCampaignId);

    return () => {
      unsubscribe(channel, campaignId, subCampaignId);
    };
  }, [channel, channelId, connectionState, subscribe, unsubscribe]);

  // Handle incoming WebSocket messages (real-time logs)
  useEffect(() => {
    if (!lastMessage) return;

    // Handle batch messages from server
    if (Array.isArray(lastMessage)) {
      lastMessage.forEach((log) => {
        if (log.email && log.event) {
          addRealtimeLog(log);
        }
      });
    } else if (lastMessage.email && lastMessage.event) {
      // Single log message
      addRealtimeLog(lastMessage);
    }
  }, [lastMessage]);

  // Add real-time log and update stats
  const addRealtimeLog = (log) => {
    setRealtimeLogs((prev) => {
      const newLogs = [{ ...log, id: Date.now() + Math.random() }, ...prev];
      return newLogs.slice(0, 1000); // Keep only last 1000 logs for performance
    });

    // Update real-time stats
    setRealtimeStats((prev) => ({
      ...prev,
      [log.event]: (prev[log.event] || 0) + 1,
      total: (prev.total || 0) + 1,
    }));

    // Reset to first page when new log arrives
    if (autoRefresh) {
      setRealtimePagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  // Reset real-time data when connection changes
  useEffect(() => {
    if (connectionState === "CONNECTING" || connectionState === "CLOSED") {
      setRealtimeLogs([]);
      setRealtimeStats({});
      setRealtimePagination({ currentPage: 1, logsPerPage: 10 });
    }
  }, [connectionState]);

  // Fetch event types
  useEffect(() => {
    setEventTypes([
      "sent",
      "click",
      "deferred",
      "delivered",
      "soft_bounce",
      "hard_bounce",
      "spam",
      "unique_opened",
      "opened",
      "invalid_email",
      "blocked",
      "error",
      "unsubscribed",
      "proxy_open",
      "unique_proxy_open",
    ]);
  }, [token]);

  // Fetch historical logs
  const fetchHistoricalLogs = async (page = 1, newFilters = filters) => {
    if (!channel || !channelId) return;

    setHistoricalLoading(true);
    try {
      const queryParams = new URLSearchParams({
        channel,
        channelId,
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(newFilters).filter(([_, value]) => value)
        ),
      });
      const response = await getHistoricalLogs(queryParams);

      const data = response.data;

      setHistoricalLogs(data.data.logs || []);
      setPagination(data.data.pagination);

      if (data.data.logs?.length > 0) {
        toast.success(`Loaded ${data.data.logs.length} historical logs`);
      }
    } catch (error) {
      console.error("Error loading historical logs:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load historical logs"
      );
    } finally {
      setHistoricalLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalLogs();
  }, [channel, channelId]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchHistoricalLogs(1, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      event: "",
      email: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(clearedFilters);
    fetchHistoricalLogs(1, clearedFilters);
    toast.success("Filters cleared");
  };

  const getEventConfig = (event) => {
    const configs = {
      delivered: {
        color:
          "text-green-700 dark:text-green-300 !bg-green-100 dark:!bg-green-900/30 border-green-200 dark:border-green-800",
        icon: "✓",
      },
      opened: {
        color:
          "text-blue-700 dark:text-blue-300 !bg-blue-100 dark:!bg-blue-900/30 border-blue-200 dark:border-blue-800",
        icon: "👁",
      },
      unique_opened: {
        color:
          "text-indigo-700 dark:text-indigo-300 !bg-indigo-100 dark:!bg-indigo-900/30 border-indigo-200 dark:border-indigo-800",
        icon: "👁",
      },
      hard_bounce: {
        color:
          "text-red-700 dark:text-red-300 !bg-red-100 dark:!bg-red-900/30 border-red-200 dark:border-red-800",
        icon: "❌",
      },
      soft_bounce: {
        color:
          "text-yellow-700 dark:text-yellow-300 !bg-yellow-100 dark:!bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
        icon: "⚠️",
      },
      spam: {
        color:
          "text-orange-700 dark:text-orange-300 !bg-orange-100 dark:!bg-orange-900/30 border-orange-200 dark:border-orange-800",
        icon: "🚫",
      },
      blocked: {
        color:
          "text-red-800 dark:text-red-300 !bg-red-200 dark:!bg-red-900/40 border-red-300 dark:border-red-700",
        icon: "🛡️",
      },
      unsubscribed: {
        color:
          "!text-gray-700 dark:!text-gray-300 !bg-gray-100 dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700",
        icon: "👋",
      },
      error: {
        color:
          "text-red-700 dark:text-red-300 !bg-red-100 dark:!bg-red-900/30 border-red-200 dark:border-red-800",
        icon: "⚡",
      },
      click: {
        color:
          "text-purple-700 dark:text-purple-300 !bg-purple-100 dark:!bg-purple-900/30 border-purple-200 dark:border-purple-800",
        icon: "🖱️",
      },
      sent: {
        color:
          "text-cyan-700 dark:text-cyan-300 !bg-cyan-100 dark:!bg-cyan-900/30 border-cyan-200 dark:border-cyan-800",
        icon: "📧",
      },
      default: {
        color:
          "!text-gray-700 dark:!text-gray-300 !bg-gray-100 dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700",
        icon: "📝",
      },
    };
    return configs[event] || configs.default;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getConnectionConfig = () => {
    switch (connectionState) {
      case "OPEN":
        return {
          icon: <FiWifi className="w-4 h-4" />,
          color:
            "!bg-green-100 dark:!bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
          text: "Live",
        };
      case "CONNECTING":
        return {
          icon: <FiRefreshCw className="w-4 h-4 animate-spin" />,
          color:
            "!bg-yellow-100 dark:!bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
          text: "Connecting",
        };
      default:
        return {
          icon: <FiAlertTriangle className="w-4 h-4" />,
          color:
            "!bg-red-100 dark:!bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
          text: "Offline",
        };
    }
  };

  // Real-time pagination logic
  const { currentPage, logsPerPage } = realtimePagination;
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const paginatedRealtimeLogs = realtimeLogs.slice(startIndex, endIndex);
  const totalRealtimePages = Math.ceil(realtimeLogs.length / logsPerPage);

  const handleRealtimePageChange = (page) => {
    setRealtimePagination((prev) => ({ ...prev, currentPage: page }));
  };

  const clearRealtimeLogs = () => {
    setRealtimeLogs([]);
    setRealtimeStats({});
    setRealtimePagination({ currentPage: 1, logsPerPage: 10 });
    toast.success("Real-time logs cleared");
  };

  const connectionConfig = getConnectionConfig();

  return (
    <div className="space-y-8">
      {/* Real-time Logs Section */}
      <div className="!bg-white/95 dark:!bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border !border-gray-200 dark:!border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="!bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 border-b !border-gray-200 dark:!border-gray-700">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 !bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl shadow-lg">
                <FiActivity className="w-6 h-6 !text-blue-600 dark:!text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold !text-gray-900 dark:!text-white">
                  Real-time Activity
                </h3>
                <p className="text-sm !text-gray-600 dark:!text-gray-400 mt-1">
                  Live email events streaming as they happen
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${connectionConfig.color}`}
              >
                {connectionConfig.icon}
                <span className="ml-2">{connectionConfig.text}</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 !text-blue-600 !bg-gray-100 dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="auto-refresh"
                  className="text-sm !text-gray-700 dark:!text-gray-300"
                >
                  Auto-scroll
                </label>
              </div>

              {connectionState === "CLOSED" && (
                <button
                  onClick={reconnect}
                  className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-blue-500 !to-indigo-500 !text-white rounded-xl hover:!from-blue-600 hover:!to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Reconnect
                </button>
              )}

              {realtimeLogs.length > 0 && (
                <button
                  onClick={clearRealtimeLogs}
                  className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-gray-100 !to-gray-200 dark:!from-gray-700 dark:!to-gray-600 !text-gray-700 dark:!text-gray-300 rounded-xl hover:!from-gray-200 hover:!to-gray-300 dark:hover:!from-gray-600 dark:hover:!to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Session Stats */}
        {Object.keys(realtimeStats).length > 0 && (
          <div className="!bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b !border-gray-200 dark:!border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 !bg-white dark:!bg-gray-800 rounded-lg shadow-sm">
                <FiBarChart className="w-5 h-5 !text-blue-600 dark:!text-blue-400" />
              </div>
              <h4 className="text-lg font-bold !text-gray-900 dark:!text-white">
                Session Statistics
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(realtimeStats)
                .filter(([event]) => event !== "total")
                .map(([event, count]) => {
                  const config = getEventConfig(event);
                  return (
                    <div
                      key={event}
                      className="!bg-white/80 dark:!bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border !border-gray-200 dark:!border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{config.icon}</span>
                        <div className="text-2xl font-bold !text-gray-900 dark:!text-white">
                          {count.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs !text-gray-600 dark:!text-gray-400 capitalize font-medium">
                        {event.replace(/_/g, " ")}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Error Display */}
        {wsError && (
          <div className="!bg-red-50 dark:!bg-red-900/30 border-b border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 !bg-red-100 dark:!bg-red-900/50 rounded-lg">
                <FiAlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-red-700 dark:text-red-300 text-sm font-semibold">
                  WebSocket Connection Error
                </p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {wsError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Logs Content */}
        <div className="p-6">
          {realtimeLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 !bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FiMail className="w-10 h-10 !text-blue-600 dark:!text-blue-400" />
              </div>
              <h4 className="text-xl font-bold !text-gray-900 dark:!text-white mb-2">
                {connectionState === "OPEN"
                  ? "Waiting for Events"
                  : "Connection Required"}
              </h4>
              <p className="!text-gray-600 dark:!text-gray-400 max-w-md mx-auto">
                {connectionState === "OPEN"
                  ? "Real-time email events will stream here as they happen. Start your campaign to see live activity."
                  : "Please establish a connection to monitor real-time email events."}
              </p>
            </div>
          ) : (
            <>
              {/* Real-time Logs Table */}
              <div className="overflow-hidden rounded-2xl border !border-gray-200 dark:!border-gray-700 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="!bg-gradient-to-r !from-gray-50 to-blue-50 dark:!from-gray-800 dark:to-blue-900/20">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiClock className="w-4 h-4" />
                            <span>Time</span>
                          </div>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiMail className="w-4 h-4" />
                            <span>Email</span>
                          </div>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiZap className="w-4 h-4" />
                            <span>Event</span>
                          </div>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiFileText className="w-4 h-4" />
                            <span>Subject</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="!bg-white dark:!bg-gray-800 divide-y !divide-gray-200 dark:!divide-gray-700">
                      {paginatedRealtimeLogs.map((log, idx) => {
                        const eventConfig = getEventConfig(log.event);
                        return (
                          <tr
                            key={log.id}
                            className={`${
                              idx % 2 === 0
                                ? "!bg-white dark:!bg-gray-800"
                                : "!bg-gray-50/50 dark:!bg-gray-700/50"
                            } hover:!bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200`}
                          >
                            <td className="px-6 py-4 text-sm !text-gray-900 dark:!text-gray-100 font-mono">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 !bg-green-400 rounded-full animate-pulse"></div>
                                <span>{formatDate(log.date)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm !text-gray-900 dark:!text-gray-100 break-all max-w-xs">
                              <div className="truncate" title={log.email}>
                                {log.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${eventConfig.color}`}
                              >
                                <span className="mr-1.5">
                                  {eventConfig.icon}
                                </span>
                                {log.event.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm !text-gray-900 dark:!text-gray-100 max-w-xs">
                              <div className="truncate" title={log.subject}>
                                {log.subject || "—"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-time Pagination */}
              {totalRealtimePages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t !border-gray-200 dark:!border-gray-700 gap-4">
                  <div className="text-sm !text-gray-700 dark:!text-gray-300 font-medium">
                    Showing {startIndex + 1}–
                    {Math.min(endIndex, realtimeLogs.length)} of{" "}
                    {realtimeLogs.length} events
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRealtimePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-gray-100 !to-gray-200 dark:!from-gray-700 dark:!to-gray-600 !text-gray-700 dark:!text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:!from-gray-200 hover:!to-gray-300 dark:hover:!from-gray-600 dark:hover:!to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                    >
                      <FiChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalRealtimePages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handleRealtimePageChange(page)}
                              className={`w-10 h-10 text-sm font-bold rounded-xl transition-all duration-200 ${
                                currentPage === page
                                  ? "!bg-gradient-to-r !from-blue-500 !to-indigo-500 !text-white shadow-lg transform scale-105"
                                  : "!bg-gray-100 dark:!bg-gray-700 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-gray-600 shadow-sm hover:shadow-md"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handleRealtimePageChange(currentPage + 1)}
                      disabled={currentPage === totalRealtimePages}
                      className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-gray-100 !to-gray-200 dark:!from-gray-700 dark:!to-gray-600 !text-gray-700 dark:!text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:!from-gray-200 hover:!to-gray-300 dark:hover:!from-gray-600 dark:hover:!to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                    >
                      Next
                      <FiChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Historical Logs Section */}
      <div className="!bg-white/95 dark:!bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border !border-gray-200 dark:!border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="!bg-gradient-to-r !from-gray-50 via-slate-50 !to-gray-50 dark:!from-gray-800 dark:via-gray-700 dark:!to-gray-800 p-6 border-b !border-gray-200 dark:!border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 !bg-gradient-to-br !from-gray-100 to-slate-100 dark:!from-gray-700 dark:to-slate-700 rounded-xl shadow-lg">
                <FiDatabase className="w-6 h-6 !text-gray-600 dark:!text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold !text-gray-900 dark:!text-white">
                  Historical Events
                </h3>
                <p className="text-sm !text-gray-600 dark:!text-gray-400 mt-1">
                  Search and analyze past email campaign activity
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-blue-500 !to-indigo-500 !text-white rounded-xl hover:!from-blue-600 hover:!to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-6 !bg-white/80 dark:!bg-gray-800/80 backdrop-blur-sm rounded-xl border !border-gray-200 dark:!border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold !text-gray-700 dark:!text-gray-300">
                    Event Type
                  </label>
                  <select
                    value={filters.event}
                    onChange={(e) =>
                      handleFilterChange("event", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 transition-all duration-200"
                  >
                    <option value="">All Events</option>
                    {eventTypes.map((event) => (
                      <option key={event} value={event}>
                        {event.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold !text-gray-700 dark:!text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="w-4 h-4 !text-gray-400 dark:!text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Filter by email..."
                      value={filters.email}
                      onChange={(e) =>
                        handleFilterChange("email", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2.5 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 !placeholder-gray-500 dark:!placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold !text-gray-700 dark:!text-gray-300">
                    From Date
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold !text-gray-700 dark:!text-gray-300">
                    To Date
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold !text-gray-700 dark:!text-gray-300">
                    Actions
                  </label>
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 !bg-gradient-to-r !from-gray-100 !to-gray-200 dark:!from-gray-700 dark:!to-gray-600 !text-gray-700 dark:!text-gray-300 rounded-xl hover:!from-gray-200 hover:!to-gray-300 dark:hover:!from-gray-600 dark:hover:!to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="px-6 py-4 !bg-gradient-to-r !from-gray-50/50 !to-blue-50/50 dark:!from-gray-800/50 dark:to-blue-900/10 border-b !border-gray-200 dark:!border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 !bg-white dark:!bg-gray-800 rounded-lg shadow-sm">
              <FiInfo className="w-4 h-4 !text-blue-600 dark:!text-blue-400" />
            </div>
            <div className="text-sm font-semibold !text-gray-700 dark:!text-gray-300">
              {pagination.totalCount > 0 ? (
                <>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalCount
                  )}{" "}
                  of {pagination.totalCount.toLocaleString()} historical events
                </>
              ) : (
                "No historical events found matching your criteria"
              )}
            </div>
          </div>
        </div>

        {/* Historical Logs Content */}
        <div className="p-6">
          {historicalLoading ? (
            <div className="text-center py-16">
              <div className="p-4 !bg-gradient-to-br !from-blue-100 !to-indigo-100 dark:!from-blue-900/50 dark:!to-indigo-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FiRefreshCw className="w-10 h-10 !text-blue-600 dark:!text-blue-400 animate-spin" />
              </div>
              <h4 className="text-xl font-bold !text-gray-900 dark:!text-white mb-2">
                Loading Historical Data
              </h4>
              <p className="!text-gray-600 dark:!text-gray-400">
                Fetching your email campaign history...
              </p>
            </div>
          ) : historicalLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 !bg-gradient-to-br !from-gray-100 to-slate-100 dark:!from-gray-700 dark:to-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FiFileText className="w-10 h-10 !text-gray-400 dark:!text-gray-500" />
              </div>
              <h4 className="text-xl font-bold !text-gray-900 dark:!text-white mb-2">
                No Historical Events Found
              </h4>
              <p className="!text-gray-600 dark:!text-gray-400 max-w-md mx-auto">
                No events match your current filter criteria. Try adjusting your
                filters or check back after your campaign has been running.
              </p>
            </div>
          ) : (
            <>
              {/* Historical Logs Table */}
              <div className="overflow-hidden rounded-2xl border !border-gray-200 dark:!border-gray-700 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="!bg-gradient-to-r !from-gray-50 to-slate-50 dark:!from-gray-800 dark:!to-slate-800">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiClock className="w-4 h-4" />
                            <span>Date & Time</span>
                          </div>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiMail className="w-4 h-4" />
                            <span>Email Address</span>
                          </div>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiZap className="w-4 h-4" />
                            <span>Event Type</span>
                          </div>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-bold !text-gray-700 dark:!text-gray-300 border-b !border-gray-200 dark:!border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiTrendingUp className="w-4 h-4" />
                            <span>Campaign</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="!bg-white dark:!bg-gray-800 divide-y !divide-gray-200 dark:!divide-gray-700">
                      {historicalLogs.map((log, idx) => {
                        const eventConfig = getEventConfig(log.event);
                        return (
                          <tr
                            key={log.id}
                            className={`${
                              idx % 2 === 0
                                ? "!bg-white dark:!bg-gray-800"
                                : "!bg-gray-50/50 dark:!bg-gray-700/50"
                            } hover:!bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200`}
                          >
                            <td className="px-6 py-4 text-sm !text-gray-900 dark:!text-gray-100 font-mono">
                              {formatDate(log.date)}
                            </td>
                            <td className="px-6 py-4 text-sm !text-gray-900 dark:!text-gray-100 break-all max-w-xs">
                              <div className="truncate" title={log.email}>
                                {log.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${eventConfig.color}`}
                              >
                                <span className="mr-1.5">
                                  {eventConfig.icon}
                                </span>
                                {log.event.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm !text-gray-900 dark:!text-gray-100 max-w-xs">
                              <div
                                className="truncate"
                                title={log.subCampaignName}
                              >
                                {log.subCampaignName || "—"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t !border-gray-200 dark:!border-gray-700 gap-4">
                  <div className="text-sm !text-gray-700 dark:!text-gray-300 font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchHistoricalLogs(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-gray-100 !to-gray-200 dark:!from-gray-700 dark:!to-gray-600 !text-gray-700 dark:!text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:!from-gray-200 hover:!to-gray-300 dark:hover:!from-gray-600 dark:hover:!to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                    >
                      <FiChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </button>

                    <button
                      onClick={() => fetchHistoricalLogs(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="flex items-center px-4 py-2.5 !bg-gradient-to-r !from-gray-100 !to-gray-200 dark:!from-gray-700 dark:!to-gray-600 !text-gray-700 dark:!text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:!from-gray-200 hover:!to-gray-300 dark:hover:!from-gray-600 dark:hover:!to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                    >
                      Next
                      <FiChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

CampaignLogs.propTypes = {
  channel: PropTypes.oneOf(["campaign", "subCampaign"]).isRequired,
  channelId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
};

export default CampaignLogs;
