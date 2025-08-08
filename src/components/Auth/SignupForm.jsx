import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiUserPlus,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { signUp } from "../../services/authServices";

const SignupForm = ({ setSelectedTab, setLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) {
          error = `${name === "firstName" ? "First" : "Last"} name is required`;
        } else if (value.trim().length < 2) {
          error = `${
            name === "firstName" ? "First" : "Last"
          } name must be at least 2 characters`;
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Password must contain uppercase, lowercase, and number";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;

      case "contactNumber":
        if (!value.trim()) {
          error = "Contact number is required";
        } else if (!/^\d{10,15}$/.test(value.replace(/\s/g, ""))) {
          error = "Please enter a valid contact number";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const validateForm = () => {
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors below");
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await signUp(formData);
      if (response.data.success) {
        toast.success(
          response?.data?.message || "Account created successfully!"
        );
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          contactNumber: "",
        });
        setErrors({});
        setTouched({});
        setSelectedTab("login");
      }
    } catch (error) {
      console.log("Error while signup", error);
      if (error.response?.data?.message) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] && touched[fieldName] ? errors[fieldName] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FiUserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Join us and start your journey today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur("firstName")}
                placeholder="Enter your first name"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 
                  bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700
                  hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${
                    getFieldError("firstName")
                      ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                required
              />
            </div>
            {getFieldError("firstName") && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("firstName")}</span>
              </div>
            )}
          </div>

          {/* Last Name */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur("lastName")}
                placeholder="Enter your last name"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 
                  bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700
                  hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${
                    getFieldError("lastName")
                      ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                required
              />
            </div>
            {getFieldError("lastName") && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("lastName")}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                placeholder="Enter your email address"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 
                  bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700
                  hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${
                    getFieldError("email")
                      ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                required
              />
            </div>
            {getFieldError("email") && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("email")}</span>
              </div>
            )}
          </div>

          {/* Contact Number */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Contact Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("contactNumber")}
                placeholder="Enter your contact number"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 
                  bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700
                  hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${
                    getFieldError("contactNumber")
                      ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                required
              />
            </div>
            {getFieldError("contactNumber") && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("contactNumber")}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="Create a strong password"
                className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 
                  bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700
                  hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${
                    getFieldError("password")
                      ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-4 h-4" />
                ) : (
                  <FaEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {getFieldError("password") && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("password")}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 
                  bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700
                  hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  ${
                    getFieldError("confirmPassword")
                      ? "border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-4 h-4" />
                ) : (
                  <FaEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {getFieldError("confirmPassword") && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("confirmPassword")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Password Requirements
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      formData.password.length >= 6
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>At least 6 characters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[A-Z]/.test(formData.password)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>One uppercase letter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /[a-z]/.test(formData.password)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>One lowercase letter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      /\d/.test(formData.password)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>One number</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium text-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Creating Account...
            </>
          ) : (
            <>
              <FiCheck className="w-5 h-5 mr-2" />
              Create Account
            </>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setSelectedTab("login")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
