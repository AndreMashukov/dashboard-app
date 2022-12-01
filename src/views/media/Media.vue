<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import ListAudio from "./tabs/ListAudio";
import ListImage from "./tabs/ListImage";
import ListVideo from "./tabs/ListVideo";
import DialogDelete from "@/components/DialogDelete";
import FormMedia from "@/components/form/FormMedia";
import {cloneDeep} from "lodash";

/**
 * Customers component
 */
export default {
  page: {
    title: "Media",
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {
    DialogDelete,
    ListVideo,
    ListImage,
    ListAudio,
    Loading,
    PageHeader,
    FormMedia,
  },
  computed: {
    ...mapState('medias',
      ['totalItems', 'totalPages', 'itemsInPage',
        'mediaTopics', 'mediaSeries', 'mediaTags',
        'mediaCategory', 'imagesMedia'
      ]),
  },
  async created() {
    try {
      this.loading = true
      await Promise.all([
        this.getInitList({page: this.currentPage, itemsPage: this.itemsPage}),
        this.getInitMediaTopic(),
        this.getInitMediaSeries(),
        this.getInitMediaTags(),
        this.getInitMediaCategory(),
      ])
      if (this.typeMedia !== 'image')
        this.getInitImageMedia()
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  },
  data() {
    return {
      title: "Medias",
      items: [],
      search: '',
      typeMedia: 'video',
      typeModel: 'edit',
      numberPageMax: 0,
      currentPage: 0,
      nextPage: 0,
      itemsPage: 15,
      loading: false,
      idItem: '',
      currentStatus: true,
      isFilter: false,
      filter: {
        name: '',
        categoryId: '',
        topicId: '',
        isSeries: null,
        tagIds: [],
      },
      countFilterTags: 1,
      usernameItem: '',
      showModalDel: false,
      customer: {},
      showModal: false,
      countTags: 1,
      isDisable: false,
      timerDebounce: null,
    };
  },
  methods: {
    ...mapActions('medias', {
      getInitList: 'getInitList',
      getListItem: 'getListItem',
      updateItem: 'updateItem',
      deleteById: 'deleteById',
      addNew: 'addNew',
      getInitMediaTopic: 'getInitMediaTopic',
      getInitMediaSeries: 'getInitMediaSeries',
      getInitMediaTags: 'getInitMediaTags',
      getInitMediaCategory: 'getInitMediaCategory',
      getInitImageMedia: 'getInitImageMedia',
      findImage: 'findImage',
      getMediaByThumbnail: 'getMediaByThumbnail',
      updateStatus: 'updateStatus',
    }),
    clearState() {
      this.countTags = 1
      this.isDisable = false
    },
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD hh:mm')
      }
    },
    onChangeTextSearch() {
      if(this.filter.name === '') delete this.filter.name;
      clearTimeout(this.timerDebounce);
      this.timerDebounce = setTimeout(this.handlerFilter, 1000);
    },
    changeTab(numberTab = 0) {
      if (numberTab === 0 && this.typeMedia === 'video') return null
      if (numberTab === 1 && this.typeMedia === 'audio') return null
      if (numberTab === 2 && this.typeMedia === 'image') return null
      this.loading = true;
      this.currentPage = 0;
      this.numberPageMax = 0;
      this.typeMedia = !numberTab ? "video" : numberTab === 1 ? "audio" : "image";
      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        type: this.typeMedia,
      }).finally(() => {
        this.loading = false
        this.filter = {
          name: '',
          categoryId: '',
          topicId: '',
          isSeries: null,
          tagIds: []
        }
      });
    },
    changePage(page) {
      page--;
      this.currentPage = page;
      this.loading = true
      this.getListItem({
        preMaxPage: this.numberPageMax,
        nextPage: page,
        itemsPage: this.itemsPage,
        type: this.typeMedia,
        filter: this.filter,
      }).finally(() => {
        this.loading = false
        if (this.numberPageMax < page)
          this.numberPageMax = page
      });
    },
    changeStatus(event) {
      this.updateStatus(event);
    },
    async handleSubmitDel() {
      try {
        if (!this.idItem) return null;
        this.deleteById(this.idItem)
        this.showModalDel = false
        this.idItem = ''
        this.usernameItem = ''
      } catch (e) {
        console.log(e)
      }
    },
    async handleUpdateData(item, type) {
      this.clearState();
      this.typeModel = type
      this.customer = cloneDeep(item);
      this.customer.isEdit = true;
      this.isDisable = type === 'edit' && this.typeMedia === 'audio';

      if (this.typeMedia !== 'video') delete this.customer.urlFile;
      if (item.thumbnail)
        this.customer.imageSelect = await this.getMediaByThumbnail(item.thumbnail);
      if (item.thumbnailMobile)
        this.customer.imageMobileSelect = await this.getMediaByThumbnail(item.thumbnailMobile);
      this.showModal = true;
    },
    handleSubmitUpdate(data) {
      this.loading = true
      this.customer = {}
      this.updateItem({
        data,
        typeMedia: data.typeMedia,
        mediaImageFile: data.mediaImageFile,
        mediaMobileImageFile: data.mediaMobileImageFile
      }).finally(() => {
        this.showModal = false
        this.loading = false
        this.clearState()
      })
    },
    handleSubmitCreate(data) {
      this.loading = true
      this.customer = {}
      this.addNew({
        data,
        typeMedia: data.typeMedia,
        mediaImageFile: data.mediaImageFile,
        mediaMobileImageFile: data.mediaMobileImageFile,
      }).finally(() => {
        this.loading = false
        this.clearState()
        this.showModal = false
      })
    },
    handlerFilter() {
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;

      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        filter: this.filter,
        type: this.typeMedia,
      }).finally(() => {
        this.loading = false
      });
    },
  },
};
</script>

