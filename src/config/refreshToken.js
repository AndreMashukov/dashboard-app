import axios from 'axios'
import localData from './localData'
import {REFRESH_TOKEN} from "@/common/apiUrls"
// import {isProd} from "../common/constants";
import {logoutHandler} from "@/utils";

const RefreshToken = async () => {
  const {refreshToken, setAccess} = localData;
  try {
    const refresh = refreshToken();
    const data = {refreshToken: refresh};
    const res = await axios.post(REFRESH_TOKEN, data);
    const token = res?.data
    setAccess(token.accessToken)
    return token
  } catch (e) {
    return logoutHandler();
  }
}

export default RefreshToken
