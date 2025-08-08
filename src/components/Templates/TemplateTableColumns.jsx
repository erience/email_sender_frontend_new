import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  FiEdit3,
  FiEye,
  FiTrash2,
  FiFileText,
  FiTag,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";

const templateTableColumns = ({ onEdit, onDelete, onView }) => [
  {
    header: "Template",
    accessorKey: "templateName",
    enableColumnFilter: false,
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg">
          <FiFileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {row.original.templateName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ID: {row.original.id} • Template
          </p>
        </div>
      </div>
    ),
  },
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
              No subjects defined
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
    header: "Status",
    accessorKey: "status",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const template = row.original;
      const hasContent = template.content && template.content.trim().length > 0;
      const hasSubjects = template.subjects && template.subjects.length > 0;

      let status = "draft";
      let statusConfig = {
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
        icon: <FiClock className="w-3 h-3" />,
        label: "Draft",
      };

      if (hasContent && hasSubjects) {
        status = "ready";
        statusConfig = {
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
          icon: <FiCheckCircle className="w-3 h-3" />,
          label: "Ready",
        };
      } else if (hasContent || hasSubjects) {
        status = "incomplete";
        statusConfig = {
          color:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
          icon: <FiAlertCircle className="w-3 h-3" />,
          label: "Incomplete",
        };
      }

      return (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}
        >
          {statusConfig.icon}
          <span className="ml-1">{statusConfig.label}</span>
        </span>
      );
    },
  },
  {
    header: "Content Info",
    accessorKey: "contentInfo",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const content = row.original.content || "";
      const wordCount = content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const charCount = content.length;
      const variableCount = (content.match(/\^\^[^^\s]+\^\^/g) || []).length;

      return (
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="font-medium">{wordCount}</span>
              <span>words</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{charCount}</span>
              <span>chars</span>
            </div>
          </div>
          {variableCount > 0 && (
            <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
              <span className="font-medium">{variableCount}</span>
              <span>variable{variableCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    header: "Created",
    accessorKey: "createdAt",
    enableColumnFilter: false,
    enableSorting: true,
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
    accessorKey: "actions",
    cell: ({ row }) => {
      const tpl = row.original;
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(tpl.content)}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 group"
            title="Preview Template"
          >
            <FiEye className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onEdit(tpl)}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
            title="Edit Template"
          >
            <FiEdit3 className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </button>

          {onDelete && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete "${tpl.templateName}"?`
                  )
                ) {
                  onDelete(tpl.id);
                }
              }}
              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 group"
              title="Delete Template"
            >
              <FiTrash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
  },
];

export default templateTableColumns;
