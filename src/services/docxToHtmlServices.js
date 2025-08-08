import { apiConnector } from "../utils/apiConnector";
const BASE_URL = "/converter";

export const docsToHtml = (data, headers) =>
  apiConnector("POST", `${BASE_URL}/docsToHtml`, data, headers);
