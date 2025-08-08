import { apiConnector } from "../utils/apiConnector";

const BASE_URL = "/emails";

export const getEmailsByUpload = (uploadId, params = {}) =>
  apiConnector("GET", `${BASE_URL}/upload/${uploadId}?${params}`, null, {
    params,
  });

export const updateEmail = (id, data) =>
  apiConnector("PUT", `${BASE_URL}/${id}`, data);

export const deleteEmail = (id) => apiConnector("DELETE", `${BASE_URL}/${id}`);

export const getEmailSummary = (uploadId) =>
  apiConnector("GET", `${BASE_URL}/${uploadId}/email-summary`);
