import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/DashboardLayout";
import SmtpConfigForm from "../components/SmtpConfig/SmtpConfigForm";
import SmtpConfigList from "../components/SmtpConfig/SmtpConfigList";
import {
  checkSmtpConfig,
  getAllConfigs,
  getConfigById,
} from "../services/smtpServices";
import Loader from "../components/Loader";
import {
  FaServer,
  FaPlus,
  FaCog,
  FaEnvelope,
  FaShieldAlt,
} from "react-icons/fa";
import {
  FiServer,
  FiPlus,
  FiSettings,
  FiMail,
  FiShield,
  FiRefreshCw,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiArrowLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";

const SmtpConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const memorizedInitialFormValues = useMemo(() => {
    return (
      editData || {
        smtpName: "",
        emailHost: "",
        emailPort: "",
        emailUser: "",
        emailPassword: "",
        status: "active",
      }
    );
  }, [editData]);

  const fetchConfigs = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await getAllConfigs();
      setConfigs(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch configs");
      toast.error("Failed to load SMTP configurations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const response = await getConfigById(id);
      setEditData(response?.data?.data);
    } catch (error) {
      console.error("Failed to fetch config by ID");
      toast.error("Failed to load configuration for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async (id) => {
    setLoading(true);
    try {
      const response = await checkSmtpConfig(id);
      toast.success(response?.data?.message);
    } catch (error) {
      console.log("Error while handleCheck", error);
      toast.error(error?.response?.data?.message || "Failed to varify SMTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(null);
  };

  const handleAddNew = () => {
    setEditData({});
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Calculate statistics
  const configStats = {
    total: configs.length,
    active: configs.filter((config) => config.status === "active").length,
    inactive: configs.filter((config) => config.status === "inactive").length,
  };

  if (loading && !refreshing) {
    return (
      <AppLayout>
        <div className="p-6">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                <FiServer className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  SMTP Configuration
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your email server configurations for campaign delivery
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchConfigs(true)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              {!editData && (
                <button
                  onClick={handleAddNew}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add SMTP Config
                </button>
              )}

              {editData && (
                <button
                  onClick={handleCancel}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:from-gray-600 hover:to-slate-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </button>
              )}
            </div>
          </div>

          {/* Statistics */}
          {!editData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Total Configs
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {configStats.total}
                    </p>
                  </div>
                  <FiServer className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/60 dark:border-green-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Active
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {configStats.active}
                    </p>
                  </div>
                  <FiCheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-red-200/60 dark:border-red-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Inactive
                    </p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {configStats.inactive}
                    </p>
                  </div>
                  <FiXCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {editData ? (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <FiSettings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editData.id
                      ? "Edit SMTP Configuration"
                      : "Create New SMTP Configuration"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {editData.id
                      ? "Update your email server settings"
                      : "Configure a new email server for sending campaigns"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <SmtpConfigForm
                onSuccess={() => {
                  fetchConfigs();
                  handleCancel();
                }}
                editData={memorizedInitialFormValues}
                onCancel={handleCancel}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                  <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    SMTP Configurations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Manage your email server configurations and delivery
                    settings
                  </p>
                </div>
              </div>
            </div>

            <SmtpConfigList
              configs={configs}
              onEdit={handleEdit}
              onCheck={handleCheck}
            />
          </div>
        )}

        {/* No Configurations Empty State */}
        {!editData && configs.length === 0 && !loading && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-12">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FiServer className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No SMTP configurations yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first SMTP configuration to start sending email
                campaigns
              </p>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Create Your First SMTP Config
              </button>
            </div>
          </div>
        )}

        {/* SMTP Guidelines */}
        {!editData && configs.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <FiShield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  SMTP Configuration Best Practices
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Use dedicated email servers for better delivery rates
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Test configurations before using them in campaigns
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Keep credentials secure and rotate passwords regularly
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Monitor server performance and delivery statistics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SmtpConfigPage;
