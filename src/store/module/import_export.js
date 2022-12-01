import axios from "axios";
import {EXPORT_DATABASE_EXCEL, IMPORT_DATABASE_EXCEL, COLLECTIONS} from "@/common/apiUrls";

const state = {
  listItems: [],
  collections: [],
};

const actions = {
  async importAction({dispatch}, {typeAction = '', dataFile}) {
    try {
      if (!typeAction) return null
      if (typeAction === 'import' && dataFile) {
        const formData = new FormData()
        formData.append('file', dataFile)
        const resError = await axios.post(IMPORT_DATABASE_EXCEL, formData)
        if (resError?.data) {
          return dispatch('alert/error', ` Action Error: ${JSON.stringify(resError?.data)}  !`, {root: true});
        }
      } else return null
      dispatch('alert/success', ` "Action successful !`, {root: true});
    } catch (e) {
      dispatch('alert/error', ` Action Error: ${JSON.stringify(e?.data)}  !`, {root: true});
    }
  },

  async exportAction({ dispatch}, {typeAction = '', data = [], isAll = true}) {
    try {
      if (!typeAction) return null
      // console.log(EXPORT_DATABASE_EXCEL);
      // console.log({typeAction, data , isAll });
      let res
      if (typeAction === 'export' && isAll) {
        res = await axios.get(EXPORT_DATABASE_EXCEL, {responseType: 'arraybuffer'})
      }
      else if(typeAction === 'export' && data?.length){
        res = await axios.post(EXPORT_DATABASE_EXCEL,{collections: data}, {responseType: 'arraybuffer'})
      }else return null
      let blob = new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const url = window.URL.createObjectURL(blob)
      window.open(url)
      dispatch('alert/success', ` "Action successful !`, {root: true});
    } catch (e) {
      dispatch('alert/error', ` Action Error: ${JSON.stringify(e?.data)}  !`, {root: true});
    }
  },

  async getCollections({commit, dispatch}) {
    try {
      const res = await axios.get(COLLECTIONS);
      if(!res.data) return dispatch('alert/error', ` "Get collections fail !`, {root: true});
      commit('setCollections', res.data)
    } catch (e) {
      dispatch('alert/error', ` Get collections fail: ${JSON.stringify(e?.data)}  !`, {root: true});
    }
  },
};

const mutations = {
  setCollections(state, data) {
    state.collections = data
  },
};

export const databases = {
  namespaced: true,
  state,
  actions,
  mutations
};
