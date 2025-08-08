import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authServices";
import toast from "react-hot-toast";

const LoginForm = ({ setLoading, setSelectedTab }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const toggleShowPassword = () => setShowPassword(!showPassword);

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
      const response = await login(formData);
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Welcome back!");
        localStorage.setItem("authToken", response?.data?.token);
        localStorage.setItem(
          "userInfo",
          JSON.stringify(response?.data?.userInfo)
        );
        setFormData({ email: "", password: "" });
        setErrors({});
        setTouched({});

        navigate("/dashboard");
      }
    } catch (error) {
      console.log("Error while login", error);
      if (error.response?.data?.message) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
    }
  }, []);

  const getFieldError = (fieldName) => {
    return errors[fieldName] && touched[fieldName] ? errors[fieldName] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FiShield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
              <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("email")}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                placeholder="Enter your password"
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
                onClick={toggleShowPassword}
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
              <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError("password")}</span>
              </div>
            )}
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
              Signing in...
            </>
          ) : (
            <>
              <FiLogIn className="w-5 h-5 mr-2" />
              Sign In
            </>
          )}
        </button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setSelectedTab && setSelectedTab("signup")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
            >
              Create one here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
