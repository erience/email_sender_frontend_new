import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaUser, FaEdit } from "react-icons/fa";
import { FiMail, FiUser, FiSave, FiX, FiEdit3 } from "react-icons/fi";

const EditEmailModal = ({ emailData, onClose, onSave }) => {
  const [email, setEmail] = useState(emailData.email || "");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(emailData.otherFields || "{}");
      setFields(parsed);
    } catch {
      setFields({});
    }
  }, [emailData]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: emailData.id,
        email,
        otherFields: fields,
      });
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("name") ||
      lowerKey.includes("first") ||
      lowerKey.includes("last")
    ) {
      return <FiUser className="w-4 h-4" />;
    }
    return <FiEdit3 className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center overflow-auto p-4">
      <div
        ref={modalRef}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FiEdit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Contact
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update contact information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <FiMail className="w-4 h-4" />
                  <span>Email Address</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 ${
                    errors.email
                      ? "border-red-300 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  } text-gray-900 dark:text-gray-100`}
                />
              </div>
              {errors.email && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                  <FiX className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Dynamic Fields */}
            {Object.keys(fields).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Additional Fields
                  </span>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                </div>

                {Object.keys(fields).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        {getFieldIcon(key)}
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fields[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={`Enter ${key.toLowerCase()}`}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 ${
                          errors[key]
                            ? "border-red-300 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        } text-gray-900 dark:text-gray-100`}
                      />
                    </div>
                    {errors[key] && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                        <FiX className="w-4 h-4 flex-shrink-0" />
                        <span>{errors[key]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {Object.keys(fields).length === 0 && (
              <div className="text-center py-6">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No additional fields available for this contact
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-t border-gray-200/60 dark:border-gray-600/60">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              {loading ? (
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
      </div>
    </div>
  );
};

export default EditEmailModal;
