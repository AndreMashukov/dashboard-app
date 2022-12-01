import axios from "axios";
import {LIST_USERS, MEMBERSHIP, PAGE_ONE_SEARCH, PROFILE_USER} from "../../common/apiUrls";
import {chunk} from "lodash";

const state = {
  data: {},
  usersInPage: [],
  dataMembership: [],
  totalItems: 0,
  totalPages: 0,
};

const actions = {
  setUsersInPage({commit}, users) {
    commit('handlerUsersInPage', users)
  },
  searchName({commit, state}, {name, itemsPage}) {
    if (!name) {
      commit('handlerUsersInPage', chunk(state?.data?.users, itemsPage)[0])
    } else {
      // console.log(state?.data?.users)
      const usr = state?.data?.users?.filter(e => e?.username?.toLowerCase().indexOf(name.toLowerCase()) >= 0)
      commit('handlerUsersInPage', chunk(usr, itemsPage)[0])
    }
  },
// eslint-disable-next-line no-unused-vars
  async getInitMembership({commit}) {
    try {
      let res = await axios.get(`${MEMBERSHIP}/list`);
      commit('handlerMembership', res?.data || [])
    } catch (error) {
      // console.log(error)
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitListUsers({commit, state, dispatch}, {page = 0, itemsPage = 15, roles = 'member', filter}) {
    try {
      commit('getAllRequest');
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage)
      if(filter) Object.keys(filter).forEach(fil => {
        if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
      })
      const res = await axios.get(`${LIST_USERS}?${searchUrl}`);
      if (!res.data) return dispatch('alert/error', `Get list users fail! ${res?.message}`, {root: true})
      commit('setTotalItems', res?.totalItems)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data.filter(user => user && !user?.isDelete) || [])
      commit('handlerUsersInPage', state.data.users || [])
    } catch (error) {
      return dispatch('alert/error', `Get list users fail! ${error}`, {root: true})
      // commit('getAllFailure', error)
    }
  },

  async getListUsers({commit, state}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, filter}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerUsersInPage', chunk(state.data.users, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        let searchUrl = PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage);
        if(filter) Object.keys(filter).forEach(fil => {
          if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        })
        const res = await axios.get(`${LIST_USERS}?${searchUrl}`);
        return res.data || []
      }));
      const listUser = [...state.data.users, ...newData.flat()];
      commit('getAllSuccess', listUser.filter(user => user && !user?.isDelete) || [])
      commit('handlerUsersInPage', chunk(state.data.users, itemsPage)[nextPage] || [])
    } catch (error) {
      commit('getAllFailure', error)
    }
  },
  // eslint-disable-next-line no-unused-vars
  async updateUser({commit}, customer, users) {
    try {
      // console.log("Edit customer:", customer)
      console.log("Edit URL:", `${PROFILE_USER}?userId=${customer._id}`)
    } catch (error) {
      commit('getAllFailure', error)
      console.log(error)
    }
  },
  deleteById({commit}, id) {
    commit('deleteRequest', id);
    commit('deleteSuccess', id);
    commit('deleteFailure', {id, error: "error.toString()"})
    // userService.delete(id)
    //     .then(
    //         user => commit('deleteSuccess', id),
    //         error => commit('deleteFailure', { id, error: error.toString() })
    //     );
  }
};

const mutations = {
  getAllRequest(state) {
    state.data = {loading: true};
  },
  getFieldState(state, field) {
    return state[`${field}`];
  },
  handlerMembership(state, items) {
    state.dataMembership = items
  },
  handlerUsersInPage(state, users = []) {
    state.usersInPage = users;
  },
  setTotalItems(state, totalItems = 0) {
    state.totalItems = totalItems
  },
  setTotalPages(state, totalPages = 1) {
    state.totalPages = totalPages
  },
  getAllSuccess(state, users) {
    state.data = {users};
  },
  getAllFailure(state, error) {
    state.data = {error};
  },
  deleteRequest(state, id) {
    // add 'deleting:true' property to user being deleted
    state.data.items = state.data.items.map(user => user.id === id)
  },
  deleteSuccess(state, id) {
    // remove deleted user from state
    state.data.items = state.users.items.filter(user => user.id !== id)
  },
  deleteFailure(state, {id, error}) {
    // remove 'deleting:true' property and add 'deleteError:[error]' property to user
    state.data.items = state.data.map(user => {
      if (user.id === id) {
        // make copy of user without 'deleting:true' property
        // eslint-disable-next-line no-unused-vars
        const {deleting, ...userCopy} = user;
        // return copy of user with 'deleteError:[error]' property
        return {...userCopy, deleteError: error};
      }

      return user;
    })
  }
};

export const users = {
  namespaced: true,
  state,
  actions,
  mutations
};
