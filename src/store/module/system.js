import Vue from "vue";
import axios from "axios";
import {SYSTEM, MAIL_CHIMP} from "@/common/apiUrls";

const state = {
  settings: [],
};

const actions = {
  async getListSystem({dispatch, commit}) {
    try {
      const res = await axios.get(`${SYSTEM}/list`)
      commit('setSystem', res.data)
    } catch (e) {
      dispatch('alert/error', 'Get list system fail !', {root: true});
    }
  },

  async createSystem({commit, dispatch}, item) {
    try {
      const res = await axios.post(SYSTEM, item);
      commit('addSystem', res.data)
    } catch (e) {
      dispatch('alert/error', 'Create system fail !', {root: true});
    }
  },

  async updateSystem({commit, dispatch}, item) {
    try {
      if(!item.field || !item.value)
        return dispatch('alert/error', 'update system fail !\nfield and value not null', {root: true});
      const res = await axios.put(`${SYSTEM}/${item.field}`, item);
      if(!res.data) return dispatch('alert/error', 'update system fail !', {root: true});
      commit('updateSystem', res.data);
      dispatch('alert/success', 'update system success !', {root: true});
    } catch (e) {
      dispatch('alert/error', 'update system fail !', {root: true});
    }
  },

  async upMailChimp({commit, dispatch}, item) {
    try {
      if(!item.apiKey || !item.dc)
        return dispatch('alert/error', 'update system MAIL CHIMP fail !\nfield "Api key", "DC" and "Version" not null', {root: true});
      const res = await axios.post(MAIL_CHIMP, item);
      if(!res.data) return dispatch('alert/error', 'update system MAIL CHIMP fail !', {root: true});

      commit('updateSystem', res.data);
      dispatch('alert/success', 'update system MAIL CHIMP success !', {root: true});
    } catch (e) {
      dispatch('alert/error', 'update system MAIL CHIMP fail !', {root: true});
      throw e;
    }
  },
};

const mutations = {
  setSystem(state, data) {
    state.settings = data
  },
  addSystem(state, item) {
    state.settings.push(item);
  },
  updateSystem(state, item) {
    const idx = state.settings.findIndex(value => value._id === item._id);
    if(idx > -1) Vue.set(state.settings, idx, item);
    else state.settings.push(item)
  },
};

export const system = {
  namespaced: true,
  state,
  actions,
  mutations
};
