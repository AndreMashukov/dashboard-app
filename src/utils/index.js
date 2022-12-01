import _ from "lodash";
import router from "../router";
import {localData} from "../config";

export const isStrIncludes = (str, includes) => {
    if (!_.isString(str) || _.isEmpty(str)) return false
    if (!_.isString(includes) || _.isEmpty(includes)) return false
    return str.toLowerCase().includes(includes.toLowerCase())
}

export const logoutHandler = () => {
  localData.removeLocalData();
  // const {pathname, search} = window.location
  // const {base} = router.options
  // if (pathname && !pathname.match(`${base}#/login`) && pathname != `${base}#` && pathname != `${base}#/page-not-found`)
  //   return router.push('/login/?redirect_url=' + pathname + search);
  return router.push("/login");
}
