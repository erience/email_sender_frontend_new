import React from "react";
import DataTable from "../ui/DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUsers,
  FiShield,
  FiCopy,
  FiTrash2,
} from "react-icons/fi";

const EmailListSection = ({
  selectedUpload,
  emailSummary,
  emails,
  emailsLoading,
  emailPage,
  emailTotal,
  handleEditEmail,
  handleDeleteEmail,
  onPageChange,
}) => {
  console.log({
    selectedUpload,
    emails,
    emailsLoading,
    emailPage,
    emailTotal,
    handleEditEmail,
    handleDeleteEmail,
    onPageChange,
  });

  const columns = [
    {
      header: "#",
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">
          {row.index + 1 + (emailPage - 1) * 10}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Email Address",
      accessorKey: "email",
      enableSorting: true,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
            <FiMail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {row.original.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {row.original.id}
            </p>
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
        const { isDuplicate, isBlocked, isInvalid } = row.original;

        if (isInvalid) {
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700">
              <FiXCircle className="w-3 h-3 mr-1" />
              Invalid
            </span>
          );
        }

        if (isBlocked) {
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">
              <FiShield className="w-3 h-3 mr-1" />
              Blocked
            </span>
          );
        }

        if (isDuplicate) {
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700">
              <FiCopy className="w-3 h-3 mr-1" />
              Duplicate
            </span>
          );
        }

        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
            <FiCheckCircle className="w-3 h-3 mr-1" />
            Valid
          </span>
        );
      },
    },
    {
      header: "Additional Data",
      accessorKey: "otherFields",
      cell: ({ getValue }) => {
        const value = getValue();
        try {
          const fields = JSON.parse(value || "{}");
          const fieldEntries = Object.entries(fields);

          if (fieldEntries.length === 0) {
            return (
              <span className="text-gray-400 dark:text-gray-500 italic text-sm">
                No additional data
              </span>
            );
          }

          return (
            <div className="max-w-xs">
              <div className="space-y-1">
                {fieldEntries.slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {key}:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">
                      {String(value).length > 20
                        ? `${String(value).substring(0, 20)}...`
                        : value}
                    </span>
                  </div>
                ))}
                {fieldEntries.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{fieldEntries.length - 2} more field
                    {fieldEntries.length - 2 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        } catch {
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700">
              <FiAlertCircle className="w-3 h-3 mr-1" />
              Invalid Data
            </span>
          );
        }
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditEmail(row.original)}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
            title="Edit Contact"
          >
            <FaEdit className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleDeleteEmail(row.original.id)}
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 group"
            title="Delete Contact"
          >
            <FaTrash className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {emailSummary && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contact validation results for upload #{selectedUpload}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Total Contacts",
                value: emailSummary.total,
                color:
                  "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600",
                icon: <FiUsers className="w-5 h-5" />,
              },
              {
                label: "Valid",
                value: emailSummary.valid,
                color:
                  "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700",
                icon: (
                  <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ),
              },
              {
                label: "Invalid",
                value: emailSummary.invalid,
                color:
                  "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700",
                icon: (
                  <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                ),
              },
              {
                label: "Blocked",
                value: emailSummary.blocked,
                color:
                  "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
                icon: (
                  <FiShield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                ),
              },
              {
                label: "Duplicate",
                value: emailSummary.duplicate,
                color:
                  "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
                icon: (
                  <FiCopy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ),
              },
              {
                label: "Deleted",
                value: emailSummary.deleted,
                color:
                  "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-700",
                icon: (
                  <FiTrash2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                ),
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`${stat.color} p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  {stat.icon}
                  <span className="text-2xl font-bold">
                    {stat.value?.toLocaleString() || 0}
                  </span>
                </div>
                <p className="text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Validation Rate */}
          <div className="mt-6 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-600/60">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Validation Success Rate
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {emailSummary.total > 0
                  ? `${(
                      (emailSummary.valid / emailSummary.total) *
                      100
                    ).toFixed(2)}%`
                  : "0%"}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width:
                    emailSummary.total > 0
                      ? `${(emailSummary.valid / emailSummary.total) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Email Data Table */}
      <DataTable
        title="Contact Details"
        description={`Individual contact records from upload #${selectedUpload}. ${emailTotal} contact${
          emailTotal !== 1 ? "s" : ""
        } total.`}
        columns={columns}
        data={emails}
        isLoading={emailsLoading}
        totalCount={emailTotal}
        pagination={{
          pageIndex: emailPage - 1,
          pageSize: 10,
        }}
        onPageChange={(pagination) => onPageChange(pagination.pageIndex + 1)}
        columnFilter={true}
      />
    </div>
  );
};

export default EmailListSection;
