import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import { getCampaignById } from "../services/campaignServices";
import DataTable from "../components/ui/DataTable";
import {
  FaInfoCircle,
  FaRocket,
  FaBullhorn,
  FaUsers,
  FaChartLine,
  FaArrowLeft,
  FaPlus,
  FaCog,
  FaEdit,
  FaEye,
} from "react-icons/fa";
import {
  FiActivity,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiPause,
  FiArchive,
  FiAlertCircle,
  FiRefreshCw,
  FiCalendar,
  FiTarget,
  FiDatabase,
  FiSettings,
  FiFileText,
  FiTag,
} from "react-icons/fi";

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaignDetails = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await getCampaignById(id);
      setCampaign(res?.data?.data || null);
    } catch (err) {
      console.error("Failed to load campaign", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  // Enhanced status configuration
  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
        icon: <FiClock className="w-3 h-3" />,
        bgGradient:
          "from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-900",
        label: "Draft",
      },
      active: {
        color:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
        icon: <FiActivity className="w-3 h-3" />,
        bgGradient:
          "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        label: "Active",
      },
      running: {
        color:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
        icon: <FiActivity className="w-3 h-3 animate-pulse" />,
        bgGradient:
          "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
        label: "Running",
      },
      completed: {
        color:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
        icon: <FiCheckCircle className="w-3 h-3" />,
        bgGradient:
          "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
        label: "Completed",
      },
      paused: {
        color:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
        icon: <FiPause className="w-3 h-3" />,
        bgGradient:
          "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
        label: "Paused",
      },
      archived: {
        color:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
        icon: <FiArchive className="w-3 h-3" />,
        bgGradient:
          "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
        label: "Archived",
      },
    };
    return configs[status] || configs.draft;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200/60 dark:border-red-700/60">
            <div className="text-center">
              <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Campaign not found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The requested campaign could not be found.
              </p>
              <button
                onClick={() => navigate("/campaign")}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusConfig = getStatusConfig(campaign.status);
  const templateCount = campaign.Templates?.length || 0;
  const subCampaignCount = campaign.SubCampaigns?.length || 0;
  const contactCount =
    campaign.Uploads?.reduce((sum, u) => sum + (u.totalRows || 0), 0) || 0;

  // Create maps for lookups
  const templateMap = {};
  campaign.Templates?.forEach((t) => {
    templateMap[t.id] = t.templateName;
  });

  const uploadMap = {};
  campaign.Uploads?.forEach((u) => {
    uploadMap[u.id] = u.fileName;
  });

  const subCampaignMap = {};
  campaign.SubCampaigns?.forEach((s) => {
    subCampaignMap[s.id] = s.name;
  });

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

  // Enhanced columns with better styling
  const subCampaignColumns = [
    {
      header: "Sub-Campaign",
      accessorKey: "name",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
            <FaBullhorn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {row.original.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {row.original.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Sender Info",
      accessorKey: "fromEmail",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {row.original.fromName || "N/A"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.fromEmail || "N/A"}
          </p>
          {row.original.replyTo && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Reply: {row.original.replyTo}
            </p>
          )}
        </div>
      ),
    },
    // {
    //   header: "Subject",
    //   accessorKey: "subjects",
    //   enableSorting: false,
    //   enableColumnFilter: false,
    //   cell: ({ row }) => (
    //     <div className="max-w-xs">
    //       <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
    //         {row.original.subjects || "No subject"}
    //       </p>
    //     </div>
    //   ),
    // },
    {
      header: "Subject Lines",
      accessorKey: "subjects",
      cell: ({ row }) => {
        const subjects = row.original.subjects || [];

        if (subjects.length === 0) {
          return (
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                From Templates
              </span>
            </div>
          );
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 mb-2">
              <FiTag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1">
              {subjects.slice(0, 2).map((subject, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-200 dark:border-blue-700 mr-1 mb-1"
                >
                  {subject.length > 30
                    ? `${subject.substring(0, 30)}...`
                    : subject}
                </div>
              ))}
              {subjects.length > 2 && (
                <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                  +{subjects.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.createdAt ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <FiCalendar className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <FiClock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(row.original.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Schedule",
      accessorKey: "scheduledAt",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.scheduledAt ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <FiCalendar className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(row.original.scheduledAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <FiClock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(row.original.scheduledAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Send Window",
      accessorKey: "sendWindow",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.sendWindowStart && row.original.sendWindowEnd ? (
            <span>
              {row.original.sendWindowStart} → {row.original.sendWindowEnd}
            </span>
          ) : (
            <span className="italic">No window set</span>
          )}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Rate Limit",
      accessorKey: "sendRateLimit",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.sendRateLimit ? (
            <div className="flex items-center space-x-1">
              <FiActivity className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {row.original.sendRateLimit}/hr
              </span>
            </div>
          ) : (
            <span className="text-gray-400 italic">No limit</span>
          )}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Templates",
      accessorKey: "templateIds",
      cell: ({ row }) => {
        const ids = row.original.templateIds || [];
        const names = ids.map((id) => templateMap[id] || id).filter(Boolean);

        return (
          <div className="space-y-1">
            {names.slice(0, 2).map((name, index) => {
              const template = campaign.Templates.find(
                (t) => t.id === ids[index]
              );
              return (
                <button
                  key={ids[index]}
                  className="block text-left text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline truncate max-w-[100px]"
                  onClick={() =>
                    template && handleViewTemplate(template.content)
                  }
                  title={name}
                >
                  {name}
                </button>
              );
            })}
            {names.length > 2 && (
              <span className="text-xs text-gray-500">
                +{names.length - 2} more
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Uploads",
      accessorKey: "uploadIds",
      cell: ({ row }) => {
        const ids = row.original.uploadIds || [];
        const names = ids.map((id) => uploadMap[id] || id).filter(Boolean);

        return (
          <div className="space-y-1">
            {names.slice(0, 2).map((name, index) => {
              const template = campaign.Templates.find(
                (t) => t.id === ids[index]
              );
              return (
                <button
                  key={ids[index]}
                  className="block text-left text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline truncate max-w-[100px]"
                  onClick={() =>
                    navigate(`/campaign/${campaign.id}/manage-contacts`, {
                      state: { selectedUploadId: id },
                    })
                  }
                  title={name}
                >
                  {name}
                </button>
              );
            })}
            {names.length > 2 && (
              <span className="text-xs text-gray-500">
                +{names.length - 2} more
              </span>
            )}
            {/* {ids.map((id) => {
              const name = uploadMap[id] || id;
              return (
                <span
                  key={id}
                  onClick={() =>
                    navigate(`/campaign/${campaign.id}/manage-contacts`, {
                      state: { selectedUploadId: id },
                    })
                  }
                  className="text-blue-600 underline cursor-pointer"
                >
                  {name}
                </span>
              );
            })} */}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Base Campaign Name",
      accessorKey: "baseSubCampaignId",
      cell: ({ row }) => {
        const baseId = row.original.baseSubCampaignId;
        const name = baseId ? subCampaignMap[baseId] || baseId : "-";

        return <div className="break-words text-center">{name}</div>;
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Sended To",
      accessorKey: "triggerEvents",
      cell: ({ row }) => {
        const content =
          row.original.triggerEvents?.join(", ") || "All Selected Uploads";
        return (
          <div className="max-w-[70px] break-words whitespace-normal">
            {content}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const config = getStatusConfig(status);
        return (
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}
          >
            {config.icon}
            <span className="ml-1 capitalize">{status}</span>
          </span>
        );
      },
      enableSorting: false,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => {
        const status = row.original.status;
        const isEditable = ["draft"].includes(status);

        return (
          <div className="flex items-center space-x-1">
            <button
              title="Start from this Sub-Campaign"
              className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
              onClick={() =>
                navigate(`/campaign/${campaign.id}/start`, {
                  state: { baseSubCampaignId: row.original.id },
                })
              }
            >
              <FaRocket className="w-3 h-3" />
            </button>
            <button
              title="Sub-Campaign Info"
              className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-200"
              onClick={() => navigate(`/sub-campaign-info/${row.original.id}`)}
            >
              <FaInfoCircle className="w-3 h-3" />
            </button>
            {isEditable && (
              <button
                title="Edit Sub-Campaign"
                className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200"
                onClick={() =>
                  navigate(`/campaign/${campaign.id}/start`, {
                    state: { editSubCampaignId: row.original.id },
                  })
                }
              >
                <FaEdit className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => navigate("/campaign")}
            className="flex items-center px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 group"
          >
            <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Campaigns
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">
            Campaign Details
          </span>
        </nav>

        {/* Main Header Card */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${statusConfig.bgGradient} p-8 border-b border-gray-200/60 dark:border-gray-700/60`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg">
                    <FaBullhorn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {campaign.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                      {campaign.description || "No description provided"}
                    </p>
                    <span
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full border ${statusConfig.color} backdrop-blur-sm bg-white/80 dark:bg-gray-800/80`}
                    >
                      {statusConfig.icon}
                      <span className="ml-2 capitalize">
                        {statusConfig.label}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fetchCampaignDetails(true)}
                  disabled={refreshing}
                  className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200 border border-gray-200/60 dark:border-gray-700/60 disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Metrics */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Templates
                    </p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      {templateCount}
                    </p>
                  </div>
                  <FiFileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200/60 dark:border-green-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      Sub Campaigns
                    </p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {subCampaignCount}
                    </p>
                  </div>
                  <FiActivity className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200/60 dark:border-purple-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Total Contacts
                    </p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      {contactCount.toLocaleString()}
                    </p>
                  </div>
                  <FaUsers className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <button
              onClick={() => navigate(`/campaign/${id}/start`)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create Sub-Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Manage Contacts",
                description: "Upload and manage email lists",
                icon: <FaUsers className="w-6 h-6 text-white" />,
                color: "bg-gradient-to-br from-green-500 to-emerald-500",
                onClick: () => navigate(`/campaign/${id}/manage-contacts`),
              },
              {
                title: "Manage Templates",
                description: "Create and edit email templates",
                icon: <FiFileText className="w-6 h-6 text-white" />,
                color: "bg-gradient-to-br from-purple-500 to-pink-500",
                onClick: () => navigate(`/campaign/${id}/manage-templates`),
              },
              {
                title: "Manage Variables",
                description: "Define reusable variables",
                icon: <FiSettings className="w-6 h-6 text-white" />,
                color: "bg-gradient-to-br from-orange-500 to-red-500",
                onClick: () => navigate(`/campaign/${id}/manage-variables`),
              },
              {
                title: "View Statistics",
                description: "Analyze campaign performance",
                icon: <FaChartLine className="w-6 h-6 text-white" />,
                color: "bg-gradient-to-br from-indigo-500 to-blue-500",
                onClick: () => navigate(`/campaign/${id}/stats`),
              },
            ].map((action, index) => (
              <div
                key={index}
                onClick={action.onClick}
                className="group cursor-pointer bg-white/50 dark:bg-gray-700/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/60 dark:border-gray-600/60"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Campaigns Table */}
        <DataTable
          title="Sub-Campaigns"
          columns={subCampaignColumns}
          data={campaign.SubCampaigns.reverse() || []}
          isLoading={false}
          columnFilter={true}
          description={`Manage sub-campaigns for ${
            campaign.name
          }. ${subCampaignCount} sub-campaign${
            subCampaignCount !== 1 ? "s" : ""
          } total.`}
        />
      </div>
    </AppLayout>
  );
};

export default CampaignDetailsPage;
