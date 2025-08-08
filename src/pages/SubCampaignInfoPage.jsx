import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import {
  getSubCampaignById,
  pauseSubCampaign,
  resumeSubCampaign,
  cancelSubCampaign,
  getSubCampaignStats,
} from "../services/subCampaignServices";
import { getCampaignById } from "../services/campaignServices";
import {
  FaRocket,
  FaPause,
  FaPlay,
  FaStop,
  FaEdit,
  FaEye,
  FaUsers,
  FaCalendarAlt,
  FaLink,
  FaArrowLeft,
} from "react-icons/fa";
import {
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiActivity,
  FiFileText,
  FiDatabase,
  FiRefreshCw,
  FiExternalLink,
  FiSend,
  FiTarget,
} from "react-icons/fi";
import CampaignLogs from "../components/CampaignLogs";
import toast from "react-hot-toast";

const SubCampaignInfoPage = () => {
  const { subCampaignId } = useParams();
  const navigate = useNavigate();
  const [subCampaign, setSubCampaign] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const token = localStorage.getItem("authToken");

  // Fetch sub-campaign details
  const fetchSubCampaignDetails = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await getSubCampaignById(subCampaignId);
      setSubCampaign(res?.data?.data || null);
      await fetchSubCampaignStats(res?.data?.data?.id);

      if (res?.data?.data?.campaignId) {
        const campaignRes = await getCampaignById(res?.data?.data?.campaignId);
        setCampaign(campaignRes?.data?.data || null);
      }
    } catch (err) {
      console.error("Failed to load sub-campaign", err);
      toast.error("Failed to load sub-campaign details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch sub-campaign stats
  const fetchSubCampaignStats = async (id) => {
    try {
      const res = await getSubCampaignStats(id);
      setStats(res?.data?.data || {});
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSubCampaignDetails(true);
    toast.success("Data refreshed successfully");
  };

  // Handle pause action for sub-campaign
  const handlePauseSubCampaign = async () => {
    try {
      setActionLoading("pause");
      await pauseSubCampaign(subCampaignId);
      await fetchSubCampaignDetails(true);
      toast.success("Sub-campaign paused successfully");
    } catch (err) {
      console.error("Failed to pause sub-campaign", err);
      toast.error("Failed to pause sub-campaign");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle resume action for sub-campaign
  const handleResumeSubCampaign = async () => {
    try {
      setActionLoading("resume");
      await resumeSubCampaign(subCampaignId);
      await fetchSubCampaignDetails(true);
      toast.success("Sub-campaign resumed successfully");
    } catch (err) {
      console.error("Failed to resume sub-campaign", err);
      toast.error("Failed to resume sub-campaign");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle cancel action for sub-campaign
  const handleCancelSubCampaign = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this sub-campaign? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading("cancel");
      await cancelSubCampaign(subCampaignId);
      await fetchSubCampaignDetails(true);
      toast.success("Sub-campaign cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel sub-campaign", err);
      toast.error("Failed to cancel sub-campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewTemplate = (htmlContent) => {
    let compiled = htmlContent;
    const variableMap = campaign.variableMap || {};
    Object.keys(variableMap).forEach((key) => {
      const regex = new RegExp(`\\^\\^${key}\\^\\^`, "g");
      compiled = compiled.replace(regex, variableMap[key]);
    });

    const blob = new Blob([compiled], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    fetchSubCampaignDetails();
  }, [subCampaignId]);

  if (loading) return <Loader />;

  if (!subCampaign)
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FiXCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sub-Campaign Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The requested sub-campaign could not be found or may have been
                deleted.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium mx-auto"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );

  const templateMap = {};
  campaign?.Templates?.forEach((t) => {
    templateMap[t.id] = t.templateName;
  });

  const uploadMap = {};
  campaign?.Uploads?.forEach((u) => {
    uploadMap[u.id] = u.fileName;
  });

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color:
          "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600",
        icon: <FiFileText className="w-4 h-4" />,
        gradient: "from-gray-500 to-slate-500",
      },
      scheduled: {
        color:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
        icon: <FiClock className="w-4 h-4" />,
        gradient: "from-blue-500 to-indigo-500",
      },
      sending: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
        icon: <FiActivity className="w-4 h-4" />,
        gradient: "from-green-500 to-emerald-500",
      },
      paused: {
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
        icon: <FaPause className="w-4 h-4" />,
        gradient: "from-yellow-500 to-orange-500",
      },
      sent: {
        color:
          "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
        icon: <FiCheckCircle className="w-4 h-4" />,
        gradient: "from-emerald-500 to-green-500",
      },
      failed: {
        color:
          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700",
        icon: <FiXCircle className="w-4 h-4" />,
        gradient: "from-red-500 to-pink-500",
      },
      canceled: {
        color:
          "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600",
        icon: <FiXCircle className="w-4 h-4" />,
        gradient: "from-gray-500 to-slate-500",
      },
      waiting: {
        color:
          "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700",
        icon: <FiAlertCircle className="w-4 h-4" />,
        gradient: "from-orange-500 to-red-500",
      },
    };
    return configs[status] || configs.draft;
  };

  const getProgressPercentage = () => {
    const total = stats.totalEmails || 0;
    const sent = stats.sent || 0;
    return total > 0 ? (sent / total) * 100 : 0;
  };

  const statusConfig = getStatusConfig(subCampaign.status);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 group"
            >
              <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              Sub-Campaign Details
            </span>
          </nav>

          {/* Header Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl shadow-lg">
                      <FiSend className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {subCampaign.name}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                        <FiTarget className="w-4 h-4 mr-2" />
                        Parent Campaign: {campaign?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      <span className="ml-2 capitalize">
                        {subCampaign.status}
                      </span>
                    </div>

                    {subCampaign.scheduledAt && (
                      <div className="flex items-center px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-sm text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="font-medium">Scheduled:</span>
                        <span className="ml-2">
                          {new Date(subCampaign.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Section */}
                  {stats.totalEmails > 0 && (
                    <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Email Progress
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(getProgressPercentage())}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>{stats.sent || 0} sent</span>
                        <span>{stats.totalEmails || 0} total</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 mr-2 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 !bg-white dark:!bg-gray-800">
              <div className="flex flex-wrap gap-3">
                {["sending", "scheduled", "waiting", "paused"].includes(
                  subCampaign.status
                ) && (
                  <>
                    {subCampaign.status !== "paused" ? (
                      <button
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                        onClick={handlePauseSubCampaign}
                        disabled={actionLoading === "pause"}
                      >
                        {actionLoading === "pause" ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Pausing...
                          </>
                        ) : (
                          <>
                            <FaPause className="w-4 h-4 mr-2" />
                            Pause Campaign
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                        onClick={handleResumeSubCampaign}
                        disabled={actionLoading === "resume"}
                      >
                        {actionLoading === "resume" ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Resuming...
                          </>
                        ) : (
                          <>
                            <FaPlay className="w-4 h-4 mr-2" />
                            Resume Campaign
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}

                {!["sent", "failed", "canceled", "draft"].includes(
                  subCampaign.status
                ) && (
                  <button
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                    onClick={handleCancelSubCampaign}
                    disabled={actionLoading === "cancel"}
                  >
                    {actionLoading === "cancel" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <FaStop className="w-4 h-4 mr-2" />
                        Cancel Campaign
                      </>
                    )}
                  </button>
                )}

                {subCampaign.status === "sent" && (
                  <button
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                    onClick={() =>
                      navigate(`/campaign/${campaign.id}/start`, {
                        state: { baseSubCampaignId: subCampaignId },
                      })
                    }
                  >
                    <FaRocket className="w-4 h-4 mr-2" />
                    Start from This
                  </button>
                )}

                {subCampaign.status === "draft" && (
                  <button
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                    onClick={() =>
                      navigate(`/campaign/${campaign.id}/start`, {
                        state: { editSubCampaignId: subCampaignId },
                      })
                    }
                  >
                    <FaEdit className="w-4 h-4 mr-2" />
                    Edit Campaign
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Total Emails
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {(stats.totalEmails || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl shadow-lg">
                  <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {(stats.pending || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-xl shadow-lg">
                  <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Sent
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {(stats.sent || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl shadow-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Failed
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {(stats.failed || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-xl shadow-lg">
                  <FiXCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Templates Section */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                    <FiFileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Email Templates
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subCampaign.templateIds?.length || 0} template(s)
                      configured
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {subCampaign.templateIds?.length > 0 ? (
                  <div className="space-y-3">
                    {subCampaign.templateIds.map((id) => {
                      const templateName =
                        templateMap[String(id)] || `Template ${id}`;
                      const template = campaign?.Templates?.find(
                        (t) => t.id === id
                      );
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <FiFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {templateName}
                            </span>
                          </div>
                          {template && (
                            <button
                              onClick={() =>
                                handleViewTemplate(template.content)
                              }
                              className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium group-hover:opacity-100"
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              Preview
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <FiFileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No templates configured
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Templates will appear here once configured
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Uploads Section */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl">
                    <FiDatabase className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Email Lists
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subCampaign.uploadIds?.length || 0} upload(s) configured
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {subCampaign.uploadIds?.length > 0 ? (
                  <div className="space-y-3">
                    {subCampaign.uploadIds.map((id) => {
                      const uploadName = uploadMap[id] || `Upload ${id}`;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-green-900/20 rounded-xl border border-gray-200 dark:border-gray-600 hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <FiDatabase className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {uploadName}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              navigate(
                                `/campaign/${campaign.id}/manage-contacts`,
                                {
                                  state: { selectedUploadId: id },
                                }
                              )
                            }
                            className="flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium group-hover:opacity-100"
                          >
                            <FaUsers className="w-4 h-4 mr-1" />
                            View Contacts
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <FiDatabase className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No email lists configured
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Email lists will appear here once configured
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Base Campaign Link */}
          {subCampaign.baseSubCampaignId && (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl shadow-lg">
                    <FaLink className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Base Sub-Campaign
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      This sub-campaign is based on another sub-campaign
                      configuration
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/sub-campaign-info/${subCampaign.baseSubCampaignId}`
                    )
                  }
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiExternalLink className="w-4 h-4 mr-2" />
                  View Base Campaign
                </button>
              </div>
            </div>
          )}

          {/* Logs Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl">
                  <FiActivity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Email Events & Activity Logs
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Monitor real-time events and browse historical campaign data
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {token ? (
                <CampaignLogs
                  channel="subCampaign"
                  channelId={subCampaignId}
                  token={token}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FiAlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Authentication Required
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Please log in to view campaign logs
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SubCampaignInfoPage;
