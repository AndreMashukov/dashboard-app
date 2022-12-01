import {PAGE_ONE_SEARCH, TRACKING_ANSWER, TRACKING_TOPIC} from "@/common/apiUrls";
import axios from "axios";
import {chunk, uniqBy,} from "lodash";
import Vue from "vue";

const state = {
  listItems: [],
  listUsers: [],
  topics: [],
  itemsInPage: [],
  totalItems: 0,
  totalPages: 0,
  status: '',
  currentPage: 0,
};

const getTopic = (topics, id, answer) => {
  const findTopic = topics.find(e => e && e?._id === id);
  if (!findTopic) return null;
  if (findTopic.type === 'input') return {...findTopic, answer}
  return {...findTopic, answer: findTopic?.options?.[answer - 1]?.value || answer}
}

const actions = {
  setItemsInPage({commit}, items) {
    commit('handlerItemsInPage', items)
  },
  searchName({commit, state}, {name, itemsPage, type}) {
    // console.log({name, itemsPage})
    if (!name) {
      commit('handlerItemsInPage', chunk(state?.listItems, itemsPage)[0])
    } else {
      if (type === 'topic') {
        const items = state?.listItems?.filter(e => e?.name?.toLowerCase().search(name.toLowerCase()) >= 0)
        commit('handlerItemsInPage', chunk(items, itemsPage)[0])
      } else {
        const items = state?.listItems?.filter(e => e?.dataTopic?.question?.toLowerCase().search(name.toLowerCase()) >= 0)
        commit('handlerItemsInPage', chunk(items, itemsPage)[0])
      }
    }
  },

  async getInitList({commit, state}, {page = 0, itemsPage = 15, typeTracking = 'topic', filter}) {
    try {
      const baseUrl = typeTracking === 'topic' ? TRACKING_TOPIC : TRACKING_ANSWER
      let res
      if (!filter) {
        res = await axios.get(`${baseUrl}?${PAGE_ONE_SEARCH(page, itemsPage)}`);
      } else {
        let searchUrl = ''
        Object.keys(filter).forEach(fil => {
          if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        })
        res = await axios.get(`${baseUrl}?${PAGE_ONE_SEARCH(page, itemsPage)}${searchUrl}`);
      }
      if (typeTracking !== 'topic') {
        const topics = await axios.get(`${TRACKING_TOPIC}`);
        commit('setTopics', topics.data || [])
      }
      // console.log(state.listItems)
      commit('setTotalItems', res?.totalItems)
      commit('setCurrentPage', page)
      if (typeTracking === "topic")
        commit('getAllSuccess', res.data.filter(item => item) || [])
      else
        commit('getAllSuccess', res.data.map(ans => ({
          ...ans,
          dataTopic: getTopic(state.topics, ans.topicId, ans.answer)
        })))
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('handlerItemsInPage', state.listItems || [])
      commit('setListUsers', state.listItems)
    } catch (error) {
      commit('getAllFailure', error)
    }
  },

  async getListItem({commit, state, dispatch}, {
    preMaxPage = 0,
    nextPage = 0,
    itemsPage = 15,
    typeTracking = 'topic',
    filter = {}
  }) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const baseUrl = typeTracking === 'topic' ? TRACKING_TOPIC : TRACKING_ANSWER
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        if (!Object.keys(filter)?.length) {
          const res = await axios.get(`${baseUrl}?${PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)}`);
          return res.data || []
        } else {
          let searchUrl = ''
          Object.keys(filter).forEach(fil => {
            if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
          })
          const res = await axios.get(`${baseUrl}?${PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)}${searchUrl}`);
          return res.data || []
        }
      }));

      const listItems = [...state.listItems, ...newData.flat()];
      commit('setCurrentPage', nextPage)
      if (typeTracking === "topic")
        commit('getAllSuccess', listItems.filter(item => item) || [])
      else
        commit('getAllSuccess', listItems.map(ans => ({
          ...ans,
          dataTopic: getTopic(state.topics, ans.topicId, ans.answer)
        })))
      commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
      commit('setListUsers', state.listItems)
    } catch (error) {
      console.log(error)
      dispatch('alert/error', "Get list tracking topic fail!", {root: true});
    }
  },

  async updateItem({commit, dispatch, state}, item) {
    try {
      const result = await axios.put(`${TRACKING_TOPIC}/${item._id}`, item)
      const index = state.listItems.findIndex(value => value._id === item._id);
      if (index > -1) commit('editItem', {index, item: result.data});
      dispatch('alert/success', "Change tracking topic success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Change tracking topic fail!", {root: true});
    }
  },

  async deleteById({commit, dispatch, state}, id) {
    try {
      await axios.delete(`${TRACKING_TOPIC}/${id}`)
      const idx = state.listItems.findIndex(value => value._id === id);
      if (idx > -1) commit('deleteItem', idx);
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
  setTopics(state, items = []) {
    state.topics = items
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
  setListUsers(state, list) {
    const users = list.map(
      item => ({
        _id: item?.profile?._id,
        email: item?.profile?.email
      }))
    state.listUsers = uniqBy(users, '_id')
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
