import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/DashboardLayout";
import DataTable from "../components/ui/DataTable";
import toast from "react-hot-toast";

import {
  getTemplatesByCampaign,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../services/templateService";
import { getCampaignById } from "../services/campaignServices";
import { getFieldsByCampaign } from "../services/campaignServices";

import TemplateEditor from "../components/Templates/TemplateEditor";
import templateTableColumns from "../components/Templates/TemplateTableColumns";

import {
  FaFile,
  FaPlus,
  FaArrowLeft,
  FaCode,
  FaEye,
  FaPalette,
} from "react-icons/fa";
import {
  FiRefreshCw,
  FiFileText,
  FiEdit,
  FiLayers,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiArrowDown,
} from "react-icons/fi";

const ManageTemplatesPage = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const editorRef = useRef();

  useEffect(() => {
    fetchCampaign();
    fetchTemplates();
    fetchFields();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const res = await getCampaignById(campaignId);
      setCampaign(res?.data?.data || null);
    } catch {
      toast.error("Failed to load campaign.");
    }
  };

  const fetchFields = async () => {
    try {
      const res = await getFieldsByCampaign(campaignId);
      setFields(res?.data?.data || []);
    } catch {
      toast.error("Failed to load fields.");
    }
  };

  const fetchTemplates = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await getTemplatesByCampaign(campaignId);
      setTemplates(res?.data?.data || []);
    } catch {
      toast.error("Failed to load templates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully!");
      fetchTemplates();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleView = (htmlContent) => {
    let compiled = htmlContent;

    fields.forEach(({ key, value }) => {
      if (value !== key) {
        const regex = new RegExp(`\\^\\^${key}\\^\\^`, "g");
        compiled = compiled.replace(regex, value);
      }
    });

    const blob = new Blob([compiled], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSave = async (formData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
        toast.success("Template updated successfully!");
      } else {
        await createTemplate({ ...formData, campaignId });
        toast.success("Template created successfully!");
      }
      setEditingTemplate(null);
      setCreatingTemplate(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed.");
    }
  };

  const scrollToEditor = () => {
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancelEditor = () => {
    setEditingTemplate(null);
    setCreatingTemplate(false);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setCreatingTemplate(true);
    scrollToEditor();
  };

  const handleEdit = (template) => {
    setCreatingTemplate(false);
    setEditingTemplate(template);
    scrollToEditor();
  };

  // Calculate template statistics
  const templateStats = {
    total: templates.length,
    active: templates.filter((t) => t.status === "active").length,
    draft: templates.filter((t) => t.status === "draft").length,
  };

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
            Template Management
          </span>
        </nav>

        {/* Header Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl">
                <FaFile className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Template Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage email templates for "{campaign?.name || "Campaign"}"
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchTemplates(true)}
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
                onClick={handleCreateNew}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>

          {/* Template Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Templates
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {templateStats.total}
                  </p>
                </div>
                <FiLayers className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/60 dark:border-green-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {templateStats.active}
                  </p>
                </div>
                <FiCheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200/60 dark:border-yellow-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Draft
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {templateStats.draft}
                  </p>
                </div>
                <FiClock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl">
                <FiLayers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Email Templates
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Create and manage your email templates with dynamic content
                </p>
              </div>
            </div>
          </div>

          <DataTable
            title={"Templates"}
            columns={templateTableColumns({
              onEdit: handleEdit,
              onDelete: handleDelete,
              onView: handleView,
            })}
            data={templates.reverse()}
            isLoading={loading}
            columnFilter={true}
            description={`Manage email templates for your campaigns. ${
              templates.length
            } template${templates.length !== 1 ? "s" : ""} total.`}
          />
        </div>

        {/* Template Editor Section */}
        {(editingTemplate || creatingTemplate) && (
          <div ref={editorRef} className="scroll-mt-6">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                      {editingTemplate ? (
                        <FiEdit className="w-6 h-6 text-white" />
                      ) : (
                        <FaCode className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingTemplate
                          ? "Edit Template"
                          : "Create New Template"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {editingTemplate
                          ? `Editing: ${editingTemplate.templateName}`
                          : "Design your email template with dynamic content"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCancelEditor}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <TemplateEditor
                  template={editingTemplate}
                  fields={fields}
                  onCancel={handleCancelEditor}
                  onSave={handleSave}
                />
              </div>
            </div>
          </div>
        )}

        {/* No Templates Empty State */}
        {!loading && templates.length === 0 && !creatingTemplate && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-12">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FaFile className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No templates yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first email template to get started with your
                campaign
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                Create Your First Template
              </button>
            </div>
          </div>
        )}

        {/* Template Guidelines */}
        {!editingTemplate && !creatingTemplate && templates.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <FaPalette className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Template Design Tips
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Use dynamic variables (^^variable^^) to personalize content
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Keep your design responsive for mobile devices
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Test templates with preview functionality before using
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Include clear call-to-action buttons for better engagement
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Scroll to Editor Indicator */}
        {(editingTemplate || creatingTemplate) && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={scrollToEditor}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              title="Scroll to Editor"
            >
              <FiArrowDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ManageTemplatesPage;
