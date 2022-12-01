import axios from "axios";
import Vue from "vue";
import {
  MEDIA,
  MEDIA_CATEGORY,
  MEDIA_SERIES,
  MEDIA_TAGS,
  MEDIA_TOPIC,
  MEDIA_TYPE,
  PAGE_ONE_SEARCH,
} from "../../common/apiUrls";
import {chunk} from "lodash";

const state = {
  listItems: [],
  itemsInPage: [],
  mediaTopics: [],
  mediaSeries: [],
  mediaTags: [],
  imagesMedia: [],
  allImageMedia: [],
  totalItems: 0,
  totalPages: 0,
  type: 'video',
  mediaCategory: [],
};

const handleThumbnail = async (mediaImageFile, mediaType) => {
  try {
    if (!mediaImageFile.isUploadFile) return mediaImageFile.thumbnail;
    let topics = await axios.get(`${MEDIA_TOPIC}/list?type=image`)
    topics = topics.data
    if (!topics || topics.length === 0) return null
    let topicId = null;
    for (let i = 0, length = topics.length; i < length; i++) {
      const val = topics[i];
      if (i === 0) topicId = val._id
      if (val.subType !== mediaType) continue;
      topicId = val._id
      break;
    }
    const formData = new FormData();
    formData.append('name', mediaImageFile.name);
    formData.append('type', 'image');
    formData.append('status', 'published');
    formData.append('topicId', topicId);
    formData.append('urlFile', mediaImageFile.file);
    let thumbnail = await axios.post(MEDIA, formData);
    thumbnail = thumbnail.data.thumbnail;
    return thumbnail;
  } catch (e) {
    return null
  }
}

