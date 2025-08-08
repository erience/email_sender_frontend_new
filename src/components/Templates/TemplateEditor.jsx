import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { autocompletion } from "@codemirror/autocomplete";
import toast from "react-hot-toast";
import { FaCode, FaEye, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import {
  FiCode,
  FiEye,
  FiType,
  FiTag,
  FiSave,
  FiX,
  FiEdit3,
  FiFileText,
  FiZap,
  FiInfo,
} from "react-icons/fi";

const TemplateEditor = ({ template, onCancel, onSave, fields }) => {
  const [form, setForm] = useState({
    templateName: "",
    content: "",
    subjects: "",
  });
  const [activeTab, setActiveTab] = useState("editor");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef();

  useEffect(() => {
    if (template) {
      setForm({
        templateName: template.templateName,
        content: template.content,
        subjects: template.subjects?.join(", ") || "",
      });
    } else {
      setForm({ templateName: "", content: "", subjects: "" });
    }
  }, [template]);

  const insertAtCursor = (text) => {
    const view = editorRef.current;
    if (view) {
      const transaction = view.state.replaceSelection(text);
      view.dispatch(transaction);
      view.focus();
      toast.success(`Variable ${text} inserted!`);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Template content is required");
      return;
    }

    setLoading(true);
    try {
      const subjects = form.subjects
        .split(",")
        .map((subj) => subj.trim())
        .filter(Boolean);
      await onSave({ ...form, subjects });
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreviewContent = () => {
    let previewContent = form.content;

    // Replace variables with their values for preview
    fields.forEach((field) => {
      const regex = new RegExp(`\\^\\^${field.key}\\^\\^`, "g");
      previewContent = previewContent.replace(regex, field.value);
    });

    return previewContent;
  };

  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Name */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FiFileText className="w-4 h-4" />
            <span>Template Name</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter template name"
            value={form.templateName}
            onChange={(e) => handleChange("templateName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FiTag className="w-4 h-4" />
            <span>Email Subjects</span>
          </label>
          <input
            type="text"
            placeholder="Subject lines (comma-separated)"
            value={form.subjects}
            onChange={(e) => handleChange("subjects", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separate multiple subject lines with commas
          </p>
        </div>
      </div>

      {/* Dynamic Variables Section */}
      {fields.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/60 dark:border-blue-700/60">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Dynamic Variables
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to insert variables into your template
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {fields.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => insertAtCursor(`^^${field.key}^^`)}
                className="group flex items-center space-x-2 px-3 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                title={`Insert variable: ${field.key} (Preview: ${field.value})`}
              >
                <code className="text-xs font-mono text-blue-700 dark:text-blue-300 font-semibold">
                  ^^{field.key}^^
                </code>
                {field.value !== field.key && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    (
                    {field.value.length > 20
                      ? `${field.value.substring(0, 20)}...`
                      : field.value}
                    )
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Section */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
        {/* Tab Header */}
        <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-4 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("editor");
                  setIsPreviewMode(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "editor"
                    ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-700"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <FiCode className="w-4 h-4" />
                <span>HTML Editor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("preview");
                  setIsPreviewMode(true);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-700"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <FiEye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {form.content.length} characters
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === "editor" ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-4">
                <FiEdit3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  HTML Content
                </span>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                <CodeMirror
                  value={form.content}
                  height="400px"
                  theme={monokai}
                  extensions={[html(), autocompletion()]}
                  onChange={(val) => handleChange("content", val)}
                  onCreateEditor={(view) => {
                    editorRef.current = view;
                  }}
                  className="text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-4">
                <FiEye className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Preview
                </span>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 min-h-[400px] overflow-auto">
                {form.content ? (
                  <div
                    className="p-6"
                    dangerouslySetInnerHTML={{ __html: renderPreviewContent() }}
                  />
                ) : (
                  <div className="flex items-center justify-center min-h-[400px] text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <FiEye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Start typing in the editor to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200/60 dark:border-amber-700/60">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <FiInfo className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Template Guidelines
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Use ^^variable^^ syntax to insert dynamic content
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Include proper HTML structure with &lt;html&gt;, &lt;head&gt;,
                and &lt;body&gt; tags
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Use inline CSS for better email client compatibility
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Test templates with different variable values before deploying
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-all duration-200 disabled:opacity-50"
        >
          <FiX className="w-4 h-4 mr-2" />
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            loading || !form.templateName.trim() || !form.content.trim()
          }
          className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4 mr-2" />
              Save Template
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;
