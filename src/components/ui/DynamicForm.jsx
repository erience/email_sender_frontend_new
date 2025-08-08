import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaAsterisk } from "react-icons/fa";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiChevronDown,
  FiInfo,
} from "react-icons/fi";

const DynamicForm = ({
  formConfig = [],
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = "Submit",
  backText = null,
  title,
  subtitle,
  isLoading = false,
  errors = {},
  validationRules = {},
  customFieldRenders = {},
  additionalButtons = [],
}) => {
  const [formData, setFormData] = useState(initialValues || {});
  const [showPassword, setShowPassword] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialValues || {});
  }, [initialValues]);

  useEffect(() => {
    setIsSubmitting(isLoading);
  }, [isLoading]);

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear touched state when user starts typing
    if (touched[fieldName]) {
      setTouched((prev) => ({
        ...prev,
        [fieldName]: false,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    handleChange(name, type === "checkbox" ? checked : value);
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched to show validation errors
    const allTouched = {};
    formConfig.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (type, name) => {
    const iconMap = {
      email: <FiMail className="w-4 h-4" />,
      password: <FiLock className="w-4 h-4" />,
      tel: <FiPhone className="w-4 h-4" />,
      phone: <FiPhone className="w-4 h-4" />,
      date: <FiCalendar className="w-4 h-4" />,
      datetime: <FiCalendar className="w-4 h-4" />,
      "datetime-local": <FiCalendar className="w-4 h-4" />,
      text: name.toLowerCase().includes("name") ? (
        <FiUser className="w-4 h-4" />
      ) : (
        <FiFileText className="w-4 h-4" />
      ),
      default: <FiFileText className="w-4 h-4" />,
    };
    return iconMap[type] || iconMap.default;
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] && touched[fieldName] ? errors[fieldName] : null;
  };

  const renderField = (field) => {
    const value = formData[field.name] || "";
    const hasError = getFieldError(field.name);
    const isRequired = field.required;

    // Check if there's a custom render function for this field
    if (customFieldRenders[field.name]) {
      return (
        <div
          key={field.name}
          className={`col-span-12 ${
            field.grid ? `sm:col-span-${field.grid}` : "sm:col-span-12"
          }`}
        >
          {customFieldRenders[field.name](field, value, handleChange, hasError)}
        </div>
      );
    }

    const baseInputClasses = `
      w-full px-4 py-3 border rounded-xl transition-all duration-200 
      !bg-white/80 dark:!bg-gray-700/80 backdrop-blur-sm
      focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 focus:!bg-white dark:focus:!bg-gray-700
      hover:!bg-white dark:hover:!bg-gray-700 hover:shadow-sm
      !border-gray-300 dark:!border-gray-600 hover:!border-gray-400 dark:!hover:border-gray-500
      !text-gray-900 dark:!text-gray-100
      !placeholder-gray-500 dark:!placeholder-gray-400
      ${
        hasError
          ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500"
          : ""
      }
      ${field.type === "password" ? "pr-12" : ""}
      ${
        ["email", "password", "tel", "phone", "text", "number"].includes(
          field.type
        )
          ? "pl-12"
          : ""
      }
    `;

    const selectClasses = `
      ${baseInputClasses}
      pr-10 appearance-none cursor-pointer
      !bg-white dark:!bg-gray-800
    `;

    return (
      <div
        key={field.name}
        className={`col-span-12 ${
          field.grid ? `sm:col-span-${field.grid}` : "sm:col-span-12"
        }`}
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center space-x-2">
            {field.icon && (
              <div className="text-gray-500 dark:text-gray-400">
                {field.icon}
              </div>
            )}
            <span>{field.label}</span>
            {isRequired && <FaAsterisk className="w-2 h-2 text-red-500" />}
          </div>
        </label>

        <div className="relative">
          {field.type === "select" ? (
            <>
              <select
                name={field.name}
                value={value}
                onChange={handleInputChange}
                onBlur={() => handleBlur(field.name)}
                required={isRequired}
                className={selectClasses}
              >
                {!field.required && <option value="">Select an option</option>}
                {field.options?.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 py-2"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronDown className="w-4 h-4 !text-gray-400 dark:!text-gray-500" />
              </div>
            </>
          ) : field.type === "password" ? (
            <>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type={showPassword[field.name] ? "text" : "password"}
                name={field.name}
                value={value}
                onChange={handleInputChange}
                onBlur={() => handleBlur(field.name)}
                required={isRequired}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                className={baseInputClasses}
              />
              <button
                type="button"
                onClick={() => togglePassword(field.name)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword[field.name] ? (
                  <FaEyeSlash className="w-4 h-4" />
                ) : (
                  <FaEye className="w-4 h-4" />
                )}
              </button>
            </>
          ) : field.type === "textarea" ? (
            <textarea
              name={field.name}
              value={value}
              onChange={handleInputChange}
              onBlur={() => handleBlur(field.name)}
              required={isRequired}
              rows={field.rows || 4}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              className={`${baseInputClasses} resize-none`}
            />
          ) : field.type === "checkbox" ? (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name={field.name}
                checked={value}
                onChange={handleInputChange}
                onBlur={() => handleBlur(field.name)}
                required={isRequired}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {field.checkboxLabel || field.label}
              </span>
            </div>
          ) : (
            <>
              {["email", "password", "tel", "phone", "text", "number"].includes(
                field.type
              ) && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="text-gray-400 dark:text-gray-500">
                    {getFieldIcon(field.type, field.name)}
                  </div>
                </div>
              )}
              <input
                type={field.type}
                name={field.name}
                value={value}
                onChange={handleInputChange}
                onBlur={() => handleBlur(field.name)}
                required={isRequired}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                min={field.min}
                max={field.max}
                step={field.step}
                className={baseInputClasses}
              />
            </>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{hasError}</span>
          </div>
        )}

        {/* Help Text */}
        {field.helpText && !hasError && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FiInfo className="w-3 h-3 flex-shrink-0" />
            <span>{field.helpText}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="!bg-white dark:!bg-gray-800 rounded-2xl shadow-xl border !border-gray-200 dark:!border-gray-700 overflow-hidden">
      {/* Header */}
      {(title || subtitle) && (
        <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl shadow-lg">
              <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {formConfig.map(renderField)}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : typeof submitText === "string" ? (
                <>
                  <FiCheck className="w-4 h-4 mr-2" />
                  {submitText}
                </>
              ) : (
                submitText
              )}
            </button>

            {/* Additional Buttons */}
            {additionalButtons.map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={button.onClick}
                disabled={button.disabled || isSubmitting}
                className={
                  button.className ||
                  "flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                }
              >
                {button.text}
              </button>
            ))}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {typeof backText === "string" ? (
                  <>
                    <FiX className="w-4 h-4 mr-2" />
                    {backText || "Cancel"}
                  </>
                ) : (
                  backText || (
                    <>
                      <FiX className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  )
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced version with validation support
export const ValidatedDynamicForm = ({
  formConfig = [],
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = "Submit",
  backText = null,
  title,
  subtitle,
  validationRules = {},
  customFieldRenders = {},
  additionalButtons = [],
}) => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value, rules) => {
    if (!rules) return null;

    if (rules.required && (!value || value.toString().trim() === "")) {
      return `${name} is required`;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `${name} cannot exceed ${rules.maxLength} characters`;
    }

    if (rules.min && value && parseFloat(value) < rules.min) {
      return `${name} must be at least ${rules.min}`;
    }

    if (rules.max && value && parseFloat(value) > rules.max) {
      return `${name} cannot exceed ${rules.max}`;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || `${name} format is invalid`;
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const validateForm = (data) => {
    const newErrors = {};

    formConfig.forEach((field) => {
      const rules = validationRules[field.name];
      const error = validateField(field.label, data[field.name], rules);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);

    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicForm
      formConfig={formConfig}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitText={submitText}
      backText={backText}
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      errors={errors}
      validationRules={validationRules}
      customFieldRenders={customFieldRenders}
      additionalButtons={additionalButtons}
    />
  );
};

export default DynamicForm;
