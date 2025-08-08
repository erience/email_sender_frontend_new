import React, { useRef } from "react";
import DynamicForm from "../ui/DynamicForm";
import {
  FaFileUpload,
  FaFileCsv,
  FaCloudUploadAlt,
  FaTimes,
} from "react-icons/fa";
import {
  FiUpload,
  FiFile,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiEdit,
  FiRefreshCw,
} from "react-icons/fi";

const UploadFormSection = ({
  mode,
  error,
  file,
  uploading,
  formValues,
  setFile,
  setFormValues,
  handleFileChange,
  handleSubmit,
  setShowForm,
}) => {
  const fileInputRef = useRef(null);

  const formConfig = [
    {
      name: "fileName",
      label: "File Name",
      type: "text",
      required: true,
      grid: 6,
      placeholder: "Enter descriptive file name",
      helpText: "Choose a name that helps identify this contact list",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      grid: 12,
      rows: 3,
      placeholder: "Add notes about this contact list (optional)",
      helpText:
        "Describe the source, purpose, or any special notes about this contact list",
    },
  ];

  const validationRules = {
    fileName: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    remarks: {
      maxLength: 500,
    },
  };

  const handleCancel = () => {
    setShowForm(false);
    setFile(null);
    setFormValues({ fileName: "", remarks: "" });
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setFormValues((prev) => ({ ...prev, fileName: droppedFile.name }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setFile(null);
    setFormValues((prev) => ({ ...prev, fileName: "" }));
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/60 dark:border-blue-700/60">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FaFileCsv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              CSV File Upload
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select or drag and drop your CSV file containing contact
              information
            </p>
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            file
              ? "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20"
              : "border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
          }`}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB • CSV File
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleFileInputClick}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Change File
                </button>
                <button
                  onClick={removeFile}
                  className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                  <FaCloudUploadAlt className="w-12 h-12 text-gray-400" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Drop your CSV file here
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse and select a file
                </p>

                <button
                  onClick={handleFileInputClick}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiUpload className="w-5 h-5 mr-2" />
                  Select CSV File
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Supported format: CSV files only • Maximum size: 10MB
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Upload Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSV Format Guide */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <FiFile className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              CSV Format Guidelines
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {/* <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                First column should contain email addresses
              </li> */}
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Include header row with column names (email, name, etc.)
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Additional columns will be stored as contact metadata
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Ensure all email addresses are properly formatted
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <DynamicForm
        title={null} // We're handling the title in the parent component
        formConfig={formConfig}
        initialValues={formValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText={
          uploading
            ? "Uploading..."
            : mode === "upload"
            ? "Upload Contacts"
            : "Update Upload"
        }
        backText="Cancel"
        validationRules={validationRules}
        isLoading={uploading}
      />
    </div>
  );
};

export default UploadFormSection;
