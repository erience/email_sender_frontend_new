import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  sendSMS,
  getSmsData,
  downloadFile,
  generateLogFile,
} from "../services/smsService";
import Loader from "../components/Loader";
import AppLayout from "../components/DashboardLayout";
import {
  FiSend,
  FiUpload,
  FiDownload,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiSmartphone,
  FiMessageSquare,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiSettings,
  FiUser,
  FiPhone,
  FiCalendar,
  FiActivity,
  FiLock,
  FiBarChart2,
  FiDatabase,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { FaDatabase } from "react-icons/fa";

const SMSPage = () => {
  const templates = [
    {
      templateName: "Block Amount",
      senderId: "ACSRPL",
      templateId: "6878d885d6fc056bb35c0c92",
      smsBody:
        "Dear Investor, Your application for Swastika Castal IPO has been successfully submitted. Amount Blocked: Rs ##blockedAmount## Date: ##date## Accurate RTA",
      variables: ["blockedAmount", "date"],
    },
    {
      templateName: "Non-Allotment",
      senderId: "ACSRPL",
      templateId: "687dc7d9d6fc057e86285e92",
      smsBody:
        "Dear Investor, No shares have been allotted to you in Swastika Castal IPO. Amount Unblocked: Rs. ##unblockAmount## Date: ##date## Accurate RTA",
      variables: ["unblockAmount", "date"],
    },
    {
      templateName: "Partial Allotment",
      senderId: "ACSRPL",
      templateId: "687dc870d6fc05233c425ff2",
      smsBody:
        "Dear Investor, You have been partially allotted shares in Swastika Castal IPO Amount Debited: Rs. ##debitedAmount## Amount Unblocked: Rs. ##unblockAmount## Date: ##date## Accurate RTA",
      variables: ["debitedAmount", "unblockAmount", "date"],
    },
    {
      templateName: "Full Allotment",
      senderId: "ACSRPL",
      templateId: "687dc8abd6fc0502684ea052",
      smsBody:
        "Dear Investor, You have been allotted shares in Swastika Castal IPO Amount Debited: Rs. ##debitedAmount## Date: ##date## Accurate RTA",
      variables: ["debitedAmount", "date"],
    },
  ];

  const [loading, setLoading] = useState(false);
  const [smsData, setSmsData] = useState([]);
  const [formData, setFormData] = useState({
    csvFile: null,
    templateName: "",
    senderId: "",
    templateId: "",
    smsBody: "",
    selectedFields: [],
  });

  const [fileData, setFileData] = useState([]);
  const [variables, setVariables] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const [downloadingStates, setDownloadingStates] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const smsPerPage = 10;

  // Manual pagination handlers
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(smsData.length / smsPerPage);
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleReadMore = (index, field) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [index]: {
        ...prevState[index],
        [field]: !prevState[index]?.[field],
      },
    }));
  };

  const offset = currentPage * smsPerPage;
  const currentSms = Array.isArray(smsData)
    ? smsData.slice(offset, offset + smsPerPage)
    : [];
  const totalPages = Math.ceil(smsData.length / smsPerPage);

  const handleTemplateChange = (event) => {
    const selectedTemplateName = event.target.value;
    if (selectedTemplateName === "") {
      setFormData({
        ...formData,
        templateName: "",
        senderId: "",
        templateId: "",
        smsBody: "",
        selectedFields: [],
      });
      setVariables([]);
      setButtonDisabled(true);
    } else {
      const template = templates.find(
        (template) => template.templateName === selectedTemplateName
      );
      if (template) {
        setFormData({
          ...formData,
          templateName: template.templateName,
          senderId: template.senderId,
          templateId: template.templateId,
          smsBody: template.smsBody,
          selectedFields: [],
        });
        setVariables(template.variables);
        setButtonDisabled(false);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setFormData({
        ...formData,
        csvFile: null,
      });
      setFileData([]);
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a valid CSV file");
      return;
    }

    setFormData({
      ...formData,
      csvFile: file,
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = Papa.parse(e.target.result, { header: true });
        const keys =
          csvData.data.length > 0 ? Object.keys(csvData.data[0]) : [];
        setFileData(keys);
        toast.success("CSV file loaded successfully!");
      } catch (error) {
        toast.error("Error parsing CSV file");
        setFileData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleFieldSelection = (variable, field) => {
    const updatedFields = [...formData.selectedFields];
    const existingIndex = updatedFields.findIndex(
      (item) => item.variable === variable
    );

    if (existingIndex >= 0) {
      updatedFields[existingIndex] = { variable, fileField: field };
    } else {
      updatedFields.push({ variable, fileField: field });
    }

    setFormData({
      ...formData,
      selectedFields: updatedFields,
    });
  };

  const setDownloadingState = (index, type, isDownloading) => {
    setDownloadingStates((prev) => ({
      ...prev,
      [`${index}_${type}`]: isDownloading,
    }));
  };

  const handleDownloadCsv = async (data) => {
    try {
      setDownloadingState(data.index, "csv", true);
      const response = await downloadFile(data.sms.id, data.sms.fileName);

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.sms.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CSV file downloaded successfully!");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV file");
    } finally {
      setDownloadingState(data.index, "csv", false);
    }
  };

  const handleDownloadLogFile = async (data) => {
    try {
      setDownloadingState(data.index, "log", true);
      const response = await downloadFile(data.sms.id, data.sms.logFileName);

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.sms.logFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Log file downloaded successfully!");
    } catch (error) {
      console.error("Error downloading log file:", error);
      toast.error("Failed to download log file");
    } finally {
      setDownloadingState(data.index, "log", false);
    }
  };

  const handleRequestLogFile = async (data) => {
    try {
      setDownloadingState(data.index, "generating", true);
      const response = await generateLogFile(data.sms.id);

      if (response.data.success) {
        toast.success("Log file generation started successfully!");
        fetchSmsData(); // Refresh data
      }
    } catch (error) {
      console.error("Error requesting log file:", error);
      toast.error("Failed to request log file");
    } finally {
      setDownloadingState(data.index, "generating", false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.csvFile) {
      toast.error("Please upload a CSV file");
      return;
    }

    if (!formData.templateName) {
      toast.error("Please select a template");
      return;
    }

    const allVariablesSelected = variables.every((variable) =>
      formData.selectedFields.some((field) => field.variable === variable)
    );

    if (!allVariablesSelected) {
      toast.error("Please map all required variables");
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("csvFile", formData.csvFile);
      formDataToSend.append(
        "selectedFields",
        JSON.stringify(formData.selectedFields)
      );
      formDataToSend.append("senderId", formData.senderId);
      formDataToSend.append("smsBody", formData.smsBody);
      formDataToSend.append("templateId", formData.templateId);
      formDataToSend.append("templateName", formData.templateName);

      const response = await sendSMS(formDataToSend);

      if (response.data.success) {
        toast.success("SMS campaign sent successfully!");
        // Reset form
        setFormData({
          csvFile: null,
          templateName: "",
          senderId: "",
          templateId: "",
          smsBody: "",
          selectedFields: [],
        });
        setVariables([]);
        setFileData([]);
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";

        fetchSmsData(); // Refresh SMS data
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error(error?.response?.data?.message || "Failed to send SMS");
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsData = async () => {
    try {
      setLoading(true);
      const response = await getSmsData();
      if (response.data.success) {
        setSmsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching SMS data:", error);
      toast.error("Failed to fetch SMS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allVariablesSelected = variables.every((variable) =>
      formData.selectedFields.some((field) => field.variable === variable)
    );
    setButtonDisabled(
      !allVariablesSelected || !formData.templateName || !formData.csvFile
    );
  }, [
    formData.selectedFields,
    variables,
    formData.templateName,
    formData.csvFile,
  ]);

  useEffect(() => {
    fetchSmsData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {loading && <Loader />}

          {/* Header */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl shadow-lg">
                <FiSmartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  SMS Campaign Manager
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Send bulk SMS campaigns with predefined templates and track
                  delivery status
                </p>
              </div>
            </div>
          </div>

          {/* SMS Sender Form */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <FiSend className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    SMS Campaign Composer
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Select a template and upload CSV to send your SMS campaign
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FiMessageSquare className="w-4 h-4 inline mr-2" />
                    Select SMS Template *
                  </label>
                  <select
                    name="template"
                    required
                    onChange={handleTemplateChange}
                    value={formData.templateName}
                    className="w-full px-4 py-3 border border-gray-300 dark:!border-gray-600 rounded-xl !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Choose SMS Template</option>
                    {templates.map((template) => (
                      <option
                        key={template.templateName}
                        value={template.templateName}
                      >
                        {template.templateName}
                      </option>
                    ))}
                  </select>
                  {formData.templateName && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                        <FiCheck className="w-4 h-4 mr-2" />
                        Template selected:{" "}
                        <span className="font-semibold ml-1">
                          {formData.templateName}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Display Template Details */}
                {formData.templateName && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sender ID - Display Only */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <FiUser className="w-4 h-4 inline mr-2" />
                        Sender ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.senderId}
                          disabled
                          className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm cursor-not-allowed"
                          placeholder="Sender ID will appear here"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FiLock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Template ID - Display Only */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <FiSettings className="w-4 h-4 inline mr-2" />
                        Template ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.templateId}
                          disabled
                          className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm cursor-not-allowed"
                          placeholder="Template ID will appear here"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FiLock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SMS Body - Display Only */}
                {formData.templateName && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FiMessageSquare className="w-4 h-4 inline mr-2" />
                      SMS Message Body
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.smsBody}
                        disabled
                        rows={4}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm cursor-not-allowed resize-none"
                        placeholder="SMS message content will appear here"
                      />
                      <div className="absolute top-3 right-3 pointer-events-none">
                        <FiLock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Variables in the format ##variableName## will be replaced
                      with CSV data
                    </p>
                  </div>
                )}

                {/* CSV File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FiUpload className="w-4 h-4 inline mr-2" />
                    Upload CSV File *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      required
                      className="w-full px-4 py-3 border !border-gray-300 dark:!border-gray-600 rounded-xl !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {formData.csvFile && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <FiCheck className="w-3 h-3 mr-1" />
                        {formData.csvFile.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Mapping */}
                {variables.length > 0 && fileData.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                        <FiSettings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Field Mapping Configuration
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Map your CSV columns to template variables. All variables
                      must be mapped to proceed.
                    </p>

                    <div className="space-y-6">
                      {variables.map((variable, index) => (
                        <div
                          key={variable}
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                            Select CSV column for:{" "}
                            <span className="text-blue-600 dark:text-blue-400 ml-1 font-mono">
                              ##{variable}##
                            </span>
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {fileData.map((field, i) => {
                              const isSelected = formData.selectedFields.some(
                                (selectedField) =>
                                  selectedField.variable === variable &&
                                  selectedField.fileField === field
                              );
                              return (
                                <div key={i} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={variable}
                                    value={field}
                                    id={`variable${field}${index}`}
                                    onChange={() =>
                                      handleFieldSelection(variable, field)
                                    }
                                    checked={isSelected}
                                    required
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                                  />
                                  <label
                                    htmlFor={`variable${field}${index}`}
                                    className={`ml-2 text-sm cursor-pointer transition-colors ${
                                      isSelected
                                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                                    }`}
                                  >
                                    {field}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mapping Status */}
                    <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mapping Progress:
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formData.selectedFields.length} / {variables.length}{" "}
                          variables mapped
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (formData.selectedFields.length /
                                variables.length) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={buttonDisabled || loading}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending SMS Campaign...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5 mr-2" />
                        Send SMS Campaign
                      </>
                    )}
                  </button>
                </div>

                {/* Status Messages */}
                {!formData.templateName && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center">
                      <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Please select a template to continue
                      </p>
                    </div>
                  </div>
                )}

                {formData.templateName && !formData.csvFile && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center">
                      <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Please upload a CSV file to map variables
                      </p>
                    </div>
                  </div>
                )}

                {formData.templateName &&
                  formData.csvFile &&
                  variables.length > 0 &&
                  formData.selectedFields.length < variables.length && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center">
                        <FiAlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          Please map all required variables (
                          {formData.selectedFields.length}/{variables.length}{" "}
                          completed)
                        </p>
                      </div>
                    </div>
                  )}
              </form>
            </div>
          </div>

          {/* SMS History Table */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/50 rounded-xl shadow-lg">
                    <FiActivity className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      SMS Campaign History
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track and manage your sent SMS campaigns ({smsData.length}{" "}
                      total)
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchSmsData}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {smsData.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FiMessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No SMS Campaigns Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Start by creating your first SMS campaign using the form
                  above. Select a template, upload your CSV file, and send your
                  campaign.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiCalendar className="w-4 h-4 inline mr-2" />
                          Sr No
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiFileText className="w-4 h-4 inline mr-2" />
                          File Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiUser className="w-4 h-4 inline mr-2" />
                          Sender ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiMessageSquare className="w-4 h-4 inline mr-2" />
                          SMS Body
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiSettings className="w-4 h-4 inline mr-2" />
                          Template
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiBarChart2 className="w-4 h-4 inline mr-2" />
                          Statistics
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiDownload className="w-4 h-4 inline mr-2" />
                          Download CSV
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <FiFileText className="w-4 h-4 inline mr-2" />
                          Log File
                        </th>
                      </tr>
                    </thead>
                    <tbody className="!bg-white dark:!bg-gray-800 divide-y !divide-gray-200 dark:divide-gray-700">
                      {currentSms.map((sms, index) => {
                        const actualIndex = offset + index;
                        const template = templates.find(
                          (t) => t.templateId === sms.templateId
                        );
                        const templateName = template.templateName;

                        const createdAt = new Date(sms.createdAt);
                        const diffInMilliseconds =
                          currentTime.getTime() - createdAt.getTime();
                        const timeDifferenceInSeconds =
                          diffInMilliseconds / 1000;

                        return (
                          <tr
                            key={sms.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                    {actualIndex + 1}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <div className="flex items-center">
                                <FiFileText className="w-4 h-4 text-gray-400 mr-2" />
                                {sms.fileName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <div className="flex items-center">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg mr-2">
                                  <FiPhone className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </div>
                                {sms.senderId}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md">
                              <div className="relative">
                                {expandedRows[actualIndex]?.smsBody
                                  ? sms.smsBody
                                  : `${sms.smsBody.substring(0, 120)}`}
                                {sms.smsBody.length > 120 && (
                                  <button
                                    onClick={() =>
                                      toggleReadMore(actualIndex, "smsBody")
                                    }
                                    className="inline-flex items-center ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs transition-colors"
                                  >
                                    {expandedRows[actualIndex]?.smsBody ? (
                                      <>
                                        <FiEyeOff className="w-3 h-3 mr-1" />
                                        Show Less
                                      </>
                                    ) : (
                                      <>
                                        <FiEye className="w-3 h-3 mr-1" />
                                        Show More
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                                <FiSettings className="w-3 h-3 mr-1" />
                                {templateName}
                              </span>
                            </td>
                            <td>
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <FiDatabase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                                      {sms.totalSms?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                      Total
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-yellow-900/20 p-2 rounded-lg text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <FiClock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                                      {sms.pendingSms?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                      Pending
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <FiCheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="font-semibold text-green-700 dark:text-green-300">
                                      {sms.sendedSms?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                      Sended
                                    </p>
                                  </div>

                                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
                                    <div className="flex items-center justify-center space-x-1 mb-1">
                                      <FiAlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                    </div>
                                    <p className="font-semibold text-red-700 dark:text-red-300">
                                      {sms.failedSms?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                      Failed
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <button
                                onClick={() =>
                                  handleDownloadCsv({ index: actualIndex, sms })
                                }
                                disabled={
                                  downloadingStates[`${actualIndex}_csv`]
                                }
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg text-sm hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                              >
                                {downloadingStates[`${actualIndex}_csv`] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <FiDownload className="w-4 h-4 mr-2" />
                                    Download CSV
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {(() => {
                                if (timeDifferenceInSeconds > 300) {
                                  if (!sms.logFileCreated) {
                                    return (
                                      <button
                                        onClick={() =>
                                          handleRequestLogFile({
                                            index: actualIndex,
                                            sms,
                                          })
                                        }
                                        disabled={
                                          downloadingStates[
                                            `${actualIndex}_generating`
                                          ]
                                        }
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                                      >
                                        {downloadingStates[
                                          `${actualIndex}_generating`
                                        ] ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Requesting...
                                          </>
                                        ) : (
                                          <>
                                            <FiRefreshCw className="w-4 h-4 mr-2" />
                                            Generate Log
                                          </>
                                        )}
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button
                                        onClick={() =>
                                          handleDownloadLogFile({
                                            index: actualIndex,
                                            sms,
                                          })
                                        }
                                        disabled={
                                          downloadingStates[
                                            `${actualIndex}_log`
                                          ]
                                        }
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                                      >
                                        {downloadingStates[
                                          `${actualIndex}_log`
                                        ] ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Downloading...
                                          </>
                                        ) : (
                                          <>
                                            <FiDownload className="w-4 h-4 mr-2" />
                                            Download Log
                                          </>
                                        )}
                                      </button>
                                    );
                                  }
                                } else {
                                  const remainingSeconds =
                                    300 - timeDifferenceInSeconds;
                                  const remainingMinutes = Math.floor(
                                    remainingSeconds / 60
                                  );
                                  const remainingSecs = Math.floor(
                                    remainingSeconds % 60
                                  );
                                  return (
                                    <button
                                      disabled
                                      className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg text-sm cursor-not-allowed font-medium"
                                    >
                                      <FiClock className="w-4 h-4 mr-2" />
                                      Available in {remainingMinutes}:
                                      {remainingSecs < 10 ? "0" : ""}
                                      {remainingSecs}
                                    </button>
                                  );
                                }
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pagination */}
                {smsData.length > smsPerPage && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 transition-all duration-200"
                      >
                        <FiChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 transition-all duration-200"
                      >
                        Next
                        <FiChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          Showing{" "}
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {offset + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {Math.min(offset + smsPerPage, smsData.length)}
                          </span>{" "}
                          of{" "}
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {smsData.length}
                          </span>{" "}
                          campaigns
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                          <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 transition-all duration-200"
                          >
                            <FiChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </button>

                          {getPageNumbers().map((pageNumber) => (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageClick(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition-all duration-200 ${
                                currentPage === pageNumber
                                  ? "z-10 bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg"
                                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNumber + 1}
                            </button>
                          ))}

                          <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1}
                            className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 transition-all duration-200"
                          >
                            Next
                            <FiChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <FiInfo className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  SMS Campaign Guidelines & Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      How It Works
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Select a predefined template with fixed content
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Upload CSV file with recipient data
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Map CSV columns to template variables
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Send bulk SMS campaign to all recipients
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      Important Notes
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Templates are pre-approved and cannot be modified
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        CSV files must have proper headers matching variables
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Log files available after 5 minutes of sending
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SMSPage;
