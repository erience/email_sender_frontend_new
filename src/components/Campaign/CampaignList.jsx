import React from "react";
import DataTable from "../ui/DataTable";
import {
  FaEdit,
  FaEye,
  FaBullhorn,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  FiMail,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiPause,
  FiArchive,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";

const CampaignList = ({
  data,
  isLoading,
  onEdit,
  onView,
  viewMode = "list",
}) => {
  // Enhanced status configuration
  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
        icon: <FiClock className="w-3 h-3" />,
        label: "Draft",
      },
      active: {
        color:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
        icon: <FiActivity className="w-3 h-3" />,
        label: "Active",
      },
      running: {
        color:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
        icon: <FiActivity className="w-3 h-3" />,
        label: "Running",
      },
      completed: {
        color:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
        icon: <FiCheckCircle className="w-3 h-3" />,
        label: "Completed",
      },
      paused: {
        color:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
        icon: <FiPause className="w-3 h-3" />,
        label: "Paused",
      },
      archived: {
        color:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
        icon: <FiArchive className="w-3 h-3" />,
        label: "Archived",
      },
      failed: {
        color:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
        icon: <FiAlertCircle className="w-3 h-3" />,
        label: "Failed",
      },
    };
    return configs[status] || configs.draft;
  };

  const columns = [
    {
      header: "Campaign Name",
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
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              ID: {row.original.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {row.original.description || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                No description
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      header: "Templates",
      accessorKey: "templateCount",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FiFileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {row.original.templateCount || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Sub Campaigns",
      accessorKey: "subCampaignCount",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FiActivity className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {row.original.subCampaignCount || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Contacts",
      accessorKey: "emailCount",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <FaUsers className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {row.original.emailCount?.toLocaleString() || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const config = getStatusConfig(status);
        return (
          <span
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${config.color}`}
          >
            {config.icon}
            <span className="ml-1.5">{config.label}</span>
          </span>
        );
      },
      enableSorting: true,
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.createdAt ? (
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="w-3 h-3" />
              <span>
                {new Date(row.original.createdAt).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <span className="italic">Unknown</span>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(row.original.id)}
            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
            title="View Campaign Details"
          >
            <FaEye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onEdit(row.original.id)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
            title="Edit Campaign"
          >
            <FaEdit className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((campaign) => {
        const statusConfig = getStatusConfig(campaign.status);
        return (
          <div
            key={campaign.id}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <FaBullhorn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {campaign.id}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}
              >
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
              {campaign.description || "No description provided"}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <FiFileText className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {campaign.templateCount || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Templates
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <FiActivity className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {campaign.subCampaignCount || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sub Campaigns
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <FaUsers className="w-4 h-4 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {campaign.emailCount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Contacts
                </p>
              </div>
            </div>

            {/* Created Date */}
            {campaign.createdAt && (
              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                <FaCalendarAlt className="w-3 h-3 mr-1" />
                Created {new Date(campaign.createdAt).toLocaleDateString()}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onView(campaign.id)}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
              >
                <FaEye className="w-4 h-4 mr-2" />
                View
              </button>
              <button
                onClick={() => onEdit(campaign.id)}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Loading state for grid view
  const GridLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="w-16 h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
          </div>
          <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <div className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded mx-auto mb-1"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded mb-1"></div>
                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded"></div>
              </div>
            ))}
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
            <div className="flex-1 h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Return appropriate view based on viewMode
  if (viewMode === "grid") {
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
            <FaBullhorn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Campaigns
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.length} campaign{data.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {isLoading ? <GridLoadingState /> : <GridView />}
      </div>
    );
  }

  // Default to list view (DataTable)
  return (
    <DataTable
      title="Campaigns"
      columns={columns}
      data={data.reverse()}
      isLoading={isLoading}
      columnFilter={true}
      description={`Manage your email marketing campaigns. ${
        data.length
      } campaign${data.length !== 1 ? "s" : ""} total.`}
    />
  );
};

export default CampaignList;
