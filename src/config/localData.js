import {get, remove, set} from './cookies';
import {ACCESS_TOKEN_KEY, REDIRECT_URL, REFRESH_TOKEN_KEY, USER_INFO_KEY} from "@/common/constants";

const refreshToken = () => get(REFRESH_TOKEN_KEY);
const accessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);
const redirectUrl = () => sessionStorage.getItem(REDIRECT_URL);
const userInfo = () => sessionStorage?.getItem(USER_INFO_KEY) || {};

const setRefresh = (value) => set(REFRESH_TOKEN_KEY, value);
const setAccess = (value) => sessionStorage.setItem(ACCESS_TOKEN_KEY, value);
const setUserInfo = (value) => sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(value));
const setRedirect = (value) => sessionStorage.setItem(REDIRECT_URL, value);

const deleteRefresh = () => remove(REFRESH_TOKEN_KEY);
const deleteAccess = () => remove(ACCESS_TOKEN_KEY);
const deleteUserInfo = () => sessionStorage?.removeItem(USER_INFO_KEY);
const deleteRedirect = () => sessionStorage.removeItem(REDIRECT_URL);

const removeLocalData = () => {
  deleteAccess();
  deleteRefresh();
  deleteUserInfo()
}

export default {
  refreshToken,
  accessToken,
  redirectUrl,
  userInfo,

  setRefresh,
  setAccess,
  setUserInfo,
  setRedirect,

  deleteAccess,
  deleteRefresh,
  deleteUserInfo,
  deleteRedirect,

  removeLocalData,
}
