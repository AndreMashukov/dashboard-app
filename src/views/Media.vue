<script>
import {mapActions, mapState} from "vuex";
import moment from "moment";
import Loading from "../components/Loader";
import axios from "axios";
import {MEDIA} from "@/common/apiUrls";

/**
 * Customers component
 */
export default {
  page: {
    title: "Media",
  },
  validations: {
    customer: {},
  },
  // eslint-disable-next-line vue/no-unused-components
  components: {Loading},
  computed: {
    ...mapState('medias',
      ['totalItems', 'totalPages', 'itemsInPage',
        'mediaTopics', 'mediaSeries', 'mediaTags',
        'mediaCategory'
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
    } catch (e) {
      console.log(e)
    } finally {
      this.loading = false
    }
  },
  data() {
    return {
      typeMedia: 'video',
      typeModel: 'edit',
      numberPageMax: 0,
      currentPage: 0,
      nextPage: 0,
      itemsPage: 15,
      loading: false,
      idItem: '',
      itemAudioPlay: '',
      audioLink: '',
      currentStatus: true,
      isFilter: false,
      filter: {
        name: '',
        categoryId: '',
        topicId: '',
        isSeries: null,
        tagIds: []
      },
      countFilterTags: 1,
      usernameItem: '',
      title: "Medias",
      items: [
        {
          text: "Medias",
          active: true,
        },
      ],
      showModalDel: false,
      submitted: false,
      customer: {},
      showModal: false,
      countTags: 1,
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
    }),
    clearState() {
      this.countTags = 1
    },
    formatDate(value) {
      if (value) {
        return moment(String(value)).format('YYYY-MM-DD hh:mm')
      }
    },
    getVimeoId(link) {
      if (!link) return ''
      return link.split('https://vimeo.com/')[1]
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
        type: this.typeMedia
      }).finally(() => {
        this.loading = false
        // this.filter = {}
      });
    },
    async changePage() {
      this.loading = true
      await this.getListItem({
          preMaxPage: this.numberPageMax,
          nextPage: this.nextPage,
          itemsPage: this.itemsPage,
          type: this.typeMedia
        }
      );
      this.loading = false
      if (this.numberPageMax < this.nextPage) {
        this.numberPageMax = this.nextPage
      }
      this.currentPage = this.nextPage
    },
    async changeStatus() {
      try {
        if (!this.idItem) return null;
        let newStatus = this.customer.status === 'published' ? 'draft' : 'published'
        const result = await axios.put(`${MEDIA}/${this.idItem}`, {status: newStatus})
        if (result && result?.data?._id) {
          const idx = this?.itemsInPage.findIndex(u => u._id === this.idItem);
          if (idx === -1) return null;
          this.itemsInPage[idx].status = result?.data?.status
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.idItem = ''
        this.customer = {}
      }
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
    handlerConvertDataSendAPI() {
      delete this.customer.category
      if (this.customer.tagIds?.length) {
        this.customer.tagIds = [...this.customer.tagIds].filter(x => x) || []
      }
      if (typeof this.customer.urlFile === "string" && this.typeMedia === 'image') {
        console.log(typeof this.customer.urlFile)
        delete this.customer.urlFile
        delete this.customer.thumbnail
      }
      const data = {}
      Object.keys(this.customer).forEach(name => {
        if (this.customer[`${name}`] !== null) {
          data[`${name}`] = this.customer[`${name}`];
        }
      })
      this.customer = {...data};
      console.log("handlerConvertDataSendAPI to :", this.customer)

    },
    handleUpdateData() {
      this.clearState()
      console.log("Handle Update Data ...: ", this.customer)
      if (this.typeMedia !== 'video') delete this.typeMedia.urlFile;
      if (this.customer?.tags?.length > 0) {
        const tags = this.customer.tags.map(tag => tag?._id)
        this.customer.tagIds = [...tags]
        this.countTags = tags.length || 1
        delete this.customer.tags
      }
      if (this?.customer?.topic) {
        this.customer.topicId = this.customer?.topic?._id
        delete this.customer.topic
      }
      if (this?.customer?.series) {
        this.customer.seriesId = this.customer?.series?._id
        delete this.customer.series
      }
    },
    async handleSubmitUpdate() {
      try {
        this.handlerConvertDataSendAPI()
        console.log("this.customer: ", this.typeMedia, this.customer)
        if (this.typeMedia === 'video')
          await this.updateItem({dataUrlLink: this.customer})
        else {
          await this.updateItem({formData: this.customer})
        }
        this.submitted = false
      } catch (e) {
        console.log(e)
      } finally {
        this.showModal = false
        this.clearState()
        this.customer = {}
      }
    },
    async handleSubmitCreate() {
      try {
        console.log("Handle Submit Create ...")
        // stop here if form is invalid
        this.$v.$touch();
        if (this.$v.$invalid) {
          console.log("INVALID.....")
          return null;
        } else {
          this.handlerConvertDataSendAPI()
          this.showModal = false
          if (this.typeMedia === 'video')
            await this.addNew({dataUrlLink: this.customer})
          else {
            await this.addNew({formData: this.customer})
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.showModal = false
      }
    },
    playSound(sound) {
      if (sound && !this.itemAudioPlay) {
        this.itemAudioPlay = new Audio(sound);
        this.itemAudioPlay.play();
        this.audioLink = sound
      } else if (sound && this.itemAudioPlay) {
        this.itemAudioPlay.pause();
        if (this.audioLink === sound) return this.audioLink = ''
        this.itemAudioPlay = new Audio(sound);
        this.itemAudioPlay.play();
        this.audioLink = sound
      }
    },
    selectedValue(event, type) {
      this.customer[`${type}`] = event.target.value
      // console.log(this.customer[`${type}`], type)
    },
    selectedIds(event, idx, type) {
      if (!this.customer[`${type}`]) this.customer[`${type}`] = []
      if (this.customer[`${type}`][idx - 1]) this.customer[`${type}`][idx - 1] = event.target.value
      else this.customer[`${type}`].push(event.target.value)
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.customer.urlFile = files[0];
    },
    handlerFilter() {
      console.log("filter....", this.filter)
      this.loading = true
      this.currentPage = 0;
      this.numberPageMax = 0;

      this.getInitList({
        page: this.currentPage,
        itemsPage: this.itemsPage,
        filter: this.filter,
        type: this.typeMedia
      }).finally(() => {
        this.loading = false
        // this.filter = {}
      });
    }
  },
};
</script>

<template>
  <Layout>
    <Loading :loading="loading">
      <PageHeader :title="title" :items="items"/>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-4">
                  <div class="search-box me-2 mb-2 d-inline-block">
                    <div class="position-relative">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Search..."
                      />
                      <i class="bx bx-search-alt search-icon"></i>
                    </div>
                  </div>
                </div>
                <b-modal v-model="showModalDel"
                         title="Delete Customer"
                         hide-footer
                         title-class="text-black font-18"
                         body-class="p-3">
                  <label> You sure delete : <b>{{ usernameItem }}</b></label>
                  <form @submit.prevent="handleSubmitDel">
                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="showModalDel = false">Close</b-button>
                      <b-button type="submit" class="ms-1" variant="danger">
                        Delete
                      </b-button>
                    </div>
                  </form>
                </b-modal>


                <div class="col-sm-12" style="position: absolute; right: 150px; max-width: 150px;">
                  <button
                    type="button"
                    class="btn btn-success btn-rounded mb-2 me-2"
                    style="min-width: 120px"
                    @click="isFilter = true"
                  >
                    <i class="mdi mdi-plus me-1"></i> Filter
                  </button>
                  <b-modal
                    :no-close-on-backdrop=true
                    v-model="isFilter"
                    :title="'Choose options filter ' + typeMedia "
                    title-class="text-black font-18"
                    body-class="p-3"
                    hide-footer
                  >
                    <form @submit.prevent="handlerFilter();">
                      <div class="col-12">
                        <div>
                          <label>Name</label>
                          <input
                            id="filtername"
                            v-model="filter.name"
                            type="text"
                            class="form-control"
                            placeholder="search name"
                          />
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="col-11">Tags</label>
                        <b-button class="col-1" @click="countFilterTags++;">

                          <i class="mdi mdi-plus me-1"></i>
                        </b-button>
                        <div v-for="num in countFilterTags" :key="num">
                          <select class="form-control" @change="filter.tagIds[num-1]=$event.target.value" :value="filter.tagIds[num-1]">
                            <option :value="null">-- None --</option>
                            <option v-for="item in mediaTags" :key="item._id" :value="item._id">{{
                                item.name
                              }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <div>
                          <label>Topic</label>mediaCategory
                          <select class="form-control" @change="filter.topicId=$event.target.value"
                                  :value="filter.topicId">
                            <!-- inline object literal -->
                            <option :value="null">-- None --</option>
                            <option v-for="top in mediaTopics" :key="top._id" :value="top._id">{{
                                top.name
                              }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <div>
                          <label>Category</label>
                          <select class="form-control" @change="filter.categoryId=$event.target.value"
                                  :value="filter.categoryId">
                            <!-- inline object literal -->
                            <option :value="null">-- None --</option>
                            <option v-for="cat in mediaCategory" :key="cat._id" :value="cat._id">{{
                                cat.name
                              }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <div>
                          <label>Is Series</label>
                          <select class="form-control" @change="filter.isSeries=$event.target.value"
                                  :value="filter.isSeries ||null">
                            <!-- inline object literal -->
                            <option v-bind:value="null">--- None ---</option>
                            <option v-bind:value="false">False</option>
                            <option v-bind:value="true">True</option>
                          </select>
                        </div>
                      </div>

                      <!--                      Filter-->
                      <div class="text-end pt-5 mt-3">
                        <b-button variant="light" @click="isFilter=false;">Close</b-button>
                        <b-button type="submit" variant="success" class="ms-1"
                        >Filter Data
                        </b-button>
                      </div>
                    </form>

                  </b-modal>
                </div>

                <div class="col-sm-2" style="position: absolute; right: 20px; max-width: 150px;">
                  <button
                    type="button"
                    class="btn btn-success btn-rounded mb-2 me-2"
                    style="min-width: 120px"
                    @click="clearState();customer={};showModal=true;typeModel='create'"
                  >
                    <i class="mdi mdi-plus me-1"></i> Add new
                  </button>
                </div>

                <b-modal
                  :no-close-on-backdrop=true
                  v-model="showModal"
                  :title="typeModel === 'create' ? 'Add New' : 'Edit name: '+ customer.name"
                  title-class="text-black font-18"
                  body-class="p-3"
                  hide-footer>
                  <form @submit.prevent="typeModel === 'create' ?handleSubmitCreate() : handleSubmitUpdate()">
                    <div class="col-12">
                      <div>
                        <label>Name (*required)</label>
                        <input
                          id="name"
                          required="true"
                          v-model="customer.name"
                          type="text"
                          class="form-control"
                          placeholder="Insert name"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.name.$error,
                              }"
                        />
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Status (*required)</label>
                        <select required="true" class="form-control" @change="selectedValue($event,'status')"
                                :value=customer.status>
                          <!-- inline object literal -->
                          <option :value="null">-- Please select topic --</option>
                          <option v-bind:value="'draft'">draft</option>
                          <option v-bind:value="'published'">published</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Topic (*required)</label>
                        <select class="form-control" required="true" @change="selectedValue($event,'topicId')"
                                :value=customer.topicId>
                          <!-- inline object literal -->
                          <option :value="null">-- Please select topic --</option>
                          <option v-for="top in mediaTopics" :key="top._id" :value="top._id">
                            {{ `${top.name} (*${top.type})` }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-12" v-if="typeMedia === 'video'">
                      <div>
                        <label>Video url (*required)</label>
                        <input
                          id="urlVideo"
                          required="true"
                          v-model="customer.urlFile"
                          type="text"
                          class="form-control"
                          placeholder="Insert urlFile"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.urlFile.$error,
                              }"
                        />
                        <v-avatar size="56" color="primary" v-if="customer.thumbnail">
                          <img
                            v-bind:src="customer.thumbnail"/>
                        </v-avatar>
                      </div>
                    </div>
                    <div class="col-12" v-if="typeMedia === 'audio'">
                      <div>
                        <label>Audio</label>
                        <input
                          id="fileMedia"
                          type="file"
                          @change="onFileChange"
                          class="form-control"
                          placeholder="Choose file"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.urlFile.$error,
                              }"
                        />
                        <span style="cursor: pointer" v-if="customer.audio">
                        <i class="fas fa-play"/>
                      </span>
                      </div>
                    </div>
                    <div class="col-12" v-if="typeMedia === 'image'">
                      <div>
                        <label>Image</label>
                        <input
                          id="fileMediaImage"
                          type="file"
                          @change="onFileChange"
                          class="form-control"
                          placeholder="Choose file"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.urlFile.$error,
                              }"
                        />
                        <v-avatar size="56" color="primary" v-if="customer.thumbnail">
                          <img
                            v-bind:src="customer.thumbnail"/>
                        </v-avatar>
                      </div>
                    </div>


                    <!--                    tagIds, seriesId, episode, subtyoe-->
                    <div class="col-12">
                      <div>
                        <label class="col-11">Tags</label>
                        <b-button class="col-1" @click="countTags++;">
                          <i class="mdi mdi-plus me-1"></i>
                        </b-button>
                        <div v-for="num in countTags" :key="num">
                          <select class="form-control" @change="selectedIds($event,num,'tagIds')"
                                  :value="customer.tagIds ? customer.tagIds[num-1] : null">
                            <!-- inline object literal -->
                            <option :value="null">-- Please select tags --</option>
                            <option v-for="item in mediaTags" :key="item._id" :value="item._id">{{ item.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Series </label>
                        <select class="form-control" @change="selectedValue($event,'seriesId')"
                                :value="customer.seriesId">
                          <!-- inline object literal -->
                          <option :value="null">-- Please select series --</option>
                          <option v-for="meal in mediaSeries" :key="meal._id" :value="meal._id">{{ meal.name }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Episode</label>
                        <input
                          id="episode"
                          v-model="customer.episode"
                          type="number"
                          min="1"
                          class="form-control"
                          placeholder="Insert episode"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.episode.$error,
                              }"
                        />
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Subtype </label>
                        <select class="form-control" @change="selectedValue($event,'subtype')"
                                :value="customer.subtype">
                          <!-- inline object literal -->
                          <option>-- Please select Subtype --</option>
                          <option value="trailer">Trailer</option>
                          <option value="full">Full</option>
                          <option value="bonus">Bonus</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Description</label>
                        <input
                          id="description"
                          v-model="customer.description"
                          class="form-control"
                          placeholder="Insert description"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.description.$error,
                              }"
                        />
                      </div>
                    </div>
                    <div class="col-12">
                      <div>
                        <label>Detail Info </label>
                        <input
                          id="detailInfo"
                          v-model="customer.detailInfo	"
                          class="form-control"
                          placeholder="Insert detail Info	"
                          :class="{
                                'is-invalid':
                                  submitted && $v.customer.detailInfo.$error,
                              }"
                        />
                      </div>
                    </div>
                    <div class="text-end pt-5 mt-3">
                      <b-button variant="light" @click="showModal = false">Close</b-button>
                      <b-button type="submit" variant="success" class="ms-1"
                      >Submit
                      </b-button>
                    </div>
                  </form>
                </b-modal>

              </div>
              <!--              tabs-->
              <b-tabs content-class="mt-3">
                <b-tab title="Video" active @click="changeTab(0)"></b-tab>
                <b-tab title="Audio" @click="changeTab(1)"></b-tab>
                <b-tab title="Image" @click="changeTab(2)"></b-tab>
              </b-tabs>
              <div class="table-responsive" style="padding-left: 10px">
                <table class="table table-centered table-nowrap align-middle">
                  <thead>
                  <tr v-if="typeMedia !== 'image'">
                    <th>Name</th>
                    <th>{{ typeMedia === 'video' ? "Video / Image" : "Audio" }}</th>
                    <th>{{ typeMedia === 'video' ? "Series" : "Title" }}</th>
                    <th>{{ typeMedia === 'video' ? "Episode" : "Cover" }}</th>
                    <th>{{ typeMedia === 'video' ? "Category" : "Duration" }}</th>
                    <th>{{ typeMedia === 'video' ? "Tags" : "Publish Date" }}</th>
                    <th>{{ typeMedia === 'video' ? "Detail" : "Show" }}</th>
                    <th>{{ typeMedia === 'video' ? "Subtype" : "Type" }}</th>
                    <th>{{ "Status" }}</th>
                    <th>{{ "Edit" }}</th>
                    <th>Delete</th>
                  </tr>
                  <tr v-else>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Category</th>
                    <th>Series</th>
                    <th>Tags</th>
                    <th>Acast</th>
                    <th>Subtype</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Delete</th>
                  </tr>
                  </thead>

                  <tbody v-if="typeMedia === 'video'">
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item.name }}</td>
                    <td>
                      <vimeo-player ref="player"
                                    :video-id="getVimeoId(item.urlFile)"
                                    :player-height="100"/>
                    </td>
                    <td>{{ item.series ? item.series.name : item.series }}</td>
                    <td>{{ item.episode ? item.episode.name : "" }}</td>
                    <td>{{ item.category ? item.category.name : item.category }}</td>
                    <td>{{ item.tags ? item.tags.map(t => t.name).toString() : '' }}</td>
                    <td style="max-width: 200px;overflow: hidden; ">{{
                        item.detailInfo
                      }}
                    </td>
                    <!--                    <td>{{ item.detailInfo  }}</td>-->
                    <td>{{ item.subtype }}</td>

                    <td>
                      <toggle-button :value="item.status === 'published'" color="#82C7EB" :labels="true"
                                     v-on:change="idItem=item._id;customer=item;changeStatus()"/>
                    </td>
                    <td style="cursor: pointer"
                        @click="showModal=true; customer={...item};handleUpdateData();typeModel='edit';">
                      <i class="fas fa-edit text-danger me-1"></i>
                    </td>
                    <td
                      @click="showModalDel=true; idItem=item._id; usernameItem=item.name">
                      <i class="fas fa-trash-alt text-danger me-1"></i>
                    </td>
                  </tr>
                  </tbody>
                  <tbody v-else-if="typeMedia === 'audio'">
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item.name || item.title }}</td>
                    <td>
                      <span style="cursor: pointer" v-if="!audioLink || audioLink !== item.audio">
                        <i class="fas fa-play" @click.prevent="playSound(item.audio)"/>
                      </span>
                      <span style="cursor: pointer" v-if="audioLink && audioLink === item.audio">
                        <i class="fas fa-pause" @click.prevent="playSound(item.audio)"/>
                      </span>
                    </td>
                    <td>{{ item.title }}</td>
                    <td>
                      <v-avatar size="56" color="primary">
                        <img
                          v-if="item.cover"
                          v-bind:src="item.cover"/>
                      </v-avatar>
                    </td>
                    <td>{{ item.duration }}</td>
                    <td>{{ item.publishDate }}</td>
                    <td>{{ item.show }}</td>
                    <td>{{ item.status }}</td>
                    <td>{{ item.type }}</td>
                    <td style="cursor: pointer"
                        @click="showModal=true; customer={...item};handleUpdateData();typeModel='edit';">
                      <i class="fas fa-edit text-danger me-1"></i>
                    </td>
                    <td style="cursor: pointer" @click="showModalDel=true; idItem=item._id; usernameItem=item.name">
                      <i class="fas fa-trash-alt text-danger me-1"></i>
                    </td>
                  </tr>
                  </tbody>
                  <tbody v-else-if="typeMedia === 'image'">
                  <tr v-for="item in itemsInPage" :key="item._id">
                    <td>{{ item.name }}</td>
                    <td>
                      <v-avatar size="56" color="primary">
                        <img
                          v-if="item.thumbnail"
                          v-bind:src="item.thumbnail"/>
                        <span v-if="!item.thumbnail" class="white--text text-h5">
                        {{ item.name.split("")[0].toUpperCase() }}
                      </span>
                      </v-avatar>
                    </td>
                    <td>{{ item.category ? item.category.name : '' }}</td>
                    <td>{{ item.episode }}</td>
                    <td>{{ item.tags ? item.tags.map(t => t.name).toString() : '' }}</td>
                    <td>{{ item.acast }}</td>
                    <td>{{ item.subtype }}</td>
                    <td style="max-width: 200px;overflow: hidden; ">{{
                        item.description
                      }}
                    </td>
                    <td>
                      <toggle-button :value="item.status === 'published'" color="#82C7EB" :labels="true"
                                     v-on:change="idItem=item._id;customer=item;changeStatus()"/>
                    </td>
                    <td style="cursor: pointer"
                        @click="showModal=true; customer={...item};handleUpdateData();typeModel='edit';">
                      <i class="fas fa-edit text-danger me-1"></i>
                    </td>
                    <td style="cursor: pointer"
                        @click="showModalDel=true; idItem=item._id; usernameItem=item.name">
                      <i class="fas fa-trash-alt text-danger me-1"></i>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <ul class="pagination pagination-rounded justify-content-end mb-2">
                <li class="page-item disabled">
                  <a
                    class="page-link"
                    href="javascript: void(0);"
                    aria-label="Previous"
                  >
                    <i class="mdi mdi-chevron-left"></i>
                  </a>
                </li>
                <div v-for="item in totalPages" :key="item">
                  <li v-if="item === currentPage + 1" class="page-item active">
                    <a class="page-link">{{ item }}</a>
                  </li>
                  <li v-if="item !== currentPage + 1" class="page-item" @click="nextPage=item-1;changePage();">
                    <a class="page-link">{{ item }}</a>
                  </li>
                </div>
                <li class="page-item">
                  <a
                    class="page-link"
                    href="javascript: void(0);"
                    aria-label="Next"
                  >
                    <i class="mdi mdi-chevron-right"></i>
                  </a>
                </li>

              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- end row -->
    </Loading>
  </Layout>
</template>
