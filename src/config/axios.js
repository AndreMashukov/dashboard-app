import axios from "axios"
import refreshToken from "./refreshToken"
import LocalData from './localData'
import {isStrIncludes, logoutHandler} from '../utils'
import {API_PREFIX, REFRESH_TOKEN} from "@/common/apiUrls"

axios.defaults.baseURL = API_PREFIX
const regexApiPrefix = new RegExp(`^${API_PREFIX}`, 'i');

export default () => {
  //REQUEST
  axios.interceptors.request.use(
    async function (config) {
      let accessToken = LocalData.accessToken();
      if (accessToken && regexApiPrefix.test(config.url))
        config.headers['Authorization'] = `Bearer ${accessToken}`
      return config;
    },
    error => {
      throw error;
    })

  //RESPONSE
  axios.interceptors.response.use(
    function (response) {
      return response.data;
    },
    async function (error) {
      const originalRequest = error.config

      //if refresh error then reject error
      if (isStrIncludes(originalRequest.url, REFRESH_TOKEN))
        throw error.response;

      // else other error
      const {code = ""} = error.response.data

      if (code === "E_PERMISSION_ADMIN")
        return logoutHandler();

      if (code === "E_JWT_TOKEN_EXPIRED" || code === "E_PERMISSION") {
        const data = await refreshToken();
        if (data) return axios(originalRequest);
      }
      throw error.response;
    }
  )
}
