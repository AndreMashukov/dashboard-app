import Vue from "vue";
import {DIETARY, MEAL_PLAN, MENU_FOOD, PAGE_ONE_SEARCH, RECIPE, RECIPE_MEAL} from "@/common/apiUrls";
import axios from "axios";
import {chunk} from "lodash";

const state = {
  listItems: [],
  itemsInPage: [],
  totalItems: 0,
  totalPages: 0,
  status: '',
  currentPage: 0,
  listMeal: [],
  listRecipe: [],
  listDietary: [],
};

const actions = {
  setItemsInPage({commit}, items) {
    commit('handlerItemsInPage', items)
  },
  searchName({commit, state}, {name, itemsPage}) {
    // console.log({name, itemsPage})
    if (!name) {
      commit('handlerItemsInPage', chunk(state?.listItems, itemsPage)[0])
    } else {
      // console.log('Filter...',state?.listItems)
      const items = state?.listItems?.filter(e => e?.name?.toLowerCase().search(name.toLowerCase()) >= 0)
      commit('handlerItemsInPage', chunk(items, itemsPage)[0])
    }
  },
  async getInitList({commit, state}, {page = 0, itemsPage = 15, filter}) {
    try {
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage);
      if(filter) Object.keys(filter).forEach(fil => {
        if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
      })
      let res = await axios.get(`${MEAL_PLAN}/list?${searchUrl}`);
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
        if(filter) Object.keys(filter).forEach(fil => {
          if(filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        })
        return axios.get(`${MEAL_PLAN}/list?${searchUrl}`);
      }));
      const data = newData.map(value => value.data);
      const listItems = [...state.listItems, ...data.flat()];
      commit('setCurrentPage', nextPage)
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      dispatch('alert/error', "Get list meal plan fail!", {root: true});
    }
  },

  async getItemDetail({dispatch}, id) {
    try {
      const res = await axios.get(`${MEAL_PLAN}/${id}`);
      if(!res.data) return null;
      return res.data;
    } catch (e) {
      dispatch('alert/error', "Get a meal plan fail!", {root: true});
      return null
    }
  },

  async updateItem({commit, dispatch, state}, item) {
    try {
      const menuFood = [];
      for(let i = 0, length = item.data.length; i < length; i++){
        const value = item.data[i];
        const result = await Promise.all(value.menuFood.map(menu => {
          if(menu._id) return axios.put(`${MENU_FOOD}/${menu._id}`, menu);
          return axios.post(MENU_FOOD, menu);
        }))
        menuFood.push(result);
      }
      for (let i = 0, length = item.data.length; i < length; i++) {
        item.data[i].menuFood = []
        for (let val of menuFood[i]) {
          if(!val.data) throw menuFood;
          item.data[i].menuFood.push(val.data._id);
        }
      }
      const result = await axios.put(`${MEAL_PLAN}/${item._id}`, item)
      const index = state.listItems.findIndex(value => value._id === item._id);
      if (index > -1) commit('editItem', {index, item: result.data});
      dispatch('alert/success', "Change meal plan success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Change meal plan fail!", {root: true});
    }
  },

  async deleteById({commit, dispatch, state}, id) {
    try {
      await axios.delete(`${MEAL_PLAN}/${id}`)
      const idx = state.listItems.findIndex(value => value._id === id);
      if (idx > -1) commit('deleteItem', idx);
      dispatch('alert/success', "Delete meal plan success!", {root: true});
    } catch (e) {
      dispatch('alert/error', "Delete meal plan fail!", {root: true});
    }
  },

  async createItem({commit, dispatch, state}, item) {
    try {
      const menuFood = await Promise.all(item.data.map(value => axios.post(`${MENU_FOOD}/recipes`, {data: value.menuFood})))
      for (let i = 0, length = menuFood.length; i < length; i++) {
        const data = menuFood[i]?.data
        if (!data) throw menuFood;
        item.data[i].menuFood = data.map(value => value._id);
      }
      const res = await axios.post(MEAL_PLAN, item);
      const idx = state.listDietary.findIndex(value => value._id === item.dietaryId)
      if (idx > -1) res.data.dietary = state.listDietary[idx];
      commit("addItem", res.data)
      dispatch('alert/success', "Create meal plan success!", {root: true})
    } catch (e) {
      dispatch('alert/error', "Create meal plan fail!", {root: true})
    }
  },

  async getMealList({dispatch, commit}) {
    try {
      let res = await axios.get(`${RECIPE_MEAL}/list?isMenuFood=true`);
      commit('setListMeal', res.data)
    } catch (e) {
      dispatch('alert/error', "Get list meal of recipes fail!", {root: true});
    }
  },

  async getRecipeList({dispatch, commit}) {
    try {
      let res = await axios.get(`${RECIPE}/list`);
      commit('setListRecipe', res.data)
    } catch (e) {
      dispatch('alert/error', "Get list recipes fail!", {root: true});
    }
  },

  async getDietaryList({dispatch, commit}) {
    try {
      let res = await axios.get(`${DIETARY}/list`);
      commit('setListDietary', res.data)
    } catch (e) {
      dispatch('alert/error', "Get list dietary fail!", {root: true});
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
  setListMeal(state, data) {
    state.listMeal = data;
  },
  setListRecipe(state, data) {
    state.listRecipe = data;
  },
  setListDietary(state, data) {
    state.listDietary = data;
  },
};

export const mealPlan = {
  namespaced: true,
  state,
  actions,
  mutations
};
