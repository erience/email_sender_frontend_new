import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/DashboardLayout";
import UploadFormSection from "../components/Contacts/UploadFormSection";
import UploadsTable from "../components/Contacts/UploadsTable";
import EmailListSection from "../components/Contacts/EmailListSection";
import EditEmailModal from "../components/Contacts/EditEmailModal";

import { getCampaignById } from "../services/campaignServices";
import {
  getUploadsByCampaign,
  downloadUploadCsv,
  uploadEmails,
  updateUploadWithCsv,
} from "../services/uploadsService";

import {
  getEmailsByUpload,
  updateEmail,
  deleteEmail,
  getEmailSummary,
} from "../services/emailService";

import toast from "react-hot-toast";
import {
  FaPlus,
  FaUsers,
  FaArrowLeft,
  FaDatabase,
  FaFileUpload,
  FaChartBar,
} from "react-icons/fa";
import {
  FiRefreshCw,
  FiUpload,
  FiUsers,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi";
import { saveAs } from "file-saver";

const ManageContactsPage = () => {
  const { id: campaignId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("upload");
  const [formValues, setFormValues] = useState({ fileName: "", remarks: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUploadId, setSelectedUploadId] = useState(null);

  const [selectedUpload, setSelectedUpload] = useState(null);
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailPage, setEmailPage] = useState(1);
  const [emailTotal, setEmailTotal] = useState(0);
  const [emailSummary, setEmailSummary] = useState(null);

  const [editingEmail, setEditingEmail] = useState(null);

  // Fetch campaign and uploads
  useEffect(() => {
    fetchCampaign();
    fetchUploads();
    if (location.state?.selectedUploadId) {
      fetchEmails(location.state.selectedUploadId);
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const res = await getCampaignById(campaignId);
      setCampaign(res?.data?.data || null);
    } catch {
      toast.error("Failed to load campaign.");
    }
  };

  const fetchSummary = async (uploadId) => {
    try {
      const res = await getEmailSummary(uploadId);
      setEmailSummary(res.data.data);
    } catch (error) {
      toast.error("Failed to load email summary");
      console.log("Failed to load email summary", error);
    }
  };

  const handleCloseModal = useCallback(() => {
    setEditingEmail(null);
  }, []);

  const handleSaveEmail = useCallback(
    async (updated) => {
      try {
        await updateEmail(updated.id, {
          email: updated.email,
          otherFields: updated.otherFields,
        });
        toast.success("Email updated successfully!");
        setEditingEmail(null);
        fetchEmails(selectedUpload);
      } catch (err) {
        toast.error("Update failed.");
        console.error(err);
      }
    },
    [selectedUpload]
  );

  const fetchUploads = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await getUploadsByCampaign(campaignId);
      setUploads(res?.data?.data || []);
    } catch {
      toast.error("Failed to load uploads.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownload = async (uploadId) => {
    try {
      const response = await downloadUploadCsv(uploadId);
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, `upload_${uploadId}.csv`);
      toast.success("CSV downloaded successfully!");
    } catch {
      toast.error("Failed to download CSV.");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(null);
    setError("");
    if (selected && selected.type === "text/csv") {
      setFile(selected);
      setFormValues((prev) => ({ ...prev, fileName: selected.name }));
    } else {
      setError("Please select a valid CSV file.");
    }
  };

  const handleSubmit = async (formData) => {
    if (!file) {
      setError("Please upload a CSV file.");
      return;
    }

    const form = new FormData();
    form.append("csvFile", file);

    if (mode === "upload") {
      form.append("campaignId", campaignId);
      form.append("fileName", formData.fileName);
      if (formData.remarks) form.append("remarks", formData.remarks);
    } else {
      form.append("uploadId", selectedUploadId);
    }

    try {
      setUploading(true);
      setError("");
      if (mode === "upload") {
        await uploadEmails(form);
        toast.success("Contacts uploaded successfully!");
      } else {
        await updateUploadWithCsv(form);
        toast.success("Upload updated successfully!");
      }
      fetchUploads();
      setShowForm(false);
      setFormValues({ fileName: "", remarks: "" });
      setFile(null);
      setSelectedUploadId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed.");
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const fetchEmails = async (uploadId, page = 1) => {
    setEmailsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: 10,
      });
      const res = await getEmailsByUpload(uploadId, queryParams);
      if (page === 1) {
        await fetchSummary(uploadId);
      }
      setEmails(res.data.data || []);
      setEmailTotal(res.data.total || 0);
      setEmailPage(res.data.page || 1);
      setSelectedUpload(uploadId);
    } catch(error) {
      console.log(error)
      toast.error("Failed to load emails.");
    } finally {
      setEmailsLoading(false);
    }
  };

  const handleDeleteEmail = async (id) => {
    try {
      await deleteEmail(id);
      toast.success("Email deleted successfully!");
      fetchEmails(selectedUpload, emailPage);
    } catch {
      toast.error("Failed to delete email.");
    }
  };

  const handleEditUpload = (upload) => {
    setMode("update");
    setSelectedUploadId(upload.id);
    setFormValues({
      fileName: upload.fileName,
      remarks: upload.remarks || "",
    });
    setShowForm(true);
  };

  // Calculate summary statistics
  const totalContacts = uploads.reduce(
    (sum, upload) => sum + (upload.totalRows || 0),
    0
  );
  const totalUploads = uploads.length;
  const validEmails = emailSummary ? emailSummary.valid : 0;
  const invalidEmails = emailSummary ? emailSummary.invalid : 0;

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
            Manage Contacts
          </span>
        </nav>

        {/* Header Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                <FaUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Contact Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage contacts for "{campaign?.name || "Campaign"}"
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchUploads(true)}
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
                onClick={() => {
                  setShowForm(true);
                  setMode("upload");
                  setFormValues({ fileName: "", remarks: "" });
                  setFile(null);
                  setSelectedUploadId(null);
                }}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Upload Contacts
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Uploads
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {totalUploads}
                  </p>
                </div>
                <FaDatabase className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/60 dark:border-green-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Total Contacts
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {totalContacts.toLocaleString()}
                  </p>
                </div>
                <FiUsers className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Valid Emails
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {validEmails.toLocaleString()}
                  </p>
                </div>
                <FiCheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-red-200/60 dark:border-red-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Invalid Emails
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {invalidEmails.toLocaleString()}
                  </p>
                </div>
                <FiXCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form Section */}
        {showForm && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <FiUpload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {mode === "upload"
                      ? "Upload New Contacts"
                      : "Update Contact List"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {mode === "upload"
                      ? "Add new contacts to your campaign"
                      : "Update existing contact list with new data"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <UploadFormSection
                mode={mode}
                error={error}
                file={file}
                formValues={formValues}
                setFile={setFile}
                setFormValues={setFormValues}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                uploading={uploading}
                setShowForm={setShowForm}
              />
            </div>
          </div>
        )}

        {/* Uploads Table */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl">
                <FaDatabase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Contact Lists
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage your uploaded contact lists and email data
                </p>
              </div>
            </div>
          </div>

          <UploadsTable
            uploads={uploads}
            loading={loading}
            handleDownload={handleDownload}
            handleEdit={handleEditUpload}
            handleView={fetchEmails}
          />
        </div>

        {/* Email List Section */}
        {selectedUpload && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Email Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    View and manage individual email contacts
                  </p>
                </div>
              </div>
            </div>

            <EmailListSection
              selectedUpload={selectedUpload}
              emailSummary={emailSummary}
              emails={emails}
              emailsLoading={emailsLoading}
              emailPage={emailPage}
              emailTotal={emailTotal}
              handleEditEmail={setEditingEmail}
              handleDeleteEmail={handleDeleteEmail}
              onPageChange={(page) => fetchEmails(selectedUpload, page)}
            />
          </div>
        )}

        {/* Edit Email Modal */}
        {editingEmail && (
          <EditEmailModal
            emailData={editingEmail}
            onClose={handleCloseModal}
            onSave={handleSaveEmail}
          />
        )}

        {/* Help Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Contact Management Tips
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Upload CSV files with proper email format for best results
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Review and clean invalid emails before running campaigns
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Use descriptive file names and remarks for better organization
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Download processed lists to backup your contact data
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ManageContactsPage;
