import { apiConnector } from "../utils/apiConnector";
const BASE_URL = "/sub-campaigns";

export const createSubCampaign = (data) =>
  apiConnector("POST", `${BASE_URL}`, data);

export const updateSubCampaign = (data) =>
  apiConnector("PUT", `${BASE_URL}`, data);

export const getSubCampaignsByCampaign = (campaignId) =>
  apiConnector("GET", `${BASE_URL}/campaign/${campaignId}`);

export const getSubCampaignStats = (id) =>
  apiConnector("GET", `${BASE_URL}/${id}/stats`);

export const getSubCampaignById = (id) =>
  apiConnector("GET", `${BASE_URL}/${id}`);

export const updateSubCampaignStatus = (id, status) =>
  apiConnector("PATCH", `${BASE_URL}/${id}/status`, { status });

export const deleteSubCampaign = (id) =>
  apiConnector("DELETE", `${BASE_URL}/${id}`);

// Pause SubCampaign
export const pauseSubCampaign = (id) =>
  apiConnector("PATCH", `${BASE_URL}/${id}/pause`);

// Resume SubCampaign
export const resumeSubCampaign = (id) =>
  apiConnector("PATCH", `${BASE_URL}/${id}/resume`);

// Cancel SubCampaign
export const cancelSubCampaign = (id) =>
  apiConnector("PATCH", `${BASE_URL}/${id}/cancel`);