<template>
  <Loading :loading="loading">
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-24 pa-0">
        <div class="card">
          <div class="card-body">
            <b-navbar variant="faded" type="light">
              <div class="col-sm-8">
                <div class="search-box me-2 mb-2 d-inline-block">
                  <div class="position-relative">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search name..."
                      v-model="filter.name"
                      v-on:input="onChangeTextSearch();"
                    />
                    <i class="bx bx-search-alt search-icon"></i>
                  </div>
                </div>
              </div>
              <dialog-delete
                :is-open="showModalDel"
                :label="usernameItem"
                title="Delete media"
                @onClose="showModalDel = false"
                @onSubmit="handleSubmitDel"
              />
              <v-spacer></v-spacer>
              <div class="col-sm-8 d-flex flex-row-reverse">
                <button
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="isFilter = true"
                >
                  <i class="fas fa-filter"></i> Filter
                </button>
                <b-modal
                  v-model="isFilter"
                  :title="'Choose options filter ' + typeMedia "
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer
                >
                  <form @submit.prevent="handlerFilter();">
                    <div class="col-24 mb-2">
                      <label>Name</label>
                      <input
                        id="filtername"
                        v-model="filter.name"
                        type="text"
                        class="form-control"
                        placeholder="search name"
                      />
                    </div>
                    <div class="col-24 mb-2">
                      <label class="col-22">Tags</label>
                      <b-button class="col-2" @click="countFilterTags++;">

                        <i class="mdi mdi-plus me-1"></i>
                      </b-button>
                      <div v-for="num in countFilterTags" :key="num">
                        <select
                          class="form-control"
                          @change="filter.tagIds[num-1]=$event.target.value"
                          :value="filter.tagIds[num-1]"
                        >
                          <option :value="null">-- None --</option>
                          <option v-for="item in mediaTags" :key="item._id" :value="item._id">{{
                              item.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-2">
                      <div>
                        <label>Topic</label>
                        <select
                          class="form-control"
                          @change="filter.topicId=$event.target.value"
                          :value="filter.topicId"
                        >
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option v-for="top in mediaTopics" :key="top._id" :value="top._id">{{
                              top.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-2">
                      <div>
                        <label>Category</label>
                        <select
                          class="form-control"
                          @change="filter.categoryId=$event.target.value"
                          :value="filter.categoryId"
                        >
                          <!-- inline object literal -->
                          <option :value="null">-- None --</option>
                          <option v-for="cat in mediaCategory" :key="cat._id" :value="cat._id">{{
                              cat.name
                            }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-24 mb-2">
                      <div>
                        <label>Is Series</label>
                        <select
                          class="form-control"
                          @change="filter.isSeries=$event.target.value"
                          :value="filter.isSeries ||null"
                        >
                          <!-- inline object literal -->
                          <option v-bind:value="null">--- None ---</option>
                          <option v-bind:value="false">False</option>
                          <option v-bind:value="true">True</option>
                        </select>
                      </div>
                    </div>

                    <!--                      Filter-->
                    <div class="text-end pt-3">
                      <b-button variant="light" @click="isFilter=false;">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Filter Data
                      </b-button>
                    </div>
                  </form>

                </b-modal>
                <button
                  v-if="typeMedia!=='audio'"
                  type="button"
                  class="btn btn-success btn-rounded mb-2 me-2"
                  style="min-width: 120px"
                  @click="clearState();customer={};showModal=true;typeModel='create'"
                >
                  <i class="mdi mdi-plus me-1"></i> Add new
                </button>
              </div>
              <form-media
                :is-open="showModal"
                :type-model="typeModel"
                :type-media="typeMedia"
                :object-data="customer"
                :list-topic="mediaTopics"
                :list-tags="mediaTags"
                :list-series="mediaSeries"
                :images-media="imagesMedia"
                :is-disable="isDisable"
                @onFindImage="findImage"
                @onSubmit="$event.typeModel === 'create' ? handleSubmitCreate($event) : handleSubmitUpdate($event)"
                @closed="showModal=false;customer={}"
              />
              <!--              tabs-->
            </b-navbar>
            <b-tabs content-class="mt-3">
              <b-tab title="Video" active @click="changeTab(0)">
                <list-video
                  :items="itemsInPage"
                  :total-items="totalItems"
                  :items-page="itemsPage"
                  :current-page="currentPage"
                  @handleStatus="changeStatus($event)"
                  @handleEdit="handleUpdateData($event, 'edit');"
                  @handleDelete="showModalDel=true; idItem=$event._id; usernameItem=$event.name"
                  @handlePage="changePage"
                />
              </b-tab>
              <b-tab title="Audio" @click="changeTab(1)">
                <list-audio
                  :items="itemsInPage"
                  :total-items="totalItems"
                  :items-page="itemsPage"
                  :current-page="currentPage"
                  @handleEdit="handleUpdateData($event, 'edit');"
                  @handlePage="changePage"
                />
              </b-tab>
              <b-tab title="Image" @click="changeTab(2)">
                <list-image
                  :items="itemsInPage"
                  :total-items="totalItems"
                  :items-page="itemsPage"
                  :current-page="currentPage"
                  @handleStatus="changeStatus($event)"
                  @handleEdit="handleUpdateData($event, 'edit');"
                  @handleDelete="showModalDel=true; idItem=$event._id; usernameItem=$event.name"
                  @handlePage="changePage"
                />
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
    <!-- end row -->
  </Loading>
</template>
