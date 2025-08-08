import { apiConnector } from "../utils/apiConnector";
const BASE_URL = "/smtp-configs";

export const getAllConfigs = () => apiConnector("GET", BASE_URL);

export const getActiveSmtpConfigs = () =>
  apiConnector("GET", `${BASE_URL}/smtp/active`);

export const checkSmtpConfig = (id) =>
  apiConnector("GET", `${BASE_URL}/checkSMTP/${id}`);

export const createConfig = (data) => apiConnector("POST", BASE_URL, data);

export const updateConfig = (id, data) =>
  apiConnector("PUT", `${BASE_URL}/${id}`, data);

export const getConfigById = (id) => apiConnector("GET", `${BASE_URL}/${id}`);
