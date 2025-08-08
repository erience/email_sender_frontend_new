import React, { useEffect, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import SkeletonRow from "./SkeletonRow";
import toast from "react-hot-toast";
import ColumnFilterDropdown from "./ColumnFilterDropdown";
import {
  FiSearch,
  FiDownload,
  FiCopy,
  FiFileText,
  FiFile,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiMoreHorizontal,
  FiFilter,
  FiRefreshCw,
  FiDatabase,
} from "react-icons/fi";

const DataTable = ({
  columns,
  data,
  title,
  columnFilter = false,
  headerIcons,
  isLoading = false,
  description,
  alertType = "info",
  cardHeader,
  totalCount,
  pagination,
  setPagination,
  onPageChange,
  onSearch,
  searchTerm,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const [columnFilters, setColumnFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(isLoading);
  const [sorting, setSorting] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Use pagination from props or default
  const [localPagination, setLocalPagination] = useState(
    pagination || { pageIndex: 0, pageSize: 10 }
  );

  const lastPageRef = useRef({ pageIndex: null, pageSize: null });
  const searchTimeoutRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Update local pagination when props change
  useEffect(() => {
    if (pagination) {
      setLocalPagination(pagination);
    }
  }, [pagination]);

  // Update local search term when prop changes
  useEffect(() => {
    if (searchTerm !== undefined) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // For server-side pagination, use original data directly
  // For client-side pagination, filter the data
  useEffect(() => {
    if (!isLoading) {
      if (onPageChange && totalCount) {
        // Server-side pagination - use data as is
        setFilteredData(data || []);
      } else {
        // Client-side pagination - filter data
        filterData();
      }
    }
  }, [
    data,
    localSearchTerm,
    columnFilters,
    isLoading,
    onPageChange,
    totalCount,
  ]);

  const filterData = () => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    const globalSearch = localSearchTerm.toLowerCase();

    const filtered = data.filter((row) => {
      const matchesGlobal =
        globalSearch === "" ||
        columns.some((col) => {
          const value = row[col.accessorKey];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(globalSearch)
          );
        });

      const matchesColumns = Object.entries(columnFilters).every(
        ([key, filterValue]) => {
          const column = columns.find((c) => c.accessorKey === key);
          const value = row[key];

          if (value === null || value === undefined) return false;

          if (Array.isArray(filterValue)) {
            return (
              filterValue.length === 0 ||
              filterValue.includes(value?.toString())
            );
          }

          const stringValue = value?.toString().toLowerCase();
          const stringFilter = filterValue?.toString().toLowerCase();

          return column?.cycleFilter
            ? stringValue === stringFilter
            : stringValue.includes(stringFilter);
        }
      );

      return matchesGlobal && matchesColumns;
    });

    setFilteredData(filtered);
  };

  const getUniqueValues = (key) => {
    const values = new Set();
    (data || []).forEach((row) => {
      const value = row[key];
      if (value !== null && value !== undefined) {
        values.add(value.toString());
      }
    });
    return Array.from(values);
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    // For server-side search, debounce the API call
    if (onSearch) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, 500);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (updater) => {
    const newPagination =
      typeof updater === "function" ? updater(localPagination) : updater;

    setLocalPagination(newPagination);

    if (setPagination) {
      setPagination(newPagination);
    }

    if (onPageChange) {
      onPageChange(newPagination);
    }
  };

  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    manualPagination: !!onPageChange,
    pageCount: onPageChange
      ? Math.ceil((totalCount || 0) / localPagination.pageSize)
      : Math.ceil(filteredData.length / localPagination.pageSize),
    state: {
      pagination: localPagination,
      sorting,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    getRowId: (row, index) =>
      `${index}-${row?.f_pan || row?.label || row?.type || index}`,
  });

  const exportCSV = () => {
    const csvContent = [
      columns.map((col) => col.header || "").join(","),
      ...filteredData.map((row) =>
        columns
          .map((col) =>
            (row[col.accessorKey] || "").toString().replace(/,/g, ";")
          )
          .join(",")
      ),
    ].join("\n");

    saveAs(
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
      `${title}.csv`
    );
    toast.success("CSV exported successfully");
    setShowExportMenu(false);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${title}.xlsx`);
    toast.success("Excel exported successfully");
    setShowExportMenu(false);
  };

  const copyToClipboard = () => {
    const text = [
      columns.map((col) => col.header || "").join("\t"),
      ...filteredData.map((row) =>
        columns.map((col) => row[col.accessorKey] || "").join("\t")
      ),
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
        setShowExportMenu(false);
      })
      .catch(() => toast.error("Copy failed"));
  };

  const generatePageNumbers = () => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 3) pages.push(0, "...");
      for (
        let i = Math.max(0, currentPage - 2);
        i <= Math.min(totalPages - 1, currentPage + 2);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...", totalPages - 1);
    }

    return pages;
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = totalCount ?? filteredData.length;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="!bg-white dark:!bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl">
                <FiDatabase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                {title && (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {cardHeader && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {cardHeader}
                  </p>
                )}
              </div>
            </div>
          </div>

          {headerIcons && (
            <div className="flex items-center gap-2 ml-4">{headerIcons}</div>
          )}
        </div>

        {description && (
          <div
            className={`mt-4 p-4 rounded-xl border backdrop-blur-sm ${
              alertType === "info"
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                {alertType === "info" ? (
                  <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-400 dark:bg-red-500 rounded-full"></div>
                )}
              </div>
              <p className="text-sm font-medium">{description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="!bg-white dark:!bg-gray-900 p-6 border-b !border-gray-200 dark:!border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Export
                <FiChevronDown className="w-4 h-4 ml-2" />
              </button>

              {/* Export Dropdown */}
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 !bg-white dark:!bg-gray-800 rounded-xl shadow-2xl border !border-gray-200 dark:!border-gray-700 z-50 overflow-hidden">
                  <div className="py-2">
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center px-4 py-3 text-sm !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-700 transition-colors"
                    >
                      <FiCopy className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={exportExcel}
                      className="w-full flex items-center px-4 py-3 text-sm !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-700 transition-colors"
                    >
                      <FiFile className="w-4 h-4 mr-3 text-green-500" />
                      Export as Excel
                    </button>
                    <button
                      onClick={exportCSV}
                      className="w-full flex items-center px-4 py-3 text-sm !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-700 transition-colors"
                    >
                      <FiFileText className="w-4 h-4 mr-3 text-blue-500" />
                      Export as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={localSearchTerm}
                onChange={handleSearchChange}
                placeholder="Search records..."
                className="pl-10 pr-4 py-2.5 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 !bg-white dark:!bg-gray-800 backdrop-blur-sm w-64 hover:!bg-white dark:!hover:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !placeholder-gray-500 dark:!placeholder-gray-400"
              />
              {localSearchTerm && (
                <button
                  onClick={() => {
                    setLocalSearchTerm("");
                    if (onSearch) onSearch("");
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                    ×
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:!bg-gray-100 dark:hover:!bg-gray-700 transition-colors"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {header.column.getIsSorted() === "asc" ? (
                              <FiChevronUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <FiChevronDown className="w-4 h-4" />
                            ) : (
                              <div className="flex flex-col">
                                <FiChevronUp className="w-3 h-3 -mb-1 opacity-50" />
                                <FiChevronDown className="w-3 h-3 opacity-50" />
                              </div>
                            )}
                          </span>
                        )}
                        {columnFilter &&
                          header.column.columnDef.enableColumnFilter !==
                            false && (
                            <ColumnFilterDropdown
                              columnKey={header.column.columnDef.accessorKey}
                              filterValues={
                                columnFilters[
                                  header.column.columnDef.accessorKey
                                ] || []
                              }
                              options={getUniqueValues(
                                header.column.columnDef.accessorKey
                              )}
                              onChange={(selectedOptions) =>
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [header.column.columnDef.accessorKey]:
                                    selectedOptions,
                                }))
                              }
                            />
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="!bg-white dark:!bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <SkeletonRow key={i} columnsCount={columns.length} />
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:!bg-gradient-to-r hover:!from-blue-50 hover:!to-indigo-50 
              dark:hover:!from-gray-800 dark:hover:!to-gray-700
              transition-all duration-200 ${
                index % 2 === 0
                  ? "!bg-white dark:!bg-gray-900"
                  : "!bg-gray-50 dark:!bg-gray-800"
              }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-16 !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-gray-900"
                  >
                    <div className="flex flex-col items-center">
                      <FiDatabase className="w-12 h-12 !text-gray-300 dark:!text-gray-600 mb-4" />
                      <p className="text-lg font-medium !text-gray-600 dark:!text-gray-400 mb-2">
                        No data available
                      </p>
                      <p className="text-sm !text-gray-500 dark:!text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Results Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              Showing {pageIndex * pageSize + 1} to{" "}
              {Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows}{" "}
              entries
            </span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 !bg-white dark:!bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:!bg-gray-50 dark:hover:!bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FiChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {generatePageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <button
                    key={index}
                    className={`w-10 h-10 text-sm font-medium rounded-xl border transition-all duration-200 ${
                      table.getState().pagination.pageIndex === page
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-lg"
                        : "!bg-white dark:!bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:!bg-gray-50 dark:hover:!bg-gray-700 shadow-sm hover:shadow-md"
                    }`}
                    onClick={() => table.setPageIndex(page)}
                  >
                    {page + 1}
                  </button>
                ) : (
                  <span
                    key={index}
                    className="px-2 text-gray-400 dark:text-gray-500 font-medium"
                  >
                    ...
                  </span>
                )
              )}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 !bg-white dark:!bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:!bg-gray-50 dark:hover:!bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Next
              <FiChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
