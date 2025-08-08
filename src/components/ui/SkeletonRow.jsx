"use client";
import React from "react";

const SkeletonRow = ({ columnsCount }) => {
  return (
    <tr className="animate-pulse border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-700/30 transition-all duration-200">
      {[...Array(columnsCount)].map((_, idx) => (
        <td
          key={idx}
          className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
        >
          <div className="flex items-center space-x-3">
            {/* Main content skeleton */}
            <div className="flex-1">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />
              {/* Randomly show secondary content for some cells */}
              {Math.random() > 0.6 && (
                <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg mt-2 w-3/4 animate-shimmer bg-[length:200%_100%]" />
              )}
            </div>

            {/* Occasionally show an action button skeleton for the last column */}
            {idx === columnsCount - 1 && Math.random() > 0.5 && (
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded-lg animate-shimmer bg-[length:200%_100%]" />
                <div className="h-8 w-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg animate-shimmer bg-[length:200%_100%]" />
              </div>
            )}
          </div>
        </td>
      ))}
    </tr>
  );
};

// Enhanced version with different skeleton patterns
export const EnhancedSkeletonRow = ({ columnsCount, variant = "default" }) => {
  const getSkeletonContent = (columnIndex) => {
    const patterns = {
      default: () => (
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />
      ),
      avatar: () => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-shimmer bg-[length:200%_100%] shadow-sm" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />
            <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg w-2/3 animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      ),
      status: () => (
        <div className="flex items-center space-x-2">
          <div className="h-6 w-20 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded-full animate-shimmer bg-[length:200%_100%] shadow-sm" />
          <div className="h-2 w-2 bg-gradient-to-r from-green-200 via-green-300 to-green-200 dark:from-green-800 dark:via-green-700 dark:to-green-800 rounded-full animate-shimmer bg-[length:200%_100%]" />
        </div>
      ),
      number: () => (
        <div className="flex items-center justify-end space-x-2">
          <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />
          <div className="h-3 w-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]" />
        </div>
      ),
      actions: () => (
        <div className="flex items-center justify-end space-x-2">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded-xl animate-shimmer bg-[length:200%_100%] shadow-sm" />
          <div className="h-8 w-8 bg-gradient-to-r from-green-100 via-green-200 to-green-100 dark:from-green-900/40 dark:via-green-800/40 dark:to-green-900/40 rounded-xl animate-shimmer bg-[length:200%_100%] shadow-sm" />
          <div className="h-8 w-8 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 dark:from-orange-900/40 dark:via-orange-800/40 dark:to-orange-900/40 rounded-xl animate-shimmer bg-[length:200%_100%] shadow-sm" />
        </div>
      ),
      email: () => (
        <div className="space-y-1">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%] w-full" />
          <div className="h-3 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded animate-shimmer bg-[length:200%_100%] w-3/4" />
        </div>
      ),
      date: () => (
        <div className="space-y-1">
          <div className="h-4 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 dark:from-purple-900/40 dark:via-purple-800/40 dark:to-purple-900/40 rounded-lg animate-shimmer bg-[length:200%_100%] w-24" />
          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%] w-16" />
        </div>
      ),
      metrics: () => (
        <div className="flex items-center space-x-2">
          <div className="h-6 w-12 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100 dark:from-indigo-900/40 dark:via-indigo-800/40 dark:to-indigo-900/40 rounded-full animate-shimmer bg-[length:200%_100%]" />
          <div className="h-1 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-shimmer bg-[length:200%_100%]" />
        </div>
      ),
    };

    // Intelligent pattern selection based on column position and context
    if (columnIndex === 0 && variant === "avatar") return patterns.avatar();
    if (columnIndex === columnsCount - 1) return patterns.actions();

    // Context-aware pattern selection
    const randomValue = Math.random();
    if (randomValue > 0.85) return patterns.status();
    if (randomValue > 0.75) return patterns.number();
    if (randomValue > 0.65) return patterns.email();
    if (randomValue > 0.55) return patterns.date();
    if (randomValue > 0.45) return patterns.metrics();

    return patterns.default();
  };

  return (
    <tr className="animate-pulse hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-300 border-b border-gray-200 dark:border-gray-700">
      {[...Array(columnsCount)].map((_, idx) => (
        <td
          key={idx}
          className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
        >
          <div className="min-h-[40px] flex items-center">
            {getSkeletonContent(idx)}
          </div>
        </td>
      ))}
    </tr>
  );
};

// Professional Loading Table Component
export const SkeletonTable = ({
  rows = 10,
  columns = 5,
  variant = "default",
  showHeader = true,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Skeleton */}
      {showHeader && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 rounded-xl animate-shimmer bg-[length:200%_100%]" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />
                <div className="h-4 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded animate-shimmer bg-[length:200%_100%]" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-24 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded-xl animate-shimmer bg-[length:200%_100%]" />
              <div className="h-10 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
        </div>
      )}

      {/* Table Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {[...Array(columns)].map((_, idx) => (
            <div
              key={idx}
              className="flex-1 px-6 py-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%] w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Body Skeleton */}
      <table className="w-full">
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(rows)].map((_, idx) => (
            <EnhancedSkeletonRow
              key={idx}
              columnsCount={columns}
              variant={variant}
            />
          ))}
        </tbody>
      </table>

      {/* Footer Skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />
          <div className="flex items-center space-x-2">
            <div className="h-10 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-shimmer bg-[length:200%_100%]" />
            <div className="h-10 w-10 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded-xl animate-shimmer bg-[length:200%_100%]" />
            <div className="h-10 w-10 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-900/40 rounded-xl animate-shimmer bg-[length:200%_100%]" />
            <div className="h-10 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonRow;
