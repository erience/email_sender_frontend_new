import React from "react";
import DataTable from "../ui/DataTable";
import {
  FaDownload,
  FaEdit,
  FaEye,
  FaInfoCircle,
  FaFileCsv,
  FaDatabase,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  FiFile,
  FiDownload,
  FiEdit3,
  FiEye,
  FiInfo,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";

const UploadsTable = ({
  uploads,
  loading,
  handleDownload,
  handleEdit,
  handleView,
}) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getUploadStatus = (upload) => {
    const { totalRows, invalidRows } = upload;
    const validRows = totalRows - (invalidRows || 0);
    const successRate = totalRows > 0 ? (validRows / totalRows) * 100 : 0;

    if (successRate >= 90) return "excellent";
    if (successRate >= 70) return "good";
    if (successRate >= 50) return "fair";
    return "poor";
  };

  const getStatusConfig = (status) => {
    const configs = {
      excellent: {
        color:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
        icon: <FiCheckCircle className="w-3 h-3" />,
        label: "Excellent",
      },
      good: {
        color:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
        icon: <FiInfo className="w-3 h-3" />,
        label: "Good",
      },
      fair: {
        color:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
        icon: <FiAlertCircle className="w-3 h-3" />,
        label: "Fair",
      },
      poor: {
        color:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
        icon: <FiAlertCircle className="w-3 h-3" />,
        label: "Poor",
      },
    };
    return configs[status] || configs.fair;
  };

  const columns = [
    {
      header: "File Information",
      accessorKey: "fileName",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
            <FaFileCsv className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {row.original.fileName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {row.original.id} • CSV File
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "remarks",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {row.original.remarks || (
              <span className="text-gray-400 dark:text-gray-500 italic">
                No description
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      header: "Data Quality",
      accessorKey: "dataQuality",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const { totalRows, invalidRows } = row.original;
        const validRows = totalRows - (invalidRows || 0);
        const successRate = totalRows > 0 ? (validRows / totalRows) * 100 : 0;
        const status = getUploadStatus(row.original);
        const statusConfig = getStatusConfig(status);

        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}
              >
                {statusConfig.icon}
                <span className="ml-1">{successRate.toFixed(2)}%</span>
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {validRows.toLocaleString()} valid of{" "}
              {totalRows?.toLocaleString() || 0}
            </div>
          </div>
        );
      },
    },
    {
      header: "Row Statistics",
      accessorKey: "totalRows",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const { totalRows, invalidRows } = row.original;
        const validRows = totalRows - (invalidRows || 0);

        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <FaDatabase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-semibold text-blue-700 dark:text-blue-300">
                  {totalRows?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Total
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <FiAlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                </div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  {invalidRows?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Invalid
                </p>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Upload Date",
      accessorKey: "createdAt",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
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
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownload(row.original.id)}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
            title="Download CSV"
          >
            <FiDownload className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 group"
            title="Edit Upload Details"
          >
            <FiEdit3 className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleView(row.original.id)}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 group"
            title="View Contact Details"
          >
            <FiEye className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  return (
    <DataTable
      title="Contact Lists"
      description={`Manage your uploaded contact lists and CSV files. ${
        uploads.length
      } upload${uploads.length !== 1 ? "s" : ""} total.`}
      columns={columns}
      data={uploads.reverse()}
      isLoading={loading}
      columnFilter={true}
    />
  );
};

export default UploadsTable;
