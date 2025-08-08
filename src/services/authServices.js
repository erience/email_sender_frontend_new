import { apiConnector } from "../utils/apiConnector";
const BASE_URL = "/auth";

export const signUp = (data) =>
  apiConnector("POST", `${BASE_URL}/signup`, data);
export const login = (data) => apiConnector("POST", `${BASE_URL}/login`, data);
export const signout = () => apiConnector("GET", `${BASE_URL}/signout`);
