import React from "react";
import DataTable from "../ui/DataTable";
import {
  FaServer,
  FaEdit,
  FaEye,
  FaNetworkWired,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  FiServer,
  FiEdit3,
  FiEye,
  FiWifi,
  FiUser,
  FiCalendar,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiInfo,
  FiActivity,
} from "react-icons/fi";

const SmtpConfigList = ({ configs, onEdit, isLoading = false, onCheck }) => {
  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
        icon: <FiCheckCircle className="w-3 h-3" />,
        label: "Active",
      },
      inactive: {
        color:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
        icon: <FiXCircle className="w-3 h-3" />,
        label: "Inactive",
      },
    };
    return configs[status] || configs.inactive;
  };

  const getPortTypeInfo = (port) => {
    const portInfo = {
      25: { type: "SMTP", security: "None", color: "text-gray-600" },
      587: { type: "SMTP", security: "TLS", color: "text-green-600" },
      465: { type: "SMTP", security: "SSL", color: "text-blue-600" },
      2525: { type: "SMTP", security: "TLS", color: "text-purple-600" },
    };
    return (
      portInfo[port] || {
        type: "SMTP",
        security: "Custom",
        color: "text-gray-600",
      }
    );
  };

  const columns = [
    {
      header: "SMTP Configuration",
      accessorKey: "smtpName",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
            <FiServer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {row.original.smtpName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {row.original.id} • SMTP Config
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Server Details",
      accessorKey: "emailHost",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const portInfo = getPortTypeInfo(parseInt(row.original.emailPort));
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FiWifi className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {row.original.emailHost}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FiActivity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Port: {row.original.emailPort}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${portInfo.color}`}
              >
                {portInfo.security}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Authentication",
      accessorKey: "emailUser",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FiUser className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {row.original.emailUser}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FiLock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Password configured
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = getStatusConfig(status);

        return (
          <div className="space-y-2">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}
            >
              {statusConfig.icon}
              <span className="ml-1 capitalize">{statusConfig.label}</span>
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {status === "active" ? "Ready to use" : "Disabled"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const date = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null;

        if (!date) {
          return (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
              Unknown
            </span>
          );
        }

        return (
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {date.toLocaleDateString()}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(row.original.id)}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
            title="Edit SMTP Configuration"
          >
            <FiEdit3 className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onCheck(row.original.id)}
            className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 group"
            title="Test Connection"
          >
            <FiWifi className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title={"SMTP Configs"}
        columns={columns}
        data={configs.reverse()}
        isLoading={isLoading}
        columnFilter={true}
        description={`Manage your SMTP server configurations for email delivery. ${
          configs.length
        } configuration${configs.length !== 1 ? "s" : ""} total.`}
      />

      {/* Configuration Summary */}
      {configs.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/60 dark:border-blue-700/60">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Configuration Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/60 dark:bg-gray-700/60 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Configs
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {configs.length}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {configs.filter((c) => c.status === "active").length}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Inactive
                  </p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {configs.filter((c) => c.status === "inactive").length}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secure (TLS/SSL)
                  </p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {
                      configs.filter((c) => [587, 465].includes(c.emailPort))
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmtpConfigList;
