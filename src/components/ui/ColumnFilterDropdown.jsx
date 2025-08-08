import { useRef, useState, useEffect } from "react";
import { FaFilter, FaCheck, FaTimes } from "react-icons/fa";
import {
  FiFilter,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiMinus,
} from "react-icons/fi";

const ColumnFilterDropdown = ({
  columnKey,
  options = [],
  filterValues = [],
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValue = (option) => {
    const updated = filterValues.includes(option)
      ? filterValues.filter((v) => v !== option)
      : [...filterValues, option];
    onChange(updated);
  };

  const handleReset = () => {
    onChange([]);
    setSearchTerm("");
  };

  const handleSelectAll = () => {
    if (filterValues.length === filteredOptions.length) {
      onChange([]);
    } else {
      onChange(filteredOptions);
    }
  };

  const isAllSelected =
    filteredOptions.length > 0 &&
    filterValues.length === filteredOptions.length;
  const isIndeterminate =
    filterValues.length > 0 && filterValues.length < filteredOptions.length;

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        className={`p-1.5 rounded-xl transition-all duration-200 hover:!bg-gray-100 dark:hover:!bg-gray-700 ${
          filterValues.length > 0
            ? "text-blue-600 dark:text-blue-400 !bg-blue-50 dark:!bg-blue-900/30 hover:!bg-blue-100 dark:hover:!bg-blue-900/50"
            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        }`}
        onClick={() => setOpen(!open)}
        title={`Filter ${columnKey} (${filterValues.length} selected)`}
      >
        <FiFilter className="w-4 h-4" />
        {filterValues.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 !bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1 shadow-lg">
            {filterValues.length > 99 ? "99+" : filterValues.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-30 !bg-white dark:!bg-gray-800 border border-gray-200 dark:border-gray-700 right-0 mt-2 w-80 max-h-96 shadow-2xl rounded-2xl overflow-auto backdrop-blur-sm !bg-white/95 dark:!bg-gray-800/95">
          {/* Header */}

          <div className="!bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 !bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                  <FiFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Filter Options
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Column: {columnKey}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:!bg-gray-100 dark:hover:!bg-gray-700 rounded-lg transition-all duration-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 !bg-white dark:!bg-gray-800">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 !bg-white dark:!bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Select All / Deselect All */}
          {filteredOptions.length > 1 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 !bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/10">
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 !bg-gray-100 dark:!bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  />
                  {isIndeterminate && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <FiMinus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <span className="flex-1">
                  {isAllSelected ? "Deselect All" : "Select All"}
                  {filteredOptions.length !== options.length && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({filteredOptions.length})
                    </span>
                  )}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isAllSelected || isIndeterminate
                      ? "!bg-blue-100 dark:!bg-blue-900/30"
                      : "!bg-gray-100 dark:!bg-gray-700 group-hover:!bg-blue-50 dark:group-hover:!bg-blue-900/20"
                  }`}
                >
                  {isAllSelected ? (
                    <FiCheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  ) : isIndeterminate ? (
                    <FiMinus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <div className="w-2 h-2 border border-gray-400 dark:border-gray-500 rounded-sm"></div>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Filter Options */}
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredOptions.map((option, index) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 px-4 py-3 text-sm hover:!bg-blue-50 dark:hover:!bg-blue-900/20 rounded-xl cursor-pointer transition-all duration-200 group ${
                      filterValues.includes(option)
                        ? "!bg-blue-50/50 dark:!bg-blue-900/10 border-l-2 border-blue-500"
                        : "hover:border-l-2 hover:border-transparent"
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filterValues.includes(option)}
                        onChange={() => toggleValue(option)}
                        className="w-4 h-4 text-blue-600 !bg-gray-100 dark:!bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                      />
                    </div>
                    <span className="flex-1 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors font-medium">
                      {option}
                    </span>
                    <div className="flex items-center space-x-2">
                      {filterValues.includes(option) && (
                        <div className="w-6 h-6 !bg-green-100 dark:!bg-green-900/30 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        #{index + 1}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="p-4 !bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  No options found
                </h4>
                {searchTerm ? (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      No matches for "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    No filter options available
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="!bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 !bg-blue-400 rounded-full"></div>
                <span className="font-medium">
                  {filterValues.length} of {options.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {filterValues.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:!bg-red-50 dark:hover:!bg-red-900/20 rounded-lg transition-all duration-200 font-medium border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                  >
                    <FiX className="w-3 h-3 mr-1.5" />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center px-4 py-2 text-xs !bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FaCheck className="w-3 h-3 mr-1.5" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnFilterDropdown;
