import { apiConnector } from "../utils/apiConnector";

const BASE_URL = "/mail-events";

export const getEventsSummary = (subCampaignId) =>
  apiConnector("GET", `${BASE_URL}/${subCampaignId}/events-summary`);

export const getUniqueEmailsByEvents = (subCampaignId, eventNames) =>
  apiConnector("POST", `${BASE_URL}/unique-email-count`, {
    subCampaignId,
    eventNames,
  });

export const getHistoricalLogs = (queryParams) =>
  apiConnector("GET", `${BASE_URL}/historical-logs?${queryParams}`);
