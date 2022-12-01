import {MEMBERSHIP, PAGE_ONE_SEARCH, PAYMENT_LIST} from "@/common/apiUrls";
import axios from "axios";
import {chunk} from "lodash";

const state = {
  listItems: [],
  itemsInPage: [],
  dataMembership: [],
  totalItems: 0,
  totalPages: 0,
  status: ''
};

const actions = {
  setItemsInPage({commit}, items) {
    commit('handlerItemsInPage', items)
  },

  async getInitMembership({commit}) {
    try {
      let res = await axios.get(`${MEMBERSHIP}/list`);
      commit('handlerMembership', res?.data || [])
    } catch (error) {
      // console.log(error)
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitList({commit, state}, {page = 0, itemsPage = 15, filter = null}) {
    try {
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage);
      if(filter) Object.keys(filter).forEach(fil => {
        if(filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
      })
      let res = await axios.get(`${PAYMENT_LIST}?${searchUrl}`);
      commit('setTotalItems', res?.totalItems)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data.filter(user => user && !user?.isDelete))
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      commit('getAllFailure', error)
    }
  },

  // eslint-disable-next-line no-unused-vars
  async getListItem({commit, state}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, filter = null}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        let searchUrl = PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage);
        if(filter) Object.keys(filter).forEach(fil => {
          if(filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        })
        const res = await axios.get(`${PAYMENT_LIST}?${searchUrl}`);
        return res.data || []
      }));
      const listItems = [...state.listItems, ...newData.flat()];
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      // console.log(error);
    }
  },
  // eslint-disable-next-line no-unused-vars
  async updateItem({commit}, media, listMedia) {

  },
};

const mutations = {
  handlerMembership(state, items) {
    state.dataMembership = items
  },
  handlerItemsInPage(state, items = []) {
    state.itemsInPage = items
  },
  setTotalItems(state, totalItems) {
    state.totalItems = totalItems
  },
  setTotalPages(state, totalPages) {
    state.totalPages = totalPages
  },
  getAllSuccess(state, data) {
    state.listItems = data;
  },
};

export const payments = {
  namespaced: true,
  state,
  actions,
  mutations
};
