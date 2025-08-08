import { apiConnector } from "../utils/apiConnector";

const BASE_URL = "/campaigns";

export const getAllCampaigns = () => apiConnector("GET", BASE_URL);

export const getCampaignById = (id) => apiConnector("GET", `${BASE_URL}/${id}`);

export const createCampaign = (data) => apiConnector("POST", BASE_URL, data);

export const updateCampaign = (id, data) =>
  apiConnector("PUT", `${BASE_URL}/${id}`, data);

export const deleteCampaign = (id) =>
  apiConnector("DELETE", `${BASE_URL}/${id}`);

export const getFieldsByCampaign = (campaignId) =>
  apiConnector("GET", `${BASE_URL}/fields/${campaignId}`);

export const updateCampaignVariables = (id, data) =>
  apiConnector("PUT", `${BASE_URL}/${id}/update-variables`, data);

export const uploadVariableAsset = (formData) =>
  apiConnector("POST", `${BASE_URL}/upload-variable`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCampaignStats = (id) =>
  apiConnector("GET", `${BASE_URL}/${id}/stats`);
export const getDashboardStats = (timeRange = "7d") =>
  apiConnector("GET", `${BASE_URL}/dashboard/${timeRange}`);
