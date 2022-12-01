import {PAGE_ONE_SEARCH, TRACKING_TOPIC} from "@/common/apiUrls";
import axios from "axios";
import {chunk} from "lodash";

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

  async getInitList({commit, state}, {page = 0, itemsPage = 15, status = null}) {
    try {
      // console.log({page, itemsPage, status})
      let res
      if (!status)
        res = await axios.get(`${TRACKING_TOPIC}?${PAGE_ONE_SEARCH(page, itemsPage)}`);
      else
        res = await axios.get(`${TRACKING_TOPIC}?${PAGE_ONE_SEARCH(page, itemsPage)}&status=${status}`);
      commit('setTotalItems', res?.totalItems)
      commit('setCurrentPage', page)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data.filter(user => user && !user?.isDelete))
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      commit('getAllFailure', error)
    }
  },

  async getListItem({commit, state, dispatch}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, status = null}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        if (status === null) {
          const res = await axios.get(`${TRACKING_TOPIC}?${PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)}`);
          return res.data || []
        } else {
          const res = await axios.get(`${TRACKING_TOPIC}?${PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)}&status=${status}`);
          return res.data || []
        }
      }));
      const listItems = [...state.listItems, ...newData.flat()];
      commit('setCurrentPage', nextPage)
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      dispatch('alert/error', "Get list tracking topic fail!", {root: true});
    }
  },

  async updateItem({commit, dispatch, state}, item) {
    try {
      const result = await axios.put(`${TRACKING_TOPIC}/${item._id}`, item)
      const index = state.listItems.findIndex(value => value._id === item._id);
      if(index > -1) commit('editItem', {index, item: result.data});
      dispatch('alert/success', "Change tracking topic success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Change tracking topic fail!", {root: true});
    }
  },

  async deleteById({commit, dispatch, state}, id) {
    try {
      await axios.delete(`${TRACKING_TOPIC}/${id}`)
      const idx = state.listItems.findIndex(value => value._id === id);
      if(idx > -1) commit('deleteItem', idx);
      dispatch('alert/success', "Delete tracking topic success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Delete tracking topic fail!", {root: true});
    }
  },

  async createItem({commit, dispatch}, item) {
    try {
      const res = await axios.post(TRACKING_TOPIC, item);
      commit("addItem", res.data)
      dispatch('alert/success', "Create tracking topic success!", {root: true})
    } catch (e) {
      dispatch('alert/error', "Create tracking topic fail!", {root: true})
    }
  }
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
    state.listItems[index] = item;
  },
  getAllSuccess(state, data) {
    state.listItems = data;
  },
};

export const trackings = {
  namespaced: true,
  state,
  actions,
  mutations
};
