import { apiConnector } from "../utils/apiConnector";
const BASE_URL = "/templates";

export const createTemplate = (data) =>
  apiConnector("POST", `${BASE_URL}`, data);

export const getTemplatesByCampaign = (campaignId) =>
  apiConnector("GET", `${BASE_URL}/campaign/${campaignId}`);

export const deleteTemplate = (templateId) =>
  apiConnector("DELETE", `${BASE_URL}/${templateId}`);

export const updateTemplate = (templateId, data) =>
  apiConnector("PUT", `${BASE_URL}/${templateId}`, data);
