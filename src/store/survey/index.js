import {PAGE_ONE_SEARCH, SURVEY, SURVEY_ANSWER} from "@/common/apiUrls";
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
  async getInitList({commit, state}, {page = 0, itemsPage = 15, type = 'survey', search = null}) {
    try {
      let url = `${SURVEY_ANSWER}?${PAGE_ONE_SEARCH(page, itemsPage)}`;
      let res
      if(type === 'survey'){
        url = `${SURVEY}?${PAGE_ONE_SEARCH(page, itemsPage)}`;
        if(search && search.name) url += `&name=${search.name}`;
        res = await axios.get(url);
      }else{
        if(search && search.name) url += `&name=${search.name}`;
        if(search && search.email) url += `&email=${search.email}`
        res = await axios.get(url);

        res.data?.forEach((answer, idx) => {
          const survey = answer.survey;
          const questions = survey?.questions || [];
          const resultMerge = [...answer.result].map( res => {
            const question = questions.find(ques => res?.questionId && ques._id === res.questionId)
            const answers = res?.answer?.map(ans => question?.options?.[ans])
            return {question,answers}
          })
          res.data[idx].result = resultMerge
          res.data[idx].survey = survey
        })
      }
      commit('setTotalItems', res?.totalItems)
      commit('setCurrentPage', page)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data)
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      commit('getAllFailure', error)
    }
  },

  async getListItem({commit, state, dispatch}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, type = 'survey', search = null}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(idx => {
        let url = `${SURVEY_ANSWER}?${PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)}`
        if(type === 'survey') url = `${SURVEY}?${PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage)}`;
        if(search) {
          if(search.name) url += `&name=${search.name}`
          if(search.email && type !== 'survey') url += `&name=${search.email}`
        }
        return axios.get(url);
      }));
      if(type !== 'survey'){
        newData.forEach(vals => {
          vals.data.forEach((answer, idx) => {
            const survey = answer.survey;
            const questions = survey?.questions || [];
            const resultMerge = [...answer.result].map( res => {
              const question = questions.find(ques => res?.questionId && ques._id === res.questionId)
              const answers = res?.answer?.map(ans => question?.options?.[ans])
              return {question,answers}
            })
            vals.data[idx].result = resultMerge
            vals.data[idx].survey = survey
          })
        })
      }
      const data = newData.map(value => value.data);
      const listItems = [...state.listItems, ...data.flat()];
      commit('setCurrentPage', nextPage)
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      dispatch('alert/error', "Get list survey fail!", {root: true});
    }
  },

  async updateItem({commit, dispatch, state}, item) {
    try {
      const result = await axios.put(`${SURVEY}/${item._id}`, item)
      const index = state.listItems.findIndex(value => value._id === item._id);
      if(index > -1) commit('editItem', {index, item: result.data});
      dispatch('alert/success', "Change survey success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Change survey fail!", {root: true});
    }
  },

  async deleteById({commit, dispatch, state}, id) {
    try {
      await axios.delete(`${SURVEY}/${id}`)
      const idx = state.listItems.findIndex(value => value._id === id);
      if(idx > -1) commit('deleteItem', idx);
      dispatch('alert/success', "Delete survey success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Delete survey fail!", {root: true});
    }
  },

  async createItem({dispatch, commit}, item) {
    try {
      const res = await axios.post(SURVEY, item);
      commit("addItem", res.data)
      dispatch('alert/success', "Create survey success!", {root: true})
    } catch (e) {
      dispatch('alert/error', "Create survey fail!", {root: true})
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

export const surveys = {
  namespaced: true,
  state,
  actions,
  mutations
};
