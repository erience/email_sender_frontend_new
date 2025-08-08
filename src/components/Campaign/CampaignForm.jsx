import React from "react";
import DynamicForm from "../ui/DynamicForm";
import { FaBullhorn } from "react-icons/fa";
import { FiEdit, FiFileText, FiPlus } from "react-icons/fi";

const CampaignForm = ({ initialValues, onSubmit, onCancel }) => {
  const isEditing = initialValues?.id;

  const formConfig = [
    {
      name: "name",
      label: "Campaign Name",
      type: "text",
      required: true,
      grid: 12,
      placeholder: "Enter a memorable campaign name",
      helpText:
        "Choose a descriptive name that helps you identify this campaign easily.",
    },
    {
      name: "description",
      label: "Campaign Description",
      type: "textarea",
      required: false,
      grid: 12,
      rows: 4,
      placeholder: "Describe the purpose and goals of this campaign...",
      helpText:
        "Provide details about the campaign objectives, target audience, and key messaging.",
    },
  ];

  // Enhanced validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    description: {
      maxLength: 500,
    },
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/60 dark:border-blue-700/60">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            {isEditing ? (
              <FiEdit className="w-6 h-6 text-white" />
            ) : (
              <FiPlus className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "Edit Campaign" : "Create New Campaign"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditing
                ? "Update your campaign details below"
                : "Fill in the details to create your new email marketing campaign"}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Guidelines */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <FiFileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Campaign Best Practices
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Use clear, descriptive names that reflect your campaign goals
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Include target audience and campaign type in the description
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Keep descriptions concise but informative for team collaboration
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Component */}
      <DynamicForm
        title={null} // We're handling the title above
        formConfig={formConfig}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText={isEditing ? "Update Campaign" : "Create Campaign"}
        backText="Cancel"
        validationRules={validationRules}
      />

      {/* Next Steps Info */}
      {!isEditing && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200/60 dark:border-green-700/60">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <FaBullhorn className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What happens next?
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                    1
                  </span>
                  <span>Set up email templates and content</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                    2
                  </span>
                  <span>Upload and manage your contact lists</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                    3
                  </span>
                  <span>Configure SMTP settings and delivery options</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                    4
                  </span>
                  <span>Launch your campaign and monitor performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignForm;
