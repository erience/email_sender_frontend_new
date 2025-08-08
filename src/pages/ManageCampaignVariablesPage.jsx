import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCampaignById,
  updateCampaignVariables,
  uploadVariableAsset,
} from "../services/campaignServices";
import toast from "react-hot-toast";
import AppLayout from "../components/DashboardLayout";
import {
  FaTrash,
  FaExternalLinkAlt,
  FaPlus,
  FaImage,
  FaFile,
  FaArrowLeft,
  FaCode,
  FaSave,
} from "react-icons/fa";
import {
  FiTrash2,
  FiExternalLink,
  FiPlus,
  FiUpload,
  FiImage,
  FiFile,
  FiEdit3,
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiZap,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import { getTemplatesByCampaign } from "../services/templateService";

const ManageCampaignVariablesPage = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [variableMap, setVariableMap] = useState({});
  const [templates, setTemplates] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [uploadingKey, setUploadingKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCampaign();
    fetchTemplates();
  }, [campaignId]);

  const fetchCampaign = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await getCampaignById(campaignId);
      setCampaign(res?.data?.data || null);
      setVariableMap(res?.data?.data?.variableMap || {});
    } catch {
      toast.error("Failed to load campaign variables");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await getTemplatesByCampaign(campaignId);
      setTemplates(res?.data?.data || []);
    } catch {
      toast.error("Failed to fetch templates");
    }
  };

  const handleValueChange = (key, value) => {
    setVariableMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingKey(key);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId);
      formData.append("key", key);

      const res = await uploadVariableAsset(formData);
      handleValueChange(key, res.data.url);
      toast.success("File uploaded successfully!");
    } catch {
      toast.error("File upload failed.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleAddVariable = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey) {
      toast.error("Variable name cannot be empty");
      return;
    }

    // Validate variable name format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedKey)) {
      toast.error(
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores"
      );
      return;
    }

    const exists = Object.keys(variableMap).some(
      (k) => k.toLowerCase() === trimmedKey.toLowerCase()
    );
    if (exists) {
      toast.error("Variable name already exists");
      return;
    }

    setVariableMap((prev) => ({ ...prev, [trimmedKey]: "" }));
    setNewKey("");
    toast.success(`Variable "${trimmedKey}" added successfully!`);
  };

  const handleDelete = (key) => {
    const isUsed = templates.some((tpl) => tpl.content.includes(`^^${key}^^`));
    if (isUsed) {
      toast.error(
        `Variable "${key}" is used in templates and cannot be deleted`
      );
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete the variable "${key}"?`)
    ) {
      return;
    }

    const updated = { ...variableMap };
    delete updated[key];
    setVariableMap(updated);
    toast.success(`Variable "${key}" deleted successfully!`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateCampaignVariables(campaignId, { variableMap });
      toast.success("Variables saved successfully!");
    } catch {
      toast.error("Failed to save variables");
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = (value) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value)) {
      return <FiImage className="w-4 h-4 text-green-500" />;
    }
    if (/\.(pdf|doc|docx|txt)$/i.test(value)) {
      return <FiFile className="w-4 h-4 text-blue-500" />;
    }
    return <FiFile className="w-4 h-4 text-gray-500" />;
  };

  const isFileUrl = (value) => {
    return /\.(jpg|jpeg|png|gif|webp|pdf|docx?|xlsx?|zip|svg)$/i.test(value);
  };

  const getUsageCount = (key) => {
    return templates.filter((tpl) => tpl.content.includes(`^^${key}^^`)).length;
  };

  const variableCount = Object.keys(variableMap).length;
  const usedVariables = Object.keys(variableMap).filter(
    (key) => getUsageCount(key) > 0
  ).length;

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => navigate(`/campaign/${campaignId}`)}
            className="flex items-center px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 group"
          >
            <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Campaign Details
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">
            Variable Management
          </span>
        </nav>

        {/* Header Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded-xl">
                <FiSettings className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Variable Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage dynamic variables for "{campaign?.name || "Campaign"}"
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchCampaign(true)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Variables
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {variableCount}
                  </p>
                </div>
                <FiZap className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/60 dark:border-green-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Used in Templates
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {usedVariables}
                  </p>
                </div>
                <FiCheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200/60 dark:border-yellow-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Templates
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {templates.length}
                  </p>
                </div>
                <FiFile className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Add New Variable Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl">
              <FiPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Variable
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create dynamic content placeholders for your templates
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Variable Name
              </label>
              <input
                type="text"
                placeholder="e.g., company_name, user_first_name"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddVariable()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use letters, numbers, and underscores only. Must start with a
                letter or underscore.
              </p>
            </div>
            <button
              onClick={handleAddVariable}
              disabled={!newKey.trim()}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Variable
            </button>
          </div>
        </div>

        {/* Variables List */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded-xl">
                <FiEdit3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Campaign Variables
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage values and assets for your dynamic content variables
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {Object.entries(variableMap).length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FiZap className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No variables yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first variable to add dynamic content to your
                  templates
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(variableMap).map(([key, value]) => {
                  const usageCount = getUsageCount(key);
                  const isFile = isFileUrl(value);

                  return (
                    <div
                      key={key}
                      className="group bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-700/50 dark:to-gray-800 p-6 rounded-xl border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_auto_auto] gap-4 items-start">
                        {/* Variable Name */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border">
                              ^^{key}^^
                            </code>
                          </div>
                          <div className="flex items-center space-x-2">
                            {usageCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                Used in {usageCount} template
                                {usageCount !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                                <FiAlertCircle className="w-3 h-3 mr-1" />
                                Unused
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Value Input */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Variable Value
                          </label>
                          <div className="relative">
                            <input
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              value={value}
                              disabled={isFile}
                              onChange={(e) =>
                                handleValueChange(key, e.target.value)
                              }
                              placeholder="Enter variable value"
                            />
                            {isFile && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {getFileIcon(value)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload Asset
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, key)}
                              disabled={uploadingKey === key}
                              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 dark:file:bg-orange-900/30 file:text-orange-700 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/50 file:cursor-pointer cursor-pointer file:transition-all file:duration-200"
                              accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                            {uploadingKey === key && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Max 5MB • Images, PDFs, Documents
                          </p>
                        </div>

                        {/* Actions and Preview */}
                        <div className="flex items-center space-x-3">
                          {/* Preview */}
                          {/\.(jpg|jpeg|png|gif|webp)$/i.test(value) ? (
                            <div className="relative group">
                              <img
                                src={value}
                                alt={key}
                                className="w-12 h-12 object-cover border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200"
                                onClick={() => window.open(value, "_blank")}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                <FiExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          ) : value?.startsWith("http") ? (
                            <button
                              onClick={() => window.open(value, "_blank")}
                              className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
                              title="Open link in new tab"
                            >
                              <FiExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          ) : null}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(key)}
                            className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 group"
                            title="Delete variable"
                          >
                            <FiTrash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <FiInfo className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Variable Usage Guidelines
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Use ^^variable_name^^ syntax in your templates to insert
                  dynamic content
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Variable names should be descriptive and use underscores for
                  spaces
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Upload images, logos, or documents as assets for your
                  variables
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Variables used in templates cannot be deleted to prevent
                  template errors
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ManageCampaignVariablesPage;