const actions = {
  setItemsInPage({commit}, users) {
    commit('handlerItemsInPage', users)
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
  // eslint-disable-next-line no-unused-vars
  async getInitMediaTopic({commit}) {
    try {
      let res = await axios.get(`${MEDIA_TOPIC}/list`);
      commit('handlerMediaTopic', res?.data || [])
    } catch (error) {
      // console.log(error)
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitMediaSeries({commit}) {
    try {
      let res = await axios.get(`${MEDIA_SERIES}/list`);
      commit('handlerMediaSeries', res?.data || [])
    } catch (error) {
      // console.log(error)
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitMediaTags({commit}) {
    try {
      let res = await axios.get(`${MEDIA_TAGS}/list`);
      commit('handlerMediaTags', res?.data || [])
    } catch (error) {
      // console.log(error)
    }
  },
  // eslint-disable-next-line no-unused-vars
  async getInitMediaCategory({commit}) {
    try {
      let res = await axios.get(`${MEDIA_CATEGORY}/list`);
      commit('handlerMediaCategory', res?.data || [])
    } catch (error) {
      // console.log(error)
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
  async getInitList({commit, state}, {page = 0, itemsPage = 15, type = 'video', filter = null}) {
    try {
      let searchUrl = PAGE_ONE_SEARCH(page, itemsPage);
      if(filter) Object.keys(filter).forEach(fil => {
        if (fil === 'tagIds') {
          filter.tagIds?.filter(x => x)?.map(vl => searchUrl += `&${fil}=${vl}`)
        } else {
          if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
        }
      })

      const res = await axios.get(`${MEDIA_TYPE(type)}?${searchUrl}`);
      commit('setTotalItems', res?.totalItems)
      commit('setTotalPages', Math.ceil(res?.totalItems / itemsPage) || 0)
      commit('getAllSuccess', res.data.filter(user => user && !user?.isDelete) || [], type)
      commit('handlerItemsInPage', state.listItems || [])
    } catch (error) {
      commit('getAllFailure', error)
    }
  },

  async getListItem({commit, state}, {preMaxPage = 0, nextPage = 0, itemsPage = 15, type = 'video', filter}) {
    try {
      if (preMaxPage >= nextPage) {
        commit('handlerItemsInPage', chunk(state.listItems, itemsPage)[nextPage] || [])
        return null
      }
      const newData = await Promise.all([...Array(nextPage - preMaxPage).keys()].map(async idx => {
        let searchUrl = PAGE_ONE_SEARCH(preMaxPage + idx + 1, itemsPage);
        if(filter) Object.keys(filter).forEach(fil => {
          if (fil === 'tagIds') {
            filter.tagIds?.filter(x => x)?.map(vl => searchUrl += `&${fil}=${vl}`)
          } else {
            if (filter[`${fil}`]) searchUrl += `&${fil}=${filter[`${fil}`]}`
          }
        })
        const res = await axios.get(`${MEDIA_TYPE(type)}?${searchUrl}`);
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
  async updateItem({commit, dispatch}, dataMedia) {
    try {
      const {data, typeMedia, mediaImageFile, mediaMobileImageFile} = dataMedia;

      if (mediaImageFile && typeMedia !== 'image') {
        const thumbnail = await handleThumbnail(mediaImageFile, typeMedia);
        if (!thumbnail) {
          dispatch('alert/error', 'Error: Update Fail!', {root: true})
          return
        }
        data.thumbnail = thumbnail
      }

      if (mediaMobileImageFile && typeMedia !== 'image') {
        const thumbnail = await handleThumbnail(mediaMobileImageFile, typeMedia);
        if (!thumbnail) {
          dispatch('alert/error', 'Error: Update Fail!', {root: true})
          return
        }
        data.thumbnailMobile = thumbnail
      }

      if (data.mediaImageFile)
        delete data.mediaImageFile

      if (data && (typeMedia === 'video' || typeMedia === 'audio')) {
        if (typeMedia === 'audio') {
          delete data.urlFile;
          delete data.type;
        }
        await axios.put(`${MEDIA}/${data._id}`, data);
      } else {
        const formData = new FormData()
        formData.append('type', typeMedia)
        for (let property in data) {
          if (property === 'tagIds'
            || property === 'urlFile'
            || property === 'thumbnail'
            || property === 'thumbnailMobile'
            || property === 'tags'
            || property === 'type'
            || property === 'series'
            || property === 'category'
            || property === 'topic'
          ) continue;
          formData.append(property, data[property] ? data[property] : '');
        }
        if (data.urlFile)
          formData.append('urlFile', data.urlFile);
        if (data.tagIds)
          data.tagIds?.forEach(tag => formData.append('tagIds[]', tag));
        await axios.put(`${MEDIA}/${data._id}`, formData);
      }

      const itemUpdate = await axios.get(`${MEDIA}/${data._id}`);
      if (!itemUpdate.data) return dispatch('alert/error', 'Update fail!', {root: true})
      commit('updateItems', itemUpdate.data);
      dispatch('alert/success', 'Update successful!', {root: true})
    } catch (e) {
      dispatch('alert/error', 'Error: Update Fail!', {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async addNew({commit, dispatch}, dataMedia) {
    try {
      const {data, typeMedia, mediaImageFile, mediaMobileImageFile} = dataMedia;

      if (mediaImageFile && typeMedia !== 'image') {
        const thumbnail = await handleThumbnail(mediaImageFile, typeMedia);
        if (!thumbnail) {
          dispatch('alert/error', 'Error: Update Fail!', {root: true})
          return
        }
        data.thumbnail = thumbnail
      }

      if (mediaMobileImageFile && typeMedia !== 'image') {
        const thumbnail = await handleThumbnail(mediaMobileImageFile, typeMedia);
        if (!thumbnail) {
          dispatch('alert/error', 'Error: Update Fail!', {root: true})
          return
        }
        data.thumbnailMobile = thumbnail
      }

      if (data.mediaImageFile)
        delete data.mediaImageFile

      let res
      if (typeMedia === "video") {
        res = await axios.post(MEDIA, data);
      } else {
        const formData = new FormData()
        for (let property in data) {
          if (property === 'tagIds'
            || property === 'urlFile'
            || property === 'thumbnail'
            || property === 'thumbnailMobile') continue;
          formData.append(property, data[property] ? data[property] : '');
        }
        if (data.urlFile)
          formData.append('urlFile', data.urlFile);
        if (data.tagIds)
          data.tagIds?.forEach(tag => formData.append('tagIds[]', tag));
        res = await axios.post(MEDIA, formData);
      }

      const result = await axios.get(`${MEDIA}/${res.data._id}`);
      commit('addItems', result.data)
      dispatch('alert/success', 'Create successful!', {root: true})
    } catch (e) {
      dispatch('alert/error', `Error: Create Fail! ${e?.data?.message?.toString()}`, {root: true})
    }
  },
  // eslint-disable-next-line no-unused-vars
  async deleteById({commit, state, dispatch}, id) {
    try {
      await axios.delete(`${MEDIA}/${id}`)
      commit('getAllSuccess', state.listItems.filter(i => i?._id !== id))
      commit('handlerItemsInPage', state.itemsInPage.filter(i => i?._id !== id))
      dispatch('alert/success', 'Delete media successful!', {root: true})
    } catch (e) {
      dispatch('alert/error', 'Error: Delete media Fail!', {root: true})
    }
  },

  findImage({commit, state}, strFind) {
    if (!strFind) {
      return commit('handlerFindImage', [...state?.allImageMedia]?.splice(0, 7))
    } else {
      const items = state.allImageMedia?.filter(e => e?.name && e?.name?.toLowerCase()?.indexOf(strFind?.toLowerCase()) >= 0)
      commit('handlerFindImage', items?.splice(0, 7))
    }
  },

  async getMediaByThumbnail(props, thumbnail) {
    try {
      let res = await axios.get(`${MEDIA}/list/image?thumbnail=${thumbnail}`);
      if (res.data.length > 0) return res.data[0];
      return null;
    } catch (e) {
      return null;
    }
  },

  async updateStatus({commit, dispatch}, item) {
    try {
      if (!item._id) return null;
      let newStatus = item.status === 'published' ? 'draft' : 'published'
      const result = await axios.put(`${MEDIA}/${item._id}`, {status: newStatus})
      if(!result.data) dispatch('alert/error', 'Error: Update status media Fail!', {root: true})
      commit('handleStatus', result.data)
      dispatch('alert/success', 'Update status media successful!', {root: true})
    } catch (e) {
      dispatch('alert/error', 'Error: Update status media Fail!', {root: true})
    }
  }

};

const mutations = {
  handlerItemsInPage(state, totalItems = []) {
    state.itemsInPage = totalItems
  },
  handlerMediaCategory(state, totalItems = []) {
    state.mediaCategory = totalItems
  },
  updateItems(state, item) {
    const idx = state.listItems.findIndex(x => x._id === item._id);
    Vue.set(state.listItems, idx, item);
    const idxIP = state.itemsInPage.findIndex(x => x._id === item._id);
    Vue.set(state.itemsInPage, idxIP, item);
  },
  addItems(state, item) {
    state.listItems.unshift(item)
  },
  handlerMediaTopic(state, totalItems = []) {
    state.mediaTopics = totalItems
  },
  handlerFindImage(state, items = []) {
    state.imagesMedia = items
  },
  handlerImagesMedia(state, items = []) {
    state.allImageMedia = items
    state.imagesMedia = [...items].splice(0, 7)
  },
  handlerMediaTags(state, totalItems = []) {
    state.mediaTags = totalItems
  },
  handlerMediaSeries(state, totalItems = []) {
    state.mediaSeries = totalItems
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
  handleStatus(state, item) {
    const idx = state.listItems.findIndex(u => u._id === item._id);
    Vue.set(state.listItems[idx], 'status', item.status);
  }
};

export const medias = {
  namespaced: true,
  state,
  actions,
  mutations
};
