import router from '../../router';
import axios from "axios";
import {localData} from '../../config'
import {CHANGE_PASSWORD, LOGIN, LOGOUT, PROFILE, PROFILE_USER} from "../../common/apiUrls";
// import {isProd} from "../../common/constants";
import {logoutHandler} from "../../utils";

const state = {status: {loggedIn: false}, user: null};

// const debug = process.env.NODE_ENV !== 'production'
const actions = {
  async login({dispatch, commit}, {username, password}) {
    try {
      const {setAccess, setRefresh, redirectUrl, deleteRedirect, setUserInfo} = localData;
      commit('loginRequest', {username});

      const {data} = await axios.post(LOGIN, {username, password})
      setAccess(data.accessToken)
      setRefresh(data.refreshToken);
      commit('loginSuccess', data.profile);

      const redirect = redirectUrl();
      deleteRedirect();
      setUserInfo(data.profile);
      dispatch('alert/success', "Authentication success.\nWelcome back !", {root: true});
      return router.push(`${redirect ? redirect : "/"}`)
    } catch (error) {
      dispatch('alert/error', "Authentication failed.\nPlease check your username/password", {root: true});
    }
  },

  async getUser({commit}) {
    try {
      const res = await axios.get(PROFILE);
      localData.setUserInfo(res.data);
      commit('getUserSuccess', res.data)
    } catch (error) {
      commit('loginFailure', error)
    }
  },

  async upAvatar({commit}, file) {
    try {
      let formData = new FormData();
      formData.append(file.fieldName, file.imageFile)
      const res = await axios.post(PROFILE_USER + "/avatar", formData);
      commit("upAvatarSuccess", res.data)
      return true;
    } catch (error) {
      commit('upAvatarFailure', error)
      return false;
    }
  },

  async loadCurrentUser({commit}) {
    const currentUser = localData?.userInfo();
    if (currentUser.name) {
      commit('getUserSuccess', currentUser);
      return;
    }
    try {
      const res = await axios.get(PROFILE);
      localData.setUserInfo(res.data);
      commit('getUserSuccess', res.data)
    } catch (error) {
      commit('loginFailure', error)
    }
  },

  // eslint-disable-next-line no-empty-pattern
  async changePassword({dispatch, commit}, data) {
    try {
      if (!data.oldPassword || !data.password || !data.confirmPassword ) {
        dispatch('alert/error', 'Field Must Not Empty !', {root: true});
        return {validation: true}
      }
      if (!data || data.oldPassword === data.password) {
        dispatch('alert/error', 'You cant change if password equal new password !', {root: true});
        return {validation: true}
      }
      if (!data || data.confirmPassword !== data.password) {
        dispatch('alert/error', 'Confirm Password not match New Password !', {root: true});
        return {validation: true}
      }
      await axios.put(CHANGE_PASSWORD, data);
      dispatch('alert/success', 'Change password success !', {root: true});
      commit('logoutHandle');
      return logoutHandler();
    } catch (error) {
      if (error?.data?.data[0].message)
        dispatch('alert/error', error?.data?.data[0].message, {root: true});
      else dispatch('alert/error', 'Change password fail !', {root: true});
      throw error;
    }
  },

  async logout({commit}) {
    const data = {refreshToken: localData.refreshToken()};
    commit('logoutHandle');
    try {
      await axios.post(LOGOUT, data);
      return logoutHandler();
    } catch (e) {
      return logoutHandler();
    }
  },
};

const mutations = {
  loginRequest(state, user) {
    state.status = {loggedIn: false};
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = {loggedIn: true};
    state.user = user;
  },
  getUserSuccess(state, user) {
    state.status = {loggedIn: true};
    state.user = user;
  },
  loginFailure(state) {
    state.status = {loggedIn: false};
    state.user = null;
  },
  logoutHandle(state) {
    state.status = {loggedIn: false};
    state.user = null;
  },
  upAvatarSuccess(state, data) {
    state.user = {...state.user, avatar: data.avatar};
  },
};

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
};
