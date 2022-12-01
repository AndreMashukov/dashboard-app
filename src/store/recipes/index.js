import {
  INGREDIENT_LIST,
  MEDIA,
  MEDIA_TOPIC,
  MEDIA_TYPE,
  PAGE_ONE_SEARCH,
  RECIPE,
  RECIPE_CATEGORY_LIST,
  RECIPE_DIETARY_LIST,
  RECIPE_LIST,
  RECIPE_MEAL,
  RECIPE_TAG_LIST,
  RECIPE_TYPE_LIST,
  RECIPE_REFRESH
} from "@/common/apiUrls";
import axios from "axios";
import {chunk} from "lodash";
import Vue from "vue";

const state = {
  listItems: [],
  recipeMeals: [],
  ingredients: [],
  itemsInPage: [],
  imagesMedia: [],
  allImageMedia: [],
  recipeType: [],
  recipeCategory: [],
  recipeDietary: [],
  recipeTags: [],
  totalItems: 0,
  totalPages: 0,
  status: ''
};

const handleMedia = async (mediaImageFile) => {
  try {
    if (!mediaImageFile.isUploadFile) return mediaImageFile._id;
    let topics = await axios.get(`${MEDIA_TOPIC}/list?type=image`)
    topics = topics.data
    if (!topics || topics.length === 0) return null
    let topicId = null;
    for (let i = 0, length = topics.length; i < length; i++) {
      const val = topics[i];
      if (i === 0) topicId = val._id
      if (val.subType !== 'recipes') continue;
      topicId = val._id
      break;
    }
    const formData = new FormData();
    formData.append('name', mediaImageFile.name);
    formData.append('type', 'image');
    formData.append('status', 'published');
    formData.append('topicId', topicId);
    formData.append('urlFile', mediaImageFile.file);
    let result = await axios.post(MEDIA, formData);
    return result.data._id;
  } catch (e) {
    return null
  }
}

