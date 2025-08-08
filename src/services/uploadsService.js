import { apiConnector } from "../utils/apiConnector";

const BASE_URL = "/uploads";

export const uploadEmails = (formData) =>
  apiConnector("POST", `${BASE_URL}`, formData, {
    "Content-Type": "multipart/form-data",
  });

export const getUploadsByCampaign = (campaignId) =>
  apiConnector("GET", `${BASE_URL}/campaign/${campaignId}`);

export const downloadUploadCsv = (uploadId) =>
  apiConnector("GET", `${BASE_URL}/download/${uploadId}`, null, {
    responseType: "blob",
  });

export const updateUploadWithCsv = (formData) =>
  apiConnector("POST", "/uploads/update", formData);

// export const getEmailsByUpload = (uploadId, page = 1, limit = 10) =>
//   apiConnector("GET", `/emails/upload/${uploadId}?page=${page}&limit=${limit}`);
