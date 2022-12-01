import axios from "axios";
import {CODE_TYPE_LIST, CODE_TYPE_URL, PAGE_ONE_SEARCH} from "../../common/apiUrls";
import {chunk, isEqual} from "lodash";
import Vue from "vue";

const state = {
  listItems: [],
  itemsInPage: [],
  totalItems: 0,
  totalPages: 0,
  type: 'promo'
};

const actions = {
  setItemsInPage({commit}, users) {
    commit('handlerItemsInPage', users)
  },

  searchName({commit, state}, {name, itemsPage, type}) {
    // console.log({name, itemsPage})
    if (!name) {
      commit('handlerItemsInPage', chunk(state?.listItems, itemsPage)[0])
    } else {
      if (type === 'promo') {
        const items = state?.listItems?.filter(e => e?.promoCode?.toLowerCase().search(name.toLowerCase()) >= 0)
        commit('handlerItemsInPage', chunk(items, itemsPage)[0])
      } else {
        const items = state?.listItems?.filter(e => e?.code?.toLowerCase().search(name.toLowerCase()) >= 0)
        commit('handlerItemsInPage', chunk(items, itemsPage)[0])
      }
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitList({commit, state, dispatch}, {page = 0, itemsPage = 15, type = 'promo', filter = {}}) {
    try {
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage);
      if(Object.keys(filter)?.length > 0) {
        Object.keys(filter).forEach(fil => {
          if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        })
      }
      let res = await axios.get(`${CODE_TYPE_LIST(type)}?${searchUrl}`);
      commit('setTotalItems', res?.totalItems)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data.filter(user => user && !user?.isDelete) || [], type)
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      // console.log(error);
      dispatch('alert/error', `Get ${type} fail!`, {root: true});
    }
  },

  async getListItem({commit, state, dispatch}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, type = 'promo', filter = {}}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        let searchUrl = PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)

        if(Object.keys(filter)?.length > 0) {
          Object.keys(filter).forEach(fil => {
            if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
          })
        }
        const res = await axios.get(`${CODE_TYPE_LIST(type)}?${searchUrl}`);
        return res.data || []
      }));
      const listItems = [...state.listItems, ...newData.flat()];
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      dispatch('alert/error', `Get ${type} fail!`, {root: true});
    }
  },
  // eslint-disable-next-line no-unused-vars
  async updateItem({commit, state, dispatch}, props) {
    try {
      const {code, type} = props
      const index = state.listItems.findIndex(co => co._id === code._id)
      if (index === -1 || isEqual(code, state.listItems[index])) {
        return dispatch('alert/success', 'No thing new update !');
      }
      const oldData = state.listItems[index];
      const data = {}
      const nextName = ['createdAt', 'updatedAt', '_id', '__v', 'updatedAt', 'promoCode', 'code']
      Object.keys(code).forEach(name => {
        if (nextName.includes(name)) return;
        if (code[`${name}`] !== oldData[`${name}`]) {
          data[`${name}`] = code[`${name}`]
        }
      })
      const res = await axios.put(`${CODE_TYPE_URL(type)}/${code._id}`, data);
      if (!res.data) return dispatch('alert/success', `No thing new update ${res?.message}!`);
      commit('handlerUpdateItem', res.data)
      dispatch('alert/success', `Updated ${props.type} success!`, {root: true})
    } catch (e) {
      dispatch('alert/error', `Update ${props.type} fail!`, {root: true});
    }
  },
  // eslint-disable-next-line no-unused-vars
  async deleteById({commit, dispatch, state}, props) {
    try {
      const {id, type} = props
      // console.log(id, type)
      await axios.delete(`${CODE_TYPE_URL(type)}/${id}`)
      commit('handlerDelete', id)
      dispatch('alert/success', `Delete ${props.type} success!`, {root: true});
    } catch (e) {
      dispatch('alert/error', `Delete ${props.type} fail!`, {root: true});
    }
  }
};

const mutations = {
  handlerItemsInPage(state, totalItems = []) {
    state.itemsInPage = totalItems
  },
  handlerDelete(state, id) {
    // console.log("handlerDelete...", id)
    state.listItems = [...state.listItems].filter(item => item?._id !== id)
    state.itemsInPage = [...state.itemsInPage].filter(item => item?._id !== id)
  },
  handlerUpdateItem(state, item) {
    const idx = state.listItems.findIndex(x => x._id === item._id);
    Vue.set(state.listItems, idx, item);
    const idxIP = state.itemsInPage.findIndex(x => x._id === item._id);
    Vue.set(state.itemsInPage, idxIP, item);
  },
  setTotalItems(state, totalItems) {
    state.totalItems = totalItems
  },
  setTotalPages(state, totalPages) {
    state.totalPages = totalPages
  },
  getAllSuccess(state, data, type) {
    state.listItems = data;
    state.type = type
  },
};

export const codes = {
  namespaced: true,
  state,
  actions,
  mutations
};
