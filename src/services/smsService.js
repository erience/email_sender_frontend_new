import { apiConnector } from "../utils/apiConnector";

const BASE_URL = "/sms";

// SMS sending and campaign management
export const sendSMS = (formData) =>
  apiConnector("POST", `${BASE_URL}/send-sms`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getSmsData = () => apiConnector("GET", `${BASE_URL}/data`);

export const downloadFile = (uploadId, filename) =>
  apiConnector("GET", `${BASE_URL}/download/${uploadId}/${filename}`, null, {
    responseType: "blob",
  });

export const generateLogFile = (uploadId) =>
  apiConnector("GET", `${BASE_URL}/generate-log/${uploadId}`);

// Template management
export const createTemplate = (data) =>
  apiConnector("POST", `${BASE_URL}/templates/create`, data);

export const updateTemplate = (data) =>
  apiConnector("POST", `${BASE_URL}/templates/update`, data);

export const getTemplateData = (templateId) =>
  apiConnector("POST", `${BASE_URL}/templates/data`, { templateId });

export const markTemplateAsDefault = (id, templateId) =>
  apiConnector("POST", `${BASE_URL}/templates/mark-default`, {
    id,
    templateId,
  });

export const getTemplates = () => apiConnector("GET", `${BASE_URL}/templates`);

// SMS upload management (similar to email uploads)
export const getSmsUploadById = (uploadId) =>
  apiConnector("GET", `${BASE_URL}/upload/${uploadId}`);

export const getSmsUploadSummary = (uploadId) =>
  apiConnector("GET", `${BASE_URL}/upload/${uploadId}/summary`);

export const deleteSmsUpload = (uploadId) =>
  apiConnector("DELETE", `${BASE_URL}/upload/${uploadId}`);

// SMS analytics and reporting
export const getSmsAnalytics = (uploadId, params = {}) =>
  apiConnector("GET", `${BASE_URL}/analytics/${uploadId}`, null, { params });

export const getSmsDeliveryReport = (uploadId) =>
  apiConnector("GET", `${BASE_URL}/delivery-report/${uploadId}`);

// Template validation and preview
export const validateTemplate = (templateData) =>
  apiConnector("POST", `${BASE_URL}/templates/validate`, templateData);

export const previewSms = (templateId, sampleData) =>
  apiConnector("POST", `${BASE_URL}/preview`, { templateId, sampleData });