const actions = {
  setItemsInPage({commit}, items) {
    commit('handlerItemsInPage', items)
  },
  // eslint-disable-next-line no-unused-vars
  async getInitList({commit, state, dispatch}, {page = 0, itemsPage = 15, filter}) {
    try {
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage);
      if(filter) Object.keys(filter).forEach(fil => {
        if (fil === 'tags') {
          filter.tags?.filter(x => x)?.map(vl => searchUrl += `&${fil}=${vl}`)
        } else {
          if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        }
      })
      const res = await axios.get(`${RECIPE_LIST}?${searchUrl}`);
      commit('setTotalItems', res?.totalItems)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage))
      commit('getAllSuccess', res.data.filter(user => user && !user?.isDelete))
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Init List', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitRecipeMeal({commit, dispatch}) {
    try {
      let res = await axios.get(`${RECIPE_MEAL}/all`);
      commit('handlerRecipeMeals', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Recipe Meal', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitRecipeType({commit, dispatch}) {
    try {
      let res = await axios.get(RECIPE_TYPE_LIST);
      commit('handlerRecipeTypes', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Recipe Type', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitIngredient({commit, dispatch}) {
    try {
      let res = await axios.get(INGREDIENT_LIST);
      commit('handlerIngredient', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Init Ingredient', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitImageMedia({commit, dispatch}) {
    try {
      let res = await axios.get(MEDIA_TYPE('image'));
      commit('handlerImagesMedia', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Init Images Media', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitRecipeCategory({commit, dispatch}) {
    try {
      let res = await axios.get(RECIPE_CATEGORY_LIST);
      commit('handlerRecipeCategory', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Init Recipe Category', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitRecipeDietary({commit, dispatch}) {
    try {
      let res = await axios.get(RECIPE_DIETARY_LIST);
      commit('handlerRecipeDietary', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Init Recipe Dietary', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitRecipeTags({commit, dispatch}) {
    try {
      let res = await axios.get(RECIPE_TAG_LIST);
      // console.log(res.data.map(tag => tag._id))
      commit('handlerRecipeTag', res?.data || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Init Recipe Tags', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getListItem({commit, state, dispatch}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, filter}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        let searchUrl = PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage);
        if(filter) Object.keys(filter).forEach(fil => {
          if (fil === 'tags') {
            filter.tags?.filter(x => x)?.map(vl => searchUrl += `&${fil}=${vl}`)
          } else {
            if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
          }
        })
        const res = await axios.get(`${RECIPE_LIST}?${searchUrl}`);
        return res.data || []
      }));
      const listItems = [...state.listItems, ...newData.flat()];
      commit('getAllSuccess', listItems.filter(item => item) || [])
      commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
    } catch (error) {
      dispatch('alert/error', 'Error: Get Page Fail!', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async updateItem({commit, dispatch}, item) {
    try {
      if(item.media)
        item.mediaId = await handleMedia(item.media);
      if(item.mediaMobile)
        item.mediaMobileId = await handleMedia(item.mediaMobile);
      await axios.put(`${RECIPE}/${item._id}`, item);
      const data = await axios.get(`${RECIPE}/${item._id}`);
      commit('updateItems', data.data)
      dispatch('alert/success', 'Update successful!', {root: true})
      return {status: "OK"}
    } catch (e) {
      if (e.data && e.data.message ) {
        dispatch('alert/error', `Error: ${e.data.message} ${e.data.data[0].message}`, {root: true})
      } else {
        dispatch('alert/error', 'Error: Update Fail!', {root: true})
      }
      return {status: "Error"}
    }
  },
  // eslint-disable-next-line no-unused-vars
  async deleteById({commit, dispatch, state}, {id}) {
    try {
      await axios.delete(`${RECIPE}/${id}`)
      commit('getAllSuccess', state.listItems.filter(i => i?._id !== id))
      commit('handlerItemsInPage', state.itemsInPage.filter(i => i?._id !== id))
      dispatch('alert/success', 'Delete successful!', {root: true})
    } catch (e) {
      dispatch('alert/error', 'Error: Get Page Fail!', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async refreshView({dispatch}) {
    try {
      await axios.post(RECIPE_REFRESH)
      dispatch('alert/success', 'Refresh Recipes successful!', {root: true})
    } catch (e) {
      dispatch('alert/error', 'Error: Refresh Recipes Fail!', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async createItem({commit, dispatch, state}, newRecipe) {
    try {
      if(newRecipe.media)
        newRecipe.mediaId = await handleMedia(newRecipe.media);
      if(newRecipe.mediaMobile)
        newRecipe.mediaMobileId = await handleMedia(newRecipe.mediaMobile);

      // console.log(newRecipe)
      const res = await axios.post(RECIPE, newRecipe);

      if (!res.data) {
        dispatch('alert/error', 'Error: Create Fail!', {root: true})
        return;
      }
      const data = await axios.get(`${RECIPE}/${res.data._id}`);
      commit('addItems', data.data)
      dispatch('alert/success', 'Create successful!', {root: true})
      return {status: "OK"}
    } catch (e) {
      if (e.data && e.data.message ) {
        dispatch('alert/error', `Error: ${e.data.message} ${e.data.data[0].message}`, {root: true})
      } else {
        dispatch('alert/error', 'Error: Create Fail!', {root: true})
      }
      return {status: "Error"}
    }
  },
  findImage({commit, state}, strFind) {
    if (!strFind) {
      return commit('handlerFindImage', [...state?.allImageMedia]?.splice(0, 7))
    } else {
      const items = state.allImageMedia?.filter(e => e?.name && e?.name?.toLowerCase()?.indexOf(strFind?.toLowerCase()) >= 0)
      commit('handlerFindImage', items?.splice(0, 7))
    }
  }
};

const mutations = {
  addItems(state, item) {
    // state.itemsInPage.unshift(item)
    state.listItems.unshift(item)
  },
  updateItems(state, item) {
    const idx = state.listItems.findIndex(x => x._id === item._id);
    Vue.set(state.listItems, idx, item);
    const idxIP = state.itemsInPage.findIndex(x => x._id === item._id);
    Vue.set(state.itemsInPage, idxIP, item);
  },
  handlerItemsInPage(state, items = []) {
    state.itemsInPage = items
  },
  handlerRecipeMeals(state, items = []) {
    state.recipeMeals = items
  },
  handlerImagesMedia(state, items = []) {
    state.allImageMedia = items
    state.imagesMedia = [...items].splice(0, 7)
  },
  handlerFindImage(state, items = []) {
    state.imagesMedia = items
  },
  handlerRecipeTypes(state, items = []) {
    state.recipeType = items
  },
  handlerRecipeDietary(state, items = []) {
    state.recipeDietary = items
  },
  handlerRecipeTag(state, items = []) {
    state.recipeTags = items
  },
  handlerRecipeCategory(state, items = []) {
    state.recipeCategory = items
  },
  handlerIngredient(state, items = []) {
    items = items.map(i=>{
      i.label = (i.unit)?i.name +'('+i.unit+')':i.name
      return i
    })
    state.ingredients = items
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

export const recipes = {
  namespaced: true,
  state,
  actions,
  mutations
};
