import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import CampaignForm from "../components/Campaign/CampaignForm";
import CampaignList from "../components/Campaign/CampaignList";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
} from "../services/campaignServices";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiArrowLeft,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import { FaBullhorn } from "react-icons/fa";

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [refreshing, setRefreshing] = useState(false);

  const memoizedInitialValues = useMemo(() => {
    if (editData) return editData;
    return {
      name: "",
      description: "",
    };
  }, [editData]);

  const navigate = useNavigate();

  const fetchCampaigns = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await getAllCampaigns();
      setCampaigns(res?.data?.data || []);
    } catch (error) {
      console.error("Error loading campaigns", error);
      toast.error(error?.response?.data?.message, "Failed to load campaigns");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const res = await getCampaignById(id);
      setEditData(res?.data?.data || null);
    } catch (error) {
      console.error("Failed to fetch campaign by ID");
      toast.error(
        error?.response?.data?.message || "Failed to load campaign data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(null);
  };

  const handleView = (id) => {
    navigate(`/campaign/${id}`);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editData?.id) {
        try {
          const response = await updateCampaign(editData.id, formData);
          if (response?.data?.success) {
            toast.success("Campaign updated successfully!");
          }
        } catch (error) {
          console.log("Error while updating campaign", error);
          if (error?.response?.data?.message) {
            toast.error(
              error?.response?.data?.message || "Error updating campaignData"
            );
          }
        }
      } else {
        try {
          const response = await createCampaign({ ...formData });
          if (response?.data?.success) {
            toast.success("Campaign created successfully!");
          }
        } catch (error) {
          console.log("Error while creating campaign", error);
          if (error?.response?.data?.message) {
            toast.error(
              error?.response?.data?.message || "Error creating campaign"
            );
          }
        }
      }
      await fetchCampaigns();
      setEditData(null);
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  // Filter campaigns based on search and status
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }

    return filtered;
  }, [campaigns, searchTerm, statusFilter]);

  // Get campaign statistics
  const campaignStats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === "active").length;
    const draft = campaigns.filter((c) => c.status === "draft").length;
    const completed = campaigns.filter((c) => c.status === "completed").length;

    return { total, active, draft, completed };
  }, [campaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading && !campaigns.length) {
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
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              {editData ? (
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              ) : (
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                  <FaBullhorn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {editData
                    ? editData.id
                      ? "Edit Campaign"
                      : "Create Campaign"
                    : "Campaigns"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {editData
                    ? editData.id
                      ? "Update your campaign details"
                      : "Create a new email campaign"
                    : "Manage your email marketing campaigns"}
                </p>
              </div>
            </div>

            {!editData && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fetchCampaigns(true)}
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
                  onClick={() => setEditData({})}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Create Campaign
                </button>
              </div>
            )}
          </div>

          {/* Campaign Statistics - Only show when not editing */}
          {!editData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {campaignStats.total}
                    </p>
                  </div>
                  <FiActivity className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/60 dark:border-green-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Active
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {campaignStats.active}
                    </p>
                  </div>
                  <FiTrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200/60 dark:border-yellow-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Draft
                    </p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {campaignStats.draft}
                    </p>
                  </div>
                  <FiGrid className="w-6 h-6 text-yellow-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200/60 dark:border-purple-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {campaignStats.completed}
                    </p>
                  </div>
                  <FaBullhorn className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Controls - Only show when not editing */}
        {!editData && campaigns.length > 0 && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search and Filter */}
              <div className="flex flex-1 items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 transition-all duration-200"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border !border-gray-300 dark:!border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results count */}
            {searchTerm || statusFilter !== "all" ? (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCampaigns.length} of {campaigns.length}{" "}
                campaigns
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== "all" && ` with status "${statusFilter}"`}
              </div>
            ) : null}
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          {editData ? (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
              <CampaignForm
                initialValues={memoizedInitialValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-12">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FaBullhorn className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first email campaign
                </p>
                <button
                  onClick={() => setEditData({})}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Create Your First Campaign
                </button>
              </div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-12">
              <div className="text-center">
                <FiSearch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <CampaignList
              data={filteredCampaigns}
              isLoading={loading}
              onEdit={handleEdit}
              onView={handleView}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CampaignPage;
