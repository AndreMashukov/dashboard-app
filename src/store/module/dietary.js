import {PAGE_ONE_SEARCH, DIETARY} from "@/common/apiUrls";
import axios from "axios";
import {chunk} from "lodash";
import Vue from "vue";

const state = {
  listItems: [],
  itemsInPage: [],
  totalItems: 0,
  totalPages: 0,
  status: '',
  currentPage: 0,
};

const actions = {
  setItemsInPage({commit}, items) {
    commit('handlerItemsInPage', items)
  },
  async getInitList({commit, state}, {page = 0, itemsPage = 15, filter}) {
    try {
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage);
      if(filter) Object.keys(filter).forEach(fil => {searchUrl += `&${fil}=${filter[`${fil}`]}`});
      let res = await axios.get(`${DIETARY}/list?${searchUrl}`);
      commit('setTotalItems', res?.totalItems)
      commit('setCurrentPage', page)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data)
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      commit('getAllFailure', error)
    }
  },

  async getListItem({commit, state, dispatch}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, filter = null}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(idx => {
        let searchUrl = PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage);
        if(filter) Object.keys(filter).forEach(fil => {searchUrl += `&${fil}=${filter[`${fil}`]}`});
        return axios.get(`${DIETARY}/list?${searchUrl}`);
      }));
      const data = newData.map(value => value.data);
      const listItems = [...state.listItems, ...data.flat()];
      commit('setCurrentPage', nextPage)
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      dispatch('alert/error', "Get list dietary fail!", {root: true});
    }
  },

  async updateItem({commit, dispatch, state}, item) {
    try {
      const result = await axios.put(`${DIETARY}/${item._id}`, item)
      const index = state.listItems.findIndex(value => value._id === item._id);
      if(index > -1) commit('editItem', {index, item: result.data});
      dispatch('alert/success', "Change dietary success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Change dietary fail!", {root: true});
    }
  },

  async deleteById({commit, dispatch, state}, id) {
    try {
      await axios.delete(`${DIETARY}/${id}`)
      const idx = state.listItems.findIndex(value => value._id === id);
      if(idx > -1) commit('deleteItem', idx);
      dispatch('alert/success', "Delete dietary success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Delete dietary fail!", {root: true});
    }
  },

  async createItem({commit, dispatch}, item) {
    try {
      const res = await axios.post(DIETARY, item);
      commit("addItem", res.data)
      dispatch('alert/success', "Create dietary success!", {root: true})
    } catch (e) {
      dispatch('alert/error', "Create dietary fail!", {root: true})
    }
  },
};

const mutations = {
  handlerItemsInPage(state, items = []) {
    state.itemsInPage = items
  },
  setCurrentPage(state, page) {
    state.currentPage = page
  },
  setTotalItems(state, totalItems) {
    state.totalItems = totalItems
  },
  setTotalPages(state, totalPages) {
    state.totalPages = totalPages
  },
  addItem(state, item) {
    state.listItems.unshift(item);
  },
  deleteItem(state, idx) {
    state.listItems.splice(idx, 1);
  },
  editItem(state, {index, item}) {
    Vue.set(state.listItems, index, item);
    const idxIP = state.itemsInPage.findIndex(x => x._id === item._id);
    Vue.set(state.itemsInPage, idxIP, item);
  },
  getAllSuccess(state, data) {
    state.listItems = data;
  },
};

export const dietary = {
  namespaced: true,
  state,
  actions,
  mutations
};
