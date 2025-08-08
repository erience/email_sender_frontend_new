// import axios from "axios";

// export const axiosInstance = axios.create({});

// export const apiConnector = (method, url, bodyData, headers, params) => {
//   return axiosInstance({
//     method: `${method}`,
//     url: `${url}`,
//     data: bodyData ? bodyData : null,
//     headers: headers ? headers : null,
//     params: params ? params : null,
//   });
// };
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  withCredentials: true,
});
// export const axiosInstance = axios.create();
export const apiConnector = async (method, url, bodyData, headers, params) => {
  try {
    const response = await axiosInstance({
      method: `${method}`,
      url: `${url}`,
      data: bodyData ? bodyData : null,
      headers: headers ? headers : null,
      params: params ? params : null,
    });
    return response;
  } catch (error) {
    if (error.response && error.response.status == 401) {
      // window.dispatchEvent(new Event("unauthorized"));
      localStorage.removeItem("authToken");
      window.location.href = "/auth";
    }
    console.error("API call failed:", error);
    throw error;
  }
};
