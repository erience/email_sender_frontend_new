import React, { useState } from "react";
import { createConfig, updateConfig } from "../../services/smtpServices";
import toast from "react-hot-toast";
import DynamicForm from "../ui/DynamicForm";
import {
  FaServer,
  FaEnvelope,
  FaLock,
  FaUser,
  FaNetworkWired,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import {
  FiServer,
  FiMail,
  FiLock,
  FiUser,
  FiWifi,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertCircle,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const SmtpConfigForm = ({ onSuccess, editData, onCancel }) => {
  const isEdit = !!editData?.id;
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const formConfig = [
    {
      name: "smtpName",
      label: "SMTP Configuration Name",
      type: "text",
      required: true,
      grid: 6,
      placeholder: "e.g., Production Mail Server",
      helpText: "A descriptive name for this SMTP configuration",
      icon: <FiServer className="w-4 h-4" />,
    },
    {
      name: "emailHost",
      label: "SMTP Host",
      type: "text",
      required: true,
      grid: 6,
      placeholder: "smtp.gmail.com",
      helpText: "The SMTP server hostname or IP address",
      icon: <FiWifi className="w-4 h-4" />,
    },
    {
      name: "emailPort",
      label: "SMTP Port",
      type: "number",
      required: true,
      grid: 6,
      placeholder: "587",
      helpText: "Common ports: 25, 465 (SSL), 587 (TLS)",
      icon: <FiServer className="w-4 h-4" />,
    },
    {
      name: "emailUser",
      label: "Username/Email",
      type: "email",
      required: true,
      grid: 6,
      placeholder: "your-email@domain.com",
      helpText: "SMTP authentication username (usually your email)",
      icon: <FiUser className="w-4 h-4" />,
    },
    {
      name: "emailPassword",
      label: "Password",
      type: showPassword ? "text" : "password",
      required: true,
      grid: 6,
      placeholder: "Enter password or app-specific password",
      helpText: "SMTP password or app-specific password for secure servers",
      icon: <FiLock className="w-4 h-4" />,
      customRender: true,
    },
    {
      name: "status",
      label: "Configuration Status",
      type: "select",
      required: true,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      grid: 6,
      helpText: "Set to active to use this configuration in campaigns",
      icon: <FiCheckCircle className="w-4 h-4" />,
    },
  ];

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateConfig(editData.id, formData);
        toast.success("SMTP configuration updated successfully!");
      } else {
        await createConfig(formData);
        toast.success("SMTP configuration created successfully!");
      }
      onSuccess();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save configuration"
      );
      console.error("SMTP config save error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validationRules = {
    smtpName: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    emailHost: {
      required: true,
      pattern: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      patternMessage: "Please enter a valid hostname",
    },
    emailPort: {
      required: true,
      min: 1,
      max: 65535,
    },
    emailUser: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: "Please enter a valid email address",
    },
    emailPassword: {
      required: true,
      minLength: 6,
    },
    status: {
      required: true,
    },
  };

  // Custom render for password field with toggle
  const renderPasswordField = (field, value, onChange, error) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {field.icon}
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value || ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 ${
            error
              ? "border-red-300 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          } text-gray-900 dark:text-gray-100`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
        >
          {showPassword ? (
            <FiEyeOff className="w-4 h-4" />
          ) : (
            <FiEye className="w-4 h-4" />
          )}
        </button>
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
          <FiInfo className="w-3 h-3" />
          <span>{field.helpText}</span>
        </p>
      )}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Form Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/60 dark:border-blue-700/60">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isEdit
                ? "Update SMTP Configuration"
                : "Create SMTP Configuration"}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {isEdit
                ? "Modify your existing SMTP server settings. Changes will affect future campaigns using this configuration."
                : "Configure a new SMTP server to send your email campaigns. Ensure all details are correct before saving."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <DynamicForm
        formConfig={formConfig}
        initialValues={editData || {}}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitText={
          isEdit ? (
            <>
              <FiSave className="w-4 h-4 mr-2" />
              Update Configuration
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4 mr-2" />
              Create Configuration
            </>
          )
        }
        backText={
          <>
            <FiX className="w-4 h-4 mr-2" />
            Cancel
          </>
        }
        validationRules={validationRules}
        customFieldRenders={{
          emailPassword: renderPasswordField,
        }}
      />

      {/* SMTP Configuration Tips */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              SMTP Configuration Tips
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Use app-specific passwords for Gmail, Outlook, and other secure
                providers
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Port 587 with TLS is recommended for most SMTP servers
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Test your configuration before using it in production campaigns
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Keep credentials secure and don't share them with unauthorized
                users
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common SMTP Settings Reference */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <FiServer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Common SMTP Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Gmail
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Host: smtp.gmail.com
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Port: 587 (TLS)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Outlook/Hotmail
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Host: smtp-mail.outlook.com
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Port: 587 (TLS)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Yahoo
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Host: smtp.mail.yahoo.com
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Port: 587 or 465
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  SendGrid
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Host: smtp.sendgrid.net
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Port: 587
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmtpConfigForm;
