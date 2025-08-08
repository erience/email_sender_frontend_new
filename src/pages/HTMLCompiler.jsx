import React, { useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { autocompletion } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import AppLayout from "../components/DashboardLayout";
import { FaFileUpload } from "react-icons/fa";
import {
  FiUpload,
  FiCode,
  FiEye,
  FiCopy,
  FiPlay,
  FiFileText,
  FiDownload,
  FiRefreshCw,
  FiZap,
  FiMonitor,
  FiInfo,
  FiCheckCircle,
  FiAlignLeft,
  FiMaximize2,
  FiMinimize2,
  FiSettings,
  FiType,
  FiX,
} from "react-icons/fi";
import { docsToHtml } from "../services/docxToHtmlServices";

// HTML Formatter function using prettier-like logic
const formatHtml = (html) => {
  try {
    // Simple HTML formatter
    let formatted = html
      .replace(/>\s*</g, "><") // Remove spaces between tags
      .replace(/</g, "\n<") // Add newlines before tags
      .replace(/^\n/, "") // Remove leading newline
      .split("\n");

    let indent = 0;
    let result = [];
    const indentChar = "  "; // 2 spaces

    for (let line of formatted) {
      line = line.trim();
      if (!line) continue;

      // Decrease indent for closing tags
      if (line.match(/^<\/\w/)) {
        indent = Math.max(0, indent - 1);
      }

      // Add indentation
      result.push(indentChar.repeat(indent) + line);

      // Increase indent for opening tags (but not self-closing or text content)
      if (line.match(/^<\w[^>]*[^\/]>$/)) {
        indent += 1;
      }
    }

    return result.join("\n");
  } catch (error) {
    console.error("Format error:", error);
    return html; // Return original if formatting fails
  }
};

const HTMLCompiler = () => {
  const [htmlCode, setHtmlCode] = useState("");
  const [compiledHtml, setCompiledHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    lineNumbers: true,
    theme: "dark",
  });
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast.error("Please select a valid .docx file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("docxFile", file);

    try {
      setLoading(true);
      const response = await docsToHtml(formData, {
        "Content-Type": "multipart/form-data",
      });
      const data = response?.data?.data;
      const formattedData = formatHtml(data);
      setHtmlCode(formattedData);
      setCompiledHtml(formattedData);
      setUploadedFileName(file.name);
      toast.success("Document converted and formatted successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const formatCode = () => {
    if (!htmlCode) {
      toast.error("No HTML code to format");
      return;
    }

    try {
      const formatted = formatHtml(htmlCode);
      setHtmlCode(formatted);
      toast.success("HTML code formatted successfully!");
    } catch (error) {
      toast.error("Failed to format HTML code");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      toast.success("HTML copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const compileHtml = () => {
    setCompiledHtml(htmlCode);
    toast.success("HTML compiled successfully!");
  };

  const downloadHtml = () => {
    if (!htmlCode) {
      toast.error("No HTML content to download");
      return;
    }

    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = uploadedFileName
      ? `${uploadedFileName.replace(".docx", "")}.html`
      : "compiled.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded!");
  };

  const clearEditor = () => {
    setHtmlCode("");
    setCompiledHtml("");
    setUploadedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Editor cleared!");
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "Enter") {
      compileHtml();
    } else if (event.ctrlKey && event.altKey && event.key === "F") {
      formatCode();
    } else if (event.key === "Escape" && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = { target: { files } };
      handleFileUpload(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const wordCount = htmlCode
    ?.split(/\s+/)
    ?.filter((word) => word?.length > 0)?.length;
  const charCount = htmlCode?.length;
  const lineCount = htmlCode?.split("\n").length;

  const editorExtensions = [
    html(),
    autocompletion(),
    keymap.of([indentWithTab]),
  ];

  const editorTheme = editorSettings.theme === "dark" ? oneDark : undefined;

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Fullscreen Exit Button - Fixed Position */}
        {/* {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-6 right-6 z-[60] flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5 font-semibold border border-red-400"
            aria-label="Exit Fullscreen"
            title="Exit Fullscreen (ESC)"
          >
            <FiX className="w-5 h-5 mr-2" />
            Exit Fullscreen
          </button>
        )} */}

        {/* Header Section */}
        {!isFullscreen && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl shadow-lg">
                  <FiCode className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    HTML Compiler & Formatter
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Convert DOCX files to HTML, format code, and preview in
                    real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Characters
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {charCount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <FiFileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Words
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {wordCount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <FiType className="w-6 h-6 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      Lines
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {lineCount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <FiCode className="w-6 h-6 text-purple-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      File Size
                    </p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {((charCount || 0) / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  <FiMonitor className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {!isFullscreen && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <FiUpload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Document Upload & Conversion
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Upload a .docx file to convert it to formatted HTML
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  uploadedFileName
                    ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/20"
                }`}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />

                {uploadedFileName ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                        <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {uploadedFileName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Successfully converted and formatted
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="flex items-center px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm font-medium"
                      >
                        <FiRefreshCw className="w-4 h-4 mr-2" />
                        Upload New File
                      </button>
                      <button
                        onClick={clearEditor}
                        className="flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                      >
                        <FiRefreshCw className="w-4 h-4 mr-2" />
                        Clear All
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded-2xl shadow-lg">
                        <FaFileUpload className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Drop your DOCX file here
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        or click to browse and select a file
                      </p>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Converting...
                          </>
                        ) : (
                          <>
                            <FiUpload className="w-5 h-5 mr-2" />
                            Select DOCX File
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Supported format: .docx files only • Maximum size: 10MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor and Preview Section */}
        <div
          className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
            isFullscreen ? "fixed inset-4 z-50" : ""
          }`}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Tab Header */}
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "editor"
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg border border-indigo-200 dark:border-indigo-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <FiCode className="w-4 h-4" />
                  <span>HTML Editor</span>
                </button>

                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg border border-indigo-200 dark:border-indigo-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <FiEye className="w-4 h-4" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => setActiveTab("split")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "split"
                      ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg border border-indigo-200 dark:border-indigo-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <FiMonitor className="w-4 h-4" />
                  <span>Split View</span>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Ctrl+Shift+Enter: Compile</div>
                  <div>Ctrl+Alt+F: Format Code</div>
                  {isFullscreen && <div>ESC: Exit Fullscreen</div>}
                </div>

                <button
                  onClick={formatCode}
                  disabled={!htmlCode}
                  className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm font-medium"
                >
                  <FiAlignLeft className="w-4 h-4 mr-2" />
                  Format
                </button>

                {/* Fullscreen Toggle in Header */}
                {isFullscreen ? (
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium"
                  >
                    <FiMinimize2 className="w-4 h-4 mr-2" />
                    Exit
                  </button>
                ) : (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    <FiMaximize2 className="w-4 h-4 mr-2" />
                    Full
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div
            className="p-6"
            style={{ height: isFullscreen ? "calc(100vh - 200px)" : "auto" }}
          >
            {activeTab === "editor" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    HTML Code Editor
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={compileHtml}
                      className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium"
                    >
                      <FiZap className="w-4 h-4 mr-2" />
                      Compile
                    </button>
                  </div>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-lg">
                  <CodeMirror
                    value={htmlCode}
                    height={isFullscreen ? "calc(100vh - 300px)" : "500px"}
                    theme={editorTheme}
                    extensions={editorExtensions}
                    onChange={(value) => setHtmlCode(value)}
                    onKeyDown={handleKeyDown}
                    className="text-sm"
                    basicSetup={{
                      lineNumbers: editorSettings.lineNumbers,
                      foldGutter: true,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      autocompletion: true,
                      highlightSelectionMatches: true,
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Real-time HTML rendering
                  </div>
                </div>
                <div
                  className={`border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 overflow-auto shadow-lg ${
                    isFullscreen ? "h-[calc(100vh-300px)]" : "min-h-[500px]"
                  }`}
                >
                  {compiledHtml ? (
                    <div
                      className="p-6"
                      dangerouslySetInnerHTML={{ __html: compiledHtml }}
                    />
                  ) : (
                    <div className="flex items-center justify-center min-h-[500px] text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <FiEye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">
                          Compile HTML to see preview
                        </p>
                        <p className="text-sm mt-2 opacity-75">
                          Your formatted HTML will render here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "split" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      HTML Editor
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={formatCode}
                        disabled={!htmlCode}
                        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <FiAlignLeft className="w-4 h-4 mr-1" />
                        Format
                      </button>
                      <button
                        onClick={compileHtml}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <FiZap className="w-4 h-4 mr-1" />
                        Compile
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-lg">
                    <CodeMirror
                      value={htmlCode}
                      height={isFullscreen ? "calc(100vh - 300px)" : "450px"}
                      theme={editorTheme}
                      extensions={editorExtensions}
                      onChange={(value) => setHtmlCode(value)}
                      onKeyDown={handleKeyDown}
                      className="text-sm"
                      basicSetup={{
                        lineNumbers: editorSettings.lineNumbers,
                        foldGutter: true,
                        dropCursor: false,
                        allowMultipleSelections: false,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        highlightSelectionMatches: true,
                      }}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h4>
                  <div
                    className={`border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 overflow-auto shadow-lg ${
                      isFullscreen ? "h-[calc(100vh-300px)]" : "min-h-[450px]"
                    }`}
                  >
                    {compiledHtml ? (
                      <div
                        className="p-4"
                        dangerouslySetInnerHTML={{ __html: compiledHtml }}
                      />
                    ) : (
                      <div className="flex items-center justify-center min-h-[450px] text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <FiEye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Compile to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Hidden in Fullscreen */}
        {!isFullscreen && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={formatCode}
              disabled={!htmlCode}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              <FiAlignLeft className="w-4 h-4 mr-2" />
              Format HTML
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!htmlCode}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              <FiCopy className="w-4 h-4 mr-2" />
              Copy HTML
            </button>

            <button
              onClick={compileHtml}
              disabled={!htmlCode}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              <FiPlay className="w-4 h-4 mr-2" />
              Compile HTML
            </button>

            <button
              onClick={downloadHtml}
              disabled={!htmlCode}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Download HTML
            </button>

            <button
              onClick={clearEditor}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:from-gray-600 hover:to-slate-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        )}

        {/* Enhanced Guidelines - Hidden in Fullscreen */}
        {!isFullscreen && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <FiInfo className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  HTML Compiler & Formatter Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      Keyboard Shortcuts
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <strong>Ctrl+Shift+Enter:</strong> Quick compile HTML
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <strong>Ctrl+Alt+F:</strong> Auto-format HTML code
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <strong>ESC:</strong> Exit fullscreen mode
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <strong>Tab:</strong> Smart indentation
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      Features
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Upload .docx files for automatic conversion
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Auto-format HTML for better readability
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Real-time preview with split view option
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        Fullscreen mode for focused editing
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <Loader />}
    </AppLayout>
  );
};

export default HTMLCompiler;
